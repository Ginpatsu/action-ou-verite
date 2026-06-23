// Shared domain types for the game.

export type DareType = 'action' | 'verite';

export type SocialId = 'x' | 'instagram' | 'facebook' | 'tiktok' | 'snapchat' | 'discord';

export type Player = {
  id: string;
  name: string;
  malus: number;
  isChef: boolean;
};

// One full pass-the-phone turn (one "manche").
export type Turn = {
  manche: number; // 1-based
  targetId: string; // person designated by the first roulette
  type: DareType | null; // action / vérité chosen by the target
  writerId: string | null; // anonymous author chosen by the second roulette
  dare: string | null; // what the author wrote
  refused: boolean | null; // verdict given by the author
};

export type GameResult = {
  loserId: string;
  winnerId: string;
  tie: boolean; // true when malus scores were all equal (no real loser)
};

export type Phase =
  | 'home'
  | 'lobby'
  | 'turnIntro'
  | 'playerRoulette'
  | 'chooseType'
  | 'writerRoulette'
  | 'writerHandoff'
  | 'writeDare'
  | 'handBack'
  | 'reveal'
  | 'judgeHandoff'
  | 'judge'
  | 'turnResult'
  | 'finale';

export type GameState = {
  phase: Phase;
  players: Player[];
  totalManches: number;
  currentManche: number;
  turn: Turn | null;
  result: GameResult | null;
};
