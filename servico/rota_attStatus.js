const conectiondb = require('../bd/conexao_mysql.js');

// Função para página Atualizar status
function exibirAtualizarRotas(req, res) {
    const cd_rota = req.params.cd_rota;
    const connection = conectiondb();

    const query1 = `
        SELECT cd_rota, nm_rota, nr_distancia_km, qt_peso_total_kg, 
               DATE_FORMAT(dt_agendada, '%d/%m/%Y') AS dt_agendada,
               dt_iniciado, dt_fim
        FROM rota_coleta WHERE cd_rota = ?`;

    const query2 = `
        SELECT * FROM vw_pontos_coleta WHERE cd_rota = ?`;

    const query3 = `
        SELECT * FROM vw_rotas_coleta WHERE cd_rota = ?`;

    connection.query(query1, [cd_rota], function (erro1, resultado1) {
        if (erro1) throw erro1;

        connection.query(query2, [cd_rota], function (erro2, resultado2) {
            if (erro2) throw erro2;

            connection.query(query3, [cd_rota], function (erro3, resultado3) {
                if (erro3) throw erro3;

                res.render('attStatus', {
                    rotas: resultado1[0],
                    pontos: resultado2,
                    dadosRota: resultado3[0]

                });
            });
        });
    });
};


//Iniciar uma rota
async function atualizarStatusRota(req, res) {
    const connection = conectiondb();
    const cd_rota = req.params.cd_rota;
    const { acao } = req.body;
    const dataHoraAtual = new Date();

    if (acao === 'finalizar') {
        // Verifica se existe algum agendamento com dt_coleta preenchida
        const verificarAgendamentos = `
           SELECT COUNT(*) AS total 
        FROM vw_pontos_coleta 
        WHERE cd_rota = ? 
        AND dt_coleta IS NULL 

        `;

        connection.query(verificarAgendamentos, [cd_rota], (erroVerificacao, resultadoVerificacao) => {
            if (erroVerificacao) {
                console.error("Erro ao verificar agendamentos:", erroVerificacao);
                return res.status(500).json({ success: false });
            }

            const faltamcoletar = resultadoVerificacao[0].total;

            if (faltamcoletar > 0) {
                return res.json({ success: false, coletado: true, message: 'Existem agendamentos para serem coletados para esta rota. Não é possível finalizar.' });
            }

            // Se nenhum agendamento coletado, prossegue com o update
            const query = `UPDATE rota_coleta SET dt_fim = ? WHERE cd_rota = ?`;
            connection.query(query, [dataHoraAtual, cd_rota], (erro, resultado) => {
                if (erro) {
                    console.error(`Erro ao atualizar dt_fim:`, erro);
                    return res.json({ success: false });
                }

                return res.json({ success: true });
            });
        });

    } else if (acao === 'iniciar') {
        // Verifica se a rota já foi iniciada
        const verificaRota = `
           SELECT COUNT(*) AS total 
           FROM vw_pontos_coleta 
           WHERE cd_rota = ? 
           AND dt_r_inciada != '000000'
        `;

        // NOVA VALIDAÇÃO: Verifica se motorista e caminhão estão vinculados
        const verificaMotoristaCaminhao = `
            SELECT ie_motorista, ie_caminhao 
            FROM rota_coleta 
            WHERE cd_rota = ?
        `;

        connection.query(verificaMotoristaCaminhao, [cd_rota], (erroMC, resultadoMC) => {
            if (erroMC) {
                console.error("Erro ao verificar motorista/caminhão:", erroMC);
                return res.status(500).json({ success: false });
            }

            const rota = resultadoMC[0];
            if (!rota || !rota.ie_motorista || !rota.ie_caminhao) {
                return res.json({ success: false, motoristaCaminhao: true, message: 'É necessário vincular um motorista e um caminhão à rota antes de iniciar.' });
            }

            // Se motorista e caminhão existem, segue a validação normal
            connection.query(verificaRota, [cd_rota], (erroVerificacao, resultadoVerificacao) => {
                if (erroVerificacao) {
                    console.error("Erro ao verificar agendamentos:", erroVerificacao);
                    return res.status(500).json({ success: false });
                }

                const faltamcoletar = resultadoVerificacao[0].total;

                if (faltamcoletar > 0) {
                    return res.json({ success: false, iniciado: true, message: 'A Rota já foi iniciada.' });
                }

                // inicia uma rota
                const query = `UPDATE rota_coleta SET dt_iniciado = ? WHERE cd_rota = ?`;
                connection.query(query, [dataHoraAtual, cd_rota], (erro, resultado) => {
                    if (erro) {
                        console.error(`Erro ao atualizar dt_iniciado:`, erro);
                        return res.json({ success: false });
                    }

                    return res.json({ success: true });
                });
            });
        });
    } else {
        return res.status(400).json({ success: false, message: 'Ação inválida' });
    }
}


async function atualizarDataColeta(req, res) {
    const connection = conectiondb();
    const { cd_agendamento } = req.params;
    const { acao } = req.body;
    const dataAtual = new Date();

    if (acao === 'coletar') {
        const queryRota = `
        SELECT dt_r_inciada FROM vw_pontos_coleta WHERE cd_agendamento = ?
         `;
        connection.query(queryRota, [cd_agendamento], (erro, resultado) => {
            if (erro) {
                console.error("Erro ao verificar status da rota:", erro);
                return res.json({ success: false });
            }
            const rota = resultado[0];
            if (!rota || !rota.dt_r_inciada || rota.dt_r_inciada === '000000' || rota.dt_r_inciada === null) {
                return res.json({ success: false, rotaNaoIniciada: true, message: 'A rota precisa estar iniciada para coletar.' });
            }

            // Prossegue com a coleta
            const query = `UPDATE agendamento SET dt_coleta = ? WHERE cd_agendamento = ?`;
            connection.query(query, [dataAtual, cd_agendamento], (erro, resultado) => {
                if (erro) {
                    console.error("Erro ao atualizar data_coleta:", erro);
                    return res.json({ success: false });
                }
                return res.json({ success: true });
            });
        });
    } else if (acao === 'cancelar') {
        // Verifica se o ponto já foi coletado
        const queryCheck = `SELECT dt_coleta FROM agendamento WHERE cd_agendamento = ?`;
        connection.query(queryCheck, [cd_agendamento], (erro, resultado) => {
            if (erro) {
                console.error("Erro ao verificar coleta:", erro);
                return res.json({ success: false });
            }
            const agendamento = resultado[0];
            if (agendamento && agendamento.dt_coleta) {
                return res.json({ success: false, jaColetado: true, message: 'Não é possível cancelar um ponto já coletado.' });
            }

            // Prossegue com o cancelamento
            const query = `UPDATE agendamento SET dt_cancelado = ? WHERE cd_agendamento = ?`;
            connection.query(query, [dataAtual, cd_agendamento], (erro, resultado) => {
                if (erro) {
                    console.error("Erro ao cancelar agendamento:", erro);
                    return res.json({ success: false });
                }
                return res.json({ success: true });
            });
        });
    }
}



//exportando a função 
module.exports = {
    exibirAtualizarRotas,
    atualizarStatusRota,
    atualizarDataColeta,
}