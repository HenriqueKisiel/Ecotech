const db = require('../bd/conexao_mysql.js')();

// Função para exibir a página de cadastro da planta
function exibirPlanta(req, res) {
    const sql = 'SELECT cd_cidade, nm_cidade FROM cidade ORDER BY nm_cidade';

    db.query(sql, function (err, resultados) {
        if (err) {
            console.error('Erro ao buscar cidades:', err);
            return res.status(500).send('Erro ao carregar cidades.');
        }

        res.render('planta', {
            title: 'Cadastro de Planta de Reciclagem',
            cidades: resultados
        });
    });
}

// Função para buscar bairros de uma cidade específica
function buscarBairrosPorCidade(req, res) {
    const cd_cidade = req.params.cd_cidade;

    if (!cd_cidade) {
        return res.status(400).json({ error: 'ID da cidade não informado.' });
    }

    const sql = 'SELECT cd_bairro, nm_bairro FROM bairro WHERE cd_cidade = ? ORDER BY nm_bairro';

    db.query(sql, [cd_cidade], function (err, resultados) {
        if (err) {
            console.error('Erro ao buscar bairros:', err);
            return res.status(500).json({ error: 'Erro ao buscar bairros.' });
        }

        res.json(resultados);
    });
}

// Função para validar campos obrigatórios
function validarCampos(req, res) {
    const {
        nm_planta,
        qt_area_total_m2,
        qt_capacidade_total_kg,
        ds_endereco,
        cd_bairro,
        cd_cidade,
        nr_cep
    } = req.body;

    if (!nm_planta || !qt_area_total_m2 || !ds_endereco || !cd_bairro || !cd_cidade || !nr_cep) {
        return res.status(400).send("Todos os campos obrigatórios devem ser preenchidos.");
    }

    if (isNaN(qt_area_total_m2) || qt_area_total_m2 <= 0) {
        return res.status(400).send("A área total deve ser um número positivo.");
    }

    if (qt_capacidade_total_kg && (isNaN(qt_capacidade_total_kg) || qt_capacidade_total_kg <= 0)) {
        return res.status(400).send("A capacidade total deve ser um número positivo.");
    }

    return true;
}

// Função para cadastrar uma nova planta no banco de dados
function cadastrarPlanta(req, res) {
    let {
        nm_planta,
        qt_area_total_m2,
        qt_capacidade_total_kg,
        qt_capacidade_atual_kg,
        ie_situacao,
        ds_endereco,
        cd_bairro,
        cd_cidade,
        nr_cep
    } = req.body;

    qt_capacidade_atual_kg = qt_capacidade_total_kg;
    
    if (validarCampos(req, res) !== true) return;

    ie_situacao = Array.isArray(ie_situacao) ? ie_situacao[ie_situacao.length - 1] : ie_situacao;
ie_situacao = (typeof ie_situacao === "string" && ie_situacao.trim().toUpperCase() === "A") ? "A" : "I";

    // Verificar e registrar o valor de ie_situacao antes de inserir no banco
    console.log("Valor de 'ie_situacao' antes da inserção no banco:", ie_situacao);

    const sql = `
        INSERT INTO planta (
            nm_planta,
            qt_area_total_m2,
            qt_capacidade_total_kg,
            qt_capacidade_atual_kg,
            ie_situacao,
            ds_endereco,
            cd_bairro,
            cd_cidade,
            nr_cep
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nm_planta,
        qt_area_total_m2,
        qt_capacidade_total_kg || null,
        qt_capacidade_atual_kg || null,
        ie_situacao,
        ds_endereco,
        cd_bairro,
        cd_cidade,
        nr_cep
    ];

    db.query(sql, valores, function (err, result) {
        if (err) {
            console.error('Erro ao cadastrar planta:', err);
            return res.status(500).send('Erro ao cadastrar planta.');
        }

        console.log('Planta cadastrada com sucesso!');

        res.render('planta', {
            planta: {
                nm_planta,
                qt_area_total_m2,
                qt_capacidade_total_kg,
                qt_capacidade_atual_kg,
                ie_situacao,
                ds_endereco,
                nr_cep,
                cd_cidade,
                cd_bairro
            },
            script: `
                <script>
                    swal({
                        title: "Cadastro realizado!",
                        text: "Planta cadastrada com sucesso!",
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

        console.log('Dados cadastrados:', {
            nm_planta,
            qt_area_total_m2,
            qt_capacidade_total_kg,
            qt_capacidade_atual_kg,
            ie_situacao,
            ds_endereco,
            cd_bairro,
            cd_cidade,
            nr_cep
        });
    });
}

module.exports = {
    exibirPlanta,
    cadastrarPlanta,
    buscarBairrosPorCidade
};
