import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

// Names the secret author privately. The target is told to look away.
export default function WriterHandoffScreen() {
  const { state, dispatch, playerById } = useGame();
  const writer = playerById(state.turn?.writerId);
  const target = playerById(state.turn?.targetId);

  return (
    <Screen center>
      <Text style={styles.emoji}>🤫</Text>
      <Text style={styles.kicker}>PASSE LE TÉLÉPHONE À</Text>
      <Text style={styles.name}>{writer?.name}</Text>

      <View style={styles.warn}>
        <Text style={styles.warnText}>
          {target?.name}, regarde ailleurs ! Tu ne dois pas savoir qui écrit ton épreuve.
        </Text>
      </View>

      <View style={{ height: spacing.xl }} />
      <Button label="C'est moi, je suis seul·e →" variant="accent" onPress={() => dispatch({ type: 'WRITER_READY' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 56, textAlign: 'center' },
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 3, textAlign: 'center', marginTop: spacing.md },
  name: { color: colors.accent, fontSize: 44, fontWeight: font.black, textAlign: 'center', marginVertical: spacing.sm },
  warn: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,176,32,0.12)',
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.lg,
  },
  warnText: { color: colors.warning, textAlign: 'center', fontSize: 15, fontWeight: font.semibold, lineHeight: 21 },
});
