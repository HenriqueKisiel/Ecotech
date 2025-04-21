const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina rotas programadas
function exibirRotas(req, res) {
    res.render('rotas');
};

//Função para pagina atualizar Rotas
function exibirAtualizarRotas(req, res) {
    res.render('rotasAtualizar');
};

//Função para pagina de cadastrar rotas
function exibirCadastrarRotas(req, res) {
    res.render('rotasCadastrar');
};

// Função cadastrar Rota
function insertRota(req, res){
    const{
        nomeRota,
        dataAgendaRota,
        pesoTotalRota,
        quilometroTotalRota
    } = req.body;

    const sql = `
    INSERT INTO rota_coleta
    (nm_rota, dt_agendada, nr_distancia_km, qt_peso_total_kg) VALUES (?, ?, ?, ?)
    `;

    const values = [
        nomeRota,
        dataAgendaRota,
        pesoTotalRota,
        quilometroTotalRota
    ];

    conectiondb().query(sql, values, (error, results) => {
        if (error) {
            console.error('Erro ao cadastrar Rota:', error);
            res.render('RotaCadastro', {
                script: ` <script>
          swal("Erro ao cadastrar!", "Verifique os dados e tente novamente.", {
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
        } else {
            res.render('RotaCadastro', {
                script: `
                  <script>
                    swal({
                      title: "Cadastro realizado!",
                      text: "Rota cadastrada com sucesso!",
                      icon: "success",
                      buttons: {
                        confirm: {
                          text: "OK",
                          className: "btn btn-success",
                          closeModal: true
                        }
                      }
                    }).then(() => {
                      document.getElementById('formRotaCadastro').reset();
                    });
                  </script>
                `
              });              
        }
    });
}

//exportando a função 
module.exports = {
    exibirRotas,
    exibirAtualizarRotas,
    exibirCadastrarRotas,
    insertRota
}