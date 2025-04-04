const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina planta
function exibirPlanta(req, res) {
    res.render('planta');
};

//exportando a função 
module.exports = {
    exibirPlanta
}