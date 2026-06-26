import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import { tap } from '../utils/haptics';

// En-tête de partie unifié (local ET multijoueur) : pilule de manche bien
// contrastée, code de partie optionnel, et bouton "Quitter" identique partout
// (même libellé, même position, même style).
export default function GameHeader({
  manche,
  total,
  code,
  onQuit,
  quitLabel = 'Quitter',
}: {
  manche: number;
  total: number;
  code?: string | null;
  onQuit: () => void;
  quitLabel?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.manchePill}>
        <Ionicons name="dice" size={14} color={colors.white} />
        <Text style={styles.mancheText}>
          MANCHE {manche}/{total}
        </Text>
      </View>

      {code ? (
        <View style={styles.codeChip}>
          <Text style={styles.codeLabel}>CODE</Text>
          <Text style={styles.codeValue}>{code}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => {
          tap();
          onQuit();
        }}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={quitLabel}
        style={({ pressed }) => [styles.quit, pressed && styles.quitPressed]}
      >
        <Ionicons name="exit-outline" size={16} color={colors.danger} />
        <Text style={styles.quitText}>{quitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', marginBottom: spacing.md, gap: spacing.sm },
  manchePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  mancheText: { color: colors.white, fontWeight: font.black, letterSpacing: 1.5, fontSize: 13 },
  codeChip: { flexDirection: 'row', alignItems: 'baseline', gap: 5, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 4 },
  codeLabel: { color: colors.textFaint, fontSize: 9, fontWeight: font.bold, letterSpacing: 1.5 },
  codeValue: { color: colors.primary, fontSize: 15, fontWeight: font.black, letterSpacing: 2 },
  quit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  quitPressed: { opacity: 0.6 },
  quitText: { color: colors.danger, fontSize: 13, fontWeight: font.bold },
});
