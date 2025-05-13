const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina Atualizar status
function exibirAtualizarRotas(req, res) {
    const cd_rota = req.params.cd_rota;

    const connection = conectiondb();

    const query1 = `
        SELECT cd_rota, nm_rota, nr_distancia_km, qt_peso_total_kg, 
               DATE_FORMAT(dt_agendada, '%d/%m/%Y') AS dt_agendada,
               dt_iniciado, dt_fim
        FROM rota_coleta WHERE cd_rota = ?`;

    const query2 = `
        SELECT * FROM vw_pontos_coleta WHERE cd_rota = ?`;

    connection.query(query1, [cd_rota], function (erro1, resultado1) {
        if (erro1) throw erro1;

        connection.query(query2, [cd_rota], function (erro2, resultado2) {
            if (erro2) throw erro2;


            // Verifica se a data de início é inválida
            const isDateValid = resultado1[0].dt_iniciado !== '0000-00-00 00:00:00';
            const isColetaValid = resultado2.dt_coleta !== '000000';
            

            res.render('attStatus', {
                rotas: resultado1[0],
                pontos: resultado2,
                naoIniciou: isDateValid, // Passa a variável para o front
                naoColetou: isColetaValid // Passa coleta para o front

            });
        });
    });
};


//Iniciar uma rota
async function atualizarStatusRota(req, res) {
    const connection = conectiondb();
    const cd_rota = req.params.cd_rota;
    const { acao } = req.body;
    const dataHoraAtual = new Date();

    let coluna;
    if (acao === 'iniciar') {
        coluna = 'dt_iniciado';
    } else if (acao === 'finalizar') {
        coluna = 'dt_fim';
    } else {
        return res.status(400).json({ success: false, message: 'Ação inválida' });
    }

    const query = `UPDATE rota_coleta SET ${coluna} = ? WHERE cd_rota = ?`;

    connection.query(query, [dataHoraAtual, cd_rota], (erro, resultado) => {
        if (erro) {
            console.error(`Erro ao atualizar ${coluna}:`, erro);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
}

async function atualizarDataColeta(req, res) {
    const connection = conectiondb();
    const { cd_agendamento } = req.params;
    const { acao } = req.body;
    const dataAtual = new Date();

    let query;
    if (acao === 'coletar') {
        query = `UPDATE agendamento SET dt_coleta = ? WHERE cd_agendamento = ?`;
    } else if (acao === 'cancelar') {
        query = `UPDATE agendamento SET dt_cancelado = ? WHERE cd_agendamento = ?`;
        // Se quiser uma coluna separada para cancelamento, adicione lógica aqui.
    } else {
        return res.status(400).json({ success: false, message: 'Ação inválida' });
    }

    connection.query(query, [dataAtual, cd_agendamento], (erro, resultado) => {
        if (erro) {
            console.error("Erro ao atualizar data_coleta:", erro);
            return res.json({ success: false });
        }

        return res.json({ success: true });
    });
}




//exportando a função 
module.exports = {
    exibirAtualizarRotas,
    atualizarStatusRota,
    atualizarDataColeta,
}