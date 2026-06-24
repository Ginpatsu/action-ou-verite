import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

export default function WriterHandoffScreen() {
  const { state, dispatch, playerById } = useGame();
  const writer = playerById(state.turn?.writerId);
  const target = playerById(state.turn?.targetId);

  return (
    <Screen center>
      {/* <Text style={styles.emoji}>✍️</Text> */}
      <Text style={styles.kicker}>PASSE LE TÉLÉPHONE À</Text>
      <Text style={styles.name}>{writer?.name}</Text>
      <Text style={styles.sub}>C'est toi qui écris l'épreuve de {target?.name}.</Text>

      <View style={{ height: spacing.xl }} />
      <Button label="J'ai le téléphone →" variant="accent" onPress={() => dispatch({ type: 'WRITER_READY' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 56, textAlign: 'center' },
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 3, textAlign: 'center', marginTop: spacing.md },
  name: { color: colors.accent, fontSize: 44, fontWeight: font.black, textAlign: 'center', marginVertical: spacing.sm },
  sub: { color: colors.textMuted, fontSize: 16, textAlign: 'center', lineHeight: 22 },
});
