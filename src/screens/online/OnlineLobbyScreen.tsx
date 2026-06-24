import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Screen from '../../components/Screen';
import { MAX_MANCHES, MIN_PLAYERS_ONLINE } from '../../game/onlineReducer';
import { useOnline } from '../../online/OnlineContext';
import { colors, font, radius, spacing } from '../../theme';

export default function OnlineLobbyScreen() {
  const { state, session, isHost, myId, act, leave, status } = useOnline();
  if (!state || !session) return null;
  const canStart = state.players.length >= MIN_PLAYERS_ONLINE;

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Pressable onPress={leave} hitSlop={12}>
          <Text style={styles.back}>‹ Quitter</Text>
        </Pressable>
        <View style={styles.codePill}>
          <Text style={styles.codeLabel}>CODE À PARTAGER</Text>
          <Text style={styles.code}>{session.code}</Text>
        </View>
      </View>

      {status !== 'connected' ? <Text style={styles.status}>● connexion… ({status})</Text> : null}

      <Text style={styles.h1}>Salon en ligne</Text>
      <Text style={styles.help}>
        {isHost
          ? 'Donne le code à tes amis !'
          : 'En attente que le chef lance la partie…'}
      </Text>

      <View style={styles.list}>
        {state.players.map((p, i) => (
          <View key={p.id} style={styles.playerRow}>
            <Text style={styles.playerIndex}>{i + 1}</Text>
            <Text style={styles.playerName} numberOfLines={1}>
              {p.name}
              {p.isChef ? ' (chef)' : ''}
              {p.id === myId ? ' (toi)' : ''}
            </Text>
            {isHost && p.id !== myId ? (
              <Pressable onPress={() => act({ type: 'REMOVE_PLAYER', id: p.id })} hitSlop={10}>
                <Text style={styles.kick}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      {isHost ? (
        <>
          <Text style={styles.h2}>Nombre de manches</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={() => act({ type: 'SET_MANCHES', n: state.totalManches - 1 })}>
              <Text style={styles.stepSign}>−</Text>
            </Pressable>
            <Text style={styles.stepValue}>{state.totalManches}</Text>
            <Pressable style={styles.stepBtn} onPress={() => act({ type: 'SET_MANCHES', n: state.totalManches + 1 })}>
              <Text style={styles.stepSign}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.help}>1 manche = 1 personne désignée par la roulette.</Text>
          <Text style={styles.help}> Maximum de manches {MAX_MANCHES} possibles.</Text>

          <View style={{ height: spacing.xl }} />
          <Button
            label={canStart ? 'Lancer la partie' : `En attente de joueurs (${state.players.length}/${MIN_PLAYERS_ONLINE})`}
            onPress={() => act({ type: 'START_GAME' })}
            disabled={!canStart}
          />
        </>
      ) : (
        <View style={styles.waiting}>
          <Text style={styles.waitingText}>{state.totalManches} manches prévues</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  back: { color: colors.textMuted, fontSize: 16, fontWeight: font.semibold },
  codePill: { alignItems: 'flex-end' },
  codeLabel: { color: colors.textFaint, fontSize: 10, fontWeight: font.bold, letterSpacing: 2 },
  code: { color: colors.primary, fontSize: 26, fontWeight: font.black, letterSpacing: 6 },
  status: { color: colors.warning, fontSize: 13, marginBottom: spacing.sm },
  h1: { color: colors.text, fontSize: 28, fontWeight: font.black },
  h2: { color: colors.text, fontSize: 20, fontWeight: font.bold, marginTop: spacing.xl, marginBottom: spacing.sm },
  help: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.xs, marginBottom: spacing.lg },
  list: { gap: spacing.sm, marginTop: spacing.md },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  playerIndex: { color: colors.textFaint, fontWeight: font.bold, width: 18 },
  playerName: { flex: 1, color: colors.text, fontSize: 18, fontWeight: font.bold },
  kick: { color: colors.danger, fontSize: 18, fontWeight: font.black, paddingHorizontal: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.lg },
  stepBtn: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  stepSign: { color: colors.text, fontSize: 28, fontWeight: font.black, lineHeight: 30 },
  stepValue: { color: colors.text, fontSize: 32, fontWeight: font.black, minWidth: 48, textAlign: 'center' },
  waiting: { marginTop: spacing.xl, alignItems: 'center' },
  waitingText: { color: colors.textMuted, fontSize: 16 },
});
