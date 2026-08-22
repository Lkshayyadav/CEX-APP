import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Card } from "./Card";
import { Button } from "./Button";
import { useAuthStore } from "../../store/authStore";
import { Lock, LogIn, Sparkles, Shield } from "lucide-react-native";

interface AuthRequiredGateProps {
  title?: string;
  description?: string;
}

export const AuthRequiredGate: React.FC<AuthRequiredGateProps> = ({
  title = "Sign In to Access Terminal",
  description = "Create a free account or sign in to execute live spot orders, access zero-slippage swaps, and manage your asset ledger.",
}) => {
  const router = useRouter();
  const { enterDemoMode } = useAuthStore();

  return (
    <Card style={styles.gateCard}>
      <View style={styles.iconCircle}>
        <Lock color="#111827" size={24} />
      </View>

      <View style={{ alignItems: "center", gap: 4 }}>
        <Text style={styles.gateTitle}>{title}</Text>
        <Text style={styles.gateDesc}>{description}</Text>
      </View>

      <View style={styles.btnRow}>
        <Button
          title="Sign In / Register"
          variant="primary"
          size="lg"
          icon={<LogIn color="#FFFFFF" size={17} />}
          style={{ width: "100%" }}
          onPress={() => router.push("/(auth)/login")}
        />

        <Button
          title="Try Demo Sandbox ($25,000)"
          variant="outline"
          size="md"
          icon={<Sparkles color={COLORS.electricBlue} size={16} />}
          style={{ width: "100%" }}
          onPress={() => enterDemoMode()}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  gateCard: {
    padding: SPACING.xl,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    gap: SPACING.lg,
    marginVertical: SPACING.sm,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  gateTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  gateDesc: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
  },
  btnRow: {
    width: "100%",
    gap: SPACING.sm,
  },
});
