import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Podium from '../components/Podium';
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
  const result = state.result;
  const winners = (result?.winnerIds ?? []).map((id) => playerById(id)).filter(Boolean);
  const losers = (result?.loserIds ?? []).map((id) => playerById(id)).filter(Boolean);
  const winnerNames = winners.map((w) => w!.name).join(', ');
  const loserNames = losers.map((l) => l!.name).join(', ');
  const multiLosers = losers.length > 1;

  return (
    <Screen scroll>
      <Text style={styles.kicker}>🏁 RÉSULTATS</Text>
      <Text style={styles.title}>FIN DE PARTIE</Text>
      {winners.length > 1 ? <Text style={styles.exaequo}>Gagnants ex aequo : {winnerNames}</Text> : null}

      <View style={{ height: spacing.xl }} />
      <Podium players={state.players} />

      {result?.tie ? (
        <View style={styles.sentence}>
          <Text style={styles.sentenceLead}>Égalité parfaite — personne ne perd ce soir !</Text>
          <Text style={styles.sentenceSub}>Tout le monde s'en sort avec le même score. Revanche ?</Text>
        </View>
      ) : (
        <>
          <View style={[styles.loserCard, { borderColor: colors.danger }]}>
            <Text style={styles.loserLabel}>{multiLosers ? 'LA SENTENCE POUR (EX AEQUO)' : 'LA SENTENCE POUR'}</Text>
            <Text style={[styles.loserName, { color: colors.danger }]}>{loserNames}</Text>
          </View>

          <View style={styles.sentence}>
            <Text style={styles.sentenceLead}>
              {multiLosers ? (
                <>
                  <Text style={{ color: colors.danger, fontWeight: font.black }}>{loserNames}</Text>, donnez vos téléphones aux
                  gagnants
                </>
              ) : (
                <>
                  <Text style={{ color: colors.danger, fontWeight: font.black }}>{loserNames}</Text>, donne ton téléphone à{' '}
                  <Text style={{ color: colors.gold, fontWeight: font.black }}>{winnerNames}</Text>
                </>
              )}
            </Text>
            <Text style={styles.sentenceSub}>pour qu'ils publient ce qu'ils veulent sur le réseau social de leur choix.</Text>
          </View>
        </>
      )}

      <View style={{ height: spacing.xl }} />
      <Button label="Rejouer (mêmes joueurs)" variant="primary" onPress={() => dispatch({ type: 'PLAY_AGAIN' })} />
      <View style={{ height: spacing.md }} />
      <Button label="Retour à l'accueil" variant="outline" onPress={exit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.gold, fontWeight: font.black, letterSpacing: 3, fontSize: 13, textAlign: 'center' },
  title: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center', letterSpacing: 1, marginTop: spacing.xs },
  exaequo: { color: colors.gold, textAlign: 'center', marginTop: spacing.xs, fontWeight: font.semibold },
  loserCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, padding: spacing.lg, marginTop: spacing.xxl, alignItems: 'center' },
  loserLabel: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, fontSize: 11 },
  loserName: { fontSize: 28, fontWeight: font.black, marginTop: 2, textAlign: 'center' },
  sentence: { marginTop: spacing.xl, alignItems: 'center' },
  sentenceLead: { color: colors.text, fontSize: 20, fontWeight: font.semibold, textAlign: 'center', lineHeight: 28 },
  sentenceSub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
});
