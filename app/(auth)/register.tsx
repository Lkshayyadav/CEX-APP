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
import { Zap, Mail, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleRegister = async () => {
    setFormError(null);
    clearError();

    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid email address");
      return;
    }

    if (!username.trim() || username.length < 3) {
      setFormError("Username must be at least 3 characters");
      return;
    }

    if (!password || password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    const success = await register({
      email: email.trim().toLowerCase(),
      username: username.trim(),
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
              <Zap color="#0B0E14" size={28} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CEX to trade Bitcoin, Ethereum & Solana</Text>
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

          {/* Register Form */}
          <Card style={styles.formCard}>
            <Input
              label="Email Address"
              placeholder="trader@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (formError) setFormError(null);
              }}
              leftIcon={<Mail color={COLORS.textSecondary} size={18} />}
            />

            <Input
              label="Username"
              placeholder="e.g. cryptoking"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (formError) setFormError(null);
              }}
              leftIcon={<User color={COLORS.textSecondary} size={18} />}
            />

            <Input
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (formError) setFormError(null);
              }}
              isPassword
              leftIcon={<Lock color={COLORS.textSecondary} size={18} />}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (formError) setFormError(null);
              }}
              isPassword
              leftIcon={<Lock color={COLORS.textSecondary} size={18} />}
            />

            <View style={styles.securityNote}>
              <ShieldCheck color={COLORS.buyGreen} size={16} />
              <Text style={styles.securityText}>Protected by Argon2/Bcrypt Hash & Hardware Keystore</Text>
            </View>

            <Button
              title="Create Account & Sign In"
              size="lg"
              loading={isLoading}
              onPress={handleRegister}
              icon={<ArrowRight color="#0B0E14" size={18} />}
            />
          </Card>

          {/* Footer Switch to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                clearError();
                router.push("/(auth)/login");
              }}
            >
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    paddingVertical: SPACING.xxl,
    justifyContent: "center",
    minHeight: "100%",
    gap: SPACING.lg,
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
    gap: SPACING.md + 2,
    padding: SPACING.xl,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: 2,
  },
  securityText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
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
});
