const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina rotas programadas
function exibirRotas(req, res) {
    res.render('rotas');
};

//Função para pagina atualizar Rotas
function exibirAtualizarRotas(req, res) {
    res.render('rotasAtualizar');
};

//Função para pagina de cadastrar rotas
function exibirCadastrarRotas(req, res) {
    res.render('rotasCadastrar');
};

//exportando a função 
module.exports = {
    exibirRotas,
    exibirAtualizarRotas,
    exibirCadastrarRotas
}