const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina agendamento de coleta
function exibirAgendamento(req, res) {
    res.render('agendamento');
};

//exportando a função 
module.exports = {
    exibirAgendamento
}