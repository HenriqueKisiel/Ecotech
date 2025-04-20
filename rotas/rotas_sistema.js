//Immportando o módulo express
const express = require('express');

//Extraindo a função Router de módulo express
const router = express.Router();

//importar a conexão com o banco de dados
const servico = require('../servico/rota_login.js');
const servico2 = require('../servico/rota_home.js');
const servico3 = require('../servico/rota_pessoa.js');
const servico4 = require('../servico/rota_juridica.js');
const servico5 = require('../servico/rota_usuario.js');
const servico6 = require('../servico/rota_planta.js');
const servico7 = require('../servico/rota_cadastro.js');
const servico8 = require('../servico/rota_material.js');
const servico9 = require('../servico/rota_estoqueNovo.js');
const servico10 = require('../servico/rota_agendamento.js');
const servico11 = require('../servico/rota_rotas.js');
const servico12 = require('../servico/rota_relatorio.js');
const servico13 = require('../servico/rota_processamento.js');
const servico14 = require('../servico/rota_attStatus.js');
const servico15 = require('../servico/rota_cadastros.js');
const servico16 = require('../servico/rota_estoqueBuscar.js');
const servico17 = require('../servico/rota_estoqueEntrada.js');
const servico18 = require('../servico/rota_estoqueSaida.js');




//==================== START ROTAS ====================

//------------------- Servico -------------------//
//rota padrao
router.get('/', (req, res) => {
    servico.exibirPadrao(req, res);
});

//método post do login
router.post('/log', function (req, res) {
    servico.fazerLogin(req, res);
});

// Rota para a página recuperar 
router.get('/recuperar', (req, res) => {
    servico.exibirRecuperar(req, res);
});

// Rota para recuperação de senha
router.post('/recuperar-senha', (req, res) => {
    servico.recuperarSenha(req, res);
});

//-------------------- Servico2 -------------------//
// Rota para a página home
router.get('/home', (req, res) => {
    servico2.exibirHome(req, res);
});

//-------------------- Servico3 -------------------//
// Rota para a página cadastro de pessoa
router.get('/pessoa', (req, res) => {
    servico3.exibirPessoa(req, res);
});

//--------------------- Servico4 -------------------//
// Rota para a página cadastro de pessoa juridica/fornecedor
router.get('/juridica', (req, res) => {
    servico4.exibirFornecedor(req, res);
});

//--------------------- Servico5 -------------------//
// Rota para a página cadastro de usuario
router.get('/usuario', (req, res) => {
    servico5.exibirUsuario(req, res);
});

//--------------------- Servico6 -------------------//
// Rota para a página cadastro de planta
router.get('/planta', (req, res) => {
    servico6.exibirPlanta(req, res);
});

//---------------------- Servico7 -------------------//

// Rota para a página de cadastrar rota
router.get('/RotaCadastro', (req, res) => {
    servico7.exibirRotaCadastro(req, res);
});

//---------------------- Servico8 -------------------//
// Mostra a página do formulário
router.get('/material', (req, res) => {
    servico8.exibirMaterial(req, res);
});

// Recebe o formulário e cadastra o material
router.post('/material', (req, res) => {
    servico8.cadastrarMaterial(req, res);
});

//---------------------- Servico9 -------------------//
// Rota para a página de cadastrar estoque
router.get('/estoqueNovo', (req, res) => {
    servico9.exibirestoqueNovo(req, res);
});

//----------------------- Servico10 -------------------//
// Rota para a página de agendamento de coleta
router.get('/agendamento', (req, res) => {
    servico10.exibirAgendamento(req, res);
});
// Rota de registro de coleta
router.post('/agendamento', (req, res) => {
    servico10.registrarAgendamento(req, res);
});


//---------------------- Servico11 -------------------//
// Rota para a página de rotas programadas
router.get('/rotas', (req, res) => {
    servico11.exibirRotas(req, res);
});

//----------------------- Servico12 -------------------//
// Rota para a página de relatorios
router.get('/relatorios', (req, res) => {
    servico12.exibirRelatorios(req, res);
});

// Rota para a página de cadastrar relatorios
router.get('/relatoriosNovo', (req, res) => {
    servico12.exibirCadastrarRelatorios(req, res);
});

//------------------------ Servico13 -------------------//

// Rota para a página de processamento
router.get('/processamento', (req, res) => {
    servico13.exibirProcessamento(req, res);
});

//------------------------ Servico14 -------------------//

// Rota para a página de atualizar status das rotas
router.get('/attStatus', (req, res) => {
    servico14.exibirAtualizarRotas(req, res);
});

//------------------------ Servico15 -------------------//

// Rota para a página buscar cadastros
router.get('/cadastros', (req, res) => {
    servico15.exibirCadastros(req, res);
});


//------------------------ Servico16 -------------------//
// Rota para exibir a página de buscar material no estoque
router.get('/estoqueBuscar', (req, res) => {
    servico16.exibirestoqueBuscar(req, res);
});

// Rota POST para realizar a busca no estoque
router.post('/estoqueBuscar', (req, res) => {
    servico16.localizarestoqueBuscar(req, res);
});

//------------------------ Servico17 -------------------//
// Rota para a página de entrada de material
router.get('/estoqueEntrada', (req, res) => {
    servico17.exibirestoqueEntrada(req, res);
});


//------------------------ Servico18 -------------------//
// Rota para a página de saida de material
router.get('/estoqueSaida', (req, res) => {
    servico18.exibirestoqueSaida(req, res);
});


//==================== END ROTAS ====================



module.exports = router;