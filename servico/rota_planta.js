const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir e cadastrar planta
function exibirPlanta(req, res) {
    // Cria a conexão com o banco de dados
    const conexao = conectiondb();

    // Verifica o método HTTP da requisição (GET ou POST)
    if (req.method === 'GET') {
        // Se for GET, renderiza a página 'planta' com uma mensagem vazia
        return res.render('planta', { message: '' });
    }

    // Extrai os dados enviados no corpo da requisição (do formulário)
    const {
        nome_planta,
        area_total,
        capacidade_total,
        capacidade_atual,
        endereco,
        cep,
        cidade,
        bairro
    } = req.body;

    // Valida se todos os campos obrigatórios foram preenchidos
    if (!nome_planta || !area_total || !capacidade_total || !capacidade_atual || !endereco || !cep || !cidade || !bairro) {
        // Se algum campo não for preenchido, exibe uma mensagem de erro pedindo para preencher todos os campos
        return res.render('planta', { message: 'Por favor, preencha todos os campos!' });
    }

    // Define a consulta SQL para inserir os dados na tabela 'plantas'
    const query = `
        INSERT INTO plantas (nome_planta, area_total, capacidade_total, capacidade_atual, endereco, cep, cidade, bairro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Organiza os valores que serão inseridos na consulta SQL
    const valores = [
        nome_planta,
        area_total,
        capacidade_total,
        capacidade_atual,
        endereco,
        cep,
        cidade,
        bairro
    ];

    // Executa a consulta no banco de dados
    conexao.query(query, valores, (err, result) => {
        if (err) {
            // Se ocorrer um erro durante a execução da consulta, exibe uma mensagem de erro
            console.error('Erro ao cadastrar planta:', err);
            return res.render('planta', { message: 'Erro ao cadastrar a planta de reciclagem.' });
        }

        // Se o cadastro for realizado com sucesso, exibe uma mensagem de sucesso
        console.log('Planta cadastrada com sucesso!');
        return res.render('planta', { message: 'Planta cadastrada com sucesso!' });
    });
}

// Exporta a função para ser utilizada em outros arquivos
module.exports = {
    exibirPlanta
};
