import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Rect, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import { COLORS } from "../../constants/theme";

interface CardCandlestickChartProps {
  data?: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
}

export const CardCandlestickChart: React.FC<CardCandlestickChartProps> = ({
  data,
  isPositive = true,
  width = 280,
  height = 42,
}) => {
  // Generate multi-candle OHLC series from price data
  const candles = useMemo(() => {
    const rawPoints =
      data && data.length >= 8
        ? data
        : isPositive
        ? [100, 102, 98, 105, 104, 108, 106, 112, 110, 115, 113, 118]
        : [118, 115, 116, 110, 112, 107, 108, 103, 105, 99, 101, 96];

    const result = [];
    const candleCount = 10;
    const step = Math.max(Math.floor(rawPoints.length / candleCount), 1);

    for (let i = 0; i < rawPoints.length; i += step) {
      const chunk = rawPoints.slice(i, i + step + 1);
      if (chunk.length === 0) continue;
      const open = chunk[0];
      const close = chunk[chunk.length - 1];
      const high = Math.max(...chunk) * 1.002;
      const low = Math.min(...chunk) * 0.998;
      result.push({ open, close, high, low, isBull: close >= open });
      if (result.length >= candleCount) break;
    }

    return result;
  }, [data, isPositive]);

  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const range = max - min || 1;

  const padY = 4;
  const usableH = height - padY * 2;
  const count = candles.length;
  const candleSpacing = width / count;
  const candleWidth = Math.max(candleSpacing * 0.55, 6);

  return (
    <View style={{ width, height, overflow: "visible" }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {candles.map((c, idx) => {
          const x = idx * candleSpacing + (candleSpacing - candleWidth) / 2;
          const centerX = x + candleWidth / 2;

          const topVal = Math.max(c.open, c.close);
          const botVal = Math.min(c.open, c.close);

          const yTop = padY + usableH - ((topVal - min) / range) * usableH;
          const yBot = padY + usableH - ((botVal - min) / range) * usableH;
          const yHigh = padY + usableH - ((c.high - min) / range) * usableH;
          const yLow = padY + usableH - ((c.low - min) / range) * usableH;

          const barHeight = Math.max(yBot - yTop, 4);
          const color = c.isBull ? "#10B981" : "#EF4444";

          return (
            <React.Fragment key={`cc-${idx}`}>
              {/* Thin Wick */}
              <Line
                x1={centerX}
                y1={yHigh}
                x2={centerX}
                y2={yLow}
                stroke={color}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity={0.85}
              />

              {/* Rounded Candle Body */}
              <Rect
                x={x}
                y={yTop}
                width={candleWidth}
                height={barHeight}
                rx={Math.min(candleWidth / 2, 2.5)}
                fill={color}
                opacity={0.9}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};
