// [Rimuovi il codice JavaScript precedente e usa questo, sostituendo solo API_URL]
const API_URL = 'https://script.google.com/macros/s/AKfycbyqO9_mH9mygPxEjcpfPVKAFcjMMKZLtBf9RF1T2Jgiw4IC_McJEKFMU_QXZdOWiiOx6w/exec'; 

// Seleziona il form e il div per i messaggi (adatta gli ID se necessario)
const iscrizioneForm = document.getElementById('iscrizioneForm');
const messageDiv = document.getElementById('message');

if (iscrizioneForm) {
    iscrizioneForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    messageDiv.innerHTML = ''; 

    const form = event.target;
    const formData = new FormData(form);
    const datiForm = {};
    formData.forEach((value, key) => {
        if (key === 'consenso_legale' || key === 'consenso_comunicazioni') {
            datiForm[key] = value === 'on' ? 'Sì' : 'No'; 
        } else {
            datiForm[key] = value.trim();
        }
    });

    if (!datiForm.consenso_legale) datiForm.consenso_legale = 'No';
    if (!datiForm.consenso_comunicazioni) datiForm.consenso_comunicazioni = 'No';

    displayMessage('Inviando i dati... attendi.', 'info');
    
    // --- Preparazione della richiesta API ---
    // Questo è il formato corretto per Apps Script (URLSearchParams/Form-urlencoded)
    const payload = new URLSearchParams();
    payload.append('action', 'inviaDatiIscrizione'); 
    payload.append('data', JSON.stringify(datiForm)); 

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: payload.toString() 
        });
        
        // Controllo Stato HTTP
        if (!response.ok) {
            throw new Error(`Errore HTTP ${response.status}. Controlla la Console per l'URL.`);
        }

        // Lettura del testo e Parsing JSON robusto
        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error("Errore di Parsing JSON. Risposta ricevuta:", text);
            throw new Error("La risposta del server non è JSON. Forse un errore interno a GAS.");
        }
        
        // Controllo Logica di Business
        if (result.success) {
            displayMessage(
                `✅ Richiesta Inviata! Riceverai un'email con il tuo codice di riferimento: <strong>${result.codice}</strong>.`, 
                'success'
            );
            form.reset(); 
        } else {
            displayMessage(`❌ Errore: ${result.message}`, 'error');
        }

    } catch (error) {
        console.error("Errore di Esecuzione Finale:", error);
        displayMessage(`⚠️ Errore critico: ${error.message}`, 'error');
    }
}

function displayMessage(message, type) {
    messageDiv.style.padding = '15px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.marginTop = '20px';
    messageDiv.style.fontWeight = 'bold';
    // ... (Logica di stile CSS per i messaggi) ...
    switch(type) {
        case 'success':
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.borderColor = '#c3e6cb';
            break;
        case 'error':
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.borderColor = '#f5c6cb';
            break;
        case 'info':
        default:
            messageDiv.style.backgroundColor = '#d1ecf1';
            messageDiv.style.color = '#0c5460';
            messageDiv.style.borderColor = '#bee5eb';
    }
    messageDiv.innerHTML = message;
}
