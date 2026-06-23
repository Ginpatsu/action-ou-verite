import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  center?: boolean;
  style?: ViewStyle;
};

// Standard dark, safe-area padded page container.
export default function Screen({ children, scroll, center, style }: Props) {
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
          contentContainerStyle={[{ padding: spacing.xl, flexGrow: 1 }, center ? { justifyContent: 'center' } : null, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={inner}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
});
