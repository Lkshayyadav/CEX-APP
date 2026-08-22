import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  PanResponder,
} from "react-native";
import Svg, { Rect, Line, Text as SvgText, G } from "react-native-svg";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";
import { marketApi } from "../../api/market.api";
import { useWebSocketStream } from "../../hooks/useWebSocket";
import { Candle } from "../../types";
import { BarChart2, Sun, Moon, Maximize2, X, RotateCcw, LineChart } from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TIMEFRAMES = ["1m", "15m", "1h", "1d"];

interface CandlestickChartProps {
  symbol: string;
}

export const CandlestickChartView: React.FC<CandlestickChartProps> = ({ symbol }) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState("1d");
  const [chartTheme, setChartTheme] = useState<"dark" | "light">("light");
  const [loading, setLoading] = useState(true);
  
  // Interactive Scale States
  const [candleZoom, setCandleZoom] = useState(1.0);
  const [verticalScale, setVerticalScale] = useState(1.0);
  const [selectedCandleIndex, setSelectedCandleIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const cleanSymbol = symbol.replace("/", "_").toUpperCase();
  
  const lastTouchYRef = useRef<number | null>(null);
  const initialPinchDistRef = useRef<number | null>(null);
  const baseZoomRef = useRef(1.0);

  // Vertical Price Scale Drag Responder
  const priceScalePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        lastTouchYRef.current = evt.nativeEvent.pageY;
      },
      onPanResponderMove: (evt) => {
        if (lastTouchYRef.current !== null) {
          const deltaY = lastTouchYRef.current - evt.nativeEvent.pageY;
          lastTouchYRef.current = evt.nativeEvent.pageY;
          setVerticalScale((prev) => {
            const factor = 1 + deltaY * 0.008;
            return Math.min(Math.max(prev * factor, 0.4), 3.0);
          });
        }
      },
      onPanResponderRelease: () => {
        lastTouchYRef.current = null;
      },
    })
  ).current;

  // Chart Canvas Pinch-to-zoom (2 touches)
  const chartPinchResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          initialPinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
          baseZoomRef.current = candleZoom;
        }
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2 && initialPinchDistRef.current) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const currentDist = Math.sqrt(dx * dx + dy * dy);
          const factor = currentDist / initialPinchDistRef.current;
          const newZoom = Math.min(Math.max(baseZoomRef.current * factor, 0.5), 2.5);
          setCandleZoom(newZoom);
        }
      },
      onPanResponderRelease: () => {
        initialPinchDistRef.current = null;
      },
    })
  ).current;

  // Real backend candles fetch matching web CandlestickChart.tsx (Zero Fake Data)
  const fetchCandles = async () => {
    setLoading(true);
    try {
      const data = await marketApi.getMarketCandles(symbol, timeframe);
      if (data && Array.isArray(data) && data.length > 0) {
        const sorted = [...data]
          .map((c) => ({
            time: typeof c.time === "number" ? c.time : Math.floor(new Date(c.time).getTime() / 1000),
            open: c.open.toString(),
            high: c.high.toString(),
            low: c.low.toString(),
            close: c.close.toString(),
            volume: c.volume ? c.volume.toString() : "0",
          }))
          .sort((a, b) => a.time - b.time);
        setCandles(sorted);
      } else {
        setCandles([]);
      }
    } catch (err) {
      console.warn("[CandleChart] Real candles query:", err);
      setCandles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandles();
    setSelectedCandleIndex(null);
  }, [symbol, timeframe]);

  useEffect(() => {
    if (!loading && candles.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [loading, candles]);

  // Live WebSocket trade tick sync
  useWebSocketStream(`trade:${cleanSymbol}`, (payload: any) => {
    if (payload?.trades && payload.trades.length > 0) {
      const trade = payload.trades[0];
      const tradePrice = parseFloat(trade.price);
      if (!isNaN(tradePrice)) {
        setCandles((prev) => {
          if (prev.length === 0) {
            // First live candle
            return [
              {
                time: Math.floor(Date.now() / 1000),
                open: tradePrice.toString(),
                high: tradePrice.toString(),
                low: tradePrice.toString(),
                close: tradePrice.toString(),
                volume: trade.quantity ? trade.quantity.toString() : "1.0",
              },
            ];
          }
          const last = { ...prev[prev.length - 1] };
          const high = Math.max(parseFloat(last.high), tradePrice).toFixed(2);
          const low = Math.min(parseFloat(last.low), tradePrice).toFixed(2);
          last.high = high;
          last.low = low;
          last.close = tradePrice.toFixed(2);
          return [...prev.slice(0, prev.length - 1), last];
        });
      }
    }
  });

  const handleResetView = () => {
    setCandleZoom(1.0);
    setVerticalScale(1.0);
    setSelectedCandleIndex(null);
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const isLight = chartTheme === "light";

  const {
    slotWidth,
    totalCanvasWidth,
    chartHeight,
    renderedCandles,
    priceGrid,
  } = useMemo(() => {
    const chartHeight = isFullscreen ? 340 : 190;
    const paddingY = 18;
    const plotHeight = chartHeight - paddingY * 2;

    if (candles.length === 0) {
      return {
        slotWidth: 16,
        totalCanvasWidth: SCREEN_WIDTH - 60,
        chartHeight,
        renderedCandles: [],
        priceGrid: [],
      };
    }

    let min = Infinity;
    let max = -Infinity;

    candles.forEach((c) => {
      const high = parseFloat(c.high);
      const low = parseFloat(c.low);
      if (high > max) max = high;
      if (low < min) min = low;
    });

    if (max === min) {
      max += max * 0.05 || 1;
      min -= min * 0.05 || 1;
    }

    const mid = (max + min) / 2;
    const baseSpan = (max - min) / 2;
    const scaledSpan = (baseSpan / verticalScale) || 1;
    const effectiveMax = mid + scaledSpan;
    const effectiveMin = mid - scaledSpan;
    const priceRange = effectiveMax - effectiveMin || 1;

    const baseSlot = isFullscreen ? 24 : 18;
    const slotWidth = Math.max(baseSlot * candleZoom, 10);
    const candleWidth = Math.max(slotWidth * 0.65, 4);
    const totalCanvasWidth = Math.max(candles.length * slotWidth + 80, SCREEN_WIDTH - 60);

    const mapped = candles.map((c, i) => {
      const open = parseFloat(c.open);
      const close = parseFloat(c.close);
      const high = parseFloat(c.high);
      const low = parseFloat(c.low);
      const isBullish = close >= open;

      const x = i * slotWidth + 10;
      const topVal = Math.max(open, close);
      const botVal = Math.min(open, close);

      const yTop = paddingY + ((effectiveMax - topVal) / priceRange) * plotHeight;
      const yBot = paddingY + ((effectiveMax - botVal) / priceRange) * plotHeight;
      const candleHeight = Math.max(yBot - yTop, 2.5);

      const yHigh = paddingY + ((effectiveMax - high) / priceRange) * plotHeight;
      const yLow = paddingY + ((effectiveMax - low) / priceRange) * plotHeight;

      return {
        x,
        yTop,
        candleHeight,
        candleWidth,
        yHigh,
        yLow,
        isBullish,
        open,
        close,
        high,
        low,
        date: new Date(c.time * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      };
    });

    const grid = [
      { label: effectiveMax.toFixed(0), y: paddingY },
      { label: (effectiveMin + priceRange * 0.75).toFixed(0), y: paddingY + plotHeight * 0.25 },
      { label: (effectiveMin + priceRange * 0.5).toFixed(0), y: paddingY + plotHeight * 0.5 },
      { label: (effectiveMin + priceRange * 0.25).toFixed(0), y: paddingY + plotHeight * 0.75 },
      { label: effectiveMin.toFixed(0), y: paddingY + plotHeight },
    ];

    return {
      slotWidth,
      totalCanvasWidth,
      chartHeight,
      renderedCandles: mapped,
      priceGrid: grid,
    };
  }, [candles, candleZoom, verticalScale, isFullscreen]);

  const activeCandle =
    selectedCandleIndex !== null && renderedCandles[selectedCandleIndex]
      ? renderedCandles[selectedCandleIndex]
      : renderedCandles.length > 0
      ? renderedCandles[renderedCandles.length - 1]
      : null;

  const renderCanvasBody = (isModal = false) => {
    if (loading && candles.length === 0) {
      return (
        <View style={[styles.loadingBox, { height: chartHeight }]}>
          <ActivityIndicator color={COLORS.electricBlue} size="small" />
          <Text style={[styles.loadingText, { color: isLight ? "#64748B" : COLORS.textSecondary }]}>
            Syncing live exchange candles...
          </Text>
        </View>
      );
    }

    if (candles.length === 0) {
      return (
        <View
          style={[
            styles.emptyCanvasBox,
            {
              height: chartHeight,
              backgroundColor: isLight ? "#FFFFFF" : "#0C101E",
              borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)",
            },
          ]}
        >
          <LineChart color={isLight ? "#94A3B8" : "#475569"} size={32} />
          <Text style={[styles.emptyCanvasTitle, { color: isLight ? "#1E293B" : "#F8FAFC" }]}>
            No trade candles recorded yet
          </Text>
          <Text style={[styles.emptyCanvasSub, { color: isLight ? "#64748B" : "#94A3B8" }]}>
            Place a live trade for {symbol} to generate the first candlestick!
          </Text>
        </View>
      );
    }

    return (
      <View
        {...chartPinchResponder.panHandlers}
        style={[
          styles.canvasContainer,
          {
            backgroundColor: isLight ? "#FFFFFF" : "#0C101E",
            borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.08)",
          },
        ]}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ minWidth: "100%" }}
        >
          <Svg width={totalCanvasWidth} height={chartHeight}>
            {priceGrid.map((p, idx) => (
              <G key={`grid-${idx}`}>
                <Line
                  x1="0"
                  y1={p.y}
                  x2={totalCanvasWidth}
                  y2={p.y}
                  stroke={isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)"}
                  strokeWidth="1"
                />
              </G>
            ))}

            {renderedCandles.map((c, i) => {
              const candleColor = c.isBullish ? "#10B981" : "#EF4444";
              const midX = c.x + c.candleWidth / 2;
              const isSelected = selectedCandleIndex === i;

              return (
                <G
                  key={`c-${i}`}
                  onPress={() => setSelectedCandleIndex(i)}
                >
                  <Line
                    x1={midX}
                    y1={c.yHigh}
                    x2={midX}
                    y2={c.yLow}
                    stroke={candleColor}
                    strokeWidth={isSelected ? 2 : 1.2}
                  />

                  <Rect
                    x={c.x}
                    y={c.yTop}
                    width={c.candleWidth}
                    height={c.candleHeight}
                    fill={candleColor}
                    rx="1"
                    stroke={isSelected ? "#3B82F6" : "none"}
                    strokeWidth={isSelected ? 1.5 : 0}
                  />

                  {i % 4 === 0 ? (
                    <SvgText
                      x={midX}
                      y={chartHeight - 4}
                      fill={isLight ? "#94A3B8" : "#64748B"}
                      fontSize="8"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {c.date}
                    </SvgText>
                  ) : null}
                </G>
              );
            })}
          </Svg>
        </ScrollView>

        <View
          {...priceScalePanResponder.panHandlers}
          style={[
            styles.priceScaleOverlay,
            { backgroundColor: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(12, 16, 30, 0.95)" },
          ]}
        >
          {priceGrid.map((p, idx) => (
            <Text
              key={`price-${idx}`}
              style={[
                styles.priceScaleText,
                { color: isLight ? "#475569" : "#94A3B8", top: p.y - 6 },
              ]}
            >
              ${`${p.label}`}
            </Text>
          ))}
        </View>

        {!isModal ? (
          <TouchableOpacity
            style={[
              styles.floatingMaximizeBtn,
              {
                backgroundColor: isLight ? "#FFFFFF" : "#182138",
                borderColor: isLight ? "#CBD5E1" : "rgba(255, 255, 255, 0.2)",
              },
            ]}
            onPress={() => setIsFullscreen(true)}
            activeOpacity={0.7}
          >
            <Maximize2 color={isLight ? "#0F172A" : "#FFFFFF"} size={14} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.watermarkBadge} pointerEvents="none">
          <Text style={[styles.watermarkText, { color: isLight ? "#CBD5E1" : "#334155" }]}>
            17 TradingView
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.titleRow}>
          <View style={[styles.iconCircle, { backgroundColor: "#111827" }]}>
            <BarChart2 color="#FFFFFF" size={13} />
          </View>
          <View>
            <Text style={styles.chartTitle}>{symbol} TradingView</Text>
            <Text style={styles.chartSub}>Live Engine Feed</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => setChartTheme(isLight ? "dark" : "light")}
          activeOpacity={0.75}
        >
          {isLight ? <Moon color="#64748B" size={13} /> : <Sun color="#F59E0B" size={13} />}
        </TouchableOpacity>
      </View>

      {activeCandle ? (
        <View style={styles.ohlcRow}>
          <Text style={styles.ohlcText}>
            O: <Text style={styles.ohlcVal}>${`${parseFloat(activeCandle.open.toString()).toFixed(2)}`}</Text>
          </Text>
          <Text style={styles.ohlcText}>
            H: <Text style={styles.ohlcVal}>${`${parseFloat(activeCandle.high.toString()).toFixed(2)}`}</Text>
          </Text>
          <Text style={styles.ohlcText}>
            L: <Text style={styles.ohlcVal}>${`${parseFloat(activeCandle.low.toString()).toFixed(2)}`}</Text>
          </Text>
          <Text style={styles.ohlcText}>
            C:{" "}
            <Text
              style={[
                styles.ohlcVal,
                { color: activeCandle.isBullish ? "#10B981" : "#EF4444" },
              ]}
            >
              ${`${parseFloat(activeCandle.close.toString()).toFixed(2)}`}
            </Text>
          </Text>
        </View>
      ) : null}

      {renderCanvasBody(false)}

      <View style={styles.bottomFilterBar}>
        <View style={styles.timeframePills}>
          {TIMEFRAMES.map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[styles.tfBtn, timeframe === tf && styles.tfBtnActive]}
              onPress={() => setTimeframe(tf)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tfBtnText, timeframe === tf && styles.tfBtnTextActive]}>
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.resetViewBtn}
          onPress={handleResetView}
          activeOpacity={0.75}
        >
          <RotateCcw color={COLORS.textSecondary} size={12} />
          <Text style={styles.resetViewText}>Reset View</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isFullscreen} transparent animationType="slide" onRequestClose={() => setIsFullscreen(false)}>
        <View style={styles.fullscreenModalOverlay}>
          <View style={styles.fullscreenModalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <BarChart2 color="#111827" size={18} />
                <Text style={styles.modalTitle}>{symbol} Fullscreen Chart</Text>
              </View>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setIsFullscreen(false)}
              >
                <X color={COLORS.textPrimary} size={18} />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, justifyContent: "center" }}>
              {renderCanvasBody(true)}
            </View>

            <View style={styles.bottomFilterBar}>
              <View style={styles.timeframePills}>
                {TIMEFRAMES.map((tf) => (
                  <TouchableOpacity
                    key={tf}
                    style={[styles.tfBtn, timeframe === tf && styles.tfBtnActive]}
                    onPress={() => setTimeframe(tf)}
                  >
                    <Text style={[styles.tfBtnText, timeframe === tf && styles.tfBtnTextActive]}>
                      {tf}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.resetViewBtn}
                onPress={handleResetView}
                activeOpacity={0.75}
              >
                <RotateCcw color={COLORS.textSecondary} size={12} />
                <Text style={styles.resetViewText}>Reset View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  chartSub: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
  },
  toolBtn: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.sm,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  ohlcRow: {
    flexDirection: "row",
    gap: SPACING.md,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  ohlcText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  ohlcVal: {
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  canvasContainer: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  emptyCanvasBox: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    gap: SPACING.xs + 2,
  },
  emptyCanvasTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  emptyCanvasSub: {
    fontSize: 11,
    textAlign: "center",
  },
  priceScaleOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 56,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.08)",
    paddingLeft: 4,
    justifyContent: "center",
  },
  priceScaleText: {
    position: "absolute",
    right: 4,
    fontSize: 9,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  floatingMaximizeBtn: {
    position: "absolute",
    top: 8,
    right: 64,
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 10,
  },
  watermarkBadge: {
    position: "absolute",
    bottom: 6,
    left: 8,
  },
  watermarkText: {
    fontSize: 9,
    fontWeight: "900",
  },
  bottomFilterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  timeframePills: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: RADIUS.sm,
    padding: 2,
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tfBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  tfBtnActive: {
    backgroundColor: "#111827",
  },
  tfBtnText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  tfBtnTextActive: {
    color: "#FFFFFF",
  },
  resetViewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8FAFC",
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetViewText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  fullscreenModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: SPACING.md,
  },
  fullscreenModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    padding: SPACING.md,
    height: SCREEN_HEIGHT * 0.74,
    gap: SPACING.sm,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  closeModalBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
});
