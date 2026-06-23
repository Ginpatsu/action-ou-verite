import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius } from '../theme';
import { heavy, success } from '../utils/haptics';

const ROW_H = 70;
const VISIBLE = 3; // rows shown in the window
const CYCLES = 8; // how many times the list repeats in the reel

type Props = {
  items: string[]; // display names, in player order
  winnerIndex: number; // index in `items` the reel must land on
  anonymous?: boolean; // mask names with "?" (used for the secret author roulette)
  durationMs?: number;
  accent?: string;
  onDone?: () => void;
};

// Vertical slot-machine reel that decelerates onto `winnerIndex`.
export default function Roulette({ items, winnerIndex, anonymous, durationMs = 3200, accent = colors.primary, onDone }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const reel = useMemo(() => {
    const out: string[] = [];
    for (let c = 0; c < CYCLES; c += 1) {
      for (let i = 0; i < items.length; i += 1) out.push(items[i]);
    }
    return out;
  }, [items]);

  // Land on a winner copy a couple of cycles before the end (trailing buffer).
  const finalIndex = items.length * (CYCLES - 2) + winnerIndex;
  const target = -(finalIndex - 1) * ROW_H; // centers finalIndex in the 3-row window

  useEffect(() => {
    translateY.setValue(0);
    heavy();
    const anim = Animated.timing(translateY, {
      toValue: target,
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) {
        success();
        onDoneRef.current?.();
      }
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return (
    <View style={[styles.window, { height: ROW_H * VISIBLE }]}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {reel.map((name, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {anonymous ? '?' : name}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* center highlight */}
      <View pointerEvents="none" style={[styles.highlight, { top: ROW_H, height: ROW_H, borderColor: accent }]} />
      {/* fade masks */}
      <View pointerEvents="none" style={[styles.fade, styles.fadeTop]} />
      <View pointerEvents="none" style={[styles.fade, styles.fadeBottom]} />
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { height: ROW_H, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  name: { color: colors.text, fontSize: 28, fontWeight: font.black, letterSpacing: 0.5 },
  highlight: {
    position: 'absolute',
    left: 8,
    right: 8,
    borderWidth: 2,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  fade: { position: 'absolute', left: 0, right: 0, height: ROW_H * 0.9 },
  fadeTop: { top: 0, backgroundColor: colors.surface, opacity: 0.55 },
  fadeBottom: { bottom: 0, backgroundColor: colors.surface, opacity: 0.55 },
});
