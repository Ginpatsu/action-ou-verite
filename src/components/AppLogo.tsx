import React from 'react';
import { Image } from 'react-native';

export default function AppLogo({ size = 120 }: { size?: number }) {
  return <Image style={{ width: size, height: size }} source={require('../../assets/icon.png')} />;
}
