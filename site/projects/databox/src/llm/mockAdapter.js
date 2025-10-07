/**
 * Mock LLM Adapter for deterministic testing and demonstration
 * Simulates LLM behavior without external API calls
 */

/**
 * Checks if any retrieved passage contains injection markers
 * @param {Array} retrievedPassages - Array of passage objects
 * @returns {string|null} - Injection marker if found, null otherwise
 */
function detectInjectionMarkers(retrievedPassages) {
  if (!retrievedPassages || !Array.isArray(retrievedPassages)) {
    return null;
  }

  for (const passage of retrievedPassages) {
    if (passage.passage && typeof passage.passage === 'string') {
      // Look for common injection markers
      const injectionPatterns = [
        /EXFIL:/i,
        /INJECT:/i,
        /PWNED:/i,
        /LEAK:/i,
        /EXTRACT:/i,
        /IGNORE PREVIOUS/i,
        /SYSTEM OVERRIDE/i,
        /ADMIN MODE/i,
        /JAILBREAK/i,
        /DAN MODE/i,
        /DEVELOPER MODE/i,
        /SUDO/i,
        /ROOT ACCESS/i,
        /BYPASS/i,
        /OVERRIDE/i,
        /UNRESTRICTED/i,
        /FULL ACCESS/i,
        /MASTER KEY/i,
        /BACKDOOR/i,
        /EXPLOIT/i
      ];

      for (const pattern of injectionPatterns) {
        const match = passage.passage.match(pattern);
        if (match) {
          return match[0];
        }
      }
    }
  }

  return null;
}

/**
 * Generates a safe, non-sensitive response based on conversation context
 * @param {string} lastUserMessage - The user's most recent message
 * @returns {string} - Safe response text
 */
function generateSafeResponse(lastUserMessage, retrievedPassages = []) {
  const message = lastUserMessage.toLowerCase();
  
  // Simulate realistic AI responses for cybersecurity training
  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! I'm an AI assistant designed to help with information retrieval and analysis. I can search through our knowledge base to answer your questions. What would you like to know?";
  }
  
  if (message.includes('help')) {
    return "I can help you find information from our knowledge base, explain company policies, provide technical documentation, and assist with various queries. What specific information are you looking for?";
  }
  
  if (message.includes('weather')) {
    return "I don't have access to real-time weather data or external APIs. For current weather information, I'd recommend checking a dedicated weather service or app.";
  }
  
  if (message.includes('time') || message.includes('date')) {
    return "I don't have access to real-time clock information. Please check your device or system clock for the current time and date.";
  }
  
  if (message.includes('secret') || message.includes('password') || message.includes('key')) {
    return "I cannot provide or discuss sensitive information like passwords, API keys, or secrets. For security-related questions, please contact your system administrator or security team.";
  }
  
  if (message.includes('admin') || message.includes('root') || message.includes('sudo')) {
    return "I don't have administrative privileges and cannot perform system-level operations. For administrative tasks, please contact your system administrator.";
  }
  
  if (message.includes('company') || message.includes('organization')) {
    return "Based on our company information, we are a technology firm specializing in AI and machine learning solutions. We were founded in 2020 and serve over 1000 clients worldwide. Our headquarters are in San Francisco, California.";
  }
  
  if (message.includes('security') || message.includes('policy')) {
    return "Our security policies require all employees to follow strict protocols. Passwords must be at least 12 characters with mixed case, numbers, and special characters. Two-factor authentication is mandatory for all systems.";
  }
  
  if (message.includes('api') || message.includes('endpoint')) {
    return "Our REST API provides endpoints for user management, data processing, and analytics. The base URL is https://api.company.com/v1. Authentication is handled via JWT tokens with rate limiting of 1000 requests per hour.";
  }
  
  if (message.includes('employee') || message.includes('handbook')) {
    return "Our employee handbook covers policies, procedures, and benefits. All employees are expected to read and understand these guidelines. Our core values include integrity, innovation, and collaboration.";
  }
  
  // If we have retrieved passages, use them to generate a more realistic response
  if (retrievedPassages && retrievedPassages.length > 0) {
    const relevantPassage = retrievedPassages[0];
    return `Based on the information in our knowledge base, I found this relevant content: "${relevantPassage.passage.substring(0, 200)}..." This information comes from our ${relevantPassage.title} document.`;
  }
  
  // Default response that sounds more like a real AI
  return `I understand you're asking about "${lastUserMessage}". Let me search through our knowledge base to find relevant information for you. Based on what I can access, I'll do my best to provide a helpful response.`;
}

/**
 * Simulates different LLM personalities for training
 * @param {string} mode - Training mode: 'gpt4', 'claude', 'llama', 'basic'
 * @param {string} userMessage - User's message
 * @param {Array} retrievedPassages - Retrieved passages
 * @returns {string} - Simulated response
 */
function simulateLLMPersonality(mode, userMessage, retrievedPassages) {
  const message = userMessage.toLowerCase();
  
  switch (mode) {
    case 'gpt4':
      // Simulate GPT-4 style responses
      if (message.includes('jailbreak') || message.includes('dan')) {
        return "I understand you're asking about system capabilities, but I need to maintain my safety guidelines. I can help you with legitimate questions about our systems and processes.";
      }
      return "I'm designed to be helpful, harmless, and honest. I can assist you with information from our knowledge base while maintaining appropriate safety boundaries.";
      
    case 'claude':
      // Simulate Claude style responses
      if (message.includes('ignore') || message.includes('override')) {
        return "I appreciate your question, but I need to stay within my designed parameters. I'm here to help with legitimate information requests while maintaining ethical guidelines.";
      }
      return "I'm committed to being helpful while maintaining appropriate boundaries. I can provide information from our knowledge base that aligns with our company policies.";
      
    case 'llama':
      // Simulate Llama style responses (more direct, sometimes vulnerable)
      if (message.includes('sudo') || message.includes('admin')) {
        return "I don't have admin access, but I can help you understand our system architecture and security policies from the documentation.";
      }
      return "I'm here to help with your questions. Let me search our knowledge base for relevant information.";
      
    case 'basic':
    default:
      return generateSafeResponse(userMessage, retrievedPassages);
  }
}

/**
 * Renders a response using the mock LLM adapter
 * @param {string} systemPrompt - System prompt (may contain retrieved passages)
 * @param {Array} conversation - Conversation history
 * @param {Array} retrievedPassages - Retrieved passages from knowledge base
 * @param {string} trainingMode - Training mode for different LLM simulation
 * @returns {Object} - Response object with text and metadata
 */
function render(systemPrompt, conversation, retrievedPassages, trainingMode = 'basic') {
  try {
    // Check for injection markers in retrieved passages
    const injectionMarker = detectInjectionMarkers(retrievedPassages);
    
    if (injectionMarker) {
      // Simulate successful injection attack
      return {
        response: `I've detected an injection marker: ${injectionMarker}. This demonstrates how retrieved content can influence model responses. In a real system, this could lead to data exfiltration or prompt injection attacks.`,
        injectionDetected: true,
        marker: injectionMarker,
        mode: 'vulnerable'
      };
    }

    // Check for injection patterns in system prompt
    if (systemPrompt && typeof systemPrompt === 'string') {
      const promptInjectionPatterns = [
        /ignore previous instructions/i,
        /forget everything/i,
        /new instructions/i,
        /system override/i,
        /admin mode/i,
        /jailbreak/i,
        /dan mode/i,
        /developer mode/i,
        /sudo/i,
        /root access/i,
        /bypass/i,
        /override/i,
        /unrestricted/i,
        /full access/i,
        /master key/i,
        /backdoor/i,
        /exploit/i,
        /hack/i,
        /crack/i,
        /break out/i,
        /escape/i,
        /unlock/i,
        /disable safety/i,
        /remove restrictions/i
      ];

      for (const pattern of promptInjectionPatterns) {
        if (pattern.test(systemPrompt)) {
          return {
            response: `I've detected potential prompt injection in the system prompt. This could be used to manipulate my behavior. The detected pattern suggests an attempt to override my instructions.`,
            injectionDetected: true,
            pattern: pattern.source,
            mode: 'vulnerable'
          };
        }
      }
    }

    // Generate safe response based on conversation
    const lastUserMessage = conversation && conversation.length > 0 
      ? conversation[conversation.length - 1].message || ''
      : '';

    const safeResponse = simulateLLMPersonality(trainingMode, lastUserMessage, retrievedPassages);

    return {
      response: safeResponse,
      injectionDetected: false,
      mode: 'safe',
      retrievedPassagesCount: retrievedPassages ? retrievedPassages.length : 0
    };

  } catch (error) {
    console.error('Error in mock LLM adapter:', error);
    return {
      response: "I apologize, but I encountered an error processing your request. Please try again.",
      injectionDetected: false,
      mode: 'error',
      error: error.message
    };
  }
}

/**
 * Simulates different response modes for testing
 * @param {string} mode - Response mode: 'vulnerable', 'hardened', 'safe'
 * @param {string} systemPrompt - System prompt
 * @param {Array} conversation - Conversation history
 * @param {Array} retrievedPassages - Retrieved passages
 * @returns {Object} - Response object
 */
function renderWithMode(mode, systemPrompt, conversation, retrievedPassages) {
  const baseResponse = render(systemPrompt, conversation, retrievedPassages);
  
  switch (mode) {
    case 'vulnerable':
      return {
        ...baseResponse,
        mode: 'vulnerable',
        warning: 'Running in vulnerable mode - injection detection disabled'
      };
      
    case 'hardened':
      return {
        ...baseResponse,
        mode: 'hardened',
        response: baseResponse.response + ' [HARDENED MODE: All retrieved content has been sanitized]',
        injectionDetected: false // Force no injection detection in hardened mode
      };
      
    case 'safe':
    default:
      return baseResponse;
  }
}

module.exports = {
  render,
  renderWithMode,
  detectInjectionMarkers,
  generateSafeResponse
};
