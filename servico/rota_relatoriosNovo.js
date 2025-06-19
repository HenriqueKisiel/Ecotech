const conectiondb = require('../bd/conexao_mysql');

// Função para verificar comandos proibidos
function contemComandoProibido(query) {
    if (!query) return false;
    const proibidos = ['update', 'delete', 'insert', 'drop', 'alter', 'truncate'];
    const lower = query.toLowerCase();
    return proibidos.some(cmd => lower.includes(cmd + ' '));
}

// GET: Carregar tela para adicionar ou editar relatório
function exibirRelatorioNovo(req, res) {
    const cd_rel = req.query.cd_rel;
    if (cd_rel) {
        const sql = 'SELECT cd_rel, ds_relatorio, query_sql FROM Relatorios WHERE cd_rel = ?';
        conectiondb().query(sql, [cd_rel], (err, results) => {
            if (err || results.length === 0) return res.render('relatoriosNovo', { usuario: req.session.usuario, erro: 'Relatório não encontrado' });
            res.render('relatoriosNovo', { usuario: req.session.usuario, relatorio: results[0] });
        });
    } else {
        res.render('relatoriosNovo', { 
        usuario: req.session.usuario
    });
    }
}

// POST: Salvar novo ou atualizar relatório
function salvarRelatorioNovo(req, res) {
    let { cd_rel, ds_relatorio, query_sql } = req.body;
    // Se vier array, pega só o primeiro valor
    if (Array.isArray(cd_rel)) cd_rel = cd_rel[0];

    // Validação de comandos proibidos
    if (contemComandoProibido(query_sql)) {
        return res.render('relatoriosNovo', {
            erro: 'Comando SQL inválido! Não é permitido usar UPDATE, DELETE, INSERT, DROP, ALTER ou TRUNCATE.',
            relatorio: req.body
        });
    }

    if (cd_rel) {
        const sql = 'UPDATE Relatorios SET ds_relatorio = ?, query_sql = ? WHERE cd_rel = ?';
        conectiondb().query(sql, [ds_relatorio, query_sql, cd_rel], (err) => {
            if (err) return res.render('relatoriosNovo', { erro: 'Erro ao atualizar relatório', relatorio: req.body });
            res.redirect('/relatorios');
        });
    } else {
        const sql = 'INSERT INTO Relatorios (ds_relatorio, query_sql) VALUES (?, ?)';
        conectiondb().query(sql, [ds_relatorio, query_sql], (err) => {
            if (err) return res.render('relatoriosNovo', { erro: 'Erro ao adicionar relatório', relatorio: req.body });
            res.redirect('/relatorios');
        });
    }
}

module.exports = {
    exibirRelatorioNovo,
    salvarRelatorioNovo
}