jest.mock('@prisma/client', () => {
	const mockFindMany = jest.fn();
	return {
		PrismaClient: jest.fn().mockImplementation(() => ({
			garage: {
				findMany: mockFindMany
			}
		}))
	};
});

import '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { getParkingRecommendation } from './parkingRecommendation';

describe('Parking Recommendation Tests', () => {
	let prisma: jest.Mocked<PrismaClient>;
	let mockFindMany: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
		mockFindMany = prisma.garage.findMany as jest.Mock;
		mockFindMany.mockReset();
	});

	it('should recommend the best parking spot based on special needs and building proximity', async () => {
		// Mock user attributes
		const buildingNumber = '5';  // User's meeting is in building 5
		const specialNeeds = {
			needsAccessible: true,
			needsCloserToElevator: true
		};

		// Mock garage data
		const mockGarages = [
			{
				id: 1,
				color: 'Blue',
				zone: 'A',
				spots: 5,
				tag: 'accessible',
				elevator1: 'North',
				elevator2: 'South',
				elevatorBuilding1: '3-7',    // Serves buildings 3 through 7
				elevatorBuilding2: '8-12',
				weight1: 1,                  // Highest proximity weight for buildings 3-7
				weight2: 0.4
			},
			{
				id: 2,
				color: 'Orange',
				zone: 'B',
				spots: 3,
				tag: 'accessible',
				elevator1: 'East',
				elevator2: 'West',
				elevatorBuilding1: '5-9',
				elevatorBuilding2: '1-4',
				weight1: 0.8,
				weight2: 0.6
			}
		];

		// Mock the findMany response
		mockFindMany.mockResolvedValue(mockGarages);

		// Get recommendation
		const recommendation = await getParkingRecommendation(buildingNumber, specialNeeds);

		// Verify garage query included correct filters
		expect(prisma.garage.findMany).toHaveBeenCalledWith({
			where: {
				OR: [
					{ elevatorBuilding1: { contains: buildingNumber } },
					{ elevatorBuilding2: { contains: buildingNumber } }
				],
				tag: 'accessible',
				spots: {
					gt: 0
				}
			}
		});

		// Let's break down the expected scoring for Blue Zone A:
		// 1. Spots score: (5 spots / max 5 spots) * 100 = 100
		// 2. Weight score: 1 * 50 = 50
		// 3. Extra elevator proximity score: 1 * 25 = 25
		// Total: 175

		// Orange Zone B scoring:
		// 1. Spots score: (3/5) * 100 = 60
		// 2. Weight score: 0.8 * 50 = 40
		// 3. Extra elevator proximity score: 0.8 * 25 = 20
		// Total: 120

		// Verify the recommendation matches the highest scored garage (Blue Zone A)
		expect(recommendation).toEqual({
			location: 'Blue Zone A',
			elevator: 'North',      // North elevator because weight1 (1.0) > weight2 (0.4)
			spots: 5,
			color: 'Blue',
			zone: 'A',
			showMapNotification: true
		});
	});

	it('should throw error when no suitable parking spots are found', async () => {
		// Mock empty garage results
		mockFindMany.mockResolvedValue([]);

		await expect(getParkingRecommendation('5', { needsAccessible: true }))
			.rejects
			.toThrow('No suitable parking spots found');
	});
});

//npm test parkingRecommendation.test.ts