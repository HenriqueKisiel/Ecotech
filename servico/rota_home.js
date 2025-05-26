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


// Endpoint para buscar dados do dashboard de uma planta
function dadosDashboard(req, res) {
    const cd_planta = req.params.cd_planta;
    console.log('cd_planta recebido:', cd_planta);

    const sqlPlanta = 'SELECT qt_capacidade_total_kg, qt_capacidade_atual_kg FROM planta WHERE cd_planta = ?';
    const sqlEstoque = 'SELECT nm_estoque, qt_capacidade_maxima, qt_disponivel FROM estoque WHERE cd_planta = ?';

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

            console.log('Dados planta:', resultPlanta[0]);
            console.log('Estoques encontrados:', resultEstoque.length);
            res.json({
                planta: resultPlanta[0],
                estoques: resultEstoque
            });
        });
    });
}

// Endpoint para retornar o total de coletas realizadas na planta
function totalColetasPlanta(req, res) {
    // Indicador geral: total de coletas realizadas (status = 'ativo')
    const sql = "SELECT COUNT(*) as total FROM agendamento WHERE status = 'ativo'";
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ erro: err });
        res.json({ total: result[0]?.total || 0 });
    });
}

// Gráfico 1: Quantidade de agendamentos por mês para a planta selecionada
// Gráfico 2: Quantidade de materiais diferentes agendados para a planta selecionada
function graficosDashboard(req, res) {
    const cd_planta = req.params.cd_planta;
    // Gráfico 1: Agendamentos por mês (usando estoques da planta)
    const sqlGrafico1 = `
        SELECT MONTH(a.dt_solicitada) as mes_num, YEAR(a.dt_solicitada) as ano, COUNT(DISTINCT a.cd_agendamento) as total
        FROM agendamento a
        JOIN materiais_agenda ma ON ma.ie_agenda = a.cd_agendamento
        JOIN estoque e ON e.cd_planta = ?
        GROUP BY ano, mes_num
        ORDER BY ano, mes_num
    `;
    // Gráfico 2: Materiais diferentes agendados para a planta
    const sqlGrafico2 = `
        SELECT m.ds_material, COUNT(*) as total
        FROM materiais_agenda ma
        JOIN materiais m ON ma.ie_material = m.cd_material
        JOIN agendamento a ON ma.ie_agenda = a.cd_agendamento
        JOIN estoque e ON e.cd_planta = ?
        GROUP BY m.ds_material
        ORDER BY total DESC
    `;
    con.query(sqlGrafico1, [cd_planta], (err1, rows1) => {
        if (err1) return res.status(500).json({ erro: err1 });
        con.query(sqlGrafico2, [cd_planta], (err2, rows2) => {
            if (err2) return res.status(500).json({ erro: err2 });
            res.json({
                grafico1: {
                    meses: rows1.map(r => r.mes_num),
                    anos: rows1.map(r => r.ano),
                    valores: rows1.map(r => r.total)
                },
                grafico2: {
                    labels: rows2.map(r => r.ds_material),
                    valores: rows2.map(r => Number(r.total))
                }
            });
        });
    });
}

module.exports = {
    exibirHome,
    dadosDashboard,
    totalColetasPlanta,
    graficosDashboard
}
