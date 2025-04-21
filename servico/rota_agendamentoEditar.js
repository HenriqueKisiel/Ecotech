const conectiondb = require('../bd/conexao_mysql.js');

function exibirEditarAgendamento(req, res) {
    res.render('agendamentoEditar');
}

module.exports = {
    exibirEditarAgendamento
}