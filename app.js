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

//importar módulo de rotas 
const rotas = require('./rotas/rotas_sistema.js');

//Configuração do dotenv para Email
require('dotenv').config();
console.log('EMAIL_GMAIL:', process.env.EMAIL_GMAIL);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

//criando a aplicação
const app = express();

//criando a sessão
app.use(session({ secret: "ssshhhhh" }));

//require do bodyparser responsável por capturar valores do form
const bodyParser = require("body-parser");
//config bodyparser para leitura de post
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Manipulação de dados via rotas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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


//---------------- Rota padrão -------------------//
app.use('/', rotas);

// Servidor
app.listen(8080, () => {
    console.log('Servidor rodando na porta 8080');
});