import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, radius, spacing } from '../theme';

export default function ChooseTypeScreen() {
  const { state, dispatch, playerById } = useGame();
  const target = playerById(state.turn?.targetId);

  return (
    <Screen center>
      <Text style={styles.kicker}>AU TOUR DE</Text>
      <Text style={styles.name}>{target?.name}</Text>
      <Text style={styles.sub}>Choisis ton poison. Pas de retour en arrière.</Text>

      <View style={styles.choices}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.primary }]}
          onPress={() => dispatch({ type: 'CHOOSE_TYPE', dareType: 'action' })}
        >
          <Text style={styles.cardLabel}>ACTION</Text>
        </Pressable>
        <Pressable
          style={[styles.card, { backgroundColor: colors.accent }]}
          onPress={() => dispatch({ type: 'CHOOSE_TYPE', dareType: 'verite' })}
        >
          <Text style={styles.cardLabel}>VÉRITÉ</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 3, textAlign: 'center' },
  name: { color: colors.text, fontSize: 40, fontWeight: font.black, textAlign: 'center', marginTop: spacing.xs },
  sub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxl },
  choices: { gap: spacing.lg, alignSelf: 'stretch' },
  card: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 44 },
  cardLabel: { color: colors.white, fontSize: 30, fontWeight: font.black, letterSpacing: 2, marginTop: spacing.sm },
});
