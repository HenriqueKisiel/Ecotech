const conectiondb = require('../bd/conexao_mysql.js');
// FUNÇÃO: Saída de material do estoque OU busca de materiais para saída
function exibirestoqueSaida(req, res) {
    // Exibe página caso seja GET
    if (req.method === 'GET') {
        return res.render('estoqueSaida', { resultados: [], message: '' });
    }

    const conexao = conectiondb();

    const {
        linha_material,
        descricao_material,
        codigo_material,
        data_cadastro,
        saidas // pode estar vazio ou conter os dados de saída
    } = req.body;


    // Caso seja uma busca
    if (!saidas) {
        let query = `SELECT * FROM estoque WHERE 1=1`;
        const parametros = [];

        if (linha_material && linha_material !== 'Todas') {
            query += ` AND linha_material = ?`;
            parametros.push(linha_material);
        }

        if (descricao_material) {
            query += ` AND descricao_material LIKE ?`;
            parametros.push(`%${descricao_material}%`);
        }

        if (codigo_material) {
            query += ` AND codigo_material LIKE ?`;
            parametros.push(`%${codigo_material}%`);
        }

        if (data_cadastro) {
            query += ` AND DATE(data_entrada) = ?`;
            parametros.push(data_cadastro);
        }

        // Executa a busca
        conexao.query(query, parametros, (err, results) => {
            if (err) {
                console.error('Erro na busca:', err);
                return res.render('estoqueSaida', { resultados: [], message: 'Erro ao buscar materiais.' });
            }

            return res.render('estoqueSaida', {
                resultados: results,
                message: results.length ? '' : 'Nenhum material encontrado.'
            });
        });

    } else {
     
        // Caso esteja registrando saída
        const updates = Array.isArray(saidas) ? saidas : [saidas];
        let erros = [];
        let operacoesConcluidas = 0;

        updates.forEach((saida, index) => {
            const { id, quantidade_saida, status } = saida;

            if (!id || !quantidade_saida || !status) {
                erros.push(`Saída inválida no item ${index + 1}`);
                return checkFinalizacao();
            }

            const query = `
                UPDATE estoque 
                SET quantidade = quantidade - ?, status = ?, data_saida = NOW() 
                WHERE id = ? AND quantidade >= ?
            `;

            const valores = [quantidade_saida, status, id, quantidade_saida];

            // Executa atualização de saída
            conexao.query(query, valores, (err, result) => {
                if (err) {
                    console.error('Erro ao registrar saída:', err);
                    erros.push(`Erro ao atualizar material com ID ${id}`);
                }
                checkFinalizacao();
            });
        });

        // Checagem final para renderizar a resposta
        function checkFinalizacao() {
            operacoesConcluidas++;
            if (operacoesConcluidas === updates.length) {
                const msg = erros.length > 0
                    ? erros.join(', ')
                    : 'Saída registrada com sucesso!';
                return res.render('estoqueSaida', { resultados: [], message: msg });
            }
        }
    }
}

// Exportando todas as funções para uso nas rotas
module.exports = {
    exibirestoqueSaida
};