import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, font, radius, spacing } from '../theme';
import { tap } from '../utils/haptics';
import { playClick } from '../utils/sound';

type Variant = 'primary' | 'accent' | 'success' | 'danger' | 'outline' | 'ghost' | 'gold';
type Size = 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  block?: boolean; // true (défaut) = pleine largeur du conteneur ; false = largeur du contenu
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  icon,
  iconPosition = 'left',
  block = true,
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const isFlat = variant === 'outline' || variant === 'ghost';
  const inactive = disabled || loading;
  const fg = FG[variant];

  const press = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, friction: 6, tension: 220 }).start();

  return (
    <AnimatedPressable
      onPress={() => {
        if (inactive) return;
        tap();
        playClick();
        onPress();
      }}
      onPressIn={() => !inactive && press(0.95)}
      onPressOut={() => press(1)}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      accessibilityLabel={label}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        block ? styles.block : styles.auto,
        { backgroundColor: BG[variant], transform: [{ scale }] },
        !isFlat && styles.shadow,
        variant === 'outline' && { borderWidth: 2, borderColor: colors.border },
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' ? <Ionicons name={icon} size={size === 'lg' ? 20 : 17} color={fg} /> : null}
          <Text style={[styles.label, size === 'lg' ? styles.labelLg : styles.labelMd, { color: fg }]} numberOfLines={1}>
            {label}
          </Text>
          {icon && iconPosition === 'right' ? <Ionicons name={icon} size={size === 'lg' ? 20 : 17} color={fg} /> : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  block: { alignSelf: 'stretch' },
  auto: { alignSelf: 'center' },
  // Padding horizontal généreux : le texte ne colle plus aux bords.
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl, minHeight: 56 },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 44 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  disabled: { opacity: 0.4 },
  label: { fontWeight: font.bold, letterSpacing: 0.3 },
  labelLg: { fontSize: 18 },
  labelMd: { fontSize: 15 },
});
