const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a página de cadastro de estoque (GET)
function exibirestoque(req, res) {
    const conexao = conectiondb();

    // Carrega a lista de plantas
    conexao.query('SELECT cd_planta, nm_planta FROM planta', (err, resultados) => {
        if (err) {
            console.error('Erro ao buscar plantas:', err);
            return res.render('estoque', { message: 'Erro ao carregar plantas.', plantas: [] });
        }

        // Exibe o formulário de cadastro de estoque com a lista de plantas
        return res.render('estoque', { message: '', plantas: resultados });
    });
}

// Função auxiliar para renderizar erro e recarregar plantas
function renderComErro(message, conexao, res) {
    conexao.query('SELECT cd_planta, nm_planta FROM planta', (err, resultados) => {
        if (err) {
            console.error('Erro ao buscar plantas:', err);
            return res.render('estoque', { message: 'Erro ao carregar plantas.', plantas: [], codigoEstoque: null });
        }
        return res.render('estoque', {
            message,
            plantas: resultados,
            codigoEstoque: null
        });
    });
}

// Função para cadastrar um novo estoque (POST)
function cadastrarEstoque(req, res) {
    const conexao = conectiondb();
    const { cd_planta, nm_estoque, qt_volume_total } = req.body;

    // Validação: planta selecionada
    if (!cd_planta || cd_planta.trim() === "") {
        return renderComErro('Selecione uma planta!', conexao, res);
    }

    // Validação: nome do estoque obrigatório
    if (!nm_estoque || typeof nm_estoque !== 'string' || nm_estoque.trim() === "") {
        return renderComErro('Informe o nome do estoque!', conexao, res);
    }

    // Validação: nome do estoque conforme regras
    const nomeValido =
        nm_estoque.trim().length >= 10 &&
        !/ {2,}/.test(nm_estoque) &&
        /^[A-Za-zÀ-ÿ0-9 ]+$/.test(nm_estoque) &&
        /[A-Za-zÀ-ÿ]/.test(nm_estoque) &&
        !/^[0-9 ]+$/.test(nm_estoque);

    if (!nomeValido) {
        return renderComErro('Nome do estoque inválido! O nome deve ter pelo menos 10 caracteres, conter letras, pode ter números (mas não apenas números), não pode ter espaços duplos ou caracteres especiais.', conexao, res);
    }

    // Validação: capacidade máxima obrigatória
    if (!qt_volume_total || qt_volume_total.trim() === "") {
        return renderComErro('Informe a capacidade máxima!', conexao, res);
    }

    // Validação: capacidade máxima (decimal positivo, até 15 dígitos, 8 casas decimais)
    const volumeValido =
        /^(\d{1,7}(\.\d{1,8})?|\d{8,15})$/.test(qt_volume_total) &&
        parseFloat(qt_volume_total) > 0;

    if (!volumeValido) {
        return renderComErro('Capacidade máxima inválida! Informe um número positivo, com até 8 casas decimais.', conexao, res);
    }

    // Inserção do estoque no banco
    const query = `
        INSERT INTO estoque (cd_planta, nm_estoque, qt_volume_total, dt_atualizacao)
        VALUES (?, ?, ?, NOW())
    `;
    const valores = [cd_planta, nm_estoque, qt_volume_total];

    console.log("Consulta SQL:", query);
    console.log("Valores a serem inseridos:", valores);

    conexao.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar estoque:', err);
            conexao.query('SELECT cd_planta, nm_planta FROM planta', (err2, resultados) => {
                if (err2) {
                    console.error('Erro ao buscar plantas:', err2);
                    return res.render('estoque', { message: 'Erro ao cadastrar o estoque.', plantas: [], codigoEstoque: null });
                }

                return res.render('estoque', {
                    message: 'Erro ao cadastrar o estoque.',
                    plantas: resultados,
                    codigoEstoque: null
                });
            });
            return;
        }

        const codigoGerado = result.insertId;

        // Log dos dados cadastrados
        console.log('Novo estoque cadastrado com sucesso:');
        console.log({
            cd_estoque: codigoGerado,
            cd_planta,
            nm_estoque,
            qt_volume_total
        });

        // Buscar as plantas novamente para mostrar no formulário após o cadastro
        conexao.query('SELECT cd_planta, nm_planta FROM planta', (err3, resultados) => {
            if (err3) {
                console.error('Erro ao buscar plantas:', err3);
                return res.render('estoque', {
                    message: 'Cadastro realizado, mas houve erro ao carregar plantas.',
                    plantas: [],
                    codigoEstoque: codigoGerado
                });
            }

            return res.render('estoque', {
                message: `Estoque cadastrado com sucesso! Código gerado: ${codigoGerado}`,
                plantas: resultados,
                codigoEstoque: codigoGerado
            });
        });
    });
}

module.exports = {
    exibirestoque,
    cadastrarEstoque
};