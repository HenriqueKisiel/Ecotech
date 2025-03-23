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

//==================== START ROTAS ====================

// Rota principal
app.get('/', function (req, res) {
    res.render('formulario');
});

// Rota Login (Da recuperar senha pra login e sair do perfil)
app.get('/formulario', (req, res) => {
    res.render('formulario');
});

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

//==================== END ROTAS ====================

// Servidor
app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});

// Henrique 22/03/2025 e 23/03/2025