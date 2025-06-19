const conectiondb = require('../bd/conexao_mysql.js');

// Exibe a página de entrada de estoque com a lista de movimentações
function exibirmovimentacoesBuscar(req, res) {
    const conexao = conectiondb();
    const query = `
    SELECT 
        m.cd_movimentacao,
        m.cd_agendamento,
        e.nm_estoque AS nome_estoque,
        mat.ds_material AS nome_material,
        m.qt_volume,
        m.qt_peso,
        m.tipo_movimentacao,
        m.ds_motivo,
        pf.nm_pessoa_fisica AS nome_pessoa_fisica,
        pj.nm_fantasia AS nome_pessoa_juridica,
        m.vl_valor_por_kg,
        m.dt_movimentacao
    FROM movimentacoes m
    LEFT JOIN estoque e ON m.cd_estoque = e.cd_estoque
    LEFT JOIN materiais mat ON m.cd_material = mat.cd_material
    LEFT JOIN pessoa_fisica pf ON m.cd_pessoa_fisica = pf.cd_pessoa_fisica
    LEFT JOIN pessoa_juridica pj ON m.cd_pessoa_juridica = pj.cd_pessoa_juridica
    ORDER BY m.dt_movimentacao DESC
    `;
    conexao.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar movimentações:', err);
            return res.render('movimentacoesBuscar', { movimentacoes: [], message: 'Erro ao buscar movimentações.' });
        }
        // Formata a data no backend para facilitar o uso no front
        const movimentacoes = results.map(mov => {
            const data = new Date(mov.dt_movimentacao);
            const pad = n => n.toString().padStart(2, '0');
            mov.dt_movimentacao_formatada =
                pad(data.getHours()) + ':' + pad(data.getMinutes()) + ' - ' +
                pad(data.getDate()) + '/' + pad(data.getMonth() + 1) + '/' + data.getFullYear();
            return mov;
        });
        res.render('movimentacoesBuscar', {
            usuario: req.session.usuario,
            movimentacoes, 
            message: '' 
        });
    });
}

module.exports = {
    exibirmovimentacoesBuscar
};