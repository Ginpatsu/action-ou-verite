import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

// Hands the phone back to the writer so they judge the attempt.
export default function JudgeHandoffScreen() {
  const { state, dispatch, playerById } = useGame();
  const writer = playerById(state.turn?.writerId);
  const target = playerById(state.turn?.targetId);

  return (
    <Screen center>
      <Text style={styles.kicker}>LE TÉLÉPHONE REVIENT À</Text>
      <Text style={styles.name}>{writer?.name}</Text>
      <Text style={styles.sub}>À toi de juger si {target?.name} a assuré son épreuve.</Text>
      <View style={{ height: spacing.xl }} />
      <Button label="Prêt·e à juger →" variant="accent" onPress={() => dispatch({ type: 'JUDGE_READY' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 50, textAlign: 'center' },
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 3, textAlign: 'center', marginTop: spacing.md },
  name: { color: colors.accent, fontSize: 40, fontWeight: font.black, textAlign: 'center', marginVertical: spacing.sm },
  sub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 21 },
});
