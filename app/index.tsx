import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/authStore";

export default function SplashScreen() {
  const router = useRouter();
  const { hydrate, isAuthenticated, token } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Smooth Coinbase-style entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const checkInit = async () => {
      await hydrate();
      setTimeout(() => {
        const state = useAuthStore.getState();
        if (state.isAuthenticated && state.token) {
          router.replace("/(tabs)");
        } else {
          router.replace("/welcome");
        }
      }, 900);
    };

    checkInit();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logoText}>cex</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0052FF", // Iconic Coinbase Electric Blue
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 58,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
    fontFamily: "System",
  },
});
