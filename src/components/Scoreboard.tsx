import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../game/GameContext';
import { colors, font, radius, spacing } from '../theme';

// Compact malus tally, sorted worst-first.
export default function Scoreboard({ title = 'Malus' }: { title?: string }) {
  const { state } = useGame();
  const players = [...state.players].sort((a, b) => b.malus - a.malus);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {players.map((p) => (
        <View key={p.id} style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {p.name}
            {p.isChef ? ' 👑' : ''}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{p.malus}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 1, fontSize: 12, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  name: { color: colors.text, fontSize: 16, fontWeight: font.semibold, flex: 1, marginRight: spacing.md },
  badge: {
    minWidth: 30,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  badgeText: { color: colors.primary, fontWeight: font.black, fontSize: 15 },
});
