const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina relatorios
function exibirRelatorios(req, res) {
    res.render('relatorios');
};

//Função para pagina cadastrar relatorios
function exibirCadastrarRelatorios(req, res) {
    res.render('relatoriosCadastrar');
};

//exportando a função 
module.exports = {
    exibirRelatorios,
    exibirCadastrarRelatorios
}