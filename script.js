const prodotti = [
  {nome:"MacBook Air M1", categoria:"Computer", voto:5, descrizione:"Portatile leggero, silenzioso e adatto al lavoro quotidiano."},
  {nome:"MacBook Air M2", categoria:"Computer", voto:5, descrizione:"Design elegante e prestazioni per studio e lavoro."},
  {nome:"iPhone 16", categoria:"Smartphone", voto:5, descrizione:"Smartphone Apple con fotocamera e prestazioni avanzate."},
  {nome:"Samsung Galaxy S25", categoria:"Smartphone", voto:5, descrizione:"Uno smartphone Android completo e potente."},
  {nome:"iPad Air", categoria:"Tablet", voto:4, descrizione:"Tablet versatile per studio, creatività e intrattenimento."},
  {nome:"AirPods Pro", categoria:"Audio", voto:5, descrizione:"Auricolari wireless con cancellazione del rumore."}
];

let recensioni = JSON.parse(localStorage.getItem("techreview")) || [];

function stelle(voto) {
  return "★".repeat(voto) + "☆".repeat(5-voto);
}

function mostraProdotti(filtro="") {
  const elenco = document.getElementById("elenco");
  elenco.replaceChildren();

  const trovati = prodotti.filter(p =>
    (p.nome + p.categoria).toLowerCase().includes(filtro.toLowerCase())
  );

  trovati.forEach(p => {
    const card = document.createElement("article");
    card.className = "prodotto";

    const titolo = document.createElement("h3");
    titolo.textContent = p.nome;

    const categoria = document.createElement("small");
    categoria.textContent = p.categoria;

    const voto = document.createElement("div");
    voto.className = "stelle";
    voto.textContent = stelle(p.voto);

    const descrizione = document.createElement("p");
    descrizione.textContent = p.descrizione;

    card.append(titolo, categoria, voto, descrizione);
    elenco.append(card);
  });
}

function mostraRecensioni() {
  const contenitore = document.getElementById("commenti");
  contenitore.replaceChildren();

  if (!recensioni.length) {
    const messaggio = document.createElement("p");
    messaggio.textContent = "Non ci sono ancora recensioni. Sii il primo a scriverne una!";
    contenitore.append(messaggio);
    return;
  }

  recensioni.slice().reverse().forEach(r => {
    const card = document.createElement("article");
    card.className = "recensione";

    const prodotto = document.createElement("h3");
    prodotto.textContent = r.prodotto;

    const voto = document.createElement("div");
    voto.className = "stelle";
    voto.textContent = stelle(r.voto);

    const testo = document.createElement("p");
    testo.textContent = r.testo;

    const autore = document.createElement("small");
    autore.textContent = "Recensione di " + r.nome;

    card.append(prodotto, voto, testo, autore);
    contenitore.append(card);
  });
}

document.getElementById("cerca").addEventListener("input", e => {
  mostraProdotti(e.target.value);
});

document.getElementById("formRecensione").addEventListener("submit", e => {
  e.preventDefault();

  const nuova = {
    nome: document.getElementById("nome").value.trim(),
    prodotto: document.getElementById("prodotto").value.trim(),
    voto: Number(document.getElementById("voto").value),
    testo: document.getElementById("testo").value.trim()
  };

  if (!nuova.nome || !nuova.prodotto || !nuova.testo ||
      nuova.voto < 1 || nuova.voto > 5) return;

  recensioni.push(nuova);
  localStorage.setItem("techreview", JSON.stringify(recensioni));

  e.target.reset();
  mostraRecensioni();
  alert("Recensione salvata!");
});

mostraProdotti();
mostraRecensioni();
