const conectiondb = require('../bd/conexao_mysql.js');

// FUNÇÃO: Registrar entrada de material no estoque
function exibirestoqueEntrada(req, res) {
    const conexao = conectiondb();

    // Exibe a página caso seja GET
    if (req.method === 'GET') {
        return res.render('estoqueEntrada', { message: '' });
    }

    // Recebe dados do formulário
    const {
        descricao_material,
        linha_material,
        quantidade,
        data_entrada
    } = req.body;

    // Validação: todos os campos obrigatórios
    if (!descricao_material || !linha_material || !quantidade || !data_entrada) {
        return res.render('estoqueEntrada', { message: 'Por favor, preencha todos os campos!' });
    }

    // Query de inserção
    const query = `
        INSERT INTO estoque (descricao_material, linha_material, quantidade, data_entrada, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    const valores = [
        descricao_material,
        linha_material,
        quantidade,
        data_entrada,
        'Em Estoque' // status padrão ao inserir
    ];

    // Executa a inserção
    conexao.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao registrar entrada:', err);
            return res.render('estoqueEntrada', { message: 'Erro ao registrar entrada de material.' });
        }

        console.log('Entrada registrada com sucesso!');
        return res.render('estoqueEntrada', { message: 'Entrada registrada com sucesso!' });
    });
}

// Exportando a função com o novo nome
module.exports = {
    exibirestoqueEntrada
};
