const conectiondb = require('../bd/conexao_mysql.js');

//Função para abrir edição de pessoa
function exibirPessoaEditar(req, res) {
    let sql = 'SELECT * FROM pessoa_fisica WHERE cd_pessoa_fisica = ?';

    //Executando a consulta no banco de dados
    conectiondb().query(sql, [req.params.cd_pessoa_fisica], function (erro, retorno) {
        if (erro) throw erro;

        // Verifica se a pessoa foi encontrada
        res.render('pessoaEditar', { pessoa_fisica: retorno[0] });
    });
}

function editarPessoa(req, res) {
    // Obter dados do formulário
    const cd_pessoa_fisica = req.body.codigo;
    const nm_pessoa_fisica = req.body.nomeFisico;
    const ds_email = req.body.email;
    const nr_cpf = req.body.cpf;
    const nr_telefone_celular = req.body.telefone;
    const ds_endereco = req.body.endereco;
    const nr_cep = req.body.cep;
    const dt_nascimento = req.body.dataNasc;
    const ie_sexo = req.body.sexo;
    const cd_cidade = req.body.cidade;
    const cd_bairro = req.body.bairro;
    const ie_situacao = req.body.ie_situacao ? 'A' : 'I'; // Checkbox vira valor

    if (!cd_pessoa_fisica) {
        return res.status(400).send('ID da pessoa é obrigatório.');
    }

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
        nm_pessoa_fisica,
        ds_email,
        nr_cpf,
        nr_telefone_celular,
        ds_endereco,
        nr_cep,
        dt_nascimento,
        ie_sexo,
        cd_cidade,
        cd_bairro,
        ie_situacao,
        cd_pessoa_fisica
    ];

    conectiondb().query(sql, valores, function (erro) {
        if (erro) {
            console.error('Erro ao atualizar pessoa:', erro);
            return res.render('pessoaEditar', {
                pessoa: {
                    cd_pessoa_fisica,
                    nm_pessoa_fisica,
                    ds_email,
                    nr_cpf,
                    nr_telefone_celular,
                    ds_endereco,
                    nr_cep,
                    dt_nascimento,
                    ie_sexo,
                    cd_cidade,
                    cd_bairro,
                    ie_situacao
                },
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
        return res.render('pessoaEditar', {
            pessoa: {
                cd_pessoa_fisica,
                nm_pessoa_fisica,
                ds_email,
                nr_cpf,
                nr_telefone_celular,
                ds_endereco,
                nr_cep,
                dt_nascimento,
                ie_sexo,
                cd_cidade,
                cd_bairro,
                ie_situacao
            },
            script: `
                <script>
                    swal({
                        title: "Edição realizada!",
                        text: "Pessoa '${nm_pessoa_fisica}' atualizada com sucesso!",
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
    editarPessoa
}

