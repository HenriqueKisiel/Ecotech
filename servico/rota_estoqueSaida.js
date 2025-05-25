const conectiondb = require('../bd/conexao_mysql.js');

// Renderiza a tela estoqueSaida com as plantas carregadas
function exibirestoqueSaida(req, res) {
    const conexao = conectiondb();

    const query = 'SELECT cd_planta, nm_planta FROM planta';

    conexao.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar plantas:', err);
            return res.render('estoqueSaida', {
                resultados: [],
                message: 'Erro ao carregar plantas.',
                plantas: []
            });
        }

        return res.render('estoqueSaida', {
            resultados: [],
            message: '',
            plantas: results
        });
    });
}

// Obtém estoques de uma planta (por parâmetro cd_planta)
function obterEstoquesPorPlanta(req, res) {
    const cd_planta = req.params.cd_planta;
    const conexao = conectiondb();

    const query = 'SELECT cd_estoque, nm_estoque FROM estoque WHERE cd_planta = ?';

    conexao.query(query, [cd_planta], (err, results) => {
        if (err) {
            console.error('Erro ao buscar estoques:', err);
            return res.status(500).json({ erro: 'Erro ao buscar estoques' });
        }
        return res.json(results);
    });
}

// Obtém materiais filtrando por estoqueId e tipo de movimentacao (entrada/saida/venda)
function obterMateriaisPorEstoque(req, res) {
    const estoqueId = req.params.estoqueId;
    const movimentacao = req.params.movimentacao; // entrada, saida ou venda

    console.log('DEBUG:', { estoqueId, movimentacao });
    const conexao = conectiondb();

    if (!estoqueId) {
        return res.status(400).json({ erro: 'Estoque inválido' });
    }

    let query = '';
    let params = [];

    if (movimentacao === 'entrada') {
        // Para entrada, traz todos materiais cadastrados
        query = 'SELECT cd_material, ds_material FROM materiais ORDER BY ds_material ASC';
    } else if (movimentacao === 'saida' || movimentacao === 'venda') {
        // Para saida e venda, traz todos materiais vinculados ao estoque (independente da quantidade)
        query = `
            SELECT m.cd_material, m.ds_material
            FROM materiais m
            INNER JOIN estoque_material em ON m.cd_material = em.cd_material
            WHERE em.cd_estoque = ?
            ORDER BY m.ds_material ASC
        `;
        params = [estoqueId];
    } else {
        return res.status(400).json({ erro: 'Movimentação inválida' });
    }

    conexao.query(query, params, (err, results) => {
        if (err) {
            console.error('Erro ao buscar materiais:', err);
            return res.status(500).json({ erro: 'Erro ao buscar materiais' });
        }
        res.json(results);
    });
}

// Obtém todos os materiais (sem filtro)
function obterTodosMateriais(req, res) {
    const conexao = conectiondb();
    const query = 'SELECT cd_material, ds_material FROM materiais ORDER BY ds_material ASC';

    conexao.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar todos os materiais:', err);
            return res.status(500).json({ erro: 'Erro ao buscar materiais' });
        }
        res.json(results);
    });
}

// Buscar pessoas físicas
function obterPessoasFisicas(req, res) {
    const conexao = require('../bd/conexao_mysql.js')();
    const query = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica, nr_telefone_celular, ds_email, nr_cpf, nr_cep FROM pessoa_fisica';
    conexao.query(query, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
}

// Buscar pessoas jurídicas
function obterPessoasJuridicas(req, res) {
    const conexao = require('../bd/conexao_mysql.js')();
    const query = 'SELECT cd_pessoa_juridica, nm_fantasia, nr_telefone, ds_email, nr_cnpj, nr_cep FROM pessoa_juridica';
    conexao.query(query, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
}

// Buscar dados do material selecionado no estoque
function obterDadosMaterialEstoque(req, res) {
    const cd_estoque = req.params.cd_estoque;
    const cd_material = req.params.cd_material;
    const conexao = conectiondb();

    const query = `
        SELECT m.ds_material, em.qt_volume, em.qt_peso
        FROM estoque_material em
        INNER JOIN materiais m ON m.cd_material = em.cd_material
        WHERE em.cd_estoque = ? AND em.cd_material = ?
        LIMIT 1
    `;

    conexao.query(query, [cd_estoque, cd_material], (err, results) => {
        if (err) {
            console.error('Erro ao buscar dados do material:', err);
            return res.status(500).json({ erro: 'Erro ao buscar dados do material' });
        }
        res.json(results[0] || {});
    });
}

// Buscar dados do material para entrada (traz 0 se não existir no estoque)
function obterDadosMaterialEntrada(req, res) {
    const cd_estoque = req.params.cd_estoque;
    const cd_material = req.params.cd_material;
    const conexao = conectiondb();

    const query = `
        SELECT m.ds_material,
               IFNULL(em.qt_volume, 0) as qt_volume,
               IFNULL(em.qt_peso, 0) as qt_peso
        FROM materiais m
        LEFT JOIN estoque_material em
            ON m.cd_material = em.cd_material AND em.cd_estoque = ?
        WHERE m.cd_material = ?
        LIMIT 1
    `;

    conexao.query(query, [cd_estoque, cd_material], (err, results) => {
        if (err) {
            console.error('Erro ao buscar dados do material:', err);
            return res.status(500).json({ erro: 'Erro ao buscar dados do material' });
        }
        res.json(results[0] || {});
    });
}

module.exports = {
    exibirestoqueSaida,
    obterEstoquesPorPlanta,
    obterMateriaisPorEstoque,
    obterTodosMateriais,
    obterPessoasFisicas,
    obterPessoasJuridicas,
    obterDadosMaterialEstoque,
    obterDadosMaterialEntrada,
};