import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { SOCIAL_APPS, type SocialApp } from '../data/socialApps';
import { useGame } from '../game/GameContext';
import { useExit } from '../components/ExitContext';
import type { SocialId } from '../types';
import { detectInstalled, openSocial } from '../utils/social';
import { colors, font, radius, spacing } from '../theme';

export default function FinaleScreen() {
  const { state, dispatch, playerById } = useGame();
  const exit = useExit();
  const [installed, setInstalled] = useState<SocialId[] | null>(null);

  useEffect(() => {
    let active = true;
    detectInstalled().then((ids) => active && setInstalled(ids));
    return () => {
      active = false;
    };
  }, []);

  const winner = playerById(state.result?.winnerId);
  const loser = playerById(state.result?.loserId);

  // Show detected apps; if detection found nothing (e.g. Expo Go), show all six.
  const { apps, fallback } = useMemo(() => {
    if (installed && installed.length > 0) {
      return { apps: SOCIAL_APPS.filter((a) => installed.includes(a.id)), fallback: false };
    }
    if (installed && installed.length === 0) {
      return { apps: SOCIAL_APPS, fallback: true };
    }
    return { apps: [] as SocialApp[], fallback: false };
  }, [installed]);

  const pick = async (app: SocialApp) => {
    const ok = await openSocial(app);
    if (!ok) Alert.alert('Oups', `Impossible d'ouvrir ${app.label} sur ce téléphone.`);
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>FIN DE PARTIE</Text>
      {state.result?.tie ? <Text style={styles.tie}>Égalité parfaite… le sort a tranché 🎲</Text> : null}

      <View style={[styles.podium, { borderColor: colors.gold }]}>
        {/* <Text style={styles.podiumEmoji}>🏆</Text> */}
        <View style={styles.podiumInfo}>
          <Text style={styles.podiumLabel}>GAGNANT·E</Text>
          <Text style={[styles.podiumName, { color: colors.gold }]}>{winner?.name}</Text>
          <Text style={styles.podiumMalus}>{winner?.malus} malus — le moins puni</Text>
        </View>
      </View>

      <View style={[styles.podium, { borderColor: colors.danger }]}>
        {/* <Text style={styles.podiumEmoji}>💀</Text> */}
        <View style={styles.podiumInfo}>
          <Text style={styles.podiumLabel}>PERDANT·E</Text>
          <Text style={[styles.podiumName, { color: colors.danger }]}>{loser?.name}</Text>
          <Text style={styles.podiumMalus}>{loser?.malus} malus — la sentence</Text>
        </View>
      </View>

      <View style={styles.sentence}>
        <Text style={styles.sentenceLead}>
          <Text style={{ color: colors.gold, fontWeight: font.black }}>{winner?.name}</Text>, prends le téléphone de{' '}
          <Text style={{ color: colors.danger, fontWeight: font.black }}>{loser?.name}</Text> 📱
        </Text>
        <Text style={styles.sentenceSub}>Choisis le réseau, ouvre l'appli et écris ce que tu veux à sa place 😈</Text>
      </View>

      {installed === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Détection des réseaux installés…</Text>
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
          {fallback ? (
            <Text style={styles.note}>
              Détection auto indisponible ici (Expo Go). Tous les réseaux sont affichés — fonctionne précisément dans
              un build de l'app.
            </Text>
          ) : null}
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
  title: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center', letterSpacing: 1 },
  tie: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, fontStyle: 'italic' },

  podium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  podiumEmoji: { fontSize: 42 },
  podiumInfo: { flex: 1 },
  podiumLabel: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, fontSize: 11 },
  podiumName: { fontSize: 30, fontWeight: font.black },
  podiumMalus: { color: colors.textFaint, fontSize: 13, marginTop: 2 },

  sentence: { marginTop: spacing.xl, alignItems: 'center' },
  sentenceLead: { color: colors.text, fontSize: 19, fontWeight: font.semibold, textAlign: 'center', lineHeight: 26 },
  sentenceSub: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },

  loading: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm },
  loadingText: { color: colors.textMuted },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  appBtn: { alignItems: 'center', width: 84 },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  appLabel: { color: colors.text, fontSize: 13, fontWeight: font.semibold, marginTop: 6 },
  note: { color: colors.textFaint, fontSize: 12, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
});
