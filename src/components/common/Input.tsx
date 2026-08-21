import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={COLORS.textMuted}
          style={styles.textInput}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.rightIcon}
          >
            {showPassword ? (
              <EyeOff color={COLORS.textSecondary} size={18} />
            ) : (
              <Eye color={COLORS.textSecondary} size={18} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs + 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceElevated,
  },
  inputError: {
    borderColor: COLORS.sellRed,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    padding: SPACING.xs,
  },
  textInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.sellRed,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});
