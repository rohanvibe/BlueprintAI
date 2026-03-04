# 🟦 BlueprintAI

**BlueprintAI** is a premium, AI-powered scaffolding tool that transforms simple project ideas into complete, professional folder structures and starter files. 

![Project Icon](./icons/icon-192.png)

## 🚀 Key Features

- **AI-Driven Scaffolding**: Powered by **SambaNova AI (Llama 3.3)** for lightning-fast, intelligent structure generation.
- **Context-Aware Design**: Automatically identifies the nature of your project (School vs. Software) and adjusts file types (e.g., `.txt` for reports, `.js` for code).
- **Zero-Knowledge Security**: User API keys are never stored on the server. Requests for BYOK users are made directly from the browser to SambaNova.
- **Persistent History**: Keeps your last 20 generations saved locally in your browser.
- **Full PWA Support**: Install it on your Desktop or Mobile for a native-app experience, complete with offline support via Service Workers.
- **Interactive Previews**: Preview generated file content in a sleek, glassmorphism modal before downloading.
- **Project Success Suite**: Includes an AI-generated **Roadmap**, curated **Resources**, and professional **Presentation Tips**.
- **Project Assistant**: An interactive AI chat assistant to help you navigate and optimize your generated structure.
- **One-Click Export**: Download your entire architecture as a structured `.zip` file instantly.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JS, Tailwind CSS, Google Material Symbols.
- **Backend**: Node.js, Express.
- **AI Integration**: SambaNova Cloud (OpenAI-compatible SDK).
- **Libraries**: JSZip (ZIP generation), Dotenv (Config).

## 📥 Getting Started

### 1. Prerequisites
- Node.js installed.
- A **SambaNova API Key** (Get one at [SambaNova Cloud](https://cloud.sambanova.ai/)).

### 2. Installation
```bash
git clone https://github.com/rohanvibe/BlueprintAI.git
cd BlueprintAI
npm install
```

### 3. Configuration
Create a `.env` file in the root directory:
```env
SAMBANOVA_API_KEY=your_secret_key_here
PORT=3000
```

### 4. Running the App
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

## 🛡️ Security & Privacy

- **Server-Side API**: Your `.env` key is used only for the initial 5 free "Universal Tier" prompts.
- **Client-Side BYOK**: When a user provides their own key in Settings, the app bypasses the server and connects directly to `api.sambanova.ai`.
- **Local Storage**: Generation history and user keys are stored entirely in your local browser storage.

## 📱 PWA Installation
This app is a Progressive Web App. To install:
1. Open the app in Chrome/Edge/Safari.
2. Click the **Install** icon in the address bar or select **"Add to Home Screen"** on mobile.

---
Built with 💙 by the BlueprintAI Team.
