//Require do Mysql
const mysql = require('mysql');
const { resolveSoa } = require('dns');

//Conexão com o banco
function conectiondb() {
    const conexao = mysql.createConnection({
        host: 'localhost',
        user: 'root', // user do henrique : administrador -  Nico: admin
        password: '12345678', // senha do banco Henrique: 123456789
        database: 'ecotech'   // nome do banco Henrique: projeto - 
    });

    conexao.connect(function (erro) {
        if (erro) {
            console.error('Erro ao conectar ao banco de dados:', erro);
            return;
        }
        console.log('Conexão efetuada com sucesso!');
    });
    return conexao
}

//Exportando a função de conexão
module.exports = conectiondb;