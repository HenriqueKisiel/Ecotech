const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina usuario
function exibirUsuario(req, res) {
    res.render('usuario');
};


//exportando a função 
module.exports = {
    exibirUsuario
}