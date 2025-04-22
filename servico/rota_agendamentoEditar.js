const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a tela de edição com os dados do agendamento
function exibirEditarAgendamento(req, res) {
    const idAgendamento = req.query.id_agendamento; // Pega o id do agendamento da query string
    console.log("id_agendamento capturado:", idAgendamento); // Adicionando log para depuração

    if (!idAgendamento) {
        return res.status(400).send('ID do agendamento não fornecido');
    }

    // Conexão com o banco
    const connection = conectiondb();

    // Consulta para buscar o agendamento pelo ID, com JOIN para pegar dados relacionados
    const query = `
        SELECT 
            agendamento.*, 
            pf.nm_pessoa_fisica, 
            pj.nm_fantasia AS nm_pessoa_juridica_fantasia, 
            pj.nm_razao_social AS nm_pessoa_juridica_razao_social, 
            c.nm_cidade, 
            b.nm_bairro 
        FROM agendamento
        LEFT JOIN pessoa_fisica pf ON agendamento.cd_pessoa_fisica = pf.cd_pessoa_fisica
        LEFT JOIN pessoa_juridica pj ON agendamento.cd_pessoa_juridica = pj.cd_pessoa_juridica
        LEFT JOIN cidade c ON agendamento.cd_cidade = c.cd_cidade
        LEFT JOIN bairro b ON agendamento.cd_bairro = b.cd_bairro
        WHERE agendamento.cd_agendamento = ?
    `;
    
    connection.query(query, [idAgendamento], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Erro ao buscar os dados do agendamento');
        }

        if (results.length > 0) {
            const agendamento = results[0]; // Assumindo que a consulta retorna apenas um resultado

            // Definir nome com base nas condições
            const nomePessoa = agendamento.nm_pessoa_fisica || agendamento.nm_pessoa_juridica_fantasia;

            // Consultas para pegar as cidades, bairros, pessoas físicas e jurídicas
            const cidadesQuery = 'SELECT * FROM cidade';
            const bairrosQuery = 'SELECT * FROM bairro';

            // Consultas para cidades e bairros
            connection.query(cidadesQuery, (err, cidades) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao buscar as cidades');
                }

                connection.query(bairrosQuery, (err, bairros) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send('Erro ao buscar os bairros');
                    }

                    // Renderizando a página de edição com os dados
                    res.render('agendamentoEditar', {
                        agendamento,
                        nomePessoa,  // Envia o nome já processado
                        cidades,
                        bairros
                    });
                });
            });
        } else {
            return res.status(404).send('Agendamento não encontrado');
        }
    });
}

// Função para atualizar os dados do agendamento
function atualizarAgendamento(req, res) {
    const {
        id_agendamento, 
        dt_solicitada, 
        cd_pessoa_fisica, 
        cd_pessoa_juridica, 
        ds_endereco, 
        cd_bairro, 
        cd_cidade, 
        nr_cep, 
        qt_quantidade_prevista_kg, 
        vlr_previsto_reais 
    } = req.body;

    const query = `
        UPDATE agendamento
        SET dt_solicitada = ?, 
            cd_pessoa_fisica = ?, 
            cd_pessoa_juridica = ?, 
            ds_endereco = ?, 
            cd_bairro = ?, 
            cd_cidade = ?, 
            nr_cep = ?, 
            qt_quantidade_prevista_kg = ?, 
            vlr_previsto_reais = ?
        WHERE cd_agendamento = ?
    `;

    const values = [
        dt_solicitada,
        cd_pessoa_fisica,
        cd_pessoa_juridica,
        ds_endereco,
        cd_bairro,
        cd_cidade,
        nr_cep,
        qt_quantidade_prevista_kg,
        vlr_previsto_reais,
        id_agendamento
    ];

    // Conexão com o banco
    const connection = conectiondb();

    // Atualizando o agendamento no banco de dados
    connection.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Erro ao atualizar o agendamento');
        }

        // Redireciona de volta para a lista de agendamentos ou para a página de edição
        res.redirect('/agendamento');
    });
}

module.exports = {
    exibirEditarAgendamento,
    atualizarAgendamento
};
