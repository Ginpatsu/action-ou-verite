import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AppLogo from '../components/AppLogo';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { colors, font, spacing } from '../theme';

export default function MenuScreen({ onLocal, onOnline }: { onLocal: () => void; onOnline: () => void }) {
  return (
    <Screen center>
      <View style={styles.brand}>
        <AppLogo size={140} />
        <Text style={styles.title}>
          ACTION <Text style={styles.ou}>ou</Text> VÉRITÉ HARDCORE
        </Text>
{/*         <View style={styles.badge}>
          <Text style={styles.badgeText}>HARDCORE</Text>
        </View> */}
      </View>

{/*       <Text style={styles.tagline}>
        Une roulette te désigne. Le perdant finit avec un post écrit par le gagnant.
      </Text> */}
      <View style={styles.actions}>
        <Button label="Partie locale" onPress={onLocal} />
        <View style={{ height: spacing.md }} />
        <Button label="Partie en ligne" variant="accent" onPress={onOnline} />
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 30, fontWeight: font.black, letterSpacing: 1, marginTop: spacing.lg, textAlign: 'center' },
  ou: { color: colors.textMuted, fontSize: 22 },
  badge: { marginTop: spacing.md, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 999 },
  badgeText: { color: colors.white, fontWeight: font.black, letterSpacing: 2, fontSize: 14 },
  tagline: { color: colors.textMuted, textAlign: 'center', fontSize: 16, lineHeight: 23, marginBottom: spacing.xxl },
  actions: { alignSelf: 'stretch' },
  footer: { color: colors.textFaint, textAlign: 'center', marginTop: spacing.xl, fontSize: 12 },
});
