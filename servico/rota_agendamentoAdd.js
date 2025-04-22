const conectiondb = require('../bd/conexao_mysql.js');  // Conexão com o banco de dados
const conexao = conectiondb();

// Função para exibir a tela de agendamento com dados dinâmicos
function exibirAgendamento(req, res, mensagem = '') {
    // Consultas SQL
    const queryPessoasFisicas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
    const queryPessoasJuridicas = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';
    const queryCidades = 'SELECT cd_cidade, nm_cidade FROM cidade';
    const queryBairros = 'SELECT cd_bairro, nm_bairro FROM bairro';

    conexao.query(queryPessoasFisicas, (err1, pessoasFisicas) => {
        if (err1) return res.status(500).send('Erro ao buscar pessoas físicas');

        conexao.query(queryPessoasJuridicas, (err2, pessoasJuridicas) => {
            if (err2) return res.status(500).send('Erro ao buscar pessoas jurídicas');

            conexao.query(queryCidades, (err3, cidades) => {
                if (err3) return res.status(500).send('Erro ao buscar cidades');

                conexao.query(queryBairros, (err4, bairros) => {
                    if (err4) return res.status(500).send('Erro ao buscar bairros');

                    // Renderiza a página com todos os dados necessários e mensagem (caso exista)
                    res.render('agendamentoAdd', {
                        mensagem,
                        pessoasFisicas,
                        pessoasJuridicas,
                        cidades,
                        bairros
                    });
                });
            });
        });
    });
}

// Função responsável por registrar um novo agendamento no banco de dados
function registrarAgendamento(req, res) {
    console.log("Função registrarAgendamento chamada");

    const {
        cd_pessoa_fisica,
        cd_pessoa_juridica,
        ds_endereco,
        cd_cidade,
        cd_bairro,
        dt_solicitada,
        qt_quantidade_prevista_kg
    } = req.body;

    console.log("Dados recebidos:", req.body);

    const qt_quantidade_prevista_kg_num = parseFloat(qt_quantidade_prevista_kg.replace(',', '.'));

    const query = `
        INSERT INTO agendamento 
        (dt_solicitada, cd_pessoa_fisica, cd_pessoa_juridica, ds_endereco, cd_bairro, cd_cidade, nr_cep, qt_quantidade_prevista_kg)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        dt_solicitada,
        cd_pessoa_fisica || null,
        cd_pessoa_juridica || null,
        ds_endereco,
        cd_bairro,
        cd_cidade,
        "", // CEP
        qt_quantidade_prevista_kg_num
    ];

    conexao.query(query, valores, (erro, resultado) => {
        if (erro) {
            console.error("Erro ao registrar agendamento:", erro);
            // Recarrega a página com a mensagem de erro e dados novamente
            return exibirAgendamento(req, res, 'Erro ao registrar o agendamento. Verifique os dados e tente novamente.');
        }

        console.log("Agendamento registrado com sucesso!");
        // Recarrega a página com a mensagem de sucesso e dados novamente
        exibirAgendamento(req, res, 'Agendamento registrado com sucesso!');
    });
}

module.exports = {
    exibirAgendamento,
    registrarAgendamento
};
