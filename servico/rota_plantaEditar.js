const conectiondb = require('../bd/conexao_mysql.js');

// Função para abrir a página de edição de planta
function exibirPlantaEditar(req, res) {
    const db = conectiondb();

    // Primeiro busca os dados da planta
    const sqlPlanta = 'SELECT * FROM planta WHERE cd_planta = ?';
    db.query(sqlPlanta, [req.params.cd_planta], function (erro, retornoPlanta) {
        if (erro) {
            console.error('Erro ao buscar planta:', erro);
            return res.status(500).send('Erro ao buscar planta.');
        }

        if (retornoPlanta.length === 0) {
            return res.status(404).send('Planta não encontrada.');
        }

        const planta = retornoPlanta[0];

        // Agora busca as cidades
        const sqlCidades = 'SELECT cd_cidade, nm_cidade FROM cidade ORDER BY nm_cidade';
        db.query(sqlCidades, function (erro, retornoCidades) {
            if (erro) {
                console.error('Erro ao buscar cidades:', erro);
                return res.status(500).send('Erro ao buscar cidades.');
            }

            // Busca os bairros da cidade da planta (se houver)
            const sqlBairros = 'SELECT cd_bairro, nm_bairro FROM bairro WHERE cd_cidade = ? ORDER BY nm_bairro';
            db.query(sqlBairros, [planta.cd_cidade], function (erro, retornoBairros) {
                if (erro) {
                    console.error('Erro ao buscar bairros:', erro);
                    return res.status(500).send('Erro ao buscar bairros.');
                }

                // Renderiza com planta, lista de cidades e bairros
                res.render('plantaEditar', {
                    planta,
                    cidades: retornoCidades,
                    bairros: retornoBairros
                });
            });
        });
    });
}

// Função para processar a edição da planta (salvar no banco)
function editarPlanta(req, res) {
    const db = conectiondb();

    const {
        codigo,
        nm_planta,
        qt_area_total_m2,
        qt_capacidade_total_kg,
        qt_capacidade_atual_kg,
        ds_endereco,
        nr_cep,
        cd_cidade,
        cd_bairro
    } = req.body;

    const situacao = req.body.ie_situacao === 'A' ? 'A' : 'I';

    const sql = `
        UPDATE planta SET 
            nm_planta = ?, 
            qt_area_total_m2 = ?, 
            qt_capacidade_total_kg = ?, 
            qt_capacidade_atual_kg = ?,
            ie_situacao = ?, 
            ds_endereco = ?, 
            nr_cep = ?, 
            cd_cidade = ?, 
            cd_bairro = ?
        WHERE cd_planta = ?
    `;

    const valores = [
        nm_planta,
        qt_area_total_m2,
        qt_capacidade_total_kg,
        qt_capacidade_atual_kg,
        situacao,
        ds_endereco,
        nr_cep,
        cd_cidade,
        cd_bairro,
        codigo
    ];

    db.query(sql, valores, function (erro) {
        if (erro) {
            console.error('Erro ao atualizar planta:', erro);
            return res.status(500).send('Erro ao atualizar planta.');
        }

        const sqlPlanta = 'SELECT * FROM planta WHERE cd_planta = ?';
        db.query(sqlPlanta, [codigo], function (erroPlanta, resultadoPlanta) {
            if (erroPlanta) {
                console.error('Erro ao buscar planta atualizada:', erroPlanta);
                return res.status(500).send('Erro ao buscar planta atualizada.');
            }

            const plantaAtualizada = resultadoPlanta[0];

            const sqlCidades = 'SELECT cd_cidade, nm_cidade FROM cidade ORDER BY nm_cidade';
            db.query(sqlCidades, function (erroCidades, cidades) {
                if (erroCidades) {
                    console.error('Erro ao buscar cidades:', erroCidades);
                    return res.status(500).send('Erro ao buscar cidades.');
                }

                const sqlBairros = 'SELECT cd_bairro, nm_bairro FROM bairro WHERE cd_cidade = ? ORDER BY nm_bairro';
                db.query(sqlBairros, [plantaAtualizada.cd_cidade], function (erroBairros, bairros) {
                    if (erroBairros) {
                        console.error('Erro ao buscar bairros:', erroBairros);
                        return res.status(500).send('Erro ao buscar bairros.');
                    }

                    res.render('plantaEditar', {
                        planta: plantaAtualizada,
                        cidades,
                        bairros,
                        script: `
                            <script>
                                swal({
                                    title: "Alteração realizada!",
                                    text: "Planta alterada com sucesso!",
                                    icon: "success",
                                    buttons: {
                                        confirm: {
                                            text: "OK",
                                            value: true,
                                            visible: true,
                                            className: "btn btn-success",
                                            closeModal: true,
                                        },
                                    },
                                });
                            </script>
                        `
                    });
                });
            });
        });
    });
}

// Função para buscar bairros dinamicamente via AJAX
function buscarBairrosPorCidade(req, res) {
    const db = conectiondb();
    const cd_cidade = req.params.cd_cidade;

    const sql = 'SELECT cd_bairro, nm_bairro FROM bairro WHERE cd_cidade = ? ORDER BY nm_bairro';
    db.query(sql, [cd_cidade], function (erro, bairros) {
        if (erro) {
            console.error('Erro ao buscar bairros:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar bairros.' });
        }

        res.json(bairros);
    });
}

module.exports = {
    exibirPlantaEditar,
    editarPlanta,
    buscarBairrosPorCidade
};
