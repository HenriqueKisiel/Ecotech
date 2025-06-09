const conectiondb = require('../bd/conexao_mysql.js');

//Função para página motorista
function exibirMotorista(req, res) {
    const connection = conectiondb();
    const query = `SELECT pf.cd_pessoa_fisica, pf.nm_pessoa_fisica
        FROM pessoa_fisica pf
        WHERE pf.ie_situacao = 'A'
        AND NOT EXISTS (
            SELECT 1 
            FROM motorista m 
            WHERE m.ie_pessoa = pf.cd_pessoa_fisica

        )`;

    connection.query(query, (erro, pessoasFisicas) => {
        if (erro) {
            console.log('Erro ao buscar pessoas físicas:', erro);
            return res.status(500).send('Erro no servidor');
        }
        res.render('motorista', { pessoasFisicas });
    });
}

// Função para inserir motorista
function inserirMotorista(req, res) {
    const connection = conectiondb();
    console.log(req.body)
    const { cd_pessoa_fisica, nrCnh, categoria_cnh, dataVenc } = req.body;

    // Situação padrão: Ativo
    const situacao = 'A';

    const query = `
        INSERT INTO motorista (ie_pessoa, cnh, categoria_cnh, vencimento_cnh, situacao)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
        query,
        [cd_pessoa_fisica, nrCnh, categoria_cnh, dataVenc, situacao],
        (erro, resultado) => {
            if (erro) {
                console.log('Erro ao inserir motorista:', erro);
                // Recarrega a tela com mensagem de erro
                return res.render('motorista', {
                    pessoasFisicas: [],
                    mensagem: '<div class="alert alert-danger">Erro ao cadastrar motorista!</div>'
                });
            }
            // Sucesso: recarrega a tela com mensagem de sucesso
            // (Opcional: pode buscar novamente pessoasFisicas para o select)
            const queryPessoas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
            connection.query(queryPessoas, (erro2, pessoasFisicas) => {
                res.render('motorista', {
                    pessoasFisicas: pessoasFisicas || [],
                    mensagem: '<div class="alert alert-success">Motorista cadastrado com sucesso!</div>'
                });
            });
        }
    );
}

//exportando a função 
module.exports = {
    exibirMotorista,
    inserirMotorista
}