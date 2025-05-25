const conectiondb = require('../bd/conexao_mysql.js');
const multer = require('multer');
const upload = multer();

//Função para pagina home
function exibirNovoMaterial(req, res) {
    res.render('novoMaterial');
};


function buscarAgendamentoMaterial(req, res) {
    const sql = 'SELECT cd_agendamento, nm_agendamento, ds_endereco, qt_quantidade_prevista_kg, qt_peso_real,status FROM agendamento WHERE dt_coleta IS NOT NULL AND dt_pesagem IS NULL AND dt_separacao IS NULL';
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
                // Atualizar o campo dt_pesagem na tabela agendamento
                // Pegue o ie_agenda do primeiro material atualizado
                const cd_mat_agenda = Object.keys(pesoFinal)[0];
                const sqlBuscaAgenda = `SELECT ie_agenda FROM materiais_agenda WHERE cd_mat_agenda = ? LIMIT 1`;
                conectiondb().query(sqlBuscaAgenda, [cd_mat_agenda], (erro, resultado) => {
                    if (erro || !resultado.length) {
                        return res.json({ mensagem: 'Pesos atualizados, mas não foi possível atualizar a data de pesagem.' });
                    }
                    const ie_agenda = resultado[0].ie_agenda;
                    const sqlUpdateAgendamento = `UPDATE agendamento SET dt_pesagem = SYSDATE() WHERE cd_agendamento = ?`;
                    conectiondb().query(sqlUpdateAgendamento, [ie_agenda], (erro2) => {
                        if (erro2) {
                            return res.json({ mensagem: 'Pesos atualizados, mas não foi possível atualizar a data de pesagem.' });
                        }
                        res.json({ mensagem: 'Pesos e data de pesagem atualizados com sucesso!' });
                    });
                });
            })
            .catch(erro => {
                console.error('Erro ao atualizar os pesos:', erro);
                res.status(500).send('Erro ao atualizar os pesos.');
            });
    });
}


//exportando a função 
module.exports = {
    exibirNovoMaterial,
    buscarAgendamentoMaterial,
    buscarItensgenda,
    atualizarPesos    
}