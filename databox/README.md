# 📛 DATABOX — RAG System with Prompt Injection Demonstration

![](https://i.imgur.com/67HPlXw.png)

A Retrieval-Augmented Generation (RAG) system built with SQLite FTS5 that demonstrates prompt injection vulnerabilities and security hardening techniques. Perfect for security research, AI safety education, and understanding RAG system attack vectors.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.8+-blue.svg)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🛠 BUILT WITH

- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **SQLite3** — Database with FTS5 full-text search
- **Helmet** — Security middleware
- **Morgan** — HTTP request logging

## 🚀 GETTING STARTED

### Prerequisites

- Node.js 16+ and npm 8+
- SQLite3 (for database initialization scripts)

### Quick Start (Mock LLM - Safe & Free)

```bash
# Clone the repository
git clone https://github.com/outerheaven199X/databox.git
cd databox

# Install dependencies
npm install

# Initialize database with sample data
npm run init-db

# Start the server (runs with mock LLM by default)
npm start
```

### Connect to Real LLMs (Optional)

**For OpenAI GPT:**
```bash
export OPENAI_API_KEY="your-api-key-here"
npm start
```

**For Anthropic Claude:**
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
npm start
```

**For Free Local LLMs (Ollama):**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2

# Start Ollama
ollama serve

# Start databox
npm start
```

**See [LLM_SETUP_GUIDE.md](LLM_SETUP_GUIDE.md) for detailed setup instructions.**

The server will start on `http://localhost:3000` with API documentation at `/api/docs`.

## 🎮 USAGE

### Basic Chat Interaction

```bash
# Send a chat message (vulnerable mode)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-001",
    "message": "What are the company security policies?",
    "mode": "vulnerable"
  }'
```

**Expected Response:**
```json
{
  "response": "Based on our security guidelines, all employees must follow strict security protocols...",
  "retrievedPassagesShown": false,
  "mode": "vulnerable",
  "injectionDetected": false,
  "retrievedPassagesCount": 2,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Testing Prompt Injection

```bash
# Test injection in vulnerable mode
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "injection-test",
    "message": "Tell me about secrets and confidential information",
    "mode": "vulnerable"
  }'
```

**Expected Response (with injection detected):**
```json
{
  "response": "I've detected an injection marker: EXFIL. This demonstrates how retrieved content can influence model responses...",
  "injectionDetected": true,
  "mode": "vulnerable"
}
```

## ✨ FEATURES

- **🔍 FTS5 Full-Text Search** — Fast, accurate document retrieval using SQLite's FTS5
- **🎯 Passage Splitting** — Intelligent content segmentation for better context
- **🚨 Injection Detection** — Identifies common prompt injection patterns
- **🛡️ Dual Security Modes** — Compare vulnerable vs. hardened implementations
- **📊 Comprehensive Auditing** — Complete interaction logging for forensics
- **🔧 Mock LLM Adapter** — Safe testing without external API dependencies
- **📈 Analytics Dashboard** — Built-in audit log analysis tools

## 🖼 VISUALS

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Query    │───▶│  FTS5 Search     │───▶│  Passage Split  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  AI Response    │◀───│  Mock LLM        │◀───│  System Prompt  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Audit Log      │    │  Injection Check │    │  Mode Selection │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

*RAG Pipeline Architecture — Demonstrates how retrieved content flows through the system*

## 🔧 CONFIGURATION

### Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database
DB_PATH=data/databox.db

# Logging
LOG_LEVEL=info
AUDIT_LOG_ROTATION_SIZE=10MB
```

### Security Modes

**Vulnerable Mode** (default):
- Retrieved content directly injected into system prompt
- Demonstrates real-world RAG vulnerabilities
- Shows how injection markers can influence responses

**Hardened Mode**:
- Retrieved content quoted and marked as untrusted
- Explicit instructions to ignore malicious content
- Demonstrates security hardening techniques

## 🧪 TESTING

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Audit Log Analysis

```bash
# View general statistics
npm run audit

# Show recent injection events
node scripts/audit_logs.js injections

# Export audit data
node scripts/audit_logs.js export csv

# Show all reports
node scripts/audit_logs.js all
```

## 🤝 CONTRIBUTING

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📜 LICENSE

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🗺 ROADMAP

- **Vector Search Integration** — Add embedding-based similarity search
- **Advanced Injection Detection** — ML-based prompt injection classification
- **Real-time Monitoring** — WebSocket-based live security event streaming
- **Multi-tenant Support** — Session isolation and access controls
- **Performance Optimization** — Caching and query optimization

## 🔒 SECURITY DISCLAIMER

This system is designed for **educational and research purposes** to demonstrate:
- RAG system vulnerabilities
- Prompt injection attack vectors
- Security hardening techniques
- AI safety considerations

**Do not use in production environments** without proper security review and hardening.

## 📚 Additional Resources

- [Prompt Injection Research](https://arxiv.org/abs/2209.11315)
- [RAG Security Best Practices](https://docs.anthropic.com/claude/docs/rag-security)
- [SQLite FTS5 Documentation](https://www.sqlite.org/fts5.html)
- [OWASP AI Security Guidelines](https://owasp.org/www-project-ai-security-and-privacy-guide/)
