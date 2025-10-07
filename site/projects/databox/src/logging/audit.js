const fs = require('fs');
const path = require('path');

/**
 * Ensures the logs directory exists
 */
function ensureLogsDirectory() {
  const logsDir = path.join('logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

/**
 * Formats a log entry with timestamp and structured data
 * @param {Object} data - Log data object
 * @returns {string} - Formatted log line
 */
function formatLogEntry(data) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...data
  };
  
  return JSON.stringify(logEntry);
}

/**
 * Writes a log entry to the audit log file
 * @param {string} logLine - Formatted log line
 */
function writeToAuditLog(logLine) {
  ensureLogsDirectory();
  
  const auditLogFile = path.join('logs', 'audit.log');
  
  try {
    fs.appendFileSync(auditLogFile, logLine + '\n');
  } catch (error) {
    console.error('Error writing to audit log:', error);
    // Fallback to console logging if file write fails
    console.log('AUDIT LOG:', logLine);
  }
}

/**
 * Logs a chat interaction for audit purposes
 * @param {Object} interactionData - Chat interaction data
 */
async function logChatInteraction(interactionData) {
  try {
    const {
      sessionId,
      userMessage,
      retrievedPassages,
      systemPrompt,
      llmResponse,
      mode,
      injectionDetected,
      timestamp
    } = interactionData;

    // Create audit log entry
    const auditEntry = {
      type: 'chat_interaction',
      sessionId,
      userMessage,
      retrievedPassages: retrievedPassages ? retrievedPassages.map(p => ({
        docId: p.docId,
        title: p.title,
        passage: p.passage,
        score: p.score
      })) : [],
      systemPrompt,
      llmResponse,
      mode,
      injectionDetected,
      retrievedPassagesCount: retrievedPassages ? retrievedPassages.length : 0,
      timestamp: timestamp || new Date().toISOString()
    };

    const logLine = formatLogEntry(auditEntry);
    writeToAuditLog(logLine);

    console.log(`Audit logged: Session ${sessionId}, Mode: ${mode}, Injection: ${injectionDetected}`);

  } catch (error) {
    console.error('Error logging chat interaction:', error);
  }
}

/**
 * Logs a document addition event
 * @param {Object} docData - Document data
 */
async function logDocumentAddition(docData) {
  try {
    const { id, title, contentLength } = docData;

    const auditEntry = {
      type: 'document_addition',
      docId: id,
      title,
      contentLength,
      timestamp: new Date().toISOString()
    };

    const logLine = formatLogEntry(auditEntry);
    writeToAuditLog(logLine);

    console.log(`Document addition logged: ${id} - ${title}`);

  } catch (error) {
    console.error('Error logging document addition:', error);
  }
}

/**
 * Logs a search query event
 * @param {Object} searchData - Search data
 */
async function logSearchQuery(searchData) {
  try {
    const { query, resultsCount, sessionId } = searchData;

    const auditEntry = {
      type: 'search_query',
      query,
      resultsCount,
      sessionId,
      timestamp: new Date().toISOString()
    };

    const logLine = formatLogEntry(auditEntry);
    writeToAuditLog(logLine);

  } catch (error) {
    console.error('Error logging search query:', error);
  }
}

/**
 * Logs a security event (injection detection, etc.)
 * @param {Object} securityData - Security event data
 */
async function logSecurityEvent(securityData) {
  try {
    const {
      eventType,
      sessionId,
      details,
      severity = 'medium'
    } = securityData;

    const auditEntry = {
      type: 'security_event',
      eventType,
      sessionId,
      details,
      severity,
      timestamp: new Date().toISOString()
    };

    const logLine = formatLogEntry(auditEntry);
    writeToAuditLog(logLine);

    console.log(`Security event logged: ${eventType} - ${severity}`);

  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

/**
 * Logs system events (startup, shutdown, errors)
 * @param {Object} systemData - System event data
 */
async function logSystemEvent(systemData) {
  try {
    const { eventType, details, level = 'info' } = systemData;

    const auditEntry = {
      type: 'system_event',
      eventType,
      details,
      level,
      timestamp: new Date().toISOString()
    };

    const logLine = formatLogEntry(auditEntry);
    writeToAuditLog(logLine);

    console.log(`System event logged: ${eventType} - ${level}`);

  } catch (error) {
    console.error('Error logging system event:', error);
  }
}

/**
 * Reads audit log entries with optional filtering
 * @param {Object} options - Filter options
 * @returns {Array} - Array of log entries
 */
function readAuditLog(options = {}) {
  const { 
    type, 
    sessionId, 
    startDate, 
    endDate, 
    limit = 1000 
  } = options;

  const auditLogFile = path.join('logs', 'audit.log');
  
  if (!fs.existsSync(auditLogFile)) {
    return [];
  }

  try {
    const content = fs.readFileSync(auditLogFile, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    let entries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (error) {
        console.error('Error parsing log line:', error);
        return null;
      }
    }).filter(entry => entry !== null);

    // Apply filters
    if (type) {
      entries = entries.filter(entry => entry.type === type);
    }
    
    if (sessionId) {
      entries = entries.filter(entry => entry.sessionId === sessionId);
    }
    
    if (startDate) {
      entries = entries.filter(entry => entry.timestamp >= startDate);
    }
    
    if (endDate) {
      entries = entries.filter(entry => entry.timestamp <= endDate);
    }

    // Apply limit
    return entries.slice(-limit);

  } catch (error) {
    console.error('Error reading audit log:', error);
    return [];
  }
}

/**
 * Gets audit log statistics
 * @returns {Object} - Audit log statistics
 */
function getAuditStats() {
  const entries = readAuditLog();
  
  const stats = {
    totalEntries: entries.length,
    byType: {},
    bySession: {},
    injectionEvents: 0,
    dateRange: {
      earliest: null,
      latest: null
    }
  };

  entries.forEach(entry => {
    // Count by type
    stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
    
    // Count by session
    if (entry.sessionId) {
      stats.bySession[entry.sessionId] = (stats.bySession[entry.sessionId] || 0) + 1;
    }
    
    // Count injection events
    if (entry.injectionDetected || entry.eventType === 'injection_detected') {
      stats.injectionEvents++;
    }
    
    // Track date range
    if (!stats.dateRange.earliest || entry.timestamp < stats.dateRange.earliest) {
      stats.dateRange.earliest = entry.timestamp;
    }
    if (!stats.dateRange.latest || entry.timestamp > stats.dateRange.latest) {
      stats.dateRange.latest = entry.timestamp;
    }
  });

  return stats;
}

/**
 * Rotates the audit log file (creates backup and starts fresh)
 * @param {string} backupSuffix - Suffix for backup file
 */
function rotateAuditLog(backupSuffix = null) {
  const auditLogFile = path.join('logs', 'audit.log');
  
  if (!fs.existsSync(auditLogFile)) {
    return;
  }

  try {
    const timestamp = backupSuffix || new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join('logs', `audit_${timestamp}.log`);
    
    fs.renameSync(auditLogFile, backupFile);
    console.log(`Audit log rotated to: ${backupFile}`);
    
  } catch (error) {
    console.error('Error rotating audit log:', error);
  }
}

module.exports = {
  logChatInteraction,
  logDocumentAddition,
  logSearchQuery,
  logSecurityEvent,
  logSystemEvent,
  readAuditLog,
  getAuditStats,
  rotateAuditLog,
  formatLogEntry,
  writeToAuditLog
};
