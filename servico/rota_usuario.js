const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina usuario
function exibirUsuario(req, res) {
    
    let sql = 'SELECT a.nm_usuario, b.nm_pessoa_fisica, b.ds_email FROM usuario a, pessoa_fisica b WHERE a.cd_pessoa_fisica = b.cd_pessoa_fisica';

    //Executando a consulta no banco de dados
    conectiondb().query(sql, function (erro, retorno) {
        res.render('usuario', { usuarios: retorno });
    });
};

//rota remover usuario
function removerUsuario(req, res) {
    console.log(req.params.nm_usuario)
    res.end('Usuario', {nm_usuario}, 'removido com sucesso!');
}

//exportando a função 
module.exports = {
    exibirUsuario,
    removerUsuario
}