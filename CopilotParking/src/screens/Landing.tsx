import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const Home = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.gradient} />

      {/* Content */}
      <View style={styles.titleContainer}>
        <Image source={require('../assets/copilot.png')} style={styles.icon} />
        <Text style={styles.title}>Hi, I’m Copilot, your AI companion.</Text>
      </View>

      {/* Buttons */}
      <View style={styles.actionsContainer}>
      <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInButtonText}>Sign in</Text>
        </TouchableOpacity>
        {/* Footer Links */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>Privacy</Text>
            <Text style={styles.footerText}>Terms of use</Text>
            <Text style={styles.footerText}>FAQ</Text>
        </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 100,
    backgroundColor: '#F3F6FF',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F3F6FF',
  },
  titleContainer: {
    width: '80%',
    marginTop: 100,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 35,
    fontWeight: '500',
    textAlign: 'left',
    color: '#333',
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    width: '80%',
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
  signInButton: {
    width: '80%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 50,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
});

export default Home;
