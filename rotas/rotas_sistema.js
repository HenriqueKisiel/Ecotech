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
const servico19 = require('../servico/rota_agendamentoAdd.js');
const servico20 = require('../servico/rota_agendamentoEditar.js');
const servico21 = require('../servico/rota_rota_editar.js');
const servico22 = require('../servico/rota_pessoaEditar.js');
const servico23 = require('../servico/rota_juridicaEditar.js');
const servico24 = require('../servico/rota_plantaEditar.js');
const servico25 = require('../servico/rota_novoMaterial.js');
const servico26 = require('../servico/rota_novoMaterial2.js');
const servico27 = require('../servico/rota_motorista.js');
const servico28 = require('../servico/rota_caminhao.js');
const servico29 = require('../servico/rota_relatoriosNovo.js')



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

// Filtrar estoque por planta no dashboard 
router.get('/home/:cd_planta', (req, res) => {
    servico2.dadosDashboard(req, res); // certifique-se que está chamando a função certa
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
router.get('/pessoa', (req, res) => {
    servico3.exibirPessoa(req, res);
});

router.post('/pessoa', (req, res) => {
    servico3.insertPessoa(req, res);
});

//--------------------- Servico4 -------------------//
// Rota para a página cadastro de pessoa juridica/fornecedor
router.get('/juridica', (req, res) => {
    servico4.exibirFornecedor(req, res);
});

router.post('/juridica', (req, res) => {
    servico4.insertPessoaJuridica(req, res);
});

//--------------------- Servico5 -------------------//
// Rota para a página cadastro de usuario
router.get('/usuario', (req, res) => {
    servico5.exibirUsuario(req, res);
});

router.get('/pessoas', (req, res) => {
    servico5.buscarPessoa(req, res);
});

router.get('/pessoa/:id', (req, res) => {
    servico5.buscarDetalhesPessoa(req, res);
});

router.get('/usuarioAdicionar', (req, res) => {
    servico5.adicionarUsuario(req, res);
});

router.post('/usuarioAdicionar', (req, res) => {
    servico5.cadastrarUsuario(req, res);
});

//Rota para editar usuario
router.get('/usuarioEditar/:cd_usuario', (req, res) => {
    servico5.AlterarUsuario(req, res);
});

router.post('/usuarioEditar', (req, res) => {
    servico5.editarUsuario(req, res);
});

router.get('/inativarUsuario/:cd_usuario&:nm_usuario', (req, res) => {
    servico5.inativarUsuario(req, res);
});

//--------------------- Servico6 -------------------//
// Rota para a página cadastro de planta
router.get('/planta', (req, res) => {
    servico6.exibirPlanta(req, res);
});

// Rota para cadastrar nova planta
router.post('/planta', (req, res) => {
    servico6.cadastrarPlanta(req, res);
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

// Rota para cadastrar novo estoque (POST)
router.post('/estoque/cadastrar', (req, res) => {
    servico9.cadastrarEstoque(req, res);
});

//----------------------- Servico10 -------------------//
// Rota GET para exibir a lista de agendamentos
router.get('/agendamento', (req, res) => {
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
router.get('/rotas', (req, res) => {
    servico11.exibirRotas(req, res);
});

// Buscar Motorista
router.get('/buscarPlanta', (req, res) => {
    servico11.buscarPlanta(req, res);
});

router.post('/RotaCadastro', (req, res) => {
    servico11.insertRota(req, res);
});

router.post('/rotas', (req, res) => {
    servico11.buscarRota(req, res);
});

//----------------------- Servico12 -------------------//
// Rota para a página de relatorios
// Listar relatórios
router.get('/relatorios', (req, res) => {
    servico12.exibirRelatorios(req, res);
});

// Exportar relatório
router.get('/exportarRelatorio/:cd_rel', (req, res) => {
    servico12.exportarRelatorio(req, res);
});

//------------------------ Servico13 -------------------//

// Rota para a página de processamento
router.get('/processamento', (req, res) => {
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
router.get('/cadastros', (req, res) => {
    servico15.exibirCadastros(req, res);
});

// Rota para processar os filtros e buscar os cadastros
router.post('/cadastros', (req, res) => {
    servico15.buscarCadastros(req, res);
});

//------------------------ Servico16 -------------------//
// Rota para exibir a página de buscar material no estoque
router.get('/estoqueBuscar', (req, res) => {
    servico16.exibirestoqueBuscar(req, res);
});

// Rota POST para realizar a busca no estoque
router.post('/estoqueBuscar', (req, res) => {
    servico16.buscarEstoques(req, res);
});

//------------------------ Servico17 -------------------//
// Rota para a página de entrada de material
router.get('/estoqueEntrada', (req, res) => {
    servico17.exibirestoqueEntrada(req, res);
});

//------------------------ Servico18 -------------------//
// Rota para a página de saída de material
router.get('/estoqueSaida', (req, res) => {
    servico18.exibirestoqueSaida(req, res);
});

// Rota para buscar estoques por planta
router.get('/estoquePorPlanta/:cd_planta', (req, res) => {
    servico18.obterEstoquesPorPlanta(req, res);
});

// Rota para buscar materiais por estoque e tipo de movimentação
router.get('/materiaisPorEstoque/:estoqueId/:movimentacao', (req, res) => {
    servico18.obterMateriaisPorEstoque(req, res);
});

// Rota para buscar todos os materiais (usada apenas em entrada, se necessário)
router.get('/todosMateriais', (req, res) => {
    servico18.obterTodosMateriais(req, res);
});

// Buscar pessoas físicas para o estoqueSaida
router.get('/compradores/fisica', (req, res) => {
    servico18.obterPessoasFisicas(req, res);
});

// Buscar pessoas jurídicas para o estoqueSaida
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
// Rota para exibir o formulário de novo agendamento (GET)
router.get('/agendamentoAdd', (req, res) => {
    servico19.exibirAgendamento(req, res);
});

// Rota para registrar o agendamento no banco de dados (POST)
router.post('/agendamentoAdd', (req, res) => {
    servico19.registrarAgendamento(req, res);
});

// Rota para buscar pessoas físicas para autocomplete (GET)
router.get('/pessoas-fisicas-busca', (req, res) => {
    servico19.buscarPessoaFisica(req, res);
});

// Rota para buscar pessoas juridicas para autocomplete (GET)
router.get('/pessoas-juridicas-busca', (req, res) => {
    servico19.buscarPessoaJuridica(req, res);
});

//----------------------- Servico20 -------------------//
// Rota GET principal que exibe a tela de edição do agendamento.
// Esta tela inclui os dados do agendamento e a lista de itens associados.
router.get('/agendamentoEditar', servico20.exibirEditarAgendamento);

// Rota POST para atualizar os dados do agendamento.
// Recebe os dados do formulário e atualiza o agendamento no banco de dados.
router.post('/agendamentoEditar/:id_agendamento', servico20.atualizarAgendamento);

// Rota POST para adicionar um novo item ao agendamento.
// Recebe os dados do formulário de novo item e insere no banco.
router.post('/agendamentoEditar/:id_agendamento/adicionarItem', servico20.adicionarItem);

// Rota GET para carregar os dados de um item específico na tela de edição.
// Usada para preencher o formulário de item com os dados do item que será editado.
router.get('/agendamentoEditar/:id_agendamento/itens/:itemId/editar', servico20.exibirEditarItem);

// Rota POST que recebe os dados atualizados de um item e salva no banco.
// Após salvar, redireciona de volta para a mesma tela de edição.
router.post('/agendamentoEditar/:id_agendamento/itens/:itemId/editar', servico20.atualizarItem);

// Rota GET para excluir um item do agendamento.
// Após exclusão, redireciona para a mesma tela de edição com a lista atualizada.
router.get('/agendamentoEditar/:id_agendamento/itens/:itemId/excluir', servico20.excluirItem);
// ----------------------- Servico21 -------------------//
// Página para editar rota
router.get('/rotaEditar', (req, res) => {
    servico21.exibirrotaeditar(req, res);
});

router.get('/rotaEditar/:cd_rota', (req, res) => {
    servico21.exibirrotaeditar(req, res);
});

router.post('/rotaEditar', (req, res) => {
    servico21.editarRota(req, res);
});

// Buscar agendamentos (para preencher o select)
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

router.post('/pessoaEditar', (req, res) => {
    servico22.editarPessoa(req, res);
});

router.get('/pessoa/bairros/:cd_cidade', (req, res) => {
    servico22.buscarBairrosPorCidade(req, res);
});

// ----------------------- Servico23 -------------------//
//página para editar pessoa juridica
router.get('/juridicaEditar/:cd_pessoa_juridica', (req, res) => {
    servico23.exibirJuridicaEditar(req, res);
});

router.post('/juridicaEditar', (req, res) => {
    servico23.editarJuridica(req, res);
});

// ----------------------- Servico24 -------------------//
//página para editar planta
router.get('/plantaEditar/:cd_planta', (req, res) => {
    servico24.exibirPlantaEditar(req, res);
});

router.post('/plantaEditar', (req, res) => {
    servico24.editarPlanta(req, res);
});

// ----------------------- Servico25 -------------------//
router.get('/novoMaterial', (req, res) => {
    servico25.exibirNovoMaterial(req, res);
});

router.get('/buscarAgendamentoMaterial', (req, res) => {
    servico25.buscarAgendamentoMaterial(req, res)
});

router.get('/buscarItensgenda', (req, res) => {
    servico25.buscarItensgenda(req, res)
});

router.post('/atualizarPesos', (req, res) => {
    servico25.atualizarPesos(req, res)
});

router.post('/concluirPesagem', (req, res) => {
    servico25.concluirPesagem(req, res);
});


// ----------------------- Servico26 -------------------//
router.get('/novoMaterial2', (req, res) => {
    servico26.exibirNovoMaterial2(req, res);
});

router.get('/buscarAgendamentoSeparacao', (req, res) => {
    servico26.buscarAgendamentoSeparacao(req, res)
});

router.get('/buscarMateriaisLinha5', (req, res) => {
    servico26.buscarMateriaisLinha5(req, res);
});

router.get('/buscarEstoquesPorPlanta', (req, res) => {
    servico26.buscarEstoquesPorPlanta(req, res);
});

router.post('/novoMaterial2/adicionarItem', (req, res) => {
    servico26.adicionarItemEstoqueMaterial(req, res);
});

router.get('/novoMaterial2/movimentacoes', (req, res) => {
    servico26.buscarMovimentacoesPorAgendamento(req, res);
});

router.post('/novoMaterial2/concluirSeparacao', (req, res) => {
    servico26.concluirSeparacao(req, res);
});

// ----------------------- Servico27 -------------------//
router.get('/motorista', (req, res) => {
    servico27.exibirMotorista(req, res);
});

// ----------------------- Servico28 -------------------//
router.get('/caminhao', (req, res) => {
    servico28.exibirCaminhao(req, res);
});

// Filtro de relatórios
router.post('/relatorios', (req, res) => {
    servico12.filtrarRelatorios(req, res);
});

// ----------------------- Servico29 -------------------//
router.get('/relatoriosNovo', (req, res) => {
    servico29.exibirRelatorioNovo(req, res);
});

router.post('/relatoriosNovo', (req, res) => {
    servico29.salvarRelatorioNovo(req, res);
});

//==================== END ROTAS ====================

module.exports = router;