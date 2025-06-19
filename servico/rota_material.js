const conectiondb = require('../bd/conexao_mysql.js');

// Função para buscar linhas e materiais agrupados
function buscarLinhasEMateriais(callback) {
    const conexao = conectiondb();
    const query = `
        SELECT l.cd_linha, l.nm_linha, m.ds_material, m.ie_linha
        FROM linha l
        LEFT JOIN materiais m ON l.cd_linha = m.ie_linha
        ORDER BY l.cd_linha, m.ds_material
    `;
    conexao.query(query, (err, resultados) => {
        if (err) return callback(err);

        // Agrupa por linha
        const linhas = {};
        resultados.forEach(row => {
            if (!linhas[row.cd_linha]) {
                linhas[row.cd_linha] = {
                    cd_linha: row.cd_linha,
                    nm_linha: row.nm_linha,
                    materiais: []
                };
            }
            if (row.ds_material) {
                linhas[row.cd_linha].materiais.push(row.ds_material);
            }
        });
        callback(null, Object.values(linhas));
    });
}

// Função para exibir a página de cadastro de material com linhas e materiais
function exibirMaterial(req, res) {
    buscarLinhasEMateriais((err, linhas) => {
        if (err) {
            return res.status(500).send('Erro ao buscar materiais');
        }
        res.render('material', { 
            linhas,
            usuario: req.session.usuario 
        });
    });
}

// Função para cadastrar o material no banco de dados
function cadastrarMaterial(req, res) {
    console.log('Dados recebidos no backend:', req.body);
    const { descricao, valor_kg, linha, peso_padrao, volume_m3 } = req.body;

    // Validação individual de cada campo obrigatório
    if (!descricao) {
        return res.status(400).json({ erro: "Preencha a descrição do material." });
    }
    if (!valor_kg) {
        return res.status(400).json({ erro: "Preencha o valor por Kg do material." });
    }
    if (!peso_padrao) {
        return res.status(400).json({ erro: "Preencha o peso padrão do material." });
    }
    if (!volume_m3) {
        return res.status(400).json({ erro: "Preencha o volume cúbico por Kg." });
    }
    if (!linha) {
        return res.status(400).json({ erro: "Selecione uma linha do material." });
    }

    // 2. descricao: apenas letras (com ou sem acento), espaços permitidos
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(descricao)) {
        return res.status(400).json({ erro: "A descrição deve conter apenas letras." });
    }

    // 3. valor_kg, peso_padrao, volume_m3: apenas números positivos, ponto ou vírgula
    let valorKg = String(valor_kg).replace(',', '.');
    let pesoPadrao = String(peso_padrao).replace(',', '.');
    let volumeM3 = String(volume_m3).replace(',', '.');

    if (!/^\d+(\.\d+)?$/.test(valorKg)) {
        return res.status(400).json({ erro: "Valor por Kg deve conter apenas números." });
    }
    if (!/^\d+(\.\d+)?$/.test(pesoPadrao)) {
        return res.status(400).json({ erro: "Peso padrão deve conter apenas números." });
    }
    if (!/^\d+(\.\d+)?$/.test(volumeM3)) {
        return res.status(400).json({ erro: "Volume cúbico deve conter apenas números." });
    }

    // 4. Converter para número
    valorKg = parseFloat(valorKg);
    pesoPadrao = parseFloat(pesoPadrao);
    volumeM3 = parseFloat(volumeM3);

    // 5. Apenas números positivos
    if (valorKg <= 0) {
        return res.status(400).json({ erro: "Valor por Kg deve ser positivo." });
    }
    if (pesoPadrao <= 0) {
        return res.status(400).json({ erro: "Peso padrão deve ser positivo." });
    }
    if (volumeM3 <= 0) {
        return res.status(400).json({ erro: "Volume cúbico deve ser positivo." });
    }

    // 6. Faixas de valores
    if (valorKg < 0.01 || valorKg > 999999.99) {
        return res.status(400).json({ erro: "Valor por Kg deve ser entre 0.01 e 999999.99." });
    }
    if (pesoPadrao < 0.001 || pesoPadrao > 999.999) {
        return res.status(400).json({ erro: "Peso padrão deve ser entre 0.001 e 999.999." });
    }
    if (volumeM3 < 0.00001 || volumeM3 > 9.99999) {
        return res.status(400).json({ erro: "Volume cúbico deve ser entre 0.00001 e 9.99999." });
    }

    // 7. Precisão dos decimais
    if (!/^\d{1,7}(\.\d{1,2})?$/.test(valorKg.toFixed(2))) {
        return res.status(400).json({ erro: "Valor por Kg deve ter no máximo 2 casas decimais." });
    }
    if (!/^\d{1,6}(\.\d{1,3})?$/.test(pesoPadrao.toFixed(3))) {
        return res.status(400).json({ erro: "Peso padrão deve ter no máximo 3 casas decimais." });
    }
    if (!/^\d{1,2}(\.\d{1,5})?$/.test(volumeM3.toFixed(5))) {
        return res.status(400).json({ erro: "Volume cúbico deve ter no máximo 5 casas decimais." });
    }

    // Se passou por todas as validações, insere no banco
    const conexao = conectiondb();

    const query = `
        INSERT INTO materiais (ds_material, vl_valor_por_kg, ie_linha, peso_padrao, volume_m3)
        VALUES (?, ?, ?, ?, ?)
    `;

    conexao.query(query, [descricao, valorKg, linha, pesoPadrao, volumeM3], (err, resultado) => {
        if (err) {
            console.error('Erro ao cadastrar material:', err);
            return res.status(500).json({ erro: 'Erro no servidor ao cadastrar o material.' });
        }

        // Sucesso!
        return res.json({ sucesso: true, mensagem: "Material cadastrado com sucesso!" });
    });
}

module.exports = {
    exibirMaterial,
    cadastrarMaterial
};