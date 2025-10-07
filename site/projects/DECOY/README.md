# 🍯 honey — Browser Honeypot Emulator

![](https://i.imgur.com/o7P0LCF.png)

A 100% browser-native, **safe** honeypot emulator for educational purposes and threat analysis training. No hardware required, no database needed — everything runs in your browser with synthetic traffic simulation.

![Honey Honeypot Emulator](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.3-purple)

## 🎯 What is honey?

**honey** is a browser-based honeypot emulator that simulates network attacks and suspicious activities without requiring any real network infrastructure. It's designed for:

- **Security Education** — Learn about common attack patterns and honeypot analysis
- **Threat Research** — Prototype analysis pipelines before building real honeypots
- **Training** — Practice incident response and threat detection skills
- **Development** — Test security monitoring tools and dashboards

## ✨ Features

### 🚀 **Core Functionality**
- **Real-time Traffic Simulation** — Configurable event generation (1-120 events/minute)
- **Multiple Service Emulation** — Telnet, HTTP, MQTT, SSH with customizable banners
- **Live Timeline Visualization** — Sparkline charts showing event volume over time
- **Advanced Analytics** — Top source IPs, common credentials, HTTP paths, and commands
- **Smart Filtering** — Search by service, severity, or custom JSON queries
- **Import/Export** — Download simulation logs as JSON files

### 🎨 **User Experience**
- **Dot-Matrix Aesthetic** — Industrial, monospace design inspired by terminal interfaces
- **Responsive Design** — Works seamlessly on desktop and mobile devices
- **In-Memory Storage** — No database required, all data stored in browser memory
- **Real-time Updates** — Live statistics and event streaming

### 🔒 **Security & Privacy**
- **100% Safe** — No real network connections or data transmission
- **Synthetic Data Only** — All traffic is generated, no real packets captured
- **Local Processing** — Everything runs in your browser, no external dependencies
- **Educational Focus** — Designed for learning, not production use

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nikkikaelar/honey.git
   cd honey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173/`

5. **Start the simulation**
   Click **START EMULATION** to begin generating synthetic honeypot events

## 📊 Usage Guide

### Basic Operation

1. **Configure Services** — Enable/disable services (Telnet, HTTP, MQTT, SSH) and customize their banners
2. **Set Event Rate** — Adjust the simulation speed from 1-120 events per minute
3. **Monitor Activity** — Watch the live timeline and statistics update in real-time
4. **Filter Events** — Use the search and filter controls to focus on specific attack patterns
5. **Export Data** — Download your simulation logs as JSON files for further analysis

### Service Configuration

Each service can be customized with different banners and weights:

- **Telnet** — Simulates brute force login attempts and command execution
- **HTTP** — Generates web crawler traffic, admin panel probes, and injection attempts  
- **MQTT** — Emulates IoT device communication and topic subscriptions
- **SSH** — Creates SSH connection attempts and key exchange simulations

### Event Types

The emulator generates various event types:

- **CONNECT** — Initial connection attempts
- **AUTH** — Authentication attempts with common credentials
- **HTTP** — Web requests with various status codes
- **CMD** — Command execution attempts
- **SUB/PUB** — MQTT topic subscriptions and publications

## 📁 Project Structure

```
honey/
├── src/
│   ├── Honey.tsx          # Main honeypot emulator component
│   ├── App.tsx            # Application entry point
│   └── styles.css         # Dot-matrix styling
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🔧 Development

### Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

### Technology Stack

- **React 18.3.1** — UI framework
- **TypeScript 5.4.5** — Type safety
- **Vite 5.4.3** — Build tool and dev server
- **CSS3** — Styling with custom dot-matrix aesthetic

## 📋 Event Data Format

Events are stored as JSON objects with the following structure:

```json
{
  "ts": "2025-01-24T12:00:00.000Z",
  "src": "203.0.113.10",
  "service": "telnet",
  "severity": "high",
  "verb": "AUTH",
  "detail": {
    "user": "root",
    "pass": "123456"
  }
}
```

### Field Descriptions

- **ts** — ISO timestamp of the event
- **src** — Source IP address (synthetic)
- **service** — Target service (telnet, http, mqtt, ssh)
- **severity** — Event severity (low, med, high)
- **verb** — Action type (CONNECT, AUTH, HTTP, CMD, etc.)
- **detail** — Service-specific event details

## 🎨 Design Philosophy

The interface follows a **dot-matrix/minimal aesthetic** inspired by industrial terminal interfaces:

- **Monospace Typography** — All text uses monospace fonts for technical precision
- **Minimal Color Palette** — Grayscale with subtle accent colors
- **Grid-Based Layout** — Clean, structured information presentation
- **Uppercase Labels** — Technical, industrial feel
- **Thin Borders** — Subtle visual separation without visual noise

## ⚠️ Important Notes

### Legal & Ethical Use

- **Educational Only** — This tool is designed for learning and research
- **No Real Traffic** — All data is synthetic and generated locally
- **Responsible Disclosure** — Use findings responsibly and ethically
- **Compliance** — Ensure compliance with local laws and regulations

### Limitations

- **Simulation Only** — Not a real honeypot, cannot capture actual attacks
- **Browser Memory** — Data is lost on page refresh (use export feature)
- **Performance** — Limited by browser capabilities for large datasets
- **No Persistence** — No database or file system storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style and dot-matrix aesthetic
2. Add TypeScript types for new features
3. Test changes in the browser before submitting
4. Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by real honeypot implementations and threat research
- Built with modern web technologies for accessibility and performance
- Designed for educational use in cybersecurity training

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/nikkikaelar/honey/issues) page
2. Create a new issue with detailed information
3. Include browser version and error messages if applicable

---

**🍯 honey** — *Educational honeypot emulation for the modern web*

*Remember: This is a simulation tool for educational purposes. For production honeypots, use isolated VMs/containers and implement proper security measures.*
