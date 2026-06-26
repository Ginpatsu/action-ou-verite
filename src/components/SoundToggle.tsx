import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';
import { tap } from '../utils/haptics';
import { isSoundEnabled, subscribeSound, toggleSound } from '../utils/sound';

// Bouton rond pour activer/couper tous les sons. Se synchronise avec l'état
// global du gestionnaire audio (utilisable sur plusieurs écrans à la fois).
export default function SoundToggle({ style }: { style?: ViewStyle }) {
  const [on, setOn] = useState(isSoundEnabled());
  useEffect(() => subscribeSound(setOn), []);

  return (
    <Pressable
      onPress={() => {
        tap();
        toggleSound();
      }}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={on ? 'Couper le son' : 'Activer le son'}
      style={[styles.btn, style]}
    >
      <Ionicons name={on ? 'volume-high' : 'volume-mute'} size={22} color={on ? colors.text : colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
