const conectiondb = require('../bd/conexao_mysql.js');
// conexão com o banco de dados para exibir a pagina e os dados no frontend
function exibirrotaeditar(req, res) {
    const cd_rota = req.params.cd_rota;

    const connection = conectiondb();

    const query1 = `
        SELECT cd_rota, nm_rota, nr_distancia_km, qt_peso_total_kg, 
               DATE_FORMAT(dt_agendada, '%d/%m/%Y') AS dt_agendada  
        FROM rota_coleta WHERE cd_rota = ?`;

    const query2 = `SELECT * FROM vw_pontos_coleta WHERE cd_rota = ?`;

    connection.query(query1, [cd_rota], function (erro1, resultado1) {
        if (erro1) throw erro1;

        connection.query(query2, [cd_rota], function (erro2, resultado2) {
            if (erro2) throw erro2;

            res.render('rotaEditar', {
                rotas: resultado1[0],
                pontos: resultado2
            });
        });
    });
}


//Função para editar Rota
function editarRota(req, res) {
    // Obter dados do formulário
    const cd_rota = req.body.codigo;
    const nm_rota = req.body.nome;
    const dt_agendada = req.body.data;

    if (!cd_rota) {
        return res.status(400).send('ID da rota é obrigatório.');
    }


    // Atualizar a tabela Usuario
    const sqlrota = `
    UPDATE rota_coleta 
    SET nm_rota = ?, dt_agendada = ?
    WHERE cd_rota = ?`;

    conectiondb().query(sqlrota, [nm_rota, dt_agendada, cd_rota], function (errorota) {
        if (errorota) {
            console.error('Erro ao atualizar Rota:', errorota);
            return res.render('rotaEditar', {
                rota: {
                    cd_rota,
                    nm_rota,
                    dt_agendada
                },
                script: ` <script>
        swal("Erro ao editar!", "Verifique os dados e tente novamente.", {
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

        res.redirect(`/rotaEditar/${cd_rota}`);

    });
}

// Função Select de Agendamentos
function buscarAgendamento(req, res) {
    const sql = 'SELECT cd_agendamento, nm_agendamento, ds_endereco, qt_quantidade_prevista_kg,status FROM agendamento WHERE status = "ativo" ';
    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar Agendamentos:', erro);
            return res.status(500).send('Erro ao buscar Agendamentos.');
        }
        res.json(resultados);
    });
}

// Adiciona um novo item ao agendamento
function adicionarAgendamentoNaRota(req, res) {
    const { cd_agendamento, agendamento } = req.body;          // vem do formulário
    const { cd_rota } = req.params;               // vem da URL

    const connection = conectiondb();

    const query = `
        INSERT INTO pontos_coleta (cd_ponto_coleta,ie_rota,nm_ponto,ds_endereco,cd_bairro,cd_cidade,nr_cep, cd_planta, cd_agendamento)
        VALUES (NULL,?,'','','','','',NULL,?)
    `;

    connection.query(query, [cd_rota, agendamento, cd_agendamento], (err, result) => {
        if (err) {
            console.error("Erro ao adicionar agendamento à rota:", err);
            return res.status(500).send('Erro ao adicionar agendamento à rota');
        }

        res.redirect(`/rotaEditar/${cd_rota}`);
    });
}




module.exports = {
    exibirrotaeditar,
    editarRota,
    buscarAgendamento,
    adicionarAgendamentoNaRota
}