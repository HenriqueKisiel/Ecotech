const conectiondb = require('../bd/conexao_mysql.js');


// Exibe a tela de edição com os dados do agendamento e seus itens
function exibirEditarAgendamento(req, res, itemEmEdicao = null) {function adicionarItem(req, res) {
    const { item_nome, linha_material, item_qtde } = req.body;
    const { id_agendamento } = req.params;

    if (!item_nome || !linha_material || !item_qtde) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    const qtde = parseInt(item_qtde, 10);

    const connection = conectiondb();

    const query = `
        INSERT INTO materiais_agenda (ie_agenda, ds_mat_agenda, ie_linha, qtde_material)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(query, [id_agendamento, item_nome, linha_material, qtde], (err, result) => {
        if (err) {
            console.log("Erro ao adicionar item:", err);
            return res.status(500).send('Erro ao adicionar item');
        }

        res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
    });
}
    const idAgendamento = req.query.id_agendamento || req.params.id_agendamento;
    if (!idAgendamento) {
        console.log('ID do agendamento não fornecido');
        return res.status(400).send('ID do agendamento não fornecido');
    }

    const connection = conectiondb();

    // Verifica se existe algum item com pesagem finalizada
    const sqlVerificaPesagem = `
        SELECT 1 FROM materiais_agenda 
        WHERE ie_agenda = ? AND qt_peso_final IS NOT NULL AND qt_peso_final <> ''
        LIMIT 1
    `;
    connection.query(sqlVerificaPesagem, [idAgendamento], (err, results) => {
        if (err) {
            return res.status(500).send('Erro ao verificar etapa de pesagem');
        }
        // Se pesagem finalizada, renderiza em modo somente visualização
        if (results.length > 0) {
            // Buscar os dados do agendamento para exibir na tela
            const query = `
                SELECT 
                    agendamento.*, 
                    pf.nm_pessoa_fisica, 
                    pj.nm_fantasia AS nm_pessoa_juridica_fantasia
                FROM agendamento
                LEFT JOIN pessoa_fisica pf ON agendamento.cd_pessoa_fisica = pf.cd_pessoa_fisica
                LEFT JOIN pessoa_juridica pj ON agendamento.cd_pessoa_juridica = pj.cd_pessoa_juridica
                WHERE agendamento.cd_agendamento = ?`;

            connection.query(query, [idAgendamento], (err, results) => {
                if (err || results.length === 0) {
                    return res.status(500).send('Erro ao buscar dados do agendamento');
                }
                const agendamento = results[0];

                // Busca linhas
                const linhasQuery = 'SELECT cd_linha, nm_linha FROM linha';
                connection.query(linhasQuery, (err, linhas) => {
                    if (err) return res.status(500).send('Erro ao buscar as linhas');

                    // Busca itens
                    const itensQuery = `
                        SELECT a.*, l.nm_linha
                        FROM materiais_agenda a
                        LEFT JOIN linha l ON l.cd_linha = a.ie_linha
                        WHERE a.ie_agenda = ?`;
                    connection.query(itensQuery, [idAgendamento], (err, itens) => {
                        if (err) return res.status(500).send('Erro ao buscar os itens');

                        // Busca pessoas físicas
                        const pessoasFisicasQuery = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
                        connection.query(pessoasFisicasQuery, (err, pessoasFisicas) => {
                            if (err) return res.status(500).send('Erro ao buscar as pessoas físicas');

                            // Busca pessoas jurídicas
                            const pessoasJuridicasQuery = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';
                            connection.query(pessoasJuridicasQuery, (err, pessoasJuridicas) => {
                                if (err) return res.status(500).send('Erro ao buscar as pessoas jurídicas');

                                // Busca materiais
                                const materiaisQuery = 'SELECT cd_material, ds_material, ie_linha FROM materiais';
                                connection.query(materiaisQuery, (err, materiais) => {
                                    if (err) return res.status(500).send('Erro ao buscar os materiais');

                                    // Renderiza a página em modo somente visualização
                                    res.render('agendamentoEditar', {
                                        agendamento,
                                        pessoasFisicas,
                                        pessoasJuridicas,
                                        itens,
                                        linhas,
                                        materiais,
                                        isPessoaFisica: agendamento.cd_pessoa_fisica !== null,
                                        isPessoaJuridica: agendamento.cd_pessoa_juridica !== null,
                                        nomePessoaFisica: agendamento.nm_pessoa_fisica,
                                        nomePessoaJuridica: agendamento.nm_pessoa_juridica_fantasia,
                                        item: itemEmEdicao,
                                        editandoItem: itemEmEdicao !== null,
                                        somenteVisualizacao: true,
                                        mensagem: `
                                            <script>
                                                swal({
                                                    title: "Edição bloqueada!",
                                                    text: "Não é possível editar este agendamento pois a etapa de pesagem já foi finalizada.",
                                                    icon: "warning",
                                                    button: "OK"
                                                });
                                            </script>
                                        `
                                    });
                                });
                            });
                        });
                    });
                });
            });
            return; // Importante para não continuar o fluxo normal
        }

        // Fluxo normal de edição (sem pesagem finalizada)
        const query = `
            SELECT 
                agendamento.*, 
                pf.nm_pessoa_fisica, 
                pj.nm_fantasia AS nm_pessoa_juridica_fantasia
            FROM agendamento
            LEFT JOIN pessoa_fisica pf ON agendamento.cd_pessoa_fisica = pf.cd_pessoa_fisica
            LEFT JOIN pessoa_juridica pj ON agendamento.cd_pessoa_juridica = pj.cd_pessoa_juridica
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

            // Consulta para pegar todas as linhas cadastradas
            const linhasQuery = 'SELECT cd_linha, nm_linha FROM linha';

            connection.query(linhasQuery, (err, linhas) => {
                if (err) {
                    console.log('Erro ao buscar as linhas:', err);
                    return res.status(500).send('Erro ao buscar as linhas');
                }

                // Consulta para pegar os itens associados ao agendamento
                const itensQuery = `
                    SELECT a.*, l.nm_linha
                    FROM materiais_agenda a
                    LEFT JOIN linha l ON l.cd_linha = a.ie_linha
                    WHERE a.ie_agenda = ?`;

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

                            // Consulta para pegar os materiais cadastrados
                            const materiaisQuery = 'SELECT cd_material, ds_material, ie_linha FROM materiais';

                            connection.query(materiaisQuery, (err, materiais) => {
                                if (err) {
                                    console.log('Erro ao buscar os materiais:', err);
                                    return res.status(500).send('Erro ao buscar os materiais');
                                }

                                // Renderiza a página com todos os dados necessários
                                res.render('agendamentoEditar', {
                                    agendamento,
                                    pessoasFisicas,
                                    pessoasJuridicas,
                                    itens,
                                    linhas,
                                    materiais,
                                    isPessoaFisica: agendamento.cd_pessoa_fisica !== null,
                                    isPessoaJuridica: agendamento.cd_pessoa_juridica !== null,
                                    nomePessoaFisica: agendamento.nm_pessoa_fisica,
                                    nomePessoaJuridica: agendamento.nm_pessoa_juridica_fantasia,
                                    item: itemEmEdicao,
                                    editandoItem: itemEmEdicao !== null
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

function atualizarAgendamento(req, res) {
    const {
        id_agendamento,
        cd_pessoa_fisica,
        cd_pessoa_juridica,
        ds_endereco,
        nr_endereco,
        nm_bairro,
        nm_cidade,
        uf_estado,
        nr_cep,
        qt_quantidade_prevista_kg,
        status,
        nm_pessoa_fisica
    } = req.body;

    const statusAtualizado = (status === 'ativo' || status === 'cancelado') ? status : 'ativo';
    const dataCancelamento = (statusAtualizado === 'cancelado') ? new Date() : null;

    const connection = conectiondb();

    // Se o nome da pessoa física foi enviado, busca o código correspondente
    if (nm_pessoa_fisica) {
        const queryPessoaFisica = 'SELECT cd_pessoa_fisica FROM pessoa_fisica WHERE nm_pessoa_fisica = ?';

        connection.query(queryPessoaFisica, [nm_pessoa_fisica], (err, result) => {
            if (err) {
                console.error('Erro ao buscar o código da pessoa física:', err);
                return res.status(500).send('Erro ao buscar o código da pessoa física');
            }

            if (result.length === 0) {
                return res.status(404).send('Pessoa física não encontrada');
            }

            const cd_pessoa_fisicaEncontrada = result[0].cd_pessoa_fisica;

            const sql = `
                UPDATE agendamento SET
                    cd_pessoa_fisica = ?,        
                    cd_pessoa_juridica = ?,      
                    ds_endereco = ?,
                    nr_resid = ?,
                    nm_bairro = ?,
                    nm_cidade = ?,
                    uf_estado = ?,
                    nr_cep = ?,
                    qt_quantidade_prevista_kg = ?,
                    status = ?,
                    dt_cancelado = ?
                WHERE cd_agendamento = ?`;

            const valores = [
                cd_pessoa_fisicaEncontrada,
                cd_pessoa_juridica || null,
                ds_endereco,
                nr_endereco,
                nm_bairro,
                nm_cidade,
                uf_estado,
                nr_cep,
                qt_quantidade_prevista_kg,
                statusAtualizado,
                dataCancelamento,
                id_agendamento
            ];

            connection.query(sql, valores, (erro) => {
                if (erro) {
                    console.error("Erro ao atualizar agendamento:", erro);
                    return res.status(500).send("Erro ao atualizar o agendamento.");
                }
                res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
            });
        });
    } else {
        // Usa o código fornecido diretamente
        const sql = `
            UPDATE agendamento SET
                cd_pessoa_fisica = ?,        
                cd_pessoa_juridica = ?,      
                ds_endereco = ?,
                nr_resid = ?,
                nm_bairro = ?,
                nm_cidade = ?,
                uf_estado = ?,
                nr_cep = ?,
                qt_quantidade_prevista_kg = ?,
                status = ?,
                dt_cancelado = ?
            WHERE cd_agendamento = ?`;

        const valores = [
            cd_pessoa_fisica,
            cd_pessoa_juridica || null,
            ds_endereco,
            nr_endereco,
            nm_bairro,
            nm_cidade,
            uf_estado,
            nr_cep,
            qt_quantidade_prevista_kg,
            statusAtualizado,
            dataCancelamento,
            id_agendamento
        ];

        connection.query(sql, valores, (erro) => {
            if (erro) {
                console.error("Erro ao atualizar agendamento:", erro);
                return res.status(500).send("Erro ao atualizar o agendamento.");
            }
            res.redirect(`/agendamentoEditar?id_agendamento=${id_agendamento}`);
        });
    }
}

// Adiciona um novo item ao agendamento
function adicionarItem(req, res) {
    console.log('BODY:', req.body);
    console.log('PARAMS:', req.params);

    const { item_nome, linha_material, item_qtde, id_agendamento, ie_material } = req.body;
    const idAgendamento = id_agendamento || req.params.id_agendamento;

    if (!item_nome || !linha_material || !item_qtde || !idAgendamento || !ie_material) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    const qtde = parseInt(item_qtde, 10);
    const connection = conectiondb();
    const query = `
        INSERT INTO materiais_agenda (ie_agenda, ds_mat_agenda, ie_linha, qtde_material, ie_material)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(query, [idAgendamento, item_nome, linha_material, qtde, ie_material], (err, result) => {
        if (err) {
            console.log("Erro ao adicionar item:", err);
            return res.status(500).send('Erro ao adicionar item');
        }

        res.redirect(`/agendamentoEditar?id_agendamento=${idAgendamento}`);
    });
}


function exibirEditarItem(req, res) {
    const connection = conectiondb();
    const idAgendamento = req.params.id_agendamento;
    const itemId = req.params.itemId;

    const itemQuery = `
        SELECT a.*, l.nm_linha
        FROM materiais_agenda a
        LEFT JOIN linha l ON l.cd_linha = a.ie_linha
        WHERE a.cd_mat_agenda = ?
    `;

    connection.query(itemQuery, [itemId], (err, results) => {
        if (err) {
            console.log('Erro ao buscar o item para edição:', err);
            return res.status(500).send('Erro ao buscar o item');
        }

        if (results.length === 0) {
            return res.status(404).send('Item não encontrado');
        }

        const item = results[0]; // Atribui o resultado da consulta à variável `item`

        const linhasQuery = 'SELECT cd_linha, nm_linha FROM linha';

        connection.query(linhasQuery, (err, linhas) => {
            if (err) {
                console.log('Erro ao buscar as linhas:', err);
                return res.status(500).send('Erro ao buscar as linhas');
            }

            // Reaproveita a função, mas agora com item preenchido → editandoItem = true
            req.query.id_agendamento = idAgendamento; // Força o uso do mesmo parâmetro
            exibirEditarAgendamento(req, res, { ...item, linhas });
        });
    });
}


// Atualiza os dados de um item existente
function atualizarItem(req, res) {
    const { item_nome, linha_material, item_qtde } = req.body;
    const { id_agendamento, itemId } = req.params;

    if (!item_nome || !linha_material || !item_qtde) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    const qtde = parseInt(item_qtde, 10);

    const connection = conectiondb();

    const query = `
        UPDATE materiais_agenda
        SET ds_mat_agenda = ?, ie_linha = ?, qtde_material = ?
        WHERE cd_mat_agenda = ?
    `;

    connection.query(query, [item_nome, linha_material, qtde, itemId], (err) => {
        if (err) {
            console.log("Erro ao atualizar item:", err);
            return res.status(500).send('Erro ao atualizar item');
        }

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

    const query = ` DELETE FROM materiais_agenda WHERE cd_mat_agenda = ?`;

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



