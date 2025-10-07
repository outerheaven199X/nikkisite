// test-endpoints.js
// Simple test script to verify API endpoints work correctly

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing ScriptRX API endpoints...\n');

  try {
    // Test recommend endpoint
    console.log('📋 Testing /api/recommend...');
    const recommendResult = await makeRequest({
      hostname: 'localhost',
      port: 3333,
      path: '/api/recommend',
      method: 'GET'
    });
    
    console.log(`✅ Status: ${recommendResult.status}`);
    console.log(`📊 Tools returned: ${recommendResult.data.recommended_tools?.length || 0}\n`);

    // Test generate endpoint
    console.log('⚡ Testing /api/generate (NSE)...');
    const generateResult = await makeRequest({
      hostname: 'localhost',
      port: 3333,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      kind: 'nmap-nse',
      meta: {
        name: 'test-scanner',
        description: 'Test script for endpoint validation',
        author: 'scriptsmith-test'
      }
    });

    console.log(`✅ Status: ${generateResult.status}`);
    console.log(`📝 Generated script length: ${generateResult.data.output?.length || 0} chars\n`);

    // Test invalid endpoint
    console.log('❌ Testing invalid template kind...');
    const invalidResult = await makeRequest({
      hostname: 'localhost',
      port: 3333,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      kind: 'invalid-template',
      meta: {}
    });

    console.log(`✅ Status: ${invalidResult.status} (should be 400)`);
    console.log(`🚫 Error: ${invalidResult.data.error}\n`);

    console.log('🎉 All endpoint tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm start');
  }
}

if (require.main === module) {
  testEndpoints();
}

module.exports = { testEndpoints };
