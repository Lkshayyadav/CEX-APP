import React from "react";
import { View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { COLORS } from "../../constants/theme";

interface SparklineProps {
  data?: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
  color?: string;
  showGradient?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  isPositive = true,
  width = 90,
  height = 32,
  color,
  showGradient = true,
}) => {
  const lineColor = color || (isPositive ? COLORS.buyGreen : COLORS.sellRed);
  const gradientId = `grad-${isPositive ? "green" : "red"}-${Math.floor(Math.random() * 1000)}`;

  // Real data normalization or clean baseline
  const points =
    data && data.length >= 2
      ? data
      : isPositive
      ? [10, 12, 11, 14, 13, 16, 18]
      : [18, 16, 17, 14, 15, 12, 10];

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const paddingY = 4;
  const plotHeight = height - paddingY * 2;

  // Build SVG path
  const coordinates = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * plotHeight;
    return { x, y };
  });

  // Smooth bezier curve generator
  let pathD = `M ${coordinates[0].x} ${coordinates[0].y}`;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p0 = coordinates[i];
    const p1 = coordinates[i + 1];
    const midX = (p0.x + p1.x) / 2;
    pathD += ` Q ${p0.x} ${p0.y}, ${midX} ${(p0.y + p1.y) / 2} T ${p1.x} ${p1.y}`;
  }

  const closedPathD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <View style={{ width, height, overflow: "hidden" }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {showGradient ? <Path d={closedPathD} fill={`url(#${gradientId})`} /> : null}

        <Path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};
