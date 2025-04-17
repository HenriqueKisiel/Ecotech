const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina cadastros
function exibirCadastros(req, res) {
    res.render('cadastros');
};

//exportando a função 
module.exports = {
    exibirCadastros
}