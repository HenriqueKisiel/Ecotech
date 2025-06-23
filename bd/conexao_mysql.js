//Require do Mysql
const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'mysql.ecotech.kinghost.net',
    user: 'ecotech', // user do henrique : administrador -  Nico: admin
    password: 'ecotech2025', // senha do banco Henrique: 123456789
    database: 'ecotech',   // nome do banco Henrique: projeto - 
    connectionLimit: 2 // ou outro valor adequado
});

module.exports = () => pool;