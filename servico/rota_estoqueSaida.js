const conectiondb = require('../bd/conexao_mysql.js');

// Função utilitária para arredondar para 8 casas decimais
function round8(num) {
    return Number(Number(num).toFixed(8));
}

// Renderiza a tela estoqueSaida com as plantas carregadas
function exibirestoqueSaida(req, res) {
    const conexao = conectiondb();

    const query = 'SELECT cd_planta, nm_planta FROM planta';

    conexao.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar plantas:', err);
            return res.render('estoqueSaida', {
                resultados: [],
                message: 'Erro ao carregar plantas.',
                plantas: []
            });
        }

        return res.render('estoqueSaida', {
            resultados: [],
            message: '',
            plantas: results
        });
    });
}

// Obtém estoques de uma planta (por parâmetro cd_planta)
function obterEstoquesPorPlanta(req, res) {
    const cd_planta = req.params.cd_planta;
    const conexao = conectiondb();

    const query = 'SELECT cd_estoque, nm_estoque FROM estoque WHERE cd_planta = ?';

    conexao.query(query, [cd_planta], (err, results) => {
        if (err) {
            console.error('Erro ao buscar estoques:', err);
            return res.status(500).json({
                erro: 'Erro ao buscar estoques',
                script: `<script>
                    swal("Erro!", "Erro ao buscar estoques.", {
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
        return res.json(results);
    });
}

// Obtém materiais filtrando por estoqueId e tipo de movimentacao (entrada/saida/venda)
function obterMateriaisPorEstoque(req, res) {
    const estoqueId = req.params.estoqueId;
    const movimentacao = req.params.movimentacao; // entrada, saida ou venda

    const conexao = conectiondb();

    if (!estoqueId) {
        return res.status(400).json({
            erro: 'Estoque inválido',
            script: `<script>
                swal("Erro!", "Estoque inválido.", {
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

    let query = '';
    let params = [];

    if (movimentacao === 'entrada') {
        query = 'SELECT cd_material, ds_material FROM materiais ORDER BY ds_material ASC';
    } else if (movimentacao === 'saida' || movimentacao === 'venda') {
        query = `
            SELECT m.cd_material, m.ds_material
            FROM materiais m
            INNER JOIN estoque_material em ON m.cd_material = em.cd_material
            WHERE em.cd_estoque = ?
            ORDER BY m.ds_material ASC
        `;
        params = [estoqueId];
    } else {
        return res.status(400).json({
            erro: 'Movimentação inválida',
            script: `<script>
                swal("Erro!", "Movimentação inválida.", {
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

    conexao.query(query, params, (err, results) => {
        if (err) {
            console.error('Erro ao buscar materiais:', err);
            return res.status(500).json({
                erro: 'Erro ao buscar materiais',
                script: `<script>
                    swal("Erro!", "Erro ao buscar materiais.", {
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
        res.json(results);
    });
}

// Obtém todos os materiais (sem filtro)
function obterTodosMateriais(req, res) {
    const conexao = conectiondb();
    const query = 'SELECT cd_material, ds_material FROM materiais ORDER BY ds_material ASC';

    conexao.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar todos os materiais:', err);
            return res.status(500).json({
                erro: 'Erro ao buscar materiais',
                script: `<script>
                    swal("Erro!", "Erro ao buscar materiais.", {
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
        res.json(results);
    });
}

// Buscar pessoas físicas
function obterPessoasFisicas(req, res) {
    const conexao = require('../bd/conexao_mysql.js')();
    const query = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica, nr_telefone_celular, ds_email, nr_cpf, nr_cep FROM pessoa_fisica';
    conexao.query(query, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
}

// Buscar pessoas jurídicas
function obterPessoasJuridicas(req, res) {
    const conexao = require('../bd/conexao_mysql.js')();
    const query = 'SELECT cd_pessoa_juridica, nm_fantasia, nr_telefone, ds_email, nr_cnpj, nr_cep FROM pessoa_juridica';
    conexao.query(query, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
}

// Buscar dados do material selecionado no estoque
function obterDadosMaterialEstoque(req, res) {
    const cd_estoque = req.params.cd_estoque;
    const cd_material = req.params.cd_material;
    const conexao = conectiondb();

    const query = `
    SELECT m.ds_material, em.qt_volume, em.qt_peso, m.volume_m3
    FROM estoque_material em
    INNER JOIN materiais m ON m.cd_material = em.cd_material
    WHERE em.cd_estoque = ? AND em.cd_material = ?
    LIMIT 1
    `;

    conexao.query(query, [cd_estoque, cd_material], (err, results) => {
        if (err) {
            console.error('Erro ao buscar dados do material:', err);
            return res.status(500).json({
                erro: 'Erro ao buscar dados do material',
                script: `<script>
                    swal("Erro!", "Erro ao buscar dados do material.", {
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
        // Retorne qt_volume já arredondado para 8 casas
        if (results[0]) {
            results[0].qt_volume = round8(results[0].qt_volume);
        }
        res.json(results[0] || {});
    });
}

// Buscar dados do material para entrada (traz 0 se não existir no estoque)
function obterDadosMaterialEntrada(req, res) {
    const cd_estoque = req.params.cd_estoque;
    const cd_material = req.params.cd_material;
    const conexao = conectiondb();

    const query = `
    SELECT m.ds_material,
           IFNULL(em.qt_volume, 0) as qt_volume,
           IFNULL(em.qt_peso, 0) as qt_peso,
           m.volume_m3
    FROM materiais m
    LEFT JOIN estoque_material em
        ON m.cd_material = em.cd_material AND em.cd_estoque = ?
    WHERE m.cd_material = ?
    LIMIT 1
    `;

    conexao.query(query, [cd_estoque, cd_material], (err, results) => {
        if (err) {
            console.error('Erro ao buscar dados do material:', err);
            return res.status(500).json({
                erro: 'Erro ao buscar dados do material',
                script: `<script>
                    swal("Erro!", "Erro ao buscar dados do material.", {
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
        if (results[0]) {
            results[0].qt_volume = round8(results[0].qt_volume);
        }
        res.json(results[0] || {});
    });
}

// Busca o valor por kg do material pela venda
function obterValorPorKgMaterial(req, res) {
    const cd_material = req.params.cd_material;
    const conexao = conectiondb();
    const query = 'SELECT vl_valor_por_kg FROM materiais WHERE cd_material = ? LIMIT 1';
    conexao.query(query, [cd_material], (err, results) => {
        if (err) return res.status(500).json({
            erro: 'Erro ao buscar valor por kg',
            script: `<script>
                swal("Erro!", "Erro ao buscar valor por kg.", {
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
        res.json({ valorPorKg: results[0]?.vl_valor_por_kg || 0 });
    });
}

// Atualiza o estoque de um material
function atualizarEstoqueMaterial(req, res) {
    const {
        cd_estoque, cd_material, qt_volume, qt_peso, movimentacao,
        ds_motivo, cd_pessoa_fisica, cd_pessoa_juridica, vl_valor_por_kg
    } = req.body;
    const conexao = conectiondb();

    // --- Validações ---
    const volume = round8(Number(qt_volume));
    const peso = Number(qt_peso);

    // Validação do motivo
    if (movimentacao === 'saida' || movimentacao === 'entrada') {
        const motivo = (ds_motivo || '').trim();

        // Não permite motivo vazio
        if (!motivo) {
            return res.status(400).json({
                erro: 'Informe o motivo da movimentação.',
                script: `<script>
                    swal("Erro ao registrar!", "Informe o motivo da movimentação.", {
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

        // Não permite espaço duplo
        if (/\s{2,}/.test(motivo)) {
            return res.status(400).json({
                erro: 'O motivo não pode conter espaços duplos.',
                script: `<script>
                    swal("Erro ao registrar!", "O motivo não pode conter espaços duplos.", {
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

        // Não permite caracteres especiais (só letras, números e espaços)
        if (/[^a-zA-ZÀ-ÿ0-9\s]/.test(motivo)) {
            return res.status(400).json({
                erro: 'O motivo só pode conter letras e números.',
                script: `<script>
                    swal("Erro ao registrar!", "O motivo só pode conter letras e números.", {
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

        // Não permite somente números
        if (/^[0-9\s]+$/.test(motivo)) {
            return res.status(400).json({
                erro: 'O motivo não pode ser composto apenas por números.',
                script: `<script>
                    swal("Erro ao registrar!", "O motivo não pode ser composto apenas por números.", {
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

        // Deve ter pelo menos 10 caracteres (mensagem amigável)
        if (motivo.length < 10) {
            return res.status(400).json({
                erro: 'O motivo informado está muito curto. Descreva melhor o motivo da movimentação.',
                script: `<script>
                    swal("Erro ao registrar!", "O motivo informado está muito curto. Descreva melhor o motivo da movimentação.", {
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
    }

    // Não permitir registrar se peso for vazio, zero ou negativo
    if (!peso || isNaN(peso) || peso <= 0) {
        return res.status(400).json({
            erro: 'Informe um valor de peso válido para movimentar.',
            script: `<script>
            swal("Erro ao registrar!", "Informe um valor de peso válido para movimentar.", {
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

    // Validação matemática para até 3 casas decimais no peso
    let pesoStr = String(qt_peso).replace(/,/g, '.');

    // Remove ponto final, ex: "10." ou "10,"
    if (pesoStr.endsWith('.') || pesoStr.endsWith(',')) {
        pesoStr = pesoStr.slice(0, -1);
    }

    let pesoNum = Number(pesoStr);

    if (isNaN(pesoNum)) {
        return res.status(400).json({
            erro: 'O valor de peso informado é inválido.',
            script: `<script>
            swal("Erro ao registrar!", "O valor de peso informado é inválido.", {
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

    // Aceita: 10, 10.0, 10., 10,123, 10.123, 10, 10,0
    // Bloqueia: 10.1234, 10,1234
    const partes = pesoStr.split('.');
    if (partes.length === 2 && partes[1].length > 3) {
        return res.status(400).json({
            erro: 'O valor de peso só pode ter até 3 casas decimais.',
            script: `<script>
            swal("Erro ao registrar!", "O valor de peso só pode ter até 3 casas decimais.", {
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

    // Venda: só pode registrar se peso for maior que zero
    if (movimentacao === 'venda' && peso <= 0) {
        return res.status(400).json({
            erro: 'Para venda, informe um valor maior que zero em peso.',
            script: `<script>
                swal("Erro ao registrar!", "Para venda, informe um valor maior que zero em peso.", {
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

    // Comprador obrigatório para venda
    if (movimentacao === 'venda' && (!cd_pessoa_fisica && !cd_pessoa_juridica)) {
        return res.status(400).json({
            erro: 'Selecione o comprador.',
            script: `<script>
                swal("Erro ao registrar!", "Selecione o comprador.", {
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

    // --- Fim das validações iniciais ---

    // Query para buscar o material no estoque
    const queryBusca = `
        SELECT qt_volume, qt_peso 
        FROM estoque_material 
        WHERE cd_estoque = ? AND cd_material = ?
    `;

    // Query para buscar o nome do material
    const queryMaterial = `
        SELECT ds_material FROM materiais WHERE cd_material = ? LIMIT 1
    `;

    // Query para atualizar estoque
    const queryUpdate = `
        UPDATE estoque_material
        SET qt_volume = ?, qt_peso = ?
        WHERE cd_estoque = ? AND cd_material = ?
    `;

    // Query para deletar do estoque
    const queryDelete = `
        DELETE FROM estoque_material
        WHERE cd_estoque = ? AND cd_material = ?
    `;

    function registrarMovimentacao(novoPesoParaVenda) {
        // Corrigido: grava o valor total da venda em vl_valor_por_kg se for venda
        let valorParaRegistrar = vl_valor_por_kg;
        if (movimentacao === 'venda') {
            valorParaRegistrar = (Number(novoPesoParaVenda) || 0) * (Number(vl_valor_por_kg) || 0);
        }

        const queryMov = `
            INSERT INTO movimentacoes (
                cd_estoque, cd_material, qt_volume, qt_peso, tipo_movimentacao,
                ds_motivo, cd_pessoa_fisica, cd_pessoa_juridica, vl_valor_por_kg, dt_movimentacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        conexao.query(
            queryMov,
            [
                cd_estoque,
                cd_material,
                round8(qt_volume),
                Number(qt_peso),
                movimentacao,
                ds_motivo || null,
                cd_pessoa_fisica || null,
                cd_pessoa_juridica || null,
                valorParaRegistrar || null
            ],
            (errMov) => {
                if (errMov) console.error('Erro ao registrar movimentação:', errMov);
            }
        );
    }

    conexao.query(queryBusca, [cd_estoque, cd_material], (err, results) => {
        if (err) return res.status(500).json({
            erro: 'Erro ao buscar estoque',
            script: `<script>
                swal("Erro!", "Erro ao buscar estoque.", {
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

        let novoVolume = 0;
        let novoPeso = 0;

        if (!results.length) {
            // Não existe no estoque, então é entrada
            novoVolume = volume;
            novoPeso = peso;

            // Não precisa validar estoque negativo aqui, pois é entrada

            conexao.query(queryMaterial, [cd_material], (errMat, matResults) => {
                if (errMat || !matResults.length) {
                    return res.status(500).json({
                        erro: 'Erro ao buscar nome do material',
                        script: `<script>
                            swal("Erro!", "Erro ao buscar nome do material.", {
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
                const ds_material = matResults[0].ds_material;

                const queryInsert = `
                    INSERT INTO estoque_material (cd_material, ds_material, cd_estoque, qt_volume, qt_peso)
                    VALUES (?, ?, ?, ?, ?)
                `;
                conexao.query(queryInsert, [cd_material, ds_material, cd_estoque, round8(novoVolume), Number(novoPeso)], (errIns) => {
                    if (errIns) return res.status(500).json({
                        erro: 'Erro ao inserir material no estoque',
                        script: `<script>
                            swal("Erro!", "Erro ao inserir material no estoque.", {
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
                    registrarMovimentacao(novoPeso);
                    res.json({
                        sucesso: true,
                        novoVolume: round8(novoVolume),
                        novoPeso: Number(novoPeso),
                        script: `
                            <script>
                                swal({
                                    title: "Movimentação registrada!",
                                    text: "A movimentação foi registrada com sucesso!",
                                    icon: "success",
                                    buttons: {
                                        confirm: {
                                            text: "OK",
                                            value: true,
                                            visible: true,
                                            className: "btn btn-success",
                                            closeModal: true
                                        }
                                    }
                                });
                            </script>
                        `
                    });
                });
            });
        } else {
            // Já existe no estoque
            const atual = results[0];
            let atualVolume = round8(Number(atual.qt_volume) || 0);
            let atualPeso = Number(atual.qt_peso) || 0;

            if (movimentacao === 'entrada') {
                novoVolume = round8(atualVolume + volume);
                novoPeso = Number((atualPeso + peso).toFixed(3));
            } else {
                novoVolume = round8(atualVolume - volume);
                novoPeso = Number((atualPeso - peso).toFixed(3));

                // Não permitir estoque negativo
                if (novoVolume < 0 || novoPeso < 0) {
                    return res.status(400).json({
                        erro: 'Movimentação deixaria o estoque negativo.',
                        script: `<script>
                            swal("Erro ao registrar!", "Movimentação deixaria o estoque negativo.", {
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
            }

            // Permitir zerar estoque se ambos forem praticamente zero (tolerância)
            const epsilon = 0.00000001;
            if (Math.abs(novoVolume) < epsilon && Math.abs(novoPeso) < 0.001) {
                // Remove do estoque
                conexao.query(queryDelete, [cd_estoque, cd_material], (errDel) => {
                    if (errDel) return res.status(500).json({
                        erro: 'Erro ao excluir material do estoque',
                        script: `<script>
                            swal("Erro!", "Erro ao excluir material do estoque.", {
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
                    registrarMovimentacao(novoPeso);
                    res.json({
                        sucesso: true,
                        excluido: true,
                        novoVolume: 0,
                        novoPeso: 0,
                        script: `
                            <script>
                                swal({
                                    title: "Movimentação registrada!",
                                    text: "A movimentação foi registrada com sucesso!",
                                    icon: "success",
                                    buttons: {
                                        confirm: {
                                            text: "OK",
                                            value: true,
                                            visible: true,
                                            className: "btn btn-success",
                                            closeModal: true
                                        }
                                    }
                                });
                            </script>
                        `
                    });
                });
            } else {
                // Atualiza estoque
                conexao.query(queryUpdate, [round8(novoVolume), Number(novoPeso), cd_estoque, cd_material], (err2) => {
                    if (err2) return res.status(500).json({
                        erro: 'Erro ao atualizar estoque',
                        script: `<script>
                            swal("Erro!", "Erro ao atualizar estoque.", {
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
                    registrarMovimentacao(novoPeso);
                    res.json({
                        sucesso: true,
                        novoVolume: round8(novoVolume),
                        novoPeso: Number(novoPeso),
                        script: `
                            <script>
                                swal({
                                    title: "Movimentação registrada!",
                                    text: "A movimentação foi registrada com sucesso!",
                                    icon: "success",
                                    buttons: {
                                        confirm: {
                                            text: "OK",
                                            value: true,
                                            visible: true,
                                            className: "btn btn-success",
                                            closeModal: true
                                        }
                                    }
                                });
                            </script>
                        `
                    });
                });
            }
        }
    });
}

module.exports = {
    exibirestoqueSaida,
    obterEstoquesPorPlanta,
    obterMateriaisPorEstoque,
    obterTodosMateriais,
    obterPessoasFisicas,
    obterPessoasJuridicas,
    obterDadosMaterialEstoque,
    obterDadosMaterialEntrada,
    atualizarEstoqueMaterial,
    obterValorPorKgMaterial,
};