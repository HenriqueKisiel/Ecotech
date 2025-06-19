const conectiondb = require('../bd/conexao_mysql.js')();

function exibirCadastros(req, res) {
    res.render('cadastrosBuscar', { 
        resultados: [],
        usuario: req.session.usuario
     });
}

function formatarDataBR(data) {
    if (!data) return '-';
    // Se vier como Date
    if (data instanceof Date) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
    // Se vier como string '2025-09-26'
    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}/.test(data)) {
        const [ano, mes, dia] = data.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    }
    return data;
}

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
    },
    'Motorista': {
        tabela: 'motorista',
        colunas: {
            nome: 'nm_motorista',
            codigo: 'id_motorista',
            cnh: 'cnh',
            categoria: 'categoria_cnh',
            vencimento: 'vencimento_cnh',
            situacao: 'situacao'
        }
    },
    'Caminhão': {
        tabela: 'caminhao',
        colunas: {
            nome: 'nm_modelo',
            codigo: 'id_caminhao',
            placa: 'placa',
            tipo: 'tipo',
            capacidade_kg: 'capacidade_kg',
            capacidade_volume: 'capacidade_volume',
            ano_fabricacao: 'ano_fabricacao',
            situacao: 'situacao'
        }
    }
};

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

    if (nome && colunas.nome) {
        query += ` AND ${colunas.nome} LIKE ?`;
        params.push('%' + nome + '%');
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

    if ((['Planta de Reciclagem', 'Usuário', 'Motorista', 'Caminhão'].includes(tipoCadastroCorrigido)) && situacao && situacao !== 'Todos') {
        query += ` AND ${colunas.situacao} = ?`;
        params.push(situacao === 'Ativo' ? 'A' : 'I');
    }

    conectiondb.query(query, params, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar cadastros:', erro);
            return res.status(500).send('Erro no servidor');
        }

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
            } else if (tipoCadastroCorrigido === 'Motorista') {
                resultado.cnh = item[colunas.cnh] || '-';
                resultado.categoria = item[colunas.categoria] || '-';
                resultado.vencimento = formatarDataBR(item[colunas.vencimento]);
                resultado.situacao = item[colunas.situacao] === 'A' ? 'Ativo' : 'Inativo';
            } else if (tipoCadastroCorrigido === 'Caminhão') {
                resultado.placa = item[colunas.placa] || '-';
                resultado.tipo = item[colunas.tipo] || '-';
                resultado.capacidade_kg = item[colunas.capacidade_kg] || '-';
                resultado.capacidade_volume = item[colunas.capacidade_volume] || '-';
                resultado.ano_fabricacao = item[colunas.ano_fabricacao] || '-';
                resultado.situacao = item[colunas.situacao] === 'A' ? 'Ativo' : 'Inativo';
            }

            resultado.email = colunas.email ? item[colunas.email] || null : null;
            resultado.telefone = colunas.telefone ? item[colunas.telefone] || null : null;
            resultado.cpf = colunas.cpf ? item[colunas.cpf] || null : null;
            resultado.cnpj = colunas.cnpj ? item[colunas.cnpj] || null : null;

            return resultado;
        });

        res.render('cadastrosBuscar', {
            resultados: resultadoFormatado,
            tipoCadastro: tipoCadastroCorrigido,
            usuario: req.session.usuario
        });
    });
}

module.exports = {
    exibirCadastros,
    formatarDataBR,
    buscarCadastros
};
