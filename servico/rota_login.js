//importar o módulo de conexão com o banco de dados
const conectiondb = require('../bd/conexao_mysql.js');
const nodemailer = require('nodemailer');

//Função para exibir a padrao
function exibirPadrao(req, res) {  
    var message = ' ';
    res.render('formulario', { message: message });
};

//função para exibir o login
function fazerLogin(req, res) {
     //pega os valores digitados pelo usuário
     var login = req.body.login;
     var Senha = req.body.Senha;
     //conexão com banco de dados
     var conexao = conectiondb();
     //query de execução
     var query = 'SELECT * FROM usuario WHERE senha = ? AND login like ?';
 
     //execução da query
     conexao.query(query, [Senha, login], function (err, results) {
         if (err) {
             console.error('Erro ao executar a query:', err);
             res.status(500).send('Erro ao executar a query');
             return;
         }
         if (results.length > 0) {
             req.session.user = login; //seção de identificação            
             console.log("Login feito com sucesso!");
             res.render('home', { message: results });
         } else {
             var message = 'Login incorreto!';
             res.render('formulario', { message: message });
         }
     });
};

//Função para pagina recuperar 
function exibirRecuperar(req, res) {
    res.render('recuperar');
};

//Função para recuperar a senha
function recuperarSenha(req, res) {
    const email = req.body.email;
    const conexao = conectiondb();

    // Buscar senha no banco
    conexao.query('SELECT senha FROM usuario WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Erro ao buscar a senha:', err);
            return res.render('recuperar', { message: 'Erro ao recuperar senha.' });
        }

        if (results.length === 0) {
            return res.render('recuperar', { message: 'E-mail não encontrado!' });
        }

        const Senha = results[0].senha;

        // Configuração do transporte de e-mail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_GMAIL,  // Obtém do .env
                pass: process.env.EMAIL_PASSWORD  // Obtém do .env
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_GMAIL,
            to: email,
            subject: 'Recuperação de Senha',
            text: `Sua senha é: ${Senha}`
        };

        // Enviar e-mail
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erro ao enviar o e-mail:', error);
                return res.render('recuperar', { message: 'Erro ao enviar e-mail.' });
            } else {
                console.log('E-mail enviado: ' + info.response);
                return res.render('formulario', { message: 'E-mail enviado com sucesso!' });
            }
        });
    });
};

//exportando a função 
module.exports = {
    exibirPadrao,
    fazerLogin,
    exibirRecuperar,
    recuperarSenha
};