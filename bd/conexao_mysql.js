//Require do Mysql
const mysql = require('mysql');
const { resolveSoa } = require('dns');

//Conexão com o banco
function conectiondb() {
    const conexao = mysql.createConnection({
<<<<<<< HEAD
        host: 'mysql.ecotech.kinghost.net',
        user: 'ecotech_add1', // user do henrique : administrador -  Nico: admin
        password: 'ecotech2025', // senha do banco Henrique: 123456789
=======
        host: 'localhost',
        user: 'admin', // user do henrique : administrador -  Nico: admin
        password: '123456789', // senha do banco Henrique: 123456789
>>>>>>> Atualização_Gui_e_Nau
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