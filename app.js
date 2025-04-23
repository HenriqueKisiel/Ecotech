const express = require('express');
const { engine } = require('express-handlebars');
const session = require("express-session");
const path = require('path');
const exphbs = require('express-handlebars');

// Criando a aplicação
const app = express();

// Configuração do Handlebars com helpers personalizados
app.engine('handlebars', exphbs.engine({
    helpers: {
        or: function (a, b) {
            return a || b;
        },
        eq: function (a, b) {
            return a === b;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, './views'));

// Importar módulo de rotas
const rotas = require('./rotas/rotas_sistema.js');

// Configuração do dotenv para Email
require('dotenv').config();
console.log('EMAIL_GMAIL:', process.env.EMAIL_GMAIL);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

// Criando a sessão
app.use(session({ secret: "ssshhhhh" }));

// Configuração do body-parser para leitura de POST
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Manipulação de dados via rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Chamando bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/css', express.static('./css'));
app.use('/js', express.static('./js'));

// Rota padrão
app.use('/', rotas);

// Servidor
app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});