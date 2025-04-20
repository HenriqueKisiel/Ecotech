const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a página de cadastro
function exibirPessoa(req, res) {
    res.render('pessoa');
}

// Função para cadastrar pessoa física
function insertPessoa(req, res) {
    const {
        nomeFisico,
        dataNasc,
        sexo,
        cpf,
        telefone,
        email,
        endereco,
        bairro, // futuramente excluir a tabela e fazer tipo
        cidade, // já é o ID
        cep
    } = req.body;

    const sql = `
        INSERT INTO pessoa_fisica 
        (nm_pessoa_fisica, dt_nascimento, ie_sexo, nr_cpf, nr_telefone_celular, ds_email, ds_endereco, cd_bairro, cd_cidade, nr_cep, dt_atualizacao) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
        nomeFisico,
        dataNasc,
        sexo,
        cpf,
        telefone,
        email,
        endereco,
        bairro,
        cidade,
        cep
    ];

    conectiondb().query(sql, values, (error, results) => {
        if (error) {
            console.error('Erro ao cadastrar pessoa:', error);
            res.render('pessoa', {
                script: ` <script>
          swal("Erro ao cadastrar!", "Verifique os dados e tente novamente.", {
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
        } else {
            res.render('pessoa', {
                script: `  <script>
          swal({
            title: "Cadastro realizado!",
            text: "Pessoa cadastrada com sucesso!",
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
        }
    });
}



// Exportando as funções
module.exports = {
    exibirPessoa,
    insertPessoa
};
