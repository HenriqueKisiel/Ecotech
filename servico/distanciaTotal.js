const { calcularDistancia } = require('./distancia');
const conectiondb = require('../bd/conexao_mysql');

async function calcularEDistanciaRotaCompleta(cd_rota) {
    const connection = conectiondb();

    try {
        // 🔹 Buscar CEP da planta
        const sqlPlanta = `
            SELECT p.nr_cep
            FROM planta p
            INNER JOIN rota_coleta r ON r.ie_planta = p.cd_planta
            WHERE r.cd_rota = ?
        `;

        const planta = await new Promise((resolve, reject) => {
            connection.query(sqlPlanta, [cd_rota], (err, result) => {
                if (err) return reject(err);
                resolve(result[0]);
            });
        });

        if (!planta || !planta.nr_cep) {
            throw new Error('Planta não encontrada ou sem CEP cadastrado.');
        }

        const cepPlanta = planta.nr_cep;

        // 🔹 Buscar todos os pontos da rota na ordem
        const sqlPontos = `
            SELECT nr_cep
            FROM pontos_coleta
            WHERE ie_rota = ?
            ORDER BY cd_ponto_coleta
        `;

        const pontos = await new Promise((resolve, reject) => {
            connection.query(sqlPontos, [cd_rota], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        // 🔹 Se não há pontos, distância é 0
        if (!pontos || pontos.length === 0) {
            const sqlZerarDistancia = `
                UPDATE rota_coleta
                SET nr_distancia_km = 0
                WHERE cd_rota = ?
            `;
            await new Promise((resolve, reject) => {
                connection.query(sqlZerarDistancia, [cd_rota], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            console.log(`Distância da rota ${cd_rota} zerada (sem pontos).`);
            return 0;
        }

        // 🔹 Montar sequência: Planta ➝ Ponto1 ➝ ... ➝ Último ➝ Planta
        const sequenciaCeps = [cepPlanta, ...pontos.map(p => p.nr_cep), cepPlanta];

        let distanciaTotal = 0;

        // 🔹 Calcular distância entre os pares na sequência
        for (let i = 0; i < sequenciaCeps.length - 1; i++) {
            const origem = sequenciaCeps[i];
            const destino = sequenciaCeps[i + 1];

            console.log(`Calculando: ${origem} ➝ ${destino}`);

            const distancia = await calcularDistancia(origem, destino);
            console.log(`Distância ${origem} ➝ ${destino}: ${distancia.toFixed(2)} km`);

            distanciaTotal += distancia;
        }

        console.log(`Distância total da rota ${cd_rota}: ${distanciaTotal.toFixed(2)} km`);

        // 🔹 Atualizar a rota no banco
        const sqlAtualizaRota = `
            UPDATE rota_coleta
            SET nr_distancia_km = ?
            WHERE cd_rota = ?
        `;

        await new Promise((resolve, reject) => {
            connection.query(sqlAtualizaRota, [distanciaTotal, cd_rota], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        return distanciaTotal;

    } catch (error) {
        console.error('Erro ao calcular distância total da rota:', error);
        throw error;
    }
}

module.exports = { calcularEDistanciaRotaCompleta };
