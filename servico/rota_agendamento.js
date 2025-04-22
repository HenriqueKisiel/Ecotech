const conectiondb = require('../bd/conexao_mysql.js');  // Importa a função de conexão com o banco de dados

// Cria uma conexão com o banco
const conexao = conectiondb();

/**
 * Função para exibir a tela inicial de agendamento de coleta.
 * Ela carrega os dados necessários para preencher os filtros da página.
 */
function exibirAgendamento(req, res) {
    // Consultas para buscar os dados dos filtros
    const queryPessoasFisicas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
    const queryPessoasJuridicas = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica'; // nome fantasia para jurídicas
    const queryCidades = 'SELECT cd_cidade, nm_cidade FROM cidade';
    const queryBairros = 'SELECT cd_bairro, nm_bairro FROM bairro';

    // Executa em sequência as queries e envia os dados para a view
    conexao.query(queryPessoasFisicas, (err1, pessoasFisicas) => {
        if (err1) return res.status(500).send('Erro ao buscar pessoas físicas');

        conexao.query(queryPessoasJuridicas, (err2, pessoasJuridicas) => {
            if (err2) return res.status(500).send('Erro ao buscar pessoas jurídicas');

            conexao.query(queryCidades, (err3, cidades) => {
                if (err3) return res.status(500).send('Erro ao buscar cidades');

                conexao.query(queryBairros, (err4, bairros) => {
                    if (err4) return res.status(500).send('Erro ao buscar bairros');

                    // Renderiza a tela agendamento.handlebars passando os dados dos filtros
                    res.render('agendamento', {
                        mensagem: '',
                        pessoasFisicas,
                        pessoasJuridicas,
                        cidades,
                        bairros,
                        agendamentos: []  // Nenhum resultado ainda, pois não houve busca
                    });
                });
            });
        });
    });
}

/**
 * Função responsável por buscar os agendamentos com base nos filtros preenchidos pelo usuário.
 */
function buscarAgendamentos(req, res) {
    console.log("Função buscarAgendamentos chamada");

    // Captura os filtros do corpo do formulário
    const { nome, endereco, cd_cidade, cd_bairro, dt_solicitada } = req.body;

    // Monta a query principal com os JOINs para buscar dados relacionados
    let query = `
        SELECT 
            a.cd_agendamento, 
            a.ds_endereco AS endereco, 
            c.nm_cidade AS cidade, 
            b.nm_bairro AS bairro, 
            a.dt_solicitada,
            COALESCE(pf.nm_pessoa_fisica, pj.nm_fantasia) AS nome  -- Exibe o nome da pessoa física ou fantasia da jurídica
        FROM agendamento a
        LEFT JOIN cidade c ON a.cd_cidade = c.cd_cidade
        LEFT JOIN bairro b ON a.cd_bairro = b.cd_bairro
        LEFT JOIN pessoa_fisica pf ON a.cd_pessoa_fisica = pf.cd_pessoa_fisica
        LEFT JOIN pessoa_juridica pj ON a.cd_pessoa_juridica = pj.cd_pessoa_juridica
        WHERE 1=1
    `;

    // Vetor que armazenará os valores para a consulta
    const valores = [];

    // Adiciona condições à query conforme os filtros informados
    if (nome) {
        // Busca tanto no nome da pessoa física quanto no nome fantasia da jurídica
        query += " AND (pf.nm_pessoa_fisica LIKE ? OR pj.nm_fantasia LIKE ?)";
        valores.push(`%${nome}%`, `%${nome}%`);
    }
    if (endereco) {
        query += " AND a.ds_endereco LIKE ?";
        valores.push(`%${endereco}%`);
    }
    if (cd_cidade) {
        query += " AND a.cd_cidade = ?";
        valores.push(cd_cidade);
    }
    if (cd_bairro) {
        query += " AND a.cd_bairro = ?";
        valores.push(cd_bairro);
    }
    if (dt_solicitada) {
        query += " AND a.dt_solicitada = ?";
        valores.push(dt_solicitada);
    }

    // Consultas auxiliares para recarregar os filtros depois da busca
    const queryPessoasFisicas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
    const queryPessoasJuridicas = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';
    const queryCidades = 'SELECT cd_cidade, nm_cidade FROM cidade';
    const queryBairros = 'SELECT cd_bairro, nm_bairro FROM bairro';

    // Executa a query principal com os filtros
    conexao.query(query, valores, (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar agendamentos:", erro);
            return res.status(500).send("Erro ao buscar agendamentos.");
        }

        // Recarrega os filtros para manter o formulário populado
        conexao.query(queryPessoasFisicas, (err1, pessoasFisicas) => {
            if (err1) return res.status(500).send('Erro ao buscar pessoas físicas');

            conexao.query(queryPessoasJuridicas, (err2, pessoasJuridicas) => {
                if (err2) return res.status(500).send('Erro ao buscar pessoas jurídicas');

                conexao.query(queryCidades, (err3, cidades) => {
                    if (err3) return res.status(500).send('Erro ao buscar cidades');

                    conexao.query(queryBairros, (err4, bairros) => {
                        if (err4) return res.status(500).send('Erro ao buscar bairros');

                        // Renderiza novamente a página com os resultados da busca e filtros carregados
                        res.render('agendamento', {
                            agendamentos: resultados,
                            pessoasFisicas,
                            pessoasJuridicas,
                            cidades,
                            bairros,
                            mensagem: ''
                        });
                    });
                });
            });
        });
    });
}

// Exporta as funções para serem usadas nas rotas
module.exports = {
    exibirAgendamento,
    buscarAgendamentos
};
