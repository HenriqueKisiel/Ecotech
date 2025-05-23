const conectiondb = require('../bd/conexao_mysql.js');  // Importa a função de conexão com o banco de dados
const conexao = conectiondb();

/**
 * Função para exibir a tela inicial de agendamento de coleta.
 * Ela carrega os dados necessários para preencher os filtros da página.
 */
function exibirAgendamento(req, res) {
    // Consultas para buscar os dados dos filtros
    const queryPessoasFisicas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
    const queryPessoasJuridicas = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';
    const queryCidades = 'SELECT DISTINCT nm_cidade FROM agendamento WHERE nm_cidade IS NOT NULL AND nm_cidade <> ""';
    const queryBairros = 'SELECT DISTINCT nm_bairro FROM agendamento WHERE nm_bairro IS NOT NULL AND nm_bairro <> ""';


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
                        agendamentos: []
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
    const { nome, endereco, nm_cidade, nm_bairro, dt_solicitada, status } = req.body;

    // Monta a query principal 
    let query = ` 
        SELECT 
            a.cd_agendamento, 
            a.ds_endereco AS endereco, 
            a.nm_cidade AS cidade, 
            a.nm_bairro AS bairro, 
            a.dt_solicitada,
            COALESCE(pf.nm_pessoa_fisica, pj.nm_fantasia) AS nome
        FROM agendamento a
        LEFT JOIN pessoa_fisica pf ON a.cd_pessoa_fisica = pf.cd_pessoa_fisica
        LEFT JOIN pessoa_juridica pj ON a.cd_pessoa_juridica = pj.cd_pessoa_juridica
        WHERE 1=1
    `;

    const valores = [];

    // Adiciona condições à query conforme os filtros informados
    if (nome) {
        query += " AND (pf.nm_pessoa_fisica LIKE ? OR pj.nm_fantasia LIKE ?)";
        valores.push(`%${nome}%`, `%${nome}%`);
    }
    if (endereco) {
        query += " AND a.ds_endereco LIKE ?";
        valores.push(`%${endereco}%`);
    }
    if (nm_cidade) {
        query += " AND a.nm_cidade LIKE ?";
        valores.push(`%${nm_cidade}%`);
    }
    if (nm_bairro) {
        query += " AND a.nm_bairro LIKE ?";
        valores.push(`%${nm_bairro}%`);
    }
    if (dt_solicitada) {
        query += " AND a.dt_solicitada = ?";
        valores.push(dt_solicitada);
    }
    if (status) {
        query += " AND a.status = ?";
        valores.push(status);
    }

    // Consultas auxiliares para recarregar os filtros depois da busca
    const queryPessoasFisicas = 'SELECT cd_pessoa_fisica, nm_pessoa_fisica FROM pessoa_fisica';
    const queryPessoasJuridicas = 'SELECT cd_pessoa_juridica, nm_fantasia FROM pessoa_juridica';
    const queryCidades = 'SELECT DISTINCT nm_cidade FROM agendamento WHERE nm_cidade IS NOT NULL AND nm_cidade <> ""';
    const queryBairros = 'SELECT DISTINCT nm_bairro FROM agendamento WHERE nm_bairro IS NOT NULL AND nm_bairro <> ""';

    // Executa a query principal com os filtros
    conexao.query(query, valores, (erro, resultados) => {
        if (erro) {
            console.error("Erro na consulta de agendamentos:", erro);
            return res.status(500).send('Erro ao buscar agendamentos');
        }

        // Antes de renderizar:
        resultados.forEach(agendamento => {
            agendamento.dt_solicitada = formatarDataBR(agendamento.dt_solicitada);
        });


        // Recarrega os dados dos filtros
        conexao.query(queryPessoasFisicas, (err1, pessoasFisicas) => {
            if (err1) return res.status(500).send('Erro ao buscar pessoas físicas');

            conexao.query(queryPessoasJuridicas, (err2, pessoasJuridicas) => {
                if (err2) return res.status(500).send('Erro ao buscar pessoas jurídicas');

                conexao.query(queryCidades, (err3, cidades) => {
                    if (err3) return res.status(500).send('Erro ao buscar cidades');

                    conexao.query(queryBairros, (err4, bairros) => {
                        if (err4) return res.status(500).send('Erro ao buscar bairros');

                        // Renderiza a tela com os resultados da busca
                        res.render('agendamento', {
                            mensagem: 'Agendamentos encontrados:',
                            pessoasFisicas,
                            pessoasJuridicas,
                            cidades,
                            bairros,
                            agendamentos: resultados  // Passa os resultados da busca
                        });
                    });
                });
            });
        });
    });
}

function formatarDataBR(data) {
    if (!data) return '';
    const d = new Date(data);
    if (isNaN(d.getTime())) return data;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}


module.exports = {
    exibirAgendamento,
    buscarAgendamentos,
};
