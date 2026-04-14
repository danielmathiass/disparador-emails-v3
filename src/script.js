const menuHamburguer = document.querySelector('.menu_hamburguer');
const arquivoInput = document.getElementById('input_arquivo');
const botaoEnviar = document.getElementById('botao_envio');
const areaDrop = document.getElementById('area_drop');
const containerUpload = document.querySelector('.container_upload');
const anexoInput = document.getElementById('arquivo_formulario');
const anexoLabel = document.getElementById('arquivo_input_label');
const menuToggle = document.getElementById('menu_icon');
const subMenu = document.getElementById('sub_menu');
const tokenAPI = document.getElementById('token_api');
const nav = document.querySelector('nav');

const modalFeedback = document.getElementById('dialog_feedback');
const modalMensagem = document.getElementById('dialog_mensagem');
const modalIconeI = document.getElementById('dialog_icone_i');
const modalFechar = document.getElementById('dialog_fechar');

const configMenu = document.getElementById('config_menu');
const fecharModal = document.getElementById('fechar_modal');
const modalConfig = document.getElementById('modal_config');
const salvarConfigsBtn = document.getElementById('salvar_configs');
const sobreMenu = document.getElementById('sobre_menu');
const modalSobre = document.getElementById('modal_sobre');
const fecharModalSobre = document.getElementById('fechar_modal_sobre');
const fecharApp = document.getElementById('sair_menu');
const dialogSair = document.getElementById('dialog_sair');
const botaoSairSim = document.getElementById('dialog_sair_sim');
const botaoSairNao = document.getElementById('dialog_sair_nao');


// função utilitária para exibir modal de feedback
function mostrarModal(mensagem, tipo = 'erro') {
    modalFeedback.classList.remove('dialog_sucesso', 'dialog_erro');
    if (tipo === 'sucesso') {
        modalFeedback.classList.add('dialog_sucesso');
        modalIconeI.className = 'bi bi-check-circle-fill';
    } else {
        modalFeedback.classList.add('dialog_erro');
        modalIconeI.className = 'bi bi-x-circle-fill';
    }
    modalMensagem.textContent = mensagem;
    modalFeedback.showModal();
}

modalFechar.addEventListener('click', () => {
    modalFeedback.close();
});

modalFeedback.addEventListener('click', (e) => {
    if (e.target === modalFeedback) {
        modalFeedback.close();
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});


menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    subMenu.classList.toggle('open');
});

document.addEventListener('click', () => {
    subMenu.classList.remove('open');
});

document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

if (containerUpload) {
    containerUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        containerUpload.classList.add('drag_over');
    });

    containerUpload.addEventListener('dragleave', (e) => {
        e.preventDefault();
        containerUpload.classList.remove('drag_over');
    });

    containerUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        containerUpload.classList.remove('drag_over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            arquivoInput.files = files;
            arquivoInput.dispatchEvent(new Event('change'));
        }
    });
}
// upload do arquivo csv 
arquivoInput.addEventListener('change', async function () {
    try {
        if (!arquivoInput.files || arquivoInput.files.length === 0) {
            mostrarModal('Nenhum arquivo selecionado!', 'erro');
            containerUpload.classList.remove('arquivo_carregado');
            return;
        }

        const arquivo = arquivoInput.files[0];
        const conteudoValidado = await validarCabecalho(arquivo);
        const nomeArquivo = arquivo.name;

        document.getElementById('nome_arquivo').innerHTML = nomeArquivo;

        const linhas = conteudoValidado.split('\n').slice(0, 10);
        document.getElementById('conteudo_arquivo').textContent = linhas.join('\n');

        // Atualizar visual do upload para estado "carregado"
        containerUpload.classList.add('arquivo_carregado');
        const iconEl = containerUpload.querySelector('.icon i');
        const headerEl = containerUpload.querySelector('header');
        if (iconEl) { iconEl.className = 'bi bi-check-circle-fill' };
        if (headerEl) { headerEl.textContent = `Arquivo "${nomeArquivo}" carregado!` };

    } catch (error) {
        mostrarModal(error.message, 'erro');
        containerUpload.classList.remove('arquivo_carregado');
    }
});
// efeito anexo do formulario
if (anexoInput && anexoLabel) {
    const anexoIcone = document.getElementById('anexo_icone');
    const anexoTexto = document.getElementById('anexo_texto');
    const anexoLabel = document.getElementById('label_input_arquivo');

    anexoInput.addEventListener('change', function () {
        if (anexoInput.files && anexoInput.files.length > 0) {
            const nomeAnexo = anexoInput.files[0].name;
            anexoLabel.classList.add('anexo_carregado');
            anexoIcone.className = 'bi bi-check-circle-fill';
            anexoTexto.textContent = nomeAnexo;
        } else {
            anexoLabel.classList.remove('anexo_carregado');
            anexoIcone.className = 'bi bi-paperclip';
            anexoTexto.textContent = 'Anexo (Opcional)';
        }
    });
}

botaoEnviar.addEventListener('click', async function () {
    const arquivo = arquivoInput.files[0];
    const assunto = document.getElementById('assunto_email').value.trim();
    const corpo = document.getElementById('mensagem_email').value.trim();

    if (!arquivo) {
        mostrarModal('Anexe um arquivo CSV antes de enviar.', 'erro');
        return;
    }
    if (!assunto) {
        mostrarModal('Preencha o assunto do e-mail.', 'erro');
        return;
    }
    if (!corpo) {
        mostrarModal('Preencha o corpo do e-mail.', 'erro');
        return;
    }

    try {
        await enviarEmails(arquivo);
    } catch (error) {
        mostrarModal(error.message, 'erro');
    }
});


// MODAL CONFIGURAÇÕES
configMenu.addEventListener('click', (e) => {
    e.preventDefault();
    subMenu.classList.remove('open');
    modalConfig.classList.add('mostrar');
});

fecharModal.addEventListener('click', () => {
    modalConfig.classList.remove('mostrar');
});

modalConfig.addEventListener('click', (e) => {
    if (e.target === modalConfig) {
        modalConfig.classList.remove('mostrar');
    }
});

salvarConfigsBtn.addEventListener('click', () => {
    tokenAPI.value = tokenAPI.value.trim();
    orgao.value = orgao.value.trim();
    if (orgao.value) {
        localStorage.setItem('orgao', orgao.value);
    } else {
        mostrarModal('Orgão é obrigatório para enviar os e-mails.', 'erro');
        return;
    }
    if (tokenAPI.value) {
        localStorage.setItem('tokenAPI', tokenAPI.value);
    } else {
        mostrarModal('Token API é obrigatório para enviar os e-mails.', 'erro');
        return;
    }
    modalConfig.classList.remove('mostrar');
    mostrarModal('Configurações salvas com sucesso!', 'sucesso');
});

configMenu.addEventListener('click', () => {
    const tokenSalvo = localStorage.getItem('tokenAPI');
    if (tokenSalvo) {
        tokenAPI.value = tokenSalvo;
    }
    modalConfig.classList.add('mostrar');
});

// MODAL SOBRE
sobreMenu.addEventListener('click', (e) => {
    e.preventDefault();
    subMenu.classList.remove('open');
    modalSobre.classList.add('mostrar');
});

fecharModalSobre.addEventListener('click', () => {
    modalSobre.classList.remove('mostrar');
});

modalSobre.addEventListener('click', (e) => {
    if (e.target === modalSobre) {
        modalSobre.classList.remove('mostrar');
    }
});

fecharApp.addEventListener('click', (e) => {
    e.preventDefault();
    dialogSair.showModal();
});

botaoSairSim.addEventListener('click', () => {
    window.electronAPI.fecharApp();
});

botaoSairNao.addEventListener('click', () => {
    dialogSair.close();
});

dialogSair.addEventListener('click', (e) => {
    if (e.target === dialogSair) {
        dialogSair.close();
    }
});