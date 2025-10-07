const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;

// Store for each tool
const stores = {
  scriptrx: { scripts: [] },
  databox: { conversations: [] },
  decoy: { events: [], alerts: [] },
  omni: { apis: [], connections: [] }
};

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function setCorsHeaders(res) {
  // SECURITY: Restrict CORS to specific domains only
  const allowedOrigins = ['http://localhost:8080', 'http://localhost:3000', 'https://outerheaven.ink'];
  const origin = res.req?.headers?.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, data, statusCode = 200) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    
    const mimeType = getMimeType(filePath);
    setCorsHeaders(res);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

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
      script += 'echo "Working with files..."\n';
      script += 'for file in *.txt; do\n';
      script += '    echo "Processing: $file"\n';
      script += '    # Add your file processing logic here\n';
      script += 'done\n';
      break;
    case 'python':
      script += 'import os\nimport sys\nfrom datetime import datetime\n\n';
      script += 'def main():\n';
      script += `    """${description}"""\n`;
      script += '    print(f"Starting script: {datetime.now()}")\n';
      script += '    # Add your custom logic here\n';
      script += '\nif __name__ == "__main__":\n';
      script += '    main()\n';
      break;
    case 'powershell':
      script += `Write-Host "Starting script: ${description}"\n`;
      script += 'Write-Host "Timestamp: $(Get-Date)"\n\n';
      script += '# Add your custom logic here\n';
      break;
    case 'javascript':
      script += 'const fs = require(\'fs\');\nconst path = require(\'path\');\n\n';
      script += 'async function main() {\n';
      script += `    console.log('Starting script: ${description}');\n`;
      script += '    console.log(\'Timestamp:\', new Date().toISOString());\n\n';
      script += '    // Add your custom logic here\n';
      script += '}\n\n';
      script += 'main().catch(console.error);\n';
      break;
  }

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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      let requestData = {};
      if (body) {
        try {
          requestData = JSON.parse(body);
        } catch (e) {
          // Invalid JSON
        }
      }

      // ScriptRX API
      if (pathname === '/api/scriptrx/generate' && method === 'POST') {
        const { type, description, parameters } = requestData;
        
        if (!type || !description) {
          sendJSON(res, { error: 'Type and description are required' }, 400);
          return;
        }

        const script = generateScript(type, description, parameters);
        
        const scriptObj = {
          id: Date.now(),
          type,
          description,
          parameters,
          script,
          createdAt: new Date().toISOString()
        };
        
        stores.scriptrx.scripts.push(scriptObj);
        sendJSON(res, scriptObj);
        return;
      }

      if (pathname === '/api/scriptrx/scripts' && method === 'GET') {
        sendJSON(res, stores.scriptrx.scripts);
        return;
      }

      if (pathname === '/api/scriptrx/recommend' && method === 'GET') {
        sendJSON(res, {
          recommended_tools: [
            { name: "nmap (NSE)", reason: "Scriptable with Lua for network discovery & checks" },
            { name: "Metasploit", reason: "Modular exploitation & auxiliary modules (Ruby)" },
            { name: "John the Ripper", reason: "Password cracking, rules & wordlists" },
            { name: "sqlmap", reason: "Automated SQL injection detection/exploitation" },
            { name: "masscan", reason: "Very fast port scanner for large address spaces" },
            { name: "gobuster/dirbuster", reason: "Directory & file bruteforcing for web content discovery" },
            { name: "hydra", reason: "Network login brute-force tool" },
            { name: "hashcat", reason: "GPU-accelerated password recovery" }
          ]
        });
        return;
      }

      // Databox API
      if (pathname === '/api/databox/chat' && method === 'POST') {
        const { message, model = 'mock' } = requestData;
        
        if (!message) {
          sendJSON(res, { error: 'Message is required' }, 400);
          return;
        }

        const response = await generateMockLLMResponse(message);
        
        const conversation = {
          id: Date.now(),
          message,
          response,
          model,
          timestamp: new Date().toISOString()
        };
        
        stores.databox.conversations.push(conversation);
        sendJSON(res, conversation);
        return;
      }

      if (pathname === '/api/databox/conversations' && method === 'GET') {
        sendJSON(res, stores.databox.conversations);
        return;
      }

      // DECOY API
      if (pathname === '/api/decoy/simulate' && method === 'POST') {
        const { eventType = 'probe', source = 'unknown' } = requestData;
        
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
        
        sendJSON(res, event);
        return;
      }

      if (pathname === '/api/decoy/stats' && method === 'GET') {
        const stats = {
          totalEvents: stores.decoy.events.length,
          eventTypes: stores.decoy.events.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
          }, {}),
          recentActivity: stores.decoy.events.slice(-10)
        };
        
        sendJSON(res, stats);
        return;
      }

      // OMNI API
      if (pathname === '/api/omni/test-endpoint' && method === 'POST') {
        const { url, method = 'GET' } = requestData;
        
        if (!url) {
          sendJSON(res, { error: 'URL is required' }, 400);
          return;
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
        sendJSON(res, result);
        return;
      }

      if (pathname === '/api/omni/connections' && method === 'GET') {
        // Generate mock connection data
        const connections = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          source: `api-${i + 1}`,
          target: `service-${Math.floor(Math.random() * 5) + 1}`,
          status: Math.random() > 0.3 ? 'active' : 'inactive',
          latency: Math.floor(Math.random() * 200) + 10
        }));
        
        sendJSON(res, connections);
        return;
      }

      // Health check
      if (pathname === '/api/health' && method === 'GET') {
        sendJSON(res, { 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          services: {
            scriptrx: { scripts: stores.scriptrx.scripts.length },
            databox: { conversations: stores.databox.conversations.length },
            decoy: { events: stores.decoy.events.length },
            omni: { apis: stores.omni.apis.length }
          }
        });
        return;
      }

      // 404 for unknown API routes
      sendJSON(res, { error: 'API endpoint not found' }, 404);
    });
    return;
  }

  // Static file serving
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`🚀 Portfolio server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🎯 Interactive Tools Available:');
  console.log(`   • ScriptRX: http://localhost:${PORT}/tools/scriptrx.html`);
  console.log(`   • Databox: http://localhost:${PORT}/tools/databox.html`);
  console.log(`   • DECOY: http://localhost:${PORT}/tools/decoy.html`);
  console.log(`   • OMNI: http://localhost:${PORT}/tools/omni.html`);
});
