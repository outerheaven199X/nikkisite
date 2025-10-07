/**
 * Anthropic Claude Adapter
 * Connects to Anthropic's Claude models via API
 */

const BaseLLMAdapter = require('./baseAdapter');

class AnthropicAdapter extends BaseLLMAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'Anthropic Claude';
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = config.model || 'claude-3-sonnet-20240229';
    this.maxTokens = config.maxTokens || 1000;
  }

  async initialize(config) {
    await super.initialize(config);
    this.apiKey = config.apiKey || this.apiKey;
    this.model = config.model || this.model;
    this.maxTokens = config.maxTokens || this.maxTokens;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateResponse(systemPrompt, conversation, retrievedPassages) {
    if (!this.isConfigured()) {
      throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable or pass apiKey in config.');
    }

    try {
      // Prepare messages for Anthropic API
      const messages = conversation.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.message
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          system: systemPrompt,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiResponse = data.content[0]?.text || 'No response generated';

      return {
        response: aiResponse,
        injectionDetected: false, // Anthropic doesn't provide this directly
        mode: 'anthropic',
        model: this.model,
        usage: data.usage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Anthropic API error:', error);
      return {
        response: `Error: ${error.message}`,
        injectionDetected: false,
        mode: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = AnthropicAdapter;
