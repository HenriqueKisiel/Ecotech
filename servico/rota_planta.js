const db = require('../bd/conexao_mysql.js')();

// Função para exibir a página de cadastro da planta
function exibirPlanta(req, res) {
    res.render('planta', {
        title: 'Cadastro de Planta de Reciclagem'
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

    // Verificar se todos os campos obrigatórios estão preenchidos
    if (!nm_planta || !qt_area_total_m2 || !ds_endereco || !cd_bairro || !cd_cidade || !nr_cep) {
        return res.status(400).send("Todos os campos obrigatórios devem ser preenchidos.");
    }

    // Validar se as quantidades são números válidos e positivos
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

    // Validação dos campos obrigatórios e dados
    if (validarCampos(req, res) !== true) return;

    // Garantir que a situação será "A" se marcada, ou "I" caso contrário
    ie_situacao = ie_situacao === "A" ? "A" : "I";

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

// Exportando as funções para uso nas rotas
module.exports = {
    exibirPlanta: exibirPlanta,
    cadastrarPlanta: cadastrarPlanta
};
