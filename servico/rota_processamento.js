const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir processamento
function exibirProcessamento(req, res) {
    res.render('processamento');
}
//exportando a função 
module.exports = {
    exibirProcessamento
}