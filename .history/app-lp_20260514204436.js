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

