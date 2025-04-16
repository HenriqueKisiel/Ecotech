const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a tela de agendamento
function exibirAgendamento(req, res) {
    // Renderiza a página de agendamento com uma mensagem vazia (inicialmente)
    res.status(200).render('agendamento', { message: '' }); // Garante que 'message' exista no primeiro acesso
}

// Função para registrar o agendamento no banco de dados
function registrarAgendamento(req, res) {
    console.log('Função registrarAgendamento chamada');
    console.log(req.body);
    // Extrai os dados enviados no corpo da requisição
    const {
        linha_material,
        codigo_material,
        cidade,
        descricao_material,
        valor_kg,
        peso,
        bairro,
        cep,
        endereco
    } = req.body;


    // Cria a conexão com o banco de dados
    const conexao = conectiondb();

    // Define a consulta SQL de inserção dos dados na tabela 'agendamentos'
    const query = `
    INSERT INTO agendamento 
    (dt_solicitada, cd_pessoa_fisica, cd_pessoa_juridica, ds_endereco, cd_bairro, cd_cidade, nr_cep, cd_material, qt_quantidade_prevista_kg, vlr_previsto_reais)
    VALUES (CURDATE(), NULL, NULL, ?, ?, ?, ?, ?, ?, ?)
`;

    // Organiza os valores que serão inseridos na consulta (corrige a ordem)
    const valores = [
        endereco,          // ds_endereco
        bairro,            // cd_bairro
        cidade,            // cd_cidade
        cep,               // nr_cep
        codigo_material,   // cd_material
        peso,              // qt_quantidade_prevista_kg
        valor_kg           // vlr_previsto_reais
    ];

    console.log('Consultando SQL:', query, valores); 

    // Executa a consulta no banco de dados
    conexao.query(query, valores, (err, result) => {
        if (err) {
            // Se ocorrer um erro durante a execução da consulta, exibe mensagem de erro
            console.error('Erro ao registrar agendamento:', err);
            return res.status(500).render('agendamento', { message: 'Erro ao registrar agendamento!' });
        }

        // Se o agendamento for registrado com sucesso, exibe mensagem de sucesso
        console.log('Agendamento registrado com sucesso!');
        return res.status(200).render('agendamento', { message: 'Agendamento realizado com sucesso!' });
    });
}

// Exporta as funções para que possam ser utilizadas em outros arquivos
module.exports = {
    exibirAgendamento,
    registrarAgendamento, 
};
