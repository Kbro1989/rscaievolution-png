
try {
    const sqlite3 = require('sqlite3');
    console.log('✅ sqlite3 loaded successfully');
    const db = new sqlite3.Database(':memory:');
    console.log('✅ Database created');
    db.close();
} catch (error) {
    console.error('❌ Failed to load sqlite3:', error);
}
