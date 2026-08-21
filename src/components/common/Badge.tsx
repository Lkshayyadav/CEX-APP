import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { formatPercentage } from "../../utils/formatters";

interface BadgeProps {
  change: string;
}

export const Badge: React.FC<BadgeProps> = ({ change }) => {
  const { text, isPositive } = formatPercentage(change);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isPositive ? COLORS.buyGreenMuted : COLORS.sellRedMuted },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: isPositive ? COLORS.buyGreen : COLORS.sellRed },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
