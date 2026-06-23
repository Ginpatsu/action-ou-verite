import { Linking } from 'react-native';
import { SOCIAL_APPS, type SocialApp } from '../data/socialApps';
import type { SocialId } from '../types';

// Probe which of the supported social apps are installed on this device.
// NOTE: reliable only in a dev/standalone build. In Expo Go (and on web)
// package-visibility queries aren't applied, so this may under-report.
export async function detectInstalled(): Promise<SocialId[]> {
  const checks = await Promise.all(
    SOCIAL_APPS.map(async (app) => {
      try {
        const ok = await Linking.canOpenURL(app.probe);
        return ok ? app.id : null;
      } catch {
        return null;
      }
    })
  );
  return checks.filter((id): id is SocialId => id !== null);
}

// Try to open the social app (the winner then writes the post by hand).
// Falls back through the candidate deep links, then to the web URL.
export async function openSocial(app: SocialApp): Promise<boolean> {
  for (const url of app.openCandidates) {
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // ignore and try the next candidate
    }
  }
  try {
    await Linking.openURL(app.openCandidates[0]);
    return true;
  } catch {
    // ignore — fall through to web
  }
  try {
    await Linking.openURL(app.web);
    return true;
  } catch {
    return false;
  }
}
