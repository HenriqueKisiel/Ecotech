const axios = require('axios');
require('dotenv').config();

// Primeiro busca o endereço no ViaCEP
async function buscarEnderecoViaCEP(cep) {
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.erro) {
            console.error('CEP não encontrado no ViaCEP:', cep);
            return null;
        }

        const endereco = `${data.logradouro || data.bairro}, ${data.localidade}, ${data.uf}`;
        return endereco;
    } catch (error) {
        console.error('Erro ao buscar no ViaCEP:', error.message);
        return null;
    }
}

// Agora busca as coordenadas no OpenRouteService
async function obterCoordenadas(cep) {
    const apiKey = process.env.API_KEY_ORS;

    const endereco = await buscarEnderecoViaCEP(cep);
    if (!endereco) {
        console.error('Não foi possível obter endereço para o CEP:', cep);
        return null;
    }

    const url = `https://api.openrouteservice.org/geocode/search`;

    try {
        const response = await axios.get(url, {
            params: {
                api_key: apiKey,
                text: endereco,
                boundary_country: 'BR'
            },
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.data.features.length === 0) {
            console.error('Coordenadas não encontradas para:', endereco);
            return null;
        }

        const { coordinates } = response.data.features[0].geometry;
        const [lon, lat] = coordinates;
        return { lat, lon };
    } catch (error) {
        console.error('Erro ao obter coordenadas:', error.message);
        return null;
    }
}

// Cálculo de distância
async function calcularDistancia(cepOrigem, cepDestino) {
    const apiKey = process.env.API_KEY_ORS;
    const url = 'https://api.openrouteservice.org/v2/matrix/driving-car';

    const origem = await obterCoordenadas(cepOrigem);
    const destino = await obterCoordenadas(cepDestino);

    if (!origem || !destino) {
        throw new Error('Não foi possível obter as coordenadas.');
    }

    const data = {
        locations: [
            [origem.lon, origem.lat],
            [destino.lon, destino.lat]
        ],
        metrics: ['distance'],
        units: 'km'
    };

    const headers = {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, data, { headers });
        const distancia = response.data.distances[0][1]; // em quilômetros
        return distancia;
    } catch (error) {
        console.error('Erro ao calcular distância:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { calcularDistancia };
