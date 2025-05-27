const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a página de cadastro de estoque (GET)
function exibirestoqueNovo(req, res) {
    const conexao = conectiondb();

    // Carrega a lista de plantas
    conexao.query('SELECT cd_planta, nm_planta FROM planta', (err, resultados) => {
        if (err) {
            console.error('Erro ao buscar plantas:', err);
            return res.render('estoqueNovo', { message: 'Erro ao carregar plantas.', plantas: [] });
        }

        // Exibe o formulário de cadastro de estoque com a lista de plantas
        return res.render('estoqueNovo', { message: '', plantas: resultados });
    });
}

// Função para cadastrar um novo estoque (POST)
function cadastrarEstoque(req, res) {
    const conexao = conectiondb();
    console.log("Body recebido:", req.body);
    const { cd_planta, nm_estoque, qt_volume_total } = req.body;

    console.log("Dados recebidos no servidor:", {
        cd_planta,
        nm_estoque,
        qt_volume_total
    });

    // Validação dos campos
    if (!cd_planta || !nm_estoque || !qt_volume_total) {
        conexao.query('SELECT cd_planta, nm_planta FROM planta', (err, resultados) => {
            if (err) {
                console.error('Erro ao buscar plantas:', err);
                return res.render('estoqueNovo', { message: 'Erro ao carregar plantas.', plantas: [], codigoEstoque: null });
            }

            return res.render('estoqueNovo', {
                message: 'Por favor, preencha todos os campos!',
                plantas: resultados,
                codigoEstoque: null
            });
        });
        return;
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
                    return res.render('estoqueNovo', { message: 'Erro ao cadastrar o estoque.', plantas: [], codigoEstoque: null });
                }

                return res.render('estoqueNovo', {
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
                return res.render('estoqueNovo', {
                    message: 'Cadastro realizado, mas houve erro ao carregar plantas.',
                    plantas: [],
                    codigoEstoque: codigoGerado
                });
            }

            return res.render('estoqueNovo', {
                message: `Estoque cadastrado com sucesso! Código gerado: ${codigoGerado}`,
                plantas: resultados,
                codigoEstoque: codigoGerado
            });
        });
    });
}



module.exports = {
    exibirestoqueNovo,
    cadastrarEstoque
};
