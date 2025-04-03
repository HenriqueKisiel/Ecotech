const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina cadastrar estoque
function exibirEstoqueNovo(req, res) {
    res.render('estoqueNovo');
};

//Função para pagina buscar material no estoque
function exibirEstoqueBuscar(req, res) {
    res.render('estoqueBuscar');
};

//Função para pagina entrada de material
function exibirEstoqueEntrada(req, res) {
    res.render('estoqueEntrada');
};

//Função para pagina saida de material
function exibirEstoqueSaida(req, res) {
    res.render('estoqueSaida');
};

//exportando a função 
module.exports = {
    exibirEstoqueNovo,
    exibirEstoqueBuscar,
    exibirEstoqueEntrada,
    exibirEstoqueSaida
}