import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { Card } from "../../src/components/common/Card";
import { Button } from "../../src/components/common/Button";
import { OrderCard } from "../../src/components/trading/OrderCard";
import { AuthRequiredGate } from "../../src/components/common/AuthRequiredGate";
import { useAuthStore } from "../../src/store/authStore";
import { useOrderStore } from "../../src/store/orderStore";
import { FileText, ArrowRight, Lock } from "lucide-react-native";

export default function OrdersTabScreen() {
  const router = useRouter();
  const { isAuthenticated, isDemoMode } = useAuthStore();
  const { orders, isLoading, fetchOrders } = useOrderStore();

  const [activeTab, setActiveTab] = useState<"OPEN" | "HISTORY">("OPEN");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (isAuthenticated) {
      await fetchOrders();
    }
    setIsRefreshing(false);
  };

  const openOrders = orders.filter(
    (o) => o.status === "OPEN" || o.status === "PARTIALLY_FILLED" || o.status === "PENDING"
  );
  const historyOrders = orders.filter(
    (o) => o.status === "FILLED" || o.status === "CANCELLED" || o.status === "REJECTED"
  );

  const currentList = activeTab === "OPEN" ? openOrders : historyOrders;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Orders & Fills</Text>
          <Text style={styles.subtitle}>Real-time matching engine executions</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "OPEN" && styles.tabBtnActive]}
            onPress={() => setActiveTab("OPEN")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === "OPEN" && styles.tabBtnTextActive]}>
              Open Orders ({openOrders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "HISTORY" && styles.tabBtnActive]}
            onPress={() => setActiveTab("HISTORY")}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === "HISTORY" && styles.tabBtnTextActive]}>
              Trade History ({historyOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {!isAuthenticated && !isDemoMode ? (
          <AuthRequiredGate
            title="Sign In to View Orders"
            description="Sign in or register an account to view your active open orders, partial fills, and historical trade logs."
          />
        ) : null}

        {/* Loading Spinner */}
        {isLoading && orders.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Syncing order queue...</Text>
          </View>
        ) : currentList.length === 0 ? (
          /* Empty State */
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <FileText color={COLORS.textMuted} size={32} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === "OPEN" ? "No Active Open Orders" : "No Past Trade Executions"}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeTab === "OPEN"
                ? "Active limit orders waiting in the matching book will appear here."
                : "Matched trade fills and executions will show here."}
            </Text>
            <Button
              title="Start Trading"
              size="md"
              variant="primary"
              style={{ marginTop: SPACING.md }}
              icon={<ArrowRight color="#FFFFFF" size={16} />}
              onPress={() => router.push("/(tabs)/trade")}
            />
          </Card>
        ) : (
          /* Orders List */
          <View style={styles.ordersList}>
            {currentList.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xs,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
  },
  tabBtnActive: {
    backgroundColor: "#111827",
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  authNoticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(0, 0, 0, 0.06)",
    borderRadius: 20,
  },
  noticeIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  noticeSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  centerBox: {
    paddingVertical: SPACING.xxxl,
    alignItems: "center",
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  emptyCard: {
    padding: SPACING.xxxl,
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  emptyDesc: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  ordersList: {
    gap: SPACING.md,
  },
});
