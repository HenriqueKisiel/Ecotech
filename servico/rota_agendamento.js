const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a tela de agendamento
function exibirAgendamento(req, res) {
    res.render('agendamento', { message: '' }); // Garante que 'message' exista no primeiro acesso
}

// Função para registrar o agendamento no banco de dados
function registrarAgendamento(req, res) {
    const {
        linha_material,
        codigo_material,
        descricao_material,
        valor_kg,
        peso,
        cep,
        endereco,
        cidade,
        bairro
    } = req.body;

    // Verifica se todos os campos obrigatórios foram preenchidos
    if (
        !linha_material || !codigo_material || !descricao_material || !valor_kg || !peso ||
        !cep || !endereco || !cidade || !bairro
    ) {
        return res.render('agendamento', { message: 'Por favor, preencha todos os campos!' });
    }

    const conexao = conectiondb();

    const query = 
        `INSERT INTO agendamentos 
        (linha_material, codigo_material, descricao_material, valor_kg, peso, cep, endereco, cidade, bairro) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ;

    const valores = [
        linha_material,
        codigo_material,
        descricao_material,
        valor_kg,
        peso,
        cep,
        endereco,
        cidade,
        bairro
    ];

    conexao.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao registrar agendamento:', err);
            return res.render('agendamento', { message: 'Erro ao registrar agendamento!' });
        }

        console.log('Agendamento registrado com sucesso!');
        return res.render('agendamento', { message: 'Agendamento realizado com sucesso!' });
    });
}

// Exporta as funções
module.exports = {
    exibirAgendamento,
    registrarAgendamento
};