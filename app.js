/*comandos npm
npm instal nodemon -g 
npm install -- save express
npm install express-session
npm install --save body-parser
npm install --save mysql
npm install ejs -save

npm install nodemailer
npm install dotenv

*/

const express = require('express');
const { engine } = require('express-handlebars');
const session = require("express-session");
const path = require('path');
const nodemailer = require('nodemailer');

require('dotenv').config();

console.log('EMAIL_GMAIL:', process.env.EMAIL_GMAIL);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

//criando a aplicação
const app = express();

//criando a sessão
app.use(session({ secret: "ssshhhhh" }));

//require do bodyparser responsável por capturar valores do form
const bodyParser = require("body-parser");

//Require do Mysql
const mysql = require('mysql');
const { resolveSoa } = require('dns');

// Manipulação de dados via rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Conexão com o banco
function conectiondb() {
    const conexao = mysql.createConnection({
        host: 'localhost',
        user: 'root', // user do henrique : administrador -  Nico: admin
        password: '12345678', // senha do banco Henrique: 123456789
        database: 'ecotech'   // nome do banco Henrique: projeto - 
    });

    conexao.connect(function (erro) {
        if (erro) {
            console.error('Erro ao conectar ao banco de dados:', erro);
            return;
        }
        console.log('Conexão efetuada com sucesso!');
    });
    return conexao
}

//configurado para servir arquivos estaticos
app.use(express.static('public'));

//chamando bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/css', express.static('./css'));
app.use('/js', express.static('./js'));

// Configuração do express handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views'));

//config bodyparser para leitura de post
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//rota padrao
app.get('/', (req, res) => {
    var message = ' ';
    res.render('formulario', { message: message });
});
//rota para login
app.get("formulario", function (req, res) {
    var message = ' ';
    res.render('formulario', { message: message });
});

//método post do login
app.post('/log', function (req, res) {
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
});


// Rota para recuperação de senha
app.post('/recuperar-senha', (req, res) => {
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
}); 


//==================== START ROTAS ====================

// Rota para a página recuperar senha
app.get('/recuperar', (req, res) => {
    res.render('recuperar');
});

// Rota para a página home
app.get('/home', (req, res) => {
    res.render('home');
});

// Rota para a página cadastro de pessoa
app.get('/pessoa', (req, res) => {
    res.render('pessoa');
});

// Rota para a página cadastro de pessoa juridica/fornecedor
app.get('/juridica', (req, res) => {
    res.render('juridica');
});

// Rota para a página cadastro de usuario
app.get('/usuario', (req, res) => {
    res.render('usuario');
});

// Rota para a página cadastro de planta
app.get('/planta', (req, res) => {
    res.render('planta');
});

// Rota para a página buscar cadastros
app.get('/cadastros', (req, res) => {
    res.render('cadastros');
});

// Rota para a página cadastro de material
app.get('/material', (req, res) => {
    res.render('material');
});

// Rota para a página de buscar material no estoque
app.get('/estoqueBuscar', (req, res) => {
    res.render('estoqueBuscar');
});

// Rota para a página de entrada de material
app.get('/estoqueEntrada', (req, res) => {
    res.render('estoqueEntrada');
});

// Rota para a página de saida de material
app.get('/estoqueSaida', (req, res) => {
    res.render('estoqueSaida');
});

// Rota para a página de agendamento de coleta
app.get('/agendamento', (req, res) => {
    res.render('agendamento');
});

// Rota para a página de rotas programadas
app.get('/rotas', (req, res) => {
    res.render('rotas');
});

// Rota para a página de atualizar status das rotas
app.get('/attStatus', (req, res) => {
    res.render('attStatus');
});

// Rota para a página de atualizar status das rotas
app.get('/relatorios', (req, res) => {
    res.render('relatorios');
});

//==================== END ROTAS ====================

// Servidor
app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});