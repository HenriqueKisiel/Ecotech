const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a página de cadastro de estoque (GET)
function exibirestoque(req, res) {
    const conexao = conectiondb();

    // Carrega a lista de plantas ativas
    conexao.query('SELECT cd_planta, nm_planta FROM planta WHERE ie_situacao = "A"', (err, resultados) => {
        if (err) {
            console.error('Erro ao buscar plantas:', err);
            return res.render('estoque', { message: 'Erro ao carregar plantas.', plantas: [] });
        }

        // Exibe o formulário de cadastro de estoque com a lista de plantas
        return res.render('estoque', { message: '', plantas: resultados });
    });
}

// Função auxiliar para renderizar erro e recarregar plantas
function renderComErro(message, conexao, res) {
    conexao.query('SELECT cd_planta, nm_planta FROM planta WHERE ie_situacao = "A"', (err, resultados) => {
        if (err) {
            console.error('Erro ao buscar plantas:', err);
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
                swal("Erro ao cadastrar!", "${message}", {
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
    });
}

function cadastrarEstoque(req, res) {
    const conexao = conectiondb();
    let { cd_planta, nm_estoque, qt_volume_total } = req.body;

    // Validação: planta selecionada
    if (!cd_planta || cd_planta.trim() === "") {
        return renderComErro('Selecione uma planta!', conexao, res);
    }

    // Validação: nome do estoque obrigatório
    if (!nm_estoque || typeof nm_estoque !== 'string' || nm_estoque.trim() === "") {
        return renderComErro('Informe o nome do estoque!', conexao, res);
    }

    // Validação: nome do estoque conforme regras
    const nomeValido =
        nm_estoque.trim().length >= 10 &&
        !/ {2,}/.test(nm_estoque) &&
        /^[A-Za-zÀ-ÿ0-9 ]+$/.test(nm_estoque) &&
        /[A-Za-zÀ-ÿ]/.test(nm_estoque) &&
        !/^[0-9 ]+$/.test(nm_estoque);

    if (!nomeValido) {
        return renderComErro('Nome do estoque inválido! O nome deve ter pelo menos 10 caracteres, conter letras, pode ter números (mas não apenas números), não pode ter espaços duplos ou caracteres especiais.', conexao, res);
    }

    // Validação: capacidade máxima obrigatória
    if (!qt_volume_total || qt_volume_total.trim() === "") {
        return renderComErro('Informe a capacidade máxima!', conexao, res);
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
        return renderComErro('Capacidade máxima inválida! Informe um número positivo, com até 8 casas decimais.', conexao, res);
    }

    // Validação: não ultrapassar a capacidade máxima disponível da planta
    const queryCapacidade = `
        SELECT 
            p.qt_capacidade_total_volume AS volume_maximo_planta,
            IFNULL(SUM(e.qt_volume_total), 0) AS volume_estoques
        FROM planta p
        LEFT JOIN estoque e ON e.cd_planta = p.cd_planta
        WHERE p.cd_planta = ?
        GROUP BY p.qt_capacidade_total_volume
    `;

    conexao.query(queryCapacidade, [cd_planta], (errCap, resultsCap) => {
        if (errCap || !resultsCap.length) {
            return renderComErro('Erro ao validar capacidade da planta!', conexao, res);
        }
        const { volume_maximo_planta, volume_estoques } = resultsCap[0];
        const capacidade_disponivel = parseFloat(volume_maximo_planta) - parseFloat(volume_estoques);

        if (parseFloat(qt_volume_total) > capacidade_disponivel) {
            return renderComErro(
                `Volume máximo do estoque ultrapassa o volume disponível da planta para cadastro de estoque.`,
                conexao,
                res
            );
        }

        // Inserção do estoque no banco
        const query = `
            INSERT INTO estoque (cd_planta, nm_estoque, qt_volume_total, dt_atualizacao)
            VALUES (?, ?, ?, NOW())
        `;
        const valores = [cd_planta, nm_estoque, qt_volume_total];

        conexao.query(query, valores, (err, result) => {
            if (err) {
                return renderComErro('Erro ao cadastrar o estoque.', conexao, res);
            }

            // Cadastro realizado com sucesso
            return res.json({
                sucesso: true,
                codigoEstoque: result.insertId,
                script: `<script>
                    swal({
                        title: "Estoque cadastrado!",
                        text: "Estoque cadastrado com sucesso! Código gerado: ${result.insertId}",
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
                </script>`
            });
        });
    });
}

// Função para obter a capacidade máxima disponível de uma planta
function obterCapacidadeDisponivelPlanta(req, res) {
    const conexao = conectiondb();
    const cd_planta = req.params.cd_planta;

    // Consulta: volume máximo da planta e soma dos volumes dos estoques já cadastrados
    const query = `
        SELECT 
            p.qt_capacidade_total_volume AS volume_maximo_planta,
            IFNULL(SUM(e.qt_volume_total), 0) AS volume_estoques
        FROM planta p
        LEFT JOIN estoque e ON e.cd_planta = p.cd_planta
        WHERE p.cd_planta = ?
        GROUP BY p.qt_capacidade_total_volume
    `;

    conexao.query(query, [cd_planta], (err, results) => {
        if (err || !results.length) {
            return res.status(500).json({ erro: 'Erro ao buscar capacidade da planta.' });
        }
        const { volume_maximo_planta, volume_estoques } = results[0];
        const capacidade_disponivel = parseFloat(volume_maximo_planta) - parseFloat(volume_estoques);
        res.json({
            volume_maximo_planta: parseFloat(volume_maximo_planta),
            volume_estoques: parseFloat(volume_estoques),
            capacidade_disponivel: capacidade_disponivel > 0 ? capacidade_disponivel : 0
        });
    });
}

module.exports = {
    exibirestoque,
    cadastrarEstoque,
    obterCapacidadeDisponivelPlanta
};