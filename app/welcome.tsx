import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../src/constants/theme";
import { useAuthStore } from "../src/store/authStore";
import { ArrowRight, LogIn, UserPlus, Eye, ShieldCheck } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const enterDemoMode = useAuthStore((state) => state.enterDemoMode);

  const handleDemo = () => {
    enterDemoMode();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Floating Glow & Chart Wave Art */}
        <View style={styles.graphicContainer}>
          <Svg width={width - 32} height={height * 0.22} viewBox="0 0 340 180">
            <Defs>
              <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <Stop offset="70%" stopColor="#1D4ED8" stopOpacity="0.08" />
                <Stop offset="100%" stopColor="#080A12" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#60A5FA" />
                <Stop offset="50%" stopColor="#3B82F6" />
                <Stop offset="100%" stopColor="#0ECB81" />
              </LinearGradient>
            </Defs>

            {/* Glowing Area Fill */}
            <Path
              d="M0 120 C60 130, 90 40, 150 70 C210 100, 260 20, 340 40 L340 180 L0 180 Z"
              fill="url(#glowGrad)"
            />

            {/* Glowing Wave Spline */}
            <Path
              d="M0 120 C60 130, 90 40, 150 70 C210 100, 260 20, 340 40"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            <Circle cx="150" cy="70" r="5" fill="#FFFFFF" />
            <Circle cx="150" cy="70" r="10" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.6" />

            <Circle cx="280" cy="30" r="6" fill="#0ECB81" />
            <Circle cx="280" cy="30" r="12" stroke="#0ECB81" strokeWidth="2" fill="none" opacity="0.5" />
          </Svg>

          <View style={styles.floatingPillOne}>
            <Text style={styles.floatingPillText}>+5.20% BTC</Text>
          </View>
          <View style={styles.floatingPillTwo}>
            <Text style={styles.floatingPillText}>+12.76% SOL</Text>
          </View>
        </View>

        {/* Hero Headline from Mockup */}
        <View style={styles.heroTextSection}>
          <Text style={styles.heroTitle}>Discover.</Text>
          <Text style={styles.heroTitle}>Trade.</Text>
          <Text style={[styles.heroTitle, styles.heroTitleAccent]}>Achieve.</Text>

          <Text style={styles.heroSubtitle}>
            Master cryptocurrency trading on our advanced exchange platform.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryPillBtn, SHADOWS.glowBlue]}
            activeOpacity={0.8}
            onPress={() => router.push("/(auth)/login")}
          >
            <LogIn color="#FFFFFF" size={18} />
            <Text style={styles.primaryBtnText}>Sign In to Account</Text>
            <ArrowRight color="#FFFFFF" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlinePillBtn}
            activeOpacity={0.8}
            onPress={() => router.push("/(auth)/register")}
          >
            <UserPlus color={COLORS.electricBlueBright} size={18} />
            <Text style={styles.outlineBtnText}>Create Free Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoLink}
            activeOpacity={0.7}
            onPress={handleDemo}
          >
            <Eye color={COLORS.textSecondary} size={15} />
            <Text style={styles.demoLinkText}>Explore Demo Account →</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerNote}>
          <ShieldCheck color={COLORS.buyGreen} size={14} />
          <Text style={styles.footerText}>
            Direct Render Engine · Hardware Keystore Protected
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    justifyContent: "space-between",
  },
  graphicContainer: {
    alignItems: "center",
    position: "relative",
  },
  floatingPillOne: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: "rgba(59, 130, 246, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  floatingPillTwo: {
    position: "absolute",
    top: 10,
    right: 15,
    backgroundColor: "rgba(14, 203, 129, 0.2)",
    borderColor: "rgba(14, 203, 129, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  floatingPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroTextSection: {
    gap: 2,
    marginVertical: SPACING.sm,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -1,
    lineHeight: 46,
  },
  heroTitleAccent: {
    color: COLORS.electricBlueBright,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
    fontWeight: "500",
  },
  actionsContainer: {
    gap: SPACING.sm + 2,
  },
  primaryPillBtn: {
    backgroundColor: COLORS.electricBlue,
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  outlinePillBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.borderBlue,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  outlineBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  demoLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  demoLinkText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingBottom: 2,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
});
