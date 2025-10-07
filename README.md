# 🌐 NIKKIKAELAR.html

Professional portfolio website showcasing interactive security tools and development projects with a minimalist, terminal-inspired design.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

## 🛠 Built With

- **Node.js** — Backend server and tool APIs
- **Express.js** — Web server framework
- **HTML5/CSS3** — Frontend structure and styling
- **Vanilla JavaScript** — Client-side routing and interactions
- **SQLite** — Data storage for audit logging

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start the portfolio server
cd site && npm start

# Or use the simple server
cd site && node simple-server.js
```

**Default URL:** `http://localhost:8080`

## 🎮 Usage

### Portfolio Navigation

```bash
npm start
```

Navigate to `http://localhost:8080` and:

1. **Browse sections** — About, Tools, Help
2. **Click tool tabs** — SCRIPTRX, OMNI, HONEY, DATABOX
3. **Launch tools** — Interactive demos open in new windows
4. **Keyboard shortcuts** — Ctrl/⌘ + 1-6 for quick navigation

### Individual Tools

Each tool runs independently:

- **SCRIPTRX** — AI-powered script generation for security tools
- **DATABOX** — LLM interaction platform with audit logging
- **DECOY** — Network honeypot monitoring system
- **OMNI** — Open source dashboard with weather and air quality

## ✨ Features

- **Interactive Tool Suite** — 4 fully functional security and utility tools
- **Terminal Aesthetic** — Monospace fonts and command-line styling
- **Responsive Design** — Works on desktop and mobile
- **Keyboard Navigation** — Ctrl/⌘ + number shortcuts
- **Real-time Tools** — Live script generation, network monitoring, AI chat
- **Audit Logging** — Comprehensive activity tracking
- **Custom Domain** — Served at outerheaven.ink

## 🖼 Visuals

![Portfolio Interface](https://via.placeholder.com/800x400/000000/ffffff?text=NIKKIKAELAR.html+Portfolio)

*Professional portfolio with interactive security tools and minimalist terminal design.*

## 🔧 Configuration

### Environment Variables

```bash
# Server port (default: 8080)
PORT=3000

# Database path (for tools with persistence)
DB_PATH=./data/app.db
```

### Tool Configuration

Each tool has its own configuration:

- **SCRIPTRX** — Template-based script generation
- **DATABOX** — LLM adapter configuration
- **DECOY** — Network monitoring settings
- **OMNI** — API keys for external services

## 🧪 Testing

```bash
# Test individual tools
cd RxSCRIPT && npm test
cd databox && npm test

# Test main site
cd site && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-tool`
3. Commit changes: `git commit -m 'Add amazing security tool'`
4. Push to branch: `git push origin feature/amazing-tool`
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🗺 Roadmap

- **Enhanced Security Tools** — Additional penetration testing utilities
- **Real-time Collaboration** — Multi-user tool sessions
- **API Documentation** — Comprehensive tool API references
- **Mobile Optimization** — Enhanced mobile tool interfaces
- **Performance Monitoring** — Tool usage analytics and optimization