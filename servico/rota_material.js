// Importa a conexão com o banco de dados
const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a página de cadastro de material
function exibirMaterial(req, res) {
    res.render('material'); // Renderiza a view "material.hbs"
}

// Função para cadastrar o material no banco de dados
function cadastrarMaterial(req, res) {
    const { descricao, valor_kg, peso, linha } = req.body;

    // Verifica se todos os campos obrigatórios foram preenchidos
    if (!descricao || !valor_kg || !peso || !linha) {
        return res.status(400).send('Preencha todos os campos obrigatórios!');
    }

    const conexao = conectiondb();

    const query = `
    INSERT INTO materiais (ds_material, vl_valor_por_kg, qt_peso_kg, ie_linha)
    VALUES (?, ?, ?, ?)
    `;

    conexao.query(query, [descricao, valor_kg, peso, linha], (err, resultado) => {
        if (err) {
            console.error('Erro ao cadastrar material:', err);
            return res.status(500).send('Erro no servidor ao cadastrar o material.');
        }

        // Log para confirmar o sucesso e mostrar os dados
        console.log('Material cadastrado com sucesso!');
        console.log('Dados registrados:', {
            descricao,
            valor_kg,
            peso,
            linha
        });

        // Redireciona para a página de cadastro de material
        res.redirect('/material');
    });
}

module.exports = {
    exibirMaterial,
    cadastrarMaterial
};
