# Action ou Vérité — Hardcore 🔥

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

Le multijoueur utilise **Supabase Realtime** (broadcast + presence) — gratuit, aucune table à créer.

1. Crée un projet sur [supabase.com](https://supabase.com).
2. **Settings → Data API** : copie *Project URL* et la clé *anon / public*.
3. Renseigne-les, au choix :
   - dans `src/net/config.ts`, ou
   - via les variables d'env `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Relance `npx expo start`. Le bouton **Partie en ligne** devient actif.

Ensuite : un joueur **crée une partie** (il obtient un **code à 4 lettres**), les autres **rejoignent** avec ce code. Le créateur est le **chef/hôte** (autorité du jeu). Chaque téléphone n'affiche que ce qui le concerne (la victime choisit, l'auteur écrit, etc.). À la fin, la sentence se joue **sur le téléphone du perdant** (c'est lui qui détecte ses réseaux installés).

> Tant que Supabase n'est pas configuré, le mode en ligne affiche les instructions ; le mode **local** marche sans rien configurer.

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
    config.ts                   # clés Supabase
    supabase.ts                 # client Supabase (lazy)
    room.ts                     # canal Realtime (broadcast + presence)
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
