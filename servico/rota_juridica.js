const conectiondb = require('../bd/conexao_mysql.js');

// Página do formulário de pessoa jurídica
function exibirFornecedor(req, res) {
    res.render('juridica');
}

// Inserção da pessoa jurídica no banco
function insertPessoaJuridica(req, res) {
    const {
        razaoSocial,
        cnpj,
        email,
        telefone,
        endereco,
        bairro,
        cidade,
        cep
    } = req.body;

    const sql = `
        INSERT INTO pessoa_juridica
        (nm_razao_social, nr_cnpj, ds_email, nr_telefone, ds_endereco, cd_bairro, cd_cidade, nr_cep, dt_atualizacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const valores = [
        razaoSocial,
        cnpj,
        email || null,
        telefone || null,
        endereco || null,
        bairro || null,
        cidade || null,
        cep || null
    ];

    conectiondb().query(sql, valores, (error, results) => {
        if (error) {
            console.error('Erro ao cadastrar pessoa jurídica:', error);
            res.render('juridica', {
                script: ` 
                    <script>
                      swal("Erro ao cadastrar!", "Verifique os dados e tente novamente.", {
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
        } else {
            res.render('juridica', {
                script: `  
                    <script>
                      swal({
                        title: "Cadastro realizado!",
                        text: "Pessoa jurídica cadastrada com sucesso!",
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
        }
    });
}

// Exporta as funções
module.exports = {
    exibirFornecedor,
    insertPessoaJuridica
};
