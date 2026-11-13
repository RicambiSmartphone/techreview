// Configurazione pubblica del progetto Supabase TechReview.
const SUPABASE_URL = "https://danojixyuwpzdjvpnobe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EVvrdDErKH8HsKnAiPkgCw_oarsgsPp";
const ADMIN_UID = "0b15cb90-2b73-452d-8110-b14c32cc38d4";

const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginStatus = document.getElementById("loginStatus");
const adminStatus = document.getElementById("adminStatus");
const reviewList = document.getElementById("reviewList");

function addText(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value ?? "";
  return el;
}

function showLogin(message = "") {
  loginPanel.classList.remove("hidden");
  adminPanel.classList.add("hidden");
  loginStatus.textContent = message;
}

function showAdmin() {
  loginPanel.classList.add("hidden");
  adminPanel.classList.remove("hidden");
}

async function verificaSessione() {
  const { data: { session } } = await supabaseAdmin.auth.getSession();
  if (!session) return showLogin();
  if (session.user.id !== ADMIN_UID) {
    await supabaseAdmin.auth.signOut();
    return showLogin("Questo account non è autorizzato ad accedere all'area amministratore.");
  }
  showAdmin();
  await caricaRecensioni();
}

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.getElementById("loginButton");
  button.disabled = true;
  loginStatus.textContent = "Accesso in corso...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  button.disabled = false;
  if (error) {
    loginStatus.textContent = "Accesso non riuscito. Controlla email e password e riprova.";
    console.error(error);
    return;
  }
  if (data.user.id !== ADMIN_UID) {
    await supabaseAdmin.auth.signOut();
    loginStatus.textContent = "Questo account non è autorizzato ad accedere all'area amministratore.";
    return;
  }
  showAdmin();
  await caricaRecensioni();
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  await supabaseAdmin.auth.signOut();
  showLogin("Sei uscito dall'area amministratore.");
});

async function caricaRecensioni() {
  adminStatus.textContent = "Caricamento recensioni...";
  reviewList.replaceChildren();

  const { data, error } = await supabaseAdmin
    .from("recensioni")
    .select("id, nome, prodotto, voto, testo, creato_il, approvata")
    .order("creato_il", { ascending: false });

  if (error) {
    adminStatus.textContent = "Non è stato possibile caricare le recensioni.";
    console.error(error);
    return;
  }

  const pending = data.filter(r => !r.approvata);
  const approved = data.filter(r => r.approvata);
  adminStatus.textContent = `${pending.length} in attesa · ${approved.length} approvate · ${data.length} totali`;

  if (data.length === 0) {
    reviewList.append(addText("p", "muted", "Non ci sono ancora recensioni."));
    return;
  }

  data.forEach((r) => {
    const card = document.createElement("article");
    card.className = "review";
    card.append(
      addText("h3", "", r.prodotto),
      addText("div", "meta", `${"★".repeat(Number(r.voto))}${"☆".repeat(5 - Number(r.voto))} · ${r.nome} · ${new Date(r.creato_il).toLocaleString("it-IT")}`),
      addText("p", "", r.testo),
      addText("div", "meta", r.approvata ? "Stato: approvata e visibile sul sito" : "Stato: in attesa di approvazione")
    );

    const actions = document.createElement("div");
    actions.className = "actions";

    if (!r.approvata) {
      const approve = addText("button", "", "Approva");
      approve.type = "button";
      approve.addEventListener("click", () => aggiornaApprovazione(r.id, true, approve));
      actions.append(approve);
    } else {
      const unapprove = addText("button", "secondary", "Rimetti in attesa");
      unapprove.type = "button";
      unapprove.addEventListener("click", () => aggiornaApprovazione(r.id, false, unapprove));
      actions.append(unapprove);
    }

    const remove = addText("button", "danger", "Elimina");
    remove.type = "button";
    remove.addEventListener("click", () => eliminaRecensione(r.id, remove));
    actions.append(remove);
    card.append(actions);
    reviewList.append(card);
  });
}

async function aggiornaApprovazione(id, approvata, button) {
  button.disabled = true;
  const { error } = await supabaseAdmin
    .from("recensioni")
    .update({ approvata })
    .eq("id", id);
  if (error) {
    adminStatus.textContent = "Non è stato possibile aggiornare la recensione.";
    console.error(error);
    button.disabled = false;
    return;
  }
  await caricaRecensioni();
}

async function eliminaRecensione(id, button) {
  if (!window.confirm("Vuoi eliminare definitivamente questa recensione?")) return;
  button.disabled = true;
  const { error } = await supabaseAdmin
    .from("recensioni")
    .delete()
    .eq("id", id);
  if (error) {
    adminStatus.textContent = "Non è stato possibile eliminare la recensione.";
    console.error(error);
    button.disabled = false;
    return;
  }
  await caricaRecensioni();
}

verificaSessione();
