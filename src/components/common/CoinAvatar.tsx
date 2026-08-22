import React, { useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS, RADIUS } from "../../constants/theme";

interface CoinAvatarProps {
  symbol: string;
  size?: number;
}

// Official High-Resolution Crypto Logos from Official CDN
const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  USDT: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  BNB: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  XRP: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
  ADA: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
  LINK: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
  SUI: "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png",
  DOT: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
  NEAR: "https://assets.coingecko.com/coins/images/10365/large/near.png",
  APT: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png",
  LTC: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
  UNI: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
  ATOM: "https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png",
  ARB: "https://assets.coingecko.com/coins/images/16547/large/arbitrum-shield.png",
  OP: "https://assets.coingecko.com/coins/images/25244/large/Optimism.png",
  POL: "https://assets.coingecko.com/coins/images/4713/large/polygon.png",
};

const COIN_FALLBACK_COLORS: Record<string, { bg: string; text: string; border: string; char: string }> = {
  BTC: { bg: "rgba(247, 147, 26, 0.16)", text: "#F7931A", border: "rgba(247, 147, 26, 0.35)", char: "₿" },
  ETH: { bg: "rgba(98, 126, 234, 0.16)", text: "#627EEA", border: "rgba(98, 126, 234, 0.35)", char: "Ξ" },
  SOL: { bg: "rgba(20, 241, 149, 0.16)", text: "#14F195", border: "rgba(20, 241, 149, 0.35)", char: "◎" },
  USDT: { bg: "rgba(38, 161, 123, 0.16)", text: "#26A17B", border: "rgba(38, 161, 123, 0.35)", char: "₮" },
  BNB: { bg: "rgba(243, 186, 47, 0.16)", text: "#F3BA2F", border: "rgba(243, 186, 47, 0.35)", char: "B" },
  XRP: { bg: "rgba(35, 41, 47, 0.35)", text: "#111827", border: "rgba(0, 0, 0, 0.15)", char: "X" },
  DOGE: { bg: "rgba(194, 166, 51, 0.16)", text: "#C2A633", border: "rgba(194, 166, 51, 0.35)", char: "Ð" },
  ADA: { bg: "rgba(0, 51, 173, 0.2)", text: "#3B82F6", border: "rgba(59, 130, 246, 0.4)", char: "₳" },
  AVAX: { bg: "rgba(232, 65, 66, 0.16)", text: "#E84142", border: "rgba(232, 65, 66, 0.35)", char: "A" },
  LINK: { bg: "rgba(55, 91, 210, 0.16)", text: "#375BD2", border: "rgba(55, 91, 210, 0.35)", char: "⬡" },
  SUI: { bg: "rgba(78, 163, 248, 0.16)", text: "#4EA3F8", border: "rgba(78, 163, 248, 0.35)", char: "S" },
  DOT: { bg: "rgba(230, 0, 122, 0.16)", text: "#E6007A", border: "rgba(230, 0, 122, 0.35)", char: "●" },
  NEAR: { bg: "rgba(0, 0, 0, 0.12)", text: "#000000", border: "rgba(0, 0, 0, 0.25)", char: "N" },
  APT: { bg: "rgba(33, 37, 41, 0.12)", text: "#212529", border: "rgba(0, 0, 0, 0.2)", char: "A" },
  LTC: { bg: "rgba(52, 95, 159, 0.16)", text: "#345F9F", border: "rgba(52, 95, 159, 0.35)", char: "Ł" },
  SHIB: { bg: "rgba(255, 164, 0, 0.16)", text: "#FFA400", border: "rgba(255, 164, 0, 0.35)", char: "S" },
  UNI: { bg: "rgba(255, 0, 122, 0.16)", text: "#FF007A", border: "rgba(255, 0, 122, 0.35)", char: "🦄" },
  ATOM: { bg: "rgba(46, 49, 72, 0.16)", text: "#2E3148", border: "rgba(46, 49, 72, 0.35)", char: "⚛" },
  ARB: { bg: "rgba(40, 160, 240, 0.16)", text: "#28A0F0", border: "rgba(40, 160, 240, 0.35)", char: "A" },
  OP: { bg: "rgba(255, 4, 32, 0.16)", text: "#FF0420", border: "rgba(255, 4, 32, 0.35)", char: "O" },
  POL: { bg: "rgba(130, 71, 229, 0.16)", text: "#8247E5", border: "rgba(130, 71, 229, 0.35)", char: "P" },
};

export const CoinAvatar: React.FC<CoinAvatarProps> = ({ symbol, size = 36 }) => {
  const cleanSymbol = (symbol || "BTC").toUpperCase().split("/")[0].trim();
  const logoUri = CRYPTO_LOGOS[cleanSymbol];
  const [imageError, setImageError] = useState(false);

  const fallback = COIN_FALLBACK_COLORS[cleanSymbol] || {
    bg: COLORS.surfaceElevated,
    text: COLORS.textPrimary,
    border: COLORS.border,
    char: cleanSymbol.slice(0, 2),
  };

  const fontSize = size >= 40 ? 16 : size >= 32 ? 13 : 11;

  if (logoUri && !imageError) {
    return (
      <View
        style={[
          styles.imageWrapper,
          {
            width: size,
            height: size,
            borderRadius: RADIUS.full,
          },
        ]}
      >
        <Image
          source={{ uri: logoUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: RADIUS.full,
          backgroundColor: fallback.bg,
          borderColor: fallback.border,
        },
      ]}
    >
      <Text
        style={[
          styles.symbolText,
          {
            color: fallback.text,
            fontSize,
          },
        ]}
        numberOfLines={1}
      >
        {fallback.char}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    overflow: "hidden",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  symbolText: {
    fontWeight: "900",
    letterSpacing: -0.2,
  },
});
