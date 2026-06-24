# Action ou Vérité — Hardcore 

Jeu de soirée **Action ou Vérité** en mode hardcore, fait en **Expo / React Native**.
Deux modes : **local** (un seul téléphone, pass-the-phone) et **en ligne** (plusieurs téléphones).

## Le concept

1. On ajoute les joueurs (juste un pseudo). Le 1ᵉʳ joueur est le **chef** 👑 : il règle le nombre de manches et peut **exclure** quelqu'un.
2. Chaque manche :
   - Une **roulette** désigne une victime.
   - La victime choisit **Action** ou **Vérité**.
   - Une **2ᵉ roulette** désigne qui **écrit l'épreuve** (les noms sont affichés directement).
   - Cette personne écrit l'épreuve, la victime la réalise (ou pas).
   - L'auteur **juge** : réussi ✅ ou dégonflé 💀 (**+1 malus**).
3. À la fin : le **plus de malus** = **perdant**, le **moins** = **gagnant**.
   - Le gagnant prend le téléphone du perdant. L'app **détecte les réseaux installés** (X, Instagram, Facebook, TikTok, Snapchat, Discord), affiche leurs logos, et un tap **ouvre l'appli** : le gagnant écrit ce qu'il veut sur le compte du perdant 😈.

## Lancer le projet

```bash
cd "F:\Applications\actionouvérité"
npx expo start            # puis scanner le QR code avec Expo Go
```

## Mode en ligne (multijoueur, plusieurs téléphones)

Le multijoueur passe par un **petit serveur WebSocket** que tu héberges toi-même
en **Docker** sur ton PC (dossier [`server/`](server/)). C'est un simple relais :
l'hôte (le créateur de la partie) fait autorité, le serveur transmet juste les
messages aux autres joueurs de la room.

**1. Lancer le serveur (une fois) :**

```bash
docker compose up -d --build      # serveur sur le port 8787
# vérifie : ouvre http://localhost:8787  → "serveur de jeu OK"
```

**2. Lancer l'app et tester à plusieurs :**

```bash
npx expo start                    # mode LAN (par défaut)
```

- Chaque joueur installe **Expo Go** et **scanne le même QR code**.
- ⚠️ **Tout le monde sur le MÊME Wi-Fi que le PC.** L'app détecte alors l'IP du
  PC automatiquement (la même que Metro) et parle au serveur sur `:8787` —
  **aucune config**.
- Un joueur **crée une partie** → **code à 4 lettres** ; les autres **rejoignent**
  avec ce code. Chaque téléphone n'affiche que ce qui le concerne. La sentence
  finale se joue **sur le téléphone du perdant**.

> Réseaux différents / 4G : utilise `npx expo start --tunnel` **et** expose le
> port 8787 (puis `EXPO_PUBLIC_GAME_SERVER=ws://TON_IP_PUBLIQUE:8787`). Pour de
> simples tests, reste en Wi-Fi commun.
>
> Le mode **local** marche sans rien lancer.

Test rapide du relais sans Docker : `cd server && npm install && node smoke.js`.

## Base de données (Postgres)

`docker compose up` démarre aussi un **Postgres** (service `db`) auquel le serveur
de jeu se connecte automatiquement (`DATABASE_URL`). Deux usages :

- **Comptes joueurs — persistants** (table `accounts`) : chaque téléphone a un
  identifiant stable (gardé via AsyncStorage), et ses stats cumulées sont mises à
  jour à chaque fin de partie (parties jouées / gagnées / perdues / malus total).
- **Parties — temporaires** (tables `games` + `game_players`) : chaque partie
  terminée est enregistrée puis **purgée automatiquement après 3 jours**
  (`expires_at` + nettoyage horaire).

Le serveur écrit en base **tout seul** : il observe les messages relayés et
enregistre la partie quand elle atteint la phase finale. La persistance est
**optionnelle** — sans `DATABASE_URL`, le serveur reste un simple relais.

Inspecter la base :

```bash
docker compose exec db psql -U aov -d aov -c "select * from accounts;"
docker compose exec db psql -U aov -d aov -c "select code, winner_pseudo, loser_pseudo, expires_at from games;"
```

Schéma : [`server/db/init.sql`](server/db/init.sql). Test d'enregistrement : `cd server && node sim-finale.js`.

> ⚠️ Identifiants Postgres du `docker-compose.yml` = **dev local** (BDD sur
> `localhost:5432`, non exposée à internet). À changer pour un vrai serveur.
> `docker compose down -v` efface aussi les données.

## Détection des réseaux installés

- **Expo Go** : la détection est limitée (les permissions natives ne s'appliquent pas) → l'app affiche les 6 réseaux et tente quand même d'ouvrir celui choisi.
- **Fiable** seulement dans un **build de dev** (`<queries>` Android + `LSApplicationQueriesSchemes` iOS) :
  ```bash
  npx expo run:android        # ou: eas build --profile development
  ```

> ℹ️ **Version Expo** : épinglé sur **SDK 54** (RN 0.81) pour rester compatible avec l'app **Expo Go** des stores. Ne pas remonter en SDK 55/56 tant qu'Expo Go n'a pas suivi (sinon « Project is incompatible »). Le `.npmrc` (`legacy-peer-deps=true`) évite les conflits de peer deps RN/Expo.

## Structure

```
App.tsx                         # menu + bascule local / en ligne
app.json                        # config Expo (scheme, query schemes iOS, icône)
assets/logo.svg                 # logo source (rouge/bleu)
scripts/gen-icons.mjs           # SVG -> PNG (icône, splash, favicon) via sharp
plugins/withAndroidSocialQueries.js   # <queries> Android pour la détection d'apps
src/
  theme.ts                      # couleurs (rouge #E8322D / bleu #2A35D6) / espacements
  types.ts                      # Player, Turn, Phase, GameState...
  game/
    GameContext.tsx             # reducer LOCAL (pass-the-phone)
    onlineReducer.ts            # reducer EN LIGNE (host-authoritative)
    logic.ts                    # tirages + calcul gagnant/perdant (partagé)
  net/
    config.ts                   # URL du serveur (auto-détectée depuis Metro)
    room.ts                     # connexion WebSocket à la room
  utils/identity.ts             # id de compte persistant + pseudo (AsyncStorage)
server/                         # serveur de jeu (Docker) : relais WebSocket + BDD
  server.js                     # relais + observation pour la persistance
  db.js, db/init.sql            # accès Postgres + schéma (accounts, games)
  Dockerfile                    # + docker-compose.yml (Postgres + serveur) à la racine
  online/
    OnlineContext.tsx           # état réseau + autorité de l'hôte
    OnlineApp.tsx               # routeur des écrans en ligne
  data/socialApps.ts            # les 6 réseaux (scheme, deep links, logo)
  utils/social.ts, haptics.ts
  components/                   # AppLogo, Screen, Button, Roulette, Score...
  screens/                      # écrans locaux + screens/online/ pour le multi
```

## Roadmap

- Invitation par **lien** (deep link `actionouverite://join/CODE`) en plus du code.
- Reconnexion d'un joueur déconnecté en cours de partie.
- Banque d'idées d'actions/vérités préremplies.

## Notes

- 2 joueurs minimum (3+ recommandé).
- En local, la 2ᵉ roulette n'est **plus anonyme** : les noms s'affichent directement.
