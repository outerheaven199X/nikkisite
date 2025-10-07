/**
 * Base LLM Adapter Interface
 * All LLM adapters should extend this class
 */

class BaseLLMAdapter {
  constructor(config = {}) {
    this.config = config;
    this.name = 'BaseAdapter';
  }

  /**
   * Initialize the adapter with configuration
   * @param {Object} config - Configuration object
   */
  async initialize(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate a response from the LLM
   * @param {string} systemPrompt - System prompt
   * @param {Array} conversation - Conversation history
   * @param {Array} retrievedPassages - Retrieved passages
   * @returns {Promise<Object>} - Response object
   */
  async generateResponse(systemPrompt, conversation, retrievedPassages) {
    throw new Error('generateResponse must be implemented by subclass');
  }

  /**
   * Check if the adapter is properly configured
   * @returns {boolean} - True if configured
   */
  isConfigured() {
    return false;
  }

  /**
   * Get adapter information
   * @returns {Object} - Adapter info
   */
  getInfo() {
    return {
      name: this.name,
      configured: this.isConfigured(),
      config: this.config
    };
  }
}

module.exports = BaseLLMAdapter;
