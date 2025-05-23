const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina motora
function exibirCaminhao(req, res) {
    res.render('caminhao');
};


//exportando a função 
module.exports = {
    exibirCaminhao
}