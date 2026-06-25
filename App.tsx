import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ExitProvider } from './src/components/ExitContext';
import { GameProvider, useGame } from './src/game/GameContext';
import MenuScreen from './src/screens/MenuScreen';
import OnlineApp from './src/online/OnlineApp';
import TermsScreen from './src/screens/TermsScreen';

import LobbyScreen from './src/screens/LobbyScreen';
import TurnIntroScreen from './src/screens/TurnIntroScreen';
import PlayerRouletteScreen from './src/screens/PlayerRouletteScreen';
import ChooseTypeScreen from './src/screens/ChooseTypeScreen';
import WriterRouletteScreen from './src/screens/WriterRouletteScreen';
import WriterHandoffScreen from './src/screens/WriterHandoffScreen';
import WriteDareScreen from './src/screens/WriteDareScreen';
import HandBackScreen from './src/screens/HandBackScreen';
import RevealScreen from './src/screens/RevealScreen';
import JudgeHandoffScreen from './src/screens/JudgeHandoffScreen';
import JudgeScreen from './src/screens/JudgeScreen';
import TurnResultScreen from './src/screens/TurnResultScreen';
import FinaleScreen from './src/screens/FinaleScreen';

type Mode = 'menu' | 'local' | 'online' | 'terms';

function LocalRouter() {
  const { state } = useGame();
  switch (state.phase) {
    case 'lobby':
      return <LobbyScreen />;
    case 'turnIntro':
      return <TurnIntroScreen />;
    case 'playerRoulette':
      return <PlayerRouletteScreen />;
    case 'chooseType':
      return <ChooseTypeScreen />;
    case 'writerRoulette':
      return <WriterRouletteScreen />;
    case 'writerHandoff':
      return <WriterHandoffScreen />;
    case 'writeDare':
      return <WriteDareScreen />;
    case 'handBack':
      return <HandBackScreen />;
    case 'reveal':
      return <RevealScreen />;
    case 'judgeHandoff':
      return <JudgeHandoffScreen />;
    case 'judge':
      return <JudgeScreen />;
    case 'turnResult':
      return <TurnResultScreen />;
    case 'finale':
      return <FinaleScreen />;
    default:
      return <LobbyScreen />;
  }
}

function LocalApp({ onExit }: { onExit: () => void }) {
  return (
    <GameProvider>
      <ExitProvider onExit={onExit}>
        <LocalRouter />
      </ExitProvider>
    </GameProvider>
  );
}

export default function App() {
  const [mode, setMode] = useState<Mode>('menu');
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {mode === 'menu' && (
        <MenuScreen
          onLocal={() => setMode('local')}
          onOnline={() => setMode('online')}
          onTerms={() => setMode('terms')}
        />
      )}
      {mode === 'terms' && <TermsScreen onBack={() => setMode('menu')} />}
      {mode === 'local' && <LocalApp onExit={() => setMode('menu')} />}
      {mode === 'online' && <OnlineApp onExit={() => setMode('menu')} />}
    </SafeAreaProvider>
  );
}
