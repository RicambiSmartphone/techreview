// Collegamento al progetto Supabase TechReview.
// La Publishable key è pensata per il browser; la sicurezza dipende dalle policy RLS.
const SUPABASE_URL = "https://danojixyuwpzdjvpnobe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EVvrdDErKH8HsKnAiPkgCw_oarsgsPp";

const clientSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const prodotti = [
  {nome:"MacBook Air M1", categoria:"Computer", voto:5, descrizione:"Portatile leggero, silenzioso e adatto al lavoro quotidiano."},
  {nome:"MacBook Air M2", categoria:"Computer", voto:5, descrizione:"Design elegante e prestazioni per studio e lavoro."},
  {nome:"iPhone 16", categoria:"Smartphone", voto:5, descrizione:"Smartphone Apple con fotocamera e prestazioni avanzate."},
  {nome:"Samsung Galaxy S25", categoria:"Smartphone", voto:5, descrizione:"Uno smartphone Android completo e potente."},
  {nome:"iPad Air", categoria:"Tablet", voto:4, descrizione:"Tablet versatile per studio, creatività e intrattenimento."},
  {nome:"AirPods Pro", categoria:"Audio", voto:5, descrizione:"Auricolari wireless con cancellazione del rumore."}
];

function stelle(voto) {
  const numero = Number(voto);
  return "★".repeat(numero) + "☆".repeat(5 - numero);
}

function mostraProdotti(filtro = "") {
  const elenco = document.getElementById("elenco");
  elenco.replaceChildren();
  prodotti.filter(p => (p.nome + " " + p.categoria).toLowerCase().includes(filtro.toLowerCase()))
    .forEach(p => {
      const card = document.createElement("article");
      card.className = "prodotto";
      const titolo = document.createElement("h3"); titolo.textContent = p.nome;
      const categoria = document.createElement("small"); categoria.textContent = p.categoria;
      const voto = document.createElement("div"); voto.className = "stelle"; voto.textContent = stelle(p.voto);
      const descrizione = document.createElement("p"); descrizione.textContent = p.descrizione;
      card.append(titolo, categoria, voto, descrizione);
      elenco.append(card);
    });
}

function mostraRecensioni(recensioni) {
  const contenitore = document.getElementById("commenti");
  contenitore.replaceChildren();
  if (!recensioni || recensioni.length === 0) {
    const messaggio = document.createElement("p");
    messaggio.textContent = "Non ci sono ancora recensioni approvate.";
    contenitore.append(messaggio);
    return;
  }
  recensioni.forEach(r => {
    const card = document.createElement("article"); card.className = "recensione";
    const prodotto = document.createElement("h3"); prodotto.textContent = r.prodotto;
    const voto = document.createElement("div"); voto.className = "stelle"; voto.textContent = stelle(r.voto);
    voto.setAttribute("aria-label", `Valutazione ${r.voto} su 5`);
    const testo = document.createElement("p"); testo.textContent = r.testo;
    const autore = document.createElement("small"); autore.textContent = "Recensione di " + r.nome;
    card.append(prodotto, voto, testo, autore);

    if (r.risposta_admin) {
      const risposta = document.createElement("div");
      risposta.className = "risposta-techreview";
      const titoloRisposta = document.createElement("strong");
      titoloRisposta.textContent = "Risposta di TechReview";
      const testoRisposta = document.createElement("p");
      testoRisposta.textContent = r.risposta_admin;
      risposta.append(titoloRisposta, testoRisposta);
      card.append(risposta);
    }

    contenitore.append(card);
  });
}

async function caricaRecensioni() {
  const stato = document.getElementById("statoRecensioni");
  stato.textContent = "Caricamento recensioni...";
  const { data, error } = await clientSupabase
    .from("recensioni")
    .select("id, nome, prodotto, voto, testo, creato_il, risposta_admin")
    .order("creato_il", { ascending: false });
  if (error) {
    console.error("Errore caricamento recensioni:", error);
    stato.textContent = "Non è stato possibile caricare le recensioni. Riprova più tardi.";
    return;
  }
  stato.textContent = data.length ? `Recensioni pubblicate: ${data.length}` : "";
  mostraRecensioni(data);
}

document.getElementById("cerca").addEventListener("input", e => mostraProdotti(e.target.value));

document.getElementById("formRecensione").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const pulsante = document.getElementById("pulsantePubblica");
  const messaggio = document.getElementById("messaggioInvio");
  const nuova = {
    nome: document.getElementById("nome").value.trim(),
    prodotto: document.getElementById("prodotto").value.trim(),
    voto: Number(document.getElementById("voto").value),
    testo: document.getElementById("testo").value.trim()
  };
  if (!nuova.nome || !nuova.prodotto || !nuova.testo ||
      nuova.nome.length > 40 || nuova.prodotto.length > 80 ||
      nuova.testo.length > 1000 || !Number.isInteger(nuova.voto) ||
      nuova.voto < 1 || nuova.voto > 5) {
    messaggio.textContent = "Controlla i campi: alcuni dati non sono validi.";
    return;
  }
  pulsante.disabled = true;
  pulsante.textContent = "Invio in corso...";
  messaggio.textContent = "";
  const { error } = await clientSupabase.from("recensioni").insert([nuova]);
  pulsante.disabled = false;
  pulsante.textContent = "Pubblica recensione";
  if (error) {
    console.error("Errore invio recensione:", error);
    messaggio.textContent = "Invio non riuscito. Riprova tra poco.";
    return;
  }
  form.reset();
  messaggio.textContent = "Grazie! La recensione è stata inviata ed è in attesa di approvazione.";
  await caricaRecensioni();
});

mostraProdotti();
caricaRecensioni();
