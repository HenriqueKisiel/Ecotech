const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina home
function exibirNovoMaterial2(req, res) {
    res.render('novoMaterial2');
};

//exportando a função 
module.exports = {
    exibirNovoMaterial2
}