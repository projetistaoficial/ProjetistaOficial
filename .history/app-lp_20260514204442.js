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
// 💬 LÓGICA DO WIDGET WHATSAPP (BOT)
// =================================================================

window.toggleZapChat = () => {
    const widget = document.getElementById('zap-chat-widget');
    
    if (widget.classList.contains('scale-0')) {
        // ABRIR
        widget.classList.remove('hidden');
        // Usamos um setTimeout minúsculo para garantir que o CSS aplique a transição
        setTimeout(() => {
            widget.classList.remove('scale-0', 'opacity-0');
            widget.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        // FECHAR
        widget.classList.remove('scale-100', 'opacity-100');
        widget.classList.add('scale-0', 'opacity-0');
        // Aguarda a animação terminar antes de dar display: none
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
    const wpp = document.getElementById('zap-wpp').value.trim();
    const fat = document.getElementById('zap-faturamento').value;
    
    const btn = e.target.querySelector('button');
    const originalBtnText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enviando...';
    btn.disabled = true;
    
    try {
        // 🔥 Importante: Garanta que você tem o import do 'addDoc' e 'collection' 
        // e a variável 'db' configurada nesse arquivo!
        await addDoc(collection(db, 'leads'), {
            nome: nome,
            nomeLoja: loja,
            whatsapp: wpp,
            faturamento: fat,
            dataCadastro: new Date().toISOString(),
            status: 'Novo',
            origem: 'Widget Flutuante WhatsApp' // Pra você saber de onde veio
        });
        
        // 🌟 Efeito Mágico: Transforma o form em um balão verde de mensagem enviada!
        const formContainer = document.getElementById('zap-form-container');
        formContainer.innerHTML = `
            <div class="bg-[#dcf8c6] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] self-end relative ml-auto mb-3 animate-fade-in">
                <p class="text-sm text-gray-800">Pronto! Meus dados são: ${nome}, da loja ${loja}.</p>
                <div class="flex items-center justify-end gap-1 mt-1">
                    <span class="text-[9px] text-gray-500">Agora mesmo</span>
                    <i class="fas fa-check-double text-blue-500 text-[10px]"></i>
                </div>
            </div>
            
            <div class="bg-white p-3 rounded-xl rounded-tl-none shadow-sm max-w-[85%] self-start relative mt-2 animate-fade-in" style="animation-delay: 0.5s; animation-fill-mode: both;">
                <p class="text-sm text-gray-800 leading-relaxed">Perfeito, ${nome}! Recebemos tudo aqui.</p>
                <p class="text-sm text-gray-800 leading-relaxed mt-1">Um especialista vai te chamar no número <b>${wpp}</b> em alguns minutos. Até já! 🚀</p>
            </div>
        `;
        
    } catch(err) {
        console.error(err);
        alert('Ops, ocorreu um erro ao enviar. Tente novamente!');
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
    }
};