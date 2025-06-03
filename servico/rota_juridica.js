const conectiondb = require('../bd/conexao_mysql.js');

// Página do formulário de pessoa jurídica
function exibirFornecedor(req, res) {
  res.render('juridica');
}

function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, ''); // Remove todos os caracteres que não são dígitos (mantém apenas números)

  if (cnpj.length !== 14) return false; // Verifica se o CNPJ tem exatamente 14 dígitos

  // Elimina CNPJs inválidos conhecidos (como "00000000000000", "11111111111111", etc.)
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2; // Define o tamanho da base numérica (sem os dois dígitos verificadores)
  let numeros = cnpj.substring(0, tamanho); // Extrai os 12 primeiros dígitos do CNPJ
  let digitos = cnpj.substring(tamanho); // Extrai os 2 últimos dígitos (verificadores)
  let soma = 0;
  let pos = tamanho - 7; // Define o peso inicial (começa em 5 para o primeiro dígito verificador)

  // Calcula o primeiro dígito verificador
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--; // Multiplica cada dígito pelo peso e soma
    if (pos < 2) pos = 9; // Reinicia o peso para 9 quando ele fica menor que 2
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11); // Calcula o primeiro dígito verificador com base na regra do CNPJ
  if (resultado != digitos.charAt(0)) return false; // Verifica se o primeiro dígito calculado bate com o informado

  tamanho = tamanho + 1; // Agora inclui o primeiro dígito verificador
  numeros = cnpj.substring(0, tamanho); // Pega os 13 primeiros dígitos
  soma = 0;
  pos = tamanho - 7; // Reinicia o peso (agora começando em 6)

  // Calcula o segundo dígito verificador
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--; // Multiplica cada dígito pelo peso e soma
    if (pos < 2) pos = 9; // Reinicia o peso para 9 quando ele fica menor que 2
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11); // Calcula o segundo dígito verificador
  return resultado == digitos.charAt(1); // Retorna true se o segundo dígito também for válido, senão false
}


// Inserção da pessoa jurídica no banco
function insertPessoaJuridica(req, res) {
  const {
    razaoSocial,
    nomeFantasia,
    cnpj,
    email,
    telefone,
    endereco,
    numero_endereco,
    bairro,
    cidade,
    uf,
    cep
  } = req.body;

  //Objeto que valida os campos obrigatótios
  const erros = {};
  if (!razaoSocial || razaoSocial.trim() === '') erros.razaoSocial = true;
  if (!nomeFantasia || nomeFantasia.trim() === '') erros.nomeFantasia = true;
  if (!cnpj || cnpj.trim() === '') erros.cnpj = true;
  if (!email || email.trim() === '') erros.email = true;
  if (!telefone || telefone.trim() === '') erros.telefone = true;
  if (!endereco || endereco.trim() === '') erros.endereco = true;
  if (!bairro || bairro.trim() === '') erros.bairro = true;
  if (!cidade || cidade.trim() === '') erros.cidade = true;
  if (!cep || cep.trim() === '') erros.cep = true;

  if (Object.keys(erros).length > 0) {
    return res.render('juridica', {
      hasError: erros,
      dadosForm: req.body,
      script: `<script>
        swal("Erro ao cadastrar!", "Preencha todos os campos obrigatórios!", {
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

  // mascaras para os campos
  const cnpjSemMascara = cnpj.replace(/[^\d]+/g, '');
  const telefoneSemMascara = telefone.replace(/[^\d]+/g, '');
  const cepSemMascara = cep.replace(/[^\d]+/g, '');

  //Alert do validador de cnpj
  if (!validarCNPJ(cnpjSemMascara)) {
    return res.render('juridica', {
      dadosForm: req.body,
      script: `<script>
        swal("CNPJ inválido!", "Digite um CNPJ válido!", {
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

  // Verfica se ja existe cnpj cadastrado no banco
  const verificarCNPJ = `SELECT * FROM pessoa_juridica WHERE nr_cnpj = ?`;
  conectiondb().query(verificarCNPJ, [cnpjSemMascara], (err, results) => {
    if (err) {
      console.error('Erro ao verificar CNPJ:', err);
      return res.render('juridica', {
        script: `<script>
          swal("Erro!", "Erro ao verificar CNPJ no banco de dados.", {
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
      return res.render('juridica', {
        dadosForm: req.body,
        script: `<script>
          swal("CNPJ já existe!", "Este CNPJ já está cadastrado.", {
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

    //Cadastro da pessoa juridica
    const sql = `
      INSERT INTO pessoa_juridica
(nm_razao_social, nm_fantasia, nr_cnpj, ds_email, nr_telefone, ds_endereco, nr_endereco, nm_bairro, nm_cidade, uf_estado, nr_cep, dt_atualizacao)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const valores = [
      razaoSocial,
      nomeFantasia,
      cnpjSemMascara,
      email,
      telefoneSemMascara,
      endereco,
      numero_endereco,
      bairro,
      cidade,
      uf,
      cepSemMascara
    ];



    conectiondb().query(sql, valores, (error, results) => {
      if (error) {
        console.error('Erro ao cadastrar pessoa jurídica:', error);
        res.render('juridica', {
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
        res.render('juridica', {
          script: `<script>
            swal("Cadastro realizado!", "Pessoa jurídica cadastrada com sucesso!", {
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


// Exporta as funções
module.exports = {
  validarCNPJ,
  exibirFornecedor,
  insertPessoaJuridica
};
