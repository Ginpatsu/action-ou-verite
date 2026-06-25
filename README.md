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

Le multijoueur passe par un serveur **Node.js + Express + Socket.io** (dossier
[`server/`](server/)) avec **PostgreSQL**. C'est un relais : l'**hôte** (créateur
de la partie) fait autorité, le serveur gère les salons et relaie les messages.
Le serveur **génère un code à 4 chiffres** unique à la création.

### A. Développement local (même Wi-Fi)

```bash
docker compose up -d --build      # serveur Socket.io + Postgres (port 8787)
npx expo start                    # mode LAN
```

- Chaque joueur installe **Expo Go** et **scanne le même QR**.
- Tout le monde sur le **MÊME Wi-Fi que le PC** → l'app détecte l'IP du PC
  automatiquement (`http://IP:8787`). Un joueur **crée** (code à 4 chiffres), les
  autres **rejoignent**. La sentence finale se joue sur le téléphone du perdant.

### B. Déploiement gratuit (pour les builds / hors Wi-Fi)

Un APK n'a pas de serveur Metro pour deviner l'IP : il faut un serveur public.
100 % gratuit :

1. **Base PostgreSQL** : crée une base sur [Neon.tech](https://neon.tech) ou
   [Supabase](https://supabase.com) → copie la *connection string*.
2. **Serveur** : sur [Render.com](https://render.com) → New → **Blueprint** (le
   [`render.yaml`](render.yaml) est détecté), ou Koyeb. Mets la variable
   `DATABASE_URL` (l'URL Postgres). Tu obtiens une URL `https://xxx.onrender.com`.
3. **Dans l'app** : écran *Partie en ligne* → **Modifier** le serveur → colle
   `https://xxx.onrender.com`. C'est mémorisé (persisté), pas besoin de rebuild
   pour en changer.

> **Cold start** : le plan gratuit endort le serveur après ~15 min ; le 1er appel
> met ~30-60 s à le réveiller. L'app affiche un écran d'attente pendant ce temps.

### Config de l'URL du serveur

Ordre de priorité (voir [`src/net/config.ts`](src/net/config.ts)) :
1. adresse saisie dans l'app (persistée) ;
2. variable d'env de build `EXPO_PUBLIC_GAME_SERVER` (ex : `https://xxx.onrender.com`) ;
3. IP auto-détectée depuis Metro (dev/LAN).

Test rapide du serveur sans Docker : `cd server && npm install && node smoke.js`.

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

Schéma : [`server/db/init.sql`](server/db/init.sql). En production (Neon/Supabase),
le serveur active SSL automatiquement.

## Sécurité

- **Serveur** : taille des messages plafonnée (64 Ko), **limite de débit** par
  socket (anti-flood), **max 12 joueurs/salon**, validation de l'état avant relai.
  Seul l'**hôte** peut diffuser l'état (`state`) — un client ne peut pas détourner
  la partie. Pseudos/identifiants nettoyés et bornés.
- **Base** : requêtes **paramétrées** (pas d'injection SQL) ; SSL en production ;
  identifiants Postgres du `docker-compose.yml` = **dev local uniquement**.
- **App** : aucun secret embarqué ; les textes sont rendus en `<Text>` (pas
  d'exécution → pas de XSS) ; longueurs des saisies limitées.
- **CGU** : page de Conditions Générales d'Utilisation accessible depuis le menu
  (jeu 18+, l'app ne publie rien automatiquement, l'utilisateur est responsable).
- **Production** : utilise une URL **`https://`** (TLS) et change les identifiants
  Postgres par défaut.

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
