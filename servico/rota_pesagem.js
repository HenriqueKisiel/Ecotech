const conectiondb = require('../bd/conexao_mysql.js');
const multer = require('multer');
const upload = multer();

//Função para pagina home
function exibirpesagem(req, res) {
    res.render('pesagem', { 
        usuario: req.session.usuario
    });
};


function buscarAgendamentoMaterial(req, res) {
    const sql = `SELECT a.cd_agendamento, a.nm_agendamento, a.ds_endereco, a.qt_quantidade_prevista_kg, a.qt_peso_real,status
        FROM agendamento a
            LEFT JOIN pontos_coleta pc ON a.cd_agendamento = pc.cd_agendamento
            LEFT JOIN rota_coleta rc ON pc.ie_rota = rc.cd_rota
        WHERE a.dt_coleta IS NOT NULL 
            AND a.dt_pesagem IS NULL 
            AND a.dt_separacao IS NULL
            AND rc.dt_fim IS NOT NULL`;
    conectiondb().query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar Agendamentos:', erro);
            return res.status(500).send('Erro ao buscar Agendamentos.');
        }
        res.json(resultados);
    });
}


function buscarItensgenda(req, res) {
    const { ie_agenda, ie_linha } = req.query;

    if (!ie_agenda || !ie_linha) {
        console.error('Parâmetros ie_agenda ou ie_linha não fornecidos.');
        return res.status(400).send('Parâmetros ie_agenda e ie_linha são obrigatórios.');
    }

    const connection = conectiondb(); // Criar a conexão

    const sql = `
        SELECT 
            a.cd_mat_agenda, 
            a.ie_agenda, 
            a.ds_mat_agenda, 
            a.qt_peso_material_total_kg, 
            a.qt_peso_final  
        FROM materiais_agenda a, agendamento b
        WHERE a.ie_agenda = b.cd_agendamento
          AND a.ie_agenda = ?
          AND a.ie_linha = ?
    `;

    connection.query(sql, [ie_agenda, ie_linha], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar itens do agendamento e linha:', erro);
            return res.status(500).send('Erro ao buscar itens do agendamento e linha.');
        }

        console.log(`Resultados do agendamento ${ie_agenda} e linha ${ie_linha}`);
        res.json(resultados); // Enviar os resultados como JSON
    });

    connection.end(); // Fechar a conexão
}


function atualizarPesos(req, res) {
    upload.none()(req, res, function (err) {
        if (err) {
            console.error('Erro ao processar o formulário:', err);
            return res.status(500).send('Erro ao processar o formulário.');
        }

        const dados = req.body;
        if (!dados || !dados.pesoFinal) {
            console.error('Nenhum dado enviado ou pesoFinal está ausente:', dados);
            return res.status(400).send('Nenhum dado enviado ou pesoFinal está ausente.');
        }

        // Transformar os dados de pesoFinal em um objeto utilizável
        const pesoFinal = Object.entries(dados.pesoFinal).reduce((acc, [key, value]) => {
            if (value) acc[key] = value;
            return acc;
        }, {});

        // Atualizar os pesos dos materiais
        const updates = Object.entries(pesoFinal).map(([cd_mat_agenda, qt_peso_final]) => {
            return new Promise((resolve, reject) => {
                const sql = `
                    UPDATE materiais_agenda
                    SET qt_peso_final = ?
                    WHERE cd_mat_agenda = ?
                `;
                conectiondb().query(sql, [qt_peso_final, cd_mat_agenda], (erro, resultados) => {
                    if (erro) return reject(erro);
                    resolve(resultados);
                });
            });
        });

        Promise.all(updates)
            .then(() => {
                res.json({ mensagem: 'Pesos atualizados com sucesso!' });
            })
            .catch(erro => {
                console.error('Erro ao atualizar os pesos:', erro);
                // Só envia resposta se ainda não foi enviada
                if (!res.headersSent) {
                    res.status(500).send('Erro ao atualizar os pesos.');
                }
            });
    });
}


function concluirPesagem(req, res) {
    const { ie_agenda } = req.body;
    if (!ie_agenda) {
        return res.status(400).json({ mensagem: 'Agendamento não informado.' });
    }

    // 1. Verificar se todos os itens têm qt_peso_final preenchido
    const sqlVerifica = `
        SELECT cd_mat_agenda 
        FROM materiais_agenda 
        WHERE ie_agenda = ? AND (qt_peso_final IS NULL OR qt_peso_final = '')
    `;
    conectiondb().query(sqlVerifica, [ie_agenda], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao verificar pesos finais:', erro);
            return res.status(500).json({ mensagem: 'Erro ao verificar pesos finais.' });
        }
        if (resultados.length > 0) {
            return res.status(400).json({ mensagem: 'Todos os itens devem ter o peso final preenchido antes de concluir a pesagem.' });
        }

        // 2. Se todos preenchidos, atualizar dt_pesagem
        const sql = `UPDATE agendamento SET dt_pesagem = SYSDATE() WHERE cd_agendamento = ?`;
        conectiondb().query(sql, [ie_agenda], (erro2, resultado) => {
            if (erro2) {
                console.error('Erro ao concluir pesagem:', erro2);
                return res.status(500).json({ mensagem: 'Erro ao concluir pesagem.' });
            }
            res.json({ mensagem: 'Pesagem concluída com sucesso!' });
        });
    });
}

function exibirseparacao(req, res) {
    const cd_agendamento = req.query.cd_agendamento; // ou req.params.cd_agendamento se for rota dinâmica
    res.render('separacao', { 
        usuario: req.session.usuario,
        cd_agendamento 
    });
};

//exportando a função 
module.exports = {
    exibirpesagem,
    buscarAgendamentoMaterial,
    buscarItensgenda,
    atualizarPesos,
    concluirPesagem,
    exibirseparacao
}