export const messageTemplates = {
  initialGreeting: (userData: any, eventData: any) => `Hi, nice to see you, ${userData.firstName}! Based on the one-time code you provided, I have found your scheduled meeting. Is this the correct meeting information you'd like to use to pre-register parking?
**${eventData.name}**
**${new Date(eventData.startTime).toLocaleString()} (PST)**
**Building: ${eventData.building}**
Just Type "Yes" or "No" to answer 😊`,

  errorMessage: () => "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment.",
  
}; 