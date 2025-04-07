const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir e cadastrar planta
function exibirPlanta(req, res) {
    const conexao = conectiondb();

    if (req.method === 'GET') {
        return res.render('planta', { message: '' });
    }

    // Dados vindos do formulário
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

    // Validação dos campos obrigatórios
    if (!nome_planta || !area_total || !capacidade_total || !capacidade_atual || !endereco || !cep || !cidade || !bairro) {
        return res.render('planta', { message: 'Por favor, preencha todos os campos!' });
    }

    // Inserção no banco de dados (sem código da planta, pois o BD vai gerar automaticamente)
    const query = `
        INSERT INTO plantas (nome_planta, area_total, capacidade_total, capacidade_atual, endereco, cep, cidade, bairro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

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

    conexao.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar planta:', err);
            return res.render('planta', { message: 'Erro ao cadastrar a planta de reciclagem.' });
        }

        console.log('Planta cadastrada com sucesso!');
        return res.render('planta', { message: 'Planta cadastrada com sucesso!' });
    });
}

// Exportando a função
module.exports = {
    exibirPlanta
};