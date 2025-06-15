const conectiondb = require('../bd/conexao_mysql.js');

// Função auxiliar para renderizar erro e recarregar plantas
function renderComErroEditar(message, conexao, res, estoque) {
    conexao.query('SELECT cd_planta, nm_planta FROM planta WHERE ie_situacao = "A"', (err, resultados) => {
        if (err) {
            return res.json({
                erro: 'Erro ao carregar plantas.',
                script: `<script>
                    swal("Erro!", "Erro ao carregar plantas.", {
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
        return res.json({
            erro: message,
            script: `<script>
                swal("Erro ao atualizar!", "${message}", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`,
            plantas: resultados,
            estoque
        });
    });
}

// Exibe o formulário de edição já preenchido
function exibirEstoqueEditar(req, res) {
    const conexao = conectiondb();
    const cd_estoque = req.params.cd_estoque;

    // Busca o estoque e as plantas ativas
    conexao.query('SELECT * FROM estoque WHERE cd_estoque = ?', [cd_estoque], (err, resultadosEstoque) => {
        if (err || resultadosEstoque.length === 0) {
            return res.render('estoqueEditar', { message: 'Estoque não encontrado.', plantas: [], estoque: null });
        }
        const estoque = resultadosEstoque[0];
        conexao.query('SELECT cd_planta, nm_planta FROM planta WHERE ie_situacao = "A"', (err2, resultadosPlantas) => {
            if (err2) {
                return res.render('estoqueEditar', { message: 'Erro ao carregar plantas.', plantas: [], estoque: null });
            }
            res.render('estoqueEditar', {
                message: '',
                plantas: resultadosPlantas,
                estoque
            });
        });
    });
}

// Atualiza o estoque no banco com todas as validações
function editarEstoque(req, res) {
    const conexao = conectiondb();
    let { cd_estoque, cd_planta, nm_estoque, qt_volume_total } = req.body;

    // Validação: estoque selecionado
    if (!cd_estoque || cd_estoque.trim() === "") {
        return renderComErroEditar('Estoque não informado!', conexao, res, req.body);
    }

    // Validação: planta selecionada
    if (!cd_planta || cd_planta.trim() === "") {
        return renderComErroEditar('Selecione uma planta!', conexao, res, req.body);
    }

    // Validação: nome do estoque obrigatório
    if (!nm_estoque || typeof nm_estoque !== 'string' || nm_estoque.trim() === "") {
        return renderComErroEditar('Informe o nome do estoque!', conexao, res, req.body);
    }

    // Validação: nome do estoque conforme regras
    const nomeValido =
        nm_estoque.trim().length >= 10 &&
        !/ {2,}/.test(nm_estoque) &&
        /^[A-Za-zÀ-ÿ0-9 ]+$/.test(nm_estoque) &&
        /[A-Za-zÀ-ÿ]/.test(nm_estoque) &&
        !/^[0-9 ]+$/.test(nm_estoque);

    if (!nomeValido) {
        return renderComErroEditar('Nome do estoque inválido! O nome deve ter pelo menos 10 caracteres, conter letras, pode ter números (mas não apenas números), não pode ter espaços duplos ou caracteres especiais.', conexao, res, req.body);
    }

    // Validação: capacidade máxima obrigatória
    if (!qt_volume_total || qt_volume_total.trim() === "") {
        return renderComErroEditar('Informe a capacidade máxima!', conexao, res, req.body);
    }

    // Troca vírgula por ponto para aceitar ambos os formatos
    if (qt_volume_total) {
        qt_volume_total = qt_volume_total.replace(',', '.');
    }

    // Validação: capacidade máxima (decimal positivo, até 15 dígitos, 8 casas decimais)
    const volumeValido =
        /^(\d{1,7}(\.\d{1,8})?|\d{8,15})$/.test(qt_volume_total) &&
        parseFloat(qt_volume_total) > 0;

    if (!volumeValido) {
        return renderComErroEditar('Capacidade máxima inválida! Informe um número positivo, com até 8 casas decimais.', conexao, res, req.body);
    }

    // Validação: não ultrapassar a capacidade máxima disponível da planta (descontando o próprio estoque)
    const queryCapacidade = `
        SELECT 
            p.qt_capacidade_total_volume AS volume_maximo_planta,
            IFNULL(SUM(e.qt_volume_total), 0) - (
                SELECT qt_volume_total FROM estoque WHERE cd_estoque = ?
            ) AS volume_estoques
        FROM planta p
        LEFT JOIN estoque e ON e.cd_planta = p.cd_planta
        WHERE p.cd_planta = ?
        GROUP BY p.qt_capacidade_total_volume
    `;

    conexao.query(queryCapacidade, [cd_estoque, cd_planta], (errCap, resultsCap) => {
        if (errCap || !resultsCap.length) {
            return renderComErroEditar('Erro ao validar capacidade da planta!', conexao, res, req.body);
        }
        const { volume_maximo_planta, volume_estoques } = resultsCap[0];
        const capacidade_disponivel = parseFloat(volume_maximo_planta) - parseFloat(volume_estoques);

        if (parseFloat(qt_volume_total) > capacidade_disponivel) {
            return renderComErroEditar(
                `Volume máximo do estoque ultrapassa o volume disponível da planta para cadastro de estoque.`,
                conexao,
                res,
                req.body
            );
        }

        // UPDATE estoque
        const query = `
            UPDATE estoque
            SET cd_planta = ?, nm_estoque = ?, qt_volume_total = ?, dt_atualizacao = NOW()
            WHERE cd_estoque = ?
        `;
        const valores = [cd_planta, nm_estoque, qt_volume_total, cd_estoque];

        conexao.query(query, valores, (err, result) => {
            if (err) {
                return renderComErroEditar('Erro ao atualizar o estoque.', conexao, res, req.body);
            }

            // Atualização realizada com sucesso
            return res.json({
                sucesso: true,
                script: `<script>
                            swal({
                                title: "Estoque atualizado!",
                                text: "Estoque atualizado com sucesso!",
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
                            }).then(() => {
                                location.reload();
                            });
                        </script>`
            });
        });
    });
}

module.exports = {
    exibirEstoqueEditar,
    editarEstoque
};