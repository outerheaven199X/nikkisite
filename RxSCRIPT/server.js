// server.js
// CURSOR: minimal Express API for template generation
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const TEMPLATES = {
  "nmap-nse": ({name, description, author}) => `-- ${name || "nse-script"}: ${description || "Generated NSE script skeleton"}
-- Author: ${author || "scriptsmith"}
-- Minimal NSE script skeleton

local nmap = require "nmap"
local shortport = require "shortport"
local stdnse = require "stdnse"
local string = require "string"

description = [[
  ${description || "Short description"}
]]

categories = {"discovery", "default"}

portrule = shortport.port_or_service({80,443}, {"http", "https"})

action = function(host, port)
  -- CURSOR: implement logic here
  return stdnse.format_output(true, "Hello from generated NSE for %s:%d", host.targetname or host.ip, port.number)
end
`,

  "metasploit-module": ({typeModule, name, description, author}) => `# ${name || "module_name"} - ${description || "Metasploit module skeleton"}
# Author: ${author || "scriptsmith"}
# Minimal Metasploit module skeleton (Ruby)

require 'msf/core'

class MetasploitModule < Msf::Auxiliary
  include Msf::Exploit::Remote::Tcp

  def initialize(info = {})
    super(update_info(info,
      'Name'           => '${name || "Example Module"}',
      'Description'    => %q{
        ${description || "Generated module skeleton"}
      },
      'Author'         => ['${author || "scriptsmith"}'],
      'License'        => MSF_LICENSE
    ))

    register_options(
      [
        Opt::RPORT(80)
      ], self.class
    )
  end

  def run
    print_status("Running generated module against \#{datastore['RHOST']}:#{datastore['RPORT']}")
    # CURSOR: add module logic here
  end
end
`,

  "john-usage": ({note, wordlist}) => `# John the Ripper snippet - usage notes
# CURSOR: basic examples for john usage and wordlist
# Example: single wordlist-based attack
john --wordlist=${wordlist || "/usr/share/wordlists/rockyou.txt"} --format=raw-md5 hashes.txt

# Example: incremental / rules
john --rules --wordlist=${wordlist || "/usr/share/wordlists/rockyou.txt"} hashes.txt

# Notes:
# ${note || "Tune --format and options to your hash type. Use 'john --list=formats' to discover formats."}
`
};

// Simple generator endpoint
app.post('/api/generate', (req, res) => {
  const { kind, meta } = req.body || {};
  if (!kind || !TEMPLATES[kind]) return res.status(400).json({ error: 'unknown kind' });

  const output = TEMPLATES[kind](meta || {});
  res.json({ kind, output });
});

app.get('/api/recommend', (req, res) => {
  // CURSOR: high-level recommendations (kept brief)
  res.json({
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
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log('scriptsmith API listening on', PORT));
