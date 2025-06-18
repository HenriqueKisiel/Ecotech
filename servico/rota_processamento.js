const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir processamento
function exibirProcessamento(req, res) {
    res.render('processamento', { 
        usuario: req.session.usuario
    });
}
//exportando a função 
module.exports = {
    exibirProcessamento
}