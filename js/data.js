// Données des écoles — chaque prix vient de la page officielle de l'école (lien "source").
// "annee" = année universitaire des tarifs. "verifie" = date de notre dernière vérification.
// "annees" = prix total de chaque année d'études, en DT (scolarité + inscription quand l'école les sépare).
// null dans "annees" = montant non publié par l'école.

const DERNIERE_MAJ = "15/11/2026";

const ECOLES = [
  {
    id: "esgitech",
    nom: "ESGITECH",
    ville: "Tunis",
    adresse: "Les Berges du Lac 3, Le Kram, Tunis",
    site: "https://www.esgitech.tn/",
    source: "https://www.esgitech.tn/frais-dinscription-et-de-scolarite/",
    annee: "2026-2027",
    verifie: "15/11/2026",
    fraisDossier: null,
    reductions: "Partenariats de financement annoncés par l'école.",
    formations: [
      { niveau: "Licence", domaine: "Informatique & numérique", intitule: "Licences (génie logiciel, BI & marketing digital, réseaux & cybersécurité)", annees: [6600, 6600, 6600], note: "Tarif annuel TTC, identique pour toutes les licences." },
      { niveau: "Master", domaine: "Informatique & numérique", intitule: "Masters (IA & data science, sécurité SI, IoT…)", annees: [7500, 7500], note: "Tarif annuel TTC. Durée de 2 ans supposée (à vérifier)." }
    ]
  },
  {
    id: "polytec-sousse",
    nom: "Polytechnique Sousse",
    ville: "Sousse",
    adresse: "Route Ceinture Sahloul, Sousse",
    site: "https://www.polytecsousse.tn/",
    source: "https://www.polytecsousse.tn/frais-inscription/",
    annee: "2026-2027",
    verifie: "15/11/2026",
    fraisDossier: 350,
    reductions: "6 % de réduction si toute l'année est payée en une fois.",
    formations: [
      { niveau: "Ingénieur", domaine: "Ingénierie", intitule: "Cycle ingénieur (2 ans de prépa + 3 ans)", annees: [6950, 6950, 7849, 7849, 7849], note: "" },
      { niveau: "Architecture", domaine: "Architecture", intitule: "Architecture (6 ans)", annees: [6987, 7240, 7460, 7670, 7880, 8100], note: "" },
      { niveau: "Licence", domaine: "Non précisé", intitule: "Cycle licence", annees: [6629, 6629, 6629], note: "Filières de licence non détaillées sur la page des tarifs." }
    ]
  },
  {
    id: "umm",
    nom: "Université Mahmoud el Materi (UMM)",
    ville: "Non indiquée",
    adresse: "Ville non indiquée sur le site (à vérifier)",
    site: "https://www.umm-tunisie.com/",
    source: "https://www.umm-tunisie.com/inscription-bourse/conditions-financieres",
    annee: "2026-2027",
    verifie: "15/11/2026",
    fraisDossier: null,
    reductions: "L'école annonce une hausse de 3 à 5 % par an.",
    formations: [
      { niveau: "Licence", domaine: "Santé & paramédical", intitule: "Licences santé (infirmier, kiné, obstétrique, nutrition…)", annees: [9900, 9850, 9800], note: "Inscription incluse." },
      { niveau: "Licence", domaine: "Santé & paramédical", intitule: "Licence anesthésie-réanimation", annees: [10300, 10250, 10200], note: "Inscription incluse." },
      { niveau: "Master", domaine: "Santé & paramédical", intitule: "Master", annees: [8800, 8750], note: "Inscription incluse." }
    ]
  },
  {
    id: "suptech",
    nom: "Suptech University",
    ville: "Non indiquée",
    adresse: "Adresse non indiquée sur le site (à vérifier)",
    site: "https://suptech.tn/",
    source: "https://suptech.tn/?p=11058",
    annee: "2025-2026",
    verifie: "15/11/2026",
    fraisDossier: null,
    reductions: "Paiement en 3 tranches (inscription, janvier, avril).",
    formations: [
      { niveau: "Ingénieur", domaine: "Informatique & numérique", intitule: "Cycle ingénieur informatique & télécom (2 ans de prépa + 3 ans)", annees: [6500, 6500, 7500, 7500, 8050], note: "Inscription et encadrement inclus." },
      { niveau: "Licence", domaine: "Informatique & numérique", intitule: "Licence informatique", annees: [6500, 6500, 7050], note: "Inscription et encadrement inclus." },
      { niveau: "Licence", domaine: "Gestion & droit", intitule: "Licence gestion ou droit", annees: [6500, 6500, null], note: "Prix de la 3e année non publié." },
      { niveau: "Master", domaine: "Gestion & droit", intitule: "Mastère", annees: [7500, 8050], note: "Inscription et encadrement inclus." }
    ]
  },
  {
    id: "esprit",
    nom: "ESPRIT",
    ville: "Ariana",
    adresse: "Pôle technologique El Ghazala, Ariana",
    site: "https://www.esprit.tn/",
    source: "https://www.esprit.tn/wp-content/uploads/2026/07/Formation-en-cours-du-jour_Grille_tarifaire_2026-2027_ESPRIT-Tunis.pdf",
    annee: "2026-2027",
    verifie: "15/11/2026",
    fraisDossier: null,
    reductions: "25 % (moyenne > 15 et 1er de classe) ou 10 % (1er de classe). Frères et sœurs : 25 % pour le 2e enfant, 30 % pour le 3e. Paiement jusqu'à 36 mensualités.",
    formations: [
      { niveau: "Ingénieur", domaine: "Informatique & numérique", intitule: "Cycle ingénieur, cours du jour (5 ans après le bac scientifique)", annees: [8800, 8800, 8800, 8800, 8800], note: "8 800 DT TTC pour une inscription en 2026-2027, en 2 tranches. La grille garde le prix de l'année d'entrée (ex. 7 950 DT pour les entrés en 2019) : on suppose 8 800 DT chaque année (à vérifier). Étudiants internationaux : 3 000 €." }
    ]
  }
];
