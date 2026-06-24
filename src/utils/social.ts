import { Linking } from 'react-native';
import { SOCIAL_APPS, type SocialApp } from '../data/socialApps';
import type { SocialId } from '../types';

// Devine les réseaux installés sur ce téléphone.
//
// ⚠️ Peu fiable par nature : `Linking.canOpenURL` peut renvoyer false alors que
// l'app EST installée (schéma nu non géré, ou — sur Android — package non déclaré
// dans <queries>, ce qui est le cas dans Expo Go). On teste donc PLUSIEURS URL
// par app. Le résultat ne sert qu'à TRIER l'affichage : l'écran final montre
// toujours les 6 réseaux pour ne jamais en cacher un qui est en fait installé.
export async function detectInstalled(): Promise<SocialId[]> {
  const checks = await Promise.all(
    SOCIAL_APPS.map(async (app) => {
      for (const url of app.probes) {
        try {
          if (await Linking.canOpenURL(url)) return app.id;
        } catch {
          // schéma non déclaré / non autorisé → on essaie le suivant
        }
      }
      return null;
    })
  );
  return checks.filter((id): id is SocialId => id !== null);
}

// Ouvre l'app sociale (le gagnant écrit ensuite le post à la main).
// Essaie les deep links un par un, puis retombe sur l'URL web.
export async function openSocial(app: SocialApp): Promise<boolean> {
  for (const url of app.openCandidates) {
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // on tente le candidat suivant
    }
  }
  // Dernier recours : forcer le 1er deep link, sinon le web.
  try {
    await Linking.openURL(app.openCandidates[0]);
    return true;
  } catch {
    // ignore
  }
  try {
    await Linking.openURL(app.web);
    return true;
  } catch {
    return false;
  }
}

// Tous les réseaux, triés "installés d'abord" (les installés détectés en tête).
// On n'en cache jamais : la détection n'est qu'indicative.
export function sortByInstalled(installed: SocialId[]): SocialApp[] {
  const set = new Set(installed);
  return [...SOCIAL_APPS].sort((a, b) => Number(set.has(b.id)) - Number(set.has(a.id)));
}
