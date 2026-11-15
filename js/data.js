// Données des écoles — chaque prix vient de la page officielle de l'école (lien "source").
// "annee" = année universitaire des tarifs. "verifie" = date de notre dernière vérification.
// "agree" = l'école figure sur la liste officielle des établissements privés agréés (voir AGREMENT).
// "annees" = prix total de chaque année d'études, en DT (scolarité + inscription quand l'école les sépare).
// null dans "annees" = montant non publié par l'école.

const DERNIERE_MAJ = "15/11/2026";

// Listes officielles du ministère de l'Enseignement supérieur (consultées le 15/11/2026).
const AGREMENT = {
  page: "https://www.mes.tn/page.php?code_menu=147&code_menu_parent=54",
  liste: "https://www.mes.tn/image.php?id=20985",
  listeIngenieurs: "https://www.mes.tn/image.php?id=21192",
  annee: "2025-2026"
};

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
    agree: true,
    fraisDossier: null,
    reductions: "Partenariats de financement annoncés par l'école.",
    formations: [
      { niveau: "Licence", domaine: "Informatique & numérique", intitule: "Licences (génie logiciel, BI & marketing digital, réseaux & cybersécurité)", annees: [6600, 6600, 6600], note: "Tarif annuel TTC, identique pour toutes les licences." },
      { niveau: "Master", domaine: "Informatique & numérique", intitule: "Masters (IA & data science, sécurité SI, IoT…)", annees: [7500, 7500], note: "Tarif annuel TTC. Durée de 2 ans supposée (à vérifier)." }
    ]
  },
  {
    id: "polytec-sousse",
    paiement: "Payable en 3 tranches : à l'inscription, avant le 31 décembre, avant le 31 mars.",
    nom: "Polytechnique Sousse",
    ville: "Sousse",
    adresse: "Route Ceinture Sahloul, Sousse",
    site: "https://www.polytecsousse.tn/",
    source: "https://www.polytecsousse.tn/frais-inscription/",
    annee: "2026-2027",
    verifie: "15/11/2026",
    agree: true,
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
    paiement: "Payable en 3 tranches : à l'inscription, avant le 31 décembre, avant le 31 mars.",
    nom: "Université Mahmoud el Materi (UMM)",
    ville: "Non indiquée",
    adresse: "Ville non indiquée sur le site (à vérifier)",
    site: "https://www.umm-tunisie.com/",
    source: "https://www.umm-tunisie.com/inscription-bourse/conditions-financieres",
    annee: "2026-2027",
    verifie: "15/11/2026",
    agree: true,
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
    paiement: "Payable en 3 tranches : à l'inscription, en janvier, en avril.",
    nom: "Suptech University",
    ville: "Non indiquée",
    adresse: "Adresse non indiquée sur le site (à vérifier)",
    site: "https://suptech.tn/",
    source: "https://suptech.tn/?p=11058",
    annee: "2025-2026",
    verifie: "15/11/2026",
    agree: true,
    fraisDossier: null,
    reductions: "",
    formations: [
      { niveau: "Ingénieur", domaine: "Informatique & numérique", intitule: "Cycle ingénieur informatique & télécom (2 ans de prépa + 3 ans)", annees: [6500, 6500, 7500, 7500, 8050], note: "Inscription et encadrement inclus." },
      { niveau: "Licence", domaine: "Informatique & numérique", intitule: "Licence informatique", annees: [6500, 6500, 7050], note: "Inscription et encadrement inclus." },
      { niveau: "Licence", domaine: "Gestion & droit", intitule: "Licence gestion ou droit", annees: [6500, 6500, null], note: "Prix de la 3e année non publié." },
      { niveau: "Master", domaine: "Gestion & droit", intitule: "Mastère", annees: [7500, 8050], note: "Inscription et encadrement inclus." }
    ]
  },
  {
    id: "esprit",
    paiement: "Payable en 2 tranches (à l'inscription, avant le 15 janvier) ou jusqu'à 36 mensualités.",
    nom: "ESPRIT",
    ville: "Ariana",
    adresse: "Pôle technologique El Ghazala, Ariana",
    site: "https://www.esprit.tn/",
    source: "https://www.esprit.tn/wp-content/uploads/2026/07/Formation-en-cours-du-jour_Grille_tarifaire_2026-2027_ESPRIT-Tunis.pdf",
    annee: "2026-2027",
    verifie: "15/11/2026",
    agree: true,
    fraisDossier: null,
    reductions: "25 % (moyenne > 15 et 1er de classe) ou 10 % (1er de classe). Frères et sœurs : 25 % pour le 2e enfant, 30 % pour le 3e. Paiement jusqu'à 36 mensualités.",
    formations: [
      { niveau: "Ingénieur", domaine: "Informatique & numérique", intitule: "Cycle ingénieur, cours du jour (5 ans après le bac scientifique)", annees: [8800, 8800, 8800, 8800, 8800], note: "8 800 DT TTC pour une inscription en 2026-2027, en 2 tranches. La grille garde le prix de l'année d'entrée (ex. 7 950 DT pour les entrés en 2019) : on suppose 8 800 DT chaque année (à vérifier). Étudiants internationaux : 3 000 €." }
    ]
  },
  {
    id: "ted",
    nom: "TED University",
    ville: "Tunis",
    adresse: "Charguia 1, Tunis",
    site: "https://ted-university.com/",
    source: "https://ted-university.com/admission/frais-financement",
    annee: "2025-2026",
    verifie: "15/11/2026",
    agree: true,
    fraisDossier: null,
    reductions: "Bourse de mérite (montant non publié). L'école indique que ce sont les prix de l'année précédente : les tarifs 2026-2027 seront confirmés à l'inscription.",
    formations: [
      { niveau: "Licence", domaine: "Informatique & numérique", intitule: "Licence informatique (génie logiciel, big data, réseaux & systèmes)", annees: [6595, 6595, 6595], note: "« À partir de » 5 995 DT de scolarité + 600 DT d'inscription par an." },
      { niveau: "Master", domaine: "Informatique & numérique", intitule: "Mastère (cybersécurité, cloud computing & virtualisation)", annees: [7595, 7595], note: "« À partir de » 6 995 DT de scolarité + 600 DT d'inscription par an." }
    ]
  },
  {
    id: "espima",
    nom: "ESPIMA Business School",
    ville: "Tunis",
    adresse: "Tunis",
    site: "https://www.ebs.tn/",
    source: "https://www.ebs.tn/admissions",
    annee: "Non indiquée",
    verifie: "15/11/2026",
    agree: true,
    fraisDossier: null,
    reductions: "",
    formations: [
      { niveau: "Licence", domaine: "Gestion & business", intitule: "Licence parcours général (management, finance, marketing, informatique)", annees: [7500, 7500, 7500], note: "Année des tarifs et frais d'inscription non indiqués par l'école." },
      { niveau: "Licence", domaine: "Gestion & business", intitule: "Licence parcours international", annees: [9500, 9500, 9500], note: "Année des tarifs et frais d'inscription non indiqués par l'école." },
      { niveau: "Master", domaine: "Gestion & business", intitule: "Master (4 spécialités)", annees: [8500, 8500], note: "Année des tarifs et frais d'inscription non indiqués par l'école." },
      { niveau: "Master", domaine: "Gestion & business", intitule: "Master pour professionnels (horaires aménagés)", annees: [6900, 6900], note: "Année des tarifs et frais d'inscription non indiqués par l'école." }
    ]
  }
];
