import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = false }) => {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  elevated: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.borderLight,
  },
});
