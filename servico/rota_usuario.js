const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina usuario
function exibirUsuario(req, res) {
    
    let sql = 'SELECT cd_usuario, nm_usuario, nm_pessoa_fisica, ds_email, Obter_Situacao(ie_situacao) as ie_situacao  FROM Pessoa_Usuario';

    //Executando a consulta no banco de dados
    conectiondb().query(sql, function (erro, retorno) {
        res.render('usuario', { usuarios: retorno });
    });
};

//rota para buscar pessoas
function buscarPessoa(req, res) {
    const sql = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar pessoas:', erro);
            return res.status(500).send('Erro ao buscar pessoas.');
        }
        res.json(resultados); // Retorna os nomes como JSON
    });
}

//rota para buscar detalhes da pessoa
function buscarDetalhesPessoa(req, res) {
    const sql = 'SELECT ds_email, nr_telefone_celular FROM pessoa_fisica WHERE cd_pessoa_fisica = ?';
    conectiondb().query(sql, [req.params.id], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar detalhes da pessoa:', erro);
            return res.status(500).send('Erro ao buscar detalhes da pessoa.');
        }
        res.json(resultados[0]); // Retorna os detalhes como JSON
    });
}

//Função para adicionar usuario
function adicionarUsuario(req, res) {
    res.render('usuarioAdicionar', { usuario: {} });
}

//função para cadastrar usuario
function cadastrarUsuario(req, res) {
    const { nome, email, telefone, usuario, senha, ie_situacao } = req.body;

    const sql = `
        INSERT INTO usuario (cd_pessoa_fisica, nm_usuario, ds_senha, ie_situacao)
        VALUES (?, ?, ?, ?)
    `;

    conectiondb().query(sql, [nome, usuario, senha, ie_situacao], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao adicionar usuário:', erro);
            return res.render('usuarioAdicionar', {
                usuario: req.body,
                script: `<script>
                  swal("Erro ao adicionar!", "Não foi possível adicionar o usuário. Tente novamente.", {
                    icon: "error",
                    buttons: {
                      confirm: {
                        text: "OK",
                        className: "btn btn-danger",
                      },
                    },
                  });
                </script>`
            });
        }

        console.log('Usuário adicionado com sucesso!');
        return res.render('usuarioAdicionar', {
            script: `<script>
              swal("Usuário Adicionado!", "O usuário foi adicionado com sucesso!", {
                icon: "success",
                buttons: {
                  confirm: {
                    text: "OK",
                    className: "btn btn-success",
                  },
                },
              });
            </script>`
        });
    });
}

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
            return res.render('usuarioEditar', {
                usuario: {
                    nm_pessoa_fisica,
                    ds_email,
                    nr_telefone_celular,
                    nm_usuario,
                    ds_senha,
                    ie_situacao
                },
                script: ` <script>
          swal("Erro ao editar!", "Verifique os dados e tente novamente.", {
            icon: "error",
            buttons: {
              confirm: {
                text: "OK",
                className: "btn btn-danger",
              },
            },
          });
        </script>`
            });
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
                return res.render('usuarioEditar', {
                    usuario: {
                        nm_pessoa_fisica,
                        ds_email,
                        nr_telefone_celular,
                        nm_usuario,
                        ds_senha,
                        ie_situacao
                    },
                    script: ` <script>
              swal("Erro ao editar!", "Verifique os dados e tente novamente.", {
                icon: "error",
                buttons: {
                  confirm: {
                    text: "OK",
                    className: "btn btn-danger",
                  },
                },
              });
            </script>`
                });
            }

            console.log('Usuário atualizado com sucesso!');
            return res.render('usuarioEditar', {
                usuario: {
                    nm_pessoa_fisica,
                    ds_email,
                    nr_telefone_celular,
                    nm_usuario,     
                    ds_senha,
                    ie_situacao
                },
                script: `  <script>
              swal({
                title: "Realizado Edição!",
                text: "Usuário '${nm_usuario}' editado com sucesso!",
                icon: "success",
                buttons: {
                  confirm: {
                    text: "OK",
                    value: true,
                    visible: true,
                    className: "btn btn-success",
                    closeModal: true,
                  },
                },
              });
            </script>`
            });
        });
    });
}

//rota inativar usuario
function inativarUsuario(req, res) {
    let sql = 'UPDATE Pessoa_Usuario SET ie_situacao = ? WHERE cd_usuario = ? AND cd_pessoa_fisica IS NOT NULL';

    // Executando a consulta no banco de dados para inativar o usuário
    conectiondb().query(sql, ['i', req.params.cd_usuario], function (erro, retorno) {
        if (erro) {
            console.error('Erro ao inativar usuário:', erro);
            return res.render('usuario', {
                usuarios: [],
                script: ` <script>
              swal("Erro ao inativar!", "Não foi possível inativar o usuário. Tente novamente.", {
                icon: "error",
                buttons: {
                  confirm: {
                    text: "OK",
                    className: "btn btn-danger",
                  },
                },
              });
            </script>`
            });
        }

        // Verifica se o usuário foi inativado com sucesso
        if (retorno.affectedRows > 0) {
            console.log('Usuário inativado com sucesso!');

            // Buscar os usuários atualizados para exibir na view 'usuario'
            const sqlUsuarios = `
                SELECT cd_usuario, nm_usuario, nm_pessoa_fisica, ds_email, Obter_Situacao(ie_situacao) as ie_situacao 
                FROM Pessoa_Usuario
            `;

            conectiondb().query(sqlUsuarios, function (erroUsuarios, usuarios) {
                if (erroUsuarios) {
                    console.error('Erro ao carregar usuários:', erroUsuarios);
                    return res.status(500).send('Erro ao carregar usuários.');
                }

                // Renderizar a view 'usuario' com os dados atualizados
                return res.render('usuario', {
                    usuarios: usuarios,
                    script: ` <script>
                  swal({
                    title: "Usuário Inativado!",
                    text: "O usuário foi inativado com sucesso!",
                    icon: "success",
                    buttons: {
                      confirm: {
                        text: "OK",
                        value: true,
                        visible: true,
                        className: "btn btn-success",
                        closeModal: true,
                      },
                    },
                  });
                </script>`
                });
            });
        } else {
            console.log('Usuário não encontrado!');
            return res.render('usuario', {
                usuarios: [],
                script: ` <script>
              swal("Usuário não encontrado!", "O usuário não foi encontrado no sistema.", {
                icon: "warning",
                buttons: {
                  confirm: {
                    text: "OK",
                    className: "btn btn-warning",
                  },
                },
              });
            </script>`
            });
        }
    });
}

//exportando a função 
module.exports = {
    exibirUsuario,
    buscarPessoa,
    buscarDetalhesPessoa,
    adicionarUsuario,
    cadastrarUsuario,
    AlterarUsuario,
    editarUsuario,
    inativarUsuario
}