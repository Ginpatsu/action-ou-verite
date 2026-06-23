import React from 'react';
import { SvgXml } from 'react-native-svg';

// Same artwork as assets/logo.svg, inlined so it renders crisply in-app.
const XML = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="round"><rect width="512" height="512" rx="112"/></clipPath></defs>
  <g clip-path="url(#round)">
    <rect width="256" height="512" fill="#E8322D"/>
    <rect x="256" width="256" height="512" fill="#2A35D6"/>
  </g>
  <rect x="44" y="158" width="168" height="150" rx="40" fill="none" stroke="#FFFFFF" stroke-width="16"/>
  <path d="M130 306 L150 350 L172 306" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="300" y="158" width="168" height="150" rx="40" fill="none" stroke="#FFFFFF" stroke-width="16"/>
  <path d="M340 306 L362 350 L382 306" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M104 282 L128 184 L152 282 M114 246 L142 246" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M360 184 L384 282 L408 184" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M104 68 L104 116" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>
  <circle cx="104" cy="140" r="11" fill="#FFFFFF"/>
  <path d="M396 86 C396 68 432 68 432 92 C432 110 414 110 414 124" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="414" cy="146" r="11" fill="#FFFFFF"/>
  <circle cx="256" cy="236" r="46" fill="#FFFFFF"/>
  <circle cx="243" cy="240" r="12" fill="none" stroke="#E8322D" stroke-width="6"/>
  <path d="M261 226 L261 246 Q261 254 269 254 Q277 254 277 246 L277 226" fill="none" stroke="#2A35D6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export default function AppLogo({ size = 120 }: { size?: number }) {
  return <SvgXml xml={XML} width={size} height={size} />;
}
