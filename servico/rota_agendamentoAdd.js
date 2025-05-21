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

  // Validação: precisa obrigatoriamente selecionar pessoa física ou pessoa jurídica
  if ((!cd_pessoa_fisica || cd_pessoa_fisica.trim() === '') && (!cd_pessoa_juridica || cd_pessoa_juridica.trim() === '')) {
    return exibirAgendamento(req, res, `
      <script>
        swal({
          title: "Nome não selecionado!",
          text: "Você deve selecionar uma pessoa física ou jurídica válida para registrar o agendamento.",
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

  // Validação da data no back-end
  const dataAtual = new Date();
  const dataSolicitada = new Date(dt_solicitada);

  const enderecoLimpo = ds_endereco.trim().replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').slice(0, 45);

  const cepLimpo = nr_cep.replace(/\D/g, ''); // remove tudo que não é número

  // Converto o valor recebido como string para número, trocando vírgula por ponto
  const qt_quantidade_prevista_kg_num = parseFloat(qt_quantidade_prevista_kg.replace(',', '.'));

  // Valida se o CEP tem exatamente 8 dígitos
  if (!/^\d{8}$/.test(cepLimpo)) {
    return exibirAgendamento(req, res, `
      <script>
        swal({
          title: "CEP inválido!",
          text: "O CEP deve conter exatamente 8 dígitos numéricos.",
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

  if (!enderecoLimpo) {
    return exibirAgendamento(req, res, `
      <script>
        swal({
          title: "Endereço inválido!",
          text: "O campo de endereço é obrigatório e não pode conter apenas espaços ou caracteres especiais.",
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

  // Verifica se contém ao menos uma letra (não pode ser só número)
  if (!/[a-zA-ZÀ-ÿ]/.test(enderecoLimpo)) {
    return exibirAgendamento(req, res, `
      <script>
        swal({
          title: "Endereço inválido!",
          text: "Insira o nome do logradouro.",
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

  if (dataSolicitada < dataAtual.setHours(0, 0, 0, 0)) {
    return exibirAgendamento(req, res, `
      <script>
        swal({
          title: "Data inválida!",
          text: "A data solicitada não pode ser inferior à data atual.",
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

  // Verifica se o valor é um número válido (sem letras ou caracteres especiais)
  if (!/^\d+([.,]\d+)?$/.test(qt_quantidade_prevista_kg)) {
    return exibirAgendamento(req, res, `
      <script>
        swal({
          title: "Peso inválido!",
          text: "Informe apenas números positivos com ponto ou vírgula (ex: 100,50). Não use sinais ou letras.",
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

  const query = `
    INSERT INTO agendamento 
    (dt_solicitada, cd_pessoa_fisica, cd_pessoa_juridica, ds_endereco, cd_bairro, cd_cidade, nr_cep, qt_quantidade_prevista_kg, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    dt_solicitada,
    cd_pessoa_fisica || null,
    cd_pessoa_juridica || null,
    enderecoLimpo,
    cd_bairro,
    cd_cidade,
    cepLimpo,
    qt_quantidade_prevista_kg_num,
    'ativo' // Status padrão do novo agendamento
  ];

  conexao.query(query, valores, (erro, resultado) => {
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

function buscarPessoaFisica(req, res) {
  const termo = req.query.term; // texto que o usuário digitou
  if (!termo) {
    return res.json([]);
  }
  const sql = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica WHERE nm_pessoa_fisica LIKE ? LIMIT 10';
  const filtro = `%${termo}%`;
  conexao.query(sql, [filtro], (err, resultados) => {
    if (err) {
      return res.status(500).send('Erro ao buscar pessoas físicas');
    }
    res.json(resultados);
  });
}

function buscarPessoaJuridica(req, res) {
  const termo = req.query.term;

  if (!termo) {
    return res.json([]);
  }

  const sql = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica WHERE nm_fantasia LIKE ? LIMIT 10';
  const filtro = `%${termo}%`;

  conexao.query(sql, [filtro], (err, resultados) => {
    if (err) {
      console.error('Erro ao buscar pessoas jurídicas:', err);
      return res.status(500).send('Erro ao buscar pessoas jurídicas');
    }

    res.json(resultados);
  });
}

// Exporto as funções para que possam ser usadas em outros arquivos
module.exports = {
  exibirAgendamento,
  registrarAgendamento,
  buscarBairrosPorCidade,
  buscarPessoaFisica,
  buscarPessoaJuridica
};
