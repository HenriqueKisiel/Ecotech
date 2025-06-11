//Immportando o módulo express
const express = require('express');

//Extraindo a função Router de módulo express
const router = express.Router();

//Autenticador de usuario
const ensureAuthenticated = require('../middleware/auth.js');

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao encerrar a sessão:', err);
        }
        res.redirect('/');
    });
});

//importar a conexão com o banco de dados
const servico = require('../servico/rota_login.js');
const servico2 = require('../servico/rota_home.js');
const servico3 = require('../servico/rota_pessoa.js');
const servico4 = require('../servico/rota_juridica.js');
const servico5 = require('../servico/rota_usuario.js');
const servico6 = require('../servico/rota_planta.js');
const servico7 = require('../servico/rota_cadastroRota.js');
const servico8 = require('../servico/rota_material.js');
const servico9 = require('../servico/rota_estoque.js');
const servico10 = require('../servico/rota_agendamento.js');
const servico11 = require('../servico/rota_rotas.js');
const servico12 = require('../servico/rota_relatorio.js');
const servico13 = require('../servico/rota_processamento.js');
const servico14 = require('../servico/rota_attStatus.js');
const servico15 = require('../servico/rota_cadastrosBuscar.js');
const servico16 = require('../servico/rota_cadastrosBuscar2.js');
const servico17 = require('../servico/rota_movimentacoesBuscar.js');
const servico18 = require('../servico/rota_movimentacoes.js');
const servico19 = require('../servico/rota_agendamentoAdd.js');
const servico20 = require('../servico/rota_agendamentoEditar.js');
const servico21 = require('../servico/rota_rotaEditar.js');
const servico22 = require('../servico/rota_pessoaEditar.js');
const servico23 = require('../servico/rota_juridicaEditar.js');
const servico24 = require('../servico/rota_plantaEditar.js');
const servico25 = require('../servico/rota_pesagem.js');
const servico26 = require('../servico/rota_separacao.js');
const servico27 = require('../servico/rota_motorista.js');
const servico28 = require('../servico/rota_caminhao.js');
const servico29 = require('../servico/rota_relatoriosNovo.js');
const servico30 = require('../servico/rota_motoristaEditar.js');
const servico31 = require('../servico/rota_caminhaoEditar.js');
const servico32 = require('../servico/rota_feedback.js');

//==================== START ROTAS ==========================//

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
router.get('/home', ensureAuthenticated, (req, res) => {
    servico2.exibirHome(req, res);
});

// Filtrar estoque por planta no dashboard 
router.get('/home/:cd_planta', (req, res) => {
    servico2.dadosDashboard(req, res);
});

// Rota para retornar o total de coletas realizadas na planta
router.get('/home/totalColetas/:cd_planta', (req, res) => {
    servico2.totalColetasPlanta(req, res);
});

router.get('/home/graficos/:cd_planta', (req, res) => {
    servico2.graficosDashboard(req, res);
});

// Rota para faturamento mensal por planta
router.get('/home/faturamento/:cd_planta', (req, res) => {
    servico2.faturamentoMensalPlanta(req, res);
});

// Rota para peso coletado mensal por planta
router.get('/home/pesoColetado/:cd_planta', (req, res) => {
    servico2.pesoColetadoMensalPlanta(req, res);
});

// Rota para proporção de movimentações por planta
router.get('/home/proporcaoMovimentacoes/:cd_planta', (req, res) => {
    servico2.proporcaoMovimentacoesPlanta(req, res);
});

//-------------------- Servico3 -------------------//
// Rota para a página cadastro de pessoa
router.get('/pessoa', ensureAuthenticated, (req, res) => {
    servico3.exibirPessoa(req, res);
});

// Rota para inserir pessoa
router.post('/pessoa', (req, res) => {
    servico3.insertPessoa(req, res);
});

//--------------------- Servico4 -------------------//
// Rota para a página cadastro de pessoa juridica/fornecedor
router.get('/juridica', ensureAuthenticated, (req, res) => {
    servico4.exibirFornecedor(req, res);
});

// Rota para inserir pessoa juridica
router.post('/juridica', (req, res) => {
    servico4.insertPessoaJuridica(req, res);
});

//--------------------- Servico5 -------------------//
// Rota para a página cadastro de usuario
router.get('/usuario', ensureAuthenticated, (req, res) => {
    servico5.exibirUsuario(req, res);
});

// Rota para buscar pessoa
router.get('/pessoas', (req, res) => {
    servico5.buscarPessoa(req, res);
});

// Rota para buscar detalhes da pessoa
router.get('/pessoa/:id', (req, res) => {
    servico5.buscarDetalhesPessoa(req, res);
});

// Rota para adicionar usuário
router.get('/usuarioAdicionar', ensureAuthenticated, (req, res) => {
    servico5.adicionarUsuario(req, res);
});

// Rota para cadastrar usuário
router.post('/usuarioAdicionar', (req, res) => {
    servico5.cadastrarUsuario(req, res);
});

//Rota para editar usuario
router.get('/usuarioEditar/:cd_usuario', (req, res) => {
    servico5.AlterarUsuario(req, res);
});

// Rota para a página editar usuário
router.post('/usuarioEditar', (req, res) => {
    servico5.editarUsuario(req, res);
});

// Rota para inativar usuário
router.get('/inativarUsuario/:cd_usuario&:nm_usuario', (req, res) => {
    servico5.inativarUsuario(req, res);
});

//--------------------- Servico6 -------------------//
// Rota para a página cadastro de planta
router.get('/planta', ensureAuthenticated, (req, res) => {
    servico6.exibirPlanta(req, res);
});

// Rota para cadastrar nova planta
router.post('/planta', (req, res) => {
    servico6.cadastrarPlanta(req, res);
});

//---------------------- Servico7 -------------------//
// Rota para a página de cadastrar rota
router.get('/cadastroRota', ensureAuthenticated, (req, res) => {
    servico7.exibirRotaCadastro(req, res);
});

//---------------------- Servico8 -------------------//
// Mostra a página do formulário
router.get('/material', ensureAuthenticated, (req, res) => {
    servico8.exibirMaterial(req, res);
});

// Recebe o formulário e cadastra o material
router.post('/material', (req, res) => {
    servico8.cadastrarMaterial(req, res);
});

//---------------------- Servico9 -------------------//
// Rota para a página de cadastrar estoque
router.get('/estoque', ensureAuthenticated, (req, res) => {
    servico9.exibirestoque(req, res);
});

// Rota para cadastrar novo estoque
router.post('/estoque/cadastrar', (req, res) => {
    servico9.cadastrarEstoque(req, res);
});

//----------------------- Servico10 -------------------//
// Rota GET para exibir a lista de agendamentos
router.get('/agendamento', ensureAuthenticated, (req, res) => {
    servico10.exibirAgendamento(req, res);
});

// Rota POST para realizar a busca de agendamentos
router.post('/agendamento', (req, res) => {
    servico10.buscarAgendamentos(req, res);
});

// Buscar bairros por nome da cidade para filtro dinâmico de agendamento
router.get('/agendamento/bairrosPorNome/:nm_cidade?', (req, res) => {
    servico10.buscarBairrosPorNomeCidade(req, res);
});
//---------------------- Servico11 -------------------//
// Rota para a página de rotas programadas
router.get('/rotas', ensureAuthenticated, (req, res) => {
    servico11.exibirRotas(req, res);
});

// Buscar Motorista
router.get('/buscarPlanta', (req, res) => {
    servico11.buscarPlanta(req, res);
});

// Rota para inserir rota
router.post('/cadastroRota', (req, res) => {
    servico11.insertRota(req, res);
});

// Rota para buscar rota
router.post('/rotas', (req, res) => {
    servico11.buscarRota(req, res);
});

//----------------------- Servico12 -------------------//
// Rota para a página de relatorios, listar relatórios
router.get('/relatorios', ensureAuthenticated, (req, res) => {
    servico12.exibirRelatorios(req, res);
});

// Exportar relatório
router.get('/exportarRelatorio/:cd_rel', (req, res) => {
    servico12.exportarRelatorio(req, res);
});

// Rota para exportar relátorio em PDF
router.get('/exportarRelatorioPDF/:cd_rel', (req, res) => {
    servico12.exportarRelatorioPDF(req, res);
});

// Filtro de relatórios
router.post('/relatorios', (req, res) => {
    servico12.filtrarRelatorios(req, res);
});

//------------------------ Servico13 -------------------//
// Rota para a página de processamento
router.get('/processamento', ensureAuthenticated, (req, res) => {
    servico13.exibirProcessamento(req, res);
});

//------------------------ Servico14 -------------------//
// Rota para a página de atualizar status das rotas
router.get('/attStatus/:cd_rota', (req, res) => {
    servico14.exibirAtualizarRotas(req, res);
});

// Atualiza status da ROTA (iniciar/finalizar)
router.post('/attStatus/:cd_rota', (req, res) => {
    servico14.atualizarStatusRota(req, res);
});

// Atualiza a data de coleta/cancelamento de um agendamento
router.post('/atualizarAgendamento/:cd_agendamento', (req, res) => {
    servico14.atualizarDataColeta(req, res);
});

//------------------------ Servico15 -------------------//
// Rota para exibir a página de filtro de cadastros
router.get('/cadastrosBuscar', ensureAuthenticated,(req, res) => {
    servico15.exibirCadastros(req, res);
});

// Rota para processar os filtros e buscar os cadastros
router.post('/cadastrosBuscar', (req, res) => {
    servico15.buscarCadastros(req, res);
});

//------------------------ Servico16 -------------------//
// Rota para exibir a página de buscar material no estoque
router.get('/cadastrosBuscar2', ensureAuthenticated, (req, res) => {
    servico16.exibirestoqueBuscar(req, res);
});

// Rota POST para realizar a busca no estoque
router.post('/cadastrosBuscar2', (req, res) => {
    servico16.buscarEstoques(req, res);
});

//------------------------ Servico17 -------------------//
// Rota para a página de entrada de material
router.get('/movimentacoesBuscar', ensureAuthenticated, (req, res) => {
    servico17.exibirmovimentacoesBuscar(req, res);
});

//------------------------ Servico18 -------------------//
// Rota para a página de saída de material
router.get('/movimentacoes', ensureAuthenticated, (req, res) => {
    servico18.exibirmovimentacoes(req, res);
});

// Rota para buscar estoques por planta
router.get('/estoquePorPlanta/:cd_planta', (req, res) => {
    servico18.obterEstoquesPorPlanta(req, res);
});

// Rota para buscar materiais por estoque e tipo de movimentação
router.get('/materiaisPorEstoque/:estoqueId/:movimentacao', (req, res) => {
    servico18.obterMateriaisPorEstoque(req, res);
});

// Rota para buscar todos os materiais
router.get('/todosMateriais', (req, res) => {
    servico18.obterTodosMateriais(req, res);
});

// Buscar pessoas físicas para o movimentacoes
router.get('/compradores/fisica', (req, res) => {
    servico18.obterPessoasFisicas(req, res);
});

// Buscar pessoas jurídicas para o movimentacoes
router.get('/compradores/juridica', (req, res) => {
    servico18.obterPessoasJuridicas(req, res);
});

// Buscar dados do material saída e venda
router.get('/dadosMaterialEstoque/:cd_estoque/:cd_material', (req, res) => {
    servico18.obterDadosMaterialEstoque(req, res);
});

// Buscar dados do material entrada
router.get('/dadosMaterialEntrada/:cd_estoque/:cd_material', (req, res) => {
    servico18.obterDadosMaterialEntrada(req, res);
});

// Atualizar estoque do material (entrada/saída/venda)
router.post('/atualizarEstoqueMaterial', (req, res) => {
    servico18.atualizarEstoqueMaterial(req, res);
});

// Busca o valor por kg do material pela venda
router.get('/valorPorKgMaterial/:cd_material', (req, res) => {
    servico18.obterValorPorKgMaterial(req, res);
});

//----------------------- Servico19 -------------------//
// Rota para exibir o formulário de novo agendamento
router.get('/agendamentoAdd', ensureAuthenticated, (req, res) => {
    servico19.exibirAgendamento(req, res);
});

// Rota para registrar o agendamento no banco de dados
router.post('/agendamentoAdd', (req, res) => {
    servico19.registrarAgendamento(req, res);
});

// Rota para buscar pessoas físicas para autocomplete
router.get('/pessoas-fisicas-busca', (req, res) => {
    servico19.buscarPessoaFisica(req, res);
});

// Rota para buscar pessoas juridicas para autocomplete
router.get('/pessoas-juridicas-busca', (req, res) => {
    servico19.buscarPessoaJuridica(req, res);
});

//----------------------- Servico20 -------------------//
// Rota principal que exibe a tela de edição do agendamento.
router.get('/agendamentoEditar', 
    servico20.exibirEditarAgendamento);

// Rota para atualizar os dados do agendamento.
router.post('/agendamentoEditar/:id_agendamento',
    servico20.atualizarAgendamento);

// Rota para adicionar um novo item ao agendamento.
router.post('/agendamentoEditar/:id_agendamento/adicionarItem',
    servico20.adicionarItem);

// Rota para carregar os dados de um item específico na tela de edição.
router.get('/agendamentoEditar/:id_agendamento/itens/:itemId/editar',
    servico20.exibirEditarItem);

// Rota que recebe os dados atualizados de um item e salva no banco.
router.post('/agendamentoEditar/:id_agendamento/itens/:itemId/editar',
    servico20.atualizarItem);

// Rota para excluir um item do agendamento.
router.get('/agendamentoEditar/:id_agendamento/itens/:itemId/excluir',
    servico20.excluirItem);

// ----------------------- Servico21 -------------------//
// Página para editar rota
router.get('/rotaEditar', ensureAuthenticated, (req, res) => {
    servico21.exibirrotaeditar(req, res);
});

// Rota para exibir editar rota
router.get('/rotaEditar/:cd_rota', (req, res) => {
    servico21.exibirrotaeditar(req, res);
});

// Rota para editar rota
router.post('/rotaEditar', (req, res) => {
    servico21.editarRota(req, res);
});

// Buscar agendamentos
router.get('/buscarAgendamentos', (req, res) => {
    servico21.buscarAgendamento(req, res);
});

// Buscar Motorista
router.get('/buscarMotoristas', (req, res) => {
    servico21.buscarMotoristas(req, res);
});

// Buscar acaminhao
router.get('/buscarCaminhao', (req, res) => {
    servico21.buscarCaminhao(req, res);
});

// Adicionar Agendamento em uma rota
router.post('/rotaEditar/:cd_rota', (req, res) => {
    servico21.adicionarAgendamentoNaRota(req, res);
});

router.post('/excluirPonto/:id', (req, res) => {
    servico21.excluirPontoColeta(req, res);
});

// ----------------------- Servico22 -------------------//
//página para editar pessoa
router.get('/pessoaEditar/:cd_pessoa_fisica', (req, res) => {
    servico22.exibirPessoaEditar(req, res);
});

// Rota para editar pessoa
router.post('/pessoaEditar', (req, res) => {
    servico22.editarPessoa(req, res);
});

// Rota para buscar bairros por cidade
router.get('/pessoa/bairros/:cd_cidade', (req, res) => {
    servico22.buscarBairrosPorCidade(req, res);
});

// ----------------------- Servico23 -------------------//
//página para editar pessoa juridica
router.get('/juridicaEditar/:cd_pessoa_juridica', (req, res) => {
    servico23.exibirJuridicaEditar(req, res);
});

// Rota para editar pessoa juridica
router.post('/juridicaEditar', (req, res) => {
    servico23.editarJuridica(req, res);
});

// ----------------------- Servico24 -------------------//
//página para editar planta
router.get('/plantaEditar/:cd_planta', (req, res) => {
    servico24.exibirPlantaEditar(req, res);
});

// Rota para editar planta
router.post('/plantaEditar', (req, res) => {
    servico24.editarPlanta(req, res);
});

// ----------------------- Servico25 -------------------//
// Rota para exibir pesagem
router.get('/pesagem', ensureAuthenticated, (req, res) => {
    servico25.exibirpesagem(req, res);
});

// Rota para buscar agendamento do material
router.get('/buscarAgendamentoMaterial', (req, res) => {
    servico25.buscarAgendamentoMaterial(req, res)
});

// Rota para buscar itens agenda
router.get('/buscarItensgenda', (req, res) => {
    servico25.buscarItensgenda(req, res)
});

// Rota para atualizar pesos
router.post('/atualizarPesos', (req, res) => {
    servico25.atualizarPesos(req, res)
});

// Rota para concluir pesagem
router.post('/concluirPesagem', (req, res) => {
    servico25.concluirPesagem(req, res);
});

// ----------------------- Servico26 -------------------//
// Rota para exibir separação
router.get('/separacao', ensureAuthenticated, (req, res) => {
    servico26.exibirseparacao(req, res);
});

// Rota para buscar agendamentos separação
router.get('/buscarAgendamentoSeparacao', (req, res) => {
    servico26.buscarAgendamentoSeparacao(req, res)
});

// Rota para buscar materias linha 5
router.get('/buscarMateriaisLinha5', (req, res) => {
    servico26.buscarMateriaisLinha5(req, res);
});

// Rota para buscar estoque por planta
router.get('/buscarEstoquesPorPlanta', (req, res) => {
    servico26.buscarEstoquesPorPlanta(req, res);
});

// Rota para adicionar itens no estoque 
router.post('/separacao/adicionarItem', (req, res) => {
    servico26.adicionarItemEstoqueMaterial(req, res);
});

// Rota para buscar movimentações por agendamento
router.get('/separacao/movimentacoes', (req, res) => {
    servico26.buscarMovimentacoesPorAgendamento(req, res);
});

// Rota para concluir separação
router.post('/separacao/concluirSeparacao', (req, res) => {
    servico26.concluirSeparacao(req, res);
});

// ----------------------- Servico27 -------------------//
// Rota para exibir motoristas
router.get('/motorista', ensureAuthenticated, (req, res) => {
    servico27.exibirMotorista(req, res);
});

// Rota para inserir motorista
router.post('/motorista', (req, res) => {
    servico27.inserirMotorista(req, res);
});

// ----------------------- Servico28 -------------------//
// Rota para exibir caminhão
router.get('/caminhao', ensureAuthenticated, (req, res) => {
    servico28.exibirCaminhao(req, res);
});

// Rota para cadastrar caminhão
router.post('/caminhao', (req, res) => {
    servico28.cadastrarCaminhao(req, res);
});

// ----------------------- Servico29 -------------------//
// Rota para exibir relatório novo 
router.get('/relatoriosNovo', ensureAuthenticated, (req, res) => {
    servico29.exibirRelatorioNovo(req, res);
});

// Rota para salvar relatório novo
router.post('/relatoriosNovo', (req, res) => {
    servico29.salvarRelatorioNovo(req, res);
});

// ----------------------- Servico30 -------------------//
// Rota para exibir editar motorista
router.get('/motoristaEditar/:id_motorista', (req, res) => {
    servico30.exibirEditarMotorista(req, res);
});

// Rota para editar motorista
router.post('/motoristaEditar', (req, res) => {
    servico30.editarMotorista(req, res);
});

// ----------------------- Servico31 -------------------//
// Rota para exibir caminhão editar
router.get('/caminhaoEditar/:id_caminhao', (req, res) => {
    servico31.exibirCaminhaoEditar(req, res);
});

// Rota para editar caminhão 
router.post('/caminhaoEditar', (req, res) => {
    servico31.editarCaminhao(req, res);
});

// ----------------------- Servico32 -------------------//
// Enviar e-mail de feedback
router.post('/enviarFeedback/:cd_agendamento', (req, res) => {
    servico32.enviarFeedbackEmail(req.params.cd_agendamento, (err, msg) => {
        if (err) return res.status(400).send(err);
        res.send(msg);
    });
});

// Exibir formulário de feedback
router.get('/feedback/:cd_agendamento', (req, res) => {
    res.render('feedback', { cd_agendamento: req.params.cd_agendamento });
});

// Salvar feedback no banco
router.post('/feedback/:cd_agendamento', (req, res) => {
    const { ds_feedback, nr_nota } = req.body;
    servico32.salvarFeedback(req.params.cd_agendamento, ds_feedback, nr_nota, (err, msg) => {
        if (err) return res.status(400).send(err);
        res.send(msg);
    });
});

router.get('/enviarFeedback/:cd_agendamento', (req, res) => {
    servico32.enviarFeedbackEmail(req.params.cd_agendamento, (err, msg) => {
        if (err) return res.status(400).send(err);
        res.send(msg);
    });
});

//========================= END ROTAS ===========================//

module.exports = router;