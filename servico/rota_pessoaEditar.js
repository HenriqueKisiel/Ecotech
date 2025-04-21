const conectiondb = require('../bd/conexao_mysql.js');

// Função para abrir a página de edição de pessoa
function exibirPessoaEditar(req, res) {
    let sql = 'SELECT * FROM pessoa_fisica WHERE cd_pessoa_fisica = ?';

    // Executando a consulta no banco de dados
    conectiondb().query(sql, [req.params.cd_pessoa_fisica], function (erro, retorno) {
        if (erro) throw erro;

        // Verifica se a pessoa foi encontrada
        if (retorno.length === 0) {
            return res.status(404).send('Pessoa não encontrada.');
        }

        res.render('pessoaEditar', { pessoa_fisica: retorno[0] });
    });
}

function editarPessoa(req, res) {
    const {
        codigo,
        nomeFisico,
        email,
        cpf,
        telefone,
        endereco,
        cep,
        dataNasc,
        sexo,
        cidade,
        bairro,
        ie_situacao
    } = req.body;

    // Verificação de ID (importante!)
    if (!codigo || codigo.trim() === '') {
        console.error('Código da pessoa ausente ou inválido.');
        return res.render('pessoaEditar', {
            pessoa_fisica: req.body,
            script: `
                <script>
                    swal("Erro ao editar!", "ID da pessoa não foi informado. Tente novamente.", {
                        icon: "error",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-danger",
                            },
                        },
                    });
                </script>
            `
        });
    }

    const situacao = ie_situacao ? 'A' : 'I';

    const sql = `
        UPDATE pessoa_fisica 
        SET 
            nm_pessoa_fisica = ?, 
            ds_email = ?, 
            nr_cpf = ?, 
            nr_telefone_celular = ?, 
            ds_endereco = ?, 
            nr_cep = ?, 
            dt_nascimento = ?, 
            ie_sexo = ?, 
            cd_cidade = ?, 
            cd_bairro = ?, 
            ie_situacao = ?
        WHERE cd_pessoa_fisica = ?
    `;

    const valores = [
        nomeFisico,
        email,
        cpf,
        telefone,
        endereco,
        cep,
        dataNasc,
        sexo,
        cidade,
        bairro,
        situacao,
        codigo
    ];

    // Log para depuração
    console.log('Tentando atualizar com os valores:', valores);

    conectiondb().query(sql, valores, function (erro) {
        if (erro) {
            console.error('Erro ao atualizar pessoa:', erro.sqlMessage);
            return res.render('pessoaEditar', {
                pessoa_fisica: req.body,
                script: `
                    <script>
                        swal("Erro ao editar!", "Verifique os dados e tente novamente.", {
                            icon: "error",
                            buttons: {
                                confirm: {
                                    text: "OK",
                                    className: "btn btn-danger",
                                },
                            },
                        });
                    </script>
                `
            });
        }

        console.log('Pessoa atualizada com sucesso!');

        // Renderiza a mesma tela com alerta de sucesso
        res.render('pessoaEditar', {
            pessoa_fisica: {
                cd_pessoa_fisica: codigo,
                nm_pessoa_fisica: nomeFisico,
                ds_email: email,
                nr_cpf: cpf,
                nr_telefone_celular: telefone,
                ds_endereco: endereco,
                nr_cep: cep,
                dt_nascimento: dataNasc,
                ie_sexo: sexo,
                cd_cidade: cidade,
                cd_bairro: bairro,
                ie_situacao: situacao
            },
            script: `
                <script>
                    swal({
                        title: "Alteração realizada!",
                        text: "Pessoa alterada com sucesso!",
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
                </script>
            `
        });
    });
}



module.exports = {
    exibirPessoaEditar,
    editarPessoa
};
