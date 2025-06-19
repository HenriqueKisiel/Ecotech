const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a página de edição da pessoa jurídica
function exibirJuridicaEditar(req, res) {
    // SQL para buscar os dados da pessoa jurídica pelo código
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

    conectiondb().query(sql, [req.params.cd_pessoa_juridica], function (erro, retorno) { // Executa a consulta passando o código como parâmetro
        if (erro) throw erro; // Em caso de erro, interrompe e exibe

        if (retorno.length === 0) { // Se nenhum registro for encontrado
            return res.status(404).send('Pessoa jurídica não encontrada.'); // Retorna erro 404
        }

        res.render('juridicaEditar', { // Renderiza a página de edição com os dados encontrados
            pessoa_juridica: retorno[0], // Dados completos da pessoa jurídica
            usuario: req.session.usuario,
            dadosForm: { // Dados usados para preencher o formulário
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
                dt_atualizacao: retorno[0].dt_atualizacao?.toLocaleDateString?.('pt-BR') || '' // Formata a data para exibição
            }
        });
    });
}

// Função utilitária para validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

    if (cnpj.length !== 14) return false; // Verifica se o CNPJ tem 14 dígitos
    if (/^(\d)\1+$/.test(cnpj)) return false; // Verifica se todos os dígitos são iguais (CNPJ inválido)

    let tamanho = cnpj.length - 2; // Define o tamanho da base sem os dígitos verificadores
    let numeros = cnpj.substring(0, tamanho); // Extrai os números base
    let digitos = cnpj.substring(tamanho); // Extrai os dois últimos dígitos
    let soma = 0;
    let pos = tamanho - 7; // Define o peso inicial

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--; // Soma ponderada dos dígitos
        if (pos < 2) pos = 9; // Reinicia o peso
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11; // Calcula primeiro dígito verificador
    if (resultado !== parseInt(digitos.charAt(0))) return false; // Valida o primeiro dígito

    tamanho += 1;
    numeros = cnpj.substring(0, tamanho); // Inclui o primeiro dígito para calcular o segundo
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--; // Soma ponderada com novo peso
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11; // Calcula segundo dígito verificador
    return resultado === parseInt(digitos.charAt(1)); // Retorna true se os dois dígitos forem válidos
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
    } = req.body; // Extrai os dados do corpo da requisição

    // Sanitização: manter apenas números
    const cnpjLimpo = cnpj.replace(/\D/g, ''); // Remove caracteres não numéricos do CNPJ
    const telefoneLimpo = telefone.replace(/\D/g, ''); // Remove do telefone
    const cepLimpo = cep.replace(/\D/g, ''); // Remove do CEP

    // Validações iniciais
    if (!codigo || codigo.trim() === '') { // Verifica se o código foi informado
        return renderErro(res, req.body, "ID da pessoa jurídica não foi informado.");
    }

    if (!validarCNPJ(cnpjLimpo)) { // Valida o CNPJ com a função utilitária
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
            console.error('Erro na verificação de CNPJ duplicado:', erro.sqlMessage); // Loga erro no console
            return renderErro(res, req.body, "Erro ao verificar CNPJ. Tente novamente.");
        }

        if (resultado.length > 0) { // Verifica se já existe CNPJ em outro cadastro
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

        const valores = [ // Dados para atualizar no banco
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
                console.error('Erro ao atualizar pessoa jurídica:', erro.sqlMessage); // Loga erro
                return renderErro(res, req.body, "Erro ao atualizar. Verifique os dados.");
            }

            const pessoaAtualizada = { // Monta objeto com os dados atualizados
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
                dt_atualizacao: new Date().toISOString().split('T')[0] // Data atual em formato ISO
            };

            res.render('juridicaEditar', { // Reexibe a página com os dados atualizados
                pessoa_juridica: pessoaAtualizada,
                usuario: req.session.usuario,
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
                    dt_atualizacao: new Date().toLocaleDateString('pt-BR') // Data atual formatada para exibição
                },
                script: ` // Exibe alerta de sucesso com SweetAlert
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
    return res.render('juridicaEditar', { // Reexibe o formulário com os dados já preenchidos
        pessoa_juridica: body,
        usuario: req.session.usuario,
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
            dt_atualizacao: new Date().toLocaleDateString('pt-BR') // Exibe a data atual formatada
        },
        script: ` // Exibe alerta de erro com SweetAlert
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
