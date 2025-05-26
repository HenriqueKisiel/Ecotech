const conectiondb = require('../bd/conexao_mysql');

//Função para pagina home
function exibirRelatorioNovo(req, res) {
    res.render('relatoriosNovo');
};

//exportando a função 
module.exports = {
    exibirRelatorioNovo
}