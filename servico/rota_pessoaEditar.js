const conectiondb = require('../bd/conexao_mysql.js');

// Função para abrir a página de edição
function exibirPessoaEditar(req, res) {
    let sql = 'SELECT * FROM pessoa_fisica WHERE cd_pessoa_fisica = ?'; // Consulta a pessoa física pelo ID

    conectiondb().query(sql, [req.params.cd_pessoa_fisica], function (erro, retorno) {
        if (erro) throw erro; // Lança erro se a consulta falhar

        if (retorno.length === 0) {
            return res.status(404).send('Pessoa não encontrada.'); // Retorna erro 404 se não encontrar registro
        }

        const pessoa = retorno[0]; // Obtém o primeiro (e único) resultado
        pessoa.dt_nascimento = formatarDataInput(pessoa.dt_nascimento); // Formata data de nascimento para o input date

        res.render('pessoaEditar', { 
           usuario: req.session.usuario,
            pessoa_fisica: pessoa 
        }); // Renderiza a página com os dados da pessoa
    });
}

// Função para formatar a data e retornar da maneira correta no campo data de nascimento
function formatarDataInput(data) {
    const d = new Date(data); // Cria um objeto Date a partir da data recebida
    const ano = d.getFullYear(); // Obtém o ano
    const mes = String(d.getMonth() + 1).padStart(2, '0'); // Obtém o mês com zero à esquerda
    const dia = String(d.getDate()).padStart(2, '0'); // Obtém o dia com zero à esquerda
    return `${ano}-${mes}-${dia}`; // Retorna no formato YYYY-MM-DD
}

// Função para atualizar os dados da pessoa
function editarPessoa(req, res) {
    const {
        codigo,
        nomeFisico,
        email,
        cpf,
        telefone,
        nr_endereco,
        ds_endereco,
        cep,
        dataNasc,
        sexo,
        nm_bairro,
        nm_cidade,
        uf_estado
    } = req.body; // Extrai dados do corpo da requisição

    // Validação básica
    if (!codigo || codigo.trim() === '') {
        return res.render('pessoaEditar', {
            pessoa_fisica: req.body,
            script: `
                <script>
                    swal("Erro ao editar!", "ID da pessoa não foi informado. Tente novamente.", {
                        icon: "error",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-danger",
                            },
                        },
                    });
                </script>
            `
        }); // Se o código estiver vazio, retorna erro com alerta
    }

    const telefoneLimpo = telefone ? telefone.replace(/\D/g, '') : null;
    const sql = `
        UPDATE pessoa_fisica 
        SET 
            nm_pessoa_fisica = ?, 
            ds_email = ?, 
            nr_cpf = ?, 
            nr_telefone_celular = ?, 
            nr_endereco = ?, 
            ds_endereco = ?, 
            nr_cep = ?, 
            dt_nascimento = ?, 
            ie_sexo = ?, 
            nm_bairro = ?, 
            nm_cidade = ?, 
            uf_estado = ?,
            dt_atualizacao = NOW()
        WHERE cd_pessoa_fisica = ?
    `; // SQL de atualização dos dados da pessoa

    const valores = [
        nomeFisico,
        email,
        cpf,
        telefoneLimpo,
        nr_endereco,
        ds_endereco,
        cep,
        dataNasc,
        sexo,
        nm_bairro,
        nm_cidade,
        uf_estado,
        codigo
    ]; // Parâmetros para o UPDATE

    conectiondb().query(sql, valores, function (erro) {
        if (erro) {
            console.error('Erro ao atualizar pessoa:', erro.sqlMessage); // Exibe erro no console
            return res.render('pessoaEditar', {
                pessoa_fisica: req.body,
                script: `
                    <script>
                        swal("Erro ao editar!", "Verifique os dados e tente novamente.", {
                            icon: "error",
                            buttons: {
                                confirm: {
                                    text: "OK",
                                    className: "btn btn-danger",
                                },
                            },
                        });
                    </script>
                `
            }); // Retorna erro e reexibe o formulário com os dados preenchidos
        }

        // Sucesso
        res.render('pessoaEditar', {
            usuario: req.session.usuario,
            pessoa_fisica: {
                cd_pessoa_fisica: codigo,
                nm_pessoa_fisica: nomeFisico,
                ds_email: email,
                nr_cpf: cpf,
                nr_telefone_celular: telefone,
                nr_endereco,
                ds_endereco,
                nr_cep: cep,
                dt_nascimento: formatarDataInput(dataNasc), // Formata data de nascimento novamente
                ie_sexo: sexo,
                nm_bairro,
                nm_cidade,
                uf_estado,
                dt_atualizacao: new Date().toISOString().slice(0, 19).replace('T', ' ') // Formata a data de atualização
            },
            script: `
                <script>
                    swal({
                        title: "Alteração realizada!",
                        text: "Pessoa alterada com sucesso!",
                        icon: "success",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-success",
                            },
                        },
                    });
                </script>
            `
        }); // Exibe mensagem de sucesso e retorna a view com os dados atualizados
    });
}


module.exports = {
    exibirPessoaEditar,
    editarPessoa,
};
