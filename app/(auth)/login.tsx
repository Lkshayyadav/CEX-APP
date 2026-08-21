import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Input } from "../../src/components/common/Input";
import { Button } from "../../src/components/common/Button";
import { Card } from "../../src/components/common/Card";
import { useAuthStore } from "../../src/store/authStore";
import { Zap, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async () => {
    setFormError(null);
    clearError();

    if (!identifier.trim()) {
      setFormError("Please enter your email or username");
      return;
    }

    if (!password) {
      setFormError("Please enter your password");
      return;
    }

    const success = await login({
      identifier: identifier.trim(),
      password,
    });

    if (success) {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.cexLogoPill}>
              <Text style={styles.cexLogoText}>cex</Text>
            </View>
            <Text style={styles.title}>Welcome to CEX</Text>
            <Text style={styles.subtitle}>Sign in to access your high-frequency portfolio</Text>
          </View>

          {/* Error Banner */}
          {error || formError ? (
            <Card style={styles.errorCard}>
              <View style={styles.errorRow}>
                <AlertCircle color={COLORS.sellRed} size={18} />
                <Text style={styles.errorText}>{error || formError}</Text>
              </View>
            </Card>
          ) : null}

          {/* Login Form */}
          <Card style={styles.formCard}>
            <Input
              label="Email or Username"
              placeholder="e.g. trader@cex.io or satoshi"
              value={identifier}
              onChangeText={(t) => {
                setIdentifier(t);
                if (formError) setFormError(null);
              }}
              leftIcon={<Mail color={COLORS.textSecondary} size={18} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (formError) setFormError(null);
              }}
              isPassword
              leftIcon={<Lock color={COLORS.textSecondary} size={18} />}
            />

            <Button
              title="Sign In"
              size="lg"
              loading={isLoading}
              onPress={handleLogin}
              style={{ marginTop: SPACING.sm }}
              icon={<ArrowRight color="#0B0E14" size={18} />}
            />
          </Card>

          {/* Footer Switch to Register */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Need a new account?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                clearError();
                router.push("/(auth)/register");
              }}
            >
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Back to Home Link */}
          <TouchableOpacity
            style={styles.guestLink}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.guestText}>← Explore Markets as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
    justifyContent: "center",
    minHeight: "100%",
    gap: SPACING.xl,
  },
  header: {
    alignItems: "center",
    gap: SPACING.xs,
  },
  cexLogoPill: {
    backgroundColor: "#0052FF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    shadowColor: "#0052FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  cexLogoText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  errorCard: {
    backgroundColor: COLORS.sellRedMuted,
    borderColor: COLORS.sellRed,
    padding: SPACING.md,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  errorText: {
    color: COLORS.sellRed,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  formCard: {
    gap: SPACING.lg,
    padding: SPACING.xl,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs + 2,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  guestLink: {
    alignSelf: "center",
    padding: SPACING.sm,
  },
  guestText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
});
