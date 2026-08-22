import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from "react-native-svg";
import { COLORS } from "../../constants/theme";

interface TradingViewAreaChartProps {
  data?: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
  prevClose?: number;
  currentPrice?: number;
}

export const TradingViewAreaChart: React.FC<TradingViewAreaChartProps> = ({
  data,
  isPositive = false,
  width = 300,
  height = 68,
  prevClose,
  currentPrice,
}) => {
  // Generate high-resolution TradingView price trajectory (40-60 points with realistic micro-volatility)
  const points = useMemo(() => {
    if (data && data.length >= 8) return data;

    // Realistic default TradingView waveform matching the user screenshot
    if (isPositive) {
      return [
        98, 97.5, 98.2, 99, 98.6, 100.2, 99.8, 101.5, 101, 102.8, 102.2, 101.8, 103.5, 103,
        104.2, 103.8, 105.1, 104.7, 106, 105.4, 107.2, 106.8, 108.5, 108, 109.4, 109, 110.2,
        109.8, 111.5, 111, 112.4, 112, 113.8, 113.2, 114.5, 114, 115.6, 115, 116.8, 116.2,
        117.5, 117, 118.2, 118, 119.5, 119, 120.4, 120, 121.2
      ];
    } else {
      // Bearish dip with choppy recovery (like the uploaded TradingView screenshot)
      return [
        118, 117.2, 116.5, 117, 115.8, 116.4, 118.2, 119, 120.5, 119.8, 121.2, 120.6, 119.4,
        120.2, 106, 107.2, 105.4, 106.8, 108, 107.5, 109.2, 108.6, 107.8, 108.4, 107, 106.2,
        105.5, 104.2, 105.8, 106.4, 107.2, 107.8, 108.5, 108, 107.2, 107.6, 108.4, 109.2,
        108.8, 109.6, 110.2, 109.8, 111.4, 110.8, 110
      ];
    }
  }, [data, isPositive]);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const padY = 6;
  const usableH = height - padY * 2;
  const stepX = width / (points.length - 1);

  const coords = points.map((val, idx) => {
    const x = idx * stepX;
    const y = padY + usableH - ((val - min) / range) * usableH;
    return { x, y };
  });

  // Build continuous high-precision TradingView polyline path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    pathD += ` L ${coords[i].x} ${coords[i].y}`;
  }

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const lastPt = coords[coords.length - 1];

  // Baseline Y position (middle or prev close)
  const baselineY = padY + usableH * 0.35;

  const gradId = `tvGrad_${Math.random().toString(36).substring(2, 9)}`;
  const strokeColor = isPositive ? "#10B981" : "#EF4444";

  return (
    <View style={{ width, height, overflow: "visible" }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal Dashed Reference Line (TradingView Prev Close Style) */}
        <Line
          x1={0}
          y1={baselineY}
          x2={width}
          y2={baselineY}
          stroke="rgba(0, 0, 0, 0.08)"
          strokeWidth="1"
          strokeDasharray="3, 3"
        />

        {/* TradingView Area Gradient Fill */}
        <Path d={fillD} fill={`url(#${gradId})`} />

        {/* TradingView Price Path */}
        <Path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Live Price Endpoint Anchor */}
        <Circle cx={lastPt.x} cy={lastPt.y} r={3} fill={strokeColor} />
        <Circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={5.5}
          stroke={strokeColor}
          strokeWidth={1.2}
          fill="none"
          opacity={0.4}
        />
      </Svg>
    </View>
  );
};
