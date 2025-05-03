const conectiondb = require('../bd/conexao_mysql.js');
// conexão com o banco de dados para exibir a pagina e os dados no frontend
function exibirrotaeditar(req, res) {
    let sql = `SELECT cd_rota, nm_rota, nr_distancia_km, qt_peso_total_kg, DATE_FORMAT(dt_agendada, '%d/%m/%Y') AS dt_agendada  FROM rota_coleta
                WHERE cd_rota = ?`;

    //Executando a consulta no banco de dados
    conectiondb().query(sql,[req.params.cd_rota],function (erro, retorno) {
        if (erro) throw erro;

        res.render('rotaEditar', { rotas: retorno[0] });
    });
}

//Função para editar Rota
function editarRota(req, res){
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

    console.log('Rota atualizado com sucesso!');
    return res.render('rotaEditar', {
        rota: {
            cd_rota,
            nm_rota,
            dt_agendada
        },
        script: `  <script>
      swal({
        title: "Realizado Edição!",
        text: "Usuário '${{nm_rota}}' editado com sucesso!",
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
    </script>`
    });
});
}

// Função Select de Agendamentos
function buscarAgendamento(req, res) {
    const sql = 'SELECT cd_agendamento, nm_agendamento, ds_endereco, qt_quantidade_prevista_kg FROM agendamento';
    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar Agendamentos:', erro);
            return res.status(500).send('Erro ao buscar Agendamentos.');
        }
        res.json(resultados);
    });
}



module.exports = {
    exibirrotaeditar,
    editarRota,
    buscarAgendamento
}