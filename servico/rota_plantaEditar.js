const conectiondb = require('../bd/conexao_mysql.js');

function exibirPlantaEditar(req, res) {
    res.render('plantaEditar');
};

module.exports = {
    exibirPlantaEditar
}