const conectiondb = require('../bd/conexao_mysql.js');

//Função para exibir a página de cadastro
function exibirCaminhao(req, res) {
    res.render('caminhao', { 
        usuario: req.session.usuario
    });
}

// Função para cadastrar caminhão
function cadastrarCaminhao(req, res) {
    const connection = conectiondb();
    const {
        nm_modelo,
        tipo,
        placa,
        ano_fabricacao,
        capacidade_kg,
        capacidade_volume
    } = req.body;

    const situacao = 'A'; // Sempre ativo

    const query = `
        INSERT INTO caminhao 
        (nm_modelo, tipo, placa, ano_fabricacao, capacidade_kg, capacidade_volume, situacao)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(
        query,
        [nm_modelo, tipo, placa, ano_fabricacao, capacidade_kg, capacidade_volume, situacao],
        (erro, resultado) => {
            if (erro) {
                console.log('Erro ao cadastrar caminhão:', erro);
                return res.status(500).send('Erro ao cadastrar caminhão');
            }
            // Redireciona ou renderiza 
            res.redirect('/cadastros?sucesso=1');
        }
    );
}

//exportando as funções 
module.exports = {
    exibirCaminhao,
    cadastrarCaminhao
}