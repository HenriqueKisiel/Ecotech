const conectiondb = require('../bd/conexao_mysql.js');
const exceljs = require('exceljs');
const PDFDocument = require('pdfkit');
require('pdfkit-table');


//Função para pagina relatorios
function exibirRelatorios(req, res) {
    const sql = 'SELECT cd_rel, ds_relatorio FROM Relatorios';
    conectiondb().query(sql, (err, relatorios) => {
        if (err) return res.status(500).send('Erro ao buscar relatórios');
        res.render('relatorios', { 
            usuario: req.session.usuario,
            relatorios 
        });
    });
};

//Função para pagina cadastrar relatorios
function exibirCadastrarRelatorios(req, res) {
    res.render('relatoriosNovo');
};

// Exportar relatório para Excel
function exportarRelatorio(req, res) {
    const cd_rel = req.params.cd_rel;
    const sqlBusca = 'SELECT query_sql, ds_relatorio FROM Relatorios WHERE cd_rel = ?';
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
        SELECT cd_rel, ds_relatorio 
        FROM Relatorios 
        WHERE ds_relatorio LIKE ? OR cd_rel LIKE ?
    `;
    const param = `%${filtro}%`;
    conectiondb().query(sql, [param, param], (err, relatorios) => {
        if (err) return res.status(500).send('Erro ao buscar relatórios');
        res.render('relatorios', { 
            usuario: req.session.usuario,
            relatorios, 
            filtro 
        });
    });
}


// Exportar relatório para PDF
function exportarRelatorioPDF(req, res) {
    const cd_rel = req.params.cd_rel;
    const sqlBusca = 'SELECT query_sql, ds_relatorio FROM Relatorios WHERE cd_rel = ?';

    conectiondb().query(sqlBusca, [cd_rel], (err, results) => {
        if (err || results.length === 0) {
            console.log('Erro ao buscar relatório:', err);
            return res.status(404).send('Relatório não encontrado');
        }

        const query = results[0].query_sql;
        const nomeRel = results[0].ds_relatorio || 'relatorio';

        conectiondb().query(query, (err2, rows) => {
            if (err2) {
                console.log('Erro ao executar query:', err2);
                return res.status(500).send('Erro ao executar relatório');
            }

            const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${nomeRel}.pdf`);
            doc.pipe(res);

            doc.fontSize(20).text(nomeRel, { align: 'center' });
            doc.moveDown(1);

            if (rows.length > 0) {
                const headers = Object.keys(rows[0]);
                const startX = doc.page.margins.left;
                let posY = doc.y + 10;
                const columnWidth = 100;

                // Cabeçalhos
                headers.forEach((header, i) => {
                    doc.font('Helvetica-Bold')
                        .fontSize(10)
                        .text(header, startX + i * columnWidth, posY, { width: columnWidth, align: 'center' });
                });

                posY += 20;

                // Dados
                rows.forEach(row => {
                    headers.forEach((header, i) => {
                        const text = row[header] !== null && row[header] !== undefined ? String(row[header]) : '';
                        doc.font('Helvetica')
                            .fontSize(9)
                            .text(text, startX + i * columnWidth, posY, { width: columnWidth, align: 'center' });
                    });
                    posY += 18;

                    // Quebra de página automática
                    if (posY >= doc.page.height - doc.page.margins.bottom - 30) {
                        doc.addPage();
                        posY = doc.page.margins.top;
                    }
                });

            } else {
                doc.fontSize(12).text('Nenhum dado encontrado.');
            }

            doc.end();
        });
    });
}





//exportando a função 
module.exports = {
    exibirRelatorios,
    exibirCadastrarRelatorios,
    exportarRelatorio,
    filtrarRelatorios,
    exportarRelatorioPDF
}