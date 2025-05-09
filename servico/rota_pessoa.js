const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a página de cadastro
function exibirPessoa(req, res) {
  res.render('pessoa');
}

// Função para cadastrar pessoa física
function insertPessoa(req, res) {
  const {
    nomeFisico,
    dataNasc,
    sexo,
    cpf,
    telefone,
    email,
    endereco,
    bairro,
    cidade,
    cep
  } = req.body;

  const erros = {};
  if (!nomeFisico || nomeFisico.trim() === '') erros.nomeFisico = true;
  if (!cpf || cpf.trim() === '') erros.cpf = true;
  if (!email || email.trim() === '') erros.email = true;

  if (Object.keys(erros).length > 0) {
    return res.render('pessoa', {
      hasError: erros,
      dadosForm: req.body,
      script: `<script>
              swal("Erro ao cadastrar!", "Preencha os campos obrigatórios!", {
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

  const cpfLimpo = cpf.replace(/\D/g, '');
  const cepLimpo = cep ? cep.replace(/\D/g, '') : null;

  // Verificação se o CPF já existe
  const verificarCPF = `SELECT * FROM pessoa_fisica WHERE nr_cpf = ?`;
  conectiondb().query(verificarCPF, [cpf], (err, results) => {
    if (err) {
      console.error('Erro ao verificar CPF:', err);
      return res.render('pessoa', {
        script: `<script>
                  swal("Erro!", "Erro ao verificar CPF no banco de dados.", {
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

    if (results.length > 0) {
      return res.render('pessoa', {
        dadosForm: req.body,
        script: `<script>
                  swal("CPF já existe!", "Este CPF já está cadastrado.", {
                      icon: "warning",
                      buttons: {
                          confirm: {
                              text: "OK",
                              className: "btn btn-warning",
                          },
                      },
                  });
              </script>`
      });
    }

    // Se passou a verificação, faz o insert
    const sql = `
      INSERT INTO pessoa_fisica 
      (nm_pessoa_fisica, dt_nascimento, ie_sexo, nr_cpf, nr_telefone_celular, ds_email, ds_endereco, cd_bairro, cd_cidade, nr_cep, dt_atualizacao) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      nomeFisico,
      dataNasc,
      sexo,
      cpfLimpo,
      telefone,
      email,
      endereco,
      bairro,
      cidade,
      cepLimpo
    ];

    conectiondb().query(sql, values, (error, results) => {
      if (error) {
        console.error('Erro ao cadastrar pessoa:', error);
        return res.render('pessoa', {
          script: `<script>
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
        return res.render('pessoa', {
          script: `<script>
                    swal("Cadastro realizado!", "Pessoa cadastrada com sucesso!", {
                        icon: "success",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-success",
                            },
                        },
                    });
                </script>`
        });
      }
    });
  });
}

// Exportando as funções
module.exports = {
  exibirPessoa,
  insertPessoa
};
