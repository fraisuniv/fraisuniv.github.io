// Sections interactives : quiz, comparateur, calculateur, liste « avant de payer ».
// Utilise lignes, fmt, $, ans, afficher() et reinitialiser() définis dans app.js, et t() de i18n.js.

/* ---------- Comparateur côte à côte ---------- */
const choisis = new Set();
const MAX_CMP = 3;

function majBarre() {
  const n = choisis.size;
  $("cmp-bar").hidden = n === 0;
  $("cmp-txt").textContent = n === 1 ? t("1 formation choisie · ajoutes-en une autre") : t("{n} formations choisies", { n });
  $("cmp-open").disabled = n < 2;
}

$("cards").addEventListener("change", ev => {
  const c = ev.target.closest("[data-pick]"); if (!c) return;
  const k = +c.dataset.pick;
  if (c.checked) {
    if (choisis.size >= MAX_CMP) { c.checked = false; toast(t("Maximum {n} formations à la fois", { n: MAX_CMP })); return; }
    choisis.add(k);
  } else choisis.delete(k);
  c.closest(".card").classList.toggle("picked", c.checked);
  majBarre();
});

$("cmp-clear").addEventListener("click", () => { choisis.clear(); afficher(); majBarre(); });

function ligneCmp(titre, valeurs, meilleur) {
  return `<tr><th>${titre}</th>${valeurs.map((v, i) => `<td${meilleur === i ? ' class="win"' : ""}>${v}</td>`).join("")}</tr>`;
}
function indexMin(nums) {
  const ok = nums.map((n, i) => [n, i]).filter(x => x[0] != null);
  if (ok.length < 2) return -1;
  return ok.sort((a, b) => a[0] - b[0])[0][1];
}

$("cmp-open").addEventListener("click", () => {
  const ls = [...choisis].map(k => lignes[k]);
  const tr = l => l.f.tranches ? l.f.tranches[0].map(fmt).join(" + ") : t("Non publié");
  $("cmp-body").innerHTML = `<div class="table-wrap"><table class="cmp">
    <thead><tr><th></th>${ls.map(l => `<th>${l.ecole.nom}</th>`).join("")}</tr></thead><tbody>
    ${ligneCmp(t("Formation"), ls.map(l => t(l.f.intitule)))}
    ${ligneCmp(t("Ville"), ls.map(l => t(l.ecole.ville)))}
    ${ligneCmp(t("Niveau · durée"), ls.map(l => `${t(l.f.niveau)} · ${ans(l.duree)}`))}
    ${ligneCmp(t("Prix par an (1re année)"), ls.map(l => `<b>${fmt(l.premiere)}</b>`), indexMin(ls.map(l => l.premiere)))}
    ${ligneCmp(t("Équivalent par mois (sur 12 mois)"), ls.map(l => fmt(l.premiere / 12)), indexMin(ls.map(l => l.premiere)))}
    ${ligneCmp(t("Total du diplôme"), ls.map(l => l.total ? `<b>${fmt(l.total)}</b>` : t("Incomplet")), indexMin(ls.map(l => l.total)))}
    ${ligneCmp(t("Tranches (1re année)"), ls.map(tr))}
    ${ligneCmp(t("Réductions"), ls.map(l => l.ecole.reductions ? t(l.ecole.reductions) : t("Non publiées")))}
    ${ligneCmp(t("École agréée"), ls.map(l => l.ecole.agree ? t("✓ Oui (liste du ministère)") : t("Non vérifié")))}
    ${ligneCmp(t("Tarifs"), ls.map(l => t(l.ecole.annee)))}
    ${ligneCmp(t("Source"), ls.map(l => `<a href="${l.ecole.source}" target="_blank" rel="noopener">${t("Page officielle ↗")}</a>`))}
  </tbody></table></div><p class="note">${t("En vert : le moins cher sur la ligne. Les montants viennent des pages officielles des écoles.")}</p>`;
  ouvrirModal();
});

function ouvrirModal() { $("cmp-modal").hidden = false; document.body.style.overflow = "hidden"; $("cmp-close").focus(); }
function fermerModal() { $("cmp-modal").hidden = true; document.body.style.overflow = ""; }
$("cmp-close").addEventListener("click", fermerModal);
$("cmp-modal").addEventListener("click", ev => { if (ev.target.id === "cmp-modal") fermerModal(); });
addEventListener("keydown", ev => { if (ev.key === "Escape" && !$("cmp-modal").hidden) fermerModal(); });

/* ---------- Petit message de confirmation ---------- */
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.append(el); }
  el.textContent = msg; el.classList.add("show");
  clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------- Quiz ---------- */
const uniques = arr => [...new Set(arr)].sort();
const QUESTIONS = [
  { cle: "niveau", titre: "Tu vises quel diplôme ?", choix: [...uniques(lignes.map(l => l.f.niveau)), "Je ne sais pas encore"] },
  { cle: "domaine", titre: "Quel domaine t'attire ?", choix: [...uniques(lignes.map(l => l.f.domaine)).filter(d => d !== "Non précisé"), "Peu importe"] },
  { cle: "budget", titre: "Ton budget par mois, environ ?", choix: ["Moins de 600 DT", "Moins de 700 DT", "Moins de 800 DT", "Plus de 800 DT"] },
  { cle: "ville", titre: "Où veux-tu étudier ?", choix: [...uniques(lignes.map(l => l.ecole.ville)).filter(v => v !== "Non indiquée"), "Peu importe"] }
];
const BUDGETS = { "Moins de 600 DT": 600, "Moins de 700 DT": 700, "Moins de 800 DT": 800, "Plus de 800 DT": Infinity };
let rep = {}, etape = 0;

function quizEtape() {
  $("q-bar").style.width = (etape / QUESTIONS.length * 100) + "%";
  if (etape >= QUESTIONS.length) return quizResultat();
  const q = QUESTIONS[etape];
  $("q-step").innerHTML = `<div class="q-anim">
    <p class="q-num">${t("Question {i} sur {n}", { i: etape + 1, n: QUESTIONS.length })}</p>
    <h3>${t(q.titre)}</h3>
    <div class="q-choices">${q.choix.map(c => `<button type="button" class="q-choice" data-v="${c}">${t(c)}</button>`).join("")}</div>
    ${etape ? `<button type="button" class="q-back">${t("← Retour")}</button>` : ""}</div>`;
}

function filtrer(r, relache = []) {
  return lignes.filter(l =>
    (r.niveau === "Je ne sais pas encore" || l.f.niveau === r.niveau) &&
    (relache.includes("domaine") || r.domaine === "Peu importe" || l.f.domaine === r.domaine) &&
    (relache.includes("budget") || l.maxAn / 12 <= BUDGETS[r.budget]) &&
    (relache.includes("ville") || r.ville === "Peu importe" || l.ecole.ville === r.ville));
}

function quizResultat() {
  let res = filtrer(rep), msg = "";
  for (const r of [["ville"], ["ville", "budget"], ["ville", "budget", "domaine"]]) {
    if (res.length) break;
    res = filtrer(rep, r);
    msg = t("Aucune formation ne correspond exactement. Voici les plus proches (critères assouplis : {c}).", { c: r.map(x => t(x)).join(LANG === "ar" ? "، " : ", ") });
  }
  res = res.sort((a, b) => a.premiere - b.premiere).slice(0, 3);
  const titre = !res.length ? t("Aucune formation trouvée pour l'instant") : res.length > 1 ? t("Les {n} formations pour toi", { n: res.length }) : t("La formation pour toi");
  $("q-step").innerHTML = `<div class="q-anim">
    <p class="q-num">${t("Résultat")}</p>
    <h3>${titre}</h3>
    ${msg ? `<p class="note">${msg}</p>` : ""}
    <div class="q-res">${res.map((l, i) => `<button type="button" class="q-card" data-k="${lignes.indexOf(l)}">
      <span class="q-medal">${["🥇", "🥈", "🥉"][i]}</span>
      <span><b>${l.ecole.nom}</b><small>${t(l.f.intitule)}</small></span>
      <span class="q-price">${fmt(l.premiere)}<small>${t("/ an · ≈ {m} / mois", { m: fmt(l.premiere / 12) })}</small></span></button>`).join("")}</div>
    ${res.length ? "" : `<p class="note">${t("Le site ajoute de nouvelles écoles au fur et à mesure. Essaie avec « Peu importe ».")}</p>`}
    <button type="button" class="btn btn-ghost q-restart">${t("↺ Recommencer")}</button></div>`;
}

$("q-step").addEventListener("click", ev => {
  const c = ev.target.closest(".q-choice");
  if (c) { rep[QUESTIONS[etape].cle] = c.dataset.v; etape++; return quizEtape(); }
  if (ev.target.closest(".q-back")) { etape--; return quizEtape(); }
  if (ev.target.closest(".q-restart")) { rep = {}; etape = 0; return quizEtape(); }
  const r = ev.target.closest(".q-card");
  if (r) montrerCarte(+r.dataset.k);
});

// Montre la carte d'une formation dans la liste (en réinitialisant les filtres)
function montrerCarte(k) {
  reinitialiser();
  const c = document.querySelector(`.card[data-k="${k}"]`); if (!c) return;
  c.scrollIntoView({ behavior: "smooth", block: "center" });
  c.classList.add("flash"); setTimeout(() => c.classList.remove("flash"), 1800);
}
quizEtape();

/* ---------- Calculateur ---------- */
const selC = $("c-form");
ECOLES.forEach(e => {
  const g = document.createElement("optgroup"); g.label = e.nom;
  lignes.forEach((l, k) => { if (l.ecole === e) g.append(new Option(`${t(l.f.intitule)} (${t(l.f.niveau)})`, k)); });
  selC.append(g);
});

function calcOpts() {
  const e = lignes[+selC.value].ecole, r = e.regles || {};
  $("c-opts").innerHTML = `
    ${r.unefois ? `<label class="opt"><input type="checkbox" id="o-unefois"> <span>${t("Je paie toute l'année en une fois")} <small>${t("−{p} % selon {e}", { p: r.unefois, e: e.nom })}</small></span></label>` : ""}
    ${r.fratrie ? `<div class="opt-group"><span class="f-label">${t("Frère ou sœur déjà inscrit(e) dans l'école ?")}</span>
      <label class="opt"><input type="radio" name="o-fr" value="0" checked> <span>${t("Non")}</span></label>
      <label class="opt"><input type="radio" name="o-fr" value="${r.fratrie[0]}"> <span>${t("Je suis le 2e enfant")} <small>−${r.fratrie[0]} %</small></span></label>
      <label class="opt"><input type="radio" name="o-fr" value="${r.fratrie[1]}"> <span>${t("Je suis le 3e enfant")} <small>−${r.fratrie[1]} %</small></span></label></div>` : ""}
    ${!r.unefois && !r.fratrie ? `<p class="note">${t("{e} ne publie pas de réduction chiffrée sur sa page officielle.", { e: e.nom })}</p>` : ""}`;
}

function calcul() {
  const l = lignes[+selC.value], e = l.ecole, r = e.regles || {};
  let remise = 0;
  const uf = $("o-unefois"); if (uf && uf.checked) remise += r.unefois;
  const fr = document.querySelector('input[name="o-fr"]:checked'); if (fr) remise += +fr.value;
  const an = l.premiere * (1 - remise / 100);
  const total = l.total != null ? l.f.annees.reduce((s, a) => s + a * (1 - remise / 100), 0) + (e.fraisDossier || 0) : null;
  const eco = l.total != null ? l.total - total : null;
  $("c-res").innerHTML = `
    <div class="big"><small>${remise ? t("Prix de la 1re année avec −{p} %", { p: remise }) : t("Prix de la 1re année")}</small><b>${fmt(an)}</b></div>
    <div class="c-row"><span>${t("≈ par mois sur 12 mois")}</span><b>${fmt(an / 12)}</b></div>
    <div class="c-row"><span>${t("≈ par mois sur 10 mois (année scolaire)")}</span><b>${fmt(an / 10)}</b></div>
    ${total != null ? `<div class="c-row"><span>${t("Total du diplôme ({n} ans)", { n: l.duree })}</span><b>${fmt(total)}</b></div>` : ""}
    ${eco ? `<div class="c-save">${t("🎉 Tu économises <b>{x}</b> sur le diplôme", { x: fmt(eco) })}</div>` : ""}
    <p class="note">${t("Estimation à partir des tarifs publiés ({a}) et des réductions annoncées par l'école. Les conditions exactes sont à confirmer avec l'école", { a: t(e.annee) })}${r.fratrie ? t(" (chez ESPRIT, la réduction se calcule sur les frais les plus élevés)") : ""}.</p>
    <a href="${e.source}" target="_blank" rel="noopener">${t("Voir la page officielle ↗")}</a>`;
}
selC.addEventListener("change", () => { calcOpts(); calcul(); });
$("c-opts").addEventListener("change", calcul);
calcOpts(); calcul();

/* ---------- Avant de payer ---------- */
const QUESTIONS_ECOLE = [
  ["L'école est-elle sur la liste officielle du ministère ?", t("Vérifiez sur <a href=\"{u}\" target=\"_blank\" rel=\"noopener\">la liste des écoles agréées</a>.", { u: AGREMENT.liste })],
  ["Ma formation précise (licence, master, ingénieur) est-elle habilitée par le ministère ?", t("Demandez la réponse par écrit.")],
  ["Le prix annoncé comprend-il l'inscription, les frais de dossier et la TVA ?", t("Certaines écoles les comptent à part.")],
  ["Le prix augmente-t-il chaque année ? De combien ?", t("Certaines écoles annoncent +3 à +5 % par an.")],
  ["Combien de tranches, et à quelles dates ?", t("Notez chaque date limite.")],
  ["Que se passe-t-il si j'annule mon inscription ?", t("Ex. : ESPRIT garde 10 % et refuse toute annulation après le 30/11/2026.")],
  ["Quelles réductions existent (mérite, frères et sœurs, paiement en une fois) ?", t("Demandez les conditions exactes.")],
  ["Le stage, les examens ou le diplôme ont-ils des frais en plus ?", t("Ex. : Suptech ajoute des frais d'encadrement en dernière année.")]
].map(([q, d]) => [t(q), d]);
$("ck-list").innerHTML = QUESTIONS_ECOLE.map(([q, d], i) =>
  `<li><label><input type="checkbox" data-ck="${i}"><span><b>${q}</b><small>${d}</small></span></label></li>`).join("");
function majCheck() {
  const n = document.querySelectorAll("[data-ck]:checked").length;
  $("ck-count").textContent = `${n} / ${QUESTIONS_ECOLE.length}`;
  $("ck-bar").style.width = (n / QUESTIONS_ECOLE.length * 100) + "%";
  if (n === QUESTIONS_ECOLE.length) toast(t("Bravo, tu es prêt(e) à décider 🎓"));
}
$("ck-list").addEventListener("change", majCheck);
$("ck-copy").addEventListener("click", async () => {
  const txt = t("Bonjour, avant de m'inscrire j'aimerais savoir :") + "\n" + QUESTIONS_ECOLE.map(([q], i) => `${i + 1}. ${q}`).join("\n") + "\n" + t("Merci !");
  try { await navigator.clipboard.writeText(txt); toast(t("Liste copiée ✔")); }
  catch { toast(t("Copie impossible sur ce navigateur")); }
});
