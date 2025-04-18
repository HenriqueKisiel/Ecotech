const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a página de cadastro
function exibirPessoa(req, res) {
    res.render('pessoa');
}

// Função para cadastrar pessoa física
function Insert(req, res) {
    const {
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

    conectiondb.query(sql, values, (error, results) => {
        if (error) {
            console.error('Erro ao cadastrar pessoa:', error);
            res.render('pessoa', {
                script: `<script>alert('Erro ao cadastrar. Verifique os dados e tente novamente.');</script>`
            });
        } else {
            res.render('pessoa', {
                script: `<script>alert('Pessoa cadastrada com sucesso!');</script>`
            });
        }
    });
}

module.exports = {
    exibirPessoa,
    Insert
};
