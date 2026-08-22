import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Card } from "./Card";
import { Button } from "./Button";
import { useAuthStore } from "../../store/authStore";
import { User, Shield, Key, LogOut, X, CheckCircle2, LogIn, Sparkles } from "lucide-react-native";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { user, logout, enterDemoMode, isAuthenticated, isDemoMode } = useAuthStore();

  const handleLogoutOrExitDemo = async () => {
    await logout();
    onClose();
    router.replace("/welcome");
  };

  const handleGoToLogin = () => {
    onClose();
    router.push("/(auth)/login");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Account</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.75}>
              <X color={COLORS.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <Card style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <User
                color={isAuthenticated ? COLORS.buyGreen : isDemoMode ? COLORS.electricBlue : COLORS.textMuted}
                size={32}
              />
            </View>

            <View style={{ alignItems: "center", gap: 2 }}>
              <Text style={styles.usernameText}>
                {isAuthenticated && user ? `@${user.username}` : isDemoMode ? "Demo Account" : "Guest Trader"}
              </Text>
              <Text style={styles.emailText}>
                {isAuthenticated && user ? user.email : isDemoMode ? "demo@cex.io · Simulated Funds" : "Not signed in"}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isAuthenticated
                    ? "rgba(16, 185, 129, 0.12)"
                    : isDemoMode
                    ? "rgba(37, 99, 235, 0.10)"
                    : "rgba(100, 116, 139, 0.12)",
                },
              ]}
            >
              <CheckCircle2
                color={isAuthenticated ? COLORS.buyGreen : isDemoMode ? COLORS.electricBlue : COLORS.textMuted}
                size={14}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: isAuthenticated ? COLORS.buyGreen : isDemoMode ? COLORS.electricBlue : COLORS.textMuted,
                  },
                ]}
              >
                {isAuthenticated ? "Live Production Account" : isDemoMode ? "Simulated Demo Mode" : "Guest Mode"}
              </Text>
            </View>
          </Card>

          {/* Account Details List */}
          {isAuthenticated && user ? (
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Shield color={COLORS.electricBlue} size={16} />
                  <Text style={styles.detailKey}>Account Role</Text>
                </View>
                <Text style={styles.detailVal}>{user.role || "TRADER"}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Key color={COLORS.electricBlue} size={16} />
                  <Text style={styles.detailKey}>Account ID</Text>
                </View>
                <Text style={styles.detailVal}>{user.id ? user.id.slice(0, 12) + "..." : "---"}</Text>
              </View>
            </View>
          ) : null}

          {/* Action Buttons based on User State */}
          {isAuthenticated ? (
            <Button
              title="Sign Out of Account"
              variant="outline"
              size="lg"
              icon={<LogOut color={COLORS.sellRed} size={18} />}
              textStyle={{ color: COLORS.sellRed }}
              style={{ borderColor: COLORS.sellRed }}
              onPress={handleLogoutOrExitDemo}
            />
          ) : isDemoMode ? (
            <View style={{ gap: SPACING.sm }}>
              <Button
                title="Sign In / Register Real Account"
                variant="primary"
                size="lg"
                icon={<LogIn color="#FFFFFF" size={18} />}
                onPress={handleGoToLogin}
              />
              <Button
                title="Exit Demo Mode"
                variant="outline"
                size="lg"
                icon={<LogOut color={COLORS.sellRed} size={18} />}
                textStyle={{ color: COLORS.sellRed }}
                style={{ borderColor: COLORS.sellRed }}
                onPress={handleLogoutOrExitDemo}
              />
            </View>
          ) : (
            <View style={{ gap: SPACING.sm }}>
              <Button
                title="Sign In / Register"
                variant="primary"
                size="lg"
                icon={<LogIn color="#FFFFFF" size={18} />}
                onPress={handleGoToLogin}
              />
              <Button
                title="Try Demo Account ($25,000)"
                variant="outline"
                size="lg"
                icon={<Sparkles color={COLORS.electricBlue} size={18} />}
                onPress={() => {
                  enterDemoMode();
                  onClose();
                }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    padding: SPACING.xl,
    paddingBottom: 40,
    gap: SPACING.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: "#F8FAFC",
    borderRadius: RADIUS.xl,
    borderColor: "rgba(0, 0, 0, 0.06)",
    gap: SPACING.sm,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  emailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  detailsList: {
    backgroundColor: "#F8FAFC",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  detailKey: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  detailVal: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
});
