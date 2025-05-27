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
        tabela: 'Pessoa_Usuario',
        colunas: {
            nome: 'nm_usuario',
            codigo: 'cd_usuario',
            email: 'ds_email',
            telefone: 'nr_telefone_celular',
            cpf: 'nr_cpf',
            situacao: 'ie_situacao'
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
            codigo: 'cd_planta',
            kg_atual: 'qt_capacidade_atual_kg',
            volume_total: 'qt_capacidade_total_volume',
            volume_atual: 'qt_capacidade_atual_volume',
            volume_disponivel: 'qt_disponivel_volume',
            situacao: 'ie_situacao'
        }
    }
};

// Função para buscar cadastros com base nos filtros
function buscarCadastros(req, res) {
    const { tipoCadastro, nome, email, telefone, cpf, cnpj, codigo, situacao } = req.body;
    const tipoCadastroCorrigido = tipoCadastro.trim();
    const config = configuracoesPorTipo[tipoCadastroCorrigido];

    if (!config) {
        return res.status(400).send('Tipo de cadastro inválido');
    }

    const { tabela, colunas } = config;
    let query = `SELECT * FROM ${tabela} WHERE 1=1`;
    const params = [];

    // Filtros comuns
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

    // Filtro adicional para "Situação" se for "Planta de Reciclagem"
    if ((tipoCadastroCorrigido === 'Planta de Reciclagem' || tipoCadastroCorrigido === 'Usuário') && situacao && situacao !== 'Todos') {
        query += ` AND ${colunas.situacao} = ?`;
        params.push(situacao === 'Ativo' ? 'A' : 'I'); // 'A' para Ativo, 'I' para Inativo
    }

    conectiondb.query(query, params, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar cadastros:', erro);
            return res.status(500).send('Erro no servidor');
        }

        console.log('Resultados brutos do banco:', resultados);

        const resultadoFormatado = resultados.map(item => {
            const resultado = {
                nome: item[colunas.nome] || null,
                codigo: item[colunas.codigo] || null
            };

            if (tipoCadastroCorrigido === 'Planta de Reciclagem') {
                resultado.kg_atual = item[colunas.kg_atual] || '-';
                resultado.volume_total = item[colunas.volume_total] || '-';
                resultado.volume_atual = item[colunas.volume_atual] || '-';
                resultado.volume_disponivel = item[colunas.volume_disponivel] || '-';
                resultado.situacao = item[colunas.situacao] === 'A' ? 'Ativo' : 'Inativo';
            } else if (tipoCadastroCorrigido === 'Usuário') {
                resultado.situacao = item[colunas.situacao] === 'A' ? 'Ativo' : 'Inativo'; 
            }
                resultado.email = colunas.email ? item[colunas.email] || null : null;
                resultado.telefone = colunas.telefone ? item[colunas.telefone] || null : null;
                resultado.cpf = colunas.cpf ? item[colunas.cpf] || null : null;
                resultado.cnpj = colunas.cnpj ? item[colunas.cnpj] || null : null;
            

            return resultado;
        });

        console.log('Enviando para o Handlebars:', resultadoFormatado);

        res.render('cadastros', {
            resultados: resultadoFormatado,
            tipoCadastro: tipoCadastroCorrigido
        });
    });
}

module.exports = {
    exibirCadastros,
    buscarCadastros
};
