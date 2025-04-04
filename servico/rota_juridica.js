const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina fornecedor
function exibirFornecedor(req, res) {
    res.render('juridica');
};

//exportando a função 
module.exports = {
    exibirFornecedor
}