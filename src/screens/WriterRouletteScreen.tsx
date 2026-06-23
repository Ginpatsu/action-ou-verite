import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Roulette from '../components/Roulette';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

// The author roulette is ANONYMOUS: names are masked so the group can't see
// who was picked. Only the chosen author finds out on the next (private) screen.
export default function WriterRouletteScreen() {
  const { state, dispatch } = useGame();
  const [done, setDone] = useState(false);
  const names = state.players.map((p) => p.name);
  const winnerIndex = Math.max(0, state.players.findIndex((p) => p.id === state.turn?.writerId));

  return (
    <Screen center>
      <Text style={styles.kicker}>ROULETTE ANONYME 🤫</Text>
      <Text style={styles.sub}>Quelqu'un va écrire l'épreuve… mais personne ne saura qui.</Text>
      <View style={{ height: spacing.lg }} />
      <Roulette items={names} winnerIndex={winnerIndex} anonymous accent={colors.accent} onDone={() => setDone(true)} />

      <View style={styles.result}>
        {done ? (
          <>
            <Text style={styles.h1}>Auteur secret désigné 🔒</Text>
            <Text style={styles.sub}>Ne dites rien. Passez le téléphone discrètement.</Text>
            <View style={{ height: spacing.lg }} />
            <Button label="Continuer" variant="accent" onPress={() => dispatch({ type: 'WRITER_DONE' })} />
          </>
        ) : (
          <Text style={styles.suspense}>🤫🤫🤫</Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.accent, fontWeight: font.black, letterSpacing: 3, textAlign: 'center' },
  sub: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm, textAlign: 'center' },
  result: { marginTop: spacing.xl, alignItems: 'center', minHeight: 150, justifyContent: 'center', alignSelf: 'stretch' },
  h1: { color: colors.text, fontSize: 26, fontWeight: font.black, textAlign: 'center' },
  suspense: { fontSize: 30, letterSpacing: 4 },
});
