var mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 3306,
  connectTimeout: 10000
});

pool.promise().getConnection()
    .then((connection) => {
        console.log("db connection success");
        connection.release();
    })
    .catch((error) => {
        console.error("db connection error:", error);
});

module.exports = pool.promise();