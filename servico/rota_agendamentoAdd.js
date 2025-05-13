const conectiondb = require('../bd/conexao_mysql.js');  // Conexão com o banco de dados
const conexao = conectiondb();

// Função para exibir a tela de agendamento com dados dinâmicos
function exibirAgendamento(req, res, mensagem = '') {
  // Consultas SQL
  const queryPessoasFisicas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
  const queryPessoasJuridicas = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';
  const queryCidades = 'SELECT cd_cidade, nm_cidade FROM cidade';
  const queryBairros = 'SELECT cd_bairro, nm_bairro FROM bairro';

  conexao.query(queryPessoasFisicas, (err1, pessoasFisicas) => {
    if (err1) return res.status(500).send('Erro ao buscar pessoas físicas');

    conexao.query(queryPessoasJuridicas, (err2, pessoasJuridicas) => {
      if (err2) return res.status(500).send('Erro ao buscar pessoas jurídicas');

      conexao.query(queryCidades, (err3, cidades) => {
        if (err3) return res.status(500).send('Erro ao buscar cidades');

        conexao.query(queryBairros, (err4, bairros) => {
          if (err4) return res.status(500).send('Erro ao buscar bairros');

          // Renderiza a página com todos os dados necessários e mensagem (caso exista)
          res.render('agendamentoAdd', {
            mensagem,
            pessoasFisicas,
            pessoasJuridicas,
            cidades,
            bairros
          });
        });
      });
    });
  });
}
// Função responsável por registrar um novo agendamento no banco de dados
function registrarAgendamento(req, res) {
  console.log("Função registrarAgendamento chamada");

  const {
    cd_pessoa_fisica,
    cd_pessoa_juridica,
    ds_endereco,
    nr_cep, 
    cd_cidade,
    cd_bairro,
    dt_solicitada,
    qt_quantidade_prevista_kg
  } = req.body;

  console.log("Dados recebidos:", req.body);

  const qt_quantidade_prevista_kg_num = parseFloat(qt_quantidade_prevista_kg.replace(',', '.'));

    const insertQuery = `
        INSERT INTO agendamento 
        (dt_solicitada, cd_pessoa_fisica, cd_pessoa_juridica, ds_endereco, cd_bairro, cd_cidade, nr_cep, qt_quantidade_prevista_kg)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      dt_solicitada,
      cd_pessoa_fisica || null,
      cd_pessoa_juridica || null,
      ds_endereco,
      cd_bairro,
      cd_cidade,
      nr_cep.replace(/\D/g, ''), // <-- Aqui, removendo caracteres não numéricos
      qt_quantidade_prevista_kg_num,
      'ativo'
    ];

  conexao.query(insertQuery, valores, (erro, resultado) => {
    if (erro) {
      console.error("Erro ao registrar agendamento:", erro);
      return exibirAgendamento(req, res, `
              <script>
                swal("Erro ao finalizar!", "Verifique os dados e tente novamente.", {
                  icon: "error",
                  buttons: {
                    confirm: {
                      text: "OK",
                      className: "btn btn-danger",
                    },
                  },
                });
              </script>
          `);
    }

    console.log("Agendamento registrado com sucesso!");
    return exibirAgendamento(req, res, `
          <script>
            swal({
              title: "Agendamento finalizado!",
              text: "Agendamento finalizado com sucesso!",
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
      `);
  });
    conexao.query(insertQuery, valores, (erro, resultado) => {
        if (erro) {
            console.error("Erro ao registrar agendamento:", erro);
            return exibirAgendamento(req, res, 'Erro ao registrar o agendamento. Verifique os dados e tente novamente.');
        }

        const novoId = resultado.insertId;
        console.log("Agendamento inserido com ID:", novoId);

        // Agora executa a função gerar_nome_agendamento e atualiza o campo
        const gerarNomeQuery = `SELECT gerar_nome_agendamento(?) AS nome`;
        conexao.query(gerarNomeQuery, [novoId], (erro2, resultado2) => {
            if (erro2) {
                console.error("Erro ao gerar nome do agendamento:", erro2);
                return exibirAgendamento(req, res, 'Agendamento registrado, mas houve erro ao gerar o nome.');
            }

            const nomeGerado = resultado2[0].nome;

            const updateQuery = `UPDATE agendamento SET nm_agendamento = ? WHERE cd_agendamento = ?`;
            conexao.query(updateQuery, [nomeGerado, novoId], (erro3) => {
                if (erro3) {
                    console.error("Erro ao atualizar nome do agendamento:", erro3);
                    return exibirAgendamento(req, res, 'Agendamento registrado, mas houve erro ao salvar o nome.');
                }

                console.log("Nome do agendamento atualizado com sucesso!");
                exibirAgendamento(req, res, 'Agendamento registrado com sucesso!');
            });
        });
    });
}

function buscarBairrosPorCidade(req, res) {
  const cd_cidade = req.params.cd_cidade; // Recebe o ID da cidade via parâmetro de URL

  // Consulta SQL para buscar os bairros relacionados à cidade
  const query = 'SELECT cd_bairro, nm_bairro FROM bairro WHERE cd_cidade = ?';

  conexao.query(query, [cd_cidade], (erro, bairros) => {
    if (erro) {
      return res.status(500).send('Erro ao buscar bairros');
    }
    
    // Retorna os bairros em formato JSON
    return res.json(bairros);
  });
}

module.exports = {
  exibirAgendamento,
  registrarAgendamento,
  buscarBairrosPorCidade
};
