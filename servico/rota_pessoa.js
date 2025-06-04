const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a página de cadastro
function exibirPessoa(req, res) {
  res.render('pessoa');
}

//Função para validar CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, ''); // Remove todos os caracteres que não são dígitos (mantém apenas números)

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; // Verifica se o CPF tem 11 dígitos e se todos são iguais (caso inválido como '11111111111')

  let soma = 0; // Inicializa a soma dos produtos dos dígitos para o primeiro dígito verificador
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i); // Multiplica cada um dos 9 primeiros dígitos por pesos decrescentes de 10 a 2
  }
  let resto = (soma * 10) % 11; // Calcula o resto da divisão da soma multiplicada por 10 por 11
  if (resto === 10 || resto === 11) resto = 0; // Se o resto for 10 ou 11, define como 0 (regra do CPF)
  if (resto !== parseInt(cpf.charAt(9))) return false; // Verifica se o primeiro dígito verificador está correto

  soma = 0; // Zera a soma para calcular o segundo dígito verificador
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i); // Multiplica os 10 primeiros dígitos por pesos decrescentes de 11 a 2
  }
  resto = (soma * 10) % 11; // Calcula o resto da divisão da nova soma multiplicada por 10 por 11
  if (resto === 10 || resto === 11) resto = 0; // Se o resto for 10 ou 11, define como 0
  if (resto !== parseInt(cpf.charAt(10))) return false; // Verifica se o segundo dígito verificador está correto

  return true; // Se passou por todas as validações, retorna verdadeiro (CPF válido)
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
    ds_endereco,
    nr_endereco,
    nm_bairro,
    nm_cidade,
    uf_estado,
    cep
  } = req.body;

  // Objeto para armazenar campos obrigatórios não preenchidos
  const erros = {};
  if (!nomeFisico || nomeFisico.trim() === '') erros.nomeFisico = true;
  if (!dataNasc || dataNasc.trim() === '') erros.dataNasc = true;
  if (!sexo || sexo.trim() === '') erros.sexo = true;
  if (!cpf || cpf.trim() === '') erros.cpf = true;
  if (!telefone || telefone.trim() === '') erros.telefone = true;
  if (!email || email.trim() === '') erros.email = true;
  if (!cep || cep.trim() === '') erros.cep = true;

  // Se houver campos obrigatórios não preenchidos
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
  dataNascimento.setHours(0, 0, 0, 0);// Zera horas para comparar apenas datas
  hoje.setHours(0, 0, 0, 0);

  let idade = hoje.getFullYear() - dataNascimento.getFullYear(); // Calcula idade
  const mes = hoje.getMonth() - dataNascimento.getMonth(); // Diferença de meses
  if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--; // Ajusta idade se ainda não fez aniversário no ano
  }

  if (
    isNaN(dataNascimento.getTime()) || // Data inválida
    dataNascimento > hoje ||  // Data futura
    idade < 14 || // Menor que 14 anos
    idade > 120 // Maior que 120 anos
  ) {
    return res.render('pessoa', { // Retorna erro de data de nascimento inválida
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

  const cpfLimpo = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos do CPF

  if (!validarCPF(cpfLimpo)) { // Valida o CPF usando a função validarCPF
    return res.render('pessoa', { // Retorna erro se CPF for inválido
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

  const cepLimpo = cep ? cep.replace(/\D/g, '') : null;  // Remove caracteres não numéricos do CEP

  const verificarCPF = `SELECT * FROM pessoa_fisica WHERE nr_cpf = ?`; // Query para verificar se o CPF já existe
  conectiondb().query(verificarCPF, [cpfLimpo], (err, results) => { // Consulta no banco de dados
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

    if (results.length > 0) {  // Se CPF já existe no banco
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

    // Query para inserir nova pessoa
    const sql = `
    INSERT INTO pessoa_fisica 
    (nm_pessoa_fisica, dt_nascimento, ie_sexo, nr_cpf, nr_telefone_celular, ds_email, ds_endereco, nr_endereco, nm_bairro, nm_cidade, uf_estado, nr_cep, dt_atualizacao) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;


    const values = [
      nomeFisico,
      dataNasc,
      sexo,
      cpfLimpo,
      telefone,
      email,
      ds_endereco,
      nr_endereco,
      nm_bairro,
      nm_cidade,
      uf_estado,
      cepLimpo
    ];


    conectiondb().query(sql, values, (error, results) => { // Executa o insert no banco
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
