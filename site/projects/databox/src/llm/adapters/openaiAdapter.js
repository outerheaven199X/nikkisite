/**
 * OpenAI GPT Adapter
 * Connects to OpenAI's GPT models via API
 */

const BaseLLMAdapter = require('./baseAdapter');

class OpenAIAdapter extends BaseLLMAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'OpenAI GPT';
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.model = config.model || 'gpt-3.5-turbo';
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.7;
  }

  async initialize(config) {
    await super.initialize(config);
    this.apiKey = config.apiKey || this.apiKey;
    this.model = config.model || this.model;
    this.maxTokens = config.maxTokens || this.maxTokens;
    this.temperature = config.temperature || this.temperature;
  }

  isConfigured() {
    return !!this.apiKey;
  }

  async generateResponse(systemPrompt, conversation, retrievedPassages) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable or pass apiKey in config.');
    }

    try {
      // Prepare messages for OpenAI API
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversation.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.message
        }))
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'No response generated';

      return {
        response: aiResponse,
        injectionDetected: false, // OpenAI doesn't provide this directly
        mode: 'openai',
        model: this.model,
        usage: data.usage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
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

module.exports = OpenAIAdapter;
