import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../components/Button';
import GameHeader from '../../components/GameHeader';
import Podium from '../../components/Podium';
import ResultSound from '../../components/ResultSound';
import Roulette from '../../components/Roulette';
import Screen from '../../components/Screen';
import { useOnline } from '../../online/OnlineContext';
import { duckMusic } from '../../utils/sound';
import { colors, font, radius, spacing } from '../../theme';

export default function OnlinePlayScreen() {
  const { state, session, myId, isHost, act, leave, playerById } = useOnline();
  // En jeu : la musique de fond continue mais baisse de 20 % (fond sonore).
  useEffect(() => {
    duckMusic();
  }, []);
  if (!state || !state.turn) {
    // turnIntro has no turn yet
    return <TurnIntro />;
  }

  const { turn } = state;
  const target = playerById(turn.targetId);
  const writer = playerById(turn.writerId);
  const amTarget = myId === turn.targetId;
  const amWriter = myId === turn.writerId;
  const isAction = turn.type === 'action';
  const accent = isAction ? colors.primary : colors.accent;
  const names = state.players.map((p) => p.name);
  const idx = (id: string | null) => Math.max(0, state.players.findIndex((p) => p.id === id));
  // Roue "qui écrit" : on exclut la personne déjà désignée (elle n'écrit jamais
  // pour elle-même), pour ne pas réafficher son nom à la 2e roulette.
  const writerPool = state.players.filter((p) => p.id !== turn.targetId);

  const Header = (
    <GameHeader manche={state.currentManche} total={state.totalManches} code={session?.code} onQuit={leave} />
  );

  switch (state.phase) {
    case 'playerRoulette':
      return (
        <Screen>
          {Header}
          <View style={styles.fill}>
            <Text style={styles.kicker}>LA ROULETTE TOURNE…</Text>
            <View style={{ height: spacing.lg }} />
            <Roulette key={`t${turn.manche}`} items={names} winnerIndex={idx(turn.targetId)} accent={colors.primary} />
          </View>
        </Screen>
      );

    case 'chooseType':
      return (
        <Screen>
          {Header}
          <View style={styles.fill}>
            {amTarget ? (
              <>
                <Text style={styles.kicker}>C'EST TOI !</Text>
                <View style={styles.choices}>
                  <Pressable style={[styles.card, { backgroundColor: colors.primary }]} onPress={() => act({ type: 'CHOOSE_TYPE', dareType: 'action' })}>
                    <Text style={styles.cardLabel}>ACTION</Text>
                  </Pressable>
                  <Pressable style={[styles.card, { backgroundColor: colors.accent }]} onPress={() => act({ type: 'CHOOSE_TYPE', dareType: 'verite' })}>
                    <Text style={styles.cardLabel}>VÉRITÉ</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Waiting emoji="" title={`${target?.name} est désigné·e`} sub="Action ou Vérité ? On attend son choix…" />
            )}
          </View>
        </Screen>
      );

    case 'writerRoulette':
      return (
        <Screen>
          {Header}
          <View style={styles.fill}>
            <Text style={[styles.kicker, { color: colors.accent }]}>QUI ÉCRIT L'ÉPREUVE ?</Text>
            <View style={{ height: spacing.lg }} />
            <Roulette
              key={`w${turn.manche}`}
              items={writerPool.map((p) => p.name)}
              winnerIndex={Math.max(0, writerPool.findIndex((p) => p.id === turn.writerId))}
              accent={colors.accent}
            />
          </View>
        </Screen>
      );

    case 'writeDare':
      return amWriter ? (
        <WriteDareView targetName={target?.name ?? ''} isAction={isAction} onSubmit={(text) => act({ type: 'SET_DARE', text })} header={Header} />
      ) : (
        <Screen>
          {Header}
          <View style={styles.fill}>
            <Waiting emoji="" title={`${writer?.name} écrit`} sub={`Une ${isAction ? 'action' : 'vérité'} pour ${target?.name}…`} />
          </View>
        </Screen>
      );

    case 'reveal':
      return (
        <Screen scroll>
          {Header}
          <View style={{ height: spacing.xl }} />
          <Text style={styles.kicker}>POUR</Text>
          <Text style={styles.bigName}>{target?.name}</Text>
          <View style={[styles.chip, { backgroundColor: accent }]}>
            <Text style={styles.chipText}>{isAction ? 'ACTION' : 'VÉRITÉ'}</Text>
          </View>
          <View style={[styles.dareCard, { borderColor: accent }]}>
            <Text style={styles.dareText}>{turn.dare}</Text>
          </View>

          {amWriter ? (
            <>
              <Text style={styles.sub}>{target?.name} a-t-il/elle assuré ?</Text>
              <View style={styles.verdict}>
                <Button label="Assuré" variant="success" style={styles.verdictBtn} onPress={() => act({ type: 'SET_VERDICT', refused: false })} />
                <Button label="Dégonflé" variant="danger" style={styles.verdictBtn} onPress={() => act({ type: 'SET_VERDICT', refused: true })} />
              </View>
            </>
          ) : amTarget ? (
            <Text style={styles.sub}>À toi de jouer ! {writer?.name} va juger.</Text>
          ) : (
            <Text style={styles.sub}>{target?.name} réalise… {writer?.name} jugera.</Text>
          )}
        </Screen>
      );

    case 'turnResult':
      return (
        <Screen scroll>
          <ResultSound refused={!!turn.refused} />
          {Header}
          <View style={styles.center}>
            <Text style={styles.emoji}>{turn.refused ? '' : ''}</Text>
            <Text style={styles.h1}>{turn.refused ? '+1 malus' : 'Respect.'}</Text>
            <Text style={styles.sub}>
              {turn.refused ? `${target?.name} s'est dégonflé·e.` : `${target?.name} a assuré.`}
            </Text>
          </View>
          <Text style={styles.rankTitle}>CLASSEMENT</Text>
          <Podium players={state.players} highlightId={myId} celebrate={false} showRest />
          <View style={{ height: spacing.lg }} />
          {isHost ? (
            <Button
              label={state.currentManche >= state.totalManches ? 'Voir le verdict final →' : 'Manche suivante →'}
              variant={state.currentManche >= state.totalManches ? 'gold' : 'primary'}
              onPress={() => act({ type: 'NEXT' })}
            />
          ) : (
            <Text style={styles.hostWait}>Le chef enchaîne…</Text>
          )}
        </Screen>
      );

    default:
      return <TurnIntro />;
  }
}

function TurnIntro() {
  const { state, session, act, leave, myId } = useOnline();
  if (!state) return null;
  return (
    <Screen scroll>
      <GameHeader manche={state.currentManche} total={state.totalManches} code={session?.code} onQuit={leave} />
      <View style={styles.intro}>
        <Text style={styles.h1}>Qui va trembler ?</Text>
        <Text style={styles.sub}>N'importe qui peut lancer la roulette !</Text>
        <View style={{ height: spacing.xl }} />
        <Button label="Tourner la roulette" onPress={() => act({ type: 'SPIN_TARGET' })} />
      </View>
      <View style={{ height: spacing.xl }} />
      <Text style={styles.rankTitle}>CLASSEMENT</Text>
      <Podium players={state.players} highlightId={myId} celebrate={false} showRest />
    </Screen>
  );
}

function Waiting({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.h1}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

function WriteDareView({
  targetName,
  isAction,
  onSubmit,
  header,
}: {
  targetName: string;
  isAction: boolean;
  onSubmit: (text: string) => void;
  header: React.ReactNode;
}) {
  const [text, setText] = useState('');
  return (
    <Screen scroll>
      {header}
      <>
        <Text style={styles.kicker}>À TOI D'ÉCRIRE</Text>
        <Text style={styles.h1}>
          Une <Text style={{ color: isAction ? colors.primary : colors.accent }}>{isAction ? 'ACTION' : 'VÉRITÉ'}</Text>
        </Text>
        <Text style={styles.sub}>pour {targetName}. Sois tordu·e</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={isAction ? 'Ex : imite ton crush 30 secondes…' : 'Ex : ton plus gros secret ici ?'}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          multiline
          autoFocus
          maxLength={240}
          textAlignVertical="top"
        />
        <Text style={styles.count}>{text.length}/240</Text>
        <View style={{ height: spacing.lg }} />
        <Button label="Envoyer l'épreuve" variant={isAction ? 'primary' : 'accent'} disabled={!text.trim()} onPress={() => onSubmit(text)} />
      </>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 3, textAlign: 'center' },
  rankTitle: { color: colors.textMuted, fontWeight: font.bold, letterSpacing: 2, fontSize: 12, marginBottom: spacing.md, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  intro: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  emoji: { fontSize: 56, textAlign: 'center' },
  h1: { color: colors.text, fontSize: 32, fontWeight: font.black, textAlign: 'center', marginTop: spacing.xs },
  sub: { color: colors.textMuted, fontSize: 16, textAlign: 'center', marginTop: spacing.sm },
  suspense: { fontSize: 28, letterSpacing: 4, marginTop: spacing.lg },
  choices: { gap: spacing.lg, alignSelf: 'stretch', marginTop: spacing.xl },
  card: { borderRadius: radius.xl, paddingVertical: spacing.xxl, alignItems: 'center' },
  cardEmoji: { fontSize: 44 },
  cardLabel: { color: colors.white, fontSize: 30, fontWeight: font.black, letterSpacing: 2, marginTop: spacing.sm },
  bigName: { color: colors.text, fontSize: 34, fontWeight: font.black, textAlign: 'center', marginTop: 2 },
  chip: { alignSelf: 'center', borderRadius: 999, paddingHorizontal: spacing.lg, paddingVertical: 6, marginTop: spacing.md },
  chipText: { color: colors.white, fontWeight: font.black, letterSpacing: 1 },
  dareCard: { alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, padding: spacing.xl, marginTop: spacing.lg },
  dareText: { color: colors.text, fontSize: 24, fontWeight: font.bold, textAlign: 'center', lineHeight: 32 },
  verdict: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch', marginTop: spacing.lg },
  verdictBtn: { flex: 1 },
  hostWait: { color: colors.textMuted, textAlign: 'center', fontSize: 15 },
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
    marginTop: spacing.lg,
  },
  count: { color: colors.textFaint, textAlign: 'right', marginTop: spacing.xs, fontSize: 12 },
});
