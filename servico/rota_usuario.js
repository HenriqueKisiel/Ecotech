const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina usuario
function exibirUsuario(req, res) {
    
    let sql = 'SELECT cd_usuario, nm_usuario, nm_pessoa_fisica, ds_email, Obter_Situacao(ie_situacao) as ie_situacao  FROM Pessoa_Usuario';

    //Executando a consulta no banco de dados
    conectiondb().query(sql, function (erro, retorno) {
        res.render('usuario', { usuarios: retorno });
    });
};

//Função para abrir edição do usuario
function AlterarUsuario(req, res) {
    let sql = 'SELECT * FROM Pessoa_Usuario WHERE cd_usuario = ?';

    //Executando a consulta no banco de dados
    conectiondb().query(sql, [req.params.cd_usuario], function (erro, retorno) {
        if (erro) throw erro; 

        // Verifica se o usuário foi encontrado
       res.render('usuarioEditar', { usuario: retorno[0] }); 
    });
}

//Função para editar usuario
function editarUsuario(req, res) {
    // Obter dados do formulário
    const cd_usuario = req.body.codigo;
    const nm_pessoa_fisica = req.body.nome;
    const ds_email = req.body.email;
    const nr_telefone_celular = req.body.telefone;
    const nm_usuario = req.body.usuario;
    const ds_senha = req.body.senha;
    const ie_situacao = req.body.ie_situacao;

    if (!cd_usuario) {
        return res.status(400).send('ID do usuário é obrigatório.');
    }

    // Atualizar a tabela Pessoa_Fisica
    const sqlPessoaFisica = `
        UPDATE pessoa_fisica
        SET nm_pessoa_fisica = ?, ds_email = ?, nr_telefone_celular = ? 
        WHERE cd_pessoa_fisica = (
            SELECT cd_pessoa_fisica FROM usuario WHERE cd_usuario = ?
        )
    `;

    conectiondb().query(sqlPessoaFisica, [nm_pessoa_fisica, ds_email, nr_telefone_celular, cd_usuario], function (erroPessoaFisica) {
        if (erroPessoaFisica) {
            console.error('Erro ao atualizar Pessoa_Fisica:', erroPessoaFisica);
            return res.status(500).send('Erro ao atualizar Pessoa_Fisica.');
        }

        // Atualizar a tabela Usuario
        const sqlUsuario = `
            UPDATE usuario 
            SET nm_usuario = ?, ds_senha = ?, ie_situacao = ? 
            WHERE cd_usuario = ?
        `;

        conectiondb().query(sqlUsuario, [nm_usuario, ds_senha, ie_situacao, cd_usuario], function (erroUsuario) {
            if (erroUsuario) {
                console.error('Erro ao atualizar Usuario:', erroUsuario);
                return res.status(500).send('Erro ao atualizar Usuario.');
            }

            console.log('Usuário ',nm_usuario,' atualizado com sucesso!');
            res.redirect('/usuario');
        });
    });
}

//rota inativar usuario
function inativarUsuario(req, res) {
    let sql = 'UPDATE Pessoa_Usuario SET ie_situacao = ? WHERE cd_usuario = ? AND cd_pessoa_fisica IS NOT NULL';

    // Executando a consulta no banco de dados
    conectiondb().query(sql, ['i', req.params.cd_usuario, req.params.nm_usuario], function (erro, retorno) {
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
    editarUsuario,
    inativarUsuario
}