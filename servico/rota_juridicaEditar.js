const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a página de edição da pessoa jurídica
function exibirJuridicaEditar(req, res) {
    const sql = `
        SELECT 
            cd_pessoa_juridica,
            nm_fantasia,
            nm_razao_social,
            ds_email,
            nr_cnpj,
            nr_telefone,
            ds_endereco,
            nr_endereco,
            nr_cep,
            nm_bairro,
            nm_cidade,
            uf_estado,
            dt_atualizacao
        FROM pessoa_juridica 
        WHERE cd_pessoa_juridica = ?
    `;

    conectiondb().query(sql, [req.params.cd_pessoa_juridica], function (erro, retorno) {
        if (erro) throw erro;

        if (retorno.length === 0) {
            return res.status(404).send('Pessoa jurídica não encontrada.');
        }

        res.render('juridicaEditar', {
            pessoa_juridica: retorno[0],
            dadosForm: {
                nomeFantasia: retorno[0].nm_fantasia,
                razaoSocial: retorno[0].nm_razao_social,
                email: retorno[0].ds_email,
                cnpj: retorno[0].nr_cnpj,
                telefone: retorno[0].nr_telefone,
                endereco: retorno[0].ds_endereco,
                numero_endereco: retorno[0].nr_endereco,
                cep: retorno[0].nr_cep,
                bairro: retorno[0].nm_bairro,
                cidade: retorno[0].nm_cidade,
                uf: retorno[0].uf_estado,
                dt_atualizacao: retorno[0].dt_atualizacao?.toLocaleDateString?.('pt-BR') || ''
            }
        });
    });
}

// Função utilitária para validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) return false;
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

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho += 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado === parseInt(digitos.charAt(1));
}

// Função para processar a edição
function editarJuridica(req, res) {
    const {
        codigo,
        nomeFantasia,
        razaoSocial,
        email,
        cnpj,
        telefone,
        endereco,
        numero_endereco,
        cep,
        bairro,
        cidade,
        uf
    } = req.body;

    // Sanitização: manter apenas números
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    const telefoneLimpo = telefone.replace(/\D/g, '');
    const cepLimpo = cep.replace(/\D/g, '');

    // Validações iniciais
    if (!codigo || codigo.trim() === '') {
        return renderErro(res, req.body, "ID da pessoa jurídica não foi informado.");
    }

    if (!validarCNPJ(cnpjLimpo)) {
        return renderErro(res, req.body, "CNPJ inválido. Verifique e tente novamente.");
    }

    // Verifica se já existe outro registro com o mesmo CNPJ
    const sqlVerificaCnpj = `
        SELECT cd_pessoa_juridica 
        FROM pessoa_juridica 
        WHERE nr_cnpj = ? AND cd_pessoa_juridica != ?
    `;

    conectiondb().query(sqlVerificaCnpj, [cnpjLimpo, codigo], function (erro, resultado) {
        if (erro) {
            console.error('Erro na verificação de CNPJ duplicado:', erro.sqlMessage);
            return renderErro(res, req.body, "Erro ao verificar CNPJ. Tente novamente.");
        }

        if (resultado.length > 0) {
            return renderErro(res, req.body, "Já existe uma pessoa jurídica com este CNPJ.");
        }

        // Continua com o update
        const sqlUpdate = `
            UPDATE pessoa_juridica 
            SET 
                nm_fantasia = ?, 
                nm_razao_social = ?,
                ds_email = ?, 
                nr_cnpj = ?, 
                nr_telefone = ?, 
                ds_endereco = ?, 
                nr_endereco = ?,
                nr_cep = ?,  
                nm_bairro = ?, 
                nm_cidade = ?,
                uf_estado = ?,
                dt_atualizacao = NOW()
            WHERE cd_pessoa_juridica = ?
        `;

        const valores = [
            nomeFantasia,
            razaoSocial,
            email,
            cnpjLimpo,
            telefoneLimpo,
            endereco,
            numero_endereco,
            cepLimpo,
            bairro,
            cidade,
            uf,
            codigo
        ];

        conectiondb().query(sqlUpdate, valores, function (erro) {
            if (erro) {
                console.error('Erro ao atualizar pessoa jurídica:', erro.sqlMessage);
                return renderErro(res, req.body, "Erro ao atualizar. Verifique os dados.");
            }

            const pessoaAtualizada = {
                cd_pessoa_juridica: codigo,
                nm_fantasia: nomeFantasia,
                nm_razao_social: razaoSocial,
                ds_email: email,
                nr_cnpj: cnpjLimpo,
                nr_telefone: telefoneLimpo,
                ds_endereco: endereco,
                nr_endereco: numero_endereco,
                nr_cep: cepLimpo,
                nm_bairro: bairro,
                nm_cidade: cidade,
                uf_estado: uf,
                dt_atualizacao: new Date().toISOString().split('T')[0]
            };

            res.render('juridicaEditar', {
                pessoa_juridica: pessoaAtualizada,
                dadosForm: {
                    nomeFantasia,
                    razaoSocial,
                    email,
                    cnpj: cnpjLimpo,
                    telefone: telefoneLimpo,
                    endereco,
                    numero_endereco,
                    cep: cepLimpo,
                    bairro,
                    cidade,
                    uf,
                    dt_atualizacao: new Date().toLocaleDateString('pt-BR')
                },
                script: `
                    <script>
                        swal({
                            title: "Alteração realizada!",
                            text: "Pessoa jurídica alterada com sucesso!",
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
            });
        });
    });
}

// Função utilitária para exibir erro com sweetalert
function renderErro(res, body, mensagem) {
    return res.render('juridicaEditar', {
        pessoa_juridica: body,
        dadosForm: {
            nomeFantasia: body.nomeFantasia,
            razaoSocial: body.razaoSocial,
            email: body.email,
            cnpj: body.cnpj,
            telefone: body.telefone,
            endereco: body.endereco,
            numero_endereco: body.numero_endereco,
            cep: body.cep,
            bairro: body.bairro,
            cidade: body.cidade,
            uf: body.uf,
            dt_atualizacao: new Date().toLocaleDateString('pt-BR')
        },
        script: `
            <script>
                swal("Erro ao editar!", "${mensagem}", {
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
    });
}

module.exports = {
    exibirJuridicaEditar,
    editarJuridica
};
