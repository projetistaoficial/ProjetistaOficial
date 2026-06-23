// Importações do Firebase
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

let cicloAtual = 'mensal'; 
let planosCarregados = []; 

// =================================================================
// 📊 LÓGICA DO CONTADOR DE VISITAS ÚNICAS
// =================================================================
document.addEventListener("DOMContentLoaded", async () => {
    carregarPlanosDoBanco();

    const tempoAtual = new Date().getTime();
    const ultimaVisita = localStorage.getItem('ultima_visita_projetista');
    const tempoExpiracao = 1000 * 60 * 60 * 24;

    if (!ultimaVisita || (tempoAtual - parseInt(ultimaVisita)) > tempoExpiracao) {
        try {
            const statsRef = doc(db, 'estatisticas', 'acessos_gerais');
            await setDoc(statsRef, { total_visitas_lp: increment(1) }, { merge: true });
            localStorage.setItem('ultima_visita_projetista', tempoAtual.toString());
        } catch (error) {
            console.error("Erro ao registrar visita:", error);
        }
    }
});

// =================================================================
// 👑 INTEGRAÇÃO DE PLANOS DINÂMICOS (SAAS)
// =================================================================

async function carregarPlanosDoBanco() {
    const container = document.getElementById('view-planos-padrao');
    try {
        // ✨ NOVO: Puxa a lista oficial de Tópicos/Funcionalidades primeiro
        const topicsDoc = await getDoc(doc(db, "plans", "TOPICS_LIST"));
        if(topicsDoc.exists()) {
            window.globalTopics = topicsDoc.data().items || [];
        } else {
            window.globalTopics = [];
        }

        const snap = await getDocs(collection(db, "plans"));
        planosCarregados = [];
        
        snap.forEach(documento => {
            // Ignora o documento de Tópicos
            if(documento.id !== "TOPICS_LIST") {
                planosCarregados.push({ id: documento.id, ...documento.data() });
            }
        });

        planosCarregados.sort((a, b) => (parseInt(a.ordem) || 0) - (parseInt(b.ordem) || 0));

        renderizarCardsPlanos();
    } catch (error) {
        console.error("Erro ao carregar planos:", error);
        if (container) {
            container.innerHTML = '<div class="w-full col-span-3 text-center py-10 text-red-500 font-bold">Erro ao carregar os planos.</div>';
            container.style.opacity = '1';
        }
    }
}

function renderizarCardsPlanos() {
    const container = document.getElementById('view-planos-padrao');
    if (!container) return;

    if (planosCarregados.length === 0) return;

    const baseFeatures = [
        { id: 'f_24h', label: '24 horas online' },
        { id: 'f_zap', label: 'Pedidos direto no WhatsApp' },
        { id: 'f_painel', label: 'Painel administrativo' },
        { id: 'f_gestaop', label: 'Gestão em tempo real de pedidos' },
        { id: 'f_gestaoc', label: 'Gestão de categorias e cupons' },
        { id: 'f_rellucro', label: 'Relatório de Lucro de cada pedido' },
        { id: 'f_estatisticas', label: 'Estatísticas financeiras' },
        { id: 'f_personalizacao', label: 'Personalização de temas e cores' },
        { id: 'f_frete', label: 'Frete Integrado' },
        { id: 'f_relprodutos', label: 'Relatório de produtos' },
        { id: 'f_relfinanceiro', label: 'Relatório Financeiro' },
        { id: 'f_pdf', label: 'PDF: Arte + QR Code da loja' },
        { id: 'f_impressao', label: 'Impressão de pedidos' },
        { id: 'f_divulgacao', label: 'Divulgação nas Nossas Redes Sociais', star: true }
    ];

    let htmlCards = '';

    planosCarregados.forEach((plano, index) => {
        let borderColor = 'border-gray-800 hover:border-pink-500/50';
        let btnColor = 'border-gray-700 hover:border-pink-500 hover:text-pink-400';
        let iconColor = 'text-pink-500';
        let titleColor = 'group-hover:text-pink-400 text-white';
        let bgStyle = 'bg-[#0f111a]';
        
        const isDestaque = index === 1; 

        if (isDestaque) {
            borderColor = 'border-fuchsia-500 shadow-[0_15px_50px_rgba(217,70,239,0.2)] md:-translate-y-6 z-10';
            bgStyle = 'bg-gradient-to-b from-[#161821] to-[#0a0b10]';
            btnColor = 'bg-gradient-to-r from-fuchsia-500 to-blue-600 text-white hover:scale-[1.02] border-0';
            titleColor = 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400';
            iconColor = 'text-fuchsia-500';
        } else if (index > 1) {
            borderColor = 'border-gray-800 hover:border-blue-500/50';
            btnColor = 'border-gray-700 hover:border-blue-500 hover:text-blue-400';
            iconColor = 'text-lime-400';
            titleColor = 'group-hover:text-blue-400 text-white';
        }

        const destaqueHtml = isDestaque ? `
            <div class="absolute -top-4 md:-top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white px-6 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                Mais Escolhido
            </div>
        ` : '';

        // Limites Topo
        const limProd = plano.limits?.prod ? `Até <strong>${plano.limits.prod} Produtos</strong>` : `Produtos <strong>Ilimitados</strong>`;
        const limFotos = plano.limits?.fotos ? `Até <strong>${plano.limits.fotos} Fotos</strong> por produto` : `Fotos <strong>Ilimitadas</strong>`;
        const limCat = plano.limits?.cat ? `Até <strong>${plano.limits.cat} Categorias</strong>` : `Categorias <strong>Ilimitadas</strong>`;

        let listHtml = `
            <li class="flex items-start gap-3"><i class="fas fa-check-circle ${iconColor} mt-0.5 text-base"></i> <span class="text-white">${limProd}</span></li>
            <li class="flex items-start gap-3"><i class="fas fa-check-circle ${iconColor} mt-0.5 text-base"></i> <span class="text-white">${limFotos}</span></li>
            <li class="flex items-start gap-3"><i class="fas fa-check-circle ${iconColor} mt-0.5 text-base"></i> <span class="text-white">${limCat}</span></li>
        `;

        // Checkboxes Funcionalidades
        const pFeat = plano.features || {};

        baseFeatures.forEach(f => {
            const hasAccess = pFeat[f.id] === true;

            if (hasAccess) {
                const ic = f.star ? 'fa-star text-yellow-400' : `fa-check-circle ${iconColor}`;
                const style = f.star ? 'text-yellow-400 font-bold' : 'text-gray-300';
                listHtml += `<li class="flex items-start gap-3"><i class="fas ${ic} mt-0.5 text-base"></i> <span class="${style}">${f.label}</span></li>`;
            } else {
                // Item sem acesso = Transparente e Riscado
                listHtml += `<li class="flex items-start gap-3 opacity-50"><i class="fas fa-times text-red-500 mt-0.5 text-base"></i> <span class="line-through text-gray-500">${f.label}</span></li>`;
            }
        });

        htmlCards += `
        <div class="w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center ${bgStyle} border-2 ${borderColor} rounded-[2.5rem] p-6 lg:p-10 xl:p-12 transition-all duration-300 shadow-lg group relative flex flex-col justify-between">
            ${destaqueHtml}
            <div>
                <h3 class="text-xl md:text-2xl font-bold mb-2 ${titleColor} transition-colors flex items-center gap-2 font-['Nunito']">
                    ${plano.icone ? `<i class="fas ${plano.icone} text-lg"></i>` : ''} 
                    Plano ${plano.nome}
                </h3>
                
                <div class="mb-6 border-b border-gray-800 pb-6 mt-6">
                    <span class="text-3xl lg:text-4xl font-black text-white font-['Nunito']">R$ <span class="plano-price" data-id="${plano.id}">...</span></span>
                    <span class="plano-period-text text-gray-500 text-sm font-bold"> /mês</span>
                    <p class="plano-sub-text text-[11px] ${isDestaque ? 'text-fuchsia-400' : 'text-gray-400'} mt-2 font-bold h-4">Carregando...</p>
                </div>

                <ul class="space-y-4 mb-8 text-[13px] md:text-sm font-['Nunito'] font-medium">
                    <div class="flex flex-col gap-3">
                        ${listHtml}
                    </div>
                </ul>
            </div>
            <button type="button" onclick="selectPlan('${plano.nome}')" class="w-full py-4 rounded-full border-2 ${btnColor} font-bold transition-all mt-auto text-base uppercase font-['Nunito'] tracking-wider">Escolher Plano</button>
        </div>
        `;
    });

    container.innerHTML = htmlCards;
    atualizarPrecosNaTela();
    setTimeout(() => { container.style.opacity = '1'; }, 100);
}

function atualizarPrecosNaTela() {
    planosCarregados.forEach(plano => {
        const elPrice = document.querySelector(`.plano-price[data-id="${plano.id}"]`);
        if (!elPrice) return;
        
        const elPeriod = elPrice.parentElement.nextElementSibling;
        const elSub = elPeriod.nextElementSibling;

        let valor = "0,00";
        let periodText = " /mês";
        let subText = "Cobrado mensalmente";

        if (cicloAtual === 'mensal') {
            valor = plano.mensal;
            periodText = " /mês";
            subText = "Cobrado mensalmente";
        } else if (cicloAtual === 'semestral') {
            valor = plano.semestral;
            periodText = " /semestre";
            subText = `Pagamento semestral (${plano.descSemestral || 10}% OFF)`;
        } else if (cicloAtual === 'anual') {
            valor = plano.anual;
            periodText = " /ano";
            subText = `Pagamento anual (${plano.descAnual || 20}% OFF)`;
        }

        elPrice.innerText = valor;
        if (elPeriod) elPeriod.innerText = periodText;
        if (elSub) elSub.innerText = subText;

        [elPrice, elPeriod, elSub].forEach(el => {
            if (el) {
                el.style.transition = 'opacity 0.3s ease-in-out';
                el.style.opacity = '1';
            }
        });
    });
}

window.changeBillingCycle = (cycle) => {
    cicloAtual = cycle.toLowerCase();

    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-fuchsia-500', 'to-pink-500', 'text-white', 'shadow-md');
        btn.classList.add('bg-transparent', 'text-gray-400');
    });

    const activeBtn = document.getElementById(`btn-${cicloAtual}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-transparent', 'text-gray-400');
        activeBtn.classList.add('bg-gradient-to-r', 'from-fuchsia-500', 'to-pink-500', 'text-white', 'shadow-md');
    }

    document.querySelectorAll('.plano-price, .plano-period-text, .plano-sub-text').forEach(el => el.style.opacity = '0');
    setTimeout(() => { atualizarPrecosNaTela(); }, 200);
};

window.selectPlan = (planName) => {
    const cicloCapitalized = cicloAtual.charAt(0).toUpperCase() + cicloAtual.slice(1);
    const planoCompleto = `${planName} (${cicloCapitalized})`;

    const inputPlano = document.getElementById('input-plano-escolhido');
    if (inputPlano) inputPlano.value = planoCompleto;

    const badgeContainer = document.getElementById('badge-plano-container');
    const badgeTexto = document.getElementById('texto-plano-badge');

    if (badgeContainer && badgeTexto) {
        badgeTexto.innerText = planoCompleto;
        badgeContainer.classList.remove('hidden');

        const badgeInner = badgeContainer.querySelector('div');
        badgeInner.classList.add('animate-bounce');
        setTimeout(() => { badgeInner.classList.remove('animate-bounce'); }, 1500);
    }

    if (typeof showToast === 'function') {
        showToast(`Plano ${planoCompleto} selecionado! Preencha seus dados para continuar.`);
    }

    const formSection = document.getElementById('formulario');
    if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        formSection.classList.add('scale-[1.02]');
        setTimeout(() => formSection.classList.remove('scale-[1.02]'), 300);
    }
};

window.discardPlan = () => {
    const badgeContainer = document.getElementById('badge-plano-container');
    if (badgeContainer) badgeContainer.classList.add('hidden');

    const inputPlano = document.getElementById('input-plano-escolhido');
    if (inputPlano) inputPlano.value = "Nenhum plano selecionado";

    if (typeof showToast === 'function') {
        showToast("Plano removido! Mas você ainda pode fazer seu teste gratuito.", "success");
    }
};

window.switchPlanView = (showCustomPlan) => {
    const viewPadrao = document.getElementById('view-planos-padrao');
    const viewCustom = document.getElementById('view-plano-personalizado');
    const indicadorMobile = document.getElementById('indicador-carrossel-mobile');

    if (showCustomPlan) {
        if(viewPadrao) viewPadrao.style.opacity = '0';
        if (indicadorMobile) indicadorMobile.classList.add('hidden');

        setTimeout(() => {
            if(viewPadrao) {
                viewPadrao.classList.add('hidden');
                viewPadrao.classList.remove('flex', 'md:grid');
            }
            if(viewCustom) {
                viewCustom.classList.remove('hidden');
                viewCustom.classList.add('flex');
                setTimeout(() => { viewCustom.style.opacity = '1'; }, 50);
            }
        }, 300);
    } else {
        if(viewCustom) viewCustom.style.opacity = '0';

        setTimeout(() => {
            if(viewCustom) {
                viewCustom.classList.add('hidden');
                viewCustom.classList.remove('flex');
            }
            if(viewPadrao) {
                viewPadrao.classList.remove('hidden');
                viewPadrao.classList.add('flex', 'md:grid');
                setTimeout(() => { viewPadrao.style.opacity = '1'; }, 50);
                viewPadrao.scrollLeft = 0;
            }
            if (indicadorMobile) indicadorMobile.classList.remove('hidden');
        }, 300);
    }
};

// =================================================================
// 💬 EVENTOS DE INTERFACE E FORMULÁRIO (LANDING PAGE)
// =================================================================

window.toggleDemoMenu = () => {
    const menu = document.getElementById('demo-menu');
    const arrow = document.getElementById('demo-arrow');
    if (!menu || !arrow) return;
    
    const isClosed = menu.classList.contains('opacity-0');
    if (isClosed) {
        menu.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
        arrow.style.transform = 'rotate(180deg)';
    } else {
        menu.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
        arrow.style.transform = 'rotate(0deg)';
    }
};

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

            const inputPlano = document.getElementById('input-plano-escolhido');
            const planoEscolhido = inputPlano ? inputPlano.value : "Nenhum plano selecionado";

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

            await addDoc(leadsRef, data);
            mostrarToastSucesso();
            formLead.reset();

            if (inputPlano) inputPlano.value = "Nenhum plano selecionado";
            const badgeContainer = document.getElementById('badge-plano-container');
            if (badgeContainer) badgeContainer.classList.add('hidden');

        } catch (error) {
            console.error("Erro ao enviar lead:", error);
            alert("Ocorreu um erro ao enviar. Tente novamente mais tarde.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}

window.mostrarToastSucesso = () => {
    const toast = document.getElementById('toast-sucesso');
    if (toast) {
        toast.classList.remove('translate-x-[150%]', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
        setTimeout(() => { fecharToast(); }, 4000);
    }
}

window.fecharToast = () => {
    const toast = document.getElementById('toast-sucesso');
    if (toast) {
        toast.classList.remove('translate-x-0', 'opacity-100');
        toast.classList.add('translate-x-[150%]', 'opacity-0');
    }
}

window.toggleZapChat = () => {
    const widget = document.getElementById('zap-chat-widget');
    if (!widget) return;
    
    if (widget.classList.contains('scale-0')) {
        widget.classList.remove('hidden');
        setTimeout(() => {
            widget.classList.remove('scale-0', 'opacity-0');
            widget.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        widget.classList.remove('scale-100', 'opacity-100');
        widget.classList.add('scale-0', 'opacity-0');
        setTimeout(() => { widget.classList.add('hidden'); }, 300);
    }
};

window.enviarLeadZap = async (e) => {
    e.preventDefault();

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