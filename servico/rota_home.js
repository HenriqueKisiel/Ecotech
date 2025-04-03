const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina home
function exibirHome(req, res) {
    res.render('home');
};
 
//exportando a função 
module.exports = {
    exibirHome
}