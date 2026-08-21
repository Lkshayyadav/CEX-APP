import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Button } from "./Button";
import { Card } from "./Card";
import { AlertTriangle, RefreshCw } from "lucide-react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.errorCard}>
            <View style={styles.iconCircle}>
              <AlertTriangle color={COLORS.sellRed} size={32} />
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              {this.state.error?.message || "An unexpected error occurred in the mobile app."}
            </Text>
            <Button
              title="Restart Application"
              variant="primary"
              size="md"
              onPress={this.handleReset}
              icon={<RefreshCw color="#080A11" size={16} />}
            />
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  errorCard: {
    padding: SPACING.xxl,
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.sellRed,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.sellRedMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
