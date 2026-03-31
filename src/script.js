// elementos do DOM
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
            alert('Nenhum arquivo selecionado!');
            containerUpload.classList.remove('arquivo_carregado');
            return;
        }

        const arquivo = arquivoInput.files[0];
        const conteudoValidado = await validarCabecalho(arquivo);
        const nomeArquivo = arquivo.name;

        document.getElementById('nome_arquivo').innerHTML = nomeArquivo;

        const linhas = conteudoValidado.split('\n').slice(0, 6);
        document.getElementById('conteudo_arquivo').textContent = linhas.join('\n');

        // Atualizar visual do upload para estado "carregado"
        containerUpload.classList.add('arquivo_carregado');
        const iconEl = containerUpload.querySelector('.icon i');
        const headerEl = containerUpload.querySelector('header');
        if (iconEl) { iconEl.className = 'bi bi-check-circle-fill' };
        if (headerEl) { headerEl.textContent = `Arquivo "${nomeArquivo}" carregado!` };

    } catch (error) {
        alert(error.message);
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


// realizar o envio dos e-mails
botaoEnviar.addEventListener('click', async function () {
    try {
        const arquivo = arquivoInput.files[0];
        await enviarEmails(arquivo);
    } catch (error) {
        alert(error.message);
    }
});


// modal config
const configMenu = document.getElementById('config_menu');
const fecharModal = document.getElementById('fechar_modal');
const modalConfig = document.getElementById('modal_config');
const salvarConfigsBtn = document.getElementById('salvar_configs');
const sobreMenu = document.getElementById('sobre_menu');
const modalSobre = document.getElementById('modal_sobre');
const fecharModalSobre = document.getElementById('fechar_modal_sobre');


// MODAL CONFIGURAÇÕES
// abre a modal
configMenu.addEventListener('click', (e) => {
    e.preventDefault();
    subMenu.classList.remove('open');
    modalConfig.classList.add('mostrar');
});

// fecha a modal 
fecharModal.addEventListener('click', () => {
    modalConfig.classList.remove('mostrar');
});

modalConfig.addEventListener('click', (e) => {
    if (e.target === modalConfig) {
        modalConfig.classList.remove('mostrar');
    }
});

// salvar as configurações
salvarConfigsBtn.addEventListener('click', () => {
    //const tema = document.getElementById('seletor_tema').value;
    tokenAPI.value = tokenAPI.value.trim();
    if (tokenAPI.value) {
        localStorage.setItem('tokenAPI', tokenAPI.value);
    } else {
        alert('Token API é obrigatório para enviar os e-mails.');
        return;
    }
    modalConfig.classList.remove('mostrar');
    alert('Configurações salvas com sucesso!');
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