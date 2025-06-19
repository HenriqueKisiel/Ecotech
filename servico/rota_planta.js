const db = require('../bd/conexao_mysql.js')();

// Função para exibir a página de cadastro da planta
function exibirPlanta(req, res) {
    const sql = 'SELECT cd_cidade, nm_cidade FROM cidade ORDER BY nm_cidade';

    db.query(sql, function (err, resultados) {
        if (err) {
            console.error('Erro ao buscar cidades:', err);
            return res.status(500).send('Erro ao carregar cidades.');
        }

        res.render('planta', {
            usuario: req.session.usuario,
            title: 'Cadastro de Planta de Reciclagem',
            cidades: resultados
        });
    });
}

// Função para cadastrar uma nova planta no banco de dados
function cadastrarPlanta(req, res) {
    let {
        nm_planta,
        qt_capacidade_total_volume,
        nr_cep,
        nr_endereco,
        ds_endereco,
        nm_bairro,
        nm_cidade,
        uf_estado
    } = req.body;

    const ie_situacao = "A";
    nr_cep = nr_cep ? nr_cep.replace(/\D/g, '') : '';

    // --- Validações Nome da Planta (mensagens separadas) ---
    if (!nm_planta || nm_planta.trim().length === 0) {
        return res.status(400).json({
            erro: "O nome da planta é obrigatório.",
            script: `<script>
                swal("Erro!", "O nome da planta é obrigatório.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (nm_planta.trim().length < 10) {
        return res.status(400).json({
            erro: "O nome da planta deve ter pelo menos 10 caracteres.",
            script: `<script>
                swal("Erro!", "O nome da planta deve ter pelo menos 10 caracteres.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (nm_planta.trim().length > 100) {
        return res.status(400).json({
            erro: "O nome da planta deve ter no máximo 100 caracteres.",
            script: `<script>
                swal("Erro!", "O nome da planta deve ter no máximo 100 caracteres.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (/^\d+$/.test(nm_planta)) {
        return res.status(400).json({
            erro: "O nome da planta não pode ser apenas números.",
            script: `<script>
                swal("Erro!", "O nome da planta não pode ser apenas números.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (/[^a-zA-Z0-9 ]/.test(nm_planta)) {
        return res.status(400).json({
            erro: "O nome da planta só pode conter letras, números e espaços.",
            script: `<script>
                swal("Erro!", "O nome da planta só pode conter letras, números e espaços.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (/\s{2,}/.test(nm_planta)) {
        return res.status(400).json({
            erro: "O nome da planta não pode conter espaços duplos.",
            script: `<script>
                swal("Erro!", "O nome da planta não pode conter espaços duplos.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }

    // --- Validações Capacidade Máxima de volume cúbico (m³) ---
    if (
        qt_capacidade_total_volume === undefined ||
        qt_capacidade_total_volume === null ||
        qt_capacidade_total_volume === ''
    ) {
        return res.status(400).json({
            erro: "A capacidade máxima é obrigatória.",
            script: `<script>
                swal("Erro!", "A capacidade máxima de volume é obrigatória.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (isNaN(Number(qt_capacidade_total_volume))) {
        return res.status(400).json({
            erro: "A capacidade máxima deve ser um número.",
            script: `<script>
                swal("Erro!", "A capacidade máxima deve ser um número.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    const capacidade = Number(qt_capacidade_total_volume);
    const capacidadeMin = 99.99999999;
    const capacidadeMax = 999999999999.99999999;
    const casasDecimais = qt_capacidade_total_volume.includes('.') ? qt_capacidade_total_volume.split('.')[1].length : 0;

    if (capacidade <= 0) {
        return res.status(400).json({
            erro: "A capacidade máxima deve ser um número positivo.",
            script: `<script>
                swal("Erro!", "A capacidade máxima deve ser um número positivo.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (capacidade < capacidadeMin) {
        return res.status(400).json({
            erro: `A capacidade máxima deve ser no mínimo ${capacidadeMin}.`,
            script: `<script>
                swal("Erro!", "A capacidade máxima deve ser no mínimo ${capacidadeMin}.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (capacidade > capacidadeMax) {
        return res.status(400).json({
            erro: `A capacidade máxima deve ser no máximo ${capacidadeMax}.`,
            script: `<script>
                swal("Erro!", "A capacidade máxima deve ser no máximo ${capacidadeMax}.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (casasDecimais > 8) {
        return res.status(400).json({
            erro: "A capacidade máxima deve ter no máximo 8 casas decimais.",
            script: `<script>
                swal("Erro!", "A capacidade máxima deve ter no máximo 8 casas decimais.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }

    // --- Validações CEP ---
    if (!nr_cep || nr_cep.length === 0) {
        return res.status(400).json({
            erro: "O CEP é obrigatório.",
            script: `<script>
                swal("Erro!", "O CEP é obrigatório.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (!/^\d{8}$/.test(nr_cep)) {
        return res.status(400).json({
            erro: "CEP inválido.",
            script: `<script>
                swal("Erro!", "CEP inválido.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }

    // --- Validações Número do Endereço ---
    if (
        !nr_endereco ||
        typeof nr_endereco !== 'string' ||
        nr_endereco.trim().length === 0
    ) {
        return res.status(400).json({
            erro: "O número do endereço é obrigatório.",
            script: `<script>
                swal("Erro!", "O número do endereço é obrigatório.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (nr_endereco.trim().length > 10) {
        return res.status(400).json({
            erro: "O número do endereço deve ter no máximo 10 caracteres.",
            script: `<script>
                swal("Erro!", "O número do endereço deve ter no máximo 10 caracteres.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (!/[a-zA-Z0-9]/.test(nr_endereco)) {
        return res.status(400).json({
            erro: "O número do endereço deve conter pelo menos uma letra ou número.",
            script: `<script>
                swal("Erro!", "O número do endereço deve conter pelo menos uma letra ou número.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }
    if (!/^[a-zA-Z0-9\-\/ ]+$/.test(nr_endereco)) {
        return res.status(400).json({
            erro: "O número do endereço só pode conter letras, números, hífen, barra e espaço.",
            script: `<script>
                swal("Erro!", "O número do endereço só pode conter letras, números, hífen, barra e espaço.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }

    // --- Validação dos campos automáticos obrigatórios ---
    if (
        !ds_endereco || ds_endereco.trim().length === 0 ||
        !nm_bairro || nm_bairro.trim().length === 0 ||
        !nm_cidade || nm_cidade.trim().length === 0 ||
        !uf_estado || uf_estado.trim().length === 0
    ) {
        return res.status(400).json({
            erro: "Todos os campos de endereço (rua, bairro, cidade e UF) devem estar preenchidos pelo CEP.",
            script: `<script>
                swal("Erro!", "CEP inválido.", {
                    icon: "error",
                    buttons: {
                        confirm: {
                            text: "OK",
                            className: "btn btn-danger",
                        },
                    },
                });
            </script>`
        });
    }

    // --- Fim das validações ---

    const sql = `
        INSERT INTO planta (
            nm_planta,
            qt_capacidade_total_volume,
            nr_cep,
            nr_endereco,
            ds_endereco,
            nm_bairro,
            nm_cidade,
            uf_estado,
            ie_situacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nm_planta.trim(),
        capacidade,
        nr_cep,
        nr_endereco.trim(),
        ds_endereco,
        nm_bairro,
        nm_cidade,
        uf_estado,
        ie_situacao
    ];

    db.query(sql, valores, function (err, result) {
        if (err) {
            console.error('Erro ao cadastrar planta:', err);
            return res.status(500).json({
                erro: 'Erro ao cadastrar planta.',
                script: `<script>
                    swal("Erro!", "Erro ao cadastrar planta.", {
                        icon: "error",
                        buttons: {
                            confirm: {
                                text: "OK",
                                className: "btn btn-danger",
                            },
                        },
                    });
                </script>`
            });
        }

        res.json({
            sucesso: true,
            planta: {
                nm_planta,
                qt_capacidade_total_volume,
                nr_cep,
                nr_endereco,
                ds_endereco,
                nm_bairro,
                nm_cidade,
                uf_estado,
                ie_situacao
            },
            script: `
                <script>
                    swal({
                        title: "Cadastro realizado!",
                        text: "Planta cadastrada com sucesso!",
                        icon: "success",
                        buttons: {
                            confirm: {
                                text: "OK",
                                value: true,
                                visible: true,
                                className: "btn btn-success",
                                closeModal: true
                            }
                        }
                    });
                </script>
            `
        });
    });
}

module.exports = {
    exibirPlanta,
    cadastrarPlanta
};