const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina Atualizar status
function exibirAtualizarRotas(req, res) {
    res.render('attStatus');
};

//exportando a função 
module.exports = {
    exibirAtualizarRotas
}