const conectiondb = require('../bd/conexao_mysql.js');

function exibirrotaeditar(req, res) {
    res.render('rotaEditar');
}

module.exports = {
    exibirrotaeditar
}