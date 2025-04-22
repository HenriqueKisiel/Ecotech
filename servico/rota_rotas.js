const conectiondb = require('../bd/conexao_mysql.js');

//Função para exibir pagina rotas programadas
function exibirRotas(req, res) {
  let sql = `SELECT cd_rota, nm_rota, nr_distancia_km, qt_peso_total_kg, DATE_FORMAT(dt_agendada, '%d/%m/%Y') AS dt_agendada  FROM rota_coleta`;

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

/**
 * //rota para buscar pessoas
function buscarPessoa(req, res) {
    const sql = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar pessoas:', erro);
            return res.status(500).send('Erro ao buscar pessoas.');
        }
        res.json(resultados); // Retorna os nomes como JSON
    });
}
 */


//exportando a função 
module.exports = {
    exibirRotas,
    exibirAtualizarRotas,
    exibirCadastrarRotas,
    insertRota
}


