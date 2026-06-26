import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  center?: boolean;
  style?: ViewStyle;
  // Permet à l'écran d'accéder au ScrollView (ex : faire défiler vers un champ
  // au focus pour qu'il ne reste pas caché par le clavier).
  scrollRef?: React.Ref<ScrollView>;
};

// Standard dark, safe-area padded page container.
// Gestion du clavier :
//  - écrans scrollables : `automaticallyAdjustKeyboardInsets` (iOS) + Android en
//    mode "resize" (cf. app.json) -> le contenu remonte / devient défilable au-
//    dessus du clavier, donc on voit ce qu'on tape.
//  - écrans non scrollables : KeyboardAvoidingView (padding) sur iOS.
// On n'empile pas les deux mécanismes pour éviter un double décalage.
export default function Screen({ children, scroll, center, style, scrollRef }: Props) {
  const inner: ViewStyle = {
    flex: 1,
    padding: spacing.xl,
    ...(center ? { justifyContent: 'center' } : null),
    ...style,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            { padding: spacing.xl, paddingBottom: spacing.xl * 3, flexGrow: 1 },
            center ? { justifyContent: 'center' } : null,
            style,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={inner}>{children}</View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
});
