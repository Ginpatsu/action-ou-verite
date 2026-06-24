import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import { SOCIAL_APPS, type SocialApp } from '../../data/socialApps';
import { useOnline } from '../../online/OnlineContext';
import type { SocialId } from '../../types';
import { detectInstalled, openSocial } from '../../utils/social';
import { colors, font, radius, spacing } from '../../theme';

export default function OnlineFinaleScreen() {
  const { state, myId, isHost, act, leave, playerById } = useOnline();
  const [installed, setInstalled] = useState<SocialId[] | null>(null);

  const amLoser = myId === state?.result?.loserId;

  useEffect(() => {
    if (!amLoser) return;
    let active = true;
    detectInstalled().then((ids) => active && setInstalled(ids));
    return () => {
      active = false;
    };
  }, [amLoser]);

  const { apps, fallback } = useMemo(() => {
    if (installed && installed.length > 0) return { apps: SOCIAL_APPS.filter((a) => installed.includes(a.id)), fallback: false };
    if (installed && installed.length === 0) return { apps: SOCIAL_APPS, fallback: true };
    return { apps: [] as SocialApp[], fallback: false };
  }, [installed]);

  if (!state || !state.result) return null;
  const winner = playerById(state.result.winnerId);
  const loser = playerById(state.result.loserId);

  const pick = async (app: SocialApp) => {
    const ok = await openSocial(app);
    if (!ok) Alert.alert('Oups', `Impossible d'ouvrir ${app.label}.`);
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>FIN DE PARTIE</Text>
      {state.result.tie ? <Text style={styles.tie}>Égalité… le sort a tranché 🎲</Text> : null}

      <View style={[styles.podium, { borderColor: colors.gold }]}>
        {/* <Text style={styles.podiumEmoji}>🏆</Text> */}
        <View style={{ flex: 1 }}>
          <Text style={styles.podiumLabel}>GAGNANT·E</Text>
          <Text style={[styles.podiumName, { color: colors.gold }]}>{winner?.name}</Text>
        </View>
      </View>
      <View style={[styles.podium, { borderColor: colors.danger }]}>
        {/* <Text style={styles.podiumEmoji}>💀</Text> */}
        <View style={{ flex: 1 }}>
          <Text style={styles.podiumLabel}>PERDANT·E</Text>
          <Text style={[styles.podiumName, { color: colors.danger }]}>{loser?.name}</Text>
        </View>
      </View>

      {amLoser ? (
        <View style={styles.sentence}>
          <Text style={styles.lead}>😈 C'est toi le perdant !</Text>
          <Text style={styles.leadSub}>
            Donne ton téléphone à <Text style={{ color: colors.gold, fontWeight: font.black }}>{winner?.name}</Text> : il/elle
            choisit le réseau et écrit ce qu'il veut sur ton compte.
          </Text>
          {installed === null ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.loadingText}>Détection des réseaux…</Text>
            </View>
          ) : (
            <>
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
              {fallback ? <Text style={styles.note}>Détection auto indisponible (Expo Go) — réseaux tous affichés.</Text> : null}
            </>
          )}
        </View>
      ) : (
        <View style={styles.sentence}>
          <Text style={styles.lead}>
            {loser?.name} donne son téléphone à {winner?.name} 📱
          </Text>
          <Text style={styles.leadSub}>La sentence se joue sur le téléphone du perdant.</Text>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
      {isHost ? <Button label="Rejouer (mêmes joueurs)" onPress={() => act({ type: 'PLAY_AGAIN' })} /> : <Text style={styles.note}>Le chef peut relancer une partie.</Text>}
      <View style={{ height: spacing.md }} />
      <Button label="Quitter" variant="outline" onPress={leave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center', letterSpacing: 1 },
  tie: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, fontStyle: 'italic' },
  podium: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, padding: spacing.lg, marginTop: spacing.lg, gap: spacing.lg },
  podiumEmoji: { fontSize: 42 },
  podiumLabel: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, fontSize: 11 },
  podiumName: { fontSize: 30, fontWeight: font.black },
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
