# SentinelSOC Frontend React Dashboard

The frontend serves as the centralized view mapping automated telemetry fed by the SentinelSOC Node/Python backend systems. 

## Technical Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 w/ PostCSS
- **Routing**: React Router DOM (v7)
- **Real-Time Engine**: Socket.IO Client (streaming direct Correlator incidents)
- **Charts**: Recharts & Luxon date mapping
- **Icons**: Lucide React

## Setup Instructions

### 1. Installation
Ensure you are running Node.js >= 20.
```bash
cd frontend
npm install
```

### 2. Startup
Run the Vite development server. By default, it runs on port 5173 and expects the Node.js API to be available at `localhost:4000`.

```bash
npm run dev
```

## Features Deep-Dive
- **Socket Stream (`Dashboard.jsx`)**: Connects instantly to `ws://localhost:4000`. Injects `HIGH/MEDIUM/LOW` incident tickets parsing exact rules triggered entirely in memory. Contains a Live Velocity chart reflecting risk density over 20-tick sliding windows.
- **Threat Intel Engine (`UrlScanner.jsx`)**: A direct interface mapping `POST /api/scan/url`. Evaluates URLs instantly parsing OpenPhish loaders and AI models.
- **Simulator Sandbox (`SimulationConsole.jsx`)**: Rapid integration testing tool. Triggers backend queuing events like `phish_click` or `new_device` to explicitly force the Security Rule Correlator to trip rules and generate a `HIGH` severity websocket broadcast.
- **Device Fingerprinting (`App.jsx -> fingerprint.js`)**: Utilizing open-source FingerprintJS with a native fallback hashing scheme to LocalStorage if privacy shields explicitly block third-party profilers.
