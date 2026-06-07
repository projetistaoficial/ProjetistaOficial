// Importações do Firebase (Adicionado doc, setDoc e increment para o contador)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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

// =================================================================
// 📊 LÓGICA DO CONTADOR DE VISITAS ÚNICAS (LANDING PAGE)
// =================================================================
document.addEventListener("DOMContentLoaded", async () => {

    // Pega o tempo exato de agora
    const tempoAtual = new Date().getTime();

    // Procura no navegador (localStorage) quando foi a última visita
    const ultimaVisita = localStorage.getItem('ultima_visita_projetista');

    // Define o tempo de "férias" do contador (24 horas em milissegundos)
    // Se quiser que conte a cada 1 hora, mude o 24 para 1
    const tempoExpiracao = 1000 * 60 * 60 * 24;

    // Se a pessoa NUNCA visitou OU se já passou de 24h desde a última visita...
    if (!ultimaVisita || (tempoAtual - parseInt(ultimaVisita)) > tempoExpiracao) {
        try {
            // Aponta direto para o documento 'acessos_gerais'
            const statsRef = doc(db, 'estatisticas', 'acessos_gerais');

            // Soma 1 visita de forma segura
            await setDoc(statsRef, {
                total_visitas_lp: increment(1)
            }, { merge: true });

            // Salva o momento exato dessa nova visita na memória do navegador do cliente
            localStorage.setItem('ultima_visita_projetista', tempoAtual.toString());
            console.log("📊 Nova visita ÚNICA registrada com sucesso!");

        } catch (error) {
            console.error("Erro ao registrar visita no banco:", error);
        }
    } else {
        console.log("👁️ Visitante já contabilizado hoje. Retornando em cache.");
    }
});

// Abre e fecha o menu de demonstração
window.toggleDemoMenu = () => {
    const menu = document.getElementById('demo-menu');
    const arrow = document.getElementById('demo-arrow');

    // Verifica se está oculto
    const isClosed = menu.classList.contains('opacity-0');

    if (isClosed) {
        menu.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
        arrow.style.transform = 'rotate(180deg)';
    } else {
        menu.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        arrow.style.transform = 'rotate(0deg)';
    }
};

// Fecha o menu automaticamente se o usuário clicar fora dele
document.addEventListener('click', (e) => {
    const container = document.getElementById('demo-dropdown-container');
    if (container && !container.contains(e.target)) {
        const menu = document.getElementById('demo-menu');
        const arrow = document.getElementById('demo-arrow');

        if (menu && !menu.classList.contains('opacity-0')) {
            menu.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
            arrow.style.transform = 'rotate(0deg)';
        }
    }
});

// =================================================================
// 📝 LÓGICA DO FORMULÁRIO PRINCIPAL DE LEADS
// =================================================================

// Correção do erro Cannot read properties of null (reading 'addEventListener')
const formLead = document.getElementById('lead-form');

if (formLead) {
    formLead.addEventListener('submit', async (e) => {
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

            // CAPTURA O PLANO ESCOLHIDO DO INPUT INVISÍVEL
            const inputPlano = document.getElementById('input-plano-escolhido');
            const planoEscolhido = inputPlano ? inputPlano.value : "Nenhum plano selecionado";

            // Empacota todos os dados do HTML
            const data = {
                code: proximoCodigo,
                nome: document.getElementById('lead-nome').value.trim(),
                nomeLoja: document.getElementById('lead-loja').value.trim(),
                email: document.getElementById('lead-email').value.trim(),
                whatsapp: document.getElementById('lead-wpp').value.trim(),
                faturamento: document.getElementById('lead-faturamento').value,
                segmento: document.getElementById('lead-segmento').value,
                planoInteresse: planoEscolhido,
                dataCadastro: new Date().toISOString(),
                status: 'Novo'
            };

            // Envia para a coleção "leads"
            await addDoc(leadsRef, data);

            // Sucesso! Mostra a notificação
            mostrarToastSucesso();

            // Limpa os campos do formulário
            formLead.reset();

            // Limpa também o plano selecionado após enviar
            if (inputPlano) inputPlano.value = "Nenhum plano selecionado";

            // ESCONDE A CAIXINHA VISUAL DO PLANO
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
}

// Função para mostrar a notificação verde
function mostrarToastSucesso() {
    const toast = document.getElementById('toast-sucesso');
    if (toast) {
        toast.classList.remove('translate-x-[150%]', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');

        setTimeout(() => {
            fecharToast();
        }, 4000);
    }
}

// Função para fechar a notificação
function fecharToast() {
    const toast = document.getElementById('toast-sucesso');
    if (toast) {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-[150%]', 'opacity-0');
    }
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

    // Captura os dados
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

        const inputPlano = document.getElementById('input-plano-escolhido');
        const planoEscolhido = inputPlano ? inputPlano.value : "Nenhum plano selecionado";

        // Envia para o banco
        await addDoc(leadsRef, {
            code: proximoCodigo,
            nome: nome,
            nomeLoja: loja,
            email: email,
            whatsapp: wpp,
            faturamento: fat,
            segmento: segmento,
            planoInteresse: planoEscolhido,
            dataCadastro: new Date().toISOString(),
            status: 'Novo',
            origem: 'Widget Flutuante Premium'
        });

        // Efeito Mágico confirmando a ação
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
        if (wave) {
            wave.classList.remove('opacity-100');
            wave.classList.add('opacity-0');
        }
        if (nav) {
            nav.classList.remove('bg-transparent', 'py-4');
            nav.classList.add('bg-[#0B0E14]', 'py-2', 'shadow-md');
        }
    } else {
        if (wave) {
            wave.classList.remove('opacity-0');
            wave.classList.add('opacity-100');
        }
        if (nav) {
            nav.classList.remove('bg-[#0B0E14]', 'py-2', 'shadow-md');
            nav.classList.add('bg-transparent', 'py-4');
        }
    }
});