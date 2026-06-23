import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider, useGame } from './src/game/GameContext';

import HomeScreen from './src/screens/HomeScreen';
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

function Router() {
  const { state } = useGame();
  switch (state.phase) {
    case 'home':
      return <HomeScreen />;
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
      return <HomeScreen />;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Router />
      </GameProvider>
    </SafeAreaProvider>
  );
}
