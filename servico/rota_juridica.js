const conectiondb = require('../bd/conexao_mysql.js');

// Página do formulário de pessoa jurídica
function exibirFornecedor(req, res) {
  res.render('juridica');
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

  if (Object.keys(erros).length > 0) {
    return res.render('juridica', {
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

  // Verificação se o CNPJ já existe
  const verificarCNPJ = `SELECT * FROM pessoa_juridica WHERE nr_cnpj = ?`;
  conectiondb().query(verificarCNPJ, [cnpj], (err, results) => {
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

    // Se passou a verificação, faz o insert
    const sql = `
      INSERT INTO pessoa_juridica
      (nm_razao_social, nm_fantasia, nr_cnpj, ds_email, nr_telefone, ds_endereco, cd_bairro, cd_cidade, nr_cep, dt_atualizacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const valores = [
      razaoSocial,
      nomeFantasia,
      cnpj,
      email || null,
      telefone || null,
      endereco || null,
      bairro || null,
      cidade || null,
      cep || null
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
  exibirFornecedor,
  insertPessoaJuridica
};
