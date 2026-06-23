import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AppLogo from '../../components/AppLogo';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import { useOnline } from '../../online/OnlineContext';
import { colors, font, radius, spacing } from '../../theme';

export default function OnlineEntryScreen({ onBack }: { onBack: () => void }) {
  const { configured, createRoom, join } = useOnline();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  if (!configured) {
    return (
      <Screen scroll center>
        <Text style={styles.emoji}>🔌</Text>
        <Text style={styles.h1}>Serveur de jeu introuvable</Text>
        <Text style={styles.help}>
          L'adresse du serveur n'a pas pu être détectée automatiquement (mode tunnel ou web ?).
        </Text>
        <View style={styles.steps}>
          <Text style={styles.step}>1. Lance le serveur sur ton PC : <Text style={styles.code}>docker compose up -d --build</Text></Text>
          <Text style={styles.step}>2. Mets les téléphones sur le MÊME Wi-Fi que le PC, puis lance <Text style={styles.code}>npx expo start</Text> (mode LAN).</Text>
          <Text style={styles.step}>
            3. Sinon force l'adresse via <Text style={styles.code}>EXPO_PUBLIC_GAME_SERVER=ws://IP_DU_PC:8787</Text>
          </Text>
        </View>
        <View style={{ height: spacing.xl }} />
        <Button label="‹ Retour" variant="outline" onPress={onBack} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Accueil</Text>
        </Pressable>
        <View style={styles.brand}>
          <AppLogo size={84} />
          <Text style={styles.title}>Partie en ligne</Text>
          <Text style={styles.sub}>Plusieurs téléphones, une même partie.</Text>
        </View>

        <Text style={styles.label}>Ton pseudo</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Prénom ou pseudo"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          maxLength={18}
          autoCapitalize="words"
        />

        <View style={{ height: spacing.lg }} />
        <Button label="🎮 Créer une partie" disabled={!name.trim()} onPress={() => createRoom(name)} />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>ou rejoindre</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.label}>Code de la partie</Text>
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="ABCD"
          placeholderTextColor={colors.textFaint}
          style={[styles.input, styles.codeInput]}
          maxLength={4}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <View style={{ height: spacing.lg }} />
        <Button
          label="📲 Rejoindre"
          variant="accent"
          disabled={!name.trim() || code.trim().length < 4}
          onPress={() => join(code, name)}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.textMuted, fontSize: 16, fontWeight: font.semibold, marginBottom: spacing.md },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 26, fontWeight: font.black, marginTop: spacing.md },
  sub: { color: colors.textMuted, fontSize: 15, marginTop: spacing.xs },
  label: { color: colors.textMuted, fontWeight: font.bold, fontSize: 13, letterSpacing: 1, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 18,
    fontWeight: font.semibold,
  },
  codeInput: { fontSize: 28, fontWeight: font.black, letterSpacing: 10, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textFaint, fontWeight: font.semibold },
  emoji: { fontSize: 50, textAlign: 'center' },
  h1: { color: colors.text, fontSize: 24, fontWeight: font.black, textAlign: 'center', marginTop: spacing.md },
  help: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
  steps: { marginTop: spacing.lg, gap: spacing.sm, alignSelf: 'stretch' },
  step: { color: colors.text, fontSize: 14, lineHeight: 20 },
  code: { color: colors.accent, fontWeight: font.bold },
});
