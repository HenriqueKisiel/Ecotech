const conectiondb = require('../bd/conexao_mysql.js');

// Busca linhas e materiais agrupados (igual ao cadastro)
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

// Exibe o formulário de edição já preenchido
function exibirMaterialEditar(req, res) {
    const conexao = conectiondb();
    const cd_material = req.params.cd_material;

    conexao.query('SELECT * FROM materiais WHERE cd_material = ?', [cd_material], (err, resultados) => {
        if (err || resultados.length === 0) {
            return res.render('materialEditar', { message: 'Material não encontrado.', linhas: [], material: null });
        }
        const material = resultados[0];
        // Garante que ie_linha seja string para o template
        material.ie_linha = String(material.ie_linha);
        buscarLinhasEMateriais((err2, linhas) => {
            if (err2) {
                return res.render('materialEditar', { message: 'Erro ao buscar linhas.', linhas: [], material: null });
            }
            res.render('materialEditar', {
                message: '',
                linhas,
                usuario: req.session.usuario,
                material
            });
        });
    });
}

// Atualiza o material no banco (com as mesmas validações do cadastro)
function editarMaterial(req, res) {
    const conexao = conectiondb();
    const { cd_material, descricao, valor_kg, linha, peso_padrao, volume_m3 } = req.body;

    // Validações (iguais ao cadastro)
    if (!descricao) {
        return renderComErro('Preencha a descrição do material.');
    }
    if (!valor_kg) {
        return renderComErro('Preencha o valor por Kg do material.');
    }
    if (!peso_padrao) {
        return renderComErro('Preencha o peso padrão do material.');
    }
    if (!volume_m3) {
        return renderComErro('Preencha o volume cúbico por Kg.');
    }
    if (!linha) {
        return renderComErro('Selecione uma linha do material.');
    }
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(descricao)) {
        return renderComErro('A descrição deve conter apenas letras.');
    }

    let valorKg = String(valor_kg).replace(',', '.');
    let pesoPadrao = String(peso_padrao).replace(',', '.');
    let volumeM3 = String(volume_m3).replace(',', '.');

    if (!/^\d+(\.\d+)?$/.test(valorKg)) {
        return renderComErro('Valor por Kg deve conter apenas números.');
    }
    if (!/^\d+(\.\d+)?$/.test(pesoPadrao)) {
        return renderComErro('Peso padrão deve conter apenas números.');
    }
    if (!/^\d+(\.\d+)?$/.test(volumeM3)) {
        return renderComErro('Volume cúbico deve conter apenas números.');
    }

    valorKg = parseFloat(valorKg);
    pesoPadrao = parseFloat(pesoPadrao);
    volumeM3 = parseFloat(volumeM3);

    if (valorKg <= 0) {
        return renderComErro('Valor por Kg deve ser positivo.');
    }
    if (pesoPadrao <= 0) {
        return renderComErro('Peso padrão deve ser positivo.');
    }
    if (volumeM3 <= 0) {
        return renderComErro('Volume cúbico deve ser positivo.');
    }

    if (valorKg < 0.01 || valorKg > 999999.99) {
        return renderComErro('Valor por Kg deve ser entre 0.01 e 999999.99.');
    }
    if (pesoPadrao < 0.001 || pesoPadrao > 999.999) {
        return renderComErro('Peso padrão deve ser entre 0.001 e 999.999.');
    }
    if (volumeM3 < 0.00001 || volumeM3 > 9.99999) {
        return renderComErro('Volume cúbico deve ser entre 0.00001 e 9.99999.');
    }

    if (!/^\d{1,7}(\.\d{1,2})?$/.test(valorKg.toFixed(2))) {
        return renderComErro('Valor por Kg deve ter no máximo 2 casas decimais.');
    }
    if (!/^\d{1,6}(\.\d{1,3})?$/.test(pesoPadrao.toFixed(3))) {
        return renderComErro('Peso padrão deve ter no máximo 3 casas decimais.');
    }
    if (!/^\d{1,2}(\.\d{1,5})?$/.test(volumeM3.toFixed(5))) {
        return renderComErro('Volume cúbico deve ter no máximo 5 casas decimais.');
    }

    // Atualiza no banco
    const query = `
        UPDATE materiais
        SET ds_material = ?, vl_valor_por_kg = ?, ie_linha = ?, peso_padrao = ?, volume_m3 = ?
        WHERE cd_material = ?
    `;
    conexao.query(query, [descricao, valorKg, linha, pesoPadrao, volumeM3, cd_material], (err, result) => {
        buscarLinhasEMateriais((err2, linhas) => {
            // Se for AJAX/fetch, responde JSON
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                if (err || result.affectedRows === 0) {
                    return res.status(400).json({ erro: 'Erro ao atualizar material.' });
                }
                return res.json({ mensagem: 'Material atualizado com sucesso!' });
            }
            // Se não for AJAX, renderiza normalmente
            if (err || result.affectedRows === 0) {
                return res.render('materialEditar', {
                    message: 'Erro ao atualizar material.',
                    linhas,
                    usuario: req.session.usuario,
                    material: {
                        ...req.body,
                        ie_linha: String(req.body.linha)
                    }
                });
            }
            res.render('materialEditar', {
                message: 'Material atualizado com sucesso!',
                linhas,
                usuario: req.session.usuario,
                material: {
                    cd_material,
                    descricao,
                    valor_kg: valorKg,
                    ie_linha: String(linha),
                    peso_padrao: pesoPadrao,
                    volume_m3: volumeM3
                }
            });
        });
    });
}

module.exports = {
    exibirMaterialEditar,
    editarMaterial
};