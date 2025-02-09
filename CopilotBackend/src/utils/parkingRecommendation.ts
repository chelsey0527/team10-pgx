// import PriorityQueue from 'priorityqueuejs';

// interface Coordinates {
//   x: number;
//   y: number;
//   z: number; // floor level
// }

// interface ParkingNode {
//   id: string;
//   type: 'entrance' | 'parking' | 'elevator';
//   coordinates: Coordinates;
//   features?: {
//     isEV?: boolean;
//     isAccessible?: boolean;
//     nearStairs?: boolean;
//     nearElevator?: boolean;
//   };
// }

// interface ParkingGraph {
//   nodes: ParkingNode[];
//   edges: {
//     from: string;
//     to: string;
//     weight: number;
//   }[];
// }

// interface ParkingPreferences {
//   needsEV?: boolean;
//   needsAccessible?: boolean;
//   preferStairs?: boolean;
//   preferElevator?: boolean;
//   targetBuilding?: string;
// }

// function heuristic(node: ParkingNode, goalNode: ParkingNode): number {
//   // Manhattan distance + floor level difference
//   return (
//     Math.abs(node.coordinates.x - goalNode.coordinates.x) +
//     Math.abs(node.coordinates.y - goalNode.coordinates.y) +
//     Math.abs(node.coordinates.z - goalNode.coordinates.z) * 2 // Extra weight for floor changes
//   );
// }

// function findBestParking(
//   graph: ParkingGraph,
//   startNodeId: string,
//   preferences: ParkingPreferences
// ): { path: string[]; score: number } {
//   const startNode = graph.nodes.find(n => n.id === startNodeId);
//   if (!startNode) throw new Error('Start node not found');

//   // Filter parking spots based on preferences
//   const validParkingSpots = graph.nodes.filter(node => {
//     if (node.type !== 'parking') return false;
//     if (preferences.needsEV && !node.features?.isEV) return false;
//     if (preferences.needsAccessible && !node.features?.isAccessible) return false;
//     return true;
//   });

//   let bestSpot = null;
//   let bestScore = Infinity;
//   let bestPath = [];

//   for (const parkingSpot of validParkingSpots) {
//     const result = aStar(graph, startNode, parkingSpot);
    
//     // Calculate preference score (lower is better)
//     let preferenceScore = result.distance;
//     if (preferences.preferStairs && !parkingSpot.features?.nearStairs) preferenceScore += 5;
//     if (preferences.preferElevator && !parkingSpot.features?.nearElevator) preferenceScore += 5;
    
//     if (preferenceScore < bestScore) {
//       bestScore = preferenceScore;
//       bestSpot = parkingSpot;
//       bestPath = result.path;
//     }
//   }

//   return { path: bestPath, score: bestScore };
// }

// function aStar(graph: ParkingGraph, start: ParkingNode, goal: ParkingNode) {
//   const openSet = new PriorityQueue<{ node: ParkingNode; fScore: number }>(
//     (a, b) => a.fScore < b.fScore
//   );
  
//   const gScore: Map<string, number> = new Map();
//   const fScore: Map<string, number> = new Map();
//   const cameFrom: Map<string, string> = new Map();

//   gScore.set(start.id, 0);
//   fScore.set(start.id, heuristic(start, goal));
//   openSet.push({ node: start, fScore: fScore.get(start.id)! });

//   while (!openSet.isEmpty()) {
//     const current = openSet.pop()!.node;

//     if (current.id === goal.id) {
//       // Reconstruct path
//       const path = [];
//       let currentId = goal.id;
//       while (currentId) {
//         path.unshift(currentId);
//         currentId = cameFrom.get(currentId)!;
//       }
//       return { path, distance: gScore.get(goal.id)! };
//     }

//     const edges = graph.edges.filter(e => e.from === current.id);
//     for (const edge of edges) {
//       const neighbor = graph.nodes.find(n => n.id === edge.to)!;
//       const tentativeGScore = gScore.get(current.id)! + edge.weight;

//       if (!gScore.has(neighbor.id) || tentativeGScore < gScore.get(neighbor.id)!) {
//         cameFrom.set(neighbor.id, current.id);
//         gScore.set(neighbor.id, tentativeGScore);
//         const f = tentativeGScore + heuristic(neighbor, goal);
//         fScore.set(neighbor.id, f);
//         openSet.push({ node: neighbor, fScore: f });
//       }
//     }
//   }

//   return { path: [], distance: Infinity };
// }

// export { findBestParking, type ParkingGraph, type ParkingPreferences }; 