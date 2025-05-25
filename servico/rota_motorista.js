const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina motora
function exibirMotorista(req, res) {
    res.render('motorista');
};


//exportando a função 
module.exports = {
    exibirMotorista
}