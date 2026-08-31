export interface ClubProfile {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  ffbbCode?: string;
  city: string;
  hall: string;
  logoEmoji: string;
  primaryColor: string;
  badgeRole: string;
  wins: number;
  losses: number;
  avgPointsScored: number;
  avgPointsConceded: number;
  recentForm: ("W" | "L")[]; // Last 5 matches
  homeRecord: string;
  awayRecord: string;
  keyPlayers: string[];
  strengths: string[];
  weaknesses: string[];
  pronoAdvice: string;
}

export const CLUBS_DATA: Record<string, ClubProfile> = {
  bcsn: {
    id: "bcsn",
    name: "BCSN (Saint-Nicolas)",
    shortName: "BCSN",
    fullName: "Basket Club de Saint Nicolas",
    city: "Saint-Nicolas-lez-Arras",
    hall: "Complexe Sportif Chantecler",
    logoEmoji: "🏀",
    primaryColor: "from-blue-600 to-indigo-700",
    badgeRole: "Notre Équipe",
    wins: 6,
    losses: 2,
    avgPointsScored: 79.4,
    avgPointsConceded: 71.2,
    recentForm: ["W", "W", "L", "W", "W"],
    homeRecord: "4-0",
    awayRecord: "2-2",
    keyPlayers: ["Gregory Duquesne (Coach)", "Adrien (Capitaine)", "Meneur Sénior A"],
    strengths: ["Jeu de transition rapide", "Infaillible à domicile", "Défense agressive en presse"],
    weaknesses: ["Gestion des fin de matchs serrés à l'extérieur"],
    pronoAdvice: "Le BCSN est imprenable à domicile au Complexe Chantecler !",
  },
  longueau: {
    id: "longueau",
    name: "ESC Longueau Amiens",
    shortName: "Longueau",
    fullName: "Etoile Sportive Cheminots Longueau",
    ffbbCode: "HDF0080011",
    city: "Longueau",
    hall: "Gymnase Pellerin",
    logoEmoji: "⭐",
    primaryColor: "from-amber-500 to-orange-600",
    badgeRole: "Amical",
    wins: 5,
    losses: 3,
    avgPointsScored: 76.5,
    avgPointsConceded: 74.1,
    recentForm: ["W", "L", "W", "W", "L"],
    homeRecord: "3-1",
    awayRecord: "2-2",
    keyPlayers: ["Pivot physique N2", "Meneur créateur"],
    strengths: ["Impact physique sous le cercle", "Rebond offensif"],
    weaknesses: ["Adresse irrégulière à 3 points"],
    pronoAdvice: "Équipe rugueuse. Anticiper un score serré entre 70 et 78 points.",
  },
  lillers: {
    id: "lillers",
    name: "BC Lillers",
    shortName: "Lillers",
    fullName: "Basket Club Lillers",
    ffbbCode: "HDF0062142",
    city: "Lillers",
    hall: "Salle Omnisports de Lillers",
    logoEmoji: "⚡",
    primaryColor: "from-emerald-500 to-teal-700",
    badgeRole: "Amical",
    wins: 4,
    losses: 4,
    avgPointsScored: 72.0,
    avgPointsConceded: 75.8,
    recentForm: ["L", "W", "L", "L", "W"],
    homeRecord: "2-2",
    awayRecord: "2-2",
    keyPlayers: ["Ailier fort rapide", "Tireur à 3pts"],
    strengths: ["Tir extérieur rapide", "Jeu en contre-attaque"],
    weaknesses: ["Manque de taille dans la raquette"],
    pronoAdvice: "Le BCSN a l'avantage athlétique. Pronostic conseillé : Victoire BCSN +8 pts.",
  },
  lesquin: {
    id: "lesquin",
    name: "BC Lesquin",
    shortName: "Lesquin",
    fullName: "Basket Club Lesquin",
    ffbbCode: "HDF0059099",
    city: "Lesquin",
    hall: "Complexe Jean-Pierre Papin",
    logoEmoji: "🦅",
    primaryColor: "from-purple-600 to-purple-800",
    badgeRole: "Amical",
    wins: 3,
    losses: 5,
    avgPointsScored: 69.8,
    avgPointsConceded: 76.2,
    recentForm: ["L", "L", "W", "L", "L"],
    homeRecord: "2-2",
    awayRecord: "1-3",
    keyPlayers: ["Capitaine d'expérience", "Meneur organisateur"],
    strengths: ["Jeu posé et tactique", "Fautes provoquées"],
    weaknesses: ["Rythme lent et banc court"],
    pronoAdvice: "Équipe défensive. Match à petit score (autour de 65-72 pts).",
  },
  amiens: {
    id: "amiens",
    name: "Amiens Sporting Club",
    shortName: "Amiens",
    fullName: "Amiens Sporting Club Basket-Ball",
    ffbbCode: "HDF0080004",
    city: "Amiens",
    hall: "Gymnase La Hotoie",
    logoEmoji: "🔴",
    primaryColor: "from-red-600 to-rose-700",
    badgeRole: "Amical",
    wins: 6,
    losses: 2,
    avgPointsScored: 82.1,
    avgPointsConceded: 70.4,
    recentForm: ["W", "W", "W", "L", "W"],
    homeRecord: "4-0",
    awayRecord: "2-2",
    keyPlayers: ["Arrière scoreur 20+ pts", "Pivot intimidateur"],
    strengths: ["Attaque explosive", "Adresse longue distance"],
    weaknesses: ["Rebond défensif sous pression"],
    pronoAdvice: "Gros choc offensif ! Visez un score élevé (80+ pts).",
  },
  hornaing: {
    id: "hornaing",
    name: "Hornaing D2",
    shortName: "Hornaing",
    fullName: "Basket Club Hornaingeois",
    city: "Hornaing",
    hall: "Salle Municipale d'Hornaing",
    logoEmoji: "🏆",
    primaryColor: "from-amber-600 to-yellow-700",
    badgeRole: "Coupe de France",
    wins: 2,
    losses: 4,
    avgPointsScored: 67.4,
    avgPointsConceded: 78.0,
    recentForm: ["L", "W", "L", "L", "L"],
    homeRecord: "1-2",
    awayRecord: "1-2",
    keyPlayers: ["Duo d'arrières rapides"],
    strengths: ["Enthousiasme du public à domicile"],
    weaknesses: ["Nombreuses pertes de balle"],
    pronoAdvice: "Match piège de coupe. BCSN favori si le départ est sérieux.",
  },
  gouvieux: {
    id: "gouvieux",
    name: "Gouvieux Basket Oise",
    shortName: "Gouvieux",
    fullName: "Gouvieux Basket Oise",
    ffbbCode: "HDF0060017",
    city: "Gouvieux",
    hall: "Gymnase de Gouvieux",
    logoEmoji: "🐺",
    primaryColor: "from-blue-700 to-cyan-800",
    badgeRole: "Championnat",
    wins: 7,
    losses: 1,
    avgPointsScored: 81.5,
    avgPointsConceded: 68.9,
    recentForm: ["W", "W", "W", "W", "L"],
    homeRecord: "4-0",
    awayRecord: "3-1",
    keyPlayers: ["Meneur All-Star Régional", "Ailier fort aérien"],
    strengths: ["Défense étouffante", "Jeu rapide sur interception"],
    weaknesses: ["Taux de réussites aux lancers francs"],
    pronoAdvice: "Candidat au titre. Rencontre au sommet très disputée.",
  },
  crepy: {
    id: "crepy",
    name: "Crépy Basket",
    shortName: "Crépy",
    fullName: "Basket Club Crépy-en-Valois",
    city: "Crépy-en-Valois",
    hall: "Salle Marcel Quentin",
    logoEmoji: "🛡️",
    primaryColor: "from-slate-700 to-gray-900",
    badgeRole: "Championnat",
    wins: 4,
    losses: 4,
    avgPointsScored: 74.3,
    avgPointsConceded: 73.8,
    recentForm: ["W", "L", "W", "L", "W"],
    homeRecord: "3-1",
    awayRecord: "1-3",
    keyPlayers: ["Shooteur d'élite", "Intérieur d'expérience"],
    strengths: ["Discipline en attaque placée"],
    weaknesses: ["Difficulté face aux équipes athlétiques"],
    pronoAdvice: "Équipe constante. Avantage à l'équipe évoluant à domicile.",
  },
  stquentin: {
    id: "stquentin",
    name: "St Quentin Basket",
    shortName: "St Quentin",
    fullName: "Saint Quentin Basket Ball",
    city: "Saint-Quentin",
    hall: "Palais des Sports Pierre Ratte",
    logoEmoji: "🔥",
    primaryColor: "from-orange-600 to-red-700",
    badgeRole: "Championnat",
    wins: 5,
    losses: 3,
    avgPointsScored: 78.9,
    avgPointsConceded: 72.5,
    recentForm: ["W", "W", "L", "W", "L"],
    homeRecord: "3-1",
    awayRecord: "2-2",
    keyPlayers: ["Meneur percutant", "Intérieur rebondeur"],
    strengths: ["Agressivité vers le cercle", "Intensité à domicile"],
    weaknesses: ["Gestion des fautes d'équipe"],
    pronoAdvice: "Très solide. Match indécis pouvant basculer en prolongation.",
  },
  margny: {
    id: "margny",
    name: "ASCC Margny",
    shortName: "Margny",
    fullName: "ASCC Margny Basket",
    ffbbCode: "HDF0060011",
    city: "Margny-lès-Compiègne",
    hall: "Gymnase Marcel Guérin",
    logoEmoji: "🦁",
    primaryColor: "from-yellow-500 to-amber-600",
    badgeRole: "Championnat",
    wins: 6,
    losses: 2,
    avgPointsScored: 80.2,
    avgPointsConceded: 71.0,
    recentForm: ["W", "L", "W", "W", "W"],
    homeRecord: "4-0",
    awayRecord: "2-2",
    keyPlayers: ["Duo d'ailiers polyvalents"],
    strengths: ["Jeu collectif fluide", "Bonne circulation de balle"],
    weaknesses: ["Repli défensif parfois lent"],
    pronoAdvice: "Adversaire redoutable. Pronostic serré conseillé.",
  },
  gricourt: {
    id: "gricourt",
    name: "Gricourt Basket",
    shortName: "Gricourt",
    fullName: "Gricourt Basket Ball",
    ffbbCode: "HDF0002010",
    city: "Gricourt",
    hall: "Gymnase Municipal de Gricourt",
    logoEmoji: "🏹",
    primaryColor: "from-teal-600 to-emerald-800",
    badgeRole: "Championnat",
    wins: 3,
    losses: 5,
    avgPointsScored: 71.8,
    avgPointsConceded: 77.4,
    recentForm: ["L", "W", "L", "L", "W"],
    homeRecord: "2-2",
    awayRecord: "1-3",
    keyPlayers: ["Pivot physique", "Meneur bagarreur"],
    strengths: ["Combatif et tenace sur tout le terrain"],
    weaknesses: ["Pourcentage aux tirs extérieurs"],
    pronoAdvice: "Équipe hargneuse mais prenable pour le BCSN.",
  },
};

export function getClubLogoPath(nameStr: string): string | null {
  const name = nameStr.toLowerCase();
  if (name.includes("bcsn") || name.includes("saint nicolas")) return "/logos/bcsn.jpg";
  if (name.includes("longueau")) return "/logos/longueau.jpg";
  if (name.includes("crepy") || name.includes("crépy")) return "/logos/crepy.jpg";
  if (name.includes("gricourt")) return "/logos/Gricourt.jpg";
  if (name.includes("margny")) return "/logos/margny.jpg";
  if (name.includes("gouvieux")) return "/logos/gouvieux.png";
  if (name.includes("hornaing")) return "/logos/hornaing.png";
  if (name.includes("quentin") || name.includes("stquentin")) return "/logos/st-quentin.png";
  return null;
}

export function getClubBySlug(slug: string): ClubProfile {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, club] of Object.entries(CLUBS_DATA)) {
    if (
      key === normalized ||
      club.shortName.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized ||
      club.id === normalized
    ) {
      return club;
    }
  }
  return CLUBS_DATA.bcsn;
}
