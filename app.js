const express = require('express');
const { engine } = require('express-handlebars');
const mysql = require('mysql2');

const app = express();

// Manipulação de dados via rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234@',
    database: 'projeto'
});

conexao.connect(function (erro) {
    if (erro) {
        console.error('Erro ao conectar ao banco de dados:', erro);
        return;
    }
    console.log('Conexão efetuada com sucesso!');
});

//configurado para servir arquivos estaticos
app.use(express.static('public'));

//chamando bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/css', express.static('./css'));
app.use('/js', express.static('./js'));

// Configuração do express handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Rota principal
app.get('/', function (req, res) {
    res.render('formulario');
});

// Rota que usa um layout diferente
app.get('/admin', (req, res) => {
    res.render('dashboard', { layout: 'admin' }); // Usa o layout "admin.handlebars"
});

// Rota home
app.get('/', function (req, res) {
    res.render('home');
});

// Rota login
app.post('/login', function (req, res) {
    console.log(req.body);
    res.status(200).send('Login recebido');
});

// Rota para a página recuperar senha
app.get('/recuperar', (req, res) => {
    res.render('recuperar');
});

// Rota para a página home
app.get('/home', (req, res) => {
    res.render('home');
});


// Servidor
app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});