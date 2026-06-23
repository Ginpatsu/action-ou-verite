import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Roulette from '../components/Roulette';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

// Designates who writes the dare. Names are shown directly (no anonymity in local).
export default function WriterRouletteScreen() {
  const { state, dispatch, playerById } = useGame();
  const [done, setDone] = useState(false);
  const writer = playerById(state.turn?.writerId);
  const names = state.players.map((p) => p.name);
  const winnerIndex = Math.max(0, state.players.findIndex((p) => p.id === state.turn?.writerId));

  return (
    <Screen center>
      <Text style={styles.kicker}>QUI ÉCRIT L'ÉPREUVE ?</Text>
      <View style={{ height: spacing.lg }} />
      <Roulette items={names} winnerIndex={winnerIndex} accent={colors.accent} onDone={() => setDone(true)} />

      <View style={styles.result}>
        {done ? (
          <>
            <Text style={styles.h1}>
              <Text style={{ color: colors.accent }}>{writer?.name}</Text> écrit l'épreuve ! ✍️
            </Text>
            <Text style={styles.sub}>Passe-lui le téléphone.</Text>
            <View style={{ height: spacing.lg }} />
            <Button label="Continuer" variant="accent" onPress={() => dispatch({ type: 'WRITER_DONE' })} />
          </>
        ) : (
          <Text style={styles.suspense}>🥁🥁🥁</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.accent, fontWeight: font.black, letterSpacing: 2, textAlign: 'center' },
  result: { marginTop: spacing.xl, alignItems: 'center', minHeight: 150, justifyContent: 'center', alignSelf: 'stretch' },
  h1: { color: colors.text, fontSize: 28, fontWeight: font.black, textAlign: 'center' },
  sub: { color: colors.textMuted, fontSize: 16, marginTop: spacing.sm, textAlign: 'center' },
  suspense: { fontSize: 30, letterSpacing: 4 },
});
