function lerArquivo(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(leitor.error);
        leitor.readAsText(arquivo);
    });
};

async function validarCabecalho(arquivo) {
    const leitor = await lerArquivo(arquivo);
    const resultado = leitor.toLowerCase();
    const colunas = resultado.split('\n')[0].split(',').map(col => col.trim());
    if (!colunas.includes("nome") || !colunas.includes("email")) {
        throw new Error('Anexe um arquivo válido');
    } else {
        return leitor;
    }
};

function tranformarJSON(arquivo) {
    return new Promise((resolve, reject) => {
        Papa.parse(arquivo, {
            header: true,
            skipEmptyLines: true,
            complete: (resultado) => {
                resolve(resultado.data);
            },
            error: (error) => {
                reject(error = new Error('Erro ao transformar CSV em JSON'));
            }
        });
    });
};

function toBase64(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => {
            const base64 = leitor.result.split(',')[1];
            resolve(base64);
        }
        leitor.onerror = () => reject(leitor.error);
        leitor.readAsDataURL(arquivo);
    });
};

// array de processos 
const processos = [];

// status dos processos
const statusLabel = {
    pendente: 'Pendente &#128260;',
    enviando: 'Enviando...',
    enviado: 'Enviado &#9989;',
    erro: 'Erro &#10060;',
};


function renderizarTabela() {
    const corpoTabela = document.getElementById('corpo_tabela');
    corpoTabela.innerHTML = '';
    processos.forEach((processo, index) => {
        const linha = document.createElement('tr');
        linha.classList.add(`status-${processo.status}`);
        linha.innerHTML = `
            <td>${index + 1}</td>
            <td>${processo.nome}</td>
            <td>${processo.email}</td>
            <td>${statusLabel[processo.status] || processo.status}</td>
        `;
        corpoTabela.appendChild(linha);
    });
};

let abortController = null;
let cancelado = false;

async function enviarEmails(arquivo) {

    abortController = new AbortController();
    cancelado = false;
    try {
        const arquivoValidado = await validarCabecalho(arquivo);
        const arquivoJson = await tranformarJSON(arquivoValidado);

        const assuntoEmail = document.getElementById('assunto_email').value;
        const corpoEmail = document.getElementById('mensagem_email').value;
        const anexoForm = document.getElementById('arquivo_formulario').files[0];

        const orgao = localStorage.getItem('orgao');
        if (!orgao) {
            throw new Error('Orgão não configurado.');
        }

        processos.length = 0;
        arquivoJson.forEach(item => {
            processos.push({
                nome: item.nome,
                email: item.email,
                status: 'pendente',
            });
        });
        renderizarTabela();

        const url = 'https://ext.api.email.seati.ma.gov.br/api/mensagens/enviar';
        for (let i = 0; i < processos.length; i++) {

            if (cancelado === true) {
                processos[i].status = 'cancelado';
                renderizarTabela();
                continue;
            }

            processos[i].status = 'enviando';
            renderizarTabela();

            const dadosEnvio = {
                nome: [processos[i].nome],
                destinatarios: [processos[i].email],
                assunto: `${orgao} - ${assuntoEmail}`,
                assuntoEmail,
                corpo: corpoEmail,
            };

            if (anexoForm) {
                const anexoBase64 = await toBase64(anexoForm);
                dadosEnvio.anexo = [
                    {
                        nome: anexoForm.name,
                        conteudo: anexoBase64,
                        tipo: anexoForm.type
                    }
                ];
            }

            try {
                const tokenAPI = localStorage.getItem('tokenAPI');
                if (!tokenAPI) {
                    throw new Error('Token API não configurado.');
                }

                const resposta = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${tokenAPI}`,
                    },
                    body: JSON.stringify(dadosEnvio),
                    signal: abortController.signal,
                });

                if (!resposta.ok) {
                    const erroBody = await resposta.text();
                    throw new Error(`Erro HTTP: ${resposta.status} - ${erroBody}`);
                }

                const respostaJson = await resposta.json();
                console.log('Resposta da API:', respostaJson);
                console.log('Dados enviados:', dadosEnvio);

                processos[i].status = 'enviado';
            } catch (erro) {
                if (erro.name === 'AbortError') {
                    processos[i].status = 'cancelado';
                    renderizarTabela();

                    for (let j = i + 1; j < processos.length; j++) {
                        processos[j].status = 'cancelado';
                    }
                    break;
                }
                mostrarModal(`Erro ao enviar para ${processos[i].email}:`, erro);
                processos[i].status = 'erro';
                break;
            }
            renderizarTabela();
        }

        const todosEnviados = processos.every(p => p.status === 'enviado');
        const algumCancelado = processos.some(p => p.status === 'cancelado');

        if (todosEnviados) {
            mostrarModal('Todos os e-mails foram enviados com sucesso!', 'sucesso');
        } else if (algumCancelado) {
            mostrarModal('Envio cancelado pelo usuário.', 'erro');
        } else {
            mostrarModal('Envio finalizado. Alguns e-mails falharam — verifique a tabela.', 'erro');
        }

    } catch (error) {
        console.log('Erro:', error);
        mostrarModal(error.message, 'erro');
    };
}

function baixarCSV() {
    if (processos.length === 0) {
        mostrarModal('Nenhum processo encontrado para gerar o relatório.', 'erro');
        return;
    }
    const csvContent = "data:text/csv;charset=utf-8,\n" +
        processos.map(p => `${p.nome},${p.email},${p.status}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'relatorio_envio.csv');
    link.click();
};

function cancelarEnvio() {
    if (abortController) {
        cancelado = true;
        abortController.abort();
    }
    processos.forEach(p => {
        if (p.status === 'enviando') {
            p.status = 'cancelado';

        }
    });
    renderizarTabela();
};