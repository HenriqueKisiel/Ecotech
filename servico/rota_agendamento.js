const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a tela de agendamento
function exibirAgendamento(req, res) {
    // Renderiza a página de agendamento com uma mensagem vazia (inicialmente)
    res.render('agendamento', { message: '' }); // Garante que 'message' exista no primeiro acesso
}

// Função para registrar o agendamento no banco de dados
function registrarAgendamento(req, res) {
    // Extrai os dados enviados no corpo da requisição
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
    // Caso algum campo não tenha sido preenchido, retorna uma mensagem de erro
    if (
        !linha_material || !codigo_material || !descricao_material || !valor_kg || !peso ||
        !cep || !endereco || !cidade || !bairro
    ) {
        // Se algum campo estiver faltando, exibe mensagem pedindo para preencher todos os campos
        return res.render('agendamento', { message: 'Por favor, preencha todos os campos!' });
    }

    // Cria a conexão com o banco de dados
    const conexao = conectiondb();

    // Define a consulta SQL de inserção dos dados na tabela 'agendamentos'
    const query = 
        `INSERT INTO agendamentos 
        (linha_material, codigo_material, descricao_material, valor_kg, peso, cep, endereco, cidade, bairro) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ;

    // Organiza os valores que serão inseridos na consulta
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

    // Executa a consulta no banco de dados
    conexao.query(query, valores, (err, result) => {
        if (err) {
            // Se ocorrer um erro durante a execução da consulta, exibe uma mensagem de erro
            console.error('Erro ao registrar agendamento:', err);
            return res.render('agendamento', { message: 'Erro ao registrar agendamento!' });
        }

        // Se o agendamento for registrado com sucesso, exibe uma mensagem de sucesso
        console.log('Agendamento registrado com sucesso!');
        return res.render('agendamento', { message: 'Agendamento realizado com sucesso!' });
    });
}

// Exporta as funções para que possam ser utilizadas em outros arquivos
module.exports = {
    exibirAgendamento,
    registrarAgendamento
};
