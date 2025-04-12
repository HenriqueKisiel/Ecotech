const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir e cadastrar material
function exibirMaterial(req, res) {
    // Cria a conexão com o banco de dados
    const conexao = conectiondb();

    // Verifica o método HTTP da requisição (GET ou POST)
    if (req.method === 'GET') {
        // Se for GET, renderiza a página 'material' com uma mensagem vazia
        return res.render('material', { message: '' });
    }

    // Extrai os dados enviados no corpo da requisição (do formulário)
    const {
        codigo_material,
        descricao_material,
        valor_kg,
        peso
    } = req.body;

    // Valida se todos os campos obrigatórios foram preenchidos
    if (!codigo_material || !descricao_material || !valor_kg || !peso) {
        // Se algum campo não for preenchido, exibe uma mensagem de erro pedindo para preencher todos os campos
        return res.render('material', { message: 'Por favor, preencha todos os campos!' });
    }

    // Define a consulta SQL para inserir os dados na tabela 'materiais'
    const query = `
        INSERT INTO materiais (codigo_material, descricao_material, valor_kg, peso)
        VALUES (?, ?, ?, ?)
    `;

    // Organiza os valores que serão inseridos na consulta SQL
    const valores = [codigo_material, descricao_material, valor_kg, peso];

    // Executa a consulta no banco de dados
    conexao.query(query, valores, (err, result) => {
        if (err) {
            // Se ocorrer um erro durante a execução da consulta, exibe uma mensagem de erro
            console.error('Erro ao cadastrar material:', err);
            return res.render('material', { message: 'Erro ao cadastrar o material.' });
        }

        // Se o cadastro for realizado com sucesso, exibe uma mensagem de sucesso
        console.log('Material cadastrado com sucesso!');
        return res.render('material', { message: 'Material cadastrado com sucesso!' });
    });
}

// Exporta a função para ser utilizada em outros arquivos
module.exports = {
    exibirMaterial
};
