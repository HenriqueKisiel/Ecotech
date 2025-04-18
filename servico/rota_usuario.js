const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina usuario
function exibirUsuario(req, res) {
    
    let sql = 'SELECT a.nm_usuario, b.nm_pessoa_fisica, b.ds_email FROM usuario a, pessoa_fisica b WHERE a.cd_pessoa_fisica = b.cd_pessoa_fisica';

    //Executando a consulta no banco de dados
    conectiondb().query(sql, function (erro, retorno) {
        res.render('usuario', { usuarios: retorno });
    });
};

//Função para editar usuario
function AlterarUsuario(req, res) {
    console.log(req.params.nm_usuario);
    res.end();
}

//rota remover usuario
function removerUsuario(req, res) {
    let sql = 'DELETE FROM usuario WHERE nm_usuario = ?';

    // Executando a consulta no banco de dados
    conectiondb().query(sql, [req.params.nm_usuario], function (erro, retorno) {
        if (erro) {
            console.error('Erro ao remover usuário:', erro);
            return res.status(500).send('Erro ao remover usuário.');
        }

        // Verifica se o usuário foi removido com sucesso
        if (retorno.affectedRows > 0) {
            console.log('Usuário', req.params.nm_usuario, 'removido com sucesso!');
        } else {
            console.log('Usuário não encontrado!');
        }

        // Redireciona para a página de usuários
        res.redirect('/usuario');
    });
}

//exportando a função 
module.exports = {
    exibirUsuario,
    AlterarUsuario,
    removerUsuario
}