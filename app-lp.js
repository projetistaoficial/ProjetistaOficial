// Importações modulares do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// COLOQUE AQUI AS MESMAS CHAVES DO SEU app.js ATUAL
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

// Lógica do Formulário
document.getElementById('lead-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('btn-submit-lead');
    const originalText = btn.innerText;
    
    btn.innerText = "Enviando...";
    btn.disabled = true;
    
    const data = {
        nome: document.getElementById('lead-nome').value,
        whatsapp: document.getElementById('lead-wpp').value,
        nomeLoja: document.getElementById('lead-loja').value,
        dataCadastro: new Date().toISOString(),
        status: 'Novo' // Para você saber que ainda não atendeu esse cara
    };
    
    try {
        // Salva numa nova coleção "leads" no seu banco atual
        await addDoc(collection(db, "leads"), data);
        
        alert("Solicitação enviada com sucesso! Entraremos em contato em breve.");
        document.getElementById('lead-form').reset();
    } catch (error) {
        console.error("Erro ao enviar lead:", error);
        alert("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
});