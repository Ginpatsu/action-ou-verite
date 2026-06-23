-- Schéma Action ou Vérité.
-- Exécuté au 1er démarrage du conteneur Postgres ET (par sécurité, idempotent)
-- au démarrage du serveur de jeu.

-- Comptes joueurs : PERSISTANTS (clé = identifiant stable stocké sur le téléphone).
create table if not exists accounts (
  id            text primary key,
  pseudo        text not null,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  games_played  integer not null default 0,
  games_won     integer not null default 0,
  games_lost    integer not null default 0,
  total_malus   integer not null default 0
);

-- Parties : TEMPORAIRES — purgées après 3 jours (colonne expires_at + job de nettoyage).
create table if not exists games (
  id             text primary key,
  code           text not null,
  created_at     timestamptz not null default now(),
  manches        integer not null default 0,
  winner_id      text,
  loser_id       text,
  winner_pseudo  text,
  loser_pseudo   text,
  expires_at     timestamptz not null default now() + interval '3 days'
);

-- Résultat par joueur d'une partie (supprimé en cascade avec la partie).
create table if not exists game_players (
  game_id    text not null references games(id) on delete cascade,
  player_id  text not null,
  pseudo     text not null,
  malus      integer not null default 0,
  primary key (game_id, player_id)
);

create index if not exists idx_games_expires_at on games (expires_at);
create index if not exists idx_game_players_player on game_players (player_id);
