const conectiondb = require('../bd/conexao_mysql.js');  // Aqui eu importo o módulo de conexão com o banco de dados MySQL
const conexao = conectiondb(); // E aqui eu inicializo a conexão para poder executar consultas SQL

// Função para exibir a tela de agendamento com dados dinâmicos
function exibirAgendamento(req, res, mensagem = '') {
  // Consultas SQL que vão buscar os dados que preciso para preencher os selects do formulário
  const queryPessoasFisicas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
  const queryPessoasJuridicas = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';
  const queryCidades = 'SELECT cd_cidade, nm_cidade FROM cidade';
  const queryBairros = 'SELECT cd_bairro, nm_bairro FROM bairro';

  // Executo a primeira consulta (pessoas físicas)
  conexao.query(queryPessoasFisicas, (err1, pessoasFisicas) => {
    if (err1) return res.status(500).send('Erro ao buscar pessoas físicas');

    // Segunda consulta (pessoas jurídicas)
    conexao.query(queryPessoasJuridicas, (err2, pessoasJuridicas) => {
      if (err2) return res.status(500).send('Erro ao buscar pessoas jurídicas');

      // Terceira consulta (cidades)
      conexao.query(queryCidades, (err3, cidades) => {
        if (err3) return res.status(500).send('Erro ao buscar cidades');

        // Quarta consulta (bairros)
        conexao.query(queryBairros, (err4, bairros) => {
          if (err4) return res.status(500).send('Erro ao buscar bairros');

          // Se todas as consultas deram certo, renderizo a página passando os dados e a mensagem (se existir)
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

  // Pego os dados enviados pelo formulário
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

  // Converto o valor recebido como string para número, trocando vírgula por ponto
  const qt_quantidade_prevista_kg_num = parseFloat(qt_quantidade_prevista_kg.replace(',', '.'));

  // Query SQL para inserir o agendamento
  const query = `
      INSERT INTO agendamento 
      (dt_solicitada, cd_pessoa_fisica, cd_pessoa_juridica, ds_endereco, cd_bairro, cd_cidade, nr_cep, qt_quantidade_prevista_kg, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // Preparo os valores que vão ser usados na query, tratando valores opcionais e o CEP
  const valores = [
    dt_solicitada,
    cd_pessoa_fisica || null,
    cd_pessoa_juridica || null,
    ds_endereco,
    cd_bairro,
    cd_cidade,
    nr_cep.replace(/\D/g, ''), // Aqui removo qualquer caractere que não for número do CEP
    qt_quantidade_prevista_kg_num,
    'ativo' // Status padrão do novo agendamento
  ];

  // Executo a query no banco de dados
  conexao.query(query, valores, (erro, resultado) => {
    if (erro) {
      console.error("Erro ao registrar agendamento:", erro);
      // Se ocorrer erro, exibo alerta com erro usando SweetAlert
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

    // Recupero o ID do agendamento recém-inserido
    const novoId = resultado.insertId;
    console.log("Agendamento inserido com ID:", novoId);

    // Faço uma query para gerar o nome do agendamento com base no ID
    const gerarNomeQuery = `SELECT gerar_nome_agendamento(?) AS nome`;
    conexao.query(gerarNomeQuery, [novoId], (erro2, resultado2) => {
      if (erro2) {
        console.error("Erro ao gerar nome do agendamento:", erro2);
        // Se ocorrer erro, exibo aviso simples sem nome gerado
        return exibirAgendamento(req, res, 'Agendamento registrado, mas houve erro ao gerar o nome.');
      }

      // Pego o nome gerado pela função do banco
      const nomeGerado = resultado2[0].nome;

      // Atualizo o campo nm_agendamento com o nome gerado
      const updateQuery = `UPDATE agendamento SET nm_agendamento = ? WHERE cd_agendamento = ?`;
      conexao.query(updateQuery, [nomeGerado, novoId], (erro3) => {
        if (erro3) {
          console.error("Erro ao atualizar nome do agendamento:", erro3);
          return exibirAgendamento(req, res, 'Agendamento registrado, mas houve erro ao salvar o nome.');
        }

        console.log("Nome do agendamento atualizado com sucesso!");

        // Exibo mensagem de sucesso usando SweetAlert
        return exibirAgendamento(req, res, `
          <script>
            swal({
              title: "Agendamento Registrado!",
              text: "O agendamento foi registrado com sucesso.",
              icon: "success",
              buttons: {
                confirm: {
                  text: "OK",
                  className: "btn btn-success",
                },
              },
            });
          </script>
        `);
      });
    });
  });
}


// Função que retorna os bairros com base em uma cidade selecionada
function buscarBairrosPorCidade(req, res) {
  const cd_cidade = req.params.cd_cidade; // Recebo o código da cidade por parâmetro na URL

  // Faço a consulta SQL para buscar os bairros que pertencem a essa cidade
  const query = 'SELECT cd_bairro, nm_bairro FROM bairro WHERE cd_cidade = ?';

  conexao.query(query, [cd_cidade], (erro, bairros) => {
    if (erro) {
      return res.status(500).send('Erro ao buscar bairros');
    }
    
    // Retorno os bairros encontrados em formato JSON
    return res.json(bairros);
  });
}

// Exporto as funções para que possam ser usadas em outros arquivos
module.exports = {
  exibirAgendamento,
  registrarAgendamento,
  buscarBairrosPorCidade
};
