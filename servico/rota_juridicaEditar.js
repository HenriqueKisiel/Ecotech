const conectiondb = require('../bd/conexao_mysql.js');

// Função para abrir a página de edição de pessoa juridica
function exibirJuridicaEditar(req, res) {
    let sql = 'SELECT * FROM pessoa_juridica WHERE cd_pessoa_juridica = ?';

    // Executando a consulta no banco de dados
    conectiondb().query(sql, [req.params.cd_pessoa_juridica], function (erro, retorno) {
        if (erro) throw erro;

        // Verifica se a pessoa foi encontrada
        if (retorno.length === 0) {
            return res.status(404).send('Não encontrada.');
        }

        res.render('juridicaEditar', { pessoa_juridica: retorno[0] });
    });
}

function editarJuridica(req, res) {
    const {
        codigo,
        nomeFantasia,
        razaoSocial,
        email,
        cnpj,
        telefone,
        endereco,
        cep,
        cidade,
        bairro,
    } = req.body;

    // Verificação de ID (importante!)
    if (!codigo || codigo.trim() === '') {
        console.error('Código da pessoa juridica ausente ou inválido.');
        return res.render('juridicaEditar', {
            pessoa_juridica: req.body,
            script: `
                <script>
                    swal("Erro ao editar!", "ID da pessoa juridica não foi informado. Tente novamente.", {
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
        UPDATE pessoa_juridica 
        SET 
            nm_fantasia = ?, 
            nm_razao_social = ?,
            ds_email = ?, 
            nr_cnpj = ?, 
            nr_telefone = ?, 
            ds_endereco = ?, 
            nr_cep = ?,  
            cd_cidade = ?, 
            cd_bairro = ?
        WHERE cd_pessoa_juridica = ?
    `;

    const valores = [
        nomeFantasia,
        razaoSocial,
        email,
        cnpj,
        telefone,
        endereco,
        cep,
        cidade,
        bairro,
        codigo
    ];

    // Log para depuração
    console.log('Tentando atualizar com os valores:', valores);

    conectiondb().query(sql, valores, function (erro) {
        if (erro) {
            console.error('Erro ao atualizar pessoa jurídica:', erro.sqlMessage);
            return res.render('juridicaEditar', {
                pessoa_juridica: req.body,
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
        res.render('juridicaEditar', {
            pessoa_juridica: {
                cd_pessoa_juridica: codigo,
                nm_fantasia: nomeFantasia,
                nm_razao_social: razaoSocial,
                ds_email: email,
                nr_cnpj: cnpj,
                nr_telefone: telefone,
                ds_endereco: endereco,
                nr_cep: cep,
                cd_cidade: cidade,
                cd_bairro: bairro
            },
            script: `
                <script>
                    swal({
                        title: "Alteração realizada!",
                        text: "Pessoa jurídica alterada com sucesso!",
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
    exibirJuridicaEditar,
    editarJuridica
}