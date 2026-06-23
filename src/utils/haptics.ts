import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Thin, crash-safe wrappers — haptics are a no-op on web / unsupported devices.
const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export function tap() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function heavy() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
}

export function success() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function warn() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
