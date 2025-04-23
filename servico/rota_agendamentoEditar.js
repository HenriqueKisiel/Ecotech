const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a tela de edição com os dados do agendamento e seus itens
function exibirEditarAgendamento(req, res) {
    const idAgendamento = req.query.id_agendamento;

    if (!idAgendamento) {
        return res.status(400).send('ID do agendamento não fornecido');
    }

    const connection = conectiondb();

    // Consulta os dados principais do agendamento e informações relacionadas
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

        if (results.length === 0) {
            return res.status(404).send('Agendamento não encontrado');
        }

        const agendamento = results[0];

        // Consulta os itens associados ao agendamento
        const itensQuery = 'SELECT * FROM materiais_agenda WHERE ie_agenda = ?';
        connection.query(itensQuery, [idAgendamento], (err, itens) => {
            if (err) {
                console.log("Erro na consulta dos itens:", err);
                return res.status(500).send('Erro ao buscar os itens');
            }

            // Busca pessoas físicas para exibir no select
            const pessoasFisicasQuery = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
            // Busca pessoas jurídicas para exibir no select
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

                    // Renderiza a tela com os dados do agendamento e itens
                    res.render('agendamentoEditar', {
                        agendamento,
                        pessoasFisicas,
                        pessoasJuridicas,
                        itens
                    });
                });
            });
        });
    });
}

// Adiciona um novo item ao agendamento
function adicionarItem(req, res) {
    const { item_nome, linha_material, item_peso } = req.body;
    const { id_agendamento } = req.params;

    if (!item_nome || !linha_material || !item_peso) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    const connection = conectiondb();

    const query = `
        INSERT INTO materiais_agenda (ie_agenda, ds_mat_agenda, ie_linha, qt_peso_material_total_kg)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(query, [id_agendamento, item_nome, linha_material, item_peso], (err, result) => {
        if (err) {
            console.log("Erro ao adicionar item:", err);
            return res.status(500).send('Erro ao adicionar item');
        }

        // Redireciona para a tela de edição com os dados atualizados
        res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
    });
}

function exibirEditarItem(req, res) {
    const { id_agendamento, itemId } = req.params;

    const connection = conectiondb();

    const queryItem = 'SELECT * FROM materiais_agenda WHERE cd_mat_agenda = ?';
    connection.query(queryItem, [itemId], (err, results) => {
        if (err) {
            console.log("Erro ao buscar item:", err);
            return res.status(500).send('Erro ao buscar item');
        }

        if (results.length === 0) {
            return res.status(404).send('Item não encontrado');
        }

        const item = results[0];

        // Chama a função original de exibição da tela de edição, mas passando o item
        // Você pode modificar exibirEditarAgendamento para aceitar `item` e `editandoItem` também
        req.query.id_agendamento = id_agendamento; // Garante que o ID esteja no query

        // Faz o mesmo que exibirEditarAgendamento, mas adiciona `item` e `editandoItem`
        exibirEditarAgendamentoComItem(req, res, item);
    });
}

function exibirEditarAgendamentoComItem(req, res, item = null) {
    const idAgendamento = req.query.id_agendamento;
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
        if (err || results.length === 0) {
            return res.status(500).send('Erro ao buscar agendamento');
        }

        const agendamento = results[0];
        const itensQuery = 'SELECT * FROM materiais_agenda WHERE ie_agenda = ?';

        connection.query(itensQuery, [idAgendamento], (err, itens) => {
            if (err) return res.status(500).send('Erro ao buscar itens');

            connection.query('SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica', (err, pessoasFisicas) => {
                if (err) return res.status(500).send('Erro pessoas físicas');

                connection.query('SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica', (err, pessoasJuridicas) => {
                    if (err) return res.status(500).send('Erro pessoas jurídicas');

                    res.render('agendamentoEditar', {
                        agendamento,
                        pessoasFisicas,
                        pessoasJuridicas,
                        itens,
                        item, // opcional
                        editandoItem: !!item // define como true se estiver editando
                    });
                });
            });
        });
    });
}
// Atualiza os dados de um item existente
function atualizarItem(req, res) {
    const { item_nome, linha_material, item_peso } = req.body;
    const { id_agendamento, itemId } = req.params;

    if (!item_nome || !linha_material || !item_peso) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    const connection = conectiondb();

    const query = `
        UPDATE materiais_agenda
        SET ds_mat_agenda = ?, ie_linha = ?, qt_peso_material_total_kg = ?
        WHERE cd_mat_agenda = ?
    `;

    connection.query(query, [item_nome, linha_material, item_peso, itemId], (err) => {
        if (err) {
            console.log("Erro ao atualizar item:", err);
            return res.status(500).send('Erro ao atualizar item');
        }

        // Redireciona para a tela principal com os dados atualizados
        res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
    });
}

// Exclui um item do agendamento
function excluirItem(req, res) {
    const { id_agendamento, itemId } = req.params;
    const connection = conectiondb();

    const query = `DELETE FROM materiais_agenda WHERE cd_mat_agenda = ?`;

    connection.query(query, [itemId], (err) => {
        if (err) {
            console.log("Erro ao excluir item:", err);
            return res.status(500).send('Erro ao excluir item');
        }

        // Redireciona para a tela de edição atualizada
        res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
    });
}

// Exporta as funções para uso nas rotas
module.exports = {
    exibirEditarAgendamento,
    adicionarItem,
    exibirEditarItem,
    atualizarItem,
    excluirItem
};
