const getCon = require('../bd/conexao_mysql.js');
const con = getCon(); // pega o objeto de conexão

// Página inicial com plantas
function exibirHome(req, res) {
    const sql = 'SELECT cd_planta, nm_planta FROM planta';
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao carregar plantas:', err);
            return res.status(500).send('Erro ao carregar plantas');
        }
        console.log('Plantas carregadas:', result); // Debug
        res.render('home', { plantas: result });
    });
}


// Endpoint para buscar dados do dashboard de uma planta (agora usando volume)
function dadosDashboard(req, res) {
    const cd_planta = req.params.cd_planta;
    console.log('cd_planta recebido:', cd_planta);

    // Busca volume total e atual
    const sqlPlanta = 'SELECT qt_capacidade_total_volume, qt_capacidade_atual_volume FROM planta WHERE cd_planta = ?';
    const sqlEstoque = 'SELECT nm_estoque, COALESCE(qt_volume_total, 0) as qt_volume_total, COALESCE(qt_volume_atual, 0) as qt_volume_atual, COALESCE(qt_capacidade_atual, 0) as qt_capacidade_atual FROM estoque WHERE cd_planta = ?';

    con.query(sqlPlanta, [cd_planta], (err1, resultPlanta) => {
        if (err1) {
            console.error('Erro consulta planta:', err1);
            return res.status(500).json({ erro: err1 });
        }
        if (resultPlanta.length === 0) {
            console.warn('Planta não encontrada para id:', cd_planta);
            return res.status(404).json({ erro: 'Planta não encontrada' });
        }

        con.query(sqlEstoque, [cd_planta], (err2, resultEstoque) => {
            if (err2) {
                console.error('Erro consulta estoque:', err2);
                return res.status(500).json({ erro: err2 });
            }

            res.json({
                planta: resultPlanta[0],
                estoques: resultEstoque
            });
        });
    });
}

// Endpoint para retornar o total de coletas realizadas por planta
function totalColetasPlanta(req, res) {
    const cd_planta = req.params.cd_planta;
    // Se não informar planta, retorna 0
    if (!cd_planta || cd_planta === '0') {
        return res.json({ total: 0 });
    }
    // Consulta baseada no select fornecido
    const sql = `SELECT COUNT(DISTINCT a.cd_agendamento) as total
        FROM agendamento a
        LEFT JOIN pontos_coleta pc ON pc.cd_agendamento = a.cd_agendamento
        LEFT JOIN rota_coleta rc ON rc.cd_rota = pc.ie_rota
        LEFT JOIN planta p ON p.cd_planta = pc.cd_planta
        WHERE a.dt_coleta IS NOT NULL
            AND a.dt_pesagem IS NOT NULL
            AND a.dt_separacao IS NULL
            AND pc.cd_planta = ?`;
    con.query(sql, [cd_planta], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        res.json({ total: result[0]?.total || 0 });
    });
}

// Endpoint para faturamento mensal por planta
function faturamentoMensalPlanta(req, res) {
    const cd_planta = req.params.cd_planta;
    const ano = 2025; // Ano fixo para o dashboard
    const sql = `
        SELECT 
            MONTH(m.dt_movimentacao) AS mes,
            SUM(m.qt_peso * m.vl_valor_por_kg) AS faturamento_total
        FROM movimentacoes m
        JOIN estoque_material em ON m.cd_estoque = em.cd_estoque AND m.cd_material = em.cd_material
        JOIN estoque e ON e.cd_estoque = em.cd_estoque
        WHERE m.tipo_movimentacao = 'venda'
          AND e.cd_planta = ?
          AND YEAR(m.dt_movimentacao) = ?
        GROUP BY mes
        ORDER BY mes
    `;
    con.query(sql, [cd_planta, ano], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        // Monta array de 12 meses, preenchendo 0 onde não houver faturamento
        const faturamento = Array(12).fill(0);
        result.forEach(row => {
            faturamento[row.mes - 1] = parseFloat(row.faturamento_total) || 0;
        });
        res.json({ faturamento });
    });
}

// Endpoint para peso coletado mensal por planta
function pesoColetadoMensalPlanta(req, res) {
    const cd_planta = req.params.cd_planta;
    const ano = 2025;
    const sql = `
        SELECT 
            MONTH(a.dt_coleta) AS mes,
            SUM(a.qt_peso_real) AS peso_total
        FROM agendamento a
        JOIN materiais_agenda ma ON a.cd_agendamento = ma.ie_agenda
        JOIN estoque_material em ON ma.ie_material = em.cd_material
        JOIN estoque e ON em.cd_estoque = e.cd_estoque
        WHERE a.dt_coleta IS NOT NULL
          AND e.cd_planta = ?
          AND YEAR(a.dt_coleta) = ?
        GROUP BY mes
        ORDER BY mes
    `;
    con.query(sql, [cd_planta, ano], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        const pesos = Array(12).fill(0);
        result.forEach(row => {
            pesos[row.mes - 1] = parseFloat(row.peso_total) || 0;
        });
        res.json({ pesos });
    });
}

// Endpoint para proporção de movimentações (entrada, saída, venda) por planta
function proporcaoMovimentacoesPlanta(req, res) {
    const cd_planta = req.params.cd_planta;
    const sql = `
        SELECT 
            m.tipo_movimentacao,
            COUNT(*) AS total_movimentacoes
        FROM movimentacoes m
        JOIN estoque e ON m.cd_estoque = e.cd_estoque
        WHERE e.cd_planta = ?
        GROUP BY m.tipo_movimentacao
        ORDER BY m.tipo_movimentacao
    `;
    con.query(sql, [cd_planta], (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        const labels = result.map(row => row.tipo_movimentacao);
        const dados = result.map(row => parseInt(row.total_movimentacoes) || 0);
        res.json({ labels, dados });
    });
}

module.exports = {
    exibirHome,
    dadosDashboard,
    totalColetasPlanta,
    faturamentoMensalPlanta,
    pesoColetadoMensalPlanta,
    proporcaoMovimentacoesPlanta
}
