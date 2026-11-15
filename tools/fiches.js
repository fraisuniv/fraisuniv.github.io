// Génère une page "fiche" par école : ecoles/<id>.html, à partir de js/data.js.
// Lancer : node tools/fiches.js  (puis faire le commit des pages générées)
const fs = require("fs");
const path = require("path");
const racine = path.join(__dirname, "..");
eval(fs.readFileSync(path.join(racine, "js/data.js"), "utf8") + ";global.ECOLES=ECOLES;global.AGREMENT=AGREMENT;global.DERNIERE_MAJ=DERNIERE_MAJ;");

const SITE = "https://fraisuniv.github.io/";
const fmt = n => Math.round(n).toLocaleString("fr-FR").replace(/[  ]/g, " ") + " DT";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const ans = n => `${n} an${n > 1 ? "s" : ""}`;
const ORDRE = ["Licence", "Master", "Ingénieur", "Architecture"];
const TITRES = { Licence: "Licences", Master: "Masters", "Ingénieur": "Cycle ingénieur", Architecture: "Architecture" };

function formation(e, f) {
  const total = f.annees.every(a => a !== null) ? f.annees.reduce((s, a) => s + a, 0) + (e.fraisDossier || 0) : null;
  const fixe = f.annees.every(a => a === f.annees[0]);
  const tr = f.tranches ? `<div class="fi-tr">${f.tranches[0].map((x, k) => `<span>${esc(e.echeances[k])} : <b>${fmt(x)}</b></span>`).join("")}</div>` : "";
  const parAn = fixe ? "" : `<div class="fi-years">${f.annees.map((a, k) => `<span>${k + 1}${k ? "e" : "re"} année : <b>${a === null ? "non publié" : fmt(a)}</b></span>`).join("")}</div>`;
  return `<div class="fi-row">
      <div class="fi-main"><h4>${esc(f.intitule)}</h4><p class="small">${esc(f.domaine)} · ${ans(f.annees.length)}</p>${parAn}${tr}${f.note ? `<p class="note">${esc(f.note)}</p>` : ""}</div>
      <div class="fi-price"><b>${fmt(f.annees[0])}</b><small>${fixe ? "par an" : "1re année"}</small><span>${total ? `Total : ${fmt(total)}` : "Total incomplet"}</span></div>
    </div>`;
}

function page(e) {
  const forms = e.formations;
  const min = Math.min(...forms.map(f => f.annees[0]));
  const groupes = ORDRE.filter(n => forms.some(f => f.niveau === n));
  const niveaux = groupes.map(n => TITRES[n].toLowerCase()).join(", ");
  const desc = `${e.nom} (${e.ville}) : frais de scolarité ${e.annee}, à partir de ${fmt(min)} par an. ${forms.length} formation${forms.length > 1 ? "s" : ""} (${niveaux}), tranches, réductions et agrément, avec la source officielle.`;
  const url = `${SITE}ecoles/${e.id}.html`;
  const wa = "https://wa.me/?text=" + encodeURIComponent(`Frais de scolarité de ${e.nom} : à partir de ${fmt(min)} par an. Toutes les formations et les prix : ${url}`);
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(e.nom)} : frais de scolarité ${esc(e.annee)} | FraisUniv</title>
  <meta name="description" content="${esc(desc)}">
  <meta property="og:title" content="${esc(e.nom)} : frais de scolarité">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <link rel="canonical" href="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/extras.css">
</head>
<body>
  <nav class="nav">
    <div class="wrap nav-in">
      <a href="../" class="logo">🎓 FraisUniv<span>.tn</span></a>
      <div class="nav-links">
        <a href="../#comparer">Comparer les écoles</a>
        <a href="../#ecoles">Toutes les écoles</a>
      </div>
    </div>
  </nav>

  <header class="fi-hero" style="--c:${e.couleur}">
    <div class="wrap fi-hero-in">
      <div class="mono big" style="--c:${e.couleur}" aria-hidden="true">${esc(e.sigle)}</div>
      <div>
        <p class="crumbs"><a href="../">Accueil</a> › <a href="../#ecoles">Écoles</a> › ${esc(e.nom)}</p>
        <h1>${esc(e.nom)}</h1>
        <div class="badges">
          <span class="badge grey">📍 ${esc(e.ville)}</span>
          ${e.agree ? `<a class="badge ok" href="${AGREMENT.liste}" target="_blank" rel="noopener">✓ École agréée (liste du ministère ${AGREMENT.annee})</a>` : `<span class="badge warn">Agrément non vérifié</span>`}
          <span class="badge ${e.annee === "2026-2027" ? "ok" : "warn"}">${e.annee === "Non indiquée" ? "Année des tarifs non indiquée" : "Tarifs " + esc(e.annee)}</span>
        </div>
      </div>
      <div class="fi-from"><small>À partir de</small><b>${fmt(min)}</b><small>par an</small></div>
    </div>
  </header>

  <main class="wrap fi">
    <section class="fi-info">
      <h2>Informations</h2>
      <dl>
        <dt>Adresse</dt><dd>${esc(e.adresse)}</dd>
        <dt>Site officiel</dt><dd><a href="${e.site}" target="_blank" rel="noopener">${esc(e.site.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a></dd>
        <dt>Source des prix</dt><dd><a href="${e.source}" target="_blank" rel="noopener">Page officielle des tarifs ↗</a></dd>
        <dt>Vérifié le</dt><dd>${esc(e.verifie)}</dd>
        ${e.paiement ? `<dt>Paiement</dt><dd>${esc(e.paiement)}</dd>` : ""}
        ${e.fraisDossier ? `<dt>Frais de dossier</dt><dd>${fmt(e.fraisDossier)} (payés une fois)</dd>` : ""}
        ${e.reductions ? `<dt>Réductions</dt><dd>${esc(e.reductions)}</dd>` : ""}
      </dl>
      <div class="fi-actions">
        <a class="btn btn-primary" href="../#comparer">Comparer avec d'autres écoles</a>
        <a class="wa" href="${wa}" target="_blank" rel="noopener">Partager sur WhatsApp</a>
      </div>
    </section>

    <section class="fi-forms">
      <h2>Formations proposées et prix</h2>
      ${groupes.map(n => `<h3>${TITRES[n]}</h3>${forms.filter(f => f.niveau === n).map(f => formation(e, f)).join("")}`).join("")}
      <p class="note">Le total = la somme des prix publiés pour chaque année${e.fraisDossier ? " + les frais de dossier" : ""}. Les hausses futures ne sont pas comptées. Vérifiez toujours auprès de l'école avant de vous inscrire, et demandez si la formation précise est habilitée par le ministère.</p>
    </section>
  </main>

  <footer class="wrap foot">
    <p>Site indépendant, non affilié à ${esc(e.nom)}, au ministère ni aux autres écoles. Dernière mise à jour : ${DERNIERE_MAJ}.</p>
  </footer>
</body>
</html>
`;
}

fs.mkdirSync(path.join(racine, "ecoles"), { recursive: true });
for (const e of ECOLES) fs.writeFileSync(path.join(racine, "ecoles", e.id + ".html"), page(e));

// Sitemap : accueil, page arabe et toutes les fiches
const urls = ["", "ar.html", ...ECOLES.map(e => `ecoles/${e.id}.html`)];
fs.writeFileSync(path.join(racine, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>2026-11-15</lastmod></url>`).join("\n")}
</urlset>
`);
console.log(`${ECOLES.length} fiches générées + sitemap (${urls.length} pages)`);
