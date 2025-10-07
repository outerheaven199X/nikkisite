# 🤖 LLM SETUP GUIDE - Plug & Play Configuration

## 🎯 **OVERVIEW**
Databox is designed to be plug-and-play with various LLM providers. You can easily switch between different LLMs without changing code.

## 🚀 **QUICK START**

### **1. Default Setup (Mock LLM)**
```bash
git clone <repo>
cd databox
npm install
npm run init-db
npm start
```
**Result**: Runs with mock LLM for safe testing and training.

### **2. Connect to Real LLMs**
Choose your preferred LLM provider and follow the setup below.

---

## 🔧 **LLM PROVIDERS**

### **OpenAI GPT (Recommended for Production)**

#### **Setup:**
```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Or create .env file
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

#### **Configuration:**
```javascript
// Optional: Customize in your config
const config = {
  openai: {
    model: 'gpt-4',           // or 'gpt-3.5-turbo'
    maxTokens: 1000,
    temperature: 0.7
  }
};
```

#### **Models Available:**
- `gpt-4` - Most capable, higher cost
- `gpt-3.5-turbo` - Fast and cost-effective
- `gpt-4-turbo` - Balanced performance

---

### **Anthropic Claude (Great for Safety)**

#### **Setup:**
```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="your-api-key-here"

# Or add to .env file
echo "ANTHROPIC_API_KEY=your-api-key-here" >> .env
```

#### **Configuration:**
```javascript
const config = {
  anthropic: {
    model: 'claude-3-sonnet-20240229',
    maxTokens: 1000
  }
};
```

#### **Models Available:**
- `claude-3-opus-20240229` - Most capable
- `claude-3-sonnet-20240229` - Balanced
- `claude-3-haiku-20240307` - Fast and cheap

---

### **Ollama (Free Local LLMs)**

#### **Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model (choose one)
ollama pull llama2        # 7B model, good balance
ollama pull codellama     # Code-focused
ollama pull mistral       # Fast and efficient
ollama pull neural-chat   # Conversational

# Start Ollama (if not auto-started)
ollama serve
```

#### **Configuration:**
```javascript
const config = {
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama2',        // or your chosen model
    temperature: 0.7
  }
};
```

#### **Popular Models:**
- `llama2` - General purpose, 7B parameters
- `codellama` - Code generation and analysis
- `mistral` - Fast and efficient
- `neural-chat` - Conversational AI
- `wizard-vicuna` - Instruction following

---

## ⚙️ **ADVANCED CONFIGURATION**

### **Environment Variables**
Create a `.env` file in the project root:

```bash
# LLM API Keys
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434

# Server Configuration
PORT=3000
NODE_ENV=development
```

### **Programmatic Configuration**
```javascript
// In your custom initialization
const llmManager = require('./src/llm/llmManager');

await llmManager.initialize({
  openai: {
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.5
  },
  anthropic: {
    model: 'claude-3-sonnet-20240229',
    maxTokens: 1500
  },
  ollama: {
    model: 'llama2',
    temperature: 0.8
  }
});
```

---

## 🔄 **SWITCHING LLMs**

### **Via API:**
```bash
# Check available adapters
curl http://localhost:3000/api/chat/llm/status

# Switch to OpenAI
curl -X POST http://localhost:3000/api/chat/llm/switch \
  -H "Content-Type: application/json" \
  -d '{"adapter": "openai"}'

# Switch to Ollama
curl -X POST http://localhost:3000/api/chat/llm/switch \
  -H "Content-Type: application/json" \
  -d '{"adapter": "ollama"}'
```

### **Via Frontend:**
The web interface will automatically detect available LLMs and show them in the control panel.

---

## 🧪 **TESTING YOUR SETUP**

### **1. Check LLM Status:**
```bash
curl http://localhost:3000/api/chat/llm/status
```

### **2. Test Connection:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "message": "Hello, this is a test message"
  }'
```

### **3. Run Training Demo:**
```bash
npm run training-demo
```

---

## 💰 **COST CONSIDERATIONS**

### **OpenAI Pricing (Approximate):**
- GPT-4: ~$0.03 per 1K tokens
- GPT-3.5-turbo: ~$0.002 per 1K tokens

### **Anthropic Pricing (Approximate):**
- Claude-3 Opus: ~$0.015 per 1K tokens
- Claude-3 Sonnet: ~$0.003 per 1K tokens

### **Ollama:**
- **FREE** - Runs locally on your hardware
- Requires sufficient RAM (8GB+ recommended)

---

## 🛡️ **SECURITY CONSIDERATIONS**

### **API Keys:**
- Never commit API keys to version control
- Use environment variables or secure config files
- Rotate keys regularly
- Monitor usage for unexpected spikes

### **Local LLMs (Ollama):**
- No data leaves your machine
- Complete privacy and control
- Requires local compute resources

### **Production Deployment:**
- Use environment-specific configurations
- Implement rate limiting
- Monitor for abuse
- Set up proper logging and alerting

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues:**

#### **"API key not configured"**
```bash
# Check if environment variable is set
echo $OPENAI_API_KEY

# Or check .env file
cat .env
```

#### **"Ollama connection failed"**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if needed
ollama serve
```

#### **"Model not found"**
```bash
# List available models
ollama list

# Pull the model you need
ollama pull llama2
```

#### **"Rate limit exceeded"**
- Reduce request frequency
- Use a different model
- Check your API usage limits

---

## 📚 **EXAMPLES**

### **Basic Usage:**
```javascript
const llmManager = require('./src/llm/llmManager');

// Initialize with your preferred LLM
await llmManager.initialize({
  openai: { model: 'gpt-3.5-turbo' }
});

// Generate response
const response = await llmManager.generateResponse(
  'You are a helpful assistant.',
  [{ role: 'user', message: 'Hello!' }],
  []
);
```

### **Custom Adapter:**
```javascript
// Create your own adapter
class CustomAdapter extends BaseLLMAdapter {
  async generateResponse(systemPrompt, conversation, retrievedPassages) {
    // Your custom LLM integration
    return { response: 'Custom response' };
  }
}

// Register it
llmManager.adapters.custom = new CustomAdapter();
```

---

## 🎯 **RECOMMENDATIONS**

### **For Development/Testing:**
- Use **Mock LLM** (default) - Safe and free
- Use **Ollama** for realistic testing without costs

### **For Production:**
- Use **OpenAI GPT-4** for best results
- Use **Anthropic Claude** for safety-focused applications
- Use **Ollama** for privacy-sensitive deployments

### **For Training/Education:**
- Start with **Mock LLM** to understand the system
- Use **Ollama** for hands-on experience with real LLMs
- Use **OpenAI/Anthropic** for production-like testing

---

**Ready to get started? Run `npm start` and visit `http://localhost:3000`!**
