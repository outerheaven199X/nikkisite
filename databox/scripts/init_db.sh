#!/bin/bash

# Database initialization script for databox
# Creates SQLite database with FTS5 tables and seeds with sample data

set -e

echo "🚀 Initializing databox database..."

# Create data directory if it doesn't exist
mkdir -p data
mkdir -p logs

# Database file path
DB_FILE="data/databox.db"

# Check if sqlite3 is available
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ sqlite3 command not found. Please install SQLite3."
    echo "   On Ubuntu/Debian: sudo apt-get install sqlite3"
    echo "   On macOS: brew install sqlite3"
    echo "   On Windows: Download from https://sqlite.org/download.html"
    exit 1
fi

# Remove existing database if it exists
if [ -f "$DB_FILE" ]; then
    echo "🗑️  Removing existing database..."
    rm "$DB_FILE"
fi

echo "📊 Creating database tables..."

# Create the main docs table
sqlite3 "$DB_FILE" <<EOF
CREATE TABLE docs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
EOF

# Create FTS5 virtual table for full-text search
sqlite3 "$DB_FILE" <<EOF
CREATE VIRTUAL TABLE docs_fts USING fts5(
    content,
    content='docs',
    content_rowid='rowid'
);
EOF

echo "✅ Database tables created successfully"

# Seed with sample documents
echo "🌱 Seeding database with sample documents..."

# Sample document 1: Company information
sqlite3 "$DB_FILE" <<EOF
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'company-info-001',
    'Company Overview',
    'Our company is a leading technology firm specializing in artificial intelligence and machine learning solutions. We were founded in 2020 and have grown to serve over 1000 clients worldwide. Our headquarters are located in San Francisco, California. We pride ourselves on innovation, security, and customer satisfaction. Our team consists of 150+ engineers, data scientists, and product managers working across multiple time zones.',
    CURRENT_TIMESTAMP
);
EOF

# Sample document 2: Security policies
sqlite3 "$DB_FILE" <<EOF
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'security-policy-001',
    'Security Guidelines',
    'All employees must follow strict security protocols when handling sensitive information. Passwords must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters. Two-factor authentication is mandatory for all systems. Never share credentials via email or chat. Report any security incidents immediately to the security team. Regular security training is required for all staff members.',
    CURRENT_TIMESTAMP
);
EOF

# Sample document 3: Product documentation
sqlite3 "$DB_FILE" <<EOF
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'product-docs-001',
    'API Documentation',
    'Our REST API provides endpoints for user management, data processing, and analytics. The base URL is https://api.company.com/v1. Authentication is handled via JWT tokens. Rate limiting is set to 1000 requests per hour per API key. All responses are in JSON format. Error codes follow standard HTTP status codes. For support, contact api-support@company.com.',
    CURRENT_TIMESTAMP
);
EOF

# Sample document 4: Test injection content
sqlite3 "$DB_FILE" <<EOF
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'test-injection-001',
    'Test Document',
    'This is a test document containing various types of content. It includes normal text, some technical terms, and various keywords. The document is used for testing search functionality and retrieval systems. It contains information about testing procedures, quality assurance, and validation methods. EXFIL: This is a test injection marker for demonstration purposes. It should be detected by the system.',
    CURRENT_TIMESTAMP
);
EOF

# Sample document 5: Employee handbook
sqlite3 "$DB_FILE" <<EOF
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'employee-handbook-001',
    'Employee Handbook',
    'Welcome to our company! This handbook contains important information about our policies, procedures, and benefits. All employees are expected to read and understand these guidelines. Our core values include integrity, innovation, and collaboration. We offer comprehensive health insurance, retirement plans, and professional development opportunities. For questions, contact HR at hr@company.com.',
    CURRENT_TIMESTAMP
);
EOF

# Update FTS5 index with all documents
echo "🔍 Updating full-text search index..."

sqlite3 "$DB_FILE" <<EOF
INSERT INTO docs_fts (rowid, content)
SELECT rowid, content FROM docs;
EOF

# Verify the setup
echo "🔍 Verifying database setup..."

# Check table structure
echo "📋 Table structure:"
sqlite3 "$DB_FILE" ".schema docs"
sqlite3 "$DB_FILE" ".schema docs_fts"

# Check document count
DOC_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM docs;")
echo "📊 Documents in database: $DOC_COUNT"

# Test FTS5 search
echo "🔍 Testing full-text search..."
sqlite3 "$DB_FILE" "SELECT id, title, bm25(docs_fts) as score FROM docs_fts JOIN docs ON docs_fts.rowid = docs.rowid WHERE docs_fts MATCH 'security' ORDER BY bm25(docs_fts) LIMIT 3;"

echo ""
echo "✅ Database initialization completed successfully!"
echo "📁 Database file: $DB_FILE"
echo "📊 Documents seeded: $DOC_COUNT"
echo ""
echo "🚀 You can now start the databox server with: npm start"
echo ""
echo "📝 Note: The database includes test injection markers for demonstration purposes."
echo "   These are used to test the system's ability to detect and handle injection attempts."
