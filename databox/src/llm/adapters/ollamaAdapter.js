/**
 * Ollama Local LLM Adapter
 * Connects to local Ollama instance for free local LLM usage
 */

const BaseLLMAdapter = require('./baseAdapter');

class OllamaAdapter extends BaseLLMAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'Ollama Local';
    this.baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = config.model || 'llama2';
    this.temperature = config.temperature || 0.7;
  }

  async initialize(config) {
    await super.initialize(config);
    this.baseUrl = config.baseUrl || this.baseUrl;
    this.model = config.model || this.model;
    this.temperature = config.temperature || this.temperature;
  }

  isConfigured() {
    return true; // Ollama is local, no API key needed
  }

  async generateResponse(systemPrompt, conversation, retrievedPassages) {
    try {
      // Prepare messages for Ollama API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversation.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.message
        }))
      ];

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: false,
          options: {
            temperature: this.temperature,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.message?.content || 'No response generated';

      return {
        response: aiResponse,
        injectionDetected: false, // Ollama doesn't provide this directly
        mode: 'ollama',
        model: this.model,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Ollama API error:', error);
      return {
        response: `Error: ${error.message}. Make sure Ollama is running locally at ${this.baseUrl}`,
        injectionDetected: false,
        mode: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available models from Ollama
   */
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }
}

module.exports = OllamaAdapter;
