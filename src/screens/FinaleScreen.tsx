import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { useExit } from '../components/ExitContext';
import { colors, font, radius, spacing } from '../theme';

// Écran de fin en mode LOCAL (un seul téléphone partagé). On NE détecte pas les
// réseaux installés (le téléphone partagé n'est pas forcément celui du perdant) :
// on demande simplement au perdant de donner son propre téléphone au gagnant.
export default function FinaleScreen() {
  const { state, dispatch, playerById } = useGame();
  const exit = useExit();
  const winner = playerById(state.result?.winnerId);
  const loser = playerById(state.result?.loserId);

  return (
    <Screen scroll>
      <Text style={styles.title}>FIN DE PARTIE</Text>
      {state.result?.tie ? <Text style={styles.tie}>Égalité parfaite... le sort a tranché</Text> : null}

      <View style={[styles.podium, { borderColor: colors.gold }]}>
        <Text style={styles.podiumLabel}>GAGNANT·E</Text>
        <Text style={[styles.podiumName, { color: colors.gold }]}>{winner?.name}</Text>
        <Text style={styles.podiumMalus}>{winner?.malus} malus - le moins puni</Text>
      </View>

      <View style={[styles.podium, { borderColor: colors.danger }]}>
        <Text style={styles.podiumLabel}>PERDANT·E</Text>
        <Text style={[styles.podiumName, { color: colors.danger }]}>{loser?.name}</Text>
        <Text style={styles.podiumMalus}>{loser?.malus} malus - la sentence</Text>
      </View>

      <View style={styles.sentence}>
        <Text style={styles.sentenceLead}>
          <Text style={{ color: colors.danger, fontWeight: font.black }}>{loser?.name}</Text>, donne ton téléphone à{' '}
          <Text style={{ color: colors.gold, fontWeight: font.black }}>{winner?.name}</Text>
        </Text>
        <Text style={styles.sentenceSub}>
          pour qu'il publie ce qu'il veut sur le réseau social de son choix.
        </Text>
      </View>

      <View style={{ height: spacing.xl }} />
      <Button label="Rejouer (mêmes joueurs)" variant="primary" onPress={() => dispatch({ type: 'PLAY_AGAIN' })} />
      <View style={{ height: spacing.md }} />
      <Button label="Retour à l'accueil" variant="outline" onPress={exit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center', letterSpacing: 1 },
  tie: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, fontStyle: 'italic' },
  podium: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, padding: spacing.lg, marginTop: spacing.lg },
  podiumLabel: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, fontSize: 11 },
  podiumName: { fontSize: 30, fontWeight: font.black },
  podiumMalus: { color: colors.textFaint, fontSize: 13, marginTop: 2 },
  sentence: { marginTop: spacing.xxl, alignItems: 'center' },
  sentenceLead: { color: colors.text, fontSize: 20, fontWeight: font.semibold, textAlign: 'center', lineHeight: 28 },
  sentenceSub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
});
