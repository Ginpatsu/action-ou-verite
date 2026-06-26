import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius } from '../theme';
import { heavy, success, tap } from '../utils/haptics';
import { playSpin, playTick, playWin } from '../utils/sound';

const ROW_H = 74;
const VISIBLE = 3; // rows shown in the window
const CYCLES = 16; // how many times the list repeats in the reel (long travel = vitesse + suspense)

// Phases de l'animation : démarrage rapide -> longue glisse qui décélère ->
// petit dépassement puis rebond de calage. Total court = sensation de vitesse,
// le rebond final crée l'effet de surprise et empêche de "deviner" trop tôt.
const ACCEL_MS = 420;
const GLIDE_MS = 1750;
const SETTLE_MS = 520;
const TICK_MIN_GAP = 55; // ms : en deçà (rotation rapide) on n'émet pas de tick

type Props = {
  items: string[]; // display names, in player order
  winnerIndex: number; // index in `items` the reel must land on
  anonymous?: boolean; // mask names with "?" (used for the secret author roulette)
  accent?: string;
  onDone?: () => void;
};

// Vertical slot-machine reel that accelerates, glides, then bounces onto `winnerIndex`.
export default function Roulette({ items, winnerIndex, anonymous, accent = colors.primary, onDone }: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current; // éclair blanc au calage
  const pop = useRef(new Animated.Value(0)).current; // pulsation du cadre + nom gagnant
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
  const overshoot = target - ROW_H * 0.5; // on dépasse d'un demi-cran avant de revenir

  useEffect(() => {
    translateY.setValue(0);
    flash.setValue(0);
    pop.setValue(0);

    // Ticks haptiques + sonores qui ralentissent naturellement : on n'émet que si
    // l'écart entre deux crans franchis dépasse TICK_MIN_GAP (donc seulement quand
    // la roue ralentit), ce qui imite le "clic-clic-clic" qui s'espace.
    let lastIdx = Math.round(0);
    let lastTickAt = 0;
    const listenerId = translateY.addListener(({ value }) => {
      const idx = Math.round(-value / ROW_H);
      if (idx !== lastIdx) {
        const now = Date.now();
        if (now - lastTickAt > TICK_MIN_GAP) {
          lastTickAt = now;
          tap();
          playTick();
        }
        lastIdx = idx;
      }
    });

    heavy();
    playSpin();

    const anim = Animated.sequence([
      // 1. Démarrage vif (accélération)
      Animated.timing(translateY, {
        toValue: target * 0.5,
        duration: ACCEL_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      // 2. Longue glisse qui décélère, un poil au-delà du gagnant
      Animated.timing(translateY, {
        toValue: overshoot,
        duration: GLIDE_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 3. Rebond de calage sur le gagnant exact (effet de surprise)
      Animated.spring(translateY, {
        toValue: target,
        useNativeDriver: true,
        friction: 5.5,
        tension: 70,
      }),
    ]);

    anim.start(({ finished }) => {
      if (!finished) return;
      success();
      playWin();
      // Effet de sélection : éclair + pulsation du cadre et du nom.
      Animated.parallel([
        Animated.sequence([
          Animated.timing(flash, { toValue: 1, duration: 90, useNativeDriver: true }),
          Animated.timing(flash, { toValue: 0, duration: 420, useNativeDriver: true }),
        ]),
        Animated.spring(pop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }),
      ]).start(() => onDoneRef.current?.());
    });

    return () => {
      anim.stop();
      translateY.removeListener(listenerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const popScale = pop.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06], extrapolate: 'clamp' });

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

      {/* center highlight (pulse au calage) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.highlight,
          { top: ROW_H, height: ROW_H, borderColor: accent, transform: [{ scale: popScale }] },
        ]}
      />
      {/* éclair de sélection */}
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] }) }]} />
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
    borderWidth: 2.5,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  flash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.white },
  fade: { position: 'absolute', left: 0, right: 0, height: ROW_H * 0.9 },
  fadeTop: { top: 0, backgroundColor: colors.surface, opacity: 0.55 },
  fadeBottom: { bottom: 0, backgroundColor: colors.surface, opacity: 0.55 },
});
