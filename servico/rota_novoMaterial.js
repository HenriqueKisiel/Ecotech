const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina home
function exibirNovoMaterial(req, res) {
    res.render('novoMaterial');
};

//exportando a função 
module.exports = {
    exibirNovoMaterial
}