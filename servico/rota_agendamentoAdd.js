const pool = require('../bd/conexao_mysql.js')();

// Consultas SQL centralizadas para evitar redundância
const queryPessoasFisicas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
const queryPessoasJuridicas = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';
const queryCidades = 'SELECT cd_cidade, nm_cidade FROM cidade';
const queryBairros = 'SELECT cd_bairro, nm_bairro FROM bairro';

/**
 * Exibe a tela de agendamento com dados dinâmicos para os selects.
 */
function exibirAgendamento(req, res, mensagem = '') {
  pool.query(queryPessoasFisicas, (err1, pessoasFisicas) => {
    if (err1) return res.status(500).send('Erro ao buscar pessoas físicas');

    pool.query(queryPessoasJuridicas, (err2, pessoasJuridicas) => {
      if (err2) return res.status(500).send('Erro ao buscar pessoas jurídicas');

      pool.query(queryCidades, (err3, cidades) => {
        if (err3) return res.status(500).send('Erro ao buscar cidades');

        pool.query(queryBairros, (err4, bairros) => {
          if (err4) return res.status(500).send('Erro ao buscar bairros');

          res.render('agendamentoAdd', {
            mensagem,
            pessoasFisicas,
            pessoasJuridicas,
            cidades,
            usuario: req.session.usuario,
            bairros
          });
        });
      });
    });
  });
}

/**
 * Registra um novo agendamento no banco de dados.
 */
function registrarAgendamento(req, res) {
  console.log("Função registrarAgendamento chamada");

  const {
    cd_pessoa_fisica,
    cd_pessoa_juridica,
    ds_endereco,
    nr_endereco,
    nr_cep,
    uf_estado,
    nm_cidade,
    nm_bairro,
    dt_solicitada,
    qt_quantidade_prevista_kg
  } = req.body;

  // Validação: campos obrigatórios
  if (
    !nr_cep || nr_cep.trim() === '' ||
    !ds_endereco || ds_endereco.trim() === '' ||
    !nm_bairro || nm_bairro.trim() === '' ||
    !nm_cidade || nm_cidade.trim() === '' ||
    !nr_endereco || nr_endereco.toString().trim() === ''
  ) {
    return exibirAgendamento(req, res, `
            <script>
                swal({
                    title: "Campos obrigatórios!",
                    text: "Preencha CEP e número corretamente para registrar o agendamento.",
                    icon: "error",
                    buttons: { confirm: { text: "OK", className: "btn btn-danger" } }
                });
            </script>
        `);
  }

  // Validação: precisa selecionar pessoa física ou jurídica
  if ((!cd_pessoa_fisica || cd_pessoa_fisica.trim() === '') && (!cd_pessoa_juridica || cd_pessoa_juridica.trim() === '')) {
    return exibirAgendamento(req, res, `
            <script>
                swal({
                    title: "Nome não selecionado!",
                    text: "Você deve selecionar uma pessoa física ou jurídica válida para registrar o agendamento.",
                    icon: "error",
                    buttons: { confirm: { text: "OK", className: "btn btn-danger" } }
                });
            </script>
        `);
  }

  // Limpeza e validação dos campos
  const enderecoLimpo = ds_endereco.trim().replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').slice(0, 45);
  const cepLimpo = nr_cep.replace(/\D/g, '');
  const qt_quantidade_prevista_kg_num = parseFloat(qt_quantidade_prevista_kg.replace(',', '.'));
  const nr_endereco_num = parseInt(nr_endereco, 10);

  // Validação do CEP
  if (!/^\d{8}$/.test(cepLimpo)) {
    return exibirAgendamento(req, res, `
            <script>
                swal({
                    title: "CEP inválido!",
                    text: "O CEP deve conter exatamente 8 dígitos numéricos.",
                    icon: "error",
                    buttons: { confirm: { text: "OK", className: "btn btn-danger" } }
                });
            </script>
        `);
  }


  // Validação da data solicitada
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const [ano, mes, dia] = dt_solicitada.split('-');
  let dataSolicitada = new Date(ano, mes - 1, dia);
  dataSolicitada.setHours(0, 0, 0, 0);
  if (dataSolicitada < hoje) {
    return exibirAgendamento(req, res, `
            <script>
                swal({
                    title: "Data inválida!",
                    text: "A data solicitada não pode ser inferior à data atual.",
                    icon: "error",
                    buttons: { confirm: { text: "OK", className: "btn btn-danger" } }
                });
            </script>
        `);
  }

  // Validação do peso
  if (!/^\d+([.,]\d+)?$/.test(qt_quantidade_prevista_kg)) {
    return exibirAgendamento(req, res, `
            <script>
                swal({
                    title: "Peso inválido!",
                    text: "Informe apenas números positivos com ponto ou vírgula (ex: 100,50). Não use sinais ou letras.",
                    icon: "error",
                    buttons: { confirm: { text: "OK", className: "btn btn-danger" } }
                });
            </script>
        `);
  }

  // Validação do número do endereço
  if (!Number.isInteger(nr_endereco_num) || nr_endereco_num <= 0) {
    return exibirAgendamento(req, res, `
            <script>
                swal({
                    title: "Número inválido!",
                    text: "O número do endereço deve ser um número inteiro positivo.",
                    icon: "error",
                    buttons: { confirm: { text: "OK", className: "btn btn-danger" } }
                });
            </script>
        `);
  }

  // Query de inserção
  const query = `
        INSERT INTO agendamento 
        (dt_solicitada, cd_pessoa_fisica, cd_pessoa_juridica, ds_endereco, nm_bairro, nm_cidade, uf_estado, nr_cep, nr_resid, qt_quantidade_prevista_kg, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  const valores = [
    dt_solicitada,
    cd_pessoa_fisica || null,
    cd_pessoa_juridica || null,
    enderecoLimpo,
    nm_bairro,
    nm_cidade,
    uf_estado,
    cepLimpo,
    nr_endereco_num,
    qt_quantidade_prevista_kg_num,
    'ativo'
  ];

  pool.query(query, valores, (erro, resultado) => {
    if (erro) {
      console.error("Erro ao registrar agendamento:", erro);
      return exibirAgendamento(req, res, `
                <script>
                    swal("Erro ao finalizar!", "Verifique os dados e tente novamente.", {
                        icon: "error",
                        buttons: { confirm: { text: "OK", className: "btn btn-danger" } }
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
                    buttons: { confirm: { text: "OK", className: "btn btn-success" } }
                });
            </script>
        `);
  });
}

/**
 * Retorna os bairros com base em uma cidade selecionada.
 */
function buscarBairrosPorCidade(req, res) {
  const cd_cidade = req.params.cd_cidade;
  const query = 'SELECT cd_bairro, nm_bairro FROM bairro WHERE cd_cidade = ?';

  pool.query(query, [cd_cidade], (erro, bairros) => {
    if (erro) return res.status(500).send('Erro ao buscar bairros');
    return res.json(bairros);
  });
}

/**
 * Busca pessoas físicas pelo nome (autocomplete).
 */
function buscarPessoaFisica(req, res) {
  const termo = req.query.term;
  if (!termo) return res.json([]);
  const sql = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica WHERE nm_pessoa_fisica LIKE ? LIMIT 10';
  const filtro = `%${termo}%`;
  pool.query(sql, [filtro], (err, resultados) => {
    if (err) return res.status(500).send('Erro ao buscar pessoas físicas');
    res.json(resultados);
  });
}

/**
 * Busca pessoas jurídicas pelo nome (autocomplete).
 */
function buscarPessoaJuridica(req, res) {
  const termo = req.query.term;
  if (!termo) return res.json([]);
  const sql = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica WHERE nm_fantasia LIKE ? LIMIT 10';
  const filtro = `%${termo}%`;
  pool.query(sql, [filtro], (err, resultados) => {
    if (err) {
      console.error('Erro ao buscar pessoas jurídicas:', err);
      return res.status(500).send('Erro ao buscar pessoas jurídicas');
    }
    res.json(resultados);
  });
}

module.exports = {
  exibirAgendamento,
  registrarAgendamento,
  buscarBairrosPorCidade,
  buscarPessoaFisica,
  buscarPessoaJuridica
};