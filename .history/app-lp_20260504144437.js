// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// COLOQUE SUAS CHAVES DO FIREBASE AQUI
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_DOMINIO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_BUCKET.appspot.com",
    messagingSenderId: "SEU_SENDER",
    appId: "SEU_APP_ID"
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
        
        // Sucesso!
        alert("Solicitação enviada com sucesso! Em breve entraremos em contato.");
        document.getElementById('lead-form').reset();
        
    } catch (error) {
        console.error("Erro ao enviar lead:", error);
        alert("Ocorreu um erro ao enviar. Tente novamente mais tarde.");
    } finally {
        // Volta o botão ao normal
        btn.innerText = originalText;
        btn.disabled = false;
    }
});