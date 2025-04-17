const db = require('../bd/conexao_mysql.js')();

// Função para exibir a página de cadastro da planta
function exibirPlanta(req, res) {
    res.render('planta', {
        title: 'Cadastro de Planta de Reciclagem'
    });
}

// Função para validar campos obrigatórios
function validarCampos(req, res) {
    const { nm_planta, qt_area_total_m2, qt_capacidade_total_kg, ds_endereco, cd_bairro, cd_cidade, nr_cep } = req.body;

    // Verificar se todos os campos obrigatórios estão preenchidos
    if (!nm_planta || !qt_area_total_m2 || !ds_endereco || !cd_bairro || !cd_cidade || !nr_cep) {
        return res.status(400).send("Todos os campos obrigatórios devem ser preenchidos.");
    }

    // Validar se as quantidades são números válidos e positivos
    if (isNaN(qt_area_total_m2) || qt_area_total_m2 <= 0) {
        return res.status(400).send("A área total deve ser um número positivo.");
    }

    if (qt_capacidade_total_kg && (isNaN(qt_capacidade_total_kg) || qt_capacidade_total_kg <= 0)) {
        return res.status(400).send("A capacidade total deve ser um número positivo.");
    }

    return true;
}

// Função para cadastrar uma nova planta no banco de dados
function cadastrarPlanta(req, res) {
    const { nm_planta, qt_area_total_m2, qt_capacidade_total_kg, qt_capacidade_atual_kg, ds_endereco, cd_bairro, cd_cidade, nr_cep } = req.body;

    // Validação dos campos obrigatórios e dados
    if (validarCampos(req, res) !== true) return;

    const sql = `
        INSERT INTO planta (
            nm_planta,
            qt_area_total_m2,
            qt_capacidade_total_kg,
            qt_capacidade_atual_kg,
            ds_endereco,
            cd_bairro,
            cd_cidade,
            nr_cep
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nm_planta,
        qt_area_total_m2,
        qt_capacidade_total_kg || null,
        qt_capacidade_atual_kg || null,
        ds_endereco,
        cd_bairro,
        cd_cidade,
        nr_cep
    ];

    db.query(sql, valores, function (err, result) {
        if (err) {
            console.error('Erro ao cadastrar planta:', err);
            return res.status(500).send('Erro ao cadastrar planta.');
        }

        console.log('Planta cadastrada com sucesso!');

        // Mostrar os dados cadastrados no console
        console.log('Dados cadastrados:', {
            nm_planta,
            qt_area_total_m2,
            qt_capacidade_total_kg,
            qt_capacidade_atual_kg,
            ds_endereco,
            cd_bairro,
            cd_cidade,
            nr_cep
        });

        res.redirect('/planta');
    });
}

// Exportando as funções para uso nas rotas
module.exports = {
    exibirPlanta: exibirPlanta,
    cadastrarPlanta: cadastrarPlanta
};
