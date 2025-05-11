const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a tela de edição com os dados do agendamento e seus itens
function exibirEditarAgendamento(req, res, itemEmEdicao = null) {
    const idAgendamento = req.query.id_agendamento;

    if (!idAgendamento) {
        console.log('ID do agendamento não fornecido');
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
        WHERE agendamento.cd_agendamento = ?`;

    connection.query(query, [idAgendamento], (err, results) => {
        if (err) {
            console.log("Erro na consulta do agendamento:", err);
            return res.status(500).send('Erro ao buscar os dados do agendamento');
        }

        if (results.length === 0) {
            console.log('Agendamento não encontrado');
            return res.status(404).send('Agendamento não encontrado');
        }

        const agendamento = results[0];
        console.log('Agendamento encontrado:', agendamento);

        // Consulta para pegar os itens associados ao agendamento
        const itensQuery = 'SELECT * FROM materiais_agenda WHERE ie_agenda = ?';
        connection.query(itensQuery, [idAgendamento], (err, itens) => {
            if (err) {
                console.log("Erro na consulta dos itens:", err);
                return res.status(500).send('Erro ao buscar os itens');
            }

            // Consulta para pegar todas as pessoas físicas cadastradas
            const pessoasFisicasQuery = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';

            connection.query(pessoasFisicasQuery, (err, pessoasFisicas) => {
                if (err) {
                    console.log('Erro ao buscar as pessoas físicas:', err);
                    return res.status(500).send('Erro ao buscar as pessoas físicas');
                }

                // Consulta para pegar as pessoas jurídicas
                const pessoasJuridicasQuery = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';

                connection.query(pessoasJuridicasQuery, (err, pessoasJuridicas) => {
                    if (err) {
                        console.log('Erro ao buscar as pessoas jurídicas:', err);
                        return res.status(500).send('Erro ao buscar as pessoas jurídicas');
                    }

                    // Passa os dados para o template
                    res.render('agendamentoEditar', {
                        agendamento,
                        pessoasFisicas,
                        pessoasJuridicas,
                        itens,
                        isPessoaFisica: agendamento.cd_pessoa_fisica !== null,
                        isPessoaJuridica: agendamento.cd_pessoa_juridica !== null,
                        nomePessoaFisica: agendamento.nm_pessoa_fisica,
                        nomePessoaJuridica: agendamento.nm_pessoa_juridica_fantasia,
                        item: itemEmEdicao,               // <-- renomeado para "item"
                        editandoItem: !!itemEmEdicao      // <-- flag usada no template
                    });
                });
            });
        });
    });
}

// Atualiza o agendamento
function atualizarAgendamento(req, res) {
    const {
        id_agendamento,
        cd_pessoa_fisica,
        cd_pessoa_juridica,
        endereco,
        cd_bairro,
        cd_cidade,
        dt_solicitada,
        peso_previsto,
        status,
        nm_pessoa_fisica // Nome da pessoa física enviado pelo front-end
    } = req.body;

    const statusAtualizado = (status === 'ativo' || status === 'cancelado') ? status : 'ativo';

    const connection = conectiondb();

    // Verificando os dados que estão sendo recebidos
    console.log('Dados de atualização recebidos:', {
        id_agendamento,
        cd_pessoa_fisica, 
        nm_pessoa_fisica, 
        cd_pessoa_juridica,
        endereco,
        cd_bairro,
        cd_cidade,
        dt_solicitada,
        peso_previsto,
        status: statusAtualizado
    });

    // Verifica se foi enviado o nome da pessoa física (para buscar o código)
    if (nm_pessoa_fisica) {
        console.log('Nome da pessoa física recebido:', nm_pessoa_fisica);

        // Passo 1: Consulta o código da pessoa física baseado no nome
        const queryPessoaFisica = 'SELECT cd_pessoa_fisica FROM pessoa_fisica WHERE nm_pessoa_fisica = ?';
        
        connection.query(queryPessoaFisica, [nm_pessoa_fisica], (err, result) => {
            if (err) {
                console.error('Erro ao buscar o código da pessoa física:', err);
                return res.status(500).send('Erro ao buscar o código da pessoa física');
            }

            if (result.length === 0) {
                console.log('Pessoa física não encontrada para o nome:', nm_pessoa_fisica);
                return res.status(404).send('Pessoa física não encontrada');
            }

            const cd_pessoa_fisicaEncontrada = result[0].cd_pessoa_fisica; // Obter o código da pessoa física
            console.log('Código da pessoa física encontrado:', cd_pessoa_fisicaEncontrada);
            
            // Agora podemos atualizar o agendamento com o código da pessoa física
            const sql = `
                UPDATE agendamento SET
                    cd_pessoa_fisica = ?,        
                    cd_pessoa_juridica = ?,      
                    ds_endereco = ?,
                    cd_bairro = ?,
                    cd_cidade = ?,
                    qt_quantidade_prevista_kg = ?,
                    status = ? 
                WHERE cd_agendamento = ?`
            ;
            
            const valores = [
                cd_pessoa_fisicaEncontrada, // Usando o código encontrado para atualizar
                cd_pessoa_juridica || null,
                endereco,
                cd_bairro,
                cd_cidade,
                peso_previsto,
                statusAtualizado,
                id_agendamento
            ];

            connection.query(sql, valores, (erro, resultado) => {
                if (erro) {
                    console.error("Erro ao atualizar agendamento:", erro);
                    return res.status(500).send("Erro ao atualizar o agendamento.");
                }

                console.log("Agendamento atualizado com sucesso!");
                res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
            });
        });
    } else {
        // Caso o nome não tenha sido passado, usa o código fornecido (cd_pessoa_fisica)
        console.log('Código da pessoa física fornecido diretamente:', cd_pessoa_fisica);

        const sql = `
            UPDATE agendamento SET
                cd_pessoa_fisica = ?,        
                cd_pessoa_juridica = ?,      
                ds_endereco = ?,
                cd_bairro = ?,
                cd_cidade = ?,
                qt_quantidade_prevista_kg = ?,
                status = ? 
            WHERE cd_agendamento = ?`
        ;

        const valores = [
            cd_pessoa_fisica,
            cd_pessoa_juridica || null,
            endereco,
            cd_bairro,
            cd_cidade,
            peso_previsto,
            statusAtualizado,
            id_agendamento
        ];

        connection.query(sql, valores, (erro, resultado) => {
            if (erro) {
                console.error("Erro ao atualizar agendamento:", erro);
                return res.status(500).send("Erro ao atualizar o agendamento.");
            }

            console.log("Agendamento atualizado com sucesso!");
            res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
        });
       
    }
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
        req.query.id_agendamento = id_agendamento; // Garante que o ID esteja no query
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


// Exclui um item
function excluirItem(req, res) {
    const { id_agendamento, itemId } = req.params;
    const connection = conectiondb();

    console.log('Excluindo item:', {
        id_agendamento,
        itemId
    });

    const query =` DELETE FROM materiais_agenda WHERE cd_mat_agenda = ?`;

    connection.query(query, [itemId], (err) => {
        if (err) {
            console.log("Erro ao excluir item:", err);
            return res.status(500).send('Erro ao excluir item');
        }

        console.log('Item excluído com sucesso');
        res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
    });
    
}

// Exporta todas as funções
module.exports = {
    exibirEditarAgendamento,
    atualizarAgendamento,
    adicionarItem,
    exibirEditarItem,
    atualizarItem,
    excluirItem
};



