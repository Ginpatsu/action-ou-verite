import type { SocialId } from '../types';

export type SocialApp = {
  id: SocialId;
  label: string;
  // FontAwesome5 brand glyph name.
  icon: string;
  // Circle background color + icon tint.
  color: string;
  iconColor: string;
  // Scheme used to detect the app via Linking.canOpenURL().
  probe: string;
  // URLs tried in order when the winner taps the logo (first that opens wins).
  openCandidates: string[];
  // Always-openable web fallback.
  web: string;
};

// The six networks the winner can post the punishment on.
export const SOCIAL_APPS: SocialApp[] = [
  {
    id: 'x',
    label: 'X',
    icon: 'twitter',
    color: '#1D1D1F',
    iconColor: '#FFFFFF',
    probe: 'twitter://',
    openCandidates: ['twitter://post?message=', 'twitter://', 'https://twitter.com/intent/tweet'],
    web: 'https://twitter.com/intent/tweet',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
    iconColor: '#FFFFFF',
    probe: 'instagram://',
    openCandidates: ['instagram://app', 'instagram://'],
    web: 'https://www.instagram.com/',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    iconColor: '#FFFFFF',
    probe: 'fb://',
    openCandidates: ['fb://feed', 'fb://', 'fb://facewebmodal/f'],
    web: 'https://www.facebook.com/',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: 'tiktok',
    color: '#FE2C55',
    iconColor: '#FFFFFF',
    probe: 'tiktok://',
    openCandidates: ['tiktok://', 'snssdk1233://'],
    web: 'https://www.tiktok.com/',
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    icon: 'snapchat-ghost',
    color: '#FFFC00',
    iconColor: '#0B0B0F',
    probe: 'snapchat://',
    openCandidates: ['snapchat://', 'snapchat://camera'],
    web: 'https://www.snapchat.com/',
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: 'discord',
    color: '#5865F2',
    iconColor: '#FFFFFF',
    probe: 'discord://',
    openCandidates: ['discord://', 'discord://app'],
    web: 'https://discord.com/channels/@me',
  },
];
