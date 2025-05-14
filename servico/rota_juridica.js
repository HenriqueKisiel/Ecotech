const conectiondb = require('../bd/conexao_mysql.js');

// Página do formulário de pessoa jurídica
function exibirFornecedor(req, res) {
  res.render('juridica');
}

function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) return false;

  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(0)) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado == digitos.charAt(1);
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
    bairro,
    cidade,
    cep
  } = req.body;

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

  const cnpjSemMascara = cnpj.replace(/[^\d]+/g, '');

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

    const sql = `
      INSERT INTO pessoa_juridica
      (nm_razao_social, nm_fantasia, nr_cnpj, ds_email, nr_telefone, ds_endereco, cd_bairro, cd_cidade, nr_cep, dt_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const valores = [
      razaoSocial,
      nomeFantasia,
      cnpjSemMascara,
      email,
      telefone,
      endereco,
      bairro,
      cidade,
      cep
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
