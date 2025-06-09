const conectiondb = require('../bd/conexao_mysql.js');


function exibirCaminhaoEditar(req, res) {
    const connection = conectiondb();
    const { id_caminhao: id_caminhao } = req.params;
    const query = 'SELECT * FROM caminhao WHERE id_caminhao = ?';

    connection.query(query, [id_caminhao], (erro, resultado) => {
        if (erro) {
            console.log('Erro ao buscar caminhao:', erro);
            return res.status(500).send('Erro no servidor');
        }

        if (resultado.length === 0) {
            return res.status(404).send('Caminhao não encontrado');
        }

        const caminhao = resultado[0];

        res.render('caminhaoEditar', { 
            caminhao, 
            sucesso: req.query.sucesso 
        });
    });
}

function editarCaminhao(req, res) {
    const connection = conectiondb();
    const {
        id_caminhao,
        nm_modelo,
        tipo,
        placa,
        ano_fabricacao,
        capacidade_kg,
        capacidade_volume,
        situacao
    } = req.body;

    const situacaoFinal = situacao === 'A' ? 'A' : 'I';

    // Atualiza os dados do caminhão
    const query = `
        UPDATE caminhao
        SET nm_modelo = ?, tipo = ?, placa = ?, ano_fabricacao = ?, capacidade_kg = ?, capacidade_volume = ?, situacao = ?
        WHERE id_caminhao = ?
    `;
    connection.query(
        query,
        [nm_modelo, tipo, placa, ano_fabricacao, capacidade_kg, capacidade_volume, situacaoFinal, id_caminhao],
        (erro, resultado) => {
            if (erro) {
                console.log('Erro ao editar caminhão:', erro);
                return res.status(500).send('Erro ao editar caminhão');
            }

            // Busca novamente para exibir atualizado
            connection.query('SELECT * FROM caminhao WHERE id_caminhao = ?', [id_caminhao], (erro2, resultado2) => {
                if (erro2) {
                    console.log('Erro ao buscar caminhão:', erro2);
                    return res.status(500).send('Erro no servidor');
                }

                const caminhao = resultado2[0];

                res.render('caminhaoEditar', {
                    caminhao,
                    script: `<script>
                        swal("Editado com sucesso!", "", {
                            icon: "success",
                            buttons: {
                                confirm: {
                                    text: "OK",
                                    className: "btn btn-success",
                                },
                            },
                        }).then(() => {
                            window.location.href = "/caminhaoEditar/${id_caminhao}";
                        });
                    </script>`
                });
            });
        }
    );
}

module.exports = {
    exibirCaminhaoEditar,
    editarCaminhao
};