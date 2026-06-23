import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Scoreboard from '../components/Scoreboard';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

export default function TurnIntroScreen() {
  const { state, dispatch } = useGame();
  return (
    <Screen>
      <View style={styles.top}>
        <Text style={styles.manche}>
          MANCHE {state.currentManche} / {state.totalManches}
        </Text>
        <Pressable onPress={() => dispatch({ type: 'GO_HOME' })} hitSlop={12}>
          <Text style={styles.quit}>Abandonner</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.h1}>Qui va trembler ?</Text>
        <Text style={styles.sub}>La roulette désigne la prochaine victime.</Text>
        <View style={{ height: spacing.xl }} />
        <Button label="Tourner la roulette" onPress={() => dispatch({ type: 'SPIN_TARGET' })} />
      </View>

      <Scoreboard />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  manche: { color: colors.accent, fontWeight: font.black, letterSpacing: 2, fontSize: 14 },
  quit: { color: colors.textFaint, fontSize: 13, fontWeight: font.semibold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 56, marginBottom: spacing.md },
  h1: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center' },
  sub: { color: colors.textMuted, fontSize: 16, marginTop: spacing.sm, textAlign: 'center' },
});
