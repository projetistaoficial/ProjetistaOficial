// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

//MONITORAMENTO DE ACESSOAS A LANDIG PAGE, EXIBIDO NO PAINEL MASTER
document.addEventListener("DOMContentLoaded", async () => {
    // Verifica se o usuário já contou como visita nesta sessão
    if (!sessionStorage.getItem('visitou_projetista_lp')) {
        try {
            const db = firebase.firestore();
            // Cria ou atualiza um documento chamado 'acessos_gerais' na coleção 'estatisticas'
            const statsRef = db.collection('estatisticas').doc('acessos_gerais');

            // O .increment(1) é mágico: ele soma 1 no banco de dados de forma 100% segura, 
            // mesmo se 100 pessoas entrarem no site no mesmo exato milissegundo.
            await statsRef.set({
                total_visitas_lp: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });

            // Marca que já visitou para não contar de novo se der F5
            sessionStorage.setItem('visitou_projetista_lp', 'true');
            console.log("📊 Nova visita registrada com sucesso!");

        } catch (error) {
            console.error("Erro ao registrar visita:", error);
        }
    }
});

// Escuta o envio do formulário PRINCIPAL
document.getElementById('lead-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btn-submit-lead');
    const originalText = btn.innerText;

    btn.innerText = "Enviando Dados...";
    btn.disabled = true;

    try {
        const leadsRef = collection(db, "leads");
        const q = query(leadsRef, orderBy('code', 'desc'), limit(1));
        const snap = await getDocs(q);

        let proximoCodigo = 1;
        if (!snap.empty) {
            const ultimoLead = snap.docs[0].data();
            if (ultimoLead.code) {
                proximoCodigo = ultimoLead.code + 1;
            }
        }

        // ✨ CAPTURA O PLANO ESCOLHIDO DO INPUT INVISÍVEL
        const inputPlano = document.getElementById('input-plano-escolhido');
        const planoEscolhido = inputPlano ? inputPlano.value : "Nenhum plano selecionado";

        // Empacota todos os dados do HTML (Agora com o código e o PLANO)
        const data = {
            code: proximoCodigo,
            nome: document.getElementById('lead-nome').value.trim(),
            nomeLoja: document.getElementById('lead-loja').value.trim(),
            email: document.getElementById('lead-email').value.trim(),
            whatsapp: document.getElementById('lead-wpp').value.trim(),
            faturamento: document.getElementById('lead-faturamento').value,
            segmento: document.getElementById('lead-segmento').value,
            planoInteresse: planoEscolhido, // ✨ O PLANO É ENVIADO AQUI
            dataCadastro: new Date().toISOString(),
            status: 'Novo'
        };

        // Envia para a coleção "leads"
        await addDoc(leadsRef, data);

        // Sucesso! Aqui entra a nossa notificação verde premium no lugar do alert()
        mostrarToastSucesso();

        // Limpa os campos do formulário
        document.getElementById('lead-form').reset();

        // ✨ Limpa também o plano selecionado após enviar
        if (inputPlano) inputPlano.value = "Nenhum plano selecionado";

        // ✨ ESCONDE A CAIXINHA VISUAL DO PLANO
        const badgeContainer = document.getElementById('badge-plano-container');
        if (badgeContainer) {
            badgeContainer.classList.add('hidden');
        }

    } catch (error) {
        console.error("Erro ao enviar lead:", error);
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
        const leadsRef = collection(db, 'leads');
        const q = query(leadsRef, orderBy('code', 'desc'), limit(1));
        const snap = await getDocs(q);

        let proximoCodigo = 1;
        if (!snap.empty) {
            const ultimoLead = snap.docs[0].data();
            if (ultimoLead.code) {
                proximoCodigo = ultimoLead.code + 1;
            }
        }

        // ✨ CAPTURA O PLANO ESCOLHIDO (Caso ele tenha clicado antes de abrir o Zap)
        const inputPlano = document.getElementById('input-plano-escolhido');
        const planoEscolhido = inputPlano ? inputPlano.value : "Nenhum plano selecionado";

        // Envia para o banco de dados
        await addDoc(leadsRef, {
            code: proximoCodigo,
            nome: nome,
            nomeLoja: loja,
            email: email,
            whatsapp: wpp,
            faturamento: fat,
            segmento: segmento,
            planoInteresse: planoEscolhido, // ✨ O PLANO É ENVIADO AQUI TAMBÉM
            dataCadastro: new Date().toISOString(),
            status: 'Novo',
            origem: 'Widget Flutuante Premium'
        });

        // Efeito Mágico: Transforma o form em balões de chat confirmando a ação!
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

        if (inputPlano) inputPlano.value = "Nenhum plano selecionado";

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

    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            mobileMenu.classList.add('hidden');
        }
    }
});

window.addEventListener('scroll', function () {
    const wave = document.getElementById('header-wave');
    const nav = document.getElementById('main-nav');

    let scrollPosition = window.scrollY;

    if (scrollPosition > 50) {
        wave.classList.remove('opacity-100');
        wave.classList.add('opacity-0');

        nav.classList.remove('bg-transparent', 'py-4');
        nav.classList.add('bg-[#0B0E14]', 'py-2', 'shadow-md');
    } else {
        wave.classList.remove('opacity-0');
        wave.classList.add('opacity-100');

        nav.classList.remove('bg-[#0B0E14]', 'py-2', 'shadow-md');
        nav.classList.add('bg-transparent', 'py-4');
    }
});