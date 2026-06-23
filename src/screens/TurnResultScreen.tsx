import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Scoreboard from '../components/Scoreboard';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

export default function TurnResultScreen() {
  const { state, dispatch, playerById } = useGame();
  const target = playerById(state.turn?.targetId);
  const refused = state.turn?.refused;
  const isLast = state.currentManche >= state.totalManches;

  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.emoji}>{refused ? '💀' : '🔥'}</Text>
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

      <Scoreboard title="Classement des malus" />

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 60 },
  h1: { color: colors.text, fontSize: 40, fontWeight: font.black, marginTop: spacing.sm },
  sub: { color: colors.textMuted, fontSize: 17, marginTop: spacing.sm, textAlign: 'center' },
});
