import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = RADIUS.md,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.surfaceElevated,
    opacity: 0.6,
  },
});
