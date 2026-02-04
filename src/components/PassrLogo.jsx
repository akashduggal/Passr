import { View, Image, StyleSheet } from 'react-native';

export default function PassrLogo({ containerStyle, imageStyle }) {
  return (
    <View style={[styles.logoContainer, containerStyle]}>
      <Image 
        source={require('../../assets/Passr_logo.png')} 
        style={[styles.logoImage, imageStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
});
