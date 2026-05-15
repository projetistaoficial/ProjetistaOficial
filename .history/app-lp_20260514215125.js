// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// COLOQUE SUAS CHAVES DO FIREBASE AQUI
const firebaseConfig = {
    apiKey: "AIzaSyD_pZ7lWPQA1OniOJrjTinG2HN5UhjMzbI",
    authDomain: "vestemanto-app.firebaseapp.com",
    projectId: "vestemanto-app",
    storageBucket: "vestemanto-app.appspot.com",
    messagingSenderId: "340174016008",
    appId: "1:340174016008:web:301a01750404af8b5a8bbd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Escuta o envio do formulário
document.getElementById('lead-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btn-submit-lead');
    const originalText = btn.innerText;

    btn.innerText = "Enviando Dados...";
    btn.disabled = true;

    // Empacota todos os dados do HTML
    const data = {
        nome: document.getElementById('lead-nome').value.trim(),
        nomeLoja: document.getElementById('lead-loja').value.trim(),
        email: document.getElementById('lead-email').value.trim(),
        whatsapp: document.getElementById('lead-wpp').value.trim(),
        faturamento: document.getElementById('lead-faturamento').value,
        segmento: document.getElementById('lead-segmento').value,
        dataCadastro: new Date().toISOString(),
        status: 'Novo' // Avisa ao Painel Master que é um lead fresco
    };

    try {
        // Envia para a coleção "leads"
        await addDoc(collection(db, "leads"), data);

        // Sucesso! Aqui entra a nossa notificação verde premium no lugar do alert()
        mostrarToastSucesso();

        // Limpa os campos do formulário
        document.getElementById('lead-form').reset();

    } catch (error) {
        console.error("Erro ao enviar lead:", error);
        // Mantivemos o alert de erro por enquanto, pois é uma exceção crítica
        alert("Ocorreu um erro ao enviar. Tente novamente mais tarde.");
    } finally {
        // Volta o botão ao normal
        btn.innerText = originalText;
        btn.disabled = false;
    }
});

// Função para mostrar a notificação verde
function mostrarToastSucesso() {
    const toast = document.getElementById('toast-sucesso');

    // Remove as classes que escondem (joga pra fora da tela) e adiciona as que mostram
    toast.classList.remove('translate-x-[150%]', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');

    // Programa para fechar automaticamente após 4 segundos (4000 milissegundos)
    setTimeout(() => {
        fecharToast();
    }, 4000);
}

// Função para fechar a notificação
function fecharToast() {
    const toast = document.getElementById('toast-sucesso');
    toast.classList.remove('translate-x-0', 'opacity-100');
    toast.classList.add('translate-x-[150%]', 'opacity-0');
}

// =================================================================
// 💬 LÓGICA DO WIDGET VIP
// =================================================================

window.toggleZapChat = () => {
    const widget = document.getElementById('zap-chat-widget');

    if (widget.classList.contains('scale-0')) {
        widget.classList.remove('hidden');
        setTimeout(() => {
            widget.classList.remove('scale-0', 'opacity-0');
            widget.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        widget.classList.remove('scale-100', 'opacity-100');
        widget.classList.add('scale-0', 'opacity-0');
        setTimeout(() => {
            widget.classList.add('hidden');
        }, 300);
    }
};

window.enviarLeadZap = async (e) => {
    e.preventDefault();

    // Captura os dados (incluindo os novos campos do formulário)
    const nome = document.getElementById('zap-nome').value.trim();
    const loja = document.getElementById('zap-loja').value.trim();
    const email = document.getElementById('zap-email').value.trim();
    const wpp = document.getElementById('zap-wpp').value.trim();
    const fat = document.getElementById('zap-faturamento').value;
    const segmento = document.getElementById('zap-segmento').value;

    const btn = e.target.querySelector('button');
    const originalBtnText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Liberando Acesso...';
    btn.disabled = true;

    try {
        // Envia para o banco de dados
        await addDoc(collection(db, 'leads'), {
            nome: nome,
            nomeLoja: loja,
            email: email,
            whatsapp: wpp,
            faturamento: fat,
            segmento: segmento,
            dataCadastro: new Date().toISOString(),
            status: 'Novo',
            origem: 'Widget Flutuante Premium'
        });

        // ✨ Efeito Mágico: Transforma o form em balões de chat confirmando a ação!
        const formContainer = document.getElementById('zap-form-container');
        formContainer.innerHTML = `
            <div class="bg-brand-blue/20 border border-brand-blue/30 p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] self-end relative ml-auto mb-3 animate-fade-in text-white">
                <p class="text-sm">Tudo preenchido! Aguardo a liberação da loja <b>${loja}</b>.</p>
                <div class="flex items-center justify-end gap-1 mt-1">
                    <span class="text-[9px] text-gray-400">Agora mesmo</span>
                    <i class="fas fa-check-double text-blue-400 text-[10px]"></i>
                </div>
            </div>
            
            <div class="bg-[#1e2029] border border-gray-800 p-3 rounded-xl rounded-tl-none shadow-md max-w-[85%] self-start relative mt-2 animate-fade-in" style="animation-delay: 0.5s; animation-fill-mode: both;">
                <p class="text-sm text-gray-300 leading-relaxed">Perfeito, ${nome}! Solicitação recebida com sucesso. 🎉</p>
                <p class="text-sm text-gray-300 leading-relaxed mt-2">Um dos nossos especialistas vai te chamar no número <b>${wpp}</b> em instantes para configurar seu teste. Seja muito bem-vindo(a)!</p>
                <span class="text-[9px] text-gray-500 block text-right mt-1 font-bold">Assistente Projetista</span>
            </div>
        `;

    } catch (err) {
        console.error(err);
        alert('Ops, ocorreu um erro ao enviar. Tente novamente!');
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }
};

document.addEventListener('click', function (event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');

    // Verifica se o menu existe e se está aberto (não tem a classe 'hidden')
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        // Se o clique NÃO foi dentro do menu E NÃO foi no botão de abrir/fechar
        if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            mobileMenu.classList.add('hidden'); // Esconde o menu
        }
    }
}); 

window.addEventListener('scroll', function() {
        const wave = document.getElementById('header-wave');
        const nav = document.getElementById('main-nav');
        
        // Posição atual do scroll
        let scrollPosition = window.scrollY;

        // Se o usuário rolou mais de 50 pixels para baixo
        if (scrollPosition > 50) {
            // Esconde a onda
            wave.classList.remove('opacity-100');
            wave.classList.add('opacity-0');
            
            // Muda o fundo do menu de transparente para escuro (para os textos continuarem legíveis)
            nav.classList.remove('bg-transparent', 'py-4');
            nav.classList.add('bg-[#0B0E14]', 'py-2', 'shadow-md');
        } else {
            // Se voltou para o topo (scroll < 50)
            
            // Mostra a onda novamente
            wave.classList.remove('opacity-0');
            wave.classList.add('opacity-100');
            
            // Volta o menu para o estado original transparente
            nav.classList.remove('bg-[#0B0E14]', 'py-2', 'shadow-md');
            nav.classList.add('bg-transparent', 'py-4');
        }
    });