import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { COLORS, RADIUS } from "../../src/constants/theme";
import * as Haptics from "expo-haptics";
import {
  TrendingUp,
  BarChart2,
  ArrowRightLeft,
  Wallet,
  ClipboardList,
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.electricBlueBright,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
      }}
      screenListeners={{
        tabPress: () => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
        },
      }}
    >
      {/* 1. Markets (Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Markets",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <TrendingUp color={color} size={21} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />

      {/* 2. Trade Terminal */}
      <Tabs.Screen
        name="trade"
        options={{
          title: "Trade",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <BarChart2 color={color} size={21} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />

      {/* 3. Dedicated Instant Swap */}
      <Tabs.Screen
        name="swap"
        options={{
          title: "Swap",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <ArrowRightLeft color={color} size={21} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />

      {/* 4. Orders History */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <ClipboardList color={color} size={21} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />

      {/* 5. Wallet Balance & Assets */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <Wallet color={color} size={21} />
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
    backgroundColor: "rgba(8, 11, 17, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    elevation: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.electricBlueBright,
  },
});
