const conectiondb = require('../bd/conexao_mysql.js');
// conexão com o banco de dados para exibir a pagina e os dados no frontend
function exibirrotaeditar(req, res) {
    const cd_rota = req.params.cd_rota;

    const connection = conectiondb();

    const query1 = `
        SELECT cd_rota, nm_rota, nr_distancia_km, qt_peso_total_kg, 
               DATE_FORMAT(dt_agendada, '%d/%m/%Y') AS dt_agendada  
        FROM rota_coleta WHERE cd_rota = ?`;

    const query2 = `SELECT * FROM vw_pontos_coleta WHERE cd_rota = ?`;

    connection.query(query1, [cd_rota], function (erro1, resultado1) {
        if (erro1) throw erro1;

        connection.query(query2, [cd_rota], function (erro2, resultado2) {
            if (erro2) throw erro2;

            res.render('rotaEditar', {
                rotas: resultado1[0],
                pontos: resultado2
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

    if (!cd_rota) {
        return res.status(400).send('ID da rota é obrigatório.');
    }


    // função para realizar a edicação
    if (action == 'editar') {
        const sqlrota = `
        UPDATE rota_coleta 
        SET nm_rota = ?, dt_agendada = ?
        WHERE cd_rota = ?`;

        conectiondb().query(sqlrota, [nm_rota, dt_agendada, cd_rota], function (errorota) {
            if (errorota) {
                console.error('Erro ao atualizar Rota:', errorota);
                return res.render('rotaEditar', {
                    rota: { cd_rota, nm_rota, dt_agendada },
                    script: `
                    <script>
                    swal("Erro ao editar!", "Verifique os dados e tente novamente.", {
                        icon: "error",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-danger",
                            },
                        },
                    });
                    </script>
                `
                });
            }

            // Sucesso: exibe o modal e depois redireciona
            res.render('rotaEditar', {
                rota: { cd_rota, nm_rota, dt_agendada },
                script: `
                <script>
                swal("Editado com sucesso!", "", {
                    icon: "success",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-success",
                        },
                    },
                }).then(() => {
                    window.location.href = "/rotaEditar/${cd_rota}"; // Redireciona para a rota editada
                });
                </script>
            `
            });
        });
        // função para excluir/inativar uma rota
    } else if (action == 'excluir') {
        // Primeiro, verifica se existem pontos de coleta vinculados
        const sqlVerificaPonto = `
        SELECT COUNT(*) AS total
        FROM pontos_coleta
        WHERE ie_rota = ?
    `;

        conectiondb().query(sqlVerificaPonto, [cd_rota], function (erroVerifica, resultado) {
            if (erroVerifica) {
                console.error('Erro ao verificar pontos vinculados:', erroVerifica);
                return res.render('rotaEditar/', {
                    rota: { cd_rota, nm_rota, dt_agendada },
                    script: `
                <script>
                swal("Erro!", "Erro ao verificar pontos vinculados à rota.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                    }).then(() => {
                    window.location.href = "/rotaEditar/${cd_rota}"; // Redireciona para a rota editada
                });
                </script>
                `
                });
            }

            const totalPontos = resultado[0].total;

            if (totalPontos > 0) {
                // Existem pontos vinculados — não pode excluir
                return res.render('rotaEditar', {
                    rota: { cd_rota, nm_rota, dt_agendada },
                    script: `
                <script>
                swal("Não é possível excluir!", "Remova os ${totalPontos} ponto(s) de coleta vinculados à rota antes de excluir.", {
                    icon: "warning",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-warning",
                        },
                    },
                    }).then(() => {
                    window.location.href = "/rotaEditar/${cd_rota}"; // Redireciona para a rota editada
                });
                </script>
                `
                });
            }

            // Se não houver pontos vinculados, pode excluir
            const sqlrota = `
            UPDATE rota_coleta 
            SET ie_situacao = 'I'
            WHERE cd_rota = ?
        `;

            conectiondb().query(sqlrota, [cd_rota], function (errorota) {
                if (errorota) {
                    console.error('Erro ao excluir Rota:', errorota);
                    return res.render('rotaEditar', {
                        rota: { cd_rota, nm_rota, dt_agendada },
                        script: `
                    <script>
                    swal("Erro ao excluir!", "Verifique os dados e tente novamente.", {
                        icon: "error",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-danger",
                            },
                        },
                    });
                    </script>
                    `
                    });
                }

                // Sucesso na exclusão
                res.render('rotaEditar', {
                    rota: { cd_rota, nm_rota, dt_agendada },
                    script: `
                <script>
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
                </script>
                `
                });
            });
        });
    }

}


// Função Select de Agendamentos
function buscarAgendamento(req, res) {

    const sql = `
        SELECT a.cd_agendamento, a.nm_agendamento, a.ds_endereco, a.qt_quantidade_prevista_kg, a.status
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

// Adiciona um novo item na rota
function adicionarAgendamentoNaRota(req, res) {
    const { cd_agendamento, agendamento } = req.body; // vem do formulário
    const { cd_rota } = req.params;// vem da URL

    const connection = conectiondb();

    const query = `
        INSERT INTO pontos_coleta (cd_ponto_coleta,ie_rota,nm_ponto,ds_endereco,cd_bairro,cd_cidade,nr_cep, cd_planta, cd_agendamento)
        VALUES (NULL,?,'','','','','',NULL,?)
    `;

    connection.query(query, [cd_rota, agendamento, cd_agendamento], (err, result) => {
        if (err) {
            console.error("Erro ao adicionar agendamento à rota:", err);
            return res.status(500).send('Erro ao adicionar agendamento à rota');
        }

        res.redirect(`/rotaEditar/${cd_rota}`);
    });
}

function excluirPontoColeta(req, res) {
    console.log('Iniciando exclusão...'); // Log 1
    console.log('Params recebidos:', req.params); // Log 2
    
    const id = req.params.id;
    if (!id) {
        console.error('ID não recebido!'); // Log de erro
        return res.status(400).send('ID do ponto é obrigatório.');
    }

    console.log('ID do ponto a excluir:', id); // Log 3

    const sqlBusca = `SELECT ie_rota FROM pontos_coleta WHERE cd_ponto_coleta = ?`;
    console.log('SQL Busca:', sqlBusca); // Log 4

    conectiondb().query(sqlBusca, [id], (err, resultado) => {
        if (err) {
            console.error('Erro na busca:', err); // Log erro
            return res.status(500).json({ error: 'Erro ao buscar ponto.' });
        }

        console.log('Resultado da busca:', resultado); // Log 5

        if (resultado.length === 0) {
            console.warn('Ponto não encontrado para ID:', id); // Log aviso
            return res.status(404).json({ error: 'Ponto não encontrado.' });
        }

        const cd_rota = resultado[0].ie_rota;
        console.log('Rota encontrada:', cd_rota); // Log 6

        const sqlDelete = `DELETE FROM pontos_coleta WHERE cd_ponto_coleta = ?`;
        console.log('SQL Delete:', sqlDelete); // Log 7

        conectiondb().query(sqlDelete, [id], (err2) => {
            if (err2) {
                console.error('Erro na exclusão:', err2); // Log erro
                return res.status(500).json({ error: 'Erro ao excluir ponto.' });
            }

            console.log('Ponto excluído com sucesso!'); // Log sucesso
            return res.json({ 
                success: true,
                redirectUrl: `/rotaEditar/${cd_rota}`
            });
        });
    });
}


module.exports = {
    exibirrotaeditar,
    editarRota,
    buscarAgendamento,
    adicionarAgendamentoNaRota,
    excluirPontoColeta
}