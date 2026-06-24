import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Roulette from '../components/Roulette';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

export default function PlayerRouletteScreen() {
  const { state, dispatch, playerById } = useGame();
  const [done, setDone] = useState(false);
  const target = playerById(state.turn?.targetId);
  const names = state.players.map((p) => p.name);
  const winnerIndex = Math.max(0, state.players.findIndex((p) => p.id === state.turn?.targetId));

  return (
    <Screen center>
      <Text style={styles.kicker}>LA ROULETTE TOURNE…</Text>
      <View style={{ height: spacing.lg }} />
      <Roulette items={names} winnerIndex={winnerIndex} accent={colors.primary} onDone={() => setDone(true)} />

      <View style={styles.result}>
        {done ? (
          <>
            <Text style={styles.h1}>
              C'est <Text style={{ color: colors.primary }}>{target?.name}</Text> !
            </Text>
            <Text style={styles.sub}>Action ou vérité ? À toi de choisir.</Text>
            <View style={{ height: spacing.lg }} />
            <Button label="Continuer" onPress={() => dispatch({ type: 'TARGET_DONE' })} />
          </>
        ) : (
            null
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 3, textAlign: 'center' },
  result: { marginTop: spacing.xl, alignItems: 'center', minHeight: 150, justifyContent: 'center', alignSelf: 'stretch' },
  h1: { color: colors.text, fontSize: 30, fontWeight: font.black, textAlign: 'center' },
  sub: { color: colors.textMuted, fontSize: 16, marginTop: spacing.sm, textAlign: 'center' },
  suspense: { fontSize: 30, letterSpacing: 4 },
});
