const conectiondb = require('../bd/conexao_mysql.js');

function exibirNovoAgendamento(req, res) {
    res.render('agendamentoAdd');
}

module.exports = {
    exibirNovoAgendamento
}