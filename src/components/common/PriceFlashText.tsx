import React, { useEffect, useRef, useState } from "react";
import { Text, TextStyle, Animated, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";
import { formatCurrency } from "../../utils/formatters";

interface PriceFlashTextProps {
  price: number;
  prefix?: string;
  decimals?: number;
  style?: TextStyle;
}

export const PriceFlashText: React.FC<PriceFlashTextProps> = ({
  price,
  prefix = "$",
  decimals = 2,
  style,
}) => {
  const prevPriceRef = useRef<number>(price);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  useEffect(() => {
    if (prevPriceRef.current !== price && price > 0 && prevPriceRef.current > 0) {
      if (price > prevPriceRef.current) {
        setFlashColor("#10B981"); // Flash Green on Tick UP
      } else if (price < prevPriceRef.current) {
        setFlashColor("#EF4444"); // Flash Red on Tick DOWN
      }

      const timer = setTimeout(() => {
        setFlashColor(null);
      }, 450);

      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = price;
  }, [price]);

  const formatted = `${prefix}${formatCurrency(price.toFixed(decimals))}`;

  return (
    <Text
      style={[
        styles.defaultText,
        style,
        flashColor ? { color: flashColor } : null,
      ]}
      numberOfLines={1}
    >
      {formatted}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
  },
});
