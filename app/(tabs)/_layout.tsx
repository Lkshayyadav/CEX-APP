import React from "react";
import { Tabs, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADIUS } from "../../src/constants/theme";
import * as Haptics from "expo-haptics";
import {
  BarChart2,
  Wallet,
  ArrowRightLeft,
  ClipboardList,
  Flame,
  RefreshCw,
} from "lucide-react-native";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  const handleCenterAction = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push("/(tabs)/swap");
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
        },
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarShowLabel: false,
      }}
      screenListeners={{
        tabPress: () => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        },
      }}
    >
      {/* 1. Markets */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Markets",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <BarChart2 color={focused ? "#111827" : "#94A3B8"} size={22} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />

      {/* 2. Trade */}
      <Tabs.Screen
        name="trade"
        options={{
          title: "Trade",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Flame color={focused ? "#111827" : "#94A3B8"} size={22} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />

      {/* 3. Center Glowing Action Button (Instant Swap with Curved Dual Swap Arrows) */}
      <Tabs.Screen
        name="swap"
        options={{
          title: "Swap",
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.centerBtnWrapper}
              onPress={handleCenterAction}
            >
              <View style={styles.centerBtnOuter}>
                <ArrowRightLeft color="#FFFFFF" size={22} strokeWidth={2.6} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* 4. Orders */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <ClipboardList color={focused ? "#111827" : "#94A3B8"} size={22} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />

      {/* 5. Wallet */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Wallet color={focused ? "#111827" : "#94A3B8"} size={22} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
    paddingTop: 8,
    elevation: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 32,
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: "#111827",
  },
  centerBtnWrapper: {
    alignItems: "center",
    justifyContent: "center",
    top: -12,
  },
  centerBtnOuter: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});
