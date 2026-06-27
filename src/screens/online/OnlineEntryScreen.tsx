import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AppLogo from '../../components/AppLogo';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import { useOnline } from '../../online/OnlineContext';
import { getSavedPseudo } from '../../utils/identity';
import { startMusic } from '../../utils/sound';
import { colors, font, radius, spacing } from '../../theme';

// Écran d'entrée du mode en ligne : configurer le serveur (1re fois / build),
// puis créer ou rejoindre une partie.
export default function OnlineEntryScreen({ onBack }: { onBack: () => void }) {
  const { configured, serverUrl, setServer, createRoom, join } = useOnline();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editingServer, setEditingServer] = useState(false);
  const [serverInput, setServerInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const codeFocused = useRef(false);
  const codeY = useRef(0); // position verticale du champ code dans la page
  const [codeActive, setCodeActive] = useState(false);

  // Fait remonter le champ code juste sous le haut de la zone visible, donc
  // au-dessus du clavier (peu importe la hauteur du clavier).
  const scrollToCode = () => scrollRef.current?.scrollTo({ y: Math.max(0, codeY.current - 90), animated: true });

  useEffect(() => {
    getSavedPseudo().then((saved) => saved && setName(saved));
    startMusic();
  }, []);

  // Quand le clavier s'ouvre alors que le champ "code" est actif, on défile vers
  // lui pour qu'il (et ce qu'on tape) reste visible. On attend keyboardDidShow
  // pour que la fenêtre soit déjà redimensionnée.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (codeFocused.current) scrollToCode();
    });
    return () => sub.remove();
  }, []);

  // Pré-remplit le champ avec l'adresse connue quand on ouvre l'éditeur serveur.
  useEffect(() => {
    if (editingServer || !configured) setServerInput(serverUrl);
  }, [editingServer, configured, serverUrl]);

  const saveServer = () => {
    setServer(serverInput);
    setEditingServer(false);
  };

  // Formulaire d'adresse serveur : affiché si non configuré (cas d'un BUILD, où
  // il n'y a pas de Metro pour deviner l'IP) ou si on clique sur "Modifier".
  if (!configured || editingServer) {
    return (
      <Screen scroll center>
        <Text style={styles.title}>Adresse du serveur</Text>
        <Text style={styles.help}>
          Entre l'IP du PC qui fait tourner le serveur (docker compose up). Les téléphones doivent être sur le même
          Wi-Fi que ce PC.
        </Text>
        <View style={{ height: spacing.lg }} />
        <TextInput
          value={serverInput}
          onChangeText={setServerInput}
          placeholder="192.168.1.20"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>IP, IP:port, ou ws://… (port 8787 par défaut)</Text>
        <View style={{ height: spacing.lg }} />
        <Button label="Enregistrer" disabled={!serverInput.trim()} onPress={saveServer} />
        <View style={{ height: spacing.md }} />
        <Button label="‹ Retour" variant="outline" onPress={() => (configured ? setEditingServer(false) : onBack())} />
      </Screen>
    );
  }

  return (
    <Screen scroll scrollRef={scrollRef}>
      <>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>‹ Accueil</Text>
        </Pressable>
        <View style={styles.brand}>
          <AppLogo size={84} />
          <Text style={styles.title}>Partie en ligne</Text>
        </View>

{/*         <Pressable onPress={() => setEditingServer(true)} style={styles.serverRow}>
          <Text style={styles.serverText} numberOfLines={1}>
            Serveur : {serverUrl}
          </Text>
          <Text style={styles.serverEdit}>Modifier</Text>
        </Pressable> */}

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
        <Button label="Créer une partie" disabled={!name.trim()} onPress={() => createRoom(name)} />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>ou rejoindre une partie</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.label}>Code de la partie</Text>
        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))}
          placeholder="1234"
          placeholderTextColor={colors.textFaint}
          style={[styles.input, styles.codeInput]}
          maxLength={4}
          keyboardType="number-pad"
          autoCorrect={false}
          onLayout={(e) => {
            codeY.current = e.nativeEvent.layout.y;
          }}
          onFocus={() => {
            codeFocused.current = true;
            setCodeActive(true);
            setTimeout(scrollToCode, 250);
          }}
          onBlur={() => {
            codeFocused.current = false;
            setCodeActive(false);
          }}
        />
        <View style={{ height: spacing.lg }} />
        <Button
          label="Rejoindre"
          variant="accent"
          disabled={!name.trim() || code.trim().length < 4}
          onPress={() => join(code, name)}
        />
        <View style={styles.brand}>

          <Text style={styles.sub}>Plusieurs téléphones pour une même partie.</Text>
        </View>

        {codeActive && <View style={{ height: 200 }} />}
      </>

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.textMuted, fontSize: 16, fontWeight: font.semibold, marginBottom: spacing.md },
  brand: { alignItems: 'center', marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 26, fontWeight: font.black, marginTop: spacing.md, textAlign: 'center' },
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
  help: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
  hint: { color: colors.textFaint, fontSize: 12, marginTop: spacing.sm },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  serverText: { color: colors.textMuted, fontSize: 13, flex: 1 },
  serverEdit: { color: colors.accent, fontWeight: font.bold, fontSize: 13 },
});
