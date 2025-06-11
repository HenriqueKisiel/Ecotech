const conectiondb = require('../bd/conexao_mysql.js');

// Exibe o formulário de edição já preenchido
function exibirEstoqueEditar(req, res) {
    const conexao = conectiondb();
    const cd_estoque = req.params.cd_estoque;

    // Busca o estoque e as plantas
    conexao.query('SELECT * FROM estoque WHERE cd_estoque = ?', [cd_estoque], (err, resultadosEstoque) => {
        if (err || resultadosEstoque.length === 0) {
            return res.render('estoqueEditar', { message: 'Estoque não encontrado.', plantas: [], estoque: null });
        }
        const estoque = resultadosEstoque[0];
        conexao.query('SELECT cd_planta, nm_planta FROM planta', (err2, resultadosPlantas) => {
            if (err2) {
                return res.render('estoqueEditar', { message: 'Erro ao carregar plantas.', plantas: [], estoque: null });
            }
            res.render('estoqueEditar', {
                message: '',
                plantas: resultadosPlantas,
                estoque
            });
        });
    });
}

// Atualiza o estoque no banco
function editarEstoque(req, res) {
    const conexao = conectiondb();
    const { cd_estoque, cd_planta, nm_estoque, qt_volume_total } = req.body;

    // Validações (simples, pode adaptar conforme regras do cadastro)
    if (!cd_estoque || !cd_planta || !nm_estoque || !qt_volume_total) {
        return res.render('estoqueEditar', { message: 'Preencha todos os campos!', plantas: [], estoque: req.body });
    }

    const query = `
        UPDATE estoque
        SET cd_planta = ?, nm_estoque = ?, qt_volume_total = ?, dt_atualizacao = NOW()
        WHERE cd_estoque = ?
    `;
    const valores = [cd_planta, nm_estoque, qt_volume_total, cd_estoque];

    conexao.query(query, valores, (err, result) => {
        if (err) {
            return res.render('estoqueEditar', { message: 'Erro ao atualizar estoque.', plantas: [], estoque: req.body });
        }
        // Busca plantas para recarregar a tela
        conexao.query('SELECT cd_planta, nm_planta FROM planta', (err2, resultadosPlantas) => {
            res.render('estoqueEditar', {
                message: 'Estoque atualizado com sucesso!',
                plantas: resultadosPlantas,
                estoque: { cd_estoque, cd_planta, nm_estoque, qt_volume_total }
            });
        });
    });
}

module.exports = {
    exibirEstoqueEditar,
    editarEstoque
};