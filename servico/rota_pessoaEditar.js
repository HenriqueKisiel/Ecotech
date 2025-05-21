const conectiondb = require('../bd/conexao_mysql.js');

// Função para abrir a página de edição
function exibirPessoaEditar(req, res) {
    let sql = 'SELECT * FROM pessoa_fisica WHERE cd_pessoa_fisica = ?';

    conectiondb().query(sql, [req.params.cd_pessoa_fisica], function (erro, retorno) {
        if (erro) throw erro;

        if (retorno.length === 0) {
            return res.status(404).send('Pessoa não encontrada.');
        }

        //Isso garante que a data venha no formato que o campo <input type="date"> entende, que é YYYY-MM-DD.
        const pessoa = retorno[0];
        pessoa.dt_nascimento = formatarDataInput(pessoa.dt_nascimento);

        res.render('pessoaEditar', { pessoa_fisica: pessoa });
    });
}

//função para formatar a data e retornar da maneira correta no campo data de nascimento
function formatarDataInput(data) {
    const d = new Date(data);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// Função para atualizar os dados da pessoa
function editarPessoa(req, res) {
    const {
        codigo,
        nomeFisico,
        email,
        cpf,
        telefone,
        nr_endereco,
        ds_endereco,
        cep,
        dataNasc,
        sexo,
        nm_bairro,
        nm_cidade,
        uf_estado
    } = req.body;

    // Validação básica
    if (!codigo || codigo.trim() === '') {
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

    const sql = `
        UPDATE pessoa_fisica 
        SET 
            nm_pessoa_fisica = ?, 
            ds_email = ?, 
            nr_cpf = ?, 
            nr_telefone_celular = ?, 
            nr_endereco = ?, 
            ds_endereco = ?, 
            nr_cep = ?, 
            dt_nascimento = ?, 
            ie_sexo = ?, 
            nm_bairro = ?, 
            nm_cidade = ?, 
            uf_estado = ?,
            dt_atualizacao = NOW()
        WHERE cd_pessoa_fisica = ?
    `;

    const valores = [
        nomeFisico,
        email,
        cpf,
        telefone,
        nr_endereco,
        ds_endereco,
        cep,
        dataNasc,
        sexo,
        nm_bairro,
        nm_cidade,
        uf_estado,
        codigo
    ];

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

        // Sucesso
        res.render('pessoaEditar', {
            pessoa_fisica: {
                cd_pessoa_fisica: codigo,
                nm_pessoa_fisica: nomeFisico,
                ds_email: email,
                nr_cpf: cpf,
                nr_telefone_celular: telefone,
                nr_endereco,
                ds_endereco,
                nr_cep: cep,
                dt_nascimento: formatarDataInput(dataNasc),
                ie_sexo: sexo,
                nm_bairro,
                nm_cidade,
                uf_estado,
                dt_atualizacao: new Date().toISOString().slice(0, 19).replace('T', ' ')
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
                                className: "btn btn-success",
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
    editarPessoa,
};
