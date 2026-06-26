import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { Player } from '../types';
import { colors, font, radius, spacing } from '../theme';
import { heavy, tap } from '../utils/haptics';
import { playWin } from '../utils/sound';
import Confetti from './Confetti';

const MEDALS = [
  { color: colors.gold, height: 150 },
  { color: colors.silver, height: 112 },
  { color: colors.bronze, height: 92 },
];

// Affichage podium des 3 meilleurs (moins de malus = mieux), avec révélation
// progressive 3e -> 2e -> 1er et mise en avant du gagnant.
// - `celebrate` (défaut true) : confettis + son + haptique forte (écran final).
//   Mettre à false pour le classement en cours de partie (chaque manche).
// - `showRest` : affiche les joueurs au-delà du top 3 sous le podium.
export default function Podium({
  players,
  highlightId,
  celebrate = true,
  showRest = false,
}: {
  players: Player[];
  highlightId?: string | null;
  celebrate?: boolean;
  showRest?: boolean;
}) {
  // Classement : le moins de malus en tête.
  const all = [...players].sort((a, b) => a.malus - b.malus);
  const ranked = all.slice(0, 3);
  // Sous le podium : tous les autres joueurs (rang 4+), visibles en scrollant.
  const rest = all.slice(3);
  const reveal = useRef(ranked.map(() => new Animated.Value(0))).current;
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    // On révèle du dernier au premier pour faire monter la tension.
    const order = ranked.map((_, i) => i).reverse(); // ex: [2,1,0]
    const seq = order.map((rankIdx, step) =>
      Animated.timing(reveal[rankIdx], {
        toValue: 1,
        duration: 480,
        delay: step === 0 ? 250 : 220,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      })
    );
    let cancelled = false;
    Animated.sequence(seq).start(({ finished }) => {
      if (finished && !cancelled && celebrate) {
        heavy();
        playWin();
        setConfetti(true);
      }
    });
    // petit tic haptique à chaque palier (uniquement en mode célébration)
    const ticks = celebrate ? order.map((_, step) => setTimeout(() => tap(), 250 + step * 220)) : [];
    return () => {
      cancelled = true;
      ticks.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ordre d'affichage visuel : 2e à gauche, 1er au centre, 3e à droite.
  const layout = [1, 0, 2].filter((i) => i < ranked.length);

  return (
    <View style={styles.wrap}>
      {confetti ? <Confetti /> : null}
      <View style={styles.row}>
        {layout.map((rankIdx) => {
          const p = ranked[rankIdx];
          const medal = MEDALS[rankIdx];
          const isWinner = rankIdx === 0;
          const a = reveal[rankIdx];
          const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
          const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1], extrapolate: 'clamp' });
          return (
            <Animated.View key={p.id} style={[styles.col, { opacity: a, transform: [{ translateY }, { scale }] }]}>
              {isWinner ? <Ionicons name="trophy" size={26} color={colors.gold} style={styles.trophy} /> : null}
              <Text
                numberOfLines={1}
                style={[styles.name, { color: isWinner ? colors.gold : colors.text }, p.id === highlightId && styles.you]}
              >
                {p.name}
              </Text>
              <View
                style={[
                  styles.block,
                  { height: medal.height, borderColor: medal.color, backgroundColor: isWinner ? 'rgba(255,210,63,0.12)' : colors.surface },
                ]}
              >
                <View style={[styles.rankBadge, { backgroundColor: medal.color }]}>
                  <Text style={styles.rankNum}>{rankIdx + 1}</Text>
                </View>
                <Text style={styles.malus}>{p.malus} malus</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {showRest && rest.length > 0 ? (
        <View style={styles.rest}>
          {rest.map((p, i) => {
            const me = p.id === highlightId;
            return (
              <View key={p.id} style={[styles.restRow, me && styles.restRowMe]}>
                <Text style={styles.restRank} numberOfLines={1}>
                  {i + 4}
                </Text>
                <Text style={[styles.restName, me && { color: colors.accent }]} numberOfLines={1}>
                  {p.name}
                  {me ? ' (toi)' : ''}
                </Text>
                <View style={styles.restBadge}>
                  <Text style={styles.restBadgeText}>{p.malus}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: spacing.sm },
  col: { flex: 1, maxWidth: 130, alignItems: 'center' },
  trophy: { marginBottom: 2 },
  name: { fontSize: 16, fontWeight: font.black, marginBottom: spacing.xs, maxWidth: '100%' },
  you: { textDecorationLine: 'underline' },
  block: {
    alignSelf: 'stretch',
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  rankBadge: { width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  rankNum: { color: colors.black, fontSize: 18, fontWeight: font.black },
  malus: { color: colors.textMuted, fontSize: 12, fontWeight: font.semibold },
  rest: { alignSelf: 'stretch', marginTop: spacing.lg, gap: spacing.xs },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  restRowMe: { backgroundColor: colors.surfaceAlt },
  restRank: { color: colors.textFaint, fontWeight: font.black, fontSize: 14, minWidth: 26, textAlign: 'center' },
  restName: { color: colors.text, fontSize: 15, fontWeight: font.semibold, flex: 1 },
  restBadge: { minWidth: 28, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: colors.surfaceAlt, alignItems: 'center' },
  restBadgeText: { color: colors.primary, fontWeight: font.black, fontSize: 14 },
});
