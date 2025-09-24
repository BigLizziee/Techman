const mysql = require('mysql2');


const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'techman',
    port: 3306,
    charset: 'utf8mb4'
};


const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


const promisePool = pool.promise();


const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Conectado ao MySQL com sucesso!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com MySQL:', error.message);
        return false;
    }
};


const executeQuery = async (query, params = []) => {
    try {
        const [rows] = await promisePool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Erro ao executar query:', error);
        throw error;
    }
};


const executeInsert = async (query, params = []) => {
    try {
        const [result] = await promisePool.execute(query, params);
        return result.insertId;
    } catch (error) {
        console.error('Erro ao executar insert:', error);
        throw error;
    }
};

module.exports = {
    pool: promisePool,
    testConnection,
    executeQuery,
    executeInsert
};

