const conectiondb = require('../bd/conexao_mysql.js');

// Função para abrir a página de edição de planta
function exibirPlantaEditar(req, res) {
    let sql = 'SELECT * FROM planta WHERE cd_planta = ?';

    conectiondb().query(sql, [req.params.cd_planta], function (erro, retorno) {
        if (erro) throw erro;

        if (retorno.length === 0) {
            return res.status(404).send('Planta não encontrada.');
        }

        res.render('plantaEditar', { planta: retorno[0] });
    });
}

// Função para processar a edição da planta (salvar no banco)
function editarPlanta(req, res) {
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

    const sql = `
        UPDATE planta SET 
            nm_planta = ?, 
            qt_area_total_m2 = ?, 
            qt_capacidade_total_kg = ?, 
            qt_capacidade_atual_kg = ?, 
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
        ds_endereco,
        nr_cep,
        cd_cidade,
        cd_bairro,
        codigo
    ];

    conectiondb().query(sql, valores, function (erro, resultado) {
        if (erro) {
            console.error('Erro ao atualizar planta:', erro);
            return res.status(500).send('Erro ao atualizar planta.');
        }

        // Renderiza a mesma tela com alerta de sucesso
        res.render('plantaEditar', {
            planta: {
                nm_planta,
                qt_area_total_m2,
                qt_capacidade_total_kg,
                qt_capacidade_atual_kg,
                ds_endereco,
                nr_cep,
                cd_cidade,
                cd_bairro,
                codigo
            },
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
}


module.exports = {
    exibirPlantaEditar,
    editarPlanta
};
