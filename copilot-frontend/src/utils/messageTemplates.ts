export const messageTemplates = {
  initialGreeting: (userData: any, eventData: any) => ({
    content: [
      `Hi, ${userData.firstName}! Based on the code you provided, I have found your scheduled meeting.\n`,
      `<MeetingCard 
        EventName="${eventData.name}"
        EventTime="${new Date(eventData.startTime).toLocaleString()}"
        Location="Building${eventData.building}"
      />`,
      ``,
    `\nIs this the correct meeting information you'd like to use to pre-register parking?`,
    ].join('')
  }),

  errorMessage: () => "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment.",
  
}; 