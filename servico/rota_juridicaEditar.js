const conectiondb = require('../bd/conexao_mysql.js');

function exibirJuridicaEditar(req, res) {
    res.render('juridicaEditar');
};

module.exports = {
    exibirJuridicaEditar
}