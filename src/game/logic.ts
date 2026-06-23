import type { GameResult, Player } from '../types';

let counter = 0;
export function uid(prefix = 'p'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickTarget(players: Player[]): string {
  return randomItem(players).id;
}

// Anonymous author: anyone in the group except the designated target.
export function pickWriter(players: Player[], targetId: string): string {
  const pool = players.filter((p) => p.id !== targetId);
  return (pool.length > 0 ? randomItem(pool) : players[0]).id;
}

// Most malus = loser; least malus = winner. If everyone is tied, we still
// crown a (random) loser and winner so the punishment can happen — flagged as a tie.
export function computeResult(players: Player[]): GameResult {
  const scores = players.map((p) => p.malus);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const tie = max === min;

  const loser = randomItem(players.filter((p) => p.malus === max));
  const winnerPool = players.filter((p) => p.id !== loser.id && p.malus === min);
  const winner = winnerPool.length > 0 ? randomItem(winnerPool) : randomItem(players.filter((p) => p.id !== loser.id));

  return { loserId: loser.id, winnerId: winner.id, tie };
}
