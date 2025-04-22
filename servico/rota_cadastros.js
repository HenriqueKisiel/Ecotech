const conectiondb = require('../bd/conexao_mysql.js')();

// Renderiza a página inicialmente
function exibirCadastros(req, res) {
    res.render('cadastros', { resultados: [] });
}

// Mapeamento do tipo de cadastro para tabela e colunas correspondentes
const configuracoesPorTipo = {
    'Pessoa': {
        tabela: 'pessoa_fisica',
        colunas: {
            nome: 'nm_pessoa_fisica',
            email: 'ds_email',
            telefone: 'nr_telefone_celular',
            cpf: 'nr_cpf',
            codigo: 'cd_pessoa_fisica'
        }
    },
    'Usuário': {
        tabela: 'usuario',
        colunas: {
            nome: 'nm_usuario',
            codigo: 'cd_usuario'
        }
    },
    'Fornecedor ou Pessoa Jurídica': {
        tabela: 'pessoa_juridica',
        colunas: {
            nome: 'nm_fantasia',
            telefone: 'nr_telefone',
            cnpj: 'nr_cnpj',
            email: 'ds_email',
            codigo: 'cd_pessoa_juridica'
        }
    },
    'Planta de Reciclagem': {
        tabela: 'planta',
        colunas: {
            nome: 'nm_planta',
            codigo: 'cd_planta'
        }
    }
};

// Função para buscar cadastros com base nos filtros
function buscarCadastros(req, res) {
    const { tipoCadastro, nome, email, telefone, cpf, cnpj, codigo } = req.body;

    // Garantir que o tipo de cadastro seja um valor válido
    const tipoCadastroCorrigido = tipoCadastro.trim();
    const config = configuracoesPorTipo[tipoCadastroCorrigido];

    if (!config) {
        return res.status(400).send('Tipo de cadastro inválido');
    }

    const { tabela, colunas } = config;
    let query = `SELECT * FROM ${tabela} WHERE 1=1`;
    const params = [];

    // Filtros para cada tipo de dado (nome, email, telefone, etc.)
    if (nome && colunas.nome) {
        query += ` AND ${colunas.nome} LIKE ?`;
        params.push('%' + nome + '%');
    }
    if (email && colunas.email) {
        query += ` AND ${colunas.email} LIKE ?`;
        params.push('%' + email + '%');
    }
    if (telefone && colunas.telefone) {
        query += ` AND ${colunas.telefone} LIKE ?`;
        params.push('%' + telefone + '%');
    }
    if (cpf && colunas.cpf) {
        query += ` AND ${colunas.cpf} LIKE ?`;
        params.push('%' + cpf + '%');
    }
    if (cnpj && colunas.cnpj) {
        query += ` AND ${colunas.cnpj} LIKE ?`;
        params.push('%' + cnpj + '%');
    }
    if (codigo && colunas.codigo) {
        query += ` AND ${colunas.codigo} = ?`;
        params.push(codigo);
    }

    // Executando a consulta no banco
    conectiondb.query(query, params, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar cadastros:', erro);
            return res.status(500).send('Erro no servidor');
        }

        console.log('Resultados brutos do banco:', resultados);

        // Formatação dos resultados para enviar ao Handlebars
        const resultadoFormatado = resultados.map(item => {
            return {
                nome: item[colunas.nome] || null,
                email: colunas.email ? item[colunas.email] || null : null,
                telefone: colunas.telefone ? item[colunas.telefone] || null : null,
                cpf: colunas.cpf ? item[colunas.cpf] || null : null,
                cnpj: colunas.cnpj ? item[colunas.cnpj] || null : null,
                codigo: item[colunas.codigo] || null
            };
        });

        // Renderizando a página com os resultados formatados e o tipo de cadastro selecionado
        console.log('Enviando para o Handlebars:', resultadoFormatado);
        res.render('cadastros', {
            resultados: resultadoFormatado,
            tipoCadastro: tipoCadastroCorrigido // Passando o tipo de cadastro para o Handlebars
        });
    });
}


module.exports = {
    exibirCadastros,
    buscarCadastros
};
