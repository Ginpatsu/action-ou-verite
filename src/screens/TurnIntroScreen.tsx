import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import GameHeader from '../components/GameHeader';
import Podium from '../components/Podium';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { useExit } from '../components/ExitContext';
import { colors, font, spacing } from '../theme';

export default function TurnIntroScreen() {
  const { state, dispatch } = useGame();
  const exit = useExit();
  return (
    <Screen scroll>
      <GameHeader manche={state.currentManche} total={state.totalManches} onQuit={exit} />

      <View style={styles.intro}>
        <Text style={styles.h1}>Qui va trembler ?</Text>
        <Text style={styles.sub}>La roulette désigne la prochaine victime.</Text>
        <View style={{ height: spacing.xl }} />
        <Button label="Tourner la roulette" onPress={() => dispatch({ type: 'SPIN_TARGET' })} />
      </View>

      <View style={{ height: spacing.xl }} />
      <Text style={styles.rankTitle}>CLASSEMENT</Text>
      <Podium players={state.players} celebrate={false} showRest />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  h1: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center' },
  sub: { color: colors.textMuted, fontSize: 16, marginTop: spacing.sm, textAlign: 'center' },
  rankTitle: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, fontSize: 12, marginBottom: spacing.md, textAlign: 'center' },
});
