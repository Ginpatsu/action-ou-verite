import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');
const COLORS = [colors.primary, colors.accent, colors.gold, colors.success, colors.warning, colors.white];

type Piece = { left: number; delay: number; duration: number; size: number; color: string; drift: number; spin: string };

function buildPieces(count: number): Piece[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * SCREEN_W,
    delay: Math.random() * 600,
    duration: 1900 + Math.random() * 1400,
    size: 7 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    drift: (Math.random() * 2 - 1) * 70,
    spin: `${Math.random() > 0.5 ? '' : '-'}${540 + Math.floor(Math.random() * 540)}deg`,
  }));
}

// Pluie de confettis jouée une fois (célébration de fin de partie / podium).
// Léger : pièces simples, transform + opacity en useNativeDriver -> 60 FPS.
export default function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useRef(buildPieces(count)).current;
  const progress = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = pieces.map((p, i) =>
      Animated.timing(progress[i], {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    );
    const all = Animated.parallel(anims);
    all.start();
    return () => all.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const translateY = progress[i].interpolate({ inputRange: [0, 1], outputRange: [-30, SCREEN_H + 40] });
        const translateX = progress[i].interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = progress[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', p.spin] });
        const opacity = progress[i].interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.left,
              top: 0,
              width: p.size,
              height: p.size * 1.6,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
