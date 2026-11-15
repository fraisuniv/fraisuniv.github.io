// Transforme les écoles en "une formation = une carte", puis filtre, trie et anime.
const fmt = n => Math.round(n).toLocaleString("fr-FR").replace(/[  ]/g, " ") + " DT";
const $ = id => document.getElementById(id);
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;

const lignes = ECOLES.flatMap(e => e.formations.map(f => {
  const complet = f.annees.every(a => a !== null);
  const total = complet ? f.annees.reduce((s, a) => s + a, 0) + (e.fraisDossier || 0) : null;
  const prix = f.annees.filter(a => a !== null);
  return { ecole: e, f, premiere: f.annees[0], total, duree: f.annees.length, maxAn: Math.max(...prix) };
}));
const maxTotal = Math.max(...lignes.map(l => l.total || 0));
const maxAnnee = Math.max(...lignes.map(l => l.maxAn));

// État des filtres
const etat = { niveau: "", tri: "an" };

// Chiffres du haut, avec compteur animé
function compter(el, fin, format = n => Math.round(n)) {
  if (calme) { el.textContent = format(fin); return; }
  const t0 = performance.now(), d = 900;
  const pas = t => {
    const p = Math.min((t - t0) / d, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = format(fin * e);
    if (p < 1) requestAnimationFrame(pas);
  };
  requestAnimationFrame(pas);
}
compter($("s-ecoles"), ECOLES.length);
compter($("s-form"), lignes.length);
compter($("s-min"), Math.min(...lignes.map(l => l.premiere)), fmt);
$("maj").textContent = DERNIERE_MAJ;

// Puces "niveau"
const niveaux = ["", ...new Set(lignes.map(l => l.f.niveau))].sort();
$("f-niveau").innerHTML = niveaux.map(n =>
  `<button type="button" class="chip${n === "" ? " on" : ""}" data-v="${n}" role="radio" aria-checked="${n === ""}">${n || "Tous"}</button>`).join("");
$("f-niveau").addEventListener("click", ev => {
  const b = ev.target.closest(".chip"); if (!b) return;
  etat.niveau = b.dataset.v;
  $("f-niveau").querySelectorAll(".chip").forEach(c => { c.classList.toggle("on", c === b); c.setAttribute("aria-checked", c === b); });
  afficher();
});

// Bouton segmenté "trier par"
const seg = $("f-tri"), pill = seg.querySelector(".seg-pill");
function placerPill() {
  const on = seg.querySelector("button.on");
  pill.style.width = on.offsetWidth + "px";
  pill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
}
seg.addEventListener("click", ev => {
  const b = ev.target.closest("button"); if (!b) return;
  etat.tri = b.dataset.v;
  seg.querySelectorAll("button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
  placerPill(); afficher();
});
addEventListener("load", placerPill); addEventListener("resize", placerPill); placerPill();

// Listes déroulantes
function remplir(select, valeurs) { [...new Set(valeurs)].sort().forEach(v => select.add(new Option(v, v))); }
remplir($("f-domaine"), lignes.map(l => l.f.domaine));
remplir($("f-ville"), lignes.map(l => l.ecole.ville));

// Curseur de budget
const budget = $("f-budget");
budget.min = Math.floor(Math.min(...lignes.map(l => l.maxAn)) / 100) * 100;
budget.max = Math.ceil(maxAnnee / 100) * 100;
budget.value = budget.max;
function majBudget() {
  const p = (budget.value - budget.min) / (budget.max - budget.min) * 100;
  budget.style.setProperty("--p", p + "%");
  $("budget-val").textContent = +budget.value >= +budget.max ? "Sans limite" : fmt(+budget.value);
}

function carte(l, i, rang) {
  const e = l.ecole;
  const ancien = e.annee !== "2026-2027";
  const plafond = Math.max(...l.f.annees.filter(a => a !== null));
  const ratio = l.total ? l.total / maxTotal * 100 : 0;
  return `<article class="card${rang === 1 && l.total ? " best" : ""}" style="--i:${i}">
    <div class="card-top">
      <div><div class="school">${e.nom}</div><div class="where">📍 ${e.ville}</div></div>
      <span class="rank">${rang === 1 && l.total ? "★ Moins cher" : "#" + rang}</span>
    </div>
    <div class="title">${l.f.intitule}</div>
    <div class="badges">
      <span class="badge">${l.f.niveau}</span>
      <span class="badge grey">${l.duree} an${l.duree > 1 ? "s" : ""}</span>
      <span class="badge ${ancien ? "warn" : "ok"}">Tarifs ${e.annee}</span>
      ${e.agree ? `<a class="badge ok" href="${AGREMENT.liste}" target="_blank" rel="noopener" title="Figure sur la liste officielle du ministère ${AGREMENT.annee}">✓ École agréée</a>` : `<span class="badge warn">Agrément non vérifié</span>`}
    </div>
    <div class="money">
      <div><small>Prix par an${l.f.annees.every(a => a === l.premiere) ? "" : " (1re année)"}</small><div class="total">${fmt(l.premiere)}<span class="per"> / an</span></div></div>
      <div class="right"><small>Total pour ${l.duree} an${l.duree > 1 ? "s" : ""}</small>${l.total ? `<span class="first">${fmt(l.total)}</span>` : `<span class="badge warn">Incomplet</span>`}</div>
    </div>
    <div class="bar" title="Comparé à la formation la plus chère"><i data-w="${ratio}"></i></div>
    ${l.f.tranches ? `<div class="tranches"><small>Paiement de la ${l.f.annees.every(a => a === l.premiere) ? "" : "1re "}année par tranche</small>${l.f.tranches[0].map((t, k) =>
      `<div class="tr"><span>${e.echeances[k]}</span><b>${fmt(t)}</b></div>`).join("")}</div>`
      : e.paiement ? `<div class="dossier">💳 ${e.paiement} Montant de chaque tranche non publié par l'école.</div>` : `<div class="dossier">💳 Montant par tranche non publié par l'école.</div>`}
    ${e.fraisDossier ? `<div class="dossier">Le total inclut ${fmt(e.fraisDossier)} de frais de dossier (payés une fois)</div>` : ""}
    <button class="toggle" type="button" aria-expanded="false">Détail par année et réductions <span class="chev">▾</span></button>
    <div class="more"><div>
      <div class="years">${l.f.annees.map((a, k) => `<div class="yr">
        <b>${a === null ? "?" : (a / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "k"}</b>
        <div class="col${a === null ? " na" : ""}" data-h="${a === null ? 100 : a / plafond * 100}"></div>
        <span>${k + 1}${k ? "e" : "re"} an.</span></div>`).join("")}</div>
      ${l.f.tranches && !l.f.tranches.every(t => t.join() === l.f.tranches[0].join()) ? `<table class="tr-table"><thead><tr><th>Année</th>${e.echeances.map(x => `<th>${x.split(" · ")[0]}</th>`).join("")}<th>Total</th></tr></thead><tbody>${l.f.tranches.map((t, k) =>
        `<tr><td>${k + 1}${k ? "e" : "re"}</td>${t.map(x => `<td>${fmt(x)}</td>`).join("")}<td><b>${fmt(l.f.annees[k])}</b></td></tr>`).join("")}</tbody></table>` : ""}
      ${l.f.note ? `<p class="note">${l.f.note}</p>` : ""}
      ${e.reductions ? `<p class="note"><strong>Réductions :</strong> ${e.reductions}</p>` : ""}
      <p class="note"><strong>Diplôme reconnu ?</strong> ${e.agree ? `L'école figure sur la <a href="${AGREMENT.liste}" target="_blank" rel="noopener">liste officielle des écoles privées agréées (${AGREMENT.annee})</a>.` : "Agrément non vérifié."}${l.f.niveau === "Ingénieur" ? ` Pour le diplôme d'ingénieur, vérifiez aussi la <a href="${AGREMENT.listeIngenieurs}" target="_blank" rel="noopener">liste des écoles autorisées en ingénierie</a>.` : ""} Demandez à l'école si cette formation précise est habilitée par le ministère.</p>
    </div></div>
    <div class="card-foot"><a href="${e.source}" target="_blank" rel="noopener">Page officielle ↗</a><span>Vérifié le ${e.verifie}</span></div>
  </article>`;
}

function afficher() {
  majBudget();
  const domaine = $("f-domaine").value, ville = $("f-ville").value;
  const max = +budget.value >= +budget.max ? Infinity : +budget.value;

  const res = lignes
    .filter(l => (!etat.niveau || l.f.niveau === etat.niveau) && (!domaine || l.f.domaine === domaine) && (!ville || l.ecole.ville === ville))
    .filter(l => l.maxAn <= max)
    .sort((a, b) => etat.tri === "an" ? a.premiere - b.premiere : (a.total ?? Infinity) - (b.total ?? Infinity));

  $("count").innerHTML = `<b>${res.length}</b> formation${res.length > 1 ? "s" : ""} trouvée${res.length > 1 ? "s" : ""}`;

  {
    $("cards").innerHTML = res.length ? res.map((l, i) => carte(l, i, i + 1)).join("")
      : `<div class="empty"><div class="big">🔎</div><h3>Aucune formation ne correspond</h3><p>Essayez un budget plus élevé ou un autre niveau.</p><button class="btn btn-ghost" type="button" id="reset2">↺ Voir toutes les formations</button></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() =>
      document.querySelectorAll(".bar i").forEach(b => b.style.width = b.dataset.w + "%")));
  }
}

["f-domaine", "f-ville"].forEach(id => $(id).addEventListener("change", afficher));
budget.addEventListener("input", afficher);

function reinitialiser() {
  etat.niveau = "";
  $("f-niveau").querySelectorAll(".chip").forEach(c => { const on = c.dataset.v === ""; c.classList.toggle("on", on); c.setAttribute("aria-checked", on); });
  $("f-domaine").selectedIndex = 0; $("f-ville").selectedIndex = 0;
  budget.value = budget.max;
  afficher();
}
$("reset").addEventListener("click", reinitialiser);

// Ouvrir / fermer le détail d'une carte
$("cards").addEventListener("click", ev => {
  if (ev.target.id === "reset2") return reinitialiser();
  const b = ev.target.closest(".toggle"); if (!b) return;
  const c = b.closest(".card"), ouvert = c.classList.toggle("open");
  b.setAttribute("aria-expanded", ouvert);
  c.querySelectorAll(".col").forEach(col => col.style.height = ouvert ? col.dataset.h + "%" : "0");
});

// Apparition douce des sections au défilement
const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("seen"); obs.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll(".reveal").forEach(s => obs.observe(s));

afficher();
