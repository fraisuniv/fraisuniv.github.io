// Transforme les écoles en "une formation = une carte", puis filtre, trie et anime.
// Les textes passent par t() (js/i18n.js) pour la version arabe.
const fmt = n => Math.round(n).toLocaleString("fr-FR").replace(/[  ]/g, " ") + " " + t("DT");
const $ = id => document.getElementById(id);
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ans = n => t(n > 1 ? "{n} ans" : "{n} an", { n });
const rang1 = k => t(k ? "{k}e" : "{k}re", { k: k + 1 });

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
  const pas = now => {
    const p = Math.min((now - t0) / d, 1), e = 1 - Math.pow(1 - p, 3);
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
  `<button type="button" class="chip${n === "" ? " on" : ""}" data-v="${n}" role="radio" aria-checked="${n === ""}">${t(n || "Tous")}</button>`).join("");
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
  pill.style.left = on.offsetLeft + "px";
}
seg.addEventListener("click", ev => {
  const b = ev.target.closest("button"); if (!b) return;
  etat.tri = b.dataset.v;
  seg.querySelectorAll("button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-checked", x === b); });
  placerPill(); afficher();
});
addEventListener("load", placerPill); addEventListener("resize", placerPill); placerPill();

// Listes déroulantes (la valeur reste en français, le texte affiché est traduit)
function remplir(select, valeurs) { [...new Set(valeurs)].sort().forEach(v => select.add(new Option(t(v), v))); }
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
  $("budget-val").textContent = +budget.value >= +budget.max ? t("Sans limite") : fmt(+budget.value);
}

const SITE = LANG === "ar" ? "https://fraisuniv.github.io/ar.html" : "https://fraisuniv.github.io/";
function lienWhatsApp(l) {
  const txt = t("{f} à {e} : {p} par an", { f: t(l.f.intitule), e: l.ecole.nom, p: fmt(l.premiere) })
    + (l.total ? t(", {t} pour {n} ans", { t: fmt(l.total), n: l.duree }) : "")
    + t(". Compare les frais des universités privées en Tunisie : {s}", { s: SITE });
  return "https://wa.me/?text=" + encodeURIComponent(txt);
}

function carte(l, i, rang) {
  const e = l.ecole;
  const ancien = e.annee !== "2026-2027";
  const plafond = Math.max(...l.f.annees.filter(a => a !== null));
  const ratio = l.total ? l.total / maxTotal * 100 : 0;
  const fixe = l.f.annees.every(a => a === l.premiere);
  const k = lignes.indexOf(l);
  const pris = typeof choisis !== "undefined" && choisis.has(k);
  return `<article class="card${rang === 1 && l.total ? " best" : ""}${pris ? " picked" : ""}" style="--i:${i}" data-k="${k}">
    <div class="card-top">
      <div><div class="school">${e.nom}</div><div class="where">📍 ${t(e.ville)}</div></div>
      <span class="rank">${rang === 1 && l.total ? t("★ Moins cher") : "#" + rang}</span>
    </div>
    <div class="title">${t(l.f.intitule)}</div>
    <div class="badges">
      <span class="badge">${t(l.f.niveau)}</span>
      <span class="badge grey">${ans(l.duree)}</span>
      <span class="badge ${ancien ? "warn" : "ok"}">${e.annee === "Non indiquée" ? t("Tarifs Non indiquée") : t("Tarifs {a}", { a: e.annee })}</span>
      ${e.agree ? `<a class="badge ok" href="${AGREMENT.liste}" target="_blank" rel="noopener" title="${t("Figure sur la liste officielle du ministère {a}", { a: AGREMENT.annee })}">${t("✓ École agréée")}</a>` : `<span class="badge warn">${t("Agrément non vérifié")}</span>`}
    </div>
    <div class="money">
      <div><small>${t(fixe ? "Prix par an" : "Prix par an (1re année)")}</small><div class="total">${fmt(l.premiere)}<span class="per">${t(" / an")}</span></div></div>
      <div class="right"><small>${t(l.duree > 1 ? "Total pour {n} ans" : "Total pour {n} an", { n: l.duree })}</small>${l.total ? `<span class="first">${fmt(l.total)}</span>` : `<span class="badge warn">${t("Incomplet")}</span>`}</div>
    </div>
    <div class="bar" title="${t("Comparé à la formation la plus chère")}"><i data-w="${ratio}"></i></div>
    ${l.f.tranches ? `<div class="tranches"><small>${t(fixe ? "Paiement de l'année par tranche" : "Paiement de la 1re année par tranche")}</small>${l.f.tranches[0].map((x, j) =>
      `<div class="tr"><span>${t(e.echeances[j])}</span><b>${fmt(x)}</b></div>`).join("")}</div>`
      : e.paiement ? `<div class="dossier">💳 ${t(e.paiement)} ${t("Montant de chaque tranche non publié par l'école.")}</div>` : `<div class="dossier">💳 ${t("Montant par tranche non publié par l'école.")}</div>`}
    ${e.fraisDossier ? `<div class="dossier">${t("Le total inclut {x} de frais de dossier (payés une fois)", { x: fmt(e.fraisDossier) })}</div>` : ""}
    <button class="toggle" type="button" aria-expanded="false">${t("Détail par année et réductions")} <span class="chev">▾</span></button>
    <div class="more"><div>
      <div class="years">${l.f.annees.map((a, j) => `<div class="yr">
        <b>${a === null ? "?" : (a / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + "k"}</b>
        <div class="col${a === null ? " na" : ""}" data-h="${a === null ? 100 : a / plafond * 100}"></div>
        <span>${t(j ? "{k}e an." : "{k}re an.", { k: j + 1 })}</span></div>`).join("")}</div>
      ${l.f.tranches && !l.f.tranches.every(x => x.join() === l.f.tranches[0].join()) ? `<table class="tr-table"><thead><tr><th>${t("Année")}</th>${e.echeances.map(x => `<th>${t(x.split(" · ")[0])}</th>`).join("")}<th>${t("Total")}</th></tr></thead><tbody>${l.f.tranches.map((x, j) =>
        `<tr><td>${rang1(j)}</td>${x.map(m => `<td>${fmt(m)}</td>`).join("")}<td><b>${fmt(l.f.annees[j])}</b></td></tr>`).join("")}</tbody></table>` : ""}
      ${l.f.note ? `<p class="note">${t(l.f.note)}</p>` : ""}
      ${e.reductions ? `<p class="note"><strong>${t("Réductions :")}</strong> ${t(e.reductions)}</p>` : ""}
      <p class="note"><strong>${t("Diplôme reconnu ?")}</strong> ${e.agree ? t("L'école figure sur la <a href=\"{u}\" target=\"_blank\" rel=\"noopener\">liste officielle des écoles privées agréées ({a})</a>.", { u: AGREMENT.liste, a: AGREMENT.annee }) : t("Agrément non vérifié.")}${l.f.niveau === "Ingénieur" ? t(" Pour le diplôme d'ingénieur, vérifiez aussi la <a href=\"{u}\" target=\"_blank\" rel=\"noopener\">liste des écoles autorisées en ingénierie</a>.", { u: AGREMENT.listeIngenieurs }) : ""}${t(" Demandez à l'école si cette formation précise est habilitée par le ministère.")}</p>
    </div></div>
    <div class="card-actions">
      <label class="pick"><input type="checkbox" data-pick="${k}"${pris ? " checked" : ""}> ${t("Comparer")}</label>
      <a class="wa" href="${lienWhatsApp(l)}" target="_blank" rel="noopener">${t("Partager sur WhatsApp")}</a>
    </div>
    <div class="card-foot"><a href="${e.source}" target="_blank" rel="noopener">${t("Page officielle ↗")}</a><span>${t("Vérifié le {d}", { d: e.verifie })}</span></div>
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

  $("count").innerHTML = t(res.length > 1 ? "{n} formations trouvées" : "{n} formation trouvée", { n: `<b>${res.length}</b>` });

  $("cards").innerHTML = res.length ? res.map((l, i) => carte(l, i, i + 1)).join("")
    : `<div class="empty"><div class="big">🔎</div><h3>${t("Aucune formation ne correspond")}</h3><p>${t("Essayez un budget plus élevé ou un autre niveau.")}</p><button class="btn btn-ghost" type="button" id="reset2">${t("↺ Voir toutes les formations")}</button></div>`;
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.querySelectorAll(".bar i").forEach(b => b.style.width = b.dataset.w + "%")));
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
