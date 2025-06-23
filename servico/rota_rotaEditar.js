const conectiondb = require('../bd/conexao_mysql.js');
const { calcularEDistanciaRotaCompleta } = require('./rota_distanciaTotal.js');

// ========================
// Exibir a página de edição da rota e pontos de coleta
// ========================
function exibirrotaeditar(req, res) {
    const cd_rota = req.params.cd_rota;
    const connection = conectiondb();

    const query1 = `SELECT * FROM vw_rotas_coleta WHERE cd_rota = ?`;
    const query2 = `SELECT * FROM vw_pontos_coleta WHERE cd_rota = ?`;

    connection.query(query1, [cd_rota], function (erro1, resultado1) {
        if (erro1) throw erro1;

        connection.query(query2, [cd_rota], function (erro2, resultado2) {
            if (erro2) throw erro2;

            // Verifica se algum ponto tem dt_r_iniciada preenchido
            const rotaBloqueada = resultado2.some(p => p.dt_r_iniciada);

            res.render('rotaEditar', {
                usuario: req.session.usuario,
                rotas: resultado1[0],
                pontos: resultado2,
                rotaBloqueada // true ou false
            });
        });
    });
}

//Função para editar Rota e exclui/inativa
function editarRota(req, res) {
    const cd_rota = req.body.codigo;
    const nm_rota = req.body.nome;
    const dt_agendada = req.body.data;
    const action = req.body.action;
    const cd_motorista = req.body.Motorista;
    const cd_caminhao = req.body.caminhao;

    if (!cd_rota) {
        return res.status(400).send('ID da rota é obrigatório.');
    }

    //Verifica se existe ponto iniciado
    const sqlBloqueio = `
        SELECT 1 FROM vw_pontos_coleta
        WHERE cd_rota = ? AND dt_r_inciada IS NOT NULL LIMIT 1
    `;
    conectiondb().query(sqlBloqueio, [cd_rota], function (erro, resultado) {
        if (erro) {
            console.error('Erro ao verificar bloqueio da rota:', erro);
            return res.status(500).send('Erro ao verificar bloqueio da rota.');
        }
        if (resultado.length > 0) {
            // Já iniciada, bloqueia edição
            return res.render('rotaEditar', {
                usuario: req.session.usuario,
                rota: { cd_rota, nm_rota, dt_agendada, cd_motorista, cd_caminhao },
                script: `<script>
                    swal("Não é possível editar!", "Esta rota já foi iniciada e não pode ser editada.", {
                        icon: "warning",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-warning",
                            },
                        },
                    });
                </script>`
            });
        }

        // função para realizar a edição da rota
        if (action == 'editar') {
            const sqlrota =
                `UPDATE rota_coleta 
            SET nm_rota = ?, dt_agendada = ?, ie_motorista = ?, ie_caminhao = ?
            WHERE cd_rota = ?`;

            conectiondb().query(sqlrota, [nm_rota, dt_agendada, cd_motorista, cd_caminhao, cd_rota], function (errorota) {
                if (errorota) {
                    console.error('Erro ao atualizar Rota:', errorota);
                    return res.render('rotaEditar', {
                        usuario: req.session.usuario,
                        rota: { cd_rota, nm_rota, dt_agendada, cd_motorista, cd_caminhao },
                        script:
                            `<script>
                        swal("Erro ao editar!", "Verifique os dados e tente novamente.", {
                            icon: "error",
                            buttons: {
                                confirm: {
                                    text: "OK",
                                    className: "btn btn-danger",
                                },
                            },
                        });
                        </script>`
                    });
                }

                // Sucesso: exibe o modal e depois redireciona
                res.render('rotaEditar', {
                    usuario: req.session.usuario,
                    rota: { cd_rota, nm_rota, dt_agendada },
                    script:
                        `<script>
                    swal("Editado com sucesso!", "", {
                        icon: "success",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-success",
                            },
                        },
                    }).then(() => {
                        window.location.href = "/rotaEditar/${cd_rota}";
                    });
                    </script>`
                });
            });
        } else if (action == 'excluir') {
            // Primeiro, verifica se existem pontos de coleta vinculados
            const sqlVerificaPonto =
                `SELECT COUNT(*) AS total
            FROM pontos_coleta
            WHERE ie_rota = ?`;

            conectiondb().query(sqlVerificaPonto, [cd_rota], function (erroVerifica, resultado) {
                if (erroVerifica) {
                    console.error('Erro ao verificar pontos vinculados:', erroVerifica);
                    return res.render('rotaEditar/', {
                        usuario: req.session.usuario,
                        rota: { cd_rota, nm_rota, dt_agendada },
                        script:
                            `<script>
                    swal("Erro!", "Erro ao verificar pontos vinculados à rota.", {
                        icon: "error",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-danger",
                            },
                        },
                        }).then(() => {
                        window.location.href = "/rotaEditar/${cd_rota}";
                    });
                    </script>`
                    });
                }

                const totalPontos = resultado[0].total;

                if (totalPontos > 0) {
                    // Existem pontos vinculados — não pode excluir
                    return res.render('rotaEditar', {
                        rota: { cd_rota, nm_rota, dt_agendada },
                        script:
                            `<script>
                    swal("Não é possível excluir!", "Remova os ${totalPontos} ponto(s) de coleta vinculados à rota antes de excluir.", {
                        icon: "warning",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-warning",
                            },
                        },
                        }).then(() => {
                        window.location.href = "/rotaEditar/${cd_rota}";
                    });
                    </script>`
                    });
                }

                // Se não houver pontos vinculados, pode excluir
                const sqlrota =
                    ` UPDATE rota_coleta 
                SET ie_situacao = 'I'
                WHERE cd_rota = ?
            ;`;

                conectiondb().query(sqlrota, [cd_rota], function (errorota) {
                    if (errorota) {
                        console.error('Erro ao excluir Rota:', errorota);
                        return res.render('rotaEditar', {
                            usuario: req.session.usuario,
                            rota: { cd_rota, nm_rota, dt_agendada },
                            script:
                                `<script>
                        swal("Erro ao excluir!", "Verifique os dados e tente novamente.", {
                            icon: "error",
                            buttons: {
                                confirm: {
                                    text: "OK",
                                    className: "btn btn-danger",
                                },
                            },
                        });
                        </script>`
                        });
                    }

                    // Sucesso na exclusão
                    res.render('rotaEditar', {
                        usuario: req.session.usuario,
                        rota: { cd_rota, nm_rota, dt_agendada, cd_motorista },
                        script:
                            ` <script>
                    swal("Rota excluída com sucesso!", "", {
                        icon: "success",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-success",
                            },
                        },
                    }).then(() => {
                        window.location.href = "/rotas";
                    });
                    </script>`
                    });
                });
            });
        }
    });
}

// Busca agendamentos para gerar um ponto de coleta
function buscarAgendamento(req, res) {
    const sql = `
        SELECT a.cd_agendamento, a.nm_agendamento, a.ds_endereco, a.qt_quantidade_prevista_kg, a.status, volume_agendamento
        FROM agendamento a
        WHERE a.status = 'ativo'
        AND NOT EXISTS (
            SELECT 1
            FROM pontos_coleta pc
            WHERE pc.cd_agendamento = a.cd_agendamento
        )
    `;

    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar Agendamentos:', erro);
            return res.status(500).send('Erro ao buscar Agendamentos.');
        }
        res.json(resultados);
    });
}
// funcão de buscar o motorista
function buscarMotoristas(req, res) {
    const sql = `
         SELECT m.*
FROM motorista m
WHERE m.situacao = 'A'
AND NOT EXISTS (
    SELECT 1
    FROM rota_coleta r
    WHERE r.ie_motorista = m.id_motorista
      AND r.ie_situacao = 'A'
      AND r.dt_fim IS NULL
);

    `;

    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar motoristas:', erro);
            return res.status(500).send('Erro ao buscar motoristas.');
        }
        res.json(resultados);
    });
}

// Função buscar o caminhão
function buscarCaminhao(req, res) {

    const sql = `
               SELECT c.*
FROM caminhao c
WHERE c.situacao = 'A'
AND NOT EXISTS (
    SELECT 1
    FROM rota_coleta r
    WHERE r.ie_caminhao = c.id_caminhao
      AND r.ie_situacao = 'A'
      AND r.dt_fim IS NULL
)
    `;

    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar Caminhões:', erro);
            return res.status(500).send('Erro ao buscar Caminhoões.');
        }
        res.json(resultados);
    });
}

// Adiciona ponto de coleta
function adicionarAgendamentoNaRota(req, res) {
    const { cd_agendamento, agendamento, } = req.body;
    const { cd_rota } = req.params;

    const connection = conectiondb();

    const queryInsert = `
         INSERT INTO pontos_coleta (cd_ponto_coleta,ie_rota,nm_ponto,nm_bairro,nm_cidade,nr_cep, cd_planta, cd_agendamento)
        VALUES (NULL,?,'','','','',NULL,?)
    ;
    `;

    connection.query(queryInsert, [cd_rota, agendamento, cd_agendamento], (err) => {
        if (err) {
            console.error("Erro ao adicionar agendamento à rota:", err);
            return res.status(500).send('Erro ao adicionar agendamento à rota');
        }

        // Após inserir, recalcular distância total
        calcularEDistanciaRotaCompleta(cd_rota)
            .then(() => res.redirect(`/rotaEditar/${cd_rota}`))
            .catch((error) => {
                console.error('Erro ao recalcular distância:', error);
                res.status(500).send('Erro ao recalcular distância da rota.');
            });
    });
}

// Exclui ponto de coleta
function excluirPontoColeta(req, res) {
    const id = req.params.id;
    if (!id) {
        console.error('ID não recebido!');
        return res.status(400).send('ID do ponto é obrigatório.');
    }

    const sqlBusca = `SELECT ie_rota FROM pontos_coleta WHERE cd_ponto_coleta = ?`;

    conectiondb().query(sqlBusca, [id], (err, resultado) => {
        if (err) {
            console.error('Erro na busca:', err);
            return res.status(500).json({ error: 'Erro ao buscar ponto.' });
        }

        if (resultado.length === 0) {
            console.warn('Ponto não encontrado para ID:', id);
            return res.status(404).json({ error: 'Ponto não encontrado.' });
        }

        const cd_rota = resultado[0].ie_rota;

        const sqlDelete = `DELETE FROM pontos_coleta WHERE cd_ponto_coleta = ?`;

        conectiondb().query(sqlDelete, [id], (err2) => {
            if (err2) {
                console.error('Erro na exclusão:', err2);
                return res.status(500).json({ error: 'Erro ao excluir ponto.' });
            }

            // Após excluir, recalcula distância
            calcularEDistanciaRotaCompleta(cd_rota)
                .then(() => {
                    return res.json({
                        success: true,
                        redirectUrl: `/rotaEditar/${cd_rota}`
                    });
                })
                .catch((error) => {
                    console.error('Erro ao recalcular distância após excluir ponto:', error);
                    return res.status(500).json({ error: 'Erro ao recalcular distância.' });
                });
        });
    });
}



// envia minhas funções
module.exports = {
    exibirrotaeditar,
    editarRota,
    buscarAgendamento,
    buscarMotoristas,
    buscarCaminhao,
    adicionarAgendamentoNaRota,
    excluirPontoColeta
};
