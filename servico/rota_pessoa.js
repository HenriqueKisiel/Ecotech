const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina pessoa
function exibirPessoa(req, res) {
    res.render('pessoa');
};

//exportando a função 
module.exports = {
    exibirPessoa
}