const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a tela de agendamento
function exibirAgendamento(req, res) {
    res.status(200).render('agendamento', { message: '' });
}

// Função responsável por registrar um novo agendamento no banco de dados
function registrarAgendamento(req, res) {
    console.log("Função registrarAgendamento chamada");

    // Captura os dados enviados pelo formulário (req.body)
    const {
        cidade,
        bairro,
        cep,
        endereco,
        codigo_material,
        descricao_material,
        valor_kg,
        peso,
        cd_pessoa_fisica,
        cd_pessoa_juridica,
        dt_solicitada
    } = req.body;

    // Exibe os dados recebidos no terminal para depuração
    console.log("Dados recebidos:", req.body);

    // Converte valores com vírgula para número com ponto (formato aceito pelo MySQL)
    const valor_kg_num = parseFloat(valor_kg.replace(',', '.'));
    const peso_num = parseFloat(peso.replace(',', '.'));

    const pessoaFisica = cd_pessoa_fisica && cd_pessoa_fisica.trim() !== '' ? cd_pessoa_fisica : null;
    const pessoaJuridica = cd_pessoa_juridica && cd_pessoa_juridica.trim() !== '' ? cd_pessoa_juridica : null;

     // Cria a conexão com o banco de dados
     const conexao = conectiondb();

    // Define a query SQL de inserção no banco de dados
    const query = `
        INSERT INTO agendamento 
        (dt_solicitada, cd_pessoa_fisica, cd_pessoa_juridica, ds_endereco, cd_bairro, cd_cidade, nr_cep, cd_material, qt_quantidade_prevista_kg, vlr_previsto_reais)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Define os valores a serem inseridos, respeitando a ordem dos campos na query
    const valores = [
        dt_solicitada,        // 1 - Data solicitada
        pessoaFisica,         // 2 - Código da pessoa física (pode ser null)
        pessoaJuridica,       // 3 - Código da pessoa jurídica (pode ser null)
        endereco,             // 4 - Endereço da coleta
        bairro,               // 5 - Código do bairro
        cidade,               // 6 - Código da cidade
        cep,                  // 7 - CEP da coleta
        codigo_material,      // 8 - Código do material
        peso_num,             // 9 - Peso (quantidade prevista em kg)
        valor_kg_num          // 10 - Valor previsto em reais
    ];


    // Executa a query no banco
    conexao.query(query, valores, (erro, resultado) => {
        if (erro) {
            console.error("Erro ao registrar agendamento:", erro);
            return res.render('agendamento', { mensagem: 'Erro ao registrar o agendamento. Verifique os dados e tente novamente.' });
        }

        // Se não houve erro, renderiza a página com mensagem de sucesso
        console.log("Agendamento registrado com sucesso!");
        res.render('agendamento', { mensagem: 'Agendamento registrado com sucesso!' });
    });
}

module.exports = {
    exibirAgendamento,
    registrarAgendamento,
};
