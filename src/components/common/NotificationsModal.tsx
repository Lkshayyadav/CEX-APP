import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Card } from "./Card";
import { Bell, X, CheckCircle2, Zap, ArrowDownLeft, TrendingUp } from "lucide-react-native";

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SAMPLE_NOTIFS = [
  {
    id: "n-1",
    title: "Order Executed Successfully",
    desc: "Your market buy order for 0.05 BTC was matched and filled.",
    time: "10m ago",
    icon: CheckCircle2,
    iconColor: COLORS.buyGreen,
    bgColor: "rgba(16, 185, 129, 0.12)",
  },
  {
    id: "n-2",
    title: "Deposit Confirmed",
    desc: "Simulated deposit of 1,000 USDT has been credited to your ledger.",
    time: "2h ago",
    icon: ArrowDownLeft,
    iconColor: COLORS.electricBlue,
    bgColor: "rgba(37, 99, 235, 0.10)",
  },
  {
    id: "n-3",
    title: "Market Alert: BTC/USDT",
    desc: "Bitcoin surpassed $97,000 (+8.74% in 24h).",
    time: "5h ago",
    icon: TrendingUp,
    iconColor: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.12)",
  },
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
              <View style={styles.headerIconBox}>
                <Bell color="#111827" size={18} />
              </View>
              <Text style={styles.modalTitle}>Notifications</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color={COLORS.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.notifsList} showsVerticalScrollIndicator={false}>
            {SAMPLE_NOTIFS.map((item) => {
              const IconComp = item.icon;
              return (
                <Card key={item.id} style={styles.notifCard}>
                  <View style={[styles.notifIconCircle, { backgroundColor: item.bgColor }]}>
                    <IconComp color={item.iconColor} size={18} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.notifDesc}>{item.desc}</Text>
                  </View>
                </Card>
              );
            })}
          </ScrollView>
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
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
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
  notifsList: {
    gap: SPACING.sm + 2,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    backgroundColor: "#F8FAFC",
    borderRadius: RADIUS.lg,
    borderColor: "rgba(0, 0, 0, 0.05)",
    gap: SPACING.md,
  },
  notifIconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  notifDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});
