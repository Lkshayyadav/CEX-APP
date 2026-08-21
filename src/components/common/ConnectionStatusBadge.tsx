import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { useWebSocketStatus } from "../../hooks/useWebSocket";
import { Wifi, WifiOff } from "lucide-react-native";

export const ConnectionStatusBadge: React.FC = () => {
  const isConnected = useWebSocketStatus();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isConnected
            ? "rgba(34, 197, 94, 0.12)"
            : "rgba(246, 70, 93, 0.12)",
          borderColor: isConnected
            ? "rgba(34, 197, 94, 0.3)"
            : "rgba(246, 70, 93, 0.3)",
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: isConnected ? COLORS.neonGreen : COLORS.sellRed },
        ]}
      />
      <Text
        style={[
          styles.text,
          { color: isConnected ? COLORS.neonGreen : COLORS.sellRed },
        ]}
      >
        {isConnected ? "WS Live" : "Reconnecting"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
  },
  text: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
