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
  // First, find garages that serve this building
  const garages = await prisma.garage.findMany({
    where: {
      OR: [
        { elevatorBuilding1: { contains: buildingNumber } },
        { elevatorBuilding2: { contains: buildingNumber } }
      ],
      // Filter by tag based on special needs
      tag: specialNeeds.needsEV ? 'ev' : 
           specialNeeds.needsAccessible ? 'accessible' : 
           'general'
    },
    orderBy: [
      // Order by weight to get the best match
      { weight1: 'desc' },
      { weight2: 'desc' }
    ]
  });

  if (!garages.length) {
    throw new Error('No suitable parking spots found');
  }

  // Get the best matching garage
  const bestGarage = garages[0];

  // Determine which elevator is closer to the building
  const useElevator1 = bestGarage.elevatorBuilding1.includes(buildingNumber) && 
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