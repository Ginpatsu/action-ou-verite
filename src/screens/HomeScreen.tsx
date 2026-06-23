import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, spacing } from '../theme';

export default function HomeScreen() {
  const { dispatch } = useGame();
  return (
    <Screen center>
      <View style={styles.brand}>
        <Text style={styles.kicker}>LE JEU</Text>
        <Text style={styles.title}>ACTION</Text>
        <Text style={styles.or}>ou</Text>
        <Text style={styles.title}>VÉRITÉ</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>HARDCORE 🔥</Text>
        </View>
      </View>

      <Text style={styles.tagline}>
        Une roulette te désigne. Un auteur anonyme décide de ton sort. Le perdant finit avec un post écrit par le gagnant.
      </Text>

      <View style={styles.actions}>
        <Button label="Nouvelle partie" onPress={() => dispatch({ type: 'GO_LOBBY' })} />
      </View>

      <Text style={styles.footer}>Partie locale · on se passe le téléphone</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 6, marginBottom: spacing.sm },
  title: { color: colors.text, fontSize: 56, fontWeight: font.black, lineHeight: 58, letterSpacing: 1 },
  or: { color: colors.primary, fontSize: 26, fontWeight: font.black, marginVertical: 2 },
  badge: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  badgeText: { color: colors.white, fontWeight: font.black, letterSpacing: 2, fontSize: 14 },
  tagline: { color: colors.textMuted, textAlign: 'center', fontSize: 16, lineHeight: 23, marginBottom: spacing.xxl },
  actions: { alignSelf: 'stretch' },
  footer: { color: colors.textFaint, textAlign: 'center', marginTop: spacing.xl, fontSize: 13 },
});
