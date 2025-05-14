const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a página de cadastro
function exibirPessoa(req, res) {
  res.render('pessoa');
}

//Função para validar CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
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
  if (!dataNasc || dataNasc.trim() === '') erros.dataNasc = true;
  if (!sexo || sexo.trim() === '') erros.sexo = true;
  if (!cpf || cpf.trim() === '') erros.cpf = true;
  if (!telefone || telefone.trim() === '') erros.telefone = true;
  if (!email || email.trim() === '') erros.email = true;
  if (!endereco || endereco.trim() === '') erros.endereco = true;
  if (!bairro || bairro.trim() === '') erros.bairro = true;
  if (!cidade || cidade.trim() === '') erros.cidade = true;
  if (!cep || cep.trim() === '') erros.cep = true;

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

  // Validação de data de nascimento (mínimo 14, máximo 120 anos, não pode ser futura)
  const hoje = new Date();
  const dataNascimento = new Date(dataNasc);
  dataNascimento.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const mes = hoje.getMonth() - dataNascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }

  if (
    isNaN(dataNascimento.getTime()) ||
    dataNascimento > hoje ||
    idade < 14 ||
    idade > 120
  ) {
    return res.render('pessoa', {
      hasError: { dataNasc: true },
      dadosForm: req.body,
      script: `<script>
                swal("Data de nascimento inválida!", "A pessoa deve ter entre 14 e 120 anos.", {
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

  if (!validarCPF(cpfLimpo)) {
    return res.render('pessoa', {
      hasError: { cpf: true },
      dadosForm: req.body,
      script: `<script>
                swal("CPF inválido!", "Digite um CPF válido.", {
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

  const cepLimpo = cep ? cep.replace(/\D/g, '') : null;

  const verificarCPF = `SELECT * FROM pessoa_fisica WHERE nr_cpf = ?`;
  conectiondb().query(verificarCPF, [cpfLimpo], (err, results) => {
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
  validarCPF,
  exibirPessoa,
  insertPessoa
};
