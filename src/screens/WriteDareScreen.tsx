import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useGame } from '../game/GameContext';
import { colors, font, radius, spacing } from '../theme';

export default function WriteDareScreen() {
  const { state, dispatch, playerById } = useGame();
  const [text, setText] = useState('');
  const target = playerById(state.turn?.targetId);
  const isAction = state.turn?.type === 'action';
  const typeLabel = isAction ? 'ACTION' : 'VÉRITÉ';
  const accent = isAction ? colors.primary : colors.accent;

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.kicker}>TU ES L'AUTEUR SECRET 🔒</Text>
        <Text style={styles.h1}>
          Écris une <Text style={{ color: accent }}>{typeLabel}</Text>
        </Text>
        <Text style={styles.sub}>pour {target?.name}. Sois aussi tordu·e que tu veux 😈</Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={isAction ? 'Ex : imite ton crush pendant 30 secondes…' : 'Ex : quel est ton plus gros secret ici ?'}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          multiline
          autoFocus
          maxLength={240}
          textAlignVertical="top"
        />
        <Text style={styles.count}>{text.length}/240</Text>

        <View style={{ height: spacing.lg }} />
        <Button
          label="Valider l'épreuve"
          variant={isAction ? 'primary' : 'accent'}
          onPress={() => dispatch({ type: 'SET_DARE', text })}
          disabled={!text.trim()}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, textAlign: 'center' },
  h1: { color: colors.text, fontSize: 30, fontWeight: font.black, textAlign: 'center', marginTop: spacing.sm },
  sub: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    color: colors.text,
    padding: spacing.lg,
    fontSize: 19,
    fontWeight: font.semibold,
    minHeight: 150,
  },
  count: { color: colors.textFaint, textAlign: 'right', marginTop: spacing.xs, fontSize: 12 },
});
