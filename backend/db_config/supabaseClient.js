const postgres = require('postgres')
require('dotenv').config();



const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function testConnection() {
    try {
        const result = await sql`SELECT NOW()`;
        console.log('Database connected successfully:', result);
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    }
}

testConnection();

module.exports = sql;
