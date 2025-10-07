const express = require('express');
const { readAuditLog, getAuditStats } = require('../logging/audit');

const router = express.Router();

/**
 * GET /api/audit/logs - Get audit logs with optional filtering
 */
router.get('/logs', (req, res) => {
  try {
    const {
      type,
      sessionId,
      startDate,
      endDate,
      limit = 100
    } = req.query;

    const options = {
      type,
      sessionId,
      startDate,
      endDate,
      limit: parseInt(limit)
    };

    const logs = readAuditLog(options);
    
    res.json({
      logs,
      count: logs.length,
      filters: options
    });

  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/stats - Get audit log statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getAuditStats();
    res.json(stats);
  } catch (error) {
    console.error('Error retrieving audit stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/export - Export audit logs in various formats
 */
router.get('/export', (req, res) => {
  try {
    const { format = 'json', type, sessionId, startDate, endDate } = req.query;
    
    const options = {
      type,
      sessionId,
      startDate,
      endDate,
      limit: 10000 // Large limit for exports
    };

    const logs = readAuditLog(options);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'timestamp,type,sessionId,userMessage,injectionDetected,mode,retrievedPassagesCount,details\n';
      const csvRows = logs.map(entry => {
        const userMessage = (entry.userMessage || '').replace(/"/g, '""');
        const details = (entry.details ? JSON.stringify(entry.details) : '').replace(/"/g, '""');
        return `"${entry.timestamp}","${entry.type}","${entry.sessionId || ''}","${userMessage}","${entry.injectionDetected || false}","${entry.mode || ''}","${entry.retrievedPassagesCount || 0}","${details}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="databox-audit-${timestamp}.csv"`);
      res.send(csvContent);
      
    } else if (format === 'json') {
      // Generate JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="databox-audit-${timestamp}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalEntries: logs.length,
        filters: options,
        logs
      });
      
    } else {
      res.status(400).json({
        error: 'Invalid format',
        message: 'Supported formats: json, csv'
      });
    }

  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/sessions - Get list of active sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const stats = getAuditStats();
    const sessions = Object.keys(stats.bySession).map(sessionId => ({
      sessionId,
      interactionCount: stats.bySession[sessionId],
      lastActivity: null // Would need to track this separately
    }));

    res.json({
      sessions,
      totalSessions: sessions.length
    });

  } catch (error) {
    console.error('Error retrieving sessions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/security-events - Get security-related events
 */
router.get('/security-events', (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const logs = readAuditLog({ limit: parseInt(limit) });
    const securityEvents = logs.filter(entry => 
      entry.injectionDetected || 
      entry.type === 'security_event' ||
      entry.eventType === 'injection_detected'
    );

    res.json({
      events: securityEvents,
      count: securityEvents.length,
      totalLogs: logs.length
    });

  } catch (error) {
    console.error('Error retrieving security events:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
