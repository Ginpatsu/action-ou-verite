// Expo config plugin (runs at `expo prebuild` / EAS build, ignored in Expo Go).
// Declares the social apps in AndroidManifest <queries> so that
// Linking.canOpenURL(...) can actually detect them on Android 11+ (API 30+),
// where package visibility is restricted by default.
const { withAndroidManifest } = require('@expo/config-plugins');

// Known package names of the supported social apps.
const PACKAGES = [
  'com.twitter.android', // X / Twitter
  'com.instagram.android',
  'com.facebook.katana',
  'com.zhiliaoapp.musically', // TikTok (global)
  'com.ss.android.ugc.trill', // TikTok (alt)
  'com.snapchat.android',
  'com.discord',
];

// URL schemes we probe with Linking.canOpenURL().
const SCHEMES = ['twitter', 'instagram', 'fb', 'facebook', 'tiktok', 'snssdk1233', 'snapchat', 'discord'];

module.exports = function withAndroidSocialQueries(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    if (!Array.isArray(manifest.queries)) {
      manifest.queries = [];
    }

    const query = { package: [], intent: [] };
    for (const name of PACKAGES) {
      query.package.push({ $: { 'android:name': name } });
    }
    for (const scheme of SCHEMES) {
      query.intent.push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        data: [{ $: { 'android:scheme': scheme } }],
      });
    }

    manifest.queries.push(query);
    return cfg;
  });
};
