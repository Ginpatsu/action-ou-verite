import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { MAX_MANCHES, MAX_PLAYERS, MIN_PLAYERS, useGame } from '../game/GameContext';
import { useExit } from '../components/ExitContext';
import { colors, font, radius, spacing } from '../theme';

// Salon de la partie LOCALE (pass-the-phone) : on ajoute les joueurs sur ce
// téléphone, on règle le nombre de manches, puis on lance.
export default function LobbyScreen() {
  const { state, dispatch } = useGame();
  const exit = useExit();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const canStart = state.players.length >= MIN_PLAYERS;
  const full = state.players.length >= MAX_PLAYERS;
  const duplicate = state.players.some((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());

  const add = () => {
    const n = name.trim();
    if (!n) return;
    if (full) return setError(`${MAX_PLAYERS} joueurs maximum.`);
    if (duplicate) return setError('Ce pseudo est déjà pris.');
    dispatch({ type: 'ADD_PLAYER', name: n });
    setName('');
    setError('');
  };

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Pressable onPress={exit} hitSlop={12}>
          <Text style={styles.back}>‹ Accueil</Text>
        </Pressable>
      </View>

      <Text style={styles.h1}>Les joueurs</Text>
      <Text style={styles.count}>
        {state.players.length}/{MAX_PLAYERS}
      </Text>

      <View style={styles.addRow}>
        <TextInput
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError('');
          }}
          placeholder={full ? 'Complet (12 max)' : 'Prénom ou pseudo'}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={add}
          maxLength={18}
          autoCapitalize="words"
          editable={!full}
        />
        <Button label="+" onPress={add} size="md" style={styles.addBtn} disabled={!name.trim() || full || duplicate} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.list}>
        {state.players.length === 0 ? (
          <Text style={styles.empty}>Aucun joueur pour l'instant.</Text>
        ) : (
          state.players.map((p, i) => (
            <View key={p.id} style={styles.playerRow}>
              <Text style={styles.playerIndex} numberOfLines={1}>{i + 1}</Text>
              <Text style={styles.playerName} numberOfLines={1}>
                {p.name}
                {p.isChef ? ' (chef)' : ''}
              </Text>
              <Pressable onPress={() => dispatch({ type: 'REMOVE_PLAYER', id: p.id })} hitSlop={10}>
                <Text style={styles.kick}>✕</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <Text style={styles.h2}>Nombre de manches</Text>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepBtn}
          onPress={() => dispatch({ type: 'SET_MANCHES', n: state.totalManches - 1 })}
        >
          <Text style={styles.stepSign}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{state.totalManches}</Text>
        <Pressable
          style={styles.stepBtn}
          onPress={() => dispatch({ type: 'SET_MANCHES', n: state.totalManches + 1 })}
        >
          <Text style={styles.stepSign}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.help}>1 manche = 1 personne désignée par la roulette.</Text>
      <Text style={styles.help}> Maximum de manches {MAX_MANCHES} possibles.</Text>

      <View style={{ height: spacing.xl }} />
      <Button
        label={canStart ? 'Lancer la partie' : `Ajoute ${MIN_PLAYERS - state.players.length} joueur(s)`}
        onPress={() => dispatch({ type: 'START_GAME' })}
        disabled={!canStart}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  back: { color: colors.textMuted, fontSize: 16, fontWeight: font.semibold },
  h1: { color: colors.text, fontSize: 30, fontWeight: font.black },
  count: { color: colors.textMuted, fontWeight: font.bold, fontSize: 14, marginTop: 2, marginBottom: spacing.md },
  error: { color: colors.danger, fontSize: 13, fontWeight: font.semibold, marginTop: spacing.xs },
  h2: { color: colors.text, fontSize: 20, fontWeight: font.bold, marginTop: spacing.xl, marginBottom: spacing.sm },
  help: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.xs, marginBottom: spacing.lg },

  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  input: {
    flex: 1,
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
  addBtn: { width: 56, height: 52, paddingHorizontal: 0 },

  list: { gap: spacing.sm },
  empty: { color: colors.textFaint, fontStyle: 'italic' },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  playerIndex: { color: colors.textFaint, fontWeight: font.bold, minWidth: 26, textAlign: 'center' },
  playerName: { flex: 1, color: colors.text, fontSize: 18, fontWeight: font.bold },
  kick: { color: colors.danger, fontSize: 18, fontWeight: font.black, paddingHorizontal: 6 },

  stepper: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.lg },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSign: { color: colors.text, fontSize: 28, fontWeight: font.black, lineHeight: 30 },
  stepValue: { color: colors.text, fontSize: 32, fontWeight: font.black, minWidth: 48, textAlign: 'center' },
});
