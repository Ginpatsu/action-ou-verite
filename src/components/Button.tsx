import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import { tap } from '../utils/haptics';

type Variant = 'primary' | 'accent' | 'success' | 'danger' | 'outline' | 'ghost' | 'gold';
type Size = 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

const BG: Record<Variant, string> = {
  primary: colors.primary,
  accent: colors.accent,
  success: colors.success,
  danger: colors.danger,
  gold: colors.gold,
  outline: 'transparent',
  ghost: 'transparent',
};

const FG: Record<Variant, string> = {
  primary: colors.white,
  accent: colors.white,
  success: colors.black,
  danger: colors.white,
  gold: colors.black,
  outline: colors.text,
  ghost: colors.textMuted,
};

export default function Button({ label, onPress, variant = 'primary', size = 'lg', disabled, loading, style }: Props) {
  const isFlat = variant === 'outline' || variant === 'ghost';
  return (
    <Pressable
      onPress={() => {
        if (disabled || loading) return;
        tap();
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: BG[variant] },
        variant === 'outline' && { borderWidth: 2, borderColor: colors.border },
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={FG[variant]} />
      ) : (
        <Text style={[styles.label, size === 'lg' ? styles.labelLg : styles.labelMd, { color: FG[variant] }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { paddingVertical: spacing.lg + 2, paddingHorizontal: spacing.xl },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  label: { fontWeight: font.bold, letterSpacing: 0.3 },
  labelLg: { fontSize: 18 },
  labelMd: { fontSize: 15 },
});
