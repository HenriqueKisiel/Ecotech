// Importa a função de conexão com o banco de dados MySQL
const conectiondb = require('../bd/conexao_mysql.js');

// Renderiza a tela movimentacoes com as plantas carregadas
function exibirmovimentacoes(req, res) {
    const conexao = conectiondb();
    const query = "SELECT cd_planta, nm_planta FROM planta WHERE ie_situacao = 'A'";

    conexao.query(query, (err, results) => {
        if (err) {
            // Se der erro, exibe mensagem e retorna página vazia
            console.error('Erro ao buscar plantas:', err);
            return res.render('movimentacoes', {
                resultados: [],
                message: 'Erro ao carregar plantas.',
                plantas: []
            });
        }

        // Se sucesso, renderiza a página com as plantas carregadas
        return res.render('movimentacoes', {
            resultados: [],
            message: '',
            plantas: results
        });
    });
}

// Obtém estoques de uma planta
function obterEstoquesPorPlanta(req, res) {
    const cd_planta = req.params.cd_planta;
    const conexao = conectiondb();
    const query = 'SELECT cd_estoque, nm_estoque FROM estoque WHERE cd_planta = ?';

    conexao.query(query, [cd_planta], (err, results) => {
        if (err) {
            // Se der erro, retorna erro para o frontend
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
        // Se sucesso, retorna os estoques encontrados
        return res.json(results);
    });
}

// Obtém materiais filtrando por estoque e tipo de movimentacao
function obterMateriaisPorEstoque(req, res) {
    const estoqueId = req.params.estoqueId;
    const movimentacao = req.params.movimentacao;
    const conexao = conectiondb();

    // Validação: estoqueId deve ser informado
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

    // Só existem as opções 'saida' ou 'venda' para esse endpoint
    const query = `
        SELECT m.cd_material, m.ds_material
        FROM materiais m
        INNER JOIN estoque_material em ON m.cd_material = em.cd_material
        WHERE em.cd_estoque = ?
        ORDER BY m.ds_material ASC
    `;
    const params = [estoqueId];

    // Executa a query com os parâmetros
    conexao.query(query, params, (err, results) => {
        if (err) {
            // Se der erro, retorna erro para o frontend
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
        // Se sucesso, retorna os materiais encontrados
        res.json(results);
    });
}

// Obtém todos os materiais (entrada)
function obterTodosMateriais(req, res) {
    const conexao = conectiondb();
    // Só permite materiais com ie_linha = 5 para entrada
    const query = 'SELECT cd_material, ds_material FROM materiais WHERE ie_linha = 5 ORDER BY ds_material ASC';

    conexao.query(query, (err, results) => {
        if (err) {
            // Se der erro, retorna erro para o frontend
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
        // Se sucesso, retorna todos os materiais permitidos
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
            // Se der erro, retorna erro para o frontend
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
        // Retorna o resultado (ou objeto vazio)
        res.json(results[0] || {});
    });
}

// Buscar dados do material para entrada (traz 0 se não existir no estoque)
function obterDadosMaterialEntrada(req, res) {
    const cd_estoque = req.params.cd_estoque;
    const cd_material = req.params.cd_material;
    const conexao = conectiondb();

    // Query para buscar dados do material, mesmo que não exista no estoque
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
            // Se der erro, retorna erro para o frontend
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
        // Retorna o resultado (ou objeto vazio)
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
        // Retorna o valor encontrado ou 0
        res.json({ valorPorKg: results[0]?.vl_valor_por_kg || 0 });
    });
}

// Atualiza o estoque de um material
function atualizarEstoqueMaterial(req, res) {
    // Extrai os dados do corpo da requisição
    const {
        cd_estoque, cd_material, qt_volume, qt_peso, movimentacao,
        ds_motivo, cd_pessoa_fisica, cd_pessoa_juridica, vl_valor_por_kg
    } = req.body;
    const conexao = conectiondb();

    // --- Validações ---
    // Converte volume e peso para número (sem arredondar)
    const volume = Number(qt_volume);
    const peso = Number(qt_peso);

    // Validação do motivo (apenas para entrada e saída)
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

    // Função interna para registrar a movimentação na tabela de movimentações
    function registrarMovimentacao() {

        let valorParaRegistrar = vl_valor_por_kg;
        if (movimentacao === 'venda') {
            valorParaRegistrar = (Number(peso) || 0) * (Number(vl_valor_por_kg) || 0);
        }

        // Query SQL para inserir a movimentação na tabela 'movimentacoes'
        const queryMov = `
        INSERT INTO movimentacoes (
            cd_estoque, cd_material, qt_volume, qt_peso, tipo_movimentacao,
            ds_motivo, cd_pessoa_fisica, cd_pessoa_juridica, vl_valor_por_kg, dt_movimentacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

        // Executa a query de inserção da movimentação no banco de dados
        conexao.query(
            queryMov,
            [
                cd_estoque,
                cd_material,
                Number(qt_volume),
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

    // Busca o material no estoque para decidir se é entrada, saída ou atualização
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
            // Não existe no estoque, então é ENTRADA de material novo
            novoVolume = volume;
            novoPeso = peso;

            // Busca o nome do material para inserir no estoque
            conexao.query(queryMaterial, [cd_material], (errMat, matResults) => {
                if (errMat || !matResults.length) {
                    // Erro ao buscar nome do material
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

                // Insere o novo material no estoque
                const queryInsert = `
                INSERT INTO estoque_material (cd_material, ds_material, cd_estoque, qt_volume, qt_peso)
                VALUES (?, ?, ?, ?, ?)
            `;
                conexao.query(queryInsert, [cd_material, ds_material, cd_estoque, novoVolume, Number(novoPeso)], (errIns) => {
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
                    // Registra a movimentação após inserir no estoque
                    registrarMovimentacao(novoPeso);
                    // Retorna sucesso para o frontend
                    res.json({
                        sucesso: true,
                        novoVolume: novoVolume,
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
            // Já existe no estoque, pode ser ENTRADA (soma) ou SAÍDA/VENDA (subtrai)
            const atual = results[0];
            let atualVolume = Number(atual.qt_volume) || 0;
            let atualPeso = Number(atual.qt_peso) || 0;

            if (movimentacao === 'entrada') {
                // Soma os valores ao estoque atual
                novoVolume = atualVolume + volume;
                novoPeso = atualPeso + peso;
            } else {
                // Subtrai os valores do estoque atual (saída ou venda)
                novoVolume = atualVolume - volume;
                novoPeso = atualPeso - peso;

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
                // Remove o material do estoque se zerou
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
                    // Registra a movimentação após excluir do estoque
                    registrarMovimentacao(novoPeso);
                    // Retorna sucesso para o frontend
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
                // Atualiza o estoque com os novos valores
                conexao.query(queryUpdate, [novoVolume, Number(novoPeso), cd_estoque, cd_material], (err2) => {
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
                    // Registra a movimentação após atualizar o estoque
                    registrarMovimentacao(novoPeso);
                    // Retorna sucesso para o frontend
                    res.json({
                        sucesso: true,
                        novoVolume: novoVolume,
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

// Exporta todas as funções para uso nas rotas do Express
module.exports = {
    exibirmovimentacoes,
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