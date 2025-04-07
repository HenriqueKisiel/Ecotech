const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir e cadastrar material
function exibirMaterial(req, res) {
    const conexao = conectiondb();

    if (req.method === 'GET') {
        return res.render('material', { message: '' });
    }

    // Dados do formulário
    const {
        codigo_material,
        descricao_material,
        valor_kg,
        peso
    } = req.body;

    // Validação básica
    if (!codigo_material || !descricao_material || !valor_kg || !peso) {
        return res.render('material', { message: 'Por favor, preencha todos os campos!' });
    }

    const query = `
        INSERT INTO materiais (codigo_material, descricao_material, valor_kg, peso)
        VALUES (?, ?, ?, ?)
    `;

    const valores = [codigo_material, descricao_material, valor_kg, peso];

    conexao.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar material:', err);
            return res.render('material', { message: 'Erro ao cadastrar o material.' });
        }

        console.log('Material cadastrado com sucesso!');
        return res.render('material', { message: 'Material cadastrado com sucesso!' });
    });
}

// Exportando função
module.exports = {
    exibirMaterial
};