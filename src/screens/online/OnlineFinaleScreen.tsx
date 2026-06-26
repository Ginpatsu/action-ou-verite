import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Podium from '../../components/Podium';
import Screen from '../../components/Screen';
import { type SocialApp } from '../../data/socialApps';
import { useOnline } from '../../online/OnlineContext';
import type { SocialId } from '../../types';
import { detectInstalled, openSocial, sortByInstalled } from '../../utils/social';
import { colors, font, radius, spacing } from '../../theme';

export default function OnlineFinaleScreen() {
  const { state, myId, isHost, act, leave, playerById } = useOnline();
  const [installed, setInstalled] = useState<SocialId[] | null>(null);

  const amLoser = !!myId && (state?.result?.loserIds ?? []).includes(myId);

  useEffect(() => {
    if (!amLoser) return;
    let active = true;
    detectInstalled().then((ids) => active && setInstalled(ids));
    return () => {
      active = false;
    };
  }, [amLoser]);

  // Toujours les 6 réseaux, juste triés "installés d'abord" (rien n'est caché).
  const apps = useMemo(() => sortByInstalled(installed ?? []), [installed]);

  if (!state || !state.result) return null;
  const winners = state.result.winnerIds.map((id) => playerById(id)).filter(Boolean);
  const losers = state.result.loserIds.map((id) => playerById(id)).filter(Boolean);
  const winnerNames = winners.map((w) => w!.name).join(', ');
  const loserNames = losers.map((l) => l!.name).join(', ');
  const multiLosers = losers.length > 1;

  const pick = async (app: SocialApp) => {
    const ok = await openSocial(app);
    if (!ok) Alert.alert('Oups', `Impossible d'ouvrir ${app.label}.`);
  };

  return (
    <Screen scroll>
      <Text style={styles.kicker}>🏁 RÉSULTATS</Text>
      <Text style={styles.title}>FIN DE PARTIE</Text>
      {winners.length > 1 ? <Text style={styles.exaequo}>Gagnants ex aequo : {winnerNames}</Text> : null}

      <View style={{ height: spacing.xl }} />
      <Podium players={state.players} highlightId={myId} />

      {state.result.tie ? (
        <View style={styles.sentence}>
          <Text style={styles.lead}>Égalité parfaite !</Text>
          <Text style={styles.leadSub}>Personne ne perd ce soir. Une revanche ?</Text>
        </View>
      ) : (
        <>
          <View style={[styles.loserCard, { borderColor: colors.danger }]}>
            <Text style={styles.loserLabel}>{multiLosers ? 'LA SENTENCE POUR (EX AEQUO)' : 'LA SENTENCE POUR'}</Text>
            <Text style={[styles.loserName, { color: colors.danger }]}>{loserNames}</Text>
          </View>

          {amLoser ? (
            <View style={styles.sentence}>
              <Text style={styles.lead}>C'est toi le perdant !</Text>
              <Text style={styles.leadSub}>
                Donne ton téléphone à <Text style={{ color: colors.gold, fontWeight: font.black }}>{winnerNames}</Text> : il/elle
                choisit le réseau et écrit ce qu'il veut sur ton compte.
              </Text>
              <View style={styles.grid}>
                {apps.map((app) => (
                  <Pressable key={app.id} style={styles.appBtn} onPress={() => pick(app)}>
                    <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                      <FontAwesome5 name={app.icon as any} size={30} color={app.iconColor} />
                    </View>
                    <Text style={styles.appLabel}>{app.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.note}>Touche le réseau voulu pour l'ouvrir.</Text>
            </View>
          ) : (
            <View style={styles.sentence}>
              <Text style={styles.lead}>{multiLosers ? `${loserNames} : à vous le gage !` : `${loserNames} doit assumer`}</Text>
              <Text style={styles.leadSub}>La sentence se joue sur le téléphone {multiLosers ? 'de chaque perdant' : 'du perdant'}.</Text>
            </View>
          )}
        </>
      )}

      <View style={{ height: spacing.xl }} />
      {isHost ? <Button label="Rejouer (mêmes joueurs)" onPress={() => act({ type: 'PLAY_AGAIN' })} /> : <Text style={styles.note}>Le chef peut relancer une partie.</Text>}
      <View style={{ height: spacing.md }} />
      <Button label="Quitter" variant="outline" onPress={leave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.gold, fontWeight: font.black, letterSpacing: 3, fontSize: 13, textAlign: 'center' },
  title: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center', letterSpacing: 1, marginTop: spacing.xs },
  exaequo: { color: colors.gold, textAlign: 'center', marginTop: spacing.xs, fontWeight: font.semibold },
  loserCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, padding: spacing.lg, marginTop: spacing.xxl, alignItems: 'center' },
  loserLabel: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, fontSize: 11 },
  loserName: { fontSize: 28, fontWeight: font.black, marginTop: 2 },
  sentence: { marginTop: spacing.xl, alignItems: 'center' },
  lead: { color: colors.text, fontSize: 20, fontWeight: font.black, textAlign: 'center' },
  leadSub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
  loading: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
  loadingText: { color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.xl },
  appBtn: { alignItems: 'center', width: 84 },
  appIcon: { width: 64, height: 64, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  appLabel: { color: colors.text, fontSize: 13, fontWeight: font.semibold, marginTop: 6 },
  note: { color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.md, lineHeight: 18 },
});
