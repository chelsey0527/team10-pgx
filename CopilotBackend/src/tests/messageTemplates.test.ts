const { messageTemplates } = require('../utils/messageTemplates');

const testData = {
  user: {
    firstName: "Test",
    lastName: "User"
  },
  event: {
    meetingName: "Test Meeting",
    meetingBuilding: "Building 3",
    startTime: "2024-03-20T10:00:00",
    endTime: "2024-03-20T11:00:00",
    description: "Test meeting description"
  },
  vehicleInfo: {
    licensePlate: "ABC123",
    make: "Toyota",
    model: "Camry"
  }
};

// Test all templates
console.log("\n=== Initial Greeting ===");
console.log(messageTemplates.initialGreeting(testData.user, testData.event));

console.log("\n=== Contact Admin ===");
console.log(messageTemplates.contactAdmin(testData.user, testData.event));

console.log("\n=== Car Registration ===");
console.log(messageTemplates.carRegistration(testData.user, testData.event));

console.log("\n=== Parking Recommendation ===");
console.log(messageTemplates.parkingRecommendation(testData.user, testData.vehicleInfo, testData.event));

console.log("\n=== Final Recommendation ===");
console.log(messageTemplates.finalRecommendation(testData.user, testData.event)); 