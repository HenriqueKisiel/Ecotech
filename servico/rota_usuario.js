const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina usuario
function exibirUsuario(req, res) {
    
    let sql = 'SELECT cd_pessoa_fisica, nm_usuario, nm_pessoa_fisica, ds_email, Obter_Situacao(ie_situacao) as ie_situacao  FROM Pessoa_Usuario';

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

//rota inativar usuario
function inativarUsuario(req, res) {
    let sql = 'UPDATE Pessoa_Usuario SET ie_situacao = ? WHERE nm_usuario = ? AND cd_pessoa_fisica IS NOT NULL';

    // Executando a consulta no banco de dados
    conectiondb().query(sql, ['i', req.params.nm_usuario], function (erro, retorno) {
        if (erro) {
            console.error('Erro ao remover usuário:', erro);
            return res.status(500).send('Erro ao remover usuário.');
        }

        // Verifica se o usuário foi removido com sucesso
        if (retorno.affectedRows > 0) {
            console.log('Usuário', req.params.nm_usuario, 'inativado com sucesso!');
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
    inativarUsuario
}