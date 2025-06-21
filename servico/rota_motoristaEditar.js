const conectiondb = require('../bd/conexao_mysql.js');

function exibirEditarMotorista(req, res) {
    const connection = conectiondb();
    const { id_motorista } = req.params;
    const query = 'SELECT * FROM motorista WHERE id_motorista = ?';

    connection.query(query, [id_motorista], (erro, resultado) => {
        if (erro) {
            console.log('Erro ao buscar motorista:', erro);
            return res.status(500).send('Erro no servidor');
        }

        if (resultado.length === 0) {
            return res.status(404).send('Motorista não encontrado');
        }

        const motorista = resultado[0];

        // ✅ Formata a data para o formato YYYY-MM-DD
        if (motorista.vencimento_cnh) {
            const data = new Date(motorista.vencimento_cnh);
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const dia = String(data.getDate()).padStart(2, '0');
            motorista.vencimento_cnh = `${ano}-${mes}-${dia}`;
        }

        res.render('motoristaEditar', { 
            usuario: req.session.usuario,
            motorista, 
            sucesso: req.query.sucesso 
        });
    });
}


// NOVA FUNÇÃO PARA EDITAR MOTORISTA
function editarMotorista(req, res) {
    const connection = conectiondb();
    const { id_motorista, categoria_cnh, dataVenc, situacao } = req.body;
    const situacaoFinal = situacao === 'A' ? 'A' : 'I';

    // Primeiro busca a data atual do banco, caso o campo venha vazio
    const queryBusca = 'SELECT vencimento_cnh FROM motorista WHERE id_motorista = ?';
    connection.query(queryBusca, [id_motorista], (erroBusca, resultadoBusca) => {
        if (erroBusca) {
            console.log('Erro ao buscar motorista:', erroBusca);
            return res.status(500).send('Erro no servidor');
        }

        const vencimentoFinal = dataVenc || resultadoBusca[0].vencimento_cnh;

        const query = `
            UPDATE motorista 
            SET categoria_cnh = ?, vencimento_cnh = ?, situacao = ?
            WHERE id_motorista = ?
        `;
        connection.query(
            query,
            [categoria_cnh, vencimentoFinal, situacaoFinal, id_motorista],
            (erro, resultado) => {
                if (erro) {
                    console.log('Erro ao editar motorista:', erro);
                    return res.status(500).send('Erro ao editar motorista');
                }

                connection.query('SELECT * FROM motorista WHERE id_motorista = ?', [id_motorista], (erro2, resultado2) => {
                    if (erro2) {
                        console.log('Erro ao buscar motorista:', erro2);
                        return res.status(500).send('Erro no servidor');
                    }

                    // Formata novamente a data para exibir
                    const motorista = resultado2[0];
                    if (motorista.vencimento_cnh) {
                        const data = new Date(motorista.vencimento_cnh);
                        const ano = data.getFullYear();
                        const mes = String(data.getMonth() + 1).padStart(2, '0');
                        const dia = String(data.getDate()).padStart(2, '0');
                        motorista.vencimento_cnh = `${ano}-${mes}-${dia}`;
                    }

                    res.render('motoristaEditar', {
                        usuario: req.session.usuario,
                        motorista,
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
                                window.location.href = "/motoristaEditar/${id_motorista}";
                            });
                        </script>`
                    });
                });
            }
        );
    });
}


module.exports = {
    exibirEditarMotorista,
    editarMotorista
};
