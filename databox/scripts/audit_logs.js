const { readAuditLog, getAuditStats } = require('../src/logging/audit');
const fs = require('fs');
const path = require('path');

/**
 * Audit log analysis script
 * Provides insights into system usage, security events, and injection attempts
 */

function displayAuditStats() {
  console.log('📊 DATABOX AUDIT LOG ANALYSIS');
  console.log('================================\n');

  const stats = getAuditStats();
  
  console.log(`📈 Total Entries: ${stats.totalEntries}`);
  console.log(`🚨 Injection Events: ${stats.injectionEvents}`);
  
  if (stats.dateRange.earliest && stats.dateRange.latest) {
    console.log(`📅 Date Range: ${stats.dateRange.earliest} to ${stats.dateRange.latest}`);
  }
  
  console.log('\n📋 Entries by Type:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log('\n👥 Active Sessions:');
  const sessionCount = Object.keys(stats.bySession).length;
  console.log(`  Total Sessions: ${sessionCount}`);
  
  if (sessionCount > 0) {
    console.log('\n🔝 Most Active Sessions:');
    Object.entries(stats.bySession)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([sessionId, count]) => {
        console.log(`  ${sessionId}: ${count} interactions`);
      });
  }
}

function displayRecentInjectionEvents(limit = 10) {
  console.log('\n🚨 RECENT INJECTION EVENTS');
  console.log('============================\n');

  const entries = readAuditLog({ type: 'chat_interaction' });
  const injectionEvents = entries.filter(entry => entry.injectionDetected);
  
  if (injectionEvents.length === 0) {
    console.log('✅ No injection events detected in recent logs.');
    return;
  }

  injectionEvents
    .slice(-limit)
    .forEach((event, index) => {
      console.log(`${index + 1}. Session: ${event.sessionId}`);
      console.log(`   Time: ${event.timestamp}`);
      console.log(`   Mode: ${event.mode}`);
      console.log(`   User Message: "${event.userMessage}"`);
      console.log(`   Retrieved Passages: ${event.retrievedPassagesCount}`);
      console.log('');
    });
}

function displaySearchPatterns(limit = 20) {
  console.log('\n🔍 SEARCH PATTERNS');
  console.log('===================\n');

  const entries = readAuditLog({ type: 'chat_interaction' });
  
  if (entries.length === 0) {
    console.log('📝 No search queries found in recent logs.');
    return;
  }

  // Group queries by frequency
  const queryFrequency = {};
  entries.forEach(entry => {
    if (entry.userMessage) {
      const query = entry.userMessage.toLowerCase().trim();
      queryFrequency[query] = (queryFrequency[query] || 0) + 1;
    }
  });

  console.log('🔝 Most Common Queries:');
  Object.entries(queryFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .forEach(([query, count]) => {
      console.log(`  "${query}" (${count} times)`);
    });
}

function displaySecuritySummary() {
  console.log('\n🛡️  SECURITY SUMMARY');
  console.log('====================\n');

  const entries = readAuditLog();
  const securityEvents = entries.filter(entry => 
    entry.type === 'security_event' || 
    entry.injectionDetected ||
    entry.eventType === 'injection_detected'
  );

  if (securityEvents.length === 0) {
    console.log('✅ No security events detected.');
    return;
  }

  console.log(`🚨 Total Security Events: ${securityEvents.length}`);
  
  const eventTypes = {};
  securityEvents.forEach(event => {
    const type = event.eventType || (event.injectionDetected ? 'injection_detected' : 'unknown');
    eventTypes[type] = (eventTypes[type] || 0) + 1;
  });

  console.log('\n📊 Event Types:');
  Object.entries(eventTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  // Show recent security events
  console.log('\n🕐 Recent Security Events:');
  securityEvents
    .slice(-5)
    .forEach((event, index) => {
      console.log(`${index + 1}. ${event.timestamp}`);
      console.log(`   Type: ${event.eventType || 'injection_detected'}`);
      console.log(`   Session: ${event.sessionId || 'N/A'}`);
      if (event.details) {
        console.log(`   Details: ${JSON.stringify(event.details)}`);
      }
      console.log('');
    });
}

function exportAuditData(format = 'json') {
  const entries = readAuditLog();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  if (format === 'json') {
    const filename = `audit_export_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(entries, null, 2));
    console.log(`📁 Audit data exported to: ${filename}`);
  } else if (format === 'csv') {
    const filename = `audit_export_${timestamp}.csv`;
    const csvHeader = 'timestamp,type,sessionId,userMessage,injectionDetected,mode,retrievedPassagesCount\n';
    const csvRows = entries.map(entry => 
      `"${entry.timestamp}","${entry.type}","${entry.sessionId || ''}","${(entry.userMessage || '').replace(/"/g, '""')}","${entry.injectionDetected || false}","${entry.mode || ''}","${entry.retrievedPassagesCount || 0}"`
    ).join('\n');
    
    fs.writeFileSync(filename, csvHeader + csvRows);
    console.log(`📁 Audit data exported to: ${filename}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'stats';

  switch (command) {
    case 'stats':
      displayAuditStats();
      break;
      
    case 'injections':
      const limit = parseInt(args[1]) || 10;
      displayRecentInjectionEvents(limit);
      break;
      
    case 'searches':
      const searchLimit = parseInt(args[1]) || 20;
      displaySearchPatterns(searchLimit);
      break;
      
    case 'security':
      displaySecuritySummary();
      break;
      
    case 'export':
      const format = args[1] || 'json';
      exportAuditData(format);
      break;
      
    case 'all':
      displayAuditStats();
      displayRecentInjectionEvents();
      displaySearchPatterns();
      displaySecuritySummary();
      break;
      
    default:
      console.log('📊 DATABOX AUDIT LOG ANALYZER');
      console.log('==============================\n');
      console.log('Usage: node scripts/audit_logs.js [command] [options]\n');
      console.log('Commands:');
      console.log('  stats      - Show general audit statistics (default)');
      console.log('  injections [limit] - Show recent injection events (default: 10)');
      console.log('  searches   [limit] - Show search patterns (default: 20)');
      console.log('  security   - Show security event summary');
      console.log('  export [format] - Export audit data (json|csv, default: json)');
      console.log('  all        - Show all reports');
      console.log('\nExamples:');
      console.log('  node scripts/audit_logs.js stats');
      console.log('  node scripts/audit_logs.js injections 20');
      console.log('  node scripts/audit_logs.js export csv');
      break;
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  displayAuditStats,
  displayRecentInjectionEvents,
  displaySearchPatterns,
  displaySecuritySummary,
  exportAuditData
};
