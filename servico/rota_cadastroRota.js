const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina cadastros de rotas
function exibirRotaCadastro(req, res) {
    res.render('cadastroRota');
};

//exportando a função 
module.exports = {
    exibirRotaCadastro
}