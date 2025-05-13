const conectiondb = require('../bd/conexao_mysql.js');

//Função para exibir pagina rotas programadas
function exibirRotas(req, res) {
  let sql = `SELECT cd_rota, nm_rota, nr_distancia_km, qt_peso_total_kg, DATE_FORMAT(dt_agendada, '%d/%m/%Y') AS dt_agendada, ie_situacao  FROM rota_coleta`;

    //Executando a consulta no banco de dados
    conectiondb().query(sql, function (erro, retorno) {
        res.render('rotas', { rotas: retorno });
    });
};

//Função para exibir  pagina atualizar Rotas
function exibirAtualizarRotas(req, res) {
    res.render('rotasAtualizar');
};

//Função para exibir pagina de cadastrar rotas
function exibirCadastrarRotas(req, res) {
    res.render('rotasCadastrar');
};

// Função cadastrar uma Rota
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

// Função Buscar Rota
function buscarRota(req, res) {
  console.log("Função buscarRotas chamada");

  const { nome_rota, dt_rota } = req.body;

  let query = `
    SELECT 
      cd_rota,
      nm_rota,
      nr_distancia_km,
      qt_peso_total_kg,
      DATE_FORMAT(dt_agendada, '%d/%m/%Y') AS dt_agendada
    FROM rota_coleta
    WHERE 1=1
  `;

  const valores = [];

  if (nome_rota) {
    query += " AND nm_rota LIKE ?";
    valores.push(`%${nome_rota}%`);
  }

  if (dt_rota) {
    query += " AND DATE_FORMAT(dt_agendada, '%Y-%m-%d') = ?";
    valores.push(dt_rota);
  }

  conectiondb().query(query, valores, function (err, results) {
    if (err) {
      console.error("Erro ao buscar rotas:", err);
      return res.status(500).send("Erro ao buscar rotas");
    }

    res.render('rotas', { rotas: results });
  });
}


module.exports = {
    exibirRotas,
    exibirAtualizarRotas,
    exibirCadastrarRotas,
    buscarRota,
    insertRota
}


