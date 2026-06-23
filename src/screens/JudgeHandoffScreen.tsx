import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

// Hands the phone back to the (still anonymous) author so they can judge.
export default function JudgeHandoffScreen() {
  const { dispatch } = useGame();
  return (
    <Screen center>
      <Text style={styles.emoji}>⚖️🤫</Text>
      <Text style={styles.h1}>L'auteur secret reprend le téléphone</Text>
      <Text style={styles.sub}>Tu sais qui tu es. À toi de juger si l'épreuve a été assurée.</Text>
      <Text style={[styles.sub, { color: colors.textFaint }]}>Toujours en secret — ton nom n'apparaît pas.</Text>
      <View style={{ height: spacing.xl }} />
      <Button label="Prêt·e à juger →" variant="accent" onPress={() => dispatch({ type: 'JUDGE_READY' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 50, textAlign: 'center' },
  h1: { color: colors.text, fontSize: 26, fontWeight: font.black, textAlign: 'center', marginTop: spacing.md },
  sub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
});
