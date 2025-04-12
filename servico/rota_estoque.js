const conectiondb = require('../bd/conexao_mysql.js');

// FUNÇÃO: Exibir página de cadastro de novo estoque (GET)
//         E inserir novo estoque no banco (POST)
function exibirEstoqueNovo(req, res) {
    const conexao = conectiondb();

    // Se for método GET, apenas exibe a página de cadastro
    if (req.method === 'GET') {
        return res.render('estoqueNovo', { message: '' });
    }

    // Dados recebidos via POST do formulário
    const {
        codigo_planta,
        capacidade_estoque,
        linha_estoque
    } = req.body;

    // Validação: todos os campos são obrigatórios
    if (!codigo_planta || !capacidade_estoque || !linha_estoque) {
        return res.render('estoqueNovo', { message: 'Por favor, preencha todos os campos!' });
    }

    // Query SQL para inserção no banco
    const query = `
        INSERT INTO estoques (codigo_planta, capacidade_estoque, linha_estoque)
        VALUES (?, ?, ?)
    `;

    const valores = [codigo_planta, capacidade_estoque, linha_estoque];

    // Executa a inserção
    conexao.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar estoque:', err);
            return res.render('estoqueNovo', { message: 'Erro ao cadastrar o estoque.' });
        }

        console.log('Estoque cadastrado com sucesso!');
        return res.render('estoqueNovo', { message: 'Estoque cadastrado com sucesso!' });
    });
}

// FUNÇÃO: Buscar materiais no estoque conforme filtros
function exibirEstoqueBuscar(req, res) {
    const conexao = conectiondb();

    // Dados recebidos do formulário de busca
    const {
        linha_material,
        descricao_material,
        codigo_material,
        data_cadastro,
        status
    } = req.body;

    // Query base para busca (1=1 permite adicionar filtros dinâmicos)
    let query = `SELECT * FROM estoque WHERE 1=1`;
    const parametros = [];

    // Aplicação dos filtros, se fornecidos
    if (linha_material && linha_material !== 'Todas') {
        query += ` AND linha_material = ?`;
        parametros.push(linha_material);
    }

    if (descricao_material) {
        query += ` AND descricao_material LIKE ?`;
        parametros.push(`%${descricao_material}%`);
    }

    if (codigo_material) {
        query += ` AND codigo_material LIKE ?`;
        parametros.push(`%${codigo_material}%`);
    }

    if (data_cadastro) {
        query += ` AND DATE(data_entrada) = ?`;
        parametros.push(data_cadastro);
    }

    if (status && status !== 'Todos') {
        query += ` AND status = ?`;
        parametros.push(status);
    }

    // Executa a busca com os filtros aplicados
    conexao.query(query, parametros, (err, results) => {
        if (err) {
            console.error('Erro ao buscar materiais:', err);
            return res.render('estoqueBuscar', { message: 'Erro ao buscar materiais.', resultados: [] });
        }

        return res.render('estoqueBuscar', {
            message: results.length ? '' : 'Nenhum material encontrado.',
            resultados: results
        });
    });
}

// FUNÇÃO: Registrar entrada de material no estoque
function exibirEstoqueEntrada(req, res) {
    const conexao = conectiondb();

    // Exibe a página caso seja GET
    if (req.method === 'GET') {
        return res.render('estoqueEntrada', { message: '' });
    }

    // Recebe dados do formulário
    const {
        descricao_material,
        linha_material,
        quantidade,
        data_entrada
    } = req.body;

    // Validação: todos os campos obrigatórios
    if (!descricao_material || !linha_material || !quantidade || !data_entrada) {
        return res.render('estoqueEntrada', { message: 'Por favor, preencha todos os campos!' });
    }

    // Query de inserção
    const query = `
        INSERT INTO estoque (descricao_material, linha_material, quantidade, data_entrada, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    const valores = [
        descricao_material,
        linha_material,
        quantidade,
        data_entrada,
        'Em Estoque' // status padrão ao inserir
    ];

    // Executa a inserção
    conexao.query(query, valores, (err, result) => {
        if (err) {
            console.error('Erro ao registrar entrada:', err);
            return res.render('estoqueEntrada', { message: 'Erro ao registrar entrada de material.' });
        }

        console.log('Entrada registrada com sucesso!');
        return res.render('estoqueEntrada', { message: 'Entrada registrada com sucesso!' });
    });
}

// FUNÇÃO: Saída de material do estoque OU busca de materiais para saída
function exibirEstoqueSaida(req, res) {
    // Exibe página caso seja GET
    if (req.method === 'GET') {
        return res.render('estoqueSaida', { resultados: [], message: '' });
    }

    const conexao = conectiondb();

    const {
        linha_material,
        descricao_material,
        codigo_material,
        data_cadastro,
        saidas // pode estar vazio ou conter os dados de saída
    } = req.body;


    // Caso seja uma busca
    if (!saidas) {
        let query = `SELECT * FROM estoque WHERE 1=1`;
        const parametros = [];

        if (linha_material && linha_material !== 'Todas') {
            query += ` AND linha_material = ?`;
            parametros.push(linha_material);
        }

        if (descricao_material) {
            query += ` AND descricao_material LIKE ?`;
            parametros.push(`%${descricao_material}%`);
        }

        if (codigo_material) {
            query += ` AND codigo_material LIKE ?`;
            parametros.push(`%${codigo_material}%`);
        }

        if (data_cadastro) {
            query += ` AND DATE(data_entrada) = ?`;
            parametros.push(data_cadastro);
        }

        // Executa a busca
        conexao.query(query, parametros, (err, results) => {
            if (err) {
                console.error('Erro na busca:', err);
                return res.render('estoqueSaida', { resultados: [], message: 'Erro ao buscar materiais.' });
            }

            return res.render('estoqueSaida', {
                resultados: results,
                message: results.length ? '' : 'Nenhum material encontrado.'
            });
        });

    } else {
     
        // Caso esteja registrando saída
        const updates = Array.isArray(saidas) ? saidas : [saidas];
        let erros = [];
        let operacoesConcluidas = 0;

        updates.forEach((saida, index) => {
            const { id, quantidade_saida, status } = saida;

            if (!id || !quantidade_saida || !status) {
                erros.push(`Saída inválida no item ${index + 1}`);
                return checkFinalizacao();
            }

            const query = `
                UPDATE estoque 
                SET quantidade = quantidade - ?, status = ?, data_saida = NOW() 
                WHERE id = ? AND quantidade >= ?
            `;

            const valores = [quantidade_saida, status, id, quantidade_saida];

            // Executa atualização de saída
            conexao.query(query, valores, (err, result) => {
                if (err) {
                    console.error('Erro ao registrar saída:', err);
                    erros.push(`Erro ao atualizar material com ID ${id}`);
                }
                checkFinalizacao();
            });
        });

        // Checagem final para renderizar a resposta
        function checkFinalizacao() {
            operacoesConcluidas++;
            if (operacoesConcluidas === updates.length) {
                const msg = erros.length > 0
                    ? erros.join(', ')
                    : 'Saída registrada com sucesso!';
                return res.render('estoqueSaida', { resultados: [], message: msg });
            }
        }
    }
}

// Exportando todas as funções para uso nas rotas
module.exports = {
    exibirEstoqueNovo,
    exibirEstoqueBuscar,
    exibirEstoqueEntrada,
    exibirEstoqueSaida
};