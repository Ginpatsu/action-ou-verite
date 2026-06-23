# Action ou Vérité — Hardcore 🔥

Jeu de soirée **Action ou Vérité** en mode hardcore, fait en **Expo / React Native**.
Version actuelle : **partie locale, on se passe le téléphone** (pass-the-phone).

## Le concept

1. On ajoute tous les joueurs (juste un pseudo) dans le salon. Le 1ᵉʳ joueur est le **chef** 👑 : il règle le nombre de manches et peut **exclure** quelqu'un.
2. Chaque manche :
   - Une **roulette** désigne une victime.
   - La victime choisit **Action** ou **Vérité**.
   - Une **2ᵉ roulette anonyme** désigne un **auteur secret** (personne ne voit qui).
   - On passe le téléphone discrètement à l'auteur, qui **écrit l'épreuve** (la victime ne doit pas regarder).
   - La victime fait (ou pas) son épreuve. **L'auteur secret juge** : réussi ✅ ou dégonflé 💀 (**+1 malus**).
3. À la fin : celui qui a **le plus de malus** est le **perdant**, celui qui en a **le moins** est le **gagnant**.
   - Le gagnant prend le téléphone du perdant. L'app **détecte les réseaux sociaux installés** (X, Instagram, Facebook, TikTok, Snapchat, Discord), affiche leurs logos, et un tap **ouvre l'appli** : le gagnant écrit ce qu'il veut sur le compte du perdant 😈.

## Lancer le projet

```bash
cd "F:\Applications\actionouvérité"
npm install            # déjà fait
npx expo start         # puis scanner le QR code avec l'app Expo Go
```

- **Android / iOS via Expo Go** : tout le jeu marche. ⚠️ *Seule la détection automatique des réseaux installés est limitée dans Expo Go* — dans ce cas l'app affiche les 6 réseaux et tente quand même d'ouvrir l'appli choisie.
- **Détection fiable des apps installées** : nécessite un **build de développement** (les permissions natives `<queries>` Android et `LSApplicationQueriesSchemes` iOS ne s'appliquent qu'à un vrai build) :
  ```bash
  npx expo run:android        # ou: eas build --profile development
  ```

> ℹ️ **Version Expo** : le projet est volontairement épinglé sur **SDK 54** (RN 0.81) pour rester compatible avec l'app **Expo Go** du Play/App Store (qui supporte le SDK 54). Ne pas remonter en SDK 55/56 tant qu'Expo Go n'a pas suivi, sinon Expo Go affiche « Project is incompatible ».
>
> Un fichier `.npmrc` active `legacy-peer-deps=true` (l'écosystème RN/Expo a des conflits de peer deps bénins) — garde-le pour que `npm install` / `npx expo install` passent sans flag.

## Structure

```
App.tsx                         # providers + routeur de phases (state machine)
app.json                        # config Expo (thème sombre, scheme, query schemes iOS)
plugins/withAndroidSocialQueries.js   # injecte les <queries> Android (détection d'apps)
src/
  theme.ts                      # couleurs / espacements / typo
  types.ts                      # types du domaine (Player, Turn, Phase, ...)
  game/
    GameContext.tsx             # Context + reducer = toute la logique de jeu
    logic.ts                    # tirages aléatoires + calcul gagnant/perdant
  data/socialApps.ts            # les 6 réseaux (scheme, deep links, logo, couleur)
  utils/
    social.ts                   # détection (canOpenURL) + ouverture des apps
    haptics.ts                  # vibrations (no-op sur web)
  components/                   # Screen, Button, Roulette, Scoreboard
  screens/                      # 1 écran par phase de jeu
```

## Roadmap (pas encore fait)

- **Multijoueur en ligne** : sessions multi-appareils + invitation par **code/lien** (Supabase ou Firebase). L'UI actuelle (salon, code de salon, rôle chef) est déjà pensée pour ça.
- Comptes / association de réseaux côté serveur (optionnel — le concept marche sans).
- Banque d'idées d'actions/vérités préremplies.

## Notes

- 2 joueurs minimum pour démarrer (3+ recommandé pour que l'auteur reste vraiment anonyme).
- L'anonymat de l'auteur : sur un seul téléphone, l'écran « passe le tel à X » nomme l'auteur le temps qu'il le prenne — la victime doit regarder ailleurs. L'épreuve affichée et le verdict ne révèlent jamais le nom.
