import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const Home = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>It’s great to see you</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Card 1 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ParkingAssistant')}
          style={styles.card}
        >
          <Image
            source={require('../assets/parking.jpg')}
            style={styles.cardImage}
          />
          <View style={styles.cardTextContinaer}>
            <Text style={styles.cardText}>Help me with the parking at Microsoft Redmond</Text>
          </View>
        </TouchableOpacity>

        {/* Card 2 */}
        <View style={styles.card}>
          <Image
            source={require('../assets/clothes.png')}
            style={styles.cardImage}
          />
          <View style={styles.cardTextContinaer}>
            <Text style={styles.cardText}>Ask me to judge your outfit</Text>
          </View>
        </View>

        {/* Card 3 */}
        <View style={styles.card}>
          <Image
            source={require('../assets/language.png')}
            style={styles.cardImage}
          />
          <View style={styles.cardTextContinaer}>
            <Text style={styles.cardText}>
              Breaking language barriers one phrase at a time
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      {/* <TouchableOpacity style={styles.footerButton}>
        <Text style={styles.footerButtonText}>Message Copilot</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  header: {
    paddingTop: 100,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFF7F0',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    marginVertical: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.01,
    shadowRadius: 5,
    elevation: 5,
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginRight: 10,
  },
  cardTextContinaer: {
    width: '50%',
    marginLeft: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  footerButton: {
    backgroundColor: '#000',
    padding: 15,
    margin: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Home;
