import type { SocialId } from '../types';

// Description d'un réseau social ouvrable pour la "sentence" finale.
export type SocialApp = {
  id: SocialId;
  label: string;
  icon: string; // nom du glyphe FontAwesome5 (brands)
  color: string; // fond du rond
  iconColor: string; // teinte du glyphe
  // Schémas testés pour deviner si l'app est installée (Linking.canOpenURL).
  // On en met plusieurs car certaines apps ne répondent au "ping" que sur
  // certaines URL précises (le schéma nu échoue souvent → faux négatifs).
  probes: string[];
  // URLs tentées dans l'ordre à l'ouverture (la 1re qui marche gagne).
  openCandidates: string[];
  // Repli web toujours ouvrable.
  web: string;
};

// Les six réseaux proposés au gagnant.
export const SOCIAL_APPS: SocialApp[] = [
  {
    id: 'x',
    label: 'X',
    icon: 'twitter',
    color: '#1D1D1F',
    iconColor: '#FFFFFF',
    probes: ['twitter://', 'twitterauth://', 'twitter://timeline'],
    openCandidates: ['twitter://post?message=', 'twitter://', 'https://twitter.com/intent/tweet'],
    web: 'https://twitter.com/intent/tweet',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
    iconColor: '#FFFFFF',
    probes: ['instagram://app', 'instagram://', 'instagram://camera'],
    openCandidates: ['instagram://camera', 'instagram://app', 'instagram://'],
    web: 'https://www.instagram.com/',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    iconColor: '#FFFFFF',
    probes: ['fb://', 'fbapi://', 'fb://feed'],
    openCandidates: ['fb://feed', 'fb://', 'fbapi://'],
    web: 'https://www.facebook.com/',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: 'tiktok',
    color: '#FE2C55',
    iconColor: '#FFFFFF',
    probes: ['tiktok://', 'snssdk1233://', 'musically://'],
    openCandidates: ['tiktok://', 'snssdk1233://', 'musically://'],
    web: 'https://www.tiktok.com/',
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    icon: 'snapchat-ghost',
    color: '#FFFC00',
    iconColor: '#0B0B0F',
    probes: ['snapchat://', 'snapchat://camera'],
    openCandidates: ['snapchat://camera', 'snapchat://'],
    web: 'https://www.snapchat.com/',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: 'discord',
    color: '#5865F2',
    iconColor: '#FFFFFF',
    probes: ['discord://', 'discord://app'],
    openCandidates: ['discord://app', 'discord://'],
    web: 'https://discord.com/channels/@me',
  },
];
