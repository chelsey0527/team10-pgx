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
}

export async function getParkingRecommendation(
  buildingNumber: string,
  specialNeeds: SpecialNeeds
): Promise<ParkingRecommendation> {
  // First, find garages that serve this building and match special needs
  const garages = await prisma.garage.findMany({
    where: {
      OR: [
        { elevatorBuilding1: { contains: buildingNumber } },
        { elevatorBuilding2: { contains: buildingNumber } }
      ],
      // Filter by tag based on special needs
      tag: specialNeeds.needsEV ? 'ev' : 
           specialNeeds.needsAccessible ? 'accessible' : 
           'general',
      // Only include garages with available spots
      spots: {
        gt: 0
      }
    }
  });

  if (!garages.length) {
    throw new Error('No suitable parking spots found');
  }

  // Score each garage based on:
  // 1. Number of available spots (more spots = better)
  // 2. Weight/proximity to destination building
  // 3. If user needs closer to elevator access, prioritize that
  const scoredGarages = garages.map(garage => {
    let score = 0;
    
    // Score based on spots (normalize to 0-100)
    score += (garage.spots / Math.max(...garages.map(g => g.spots))) * 100;
    
    // Score based on best weight to the building
    const bestWeight = Math.max(
      garage.elevatorBuilding1.includes(buildingNumber) ? garage.weight1 : 0,
      garage.elevatorBuilding2.includes(buildingNumber) ? garage.weight2 : 0
    );
    score += bestWeight * 50; // Weight proximity heavily

    // If user needs closer elevator access, prioritize weight even more
    if (specialNeeds.needsCloserToElevator) {
      score += bestWeight * 25;
    }

    return {
      garage,
      score,
      bestWeight
    };
  });

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
    location: `${bestGarage.color} Zone ${bestGarage.zone}`,
    elevator: useElevator1 ? bestGarage.elevator1 : bestGarage.elevator2,
    spots: bestGarage.spots,
    color: bestGarage.color,
    zone: bestGarage.zone,
    showMapNotification: true
  };

  return recommendation;
}
