# ⚡ CEX — High-Frequency Centralized Crypto Exchange Mobile App

An institutional-grade, real-time cryptocurrency exchange mobile application built with **React Native (Expo SDK 57)**, **TypeScript**, **Zustand**, and **TradingView SVG Charts**, connected to an in-memory **Order Matching Engine** and **Binance Public Spot WebSocket Stream**.

[![Download Android APK](https://img.shields.io/badge/📲_Download_Android_APK-Direct_Install-0052FF?style=for-the-badge&logo=android&logoColor=white)](https://expo.dev/accounts/lkshay/projects/cex-app/builds/91847d30-d854-42a6-ba4f-48139d2d5dd0)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-0052FF?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-Expo_v57-61DAFB?style=for-the-badge&logo=react&logoColor=black)

---

## 📲 Install & Try on Android

You can download and install the latest standalone APK directly on any Android device:

👉 **[Download CEX Mobile APK (v1.0.0)](https://expo.dev/accounts/lkshay/projects/cex-app/builds/91847d30-d854-42a6-ba4f-48139d2d5dd0)**

---

## 🌟 Key Platform Features

### 1. 🎨 Clean Frost & Ceramic Luxury UI Theme
* Designed with high-density ceramic card surfaces (`#FFFFFF`), frost canvas (`#EDF1F7`), high-contrast jet-black pill buttons, and Apple iOS-style `BlurView` frosted glass overlays.
* Floating bottom navigation with a center glowing **Sunrise Orange Instant Swap button (`#FF7A00`)**.
* Eye privacy visibility toggle for masking portfolio balance (`$ ••••••••`).

### 2. 📊 20 Liquid Markets with Dual-Stream Ingestion
* **Global Market Oracle**: Live Binance WebSockets streaming **20 top cryptocurrencies** (`BTC`, `ETH`, `SOL`, `BNB`, `XRP`, `DOGE`, `ADA`, `AVAX`, `LINK`, `SUI`, `DOT`, `NEAR`, `APT`, `LTC`, `SHIB`, `UNI`, `ATOM`, `ARB`, `OP`, `POL`).
* **Throttled Batch Ingestion**: Ingests high-frequency ticks with 400ms batching for smooth 60fps rendering without UI thread blockage.

### 3. 📈 TradingView Market Intelligence & Multi-Timeframe Charts
* **TradingView-Style Area Graphs**: Fine micro-volatility polyline with vertical gradient area fill and reference baseline on every coin card.
* **Technical Analysis Consensus**: Real-time consensus gauge (`Strong Buy`, `Buy`, `Neutral`, `Sell`) with RSI(14) oscillator and Moving Average breakdown.
* **Bid vs Ask Order Flow**: Live visual buyer vs seller depth ratio.
* **Valuation & Supply Profile**: Market Cap Rank, ATH price & % distance, and Circulating Supply metrics.

### 4. ⚡ High-Frequency Trade Terminal
* **In-Memory Matching Engine**: Low-latency trade execution with limit/market matching.
* **Live Order Book & Recent Trades**: Real-time bid/ask depth visualization.
* **Authentication Gating**: Guest protection and demo testing sandbox with `$25,000` simulated funds.

### 5. 🔀 Zero-Slippage Atomic Swap
* Instant multi-token swaps (`USDT`, `BTC`, `ETH`, `SOL`) with real-time rate calculators and gasless instant execution.

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             CEX MOBILE APP (Expo)            │
                               │  - 20 Liquid Markets    - Trade Terminal     │
                               │  - Instant Swap         - Orders & Wallet    │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
         ┌───────────────────────────┐                                 ┌───────────────────────────┐
         │   Binance Spot Oracle     │                                 │   CEX Backend Engine      │
         │  - WebSocket (20 Streams) │                                 │  - In-Memory Match Engine │
         │  - 24h Tickers & Sparkline│                                 │  - Order Book WebSocket   │
         │  - 8-Timeframe Klines     │                                 │  - PostgreSQL + Redis     │
         └───────────────────────────┘                                 └───────────────────────────┘
```

---

## 🚀 Getting Started Locally

```bash
# 1. Clone repository
git clone https://github.com/Lkshayyadav/CEX-APP.git
cd CEX-APP

# 2. Install dependencies
npm install

# 3. Start Expo Dev Server
npx expo start
```

---

## 📱 Tech Stack

* **Framework**: React Native with Expo SDK 57 & Expo Router
* **Language**: TypeScript (Strict mode)
* **State Management**: Zustand
* **Graphics & Charts**: React Native SVG & Expo Blur
* **Haptics & Security**: Expo Haptics & Expo SecureStore
* **Networking**: Axios & Native WebSockets

---

## 📄 License
MIT License. Created by [Lakshay Yadav](https://github.com/Lkshayyadav).
