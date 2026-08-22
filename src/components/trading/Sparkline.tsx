import React from "react";
import { View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { COLORS } from "../../constants/theme";

interface SparklineProps {
  data?: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
  showEndpoint?: boolean;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  isPositive = true,
  width = 300,
  height = 50,
  showEndpoint = true,
  strokeWidth = 2.4,
}) => {
  // Smooth natural points matching the interior chart style
  const defaultPoints = isPositive
    ? [100, 103, 101, 107, 105, 111, 109, 116, 114, 120]
    : [120, 117, 118, 112, 114, 108, 110, 104, 106, 100];

  const points = data && data.length >= 4 ? data : defaultPoints;

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

  // Build cubic Bezier curve path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cpX1 = curr.x + (next.x - curr.x) / 2;
    const cpY1 = curr.y;
    const cpX2 = curr.x + (next.x - curr.x) / 2;
    const cpY2 = next.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const lastPt = coords[coords.length - 1];

  const fillGradId = `sparkFill_${Math.random().toString(36).substring(2, 9)}`;
  const strokeColor = isPositive ? "#10B981" : "#EF4444";

  return (
    <View style={{ width, height, overflow: "visible" }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Soft Area Gradient Fill under curve */}
        <Path d={fillD} fill={`url(#${fillGradId})`} />

        {/* Smooth Curve Stroke */}
        <Path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {showEndpoint ? (
          <>
            <Circle cx={lastPt.x} cy={lastPt.y} r={3.5} fill={strokeColor} />
            <Circle cx={lastPt.x} cy={lastPt.y} r={6} stroke={strokeColor} strokeWidth={1.5} fill="none" opacity={0.35} />
          </>
        ) : null}
      </Svg>
    </View>
  );
};
