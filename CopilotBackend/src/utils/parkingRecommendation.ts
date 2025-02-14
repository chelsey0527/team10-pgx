//for this system i want to write a unit test to :

// - show the current user attribute being extracted (including their meeting venue, special needs)
// - showcase the recommendation calculation is precisely based on the following flow:
// each special area has elevator1, evevator_building1 and weight1. Which for example accessible spot at blue	A zeon has 5 spots.
// And it is closet to North elevator which leads to building	3-7(stored as string) and the weight is rank is 1. i want you to calcuate the score  of each area with special needs, availability, closet to their eveny building that directs the most efficient parking area for them
// - show the recommended result 

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface SpecialNeeds {
  needsEV?: boolean;
  needsAccessible?: boolean;
  needsCloserToElevator?: boolean;
}

interface ParkingRecommendation {
  location: string;
  elevator: string;
  spots: number;
  color: string;
  zone: string;
  showMapNotification: boolean;
  stallNumber: string | null;
}

export async function getParkingRecommendation(
  buildingNumber: string,
  specialNeeds: SpecialNeeds
): Promise<ParkingRecommendation> {
  // Ensure boolean values
  const sanitizedNeeds = {
    needsEV: Boolean(specialNeeds.needsEV),
    needsAccessible: Boolean(specialNeeds.needsAccessible),
    needsCloserToElevator: Boolean(specialNeeds.needsCloserToElevator)
  };

//   console.log('-----------------', sanitizedNeeds.needsEV, sanitizedNeeds.needsAccessible);

  const garages = await prisma.garage.findMany({
    where: {
      OR: [
        { elevatorBuilding1: { contains: buildingNumber } },
        { elevatorBuilding2: { contains: buildingNumber } }
      ],
      tag: sanitizedNeeds.needsEV ? 'ev' : 
           sanitizedNeeds.needsAccessible ? 'accessible' : 
           'general',
      spots: {
        gt: 0
      }
    }
  });

//   console.log('Garages found:', garages);

  if (!garages.length) {
    throw new Error('No suitable parking spots found');
  }

  // Score each garage based on:
  // 1. Number of available spots (more spots = better)
  // 2. Weight/proximity to destination building
  // 3. If user needs closer to elevator access, prioritize that
  const scoredGarages = garages.map(garage => {
    let score = 0;
    
    // Only score garages with available spots
    if (garage.spots <= 0) {
      console.log(`Skipping garage ${garage.color} Zone ${garage.zone} - no spots available`);
      return {
        garage,
        score: -1,
        bestWeight: 0
      };
    }
    
    // Score based on spots (normalize to 0-100)
    score += ((garage.spots ?? 0) / Math.max(...garages.map(g => g.spots ?? 0))) * 100;
    
    // Score based on best weight to the building
    const bestWeight = Math.max(
      garage.elevatorBuilding1.includes(buildingNumber) ? garage.weight1 : 0,
      garage.elevatorBuilding2.includes(buildingNumber) ? garage.weight2 : 0
    );
    score += bestWeight * 50; // Weight proximity heavily

    // If user needs closer elevator access, prioritize weight even more
    if (sanitizedNeeds.needsCloserToElevator) {
      score += bestWeight * 25;
    }

    console.log(`Garage: ${garage.color} Zone ${garage.zone}, Score: ${score}, Best Weight: ${bestWeight}, Available Spots: ${garage.spots}`);

    return {
      garage,
      score,
      bestWeight
    };
  }).filter(g => g.score >= 0); // Remove any garages with no spots

  // Sort by score descending
  scoredGarages.sort((a, b) => b.score - a.score);

  // Get the best matching garage
  const bestMatch = scoredGarages[0];
  const bestGarage = bestMatch.garage;

  // Determine which elevator is closer to the building
  const useElevator1 = 
    bestGarage.elevatorBuilding1.includes(buildingNumber) && 
    bestGarage.weight1 >= (bestGarage.weight2 || 0);

  const recommendation = {
    location: `${bestGarage.color!} Zone ${bestGarage.zone!}`,
    elevator: useElevator1 ? bestGarage.elevator1 : bestGarage.elevator2,
    spots: bestGarage.spots!,
    color: bestGarage.color!,
    zone: bestGarage.zone!,
    showMapNotification: true,
    stallNumber: bestGarage.stallNumber || null
  };

  console.log('Recommendation:', recommendation);

  return recommendation;
}
