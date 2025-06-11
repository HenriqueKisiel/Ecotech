const nodemailer = require('nodemailer');
const con = require('../bd/conexao_mysql.js');

async function enviarFeedbackEmail(cd_agendamento, callback) {
    const sql = `
        SELECT pf.ds_email 
        FROM agendamento a
        JOIN pessoa_fisica pf ON a.cd_pessoa_fisica = pf.cd_pessoa_fisica
        WHERE a.cd_agendamento = ? AND a.dt_coleta IS NOT NULL
    `;
    con().query(sql, [cd_agendamento], async (err, results) => {
        if (err || results.length === 0) return callback('E-mail não encontrado ou coleta não realizada');
        const email = results[0].ds_email;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_GMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const link = `http://localhost:8080/feedback/${cd_agendamento}`;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_GMAIL,
                to: email,
                subject: 'Feedback da Coleta Ecotech',
                html: `<p>Olá! Por favor, preencha o formulário de feedback da sua coleta:</p>
                       <a href="${link}">${link}</a>`
            });
            callback(null, 'E-mail de feedback enviado!');
        } catch (error) {
            callback('Erro ao enviar e-mail: ' + error.message);
        }
    });
}

function salvarFeedback(cd_agendamento, ds_feedback, nr_nota, callback) {
    const sql = `INSERT INTO feedback (cd_agendamento, ds_feedback, nr_nota) VALUES (?, ?, ?)`;
    con().query(sql, [cd_agendamento, ds_feedback, nr_nota], (err, result) => {
        if (err) return callback('Erro ao salvar feedback');
        callback(null, 'Feedback registrado com sucesso!');
    });
}

module.exports = { enviarFeedbackEmail, salvarFeedback };