const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class SQLiteStorage {
  constructor(dbPath = 'data/databox.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
          return;
        }
        console.log('Connected to SQLite database');
        this.createTables().then(resolve).catch(reject);
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createDocsTable = `
        CREATE TABLE IF NOT EXISTS docs (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createFTS5Table = `
        CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
          content,
          content='docs',
          content_rowid='rowid'
        )
      `;

      this.db.serialize(() => {
        this.db.run(createDocsTable, (err) => {
          if (err) {
            console.error('Error creating docs table:', err.message);
            reject(err);
            return;
          }
        });

        this.db.run(createFTS5Table, (err) => {
          if (err) {
            console.error('Error creating FTS5 table:', err.message);
            reject(err);
            return;
          }
          console.log('Database tables created successfully');
          resolve();
        });
      });
    });
  }

  async addDoc({ id, title, content }) {
    return new Promise((resolve, reject) => {
      const insertDoc = `
        INSERT OR REPLACE INTO docs (id, title, content, uploaded_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `;

      this.db.run(insertDoc, [id, title, content], function(err) {
        if (err) {
          console.error('Error adding document:', err.message);
          reject(err);
          return;
        }

        // Update FTS5 index
        const updateFTS = `
          INSERT OR REPLACE INTO docs_fts (rowid, content)
          VALUES (?, ?)
        `;
        
        this.db.run(updateFTS, [this.lastID, content], (ftsErr) => {
          if (ftsErr) {
            console.error('Error updating FTS5 index:', ftsErr.message);
            reject(ftsErr);
            return;
          }
          console.log(`Document ${id} added successfully`);
          resolve({ id, title, rowCount: this.changes });
        });
      }.bind(this));
    });
  }

  async searchDocs(query, limit = 5) {
    return new Promise((resolve, reject) => {
      const searchQuery = `
        SELECT d.id, d.title, d.content, 
               bm25(docs_fts) as score
        FROM docs_fts
        JOIN docs d ON docs_fts.rowid = d.rowid
        WHERE docs_fts MATCH ?
        ORDER BY bm25(docs_fts)
        LIMIT ?
      `;

      this.db.all(searchQuery, [query, limit], (err, rows) => {
        if (err) {
          console.error('Error searching documents:', err.message);
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export singleton instance
const storage = new SQLiteStorage();

module.exports = {
  initDB: () => storage.initDB(),
  addDoc: (doc) => storage.addDoc(doc),
  searchDocs: (query, limit) => storage.searchDocs(query, limit),
  close: () => storage.close()
};
