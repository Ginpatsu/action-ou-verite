import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import GameHeader from '../components/GameHeader';
import Podium from '../components/Podium';
import ResultSound from '../components/ResultSound';
import Screen from '../components/Screen';
import { useExit } from '../components/ExitContext';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

export default function TurnResultScreen() {
  const { state, dispatch, playerById } = useGame();
  const exit = useExit();
  const target = playerById(state.turn?.targetId);
  const refused = state.turn?.refused;
  const isLast = state.currentManche >= state.totalManches;

  return (
    <Screen scroll>
      <ResultSound refused={!!refused} />
      <GameHeader manche={state.currentManche} total={state.totalManches} onQuit={exit} />
      <View style={styles.center}>
        <Text style={styles.emoji}>{refused ? '' : ''}</Text>
        {refused ? (
          <>
            <Text style={styles.h1}>+1 malus</Text>
            <Text style={styles.sub}>{target?.name} s'est dégonflé·e.</Text>
          </>
        ) : (
          <>
            <Text style={styles.h1}>Respect.</Text>
            <Text style={styles.sub}>{target?.name} a assuré. Rien à signaler.</Text>
          </>
        )}
      </View>

      <Text style={styles.rankTitle}>CLASSEMENT</Text>
      <Podium players={state.players} celebrate={false} showRest />

      <View style={{ height: spacing.lg }} />
      <Button
        label={isLast ? 'Voir le verdict final →' : 'Manche suivante →'}
        variant={isLast ? 'gold' : 'primary'}
        onPress={() => dispatch({ type: 'NEXT' })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  emoji: { fontSize: 60 },
  h1: { color: colors.text, fontSize: 40, fontWeight: font.black, marginTop: spacing.sm },
  sub: { color: colors.textMuted, fontSize: 17, marginTop: spacing.sm, textAlign: 'center' },
  rankTitle: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, fontSize: 12, marginBottom: spacing.md, textAlign: 'center' },
});
