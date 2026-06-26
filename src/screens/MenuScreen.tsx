import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppLogo from '../components/AppLogo';
import Button from '../components/Button';
import Screen from '../components/Screen';
import SoundToggle from '../components/SoundToggle';
import { startMusic } from '../utils/sound';
import { colors, font, spacing } from '../theme';

export default function MenuScreen({
  onLocal,
  onOnline,
  onTerms,
}: {
  onLocal: () => void;
  onOnline: () => void;
  onTerms: () => void;
}) {
  useEffect(() => {
    startMusic();
  }, []);

  return (
    <Screen center>
      <SoundToggle style={styles.soundToggle} />
      <View style={styles.brand}>
        <AppLogo size={140} />
        <Text style={styles.title}>
          ACTION <Text style={styles.ou}>ou</Text> VÉRITÉ HARDCORE
        </Text>
      </View>

      <Text style={styles.tagline}>Une roulette te désigne. Le perdant finit avec un post écrit par le gagnant.</Text>
      <View style={styles.actions}>
        <Button label="Partie locale" onPress={onLocal} />
        <View style={{ height: spacing.md }} />
        <Button label="Partie en ligne" variant="accent" onPress={onOnline} />
      </View>

      <Pressable onPress={onTerms} hitSlop={8}>
        <Text style={styles.footer}>Conditions d'utilisation</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  soundToggle: { position: 'absolute', top: spacing.lg, right: spacing.lg },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 30, fontWeight: font.black, letterSpacing: 1, marginTop: spacing.lg, textAlign: 'center' },
  ou: { color: colors.textMuted, fontSize: 22 },
  badge: { marginTop: spacing.md, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 999 },
  badgeText: { color: colors.white, fontWeight: font.black, letterSpacing: 2, fontSize: 14 },
  tagline: { color: colors.textMuted, textAlign: 'center', fontSize: 16, lineHeight: 23, marginBottom: spacing.xxl },
  actions: { alignSelf: 'stretch' },
  footer: { color: colors.textFaint, textAlign: 'center', marginTop: spacing.xl, fontSize: 12 },
});
