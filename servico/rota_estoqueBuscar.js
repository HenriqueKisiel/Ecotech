const conectiondb = require('../bd/conexao_mysql.js');

// Função para exibir a página de busca
function exibirestoqueBuscar(req, res) {
    console.log("Função exibirestoqueBuscar chamada");
    // Renderiza a página "estoqueBuscar"
    res.status(200).render('estoqueBuscar'); 
}

function localizarestoqueBuscar(req, res) {
    console.log("Função localizarestoqueBuscar chamada");

    const { linhas, codigo } = req.query;
    const conexao = conectiondb();

    // Verificando se a conexão foi bem-sucedida
    conexao.connect((erro) => {
        if (erro) {
            console.error("Erro na conexão com o banco de dados:", erro);
            return res.status(500).json({ erro: 'Erro ao conectar ao banco de dados.' });
        }
        console.log("Conexão com o banco de dados estabelecida com sucesso.");
    });

    let sql = 'SELECT * FROM materiais WHERE 1=1';
    const params = [];

    // Log para verificar os parâmetros da requisição
    console.log("Parâmetros recebidos:", { linhas, codigo });

    if (linhas) {
        const linhaArray = linhas.split(',');
        sql += ` AND linha IN (${linhaArray.map(() => '?').join(',')})`;
        params.push(...linhaArray);
    }

    if (codigo) {
        sql += ' AND LOWER(codigo) LIKE ?';
        params.push(`%${codigo.toLowerCase()}%`);
    }

    // Log da query SQL gerada e os parâmetros
    console.log("SQL gerada:", sql);
    console.log("Parâmetros da query:", params);

    // Executa a query SQL
    conexao.query(sql, params, (erro, resultados) => {
        if (erro) {
            // Log de erro da query
            console.error("Erro ao executar a query:", erro);
            return res.status(500).json({ erro: 'Erro ao executar a busca no banco de dados.' });
        }

        // Log para verificar os resultados da query
        console.log("Resultados da busca:", resultados);

        res.status(200).json(resultados);
    });
}

module.exports = {
    exibirestoqueBuscar,
    localizarestoqueBuscar
};
