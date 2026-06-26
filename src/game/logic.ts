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

// Tirage pondéré de la prochaine victime.
// - On réduit fortement la probabilité de retomber sur la dernière personne
//   désignée (et un peu sur les 2-3 précédentes) -> moins de répétitions.
// - Le hasard reste présent : c'est une pondération, pas une exclusion, donc le
//   résultat demeure imprévisible tout en étant perçu comme juste.
// `recent` = ids des derniers tirages, le plus récent en dernier.
export function pickTargetWeighted(players: Player[], recent: string[] = []): string {
  if (players.length === 0) return '';
  if (players.length === 1) return players[0].id;

  // Pénalité selon l'ancienneté du dernier passage (0 = vient de jouer).
  const penalties = [0.1, 0.45, 0.75]; // juste avant / 2 tours / 3 tours
  const reversed = [...recent].reverse();
  const weightFor = (id: string) => {
    const turnsAgo = reversed.indexOf(id);
    if (turnsAgo === -1) return 1; // pas vu récemment -> poids plein
    return turnsAgo < penalties.length ? penalties[turnsAgo] : 1;
  };

  const weights = players.map((p) => weightFor(p.id));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < players.length; i += 1) {
    r -= weights[i];
    if (r <= 0) return players[i].id;
  }
  return players[players.length - 1].id;
}

// Ajoute un tirage à l'historique en le bornant (assez long pour bien répartir,
// sans grossir indéfiniment).
export function pushRecent(recent: string[] | undefined, id: string, playerCount: number): string[] {
  const cap = Math.max(2, Math.min(playerCount - 1, 6));
  return [...(recent ?? []), id].slice(-cap);
}

// Anonymous author: anyone in the group except the designated target.
export function pickWriter(players: Player[], targetId: string): string {
  const pool = players.filter((p) => p.id !== targetId);
  return (pool.length > 0 ? randomItem(pool) : players[0]).id;
}

// Classement par malus : le moins puni gagne, le plus puni perd.
// Égalités (ex aequo) gérées clairement :
//  - tous les joueurs au malus MINIMUM sont co-gagnants ;
//  - tous les joueurs au malus MAXIMUM sont co-perdants (tous font le gage) ;
//  - si tout le monde est au même malus -> égalité parfaite, aucun perdant.
export function computeResult(players: Player[]): GameResult {
  const scores = players.map((p) => p.malus);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const tie = max === min;

  const winnerIds = players.filter((p) => p.malus === min).map((p) => p.id);
  const loserIds = tie ? [] : players.filter((p) => p.malus === max).map((p) => p.id);

  return { winnerIds, loserIds, tie };
}
