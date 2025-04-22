const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a tela de edição com os dados do agendamento
function exibirEditarAgendamento(req, res) {
    const idAgendamento = req.query.id_agendamento;

    if (!idAgendamento) {
        return res.status(400).send('ID do agendamento não fornecido');
    }

    const connection = conectiondb();

    const query = `
        SELECT 
            agendamento.*, 
            pf.nm_pessoa_fisica, 
            pj.nm_fantasia AS nm_pessoa_juridica_fantasia, 
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
            console.log("Erro na consulta do agendamento:", err);
            return res.status(500).send('Erro ao buscar os dados do agendamento');
        }

        if (results.length > 0) {
            const agendamento = results[0];

            // Buscar todas as pessoas físicas e jurídicas
            const pessoasFisicasQuery = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
            const pessoasJuridicasQuery = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';

            connection.query(pessoasFisicasQuery, (err, pessoasFisicas) => {
                if (err) {
                    console.log("Erro na consulta das pessoas físicas:", err);
                    return res.status(500).send('Erro ao buscar as pessoas físicas');
                }

                connection.query(pessoasJuridicasQuery, (err, pessoasJuridicas) => {
                    if (err) {
                        console.log("Erro na consulta das pessoas jurídicas:", err);
                        return res.status(500).send('Erro ao buscar as pessoas jurídicas');
                    }

                    res.render('agendamentoEditar', {
                        agendamento,
                        pessoasFisicas,
                        pessoasJuridicas
                    });
                });
            });
        } else {
            return res.status(404).send('Agendamento não encontrado');
        }
    });
}

function atualizarAgendamento(req, res) {
    const {
        id_agendamento, 
        nome_pessoa_fisica, 
        nome_fantasia, 
        endereco, 
        cd_pessoa_fisica, 
        cd_pessoa_juridica, 
        cd_bairro, 
        cd_cidade, 
        Dt_solicitada, 
        peso_previsto, 
        item_nome,
        item_tipo,
        item_peso
    } = req.body;

    console.log("Dados recebidos para atualização:", req.body); // Log para depuração

    // Verificação para garantir que o ID foi fornecido
    if (!id_agendamento) {
        return res.status(400).send('ID do agendamento não fornecido');
    }

    // Verificação para garantir que pelo menos uma pessoa (física ou jurídica) foi informada
    if (!cd_pessoa_fisica && !cd_pessoa_juridica) {
        console.log("Erro: Nenhuma pessoa física ou jurídica informada");
        return res.status(400).send('É necessário informar uma pessoa física ou jurídica');
    }

    // Ajuste na query para não incluir `nr_cep` se ele não for enviado
    const query = `
        UPDATE agendamento
        SET dt_solicitada = ?, 
            cd_pessoa_fisica = ?, 
            cd_pessoa_juridica = ?, 
            ds_endereco = ?, 
            cd_bairro = ?, 
            cd_cidade = ?, 
            qt_quantidade_prevista_kg = ?, 
            vlr_previsto_reais = ?
        WHERE cd_agendamento = ?
    `;

    // Valores a serem passados para a query
    const values = [
        Dt_solicitada,
        cd_pessoa_fisica || null,  // Se não for pessoa física, será NULL
        cd_pessoa_juridica || null, // Se não for pessoa jurídica, será NULL
        endereco,
        cd_bairro,
        cd_cidade,
        peso_previsto,
        item_nome, // Exemplo de outro campo que poderia estar sendo manipulado
        item_tipo, 
        item_peso,
        id_agendamento
    ];

    // Conexão com o banco
    const connection = conectiondb();

    // Atualizando o agendamento no banco de dados
    connection.query(query, values, (err, result) => {
        if (err) {
            console.log("Erro ao atualizar agendamento:", err);
            return res.status(500).send('Erro ao atualizar o agendamento');
        }

        // Log de sucesso
        console.log(`Agendamento com ID ${id_agendamento} atualizado com sucesso!`);
        // Redireciona de volta para a lista de agendamentos ou para a página de edição
        res.redirect('/agendamento');
    });
}

module.exports = {
    exibirEditarAgendamento,
    atualizarAgendamento
};
