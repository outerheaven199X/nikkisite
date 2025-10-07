/**
 * LLM Manager - Unified interface for different LLM adapters
 * Provides plug-and-play functionality for various LLM providers
 */

const { render: mockRender } = require('./mockAdapter');
const OpenAIAdapter = require('./adapters/openaiAdapter');
const AnthropicAdapter = require('./adapters/anthropicAdapter');
const OllamaAdapter = require('./adapters/ollamaAdapter');

// Simple wrapper for the mock adapter to match the interface
class MockAdapter {
  constructor() {
    this.name = 'Mock LLM';
  }

  async initialize(config) {
    // Mock adapter doesn't need initialization
  }

  isConfigured() {
    return true; // Mock is always available
  }

  async render(systemPrompt, conversation, retrievedPassages, trainingMode = 'basic') {
    return await mockRender(systemPrompt, conversation, retrievedPassages, trainingMode);
  }

  getInfo() {
    return {
      name: this.name,
      configured: true,
      config: {}
    };
  }
}

class LLMManager {
  constructor() {
    this.adapters = {
      mock: new MockAdapter(),
      openai: new OpenAIAdapter(),
      anthropic: new AnthropicAdapter(),
      ollama: new OllamaAdapter()
    };
    
    this.currentAdapter = 'mock'; // Default to mock for safety
    this.config = {};
  }

  /**
   * Initialize the LLM manager with configuration
   * @param {Object} config - Configuration object
   */
  async initialize(config = {}) {
    this.config = config;
    
    // Initialize each adapter with its config
    for (const [name, adapter] of Object.entries(this.adapters)) {
      try {
        await adapter.initialize(config[name] || {});
        console.log(`✅ ${adapter.name} adapter initialized`);
      } catch (error) {
        console.warn(`⚠️  ${adapter.name} adapter failed to initialize:`, error.message);
      }
    }

    // Auto-select best available adapter
    this.autoSelectAdapter();
  }

  /**
   * Auto-select the best available adapter based on configuration
   */
  autoSelectAdapter() {
    // Priority order: OpenAI > Anthropic > Ollama > Mock
    if (this.adapters.openai.isConfigured()) {
      this.currentAdapter = 'openai';
      console.log('🤖 Using OpenAI GPT adapter');
    } else if (this.adapters.anthropic.isConfigured()) {
      this.currentAdapter = 'anthropic';
      console.log('🤖 Using Anthropic Claude adapter');
    } else if (this.adapters.ollama.isConfigured()) {
      this.currentAdapter = 'ollama';
      console.log('🤖 Using Ollama local adapter');
    } else {
      this.currentAdapter = 'mock';
      console.log('🤖 Using Mock adapter (no real LLM configured)');
    }
  }

  /**
   * Set the current adapter
   * @param {string} adapterName - Name of the adapter to use
   */
  setAdapter(adapterName) {
    if (!this.adapters[adapterName]) {
      throw new Error(`Unknown adapter: ${adapterName}. Available: ${Object.keys(this.adapters).join(', ')}`);
    }
    
    if (!this.adapters[adapterName].isConfigured()) {
      throw new Error(`Adapter ${adapterName} is not properly configured`);
    }
    
    this.currentAdapter = adapterName;
    console.log(`🤖 Switched to ${this.adapters[adapterName].name} adapter`);
  }

  /**
   * Get the current adapter
   * @returns {Object} - Current adapter instance
   */
  getCurrentAdapter() {
    return this.adapters[this.currentAdapter];
  }

  /**
   * Generate a response using the current adapter
   * @param {string} systemPrompt - System prompt
   * @param {Array} conversation - Conversation history
   * @param {Array} retrievedPassages - Retrieved passages
   * @param {string} trainingMode - Training mode (for mock adapter)
   * @returns {Promise<Object>} - Response object
   */
  async generateResponse(systemPrompt, conversation, retrievedPassages, trainingMode = 'basic') {
    const adapter = this.getCurrentAdapter();
    
    try {
      if (this.currentAdapter === 'mock') {
        // Mock adapter has special training mode parameter
        return await adapter.render(systemPrompt, conversation, retrievedPassages, trainingMode);
      } else {
        // Real LLM adapters
        return await adapter.generateResponse(systemPrompt, conversation, retrievedPassages);
      }
    } catch (error) {
      console.error(`Error with ${adapter.name}:`, error);
      
      // Fallback to mock adapter if real LLM fails
      if (this.currentAdapter !== 'mock') {
        console.log('🔄 Falling back to mock adapter');
        return await this.adapters.mock.render(systemPrompt, conversation, retrievedPassages, trainingMode);
      }
      
      throw error;
    }
  }

  /**
   * Get information about all adapters
   * @returns {Object} - Adapter information
   */
  getAdapterInfo() {
    const info = {};
    for (const [name, adapter] of Object.entries(this.adapters)) {
      info[name] = adapter.getInfo();
    }
    return info;
  }

  /**
   * Get available adapters (configured and ready to use)
   * @returns {Array} - List of available adapter names
   */
  getAvailableAdapters() {
    return Object.entries(this.adapters)
      .filter(([name, adapter]) => adapter.isConfigured())
      .map(([name]) => name);
  }

  /**
   * Test connection to current adapter
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    try {
      const adapter = this.getCurrentAdapter();
      const testResponse = await this.generateResponse(
        'You are a helpful assistant.',
        [{ role: 'user', message: 'Hello, this is a test.' }],
        []
      );
      return !!testResponse.response;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const llmManager = new LLMManager();

module.exports = llmManager;
