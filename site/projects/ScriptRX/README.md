# 📛 ScriptRX - Professional Security Command Builder

![](https://i.gyazo.com/79f65e19c93135b696ec44a435f206f9.png)
**One-liner:** Generate production-ready security tool commands with comprehensive parameter configuration for penetration testing workflows.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🛠 Built With

- **Express.js** - Lightweight web framework for API endpoints
- **Node.js** - JavaScript runtime for server-side execution
- **Vanilla JavaScript** - Pure JS for dynamic form logic
- **ANTIMEME CSS** - Custom retro terminal aesthetic

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ installed
- npm package manager

### Installation & Run
```bash
git clone https://github.com/outerheaven199X/ScriptRX.git
cd ScriptRX
npm install
npm start
```

Server runs on `http://localhost:3333`

## 🎮 Usage

### Web Interface
Navigate to `http://localhost:3333` for the full parameter-driven interface.

### Example Workflows

**Generate Nmap Command:**
1. Select "NMAP - NETWORK SCANNER"
2. Enter target: `192.168.1.0/24`
3. Choose scan type, ports, timing
4. Select detection options
5. Generate: `nmap -sS -p- -T4 -sV -sC 192.168.1.0/24`

**Generate SQLMap Command:**
1. Select "SQLMAP - SQL INJECTION TOOL"
2. Enter URL: `http://target.com/login.php`
3. Configure method, data, level/risk
4. Generate: `sqlmap -u "http://target.com/login.php" --method=POST --data="user=admin&pass=test" --level=3 --dbs --batch`

## ✨ Features

### 🔧 **Comprehensive Tool Support**
- **Nmap** - Network scanning with 9 scan types, port specifications, timing templates
- **John the Ripper** - Password cracking with 5 attack modes, 12 hash formats
- **Metasploit** - Exploitation framework with popular modules and payloads
- **SQLMap** - SQL injection testing with techniques, levels, and actions
- **Hydra** - Brute force attacks on 14+ services with wordlist support
- **Gobuster** - Directory enumeration with 4 modes and extensive options

### 🎯 **Smart Parameter Configuration**
- **Dynamic Forms** - Options appear/hide based on selections
- **Real-time Validation** - Required fields checked before generation
- **Intelligent Defaults** - Pre-populated with common security values
- **Custom Wordlists** - Support for user-defined paths and lists
- **Service-Specific Logic** - Context-aware parameter sets

### 🌐 **Professional Interface**
- **Retro Terminal Aesthetic** - ANTIMEME design system with scan lines
- **Parameter-Driven UX** - No templates, real command building
- **Copy & Save Functions** - One-click clipboard and file export
- **Tool Recommendations** - Curated security tool suggestions
- **Real-time Clock** - UTC timestamp display

## 🖼 Visuals

![ScriptRX Interface](screenshot.png)
*Professional parameter-driven interface with retro terminal styling*

## 🔧 Configuration

### Environment Variables
```bash
PORT=3333  # Server port (default: 3333)
```

### Supported Tools & Parameters

| Tool | Parameters | Use Cases |
|------|------------|-----------|
| **Nmap** | 9 scan types, port specs, timing, detection | Network discovery, service enumeration |
| **John** | 5 attack modes, 12 hash formats, wordlists | Password cracking, hash analysis |
| **Metasploit** | Exploit modules, payloads, targets | Vulnerability exploitation |
| **SQLMap** | Techniques, levels, actions, tampering | SQL injection testing |
| **Hydra** | 14+ services, threading, wordlists | Brute force authentication |
| **Gobuster** | 4 modes, extensions, status codes | Directory/subdomain enumeration |

## 🧪 Testing

```bash
# Test all endpoints
npm test

# Test individual tools
curl http://localhost:3333/api/recommend
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🗺 Roadmap

- **Additional Tools** - Burp Suite, Wireshark, Aircrack-ng integration
- **Command History** - Save and replay previous configurations
- **Team Collaboration** - Share command configurations
- **API Extensions** - REST API for programmatic access
- **Plugin System** - Custom tool integrations

---

**⚠️ SECURITY NOTICE:** This tool generates commands for authorized security testing only. Always ensure you have proper authorization before using generated commands in any environment. Unauthorized access to computer systems is illegal.

**🎯 TARGET AUDIENCE:** Security professionals, penetration testers, red team operators, security researchers, and cybersecurity students conducting authorized testing.
