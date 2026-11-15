// Sections interactives : quiz, comparateur, calculateur, liste « avant de payer ».
// Utilise lignes, fmt, $ et afficher() définis dans app.js.

/* ---------- Comparateur côte à côte ---------- */
const choisis = new Set();
const MAX_CMP = 3;

function majBarre() {
  const n = choisis.size;
  $("cmp-bar").hidden = n === 0;
  $("cmp-txt").textContent = n === 1 ? "1 formation choisie · ajoutes-en une autre" : `${n} formations choisies`;
  $("cmp-open").disabled = n < 2;
}

$("cards").addEventListener("change", ev => {
  const c = ev.target.closest("[data-pick]"); if (!c) return;
  const k = +c.dataset.pick;
  if (c.checked) {
    if (choisis.size >= MAX_CMP) { c.checked = false; toast(`Maximum ${MAX_CMP} formations à la fois`); return; }
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
  const tr = l => l.f.tranches ? l.f.tranches[0].map(fmt).join(" + ") : "Non publié";
  $("cmp-body").innerHTML = `<div class="table-wrap"><table class="cmp">
    <thead><tr><th></th>${ls.map(l => `<th>${l.ecole.nom}</th>`).join("")}</tr></thead><tbody>
    ${ligneCmp("Formation", ls.map(l => l.f.intitule))}
    ${ligneCmp("Ville", ls.map(l => l.ecole.ville))}
    ${ligneCmp("Niveau · durée", ls.map(l => `${l.f.niveau} · ${l.duree} an${l.duree > 1 ? "s" : ""}`))}
    ${ligneCmp("Prix par an (1re année)", ls.map(l => `<b>${fmt(l.premiere)}</b>`), indexMin(ls.map(l => l.premiere)))}
    ${ligneCmp("Équivalent par mois (sur 12 mois)", ls.map(l => fmt(l.premiere / 12)), indexMin(ls.map(l => l.premiere)))}
    ${ligneCmp("Total du diplôme", ls.map(l => l.total ? `<b>${fmt(l.total)}</b>` : "Incomplet"), indexMin(ls.map(l => l.total)))}
    ${ligneCmp("Tranches (1re année)", ls.map(tr))}
    ${ligneCmp("Réductions", ls.map(l => l.ecole.reductions || "Non publiées"))}
    ${ligneCmp("École agréée", ls.map(l => l.ecole.agree ? "✓ Oui (liste du ministère)" : "Non vérifié"))}
    ${ligneCmp("Tarifs", ls.map(l => l.ecole.annee))}
    ${ligneCmp("Source", ls.map(l => `<a href="${l.ecole.source}" target="_blank" rel="noopener">Page officielle ↗</a>`))}
  </tbody></table></div><p class="note">En vert : le moins cher sur la ligne. Les montants viennent des pages officielles des écoles.</p>`;
  ouvrirModal();
});

function ouvrirModal() { $("cmp-modal").hidden = false; document.body.style.overflow = "hidden"; $("cmp-close").focus(); }
function fermerModal() { $("cmp-modal").hidden = true; document.body.style.overflow = ""; }
$("cmp-close").addEventListener("click", fermerModal);
$("cmp-modal").addEventListener("click", ev => { if (ev.target.id === "cmp-modal") fermerModal(); });
addEventListener("keydown", ev => { if (ev.key === "Escape" && !$("cmp-modal").hidden) fermerModal(); });

/* ---------- Petit message de confirmation ---------- */
function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
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
    <p class="q-num">Question ${etape + 1} sur ${QUESTIONS.length}</p>
    <h3>${q.titre}</h3>
    <div class="q-choices">${q.choix.map(c => `<button type="button" class="q-choice" data-v="${c}">${c}</button>`).join("")}</div>
    ${etape ? `<button type="button" class="q-back">← Retour</button>` : ""}</div>`;
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
    msg = `Aucune formation ne correspond exactement. Voici les plus proches (critères assouplis : ${r.join(", ")}).`;
  }
  res = res.sort((a, b) => a.premiere - b.premiere).slice(0, 3);
  $("q-step").innerHTML = `<div class="q-anim">
    <p class="q-num">Résultat</p>
    <h3>${res.length ? `Les ${res.length > 1 ? res.length + " formations" : "formation"} pour toi` : "Aucune formation trouvée pour l'instant"}</h3>
    ${msg ? `<p class="note">${msg}</p>` : ""}
    <div class="q-res">${res.map((l, i) => `<button type="button" class="q-card" data-k="${lignes.indexOf(l)}">
      <span class="q-medal">${["🥇", "🥈", "🥉"][i]}</span>
      <span><b>${l.ecole.nom}</b><small>${l.f.intitule}</small></span>
      <span class="q-price">${fmt(l.premiere)}<small>/ an · ≈ ${fmt(l.premiere / 12)} / mois</small></span></button>`).join("")}</div>
    ${res.length ? "" : `<p class="note">Le site ajoute de nouvelles écoles au fur et à mesure. Essaie avec « Peu importe ».</p>`}
    <button type="button" class="btn btn-ghost q-restart">↺ Recommencer</button></div>`;
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
  lignes.forEach((l, k) => { if (l.ecole === e) g.append(new Option(`${l.f.intitule} (${l.f.niveau})`, k)); });
  selC.append(g);
});

function calcOpts() {
  const e = lignes[+selC.value].ecole, r = e.regles || {};
  $("c-opts").innerHTML = `
    ${r.unefois ? `<label class="opt"><input type="checkbox" id="o-unefois"> <span>Je paie toute l'année en une fois <small>−${r.unefois} % selon ${e.nom}</small></span></label>` : ""}
    ${r.fratrie ? `<div class="opt-group"><span class="f-label">Frère ou sœur déjà inscrit(e) dans l'école ?</span>
      <label class="opt"><input type="radio" name="o-fr" value="0" checked> <span>Non</span></label>
      <label class="opt"><input type="radio" name="o-fr" value="${r.fratrie[0]}"> <span>Je suis le 2e enfant <small>−${r.fratrie[0]} %</small></span></label>
      <label class="opt"><input type="radio" name="o-fr" value="${r.fratrie[1]}"> <span>Je suis le 3e enfant <small>−${r.fratrie[1]} %</small></span></label></div>` : ""}
    ${!r.unefois && !r.fratrie ? `<p class="note">${e.nom} ne publie pas de réduction chiffrée sur sa page officielle.</p>` : ""}`;
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
    <div class="big"><small>Prix de la 1re année${remise ? ` avec −${remise} %` : ""}</small><b>${fmt(an)}</b></div>
    <div class="c-row"><span>≈ par mois sur 12 mois</span><b>${fmt(an / 12)}</b></div>
    <div class="c-row"><span>≈ par mois sur 10 mois (année scolaire)</span><b>${fmt(an / 10)}</b></div>
    ${total != null ? `<div class="c-row"><span>Total du diplôme (${l.duree} ans)</span><b>${fmt(total)}</b></div>` : ""}
    ${eco ? `<div class="c-save">🎉 Tu économises <b>${fmt(eco)}</b> sur le diplôme</div>` : ""}
    <p class="note">Estimation à partir des tarifs publiés (${e.annee}) et des réductions annoncées par l'école. Les conditions exactes sont à confirmer avec l'école${r.fratrie ? " (chez ESPRIT, la réduction se calcule sur les frais les plus élevés)" : ""}.</p>
    <a href="${e.source}" target="_blank" rel="noopener">Voir la page officielle ↗</a>`;
}
selC.addEventListener("change", () => { calcOpts(); calcul(); });
$("c-opts").addEventListener("change", calcul);
calcOpts(); calcul();

/* ---------- Avant de payer ---------- */
const QUESTIONS_ECOLE = [
  ["L'école est-elle sur la liste officielle du ministère ?", `Vérifiez sur <a href="${AGREMENT.liste}" target="_blank" rel="noopener">la liste des écoles agréées</a>.`],
  ["Ma formation précise (licence, master, ingénieur) est-elle habilitée par le ministère ?", "Demandez la réponse par écrit."],
  ["Le prix annoncé comprend-il l'inscription, les frais de dossier et la TVA ?", "Certaines écoles les comptent à part."],
  ["Le prix augmente-t-il chaque année ? De combien ?", "Certaines écoles annoncent +3 à +5 % par an."],
  ["Combien de tranches, et à quelles dates ?", "Notez chaque date limite."],
  ["Que se passe-t-il si j'annule mon inscription ?", "Ex. : ESPRIT garde 10 % et refuse toute annulation après le 30/11/2026."],
  ["Quelles réductions existent (mérite, frères et sœurs, paiement en une fois) ?", "Demandez les conditions exactes."],
  ["Le stage, les examens ou le diplôme ont-ils des frais en plus ?", "Ex. : Suptech ajoute des frais d'encadrement en dernière année."]
];
$("ck-list").innerHTML = QUESTIONS_ECOLE.map(([q, d], i) =>
  `<li><label><input type="checkbox" data-ck="${i}"><span><b>${q}</b><small>${d}</small></span></label></li>`).join("");
function majCheck() {
  const n = document.querySelectorAll("[data-ck]:checked").length;
  $("ck-count").textContent = `${n} / ${QUESTIONS_ECOLE.length}`;
  $("ck-bar").style.width = (n / QUESTIONS_ECOLE.length * 100) + "%";
  if (n === QUESTIONS_ECOLE.length) toast("Bravo, tu es prêt(e) à décider 🎓");
}
$("ck-list").addEventListener("change", majCheck);
$("ck-copy").addEventListener("click", async () => {
  const txt = "Bonjour, avant de m'inscrire j'aimerais savoir :\n" + QUESTIONS_ECOLE.map(([q], i) => `${i + 1}. ${q}`).join("\n") + "\nMerci !";
  try { await navigator.clipboard.writeText(txt); toast("Liste copiée ✔"); }
  catch { toast("Copie impossible sur ce navigateur"); }
});
