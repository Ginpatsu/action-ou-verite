import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { MAX_MANCHES, MIN_PLAYERS, useGame } from '../game/GameContext';
import { useExit } from '../components/ExitContext';
import { colors, font, radius, spacing } from '../theme';

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function LobbyScreen() {
  const { state, dispatch } = useGame();
  const exit = useExit();
  const [name, setName] = useState('');
  const code = useMemo(makeCode, []);
  const canStart = state.players.length >= MIN_PLAYERS;

  const add = () => {
    if (!name.trim()) return;
    dispatch({ type: 'ADD_PLAYER', name });
    setName('');
  };

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Pressable onPress={exit} hitSlop={12}>
          <Text style={styles.back}>‹ Accueil</Text>
        </Pressable>
{/*         <View style={styles.codePill}>
          <Text style={styles.codeLabel}>SALON LOCAL</Text>
          <Text style={styles.code}>{code}</Text>
        </View> */}
      </View>

      <Text style={styles.h1}>Les joueurs</Text>
{/*       <Text style={styles.help}>
        Ajoute tout le monde sur ce téléphone. Le 1ᵉʳ joueur est le chef 👑 (il règle les manches et peut exclure).
      </Text> */}

      <View style={styles.addRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Prénom ou pseudo"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={add}
          maxLength={18}
          autoCapitalize="words"
        />
        <Button label="+" onPress={add} size="md" style={styles.addBtn} disabled={!name.trim()} />
      </View>

      <View style={styles.list}>
        {state.players.length === 0 ? (
          <Text style={styles.empty}>Aucun joueur pour l'instant.</Text>
        ) : (
          state.players.map((p, i) => (
            <View key={p.id} style={styles.playerRow}>
              <Text style={styles.playerIndex}>{i + 1}</Text>
              <Text style={styles.playerName} numberOfLines={1}>
                {p.name}
                {/* {p.isChef ? '  👑' : ''} */}
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
  codePill: { alignItems: 'flex-end' },
  codeLabel: { color: colors.textFaint, fontSize: 10, fontWeight: font.bold, letterSpacing: 2 },
  code: { color: colors.accent, fontSize: 20, fontWeight: font.black, letterSpacing: 4 },

  h1: { color: colors.text, fontSize: 30, fontWeight: font.black },
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
  playerIndex: { color: colors.textFaint, fontWeight: font.bold, width: 18 },
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
