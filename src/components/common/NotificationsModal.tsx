import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Card } from "./Card";
import { Bell, X, CheckCircle2 } from "lucide-react-native";

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
              <Bell color={COLORS.electricBlueBright} size={20} />
              <Text style={styles.modalTitle}>Notifications</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color={COLORS.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <Card style={styles.emptyCard}>
            <View style={styles.iconCircle}>
              <CheckCircle2 color={COLORS.buyGreen} size={28} />
            </View>
            <Text style={styles.emptyTitle}>All Systems Operational</Text>
            <Text style={styles.emptySub}>
              Live notifications for order fills, matching engine executions, and deposit confirmations will appear here.
            </Text>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#111728",
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.borderBlue,
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
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceElevated,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(14, 203, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
