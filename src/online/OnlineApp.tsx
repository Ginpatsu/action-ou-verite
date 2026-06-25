import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import OnlineEntryScreen from '../screens/online/OnlineEntryScreen';
import OnlineLobbyScreen from '../screens/online/OnlineLobbyScreen';
import OnlinePlayScreen from '../screens/online/OnlinePlayScreen';
import OnlineFinaleScreen from '../screens/online/OnlineFinaleScreen';
import { OnlineProvider, useOnline } from './OnlineContext';
import { colors, font, spacing } from '../theme';

const ERR: Record<string, string> = {
  'not-found': 'Partie introuvable. Vérifie le code.',
  full: 'Cette partie est pleine.',
};

function OnlineRouter() {
  const { session, state, status, error, leave } = useOnline();

  if (!session) return <OnlineEntryScreen onBack={leave} />;

  // Écran d'attente (surtout côté client) : couvre aussi le "cold start" du
  // serveur gratuit, qui peut mettre ~30 s à se réveiller au 1er appel.
  if (!state) {
    return (
      <Screen center>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.connecting}>Connexion à la partie {session.code}…</Text>
        <Text style={styles.cold}>Le serveur gratuit peut mettre ~30 s à se réveiller la 1re fois.</Text>
        {status === 'error' ? <Text style={styles.err}>{(error && ERR[error]) || 'Connexion impossible.'}</Text> : null}
        <View style={{ height: spacing.xl }} />
        <Button label="Annuler" variant="outline" onPress={leave} />
      </Screen>
    );
  }

  switch (state.phase) {
    case 'lobby':
      return <OnlineLobbyScreen />;
    case 'finale':
      return <OnlineFinaleScreen />;
    default:
      return <OnlinePlayScreen />;
  }
}

export default function OnlineApp({ onExit }: { onExit: () => void }) {
  return (
    <OnlineProvider onExit={onExit}>
      <OnlineRouter />
    </OnlineProvider>
  );
}

const styles = StyleSheet.create({
  connecting: { color: colors.text, fontSize: 18, fontWeight: font.semibold, marginTop: spacing.lg, textAlign: 'center' },
  cold: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm, textAlign: 'center', lineHeight: 19 },
  err: { color: colors.danger, marginTop: spacing.sm, textAlign: 'center' },
});
