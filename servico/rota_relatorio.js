const conectiondb = require('../bd/conexao_mysql.js');
const exceljs = require('exceljs');

//Função para pagina relatorios
function exibirRelatorios(req, res) {
    const sql = 'SELECT cd_rel, ds_relatório FROM Relatorios';
    conectiondb().query(sql, (err, relatorios) => {
        if (err) return res.status(500).send('Erro ao buscar relatórios');
        res.render('relatorios', { relatorios });
    });
};

//Função para pagina cadastrar relatorios
function exibirCadastrarRelatorios(req, res) {
    res.render('relatoriosNovo');
};

// Exportar relatório para Excel
function exportarRelatorio(req, res) {
    const cd_rel = req.params.cd_rel;
    const sqlBusca = 'SELECT query_sql, ds_relatório FROM Relatorios WHERE cd_rel = ?';
    conectiondb().query(sqlBusca, [cd_rel], (err, results) => {
        if (err || results.length === 0) return res.status(404).send('Relatório não encontrado');
        const query = results[0].query_sql;
        const nomeRel = results[0].ds_relatório || 'relatorio';

        conectiondb().query(query, async (err2, rows) => {
            if (err2) return res.status(500).send('Erro ao executar relatório');
            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet('Relatório');
            if (rows.length > 0) {
                worksheet.columns = Object.keys(rows[0]).map(key => ({ header: key, key }));
                rows.forEach(row => worksheet.addRow(row));
            }
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${nomeRel}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        });
    });
}

// Filtrar relatórios
function filtrarRelatorios(req, res) {
    const filtro = req.body.filtro || '';
    const sql = `
        SELECT cd_rel, ds_relatório 
        FROM Relatorios 
        WHERE ds_relatório LIKE ? OR cd_rel LIKE ?
    `;
    const param = `%${filtro}%`;
    conectiondb().query(sql, [param, param], (err, relatorios) => {
        if (err) return res.status(500).send('Erro ao buscar relatórios');
        res.render('relatorios', { relatorios, filtro });
    });
}

//exportando a função 
module.exports = {
    exibirRelatorios,
    exibirCadastrarRelatorios,
    exportarRelatorio,
    filtrarRelatorios
}