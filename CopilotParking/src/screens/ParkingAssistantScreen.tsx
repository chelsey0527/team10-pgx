import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
  } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

type Message = {
  id: number;
  type: 'user' | 'ai';
  text: string;
  path?: any; // Optional property for the image
};


const ParkingAssistantScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
		{ id: 1, type: 'user', text: 'Help me with the parking at Microsoft Redmond' },
    { id: 2, type: 'ai', text: "Sure! Welcome to Microsoft. What's the purpose of your visit?" },
  ]);

  const handleUserResponse = (response: string) => {
    setMessages([
      ...messages,
      { id: messages.length + 1, type: 'user', text: response },
			{
        id: messages.length + 2,
        type: 'ai',
        text: 'I found the most recently scheduled meeting in our guest management system. Is this information correct?',
        path: require('../assets/demo-schedule.png'), // Include the image path here
      },
    ]);
  };

	const navigation = useNavigation(); // Get the navigation object

  return (
    <View style={styles.container}>
     {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()} // Navigate back to the previous screen
				>
          <Image source={require('../assets/icon-back.png')} style={styles.headerIcon} />
        </TouchableOpacity>
				<View style={styles.headerTitleContainer}>
					<Text style={styles.headerTitle}>Parking Assistant</Text>
				</View>
        {/* <TouchableOpacity style={styles.profileButton}>
          <Image source={require('../assets/icon-profile.png')} style={styles.headerIcon} />
        </TouchableOpacity> */}
      </View>

      {/* Messages */}
      <ScrollView contentContainerStyle={styles.chatContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.type === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            {/* Show the image if the 'path' property exists */}
            {message.path &&
							<View style={styles.demoImageContainer}>
								<Image source={message.path} style={styles.demoImage} />
							</View>
						}
          </View>
        ))}

        {/* AI Options */}
        {messages.length === 2 && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleUserResponse('Business Meeting')}>
              <Text style={styles.optionButtonText}>Business Meeting</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleUserResponse('New Employee Onboarding')}>
              <Text style={styles.optionButtonText}>New Employee Onboarding</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleUserResponse('Employee Relatives')}>
              <Text style={styles.optionButtonText}>Employee Relatives</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleUserResponse('Others')}>
              <Text style={styles.optionButtonText}>Others</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.footer}>
        {/* Copilot Icon */}
        <Image source={require('../assets/copilot.png')} style={styles.icon} />

        {/* Plus Icon */}
        <TouchableOpacity style={styles.plusIcon}>
            <Image source={require('../assets/icon-plus.png')} style={styles.voiceIcon} />
        </TouchableOpacity>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message Copilot"
            placeholderTextColor="#888"
          />
        </View>

        {/* Voice Icon */}
        <TouchableOpacity>
          <Image source={require('../assets/icon-microphone.png')} style={styles.voiceIcon} />
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0',
		paddingTop: 50,
  },
	header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5, // For Android shadow
  },
  backButton: {
    padding: 5,
  },
  profileButton: {
    padding: 5,
  },
  headerIcon: {
    width: 20,
    height: 20,
  },
	headerTitleContainer: {
		flex: 1, // Ensures the title container takes up the remaining space
		alignItems: 'center', // Centers the title horizontally
		justifyContent: 'center', // Centers the title vertically
	},
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  chatContainer: {
    padding: 20,
  },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  aiBubble: {
    // backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#FDE5CD',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  optionsContainer: {
		marginLeft: 18,
		width: 250,
  },
  optionButton: {
		height: 40,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionButtonText: {
		lineHeight: 30,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
	demoImageContainer: {
    maxWidth: 250,
    backgroundColor: 'red',
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
	},
	demoImage: {
		borderRadius: 10,
		width: 250,
		height: 161,
		alignSelf: 'stretch',
		resizeMode: 'contain',
	},
  footer: {
    height: 50,
    width: '95%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 20,
    marginBottom: 50,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F0',
    // Shadow properties
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 }, // Shadow appears at the bottom
    elevation: 5, // For Android shadow support
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  plusIcon: {
    width: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  plusText: {
    fontSize: 20,
    color: '#888',
    fontWeight: '600',
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
    height: 38,
  },
  input: {
    flex: 1,
    height: 'auto',
    borderRadius: 20,
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  voiceIcon: {
    width: 20,
    height: 20,
  },
});

export default ParkingAssistantScreen;
