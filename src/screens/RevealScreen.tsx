import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, radius, spacing } from '../theme';

export default function RevealScreen() {
  const { state, dispatch, playerById } = useGame();
  const target = playerById(state.turn?.targetId);
  const writer = playerById(state.turn?.writerId);
  const isAction = state.turn?.type === 'action';
  const accent = isAction ? colors.primary : colors.accent;

  return (
    <Screen scroll center>
      <Text style={styles.kicker}>POUR</Text>
      <Text style={styles.name}>{target?.name}</Text>

      <View style={[styles.chip, { backgroundColor: accent }]}>
        <Text style={styles.chipText}>{isAction ? '⚡ ACTION' : '💬 VÉRITÉ'}</Text>
      </View>

      <View style={[styles.card, { borderColor: accent }]}>
        <Text style={styles.dare}>{state.turn?.dare}</Text>
      </View>

      <Text style={styles.sub}>À toi de jouer. {writer?.name} jugera si tu assures… ou si tu te dégonfles.</Text>

      <View style={{ height: spacing.lg }} />
      <Button label={`${writer?.name} juge →`} variant="outline" onPress={() => dispatch({ type: 'GO_JUDGE_HANDOFF' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 3, textAlign: 'center' },
  name: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center', marginTop: 2 },
  chip: { alignSelf: 'center', borderRadius: 999, paddingHorizontal: spacing.lg, paddingVertical: 6, marginTop: spacing.md },
  chipText: { color: colors.white, fontWeight: font.black, letterSpacing: 1 },
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  dare: { color: colors.text, fontSize: 24, fontWeight: font.bold, textAlign: 'center', lineHeight: 32 },
  sub: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.lg, lineHeight: 20 },
});
