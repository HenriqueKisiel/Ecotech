const conectiondb = require('../bd/conexao_mysql.js');

// FUNÇÃO: Exibir página de cadastro de novo estoque (GET)
//         E inserir novo estoque no banco (POST)
function exibirestoqueNovo(req, res) {
    const conexao = conectiondb();

    // Se for método GET, apenas exibe a página de cadastro
    if (req.method === 'GET') {
        return res.render('estoqueNovo', { message: '' }); // nome da view atualizado
    }

    // Dados recebidos via POST do formulário
    const {
        codigo_planta,
        capacidade_estoque,
        linha_estoque
    } = req.body;

    // Validação: todos os campos são obrigatórios
    if (!codigo_planta || !capacidade_estoque || !linha_estoque) {
        return res.render('estoqueNovo', { message: 'Por favor, preencha todos os campos!' });
    }

    // Query SQL para inserção no banco
    const query = `
        INSERT INTO estoques (codigo_planta, capacidade_estoque, linha_estoque)
        VALUES (?, ?, ?)
    `;

    const valores = [codigo_planta, capacidade_estoque, linha_estoque];

    // Executa a inserção
    conexao.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar estoque:', err);
            return res.render('estoqueNovo', { message: 'Erro ao cadastrar o estoque.' });
        }

        console.log('Estoque cadastrado com sucesso!');
        return res.render('estoqueNovo', { message: 'Estoque cadastrado com sucesso!' });
    });
}

module.exports = {
    exibirestoqueNovo
};
