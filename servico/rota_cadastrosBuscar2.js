const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a página de busca de estoques
function exibirestoqueBuscar(req, res) {
    console.log("Função exibirestoqueBuscar chamada");
    res.status(200).render('cadastrosBuscar2', { 
        usuario: req.session.usuario
    });
}

// Busca estoques ou materiais com base no tipo de cadastro e filtros
function buscarEstoques(req, res) {
    console.log("Função buscarEstoques chamada");

    const {
        tipoCadastro,
        codigoCadastro,
        nomeCadastro,
        estoqueCadastro,
        plantaCadastro
    } = req.body;

    console.log("Filtros recebidos:", req.body);

    const conexao = conectiondb(); // Assume que retorna uma conexão válida

    let sql = '';
    const params = [];

    if (tipoCadastro === 'estoque') {
        sql = `
        SELECT 
            e.cd_estoque,
            e.nm_estoque,
            e.cd_planta,
            e.qt_capacidade_atual,
            e.qt_volume_total,
            e.qt_volume_atual,
            e.qt_disponivel_volume,
            p.nm_planta
        FROM estoque e
        LEFT JOIN planta p ON e.cd_planta = p.cd_planta
        WHERE p.ie_situacao = "A"
    `;

        if (codigoCadastro) {
            sql += ' AND e.cd_estoque = ?';
            params.push(codigoCadastro);
        }

        if (nomeCadastro) {
            sql += ' AND e.nm_estoque LIKE ?';
            params.push(`%${nomeCadastro}%`);
        }

        if (plantaCadastro) {
            sql += ' AND (p.nm_planta LIKE ? OR p.cd_planta LIKE ?)';
            params.push(`%${plantaCadastro}%`, `%${plantaCadastro}%`);
        }


    } else if (tipoCadastro === 'material') {
        sql = `
            SELECT 
                m.cd_material,
        m.ds_material,
        m.vl_valor_por_kg,
        IFNULL(em.qt_peso, '-') AS qt_peso,
        IFNULL(em.qt_volume, '-') AS qt_volume,
        IFNULL(e.nm_estoque, '-') AS nm_estoque,
        IFNULL(p.nm_planta, '-') AS nm_planta
    FROM materiais m
    LEFT JOIN estoque_material em ON m.cd_material = em.cd_material
    LEFT JOIN estoque e ON em.cd_estoque = e.cd_estoque
    LEFT JOIN planta p ON e.cd_planta = p.cd_planta
    WHERE 1=1
        `;

        if (codigoCadastro) {
            sql += ' AND m.cd_material = ?';
            params.push(codigoCadastro);
        }

        if (nomeCadastro) {
            sql += ' AND m.ds_material LIKE ?';
            params.push(`%${nomeCadastro}%`);
        }

        if (estoqueCadastro) {
            sql += ' AND (e.nm_estoque LIKE ? OR e.cd_estoque LIKE ?)';
            params.push(`%${estoqueCadastro}%`, `%${estoqueCadastro}%`);
        }

    } else {
        return res.status(400).json({ erro: 'Tipo de cadastro inválido.' });
    }

    console.log("SQL gerada:", sql);
    console.log("Parâmetros:", params);

    conexao.query(sql, params, (erro, resultados) => {
        if (erro) {
            console.error("Erro ao executar a query:", erro);
            return res.status(500).json({ erro: 'Erro ao executar a busca.' });
        }

        console.log("Resultados encontrados:", resultados);
        if (resultados.length === 0) {
            console.log("Nenhum dado encontrado.");
        }

        res.status(200).json(resultados);
    });
}

module.exports = {
    exibirestoqueBuscar,
    buscarEstoques
};
