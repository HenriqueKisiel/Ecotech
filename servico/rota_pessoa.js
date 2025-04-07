const conectiondb = require('../bd/conexao_mysql.js');

//Função para pagina pessoa
function exibirPessoa(req, res) {
    res.render('pessoa');
};

//exportando a função 
module.exports = {
    exibirPessoa
}

//Faltou implementar a acomunicação com o banco para os ID corresponderem com os atriobutos. - Henrique

//Função para cadastrar pessoa - INSERT
function Insert(req, res) {
    //pega os valores digitados pelo usuário
    var nomeFisico = req.body.nomeFisico;
    var nomeSocial = req.body.nomeSocial;
    var email = req.body.email;
    var cpf = req.body.cpf;
    var endereco = req.body.endereco;
    var cep = req.body.cep;
    var numero = req.body.numero;
    var cidade = req.body.cidade;
    var bairro = req.body.bairro;
    var dataNasc = req.body.dataNasc;
    //var sexo
    var naturalidade = req.body.naturalidade;
    var telefone = req.body.telefone;

    const sql = 'INSERT INTO pessoa (nome, idade, cidade) VALUES (?, ?, ?)'; //colocar colocar variaveis do banco e ajustar o sql
    conectiondb.query(sql, [/*colocar variaveis do banco*/], (error, results) => {
        if (error) {
            console.error('Erro ao cadastrar pessoa:', error);
            res.status(500).send('Erro ao cadastrar pessoa');
        } else {
            res.redirect('/pessoa'); // Redireciona para a página de pessoas após o cadastro
        }
    });
}

