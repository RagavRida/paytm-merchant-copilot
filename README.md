# 🚀 Paytm AI Merchant Copilot

> **Voice-First, Multilingual Physical Shop Onboarding Agent** built for the Paytm Hackathon, powered by **Sarvam AI**.

Merchants can onboard their business by speaking naturally in their preferred Indic language without typing. The agent autonomously determines when to suggest camera usage to capture shop exterior signage and interior setup, extracts structured merchant data, and guides them through official Paytm verification.

---

## 🌟 Key Features

- **🎙️ Voice-First Primary Interface**: Speak naturally in your native language. No typing required.
- **🇮🇳 Multilingual & Code-Mixing**: Automatic language detection supporting Telugu, Hindi, English, Tamil, Kannada, and Romanized speech (e.g., *"Naa shop Kukatpally lo undi"*).
- **⚡ Barge-in & Interruption Support**: Web Audio API-powered instant playback cancellation when the merchant interrupts the AI.
- **📸 Intelligent Camera Decisions**: The AI proactively suggests camera inspection for shop exterior signage and interior merchandise when appropriate.
- **🧠 Sarvam AI Intelligence**:
  - **Speech-to-Text (`saaras:v4`)**: 22+ Indic languages + Indian English with auto-detection.
  - **Text-to-Speech (`bulbul:v4-flash`)**: Low-latency persona voices (`kavitha_te_conversation`, `simran_en_customer`, `ritu_hi_customer`).
  - **Dialogue & Extraction (`sarvam-105b-conversations`)**: 32K context dialogue model generating structured JSON actions and extracted fields.
- **🔄 Voice Corrections**: Effortlessly correct information verbally (e.g., *"Actually, my shop is in Miyapur, not Kukatpally"*).
- **🔒 Privacy & Compliance**: Disclaims that photo inspection does not verify legal ownership or approve KYC; directs merchants to official Paytm verification channels.
- **💾 Persistent State**: Full localStorage session persistence across page refreshes.
- **⌨️ Accessibility Fallback**: Expandable text input available at any time.

---

## 🏗️ Architecture

```
[Merchant Voice / Camera]
       │
       ▼
[Web Audio API + VAD] ────► [POST /api/voice/stt] ────► [Sarvam saaras:v4]
                                                               │ (Transcript + Lang)
                                                               ▼
[Audio Player / Barge-In] ◄── [POST /api/voice/tts] ◄─── [POST /api/assistant/chat]
       ▲                      [Sarvam bulbul:v4]       [Sarvam 105b Conversations]
       │                                                       │
[Spoken Audio to Merchant]                                     ▼
                                                    [Structured Agent JSON]
                                                    - Spoken Response
                                                    - Actions (OPEN_CAMERA)
                                                    - Extracted Profile Fields
                                                    - Next Stage
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19, TypeScript)
- **Styling**: Tailwind CSS 4 with custom voice animations & waveforms
- **AI / Speech Engine**: Sarvam AI (`sarvam-105b-conversations`, `saaras:v4`, `bulbul:v4-flash`)
- **Validation**: Zod schema parsing & sanitization
- **Audio & Media**: Web Audio API, MediaRecorder, HTML5 Canvas & Camera API

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Sarvam AI API Key ([https://www.sarvam.ai/](https://www.sarvam.ai/))

### 2. Installation
```bash
git clone https://github.com/RagavRida/paytm-merchant-copilot.git
cd paytm-merchant-copilot
npm install
```

### 3. Environment Setup
Create a `.env.local` file:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 Testing the Demo Flow

Run the automated integration test suite validating end-to-end voice and Telugu flows:
```bash
node test-voice-journey.mjs
```

---

## 📄 License
MIT
