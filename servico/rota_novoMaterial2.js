const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina home
function exibirNovoMaterial2(req, res) {
    res.render('novoMaterial2');
};

function buscarAgendamentoSeparacao(req, res) {
    const sql = `SELECT 
                pc.cd_planta,
                p.nm_planta,
                a.cd_agendamento,
                a.nm_agendamento,
                a.qt_peso_real,
                rc.cd_rota,
                rc.nm_rota

            FROM agendamento a 
            LEFT JOIN pontos_coleta pc ON pc.cd_agendamento = a.cd_agendamento
            LEFT JOIN rota_coleta rc ON rc.cd_rota = pc.ie_rota
            LEFT JOIN planta p ON p.cd_planta = pc.cd_planta

            WHERE a.dt_coleta IS NOT NULL 
                AND a.dt_pesagem IS NOT NULL 
                AND a.dt_separacao IS NULL`;
    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar Agendamentos:', erro);
            return res.status(500).send('Erro ao buscar Agendamentos.');
        }
        res.json(resultados);
    });
}

function buscarMateriaisLinha5(req, res) {
    const sql = "SELECT cd_material, ds_material, volume_m3 FROM materiais WHERE ie_linha = 5";
    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar materiais:', erro);
            return res.status(500).send('Erro ao buscar materiais.');
        }
        res.json(resultados);
    });
}

function buscarEstoquesPorPlanta(req, res) {
    const { cd_planta } = req.query;
    if (!cd_planta) {
        return res.status(400).json({ erro: 'Planta não informada.' });
    }
    const sql = `SELECT cd_estoque, nm_estoque FROM estoque WHERE cd_planta = ?`;
    conectiondb().query(sql, [cd_planta], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar estoques:', erro);
            return res.status(500).send('Erro ao buscar estoques.');
        }
        res.json(resultados);
    });
}

function adicionarItemEstoqueMaterial(req, res) {
    console.log(req.body);
    const { cd_agendamento, materia_prima, estoque, peso, volume_m3_prensado } = req.body;

    if (!materia_prima || !estoque || !peso || !volume_m3_prensado) {
        return res.status(400).send('Todos os campos são obrigatórios.');
    }

    // Função para registrar movimentação
    function registrarMovimentacao({
        cd_estoque,
        cd_material,
        cd_agendamento,
        qt_volume,
        qt_peso,
        tipo_movimentacao = 'entrada',
        ds_motivo
    }) {
        const queryMov = `
        INSERT INTO movimentacoes (
            cd_estoque, cd_material, cd_agendamento, qt_volume, qt_peso, tipo_movimentacao, ds_motivo,
            cd_pessoa_fisica, cd_pessoa_juridica, vl_valor_por_kg, dt_movimentacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?, NOW())
    `;
        conectiondb().query(
            queryMov,
            [
                cd_estoque,
                cd_material,
                cd_agendamento,
                qt_volume,
                qt_peso,
                tipo_movimentacao,
                ds_motivo,
                null, // cd_pessoa_fisica
                null, // cd_pessoa_juridica
                null  // vl_valor_por_kg
            ],
            (errMov, result) => {
                if (errMov) {console.error('Erro ao registrar movimentação:', errMov);
            } else {
            console.log('Movimentação registrada com sucesso!', result);
            }}
        );
    }

    // Buscar o nome do material para ds_material
    const sqlMaterial = "SELECT ds_material FROM materiais WHERE cd_material = ?";
    conectiondb().query(sqlMaterial, [materia_prima], (erro, resultados) => {
        if (erro || resultados.length === 0) {
            return res.status(500).send('Erro ao buscar material.');
        }
        const ds_material = resultados[0].ds_material;

        // Verifica se já existe esse material nesse estoque
        const sqlBusca = "SELECT qt_peso, qt_volume FROM estoque_material WHERE cd_material = ? AND cd_estoque = ?";
        conectiondb().query(sqlBusca, [materia_prima, estoque], (erroBusca, resultsBusca) => {
            if (erroBusca) {
                return res.status(500).send('Erro ao buscar estoque/material.');
            }

            const novoPeso = Number(peso);
            const novoVolume = Number(volume_m3_prensado);

            if (resultsBusca.length > 0) {
                // Já existe: atualiza os valores somando
                const atual = resultsBusca[0];
                const pesoAtual = Number(atual.qt_peso) || 0;
                const volumeAtual = Number(atual.qt_volume) || 0;

                const pesoFinal = pesoAtual + novoPeso;
                const volumeFinal = volumeAtual + novoVolume;

                const sqlUpdate = `
                    UPDATE estoque_material
                    SET qt_peso = ?, qt_volume = ?
                    WHERE cd_material = ? AND cd_estoque = ?
                `;
                conectiondb().query(sqlUpdate, [pesoFinal, volumeFinal, materia_prima, estoque], (erroUpdate) => {
                    if (erroUpdate) {
                        return res.status(500).send('Erro ao atualizar estoque.');
                    }
                    // Registra a movimentação de entrada
                    registrarMovimentacao({
                        cd_estoque: estoque,
                        cd_material: materia_prima,
                        cd_agendamento,
                        qt_volume: novoVolume,
                        qt_peso: novoPeso,
                        tipo_movimentacao: 'entrada',
                        ds_motivo: `Gerada pela separação do Agendamento ${cd_agendamento}`
                    });
                    return res.redirect(`/novoMaterial2?cd_agendamento=${cd_agendamento}`);
                });
            } else {
                // Não existe: faz o insert normalmente
                const sqlInsert = `
                    INSERT INTO estoque_material (cd_material, ds_material, cd_estoque, qt_peso, qt_volume)
                    VALUES (?, ?, ?, ?, ?)
                `;
                conectiondb().query(sqlInsert, [materia_prima, ds_material, estoque, novoPeso, novoVolume], (erro2) => {
                    if (erro2) {
                        return res.status(500).send('Erro ao inserir item.');
                    }
                    // Registra a movimentação de entrada
                    registrarMovimentacao({
                        cd_estoque: estoque,
                        cd_material: materia_prima,
                        cd_agendamento,
                        qt_volume: novoVolume,
                        qt_peso: novoPeso,
                        tipo_movimentacao: 'entrada',
                        ds_motivo: `Gerada pela separação do Agendamento ${cd_agendamento}`
                    });
                    return res.redirect(`/novoMaterial2?cd_agendamento=${cd_agendamento}`);
                });
            }
        });
    });
}

//exportando a função 
module.exports = {
    exibirNovoMaterial2,
    buscarAgendamentoSeparacao,
    buscarMateriaisLinha5,
    buscarEstoquesPorPlanta,
    adicionarItemEstoqueMaterial
}