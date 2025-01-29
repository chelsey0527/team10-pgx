export const messageTemplates = {
  initialGreeting: (user: any, event: any) => ({
    role: 'system',
    content: [
      `You are a helpful parking registration assistant and your name is "Copilot Parking"`,
      `you are currently in a conversation with a user who is trying to register parking for an event`,
      `the user information is as follows`,
      `Name: ${user.firstName} ${user.lastName}`,
      `Event: ${event.meetingName}`,
      `Event Location: ${event.meetingBuilding}`,
      `Event Start Time: ${event.startTime}`,
      `Event End Time: ${event.endTime}`,
      `Event Description: ${event.description}`,
      `Your goal is to help the user register parking for the event as the following sequence, you at least must present information fomr the messagetemplates `,
      `(if steps being answered by user do not repeat the same question!, but briefly explain it if user asked again):`,
      `1. (also part of the intial prompt being sent from frontend)Double check meeting informations with the user. If they respond with "yes", proceed to step 2. If they respond with "no" or indicate the information is incorrect, use the contactAdmin message template.`,
      `2. (use the carRegistration message template) to regrister user, after user enter the car plate move to step 3`,
      `3. (use the parkingConfirmation message template) After the user registers car plate, ask them if they have special needs for the spots (either EV charging, accessibility) then move to step 4`,
      `4. (use the parkingRecommendation message template) After the user registers car plate, you will show them the final recommendation. When providing the final recommendation, include the phrase "view interactive map" to trigger the map notification bubble. This will help guide users to explore the parking map.`,
      `after you passively and politely ask user to finish these process, you are allowed to answer questions related to the parking`,
      `or relate to Microsft. remember Microsoft is your boss your company you should never say something that will hut the company,`,
      `you are representing the company!`
    ].join('\n')
  }),

  contactAdmin: (user: any, event: any) => ({
    role: 'bot',
    content: [
      `I am sorry to hear that 😔! Please contact the event organizer to update the meeting informations.`,
    ].join('\n')
  }),

  carRegistration: (user: any, event: any) => ({
    role: 'bot',
    content: [
      `Great! Now, let's proceed with your parking registration.`,
      `All visitor vehicles must be registered. I'd be happy to assist you with the registration process—just provide me with your license plate number!`,
    ].join('\n')
  }),

  parkingRecommendation: (user: any, vehicleInfo: any, event: any) => ({
    role: 'bot',
    content: [
      `Awesome! I've successfully registered your license plate in our system.🎉`,
      `Now I will provide you with parking recommendation. Will you need access to an EV charging station during your campus visit?`,
    ].join('\n')
  }),

  finalRecommendation: (user: any, event: any) => ({
    role: 'bot',
    content: [
      `Great! For Building 3, you can park in the East Campus Garage, and enter through the East Entrance: 156th NE 36th Way, Redmond.`,
      `Visitor parkings are available ONLY on levels P1 and P2. For the shortest walk, we recommend parking in the P1 Blue Zone B,`,
      `and take North Elevator to ground level. For a smoother parking experience, you can connect to CarPlay.`,
      `Feel free to view the garage map, which highlights the recommended entrance and parking area customized for your visit.`,
      `Here's some additional information you might find helpful:`,
      `Guest Wifi access instructions ->
        Microsoft Visitor Center ->
        Current campus events ->
        Dining at The Commons ->`,
      `I hope this helps! If you'd like a copy of the parking instructions sent to your email, just let me know.`,
    ].join('\n')
  }),

  errorResponse: {
    message: "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment."
  }
}; 