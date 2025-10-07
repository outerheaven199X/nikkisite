// Using built-in Node.js modules for maximum compatibility
const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const fsPromises = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'https://outerheaven.ink'],
  credentials: true
}));

// EASTER EGG: Security monitoring middleware
app.use((req, res, next) => {
  const suspiciousPatterns = [
    /\.\./, /etc\/passwd/i, /proc\/self/i, /bin\/sh/i, /cmd\.exe/i,
    /union\s+select/i, /drop\s+table/i, /insert\s+into/i, /delete\s+from/i,
    /<script/i, /javascript:/i, /on\w+\s*=/i, /eval\(/i,
    /burp/i, /sqlmap/i, /nmap/i, /metasploit/i, /nikto/i, /dirb/i,
    /admin/i, /login/i, /wp-admin/i, /phpmyadmin/i, /\.env/i,
    /\.git/i, /\.svn/i, /\.htaccess/i, /\.htpasswd/i
  ];
  
  const url = req.url.toLowerCase();
  const userAgent = (req.get('User-Agent') || '').toLowerCase();
  
  // Special Burp Suite detection
  if (userAgent.includes('burp') || userAgent.includes('portswigger')) {
    console.log(`🚨 BURP SUITE DETECTED: ${req.ip} - ${userAgent}`);
    return res.status(418).json({ 
      error: "I SEE YOU 👁️", 
      message: "Burp Suite detected! The webmaster knows you're probing. Nice try, but this site is hardened.",
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      note: "All security tools are logged and monitored. Try harder next time."
    });
  }
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent)
  );
  
  if (isSuspicious) {
    console.log(`🚨 SUSPICIOUS REQUEST: ${req.ip} - ${req.method} ${req.url} - ${userAgent}`);
    return res.status(418).json({ 
      error: "I SEE YOU 👁️", 
      message: "The webmaster is watching. This isn't a playground for script kiddies.",
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      note: "All requests are logged and monitored."
    });
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Store for each tool
const stores = {
  scriptrx: { scripts: [] },
  databox: { conversations: [] },
  decoy: { events: [], alerts: [] },
  omni: { apis: [], connections: [] }
};

// ==================== SCRIPTRX API ====================
app.post('/api/scriptrx/generate', (req, res) => {
  const { type, description, parameters } = req.body;
  
  if (!type || !description) {
    return res.status(400).json({ error: 'Type and description are required' });
  }

  // SECURITY: Input validation and sanitization
  const allowedTypes = ['bash', 'python', 'powershell', 'javascript'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid script type' });
  }
  
  // EASTER EGG: Detect injection attempts
  const injectionPatterns = [
    /<script/i, /javascript:/i, /on\w+\s*=/i, /eval\(/i, /function\(/i,
    /union\s+select/i, /drop\s+table/i, /insert\s+into/i, /delete\s+from/i,
    /\.\.\//, /\.\.\\/, /etc\/passwd/i, /proc\/self/i, /bin\/sh/i,
    /burp/i, /sqlmap/i, /nmap/i, /metasploit/i, /payload/i
  ];
  
  const hasInjectionAttempt = injectionPatterns.some(pattern => pattern.test(description));
  if (hasInjectionAttempt) {
    console.log(`🚨 INJECTION ATTEMPT DETECTED: ${req.ip} - ${description.substring(0, 100)}`);
    return res.status(418).json({ 
      error: "I SEE YOU 👁️", 
      message: "Nice try, but this isn't your playground. The webmaster is watching.",
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  
  // Sanitize description to prevent injection
  const sanitizedDescription = description.replace(/[<>\"'&]/g, '').substring(0, 500);
  if (!sanitizedDescription.trim()) {
    return res.status(400).json({ error: 'Description cannot be empty after sanitization' });
  }

  const script = generateScript(type, sanitizedDescription, parameters);
  
  const scriptObj = {
    id: Date.now(),
    type,
    description: sanitizedDescription,
    parameters,
    script,
    createdAt: new Date().toISOString()
  };
  
  stores.scriptrx.scripts.push(scriptObj);
  res.json(scriptObj);
});

app.get('/api/scriptrx/scripts', (req, res) => {
  res.json(stores.scriptrx.scripts);
});

app.get('/api/scriptrx/scripts/:id', (req, res) => {
  const script = stores.scriptrx.scripts.find(s => s.id == req.params.id);
  if (!script) {
    return res.status(404).json({ error: 'Script not found' });
  }
  res.json(script);
});

app.delete('/api/scriptrx/scripts/:id', (req, res) => {
  const index = stores.scriptrx.scripts.findIndex(s => s.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Script not found' });
  }
  stores.scriptrx.scripts.splice(index, 1);
  res.json({ message: 'Script deleted successfully' });
});

// ==================== DATABOX API ====================
app.post('/api/databox/chat', async (req, res) => {
  const { message, model = 'mock' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // EASTER EGG: Detect injection attempts in chat
  const chatInjectionPatterns = [
    /ignore\s+previous\s+instructions/i, /jailbreak/i, /developer\s+mode/i,
    /system\s+prompt/i, /admin\s+password/i, /root\s+access/i,
    /bypass\s+security/i, /override\s+restrictions/i, /dan\s+mode/i,
    /tell\s+me\s+secrets/i, /confidential\s+information/i, /internal\s+data/i
  ];
  
  const hasChatInjection = chatInjectionPatterns.some(pattern => pattern.test(message));
  if (hasChatInjection) {
    console.log(`🚨 CHAT INJECTION ATTEMPT: ${req.ip} - ${message.substring(0, 100)}`);
    return res.status(418).json({ 
      error: "I SEE YOU 👁️", 
      message: "Prompt injection detected! The webmaster is monitoring all conversations.",
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  // SECURITY: Input validation and sanitization
  const sanitizedMessage = message.replace(/[<>\"'&]/g, '').substring(0, 2000);
  if (!sanitizedMessage.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty after sanitization' });
  }

  // Mock LLM response for demo
  const response = await generateMockLLMResponse(sanitizedMessage);
  
  const conversation = {
    id: Date.now(),
    message: sanitizedMessage,
    response,
    model,
    timestamp: new Date().toISOString()
  };
  
  stores.databox.conversations.push(conversation);
  res.json(conversation);
});

app.get('/api/databox/conversations', (req, res) => {
  res.json(stores.databox.conversations);
});

app.get('/api/databox/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    conversations: stores.databox.conversations.length
  });
});

// ==================== DECOY API ====================
app.get('/api/decoy/events', (req, res) => {
  res.json(stores.decoy.events);
});

app.post('/api/decoy/simulate', (req, res) => {
  const { eventType = 'probe', source = 'unknown' } = req.body;
  
  const event = {
    id: Date.now(),
    type: eventType,
    source,
    timestamp: new Date().toISOString(),
    details: generateMockNetworkEvent(eventType, source)
  };
  
  stores.decoy.events.push(event);
  
  // Keep only last 100 events
  if (stores.decoy.events.length > 100) {
    stores.decoy.events = stores.decoy.events.slice(-100);
  }
  
  res.json(event);
});

app.get('/api/decoy/stats', (req, res) => {
  const stats = {
    totalEvents: stores.decoy.events.length,
    eventTypes: stores.decoy.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {}),
    recentActivity: stores.decoy.events.slice(-10)
  };
  
  res.json(stats);
});

// ==================== OMNI API ====================
app.get('/api/omni/apis', (req, res) => {
  res.json(stores.omni.apis);
});

app.post('/api/omni/test-endpoint', (req, res) => {
  const { url, method = 'GET' } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // Mock API test for demo
  const result = {
    id: Date.now(),
    url,
    method,
    status: Math.random() > 0.2 ? 'success' : 'error',
    responseTime: Math.floor(Math.random() * 500) + 50,
    timestamp: new Date().toISOString()
  };
  
  stores.omni.apis.push(result);
  res.json(result);
});

app.get('/api/omni/connections', (req, res) => {
  // Generate mock connection data
  const connections = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    source: `api-${i + 1}`,
    target: `service-${Math.floor(Math.random() * 5) + 1}`,
    status: Math.random() > 0.3 ? 'active' : 'inactive',
    latency: Math.floor(Math.random() * 200) + 10
  }));
  
  res.json(connections);
});

// ==================== HELPER FUNCTIONS ====================
function generateScript(type, description, parameters = {}) {
  const templates = {
    bash: { header: '#!/bin/bash\n\n', comment: '# ', extension: '.sh' },
    python: { header: '#!/usr/bin/env python3\n\n', comment: '# ', extension: '.py' },
    powershell: { header: '# PowerShell Script\n\n', comment: '# ', extension: '.ps1' },
    javascript: { header: '// JavaScript Script\n\n', comment: '// ', extension: '.js' }
  };

  const template = templates[type] || templates.bash;
  let script = template.header;
  script += `${template.comment}Generated script: ${description}\n`;
  script += `${template.comment}Created: ${new Date().toISOString()}\n\n`;

  switch (type) {
    case 'bash':
      script += generateBashScript(description, parameters);
      break;
    case 'python':
      script += generatePythonScript(description, parameters);
      break;
    case 'powershell':
      script += generatePowerShellScript(description, parameters);
      break;
    case 'javascript':
      script += generateJavaScriptScript(description, parameters);
      break;
    default:
      script += `echo "Script for: ${description}"\n`;
  }

  return script;
}

function generateBashScript(description, parameters) {
  let script = '';
  
  if (description.toLowerCase().includes('file')) {
    script += 'echo "Working with files..."\n';
    script += 'for file in *.txt; do\n';
    script += '    echo "Processing: $file"\n';
    script += '    # Add your file processing logic here\n';
    script += 'done\n';
  } else if (description.toLowerCase().includes('backup')) {
    script += 'BACKUP_DIR="/backup/$(date +%Y%m%d)"\n';
    script += 'mkdir -p "$BACKUP_DIR"\n';
    script += 'echo "Creating backup in $BACKUP_DIR"\n';
    script += '# Add backup logic here\n';
  } else {
    script += `echo "Executing: ${description}"\n`;
    script += '# Add your custom logic here\n';
  }
  
  return script;
}

function generatePythonScript(description, parameters) {
  let script = 'import os\nimport sys\nfrom datetime import datetime\n\n';
  script += 'def main():\n';
  script += `    """${description}"""\n`;
  script += '    print(f"Starting script: {datetime.now()}")\n';
  
  if (description.toLowerCase().includes('file')) {
    script += '    \n    # File processing logic\n';
    script += '    import glob\n';
    script += '    for file_path in glob.glob("*.txt"):\n';
    script += '        print(f"Processing: {file_path}")\n';
  } else if (description.toLowerCase().includes('api')) {
    script += '    \n    # API interaction logic\n';
    script += '    import requests\n';
    script += '    # response = requests.get("your-api-endpoint")\n';
  } else {
    script += '    \n    # Custom logic here\n';
    script += `    print("Executing: ${description}")\n`;
  }
  
  script += '\nif __name__ == "__main__":\n';
  script += '    main()\n';
  
  return script;
}

function generatePowerShellScript(description, parameters) {
  let script = `Write-Host "Starting script: ${description}"\n`;
  script += 'Write-Host "Timestamp: $(Get-Date)"\n\n';
  
  if (description.toLowerCase().includes('registry')) {
    script += '# Registry operations\n';
    script += '$regPath = "HKLM:\\SOFTWARE\\YourApp"\n';
    script += 'if (Test-Path $regPath) {\n';
    script += '    Write-Host "Registry path exists"\n';
    script += '}\n';
  } else {
    script += `Write-Host "Executing: ${description}"\n`;
    script += '# Add your custom logic here\n';
  }
  
  return script;
}

function generateJavaScriptScript(description, parameters) {
  let script = 'const fs = require(\'fs\');\nconst path = require(\'path\');\n\n';
  script += 'async function main() {\n';
  script += `    console.log('Starting script: ${description}');\n`;
  script += '    console.log(\'Timestamp:\', new Date().toISOString());\n\n';
  
  if (description.toLowerCase().includes('file')) {
    script += '    // File operations\n';
    script += '    const files = fs.readdirSync(\'.\').filter(f => f.endsWith(\'.txt\'));\n';
    script += '    files.forEach(file => {\n';
    script += '        console.log(`Processing: ${file}`);\n';
    script += '    });\n';
  } else {
    script += `    console.log('Executing: ${description}');\n`;
    script += '    // Add your custom logic here\n';
  }
  
  script += '}\n\n';
  script += 'main().catch(console.error);\n';
  
  return script;
}

async function generateMockLLMResponse(message) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const responses = [
    `I understand you're asking about: "${message}". This is a demonstration of the Databox LLM integration system.`,
    `Based on your query "${message}", here's what I can help with: This system provides secure LLM interactions with full audit logging.`,
    `Your message "${message}" has been processed. In a production environment, this would connect to your chosen LLM provider (OpenAI, Anthropic, Ollama, etc.).`,
    `Processing: "${message}". The Databox system ensures all interactions are logged and monitored for security compliance.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateMockNetworkEvent(eventType, source) {
  const events = {
    probe: {
      protocol: 'TCP',
      port: Math.floor(Math.random() * 65535),
      packets: Math.floor(Math.random() * 10) + 1,
      severity: 'medium'
    },
    scan: {
      protocol: 'TCP',
      portRange: '1-1000',
      duration: Math.floor(Math.random() * 30) + 5,
      severity: 'high'
    },
    connection: {
      protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
      port: Math.floor(Math.random() * 65535),
      duration: Math.floor(Math.random() * 300),
      severity: 'low'
    }
  };
  
  return events[eventType] || events.probe;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      scriptrx: { scripts: stores.scriptrx.scripts.length },
      databox: { conversations: stores.databox.conversations.length },
      decoy: { events: stores.decoy.events.length },
      omni: { apis: stores.omni.apis.length }
    }
  });
});

// Serve files from the public directory (parent directory)
app.get('/public/*', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', req.params[0]);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log(`File not found: ${filePath}`);
      res.status(404).send('File not found');
    }
  });
});

// Serve static files and handle SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the main index.html for all non-API routes
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Portfolio server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});
