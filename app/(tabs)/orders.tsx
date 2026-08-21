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
import { useAuthStore } from "../../src/store/authStore";
import { useOrderStore } from "../../src/store/orderStore";
import { FileText, ArrowRight, Lock, Clock, CheckCircle2 } from "lucide-react-native";

export default function OrdersTabScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.electricBlue}
            colors={[COLORS.electricBlue]}
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

        {/* Guest Warning Card */}
        {!isAuthenticated ? (
          <Card elevated style={styles.authNoticeCard}>
            <View style={styles.noticeIconBox}>
              <Lock color={COLORS.electricBlueBright} size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Sign in to view live order history</Text>
              <Text style={styles.noticeSub}>Track active limit orders and fills in real time</Text>
            </View>
            <Button
              title="Sign In"
              size="sm"
              variant="primary"
              onPress={() => router.push("/(auth)/login")}
            />
          </Card>
        ) : null}

        {/* Loading Spinner */}
        {isLoading && orders.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={COLORS.electricBlue} size="large" />
            <Text style={styles.loadingText}>Syncing order queue...</Text>
          </View>
        ) : currentList.length === 0 ? (
          /* Empty State */
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <FileText color={COLORS.textSecondary} size={32} />
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
              icon={<ArrowRight color="#080A11" size={16} />}
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
    gap: SPACING.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.lg,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: COLORS.textPrimary,
  },
  authNoticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.borderBlue,
  },
  noticeIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(59, 130, 246, 0.15)",
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
    backgroundColor: COLORS.surface,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  ordersList: {
    gap: SPACING.md,
  },
});
