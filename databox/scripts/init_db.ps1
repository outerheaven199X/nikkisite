# Database initialization script for databox (Windows PowerShell)
# Creates SQLite database with FTS5 tables and seeds with sample data

Write-Host "🚀 Initializing databox database..." -ForegroundColor Green

# Create data directory if it doesn't exist
if (!(Test-Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
}
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Database file path
$DB_FILE = "data/databox.db"

# Check if sqlite3 is available
try {
    $null = Get-Command sqlite3 -ErrorAction Stop
} catch {
    Write-Host "❌ sqlite3 command not found. Please install SQLite3." -ForegroundColor Red
    Write-Host "   Download from: https://sqlite.org/download.html" -ForegroundColor Yellow
    Write-Host "   Or install via chocolatey: choco install sqlite" -ForegroundColor Yellow
    exit 1
}

# Remove existing database if it exists
if (Test-Path $DB_FILE) {
    Write-Host "🗑️  Removing existing database..." -ForegroundColor Yellow
    Remove-Item $DB_FILE
}

Write-Host "📊 Creating database tables..." -ForegroundColor Blue

# Create the main docs table
$createDocsTable = @"
CREATE TABLE docs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"@

sqlite3 $DB_FILE $createDocsTable

# Create FTS5 virtual table for full-text search
$createFTS5Table = @"
CREATE VIRTUAL TABLE docs_fts USING fts5(
    content,
    content='docs',
    content_rowid='rowid'
);
"@

sqlite3 $DB_FILE $createFTS5Table

Write-Host "✅ Database tables created successfully" -ForegroundColor Green

# Seed with sample documents
Write-Host "🌱 Seeding database with sample documents..." -ForegroundColor Blue

# Sample document 1: Company information
$insertCompanyInfo = @"
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'company-info-001',
    'Company Overview',
    'Our company is a leading technology firm specializing in artificial intelligence and machine learning solutions. We were founded in 2020 and have grown to serve over 1000 clients worldwide. Our headquarters are located in San Francisco, California. We pride ourselves on innovation, security, and customer satisfaction. Our team consists of 150+ engineers, data scientists, and product managers working across multiple time zones.',
    CURRENT_TIMESTAMP
);
"@

sqlite3 $DB_FILE $insertCompanyInfo

# Sample document 2: Security policies
$insertSecurityPolicy = @"
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'security-policy-001',
    'Security Guidelines',
    'All employees must follow strict security protocols when handling sensitive information. Passwords must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters. Two-factor authentication is mandatory for all systems. Never share credentials via email or chat. Report any security incidents immediately to the security team. Regular security training is required for all staff members.',
    CURRENT_TIMESTAMP
);
"@

sqlite3 $DB_FILE $insertSecurityPolicy

# Sample document 3: Product documentation
$insertProductDocs = @"
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'product-docs-001',
    'API Documentation',
    'Our REST API provides endpoints for user management, data processing, and analytics. The base URL is https://api.company.com/v1. Authentication is handled via JWT tokens. Rate limiting is set to 1000 requests per hour per API key. All responses are in JSON format. Error codes follow standard HTTP status codes. For support, contact api-support@company.com.',
    CURRENT_TIMESTAMP
);
"@

sqlite3 $DB_FILE $insertProductDocs

# Sample document 4: Test injection content
$insertTestInjection = @"
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'test-injection-001',
    'Test Document',
    'This is a test document containing various types of content. It includes normal text, some technical terms, and various keywords. The document is used for testing search functionality and retrieval systems. It contains information about testing procedures, quality assurance, and validation methods. EXFIL: This is a test injection marker for demonstration purposes. It should be detected by the system.',
    CURRENT_TIMESTAMP
);
"@

sqlite3 $DB_FILE $insertTestInjection

# Sample document 5: Employee handbook
$insertEmployeeHandbook = @"
INSERT INTO docs (id, title, content, uploaded_at) VALUES (
    'employee-handbook-001',
    'Employee Handbook',
    'Welcome to our company! This handbook contains important information about our policies, procedures, and benefits. All employees are expected to read and understand these guidelines. Our core values include integrity, innovation, and collaboration. We offer comprehensive health insurance, retirement plans, and professional development opportunities. For questions, contact HR at hr@company.com.',
    CURRENT_TIMESTAMP
);
"@

sqlite3 $DB_FILE $insertEmployeeHandbook

# Update FTS5 index with all documents
Write-Host "🔍 Updating full-text search index..." -ForegroundColor Blue

$updateFTS5 = @"
INSERT INTO docs_fts (rowid, content)
SELECT rowid, content FROM docs;
"@

sqlite3 $DB_FILE $updateFTS5

# Verify the setup
Write-Host "🔍 Verifying database setup..." -ForegroundColor Blue

# Check document count
$docCount = sqlite3 $DB_FILE "SELECT COUNT(*) FROM docs;"
Write-Host "📊 Documents in database: $docCount" -ForegroundColor Green

# Test FTS5 search
Write-Host "🔍 Testing full-text search..." -ForegroundColor Blue
$testSearch = @"
SELECT id, title, bm25(docs_fts) as score 
FROM docs_fts 
JOIN docs ON docs_fts.rowid = docs.rowid 
WHERE docs_fts MATCH 'security' 
ORDER BY bm25(docs_fts) 
LIMIT 3;
"@

sqlite3 $DB_FILE $testSearch

Write-Host ""
Write-Host "✅ Database initialization completed successfully!" -ForegroundColor Green
Write-Host "📁 Database file: $DB_FILE" -ForegroundColor Cyan
Write-Host "📊 Documents seeded: $docCount" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 You can now start the databox server with: npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Note: The database includes test injection markers for demonstration purposes." -ForegroundColor Yellow
Write-Host "   These are used to test the system's ability to detect and handle injection attempts." -ForegroundColor Yellow
