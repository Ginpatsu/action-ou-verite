import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { warn } from '../utils/haptics';
import { colors, font, radius, spacing } from '../theme';

export default function JudgeScreen() {
  const { state, dispatch, playerById } = useGame();
  const target = playerById(state.turn?.targetId);

  return (
    <Screen center>
      <Text style={styles.kicker}>VERDICT</Text>
      <Text style={styles.h1}>{target?.name} a assuré ?</Text>
      <Text style={styles.sub}>Si la personne se dégonfle, elle prend un malus 💀</Text>

      <View style={styles.choices}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.success }]}
          onPress={() => dispatch({ type: 'SET_VERDICT', refused: false })}
        >
          {/* <Text style={styles.cardEmoji}>✅</Text> */}
          <Text style={[styles.cardLabel, { color: colors.black }]}>A ASSURÉ</Text>
          <Text style={[styles.cardHint, { color: 'rgba(0,0,0,0.6)' }]}>aucun malus</Text>
        </Pressable>
        <Pressable
          style={[styles.card, { backgroundColor: colors.danger }]}
          onPress={() => {
            warn();
            dispatch({ type: 'SET_VERDICT', refused: true });
          }}
        >
          {/* <Text style={styles.cardEmoji}>💀</Text> */}
          <Text style={[styles.cardLabel, { color: colors.white }]}>S'EST DÉGONFLÉ·E</Text>
          <Text style={[styles.cardHint, { color: 'rgba(255,255,255,0.75)' }]}>+1 malus</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.accent, fontWeight: font.black, letterSpacing: 2, textAlign: 'center' },
  h1: { color: colors.text, fontSize: 30, fontWeight: font.black, textAlign: 'center', marginTop: spacing.sm },
  sub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxl },
  choices: { gap: spacing.lg, alignSelf: 'stretch' },
  card: { borderRadius: radius.xl, paddingVertical: spacing.xl, alignItems: 'center' },
  cardEmoji: { fontSize: 38 },
  cardLabel: { fontSize: 24, fontWeight: font.black, letterSpacing: 1, marginTop: spacing.xs },
  cardHint: { fontSize: 13, fontWeight: font.semibold, marginTop: 2 },
});
