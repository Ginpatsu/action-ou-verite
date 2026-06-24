import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

export default function HandBackScreen() {
  const { state, dispatch, playerById } = useGame();
  const target = playerById(state.turn?.targetId);

  return (
    <Screen center>
      {/* <Text style={styles.emoji}>📲</Text> */}
      <Text style={styles.h1}>Épreuve prête.</Text>
      <Text style={styles.sub}>Rends le téléphone à {target?.name}.</Text>
      <View style={{ height: spacing.xl }} />
      <Button label={`C'est bon, à ${target?.name} →`} onPress={() => dispatch({ type: 'HAND_BACK_DONE' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 56, textAlign: 'center' },
  h1: { color: colors.text, fontSize: 30, fontWeight: font.black, textAlign: 'center', marginTop: spacing.md },
  sub: { color: colors.textMuted, fontSize: 17, textAlign: 'center', marginTop: spacing.sm },
  note: { color: colors.textFaint, fontSize: 14, textAlign: 'center', marginTop: spacing.sm },
});
