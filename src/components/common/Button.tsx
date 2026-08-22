import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import * as Haptics from "expo-haptics";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "buy" | "sell" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case "buy":
        return styles.buy;
      case "sell":
        return styles.sell;
      case "outline":
        return styles.outline;
      case "ghost":
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sizeSm;
      case "lg":
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? COLORS.primary : "#FFFFFF"} size="small" />
      ) : (
        <>
          {icon ? icon : null}
          <Text
            style={[
              styles.textBase,
              variant === "outline" && styles.textOutline,
              variant === "ghost" && styles.textGhost,
              (variant === "primary" || variant === "buy" || variant === "sell") && styles.textSolid,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  primary: {
    backgroundColor: "#111827",
  },
  buy: {
    backgroundColor: "#10B981",
  },
  sell: {
    backgroundColor: "#EF4444",
  },
  outline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.12)",
  },
  ghost: {
    backgroundColor: COLORS.surfaceElevated,
  },
  disabled: {
    opacity: 0.45,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: SPACING.xxl,
  },
  textBase: {
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  textSolid: {
    color: "#FFFFFF",
  },
  textOutline: {
    color: "#111827",
  },
  textGhost: {
    color: COLORS.textPrimary,
  },
});
