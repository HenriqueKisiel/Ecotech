const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina material
function exibirMaterial(req, res) {
    res.render('material');
};

//exportando a função 
module.exports = {
    exibirMaterial
}