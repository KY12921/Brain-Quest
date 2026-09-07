// ------------------------------------------------------------------
// version5 — Translations.
//
// Scope, deliberately: this translates the app's interface (nav bar,
// screen titles, settings labels, auth screen) — not quiz content.
// Translating ~5,130 questions accurately across 5 languages is a
// separate, much larger undertaking; this is the "menus" half of the
// promise the Settings screen already made ("version5's content is
// currently English-only — this sets your display preference for
// menus"). Expanding coverage later just means adding more keys here
// and more data-i18n attributes in index.html — the mechanism itself
// doesn't change.
//
// HOW IT WORKS: any static element that should be translated gets
// data-i18n="some.key" in index.html. applyTranslations() walks every
// such element and sets its text to TRANSLATIONS[lang][key], falling
// back to English if that key or language is missing (so a partial
// translation never shows a blank label). Called on login and
// whenever the language dropdown changes.
// ------------------------------------------------------------------

const TRANSLATIONS = {
  en: {
    "nav.home": "Home", "nav.quests": "Quests", "nav.missions": "Missions",
    "nav.leaderboard": "Leaderboard", "nav.friends": "Friends", "nav.clans": "Clans",
    "nav.battle": "Battle", "nav.trivia": "Trivia", "nav.badges": "Badges",
    "nav.shop": "Shop", "nav.tutor": "AI Tutor", "nav.feedback": "Feedback", "nav.gopro": "Go Pro",
    "auth.signin": "Sign in", "auth.signup": "Create account",
    "title.suspended": "Account Suspended", "title.home": "Home", "title.quests": "Choose your quest",
    "title.missions": "Daily Missions", "title.leaderboard": "Leaderboard", "title.friends": "Friends",
    "title.clans": "Clans", "title.battle": "Battle", "title.teambattle": "Team Battle",
    "title.tutor": "AI Tutor", "title.trivia": "Trivia", "title.badges": "Badges", "title.shop": "Shop",
    "title.photohelp": "Photo Help", "title.studymode": "Study Mode", "title.settings": "Settings",
    "title.admin": "Admin Panel", "title.profile": "Profile", "title.feedback": "Feedback",
    "title.pro": "version5 Pro",
    "settings.friends": "Your Friends", "settings.blocked": "Blocked", "settings.joinclan": "Join a Clan",
    "settings.clanleaderboard": "🏆 Clan Leaderboard", "settings.language": "Language",
    "settings.background": "Background", "settings.music": "Game Music", "settings.gameplay": "Gameplay",
    "settings.changepassword": "Change Password"
  },
  es: {
    "nav.home": "Inicio", "nav.quests": "Aventuras", "nav.missions": "Misiones",
    "nav.leaderboard": "Clasificación", "nav.friends": "Amigos", "nav.clans": "Clanes",
    "nav.battle": "Batalla", "nav.trivia": "Trivia", "nav.badges": "Insignias",
    "nav.shop": "Tienda", "nav.tutor": "Tutor IA", "nav.feedback": "Comentarios", "nav.gopro": "Hazte Pro",
    "auth.signin": "Iniciar sesión", "auth.signup": "Crear cuenta",
    "title.suspended": "Cuenta suspendida", "title.home": "Inicio", "title.quests": "Elige tu aventura",
    "title.missions": "Misiones diarias", "title.leaderboard": "Clasificación", "title.friends": "Amigos",
    "title.clans": "Clanes", "title.battle": "Batalla", "title.teambattle": "Batalla en equipo",
    "title.tutor": "Tutor IA", "title.trivia": "Trivia", "title.badges": "Insignias", "title.shop": "Tienda",
    "title.photohelp": "Ayuda con fotos", "title.studymode": "Modo estudio", "title.settings": "Ajustes",
    "title.admin": "Panel de administración", "title.profile": "Perfil", "title.feedback": "Comentarios",
    "title.pro": "version5 Pro",
    "settings.friends": "Tus amigos", "settings.blocked": "Bloqueados", "settings.joinclan": "Unirse a un clan",
    "settings.clanleaderboard": "🏆 Clasificación de clanes", "settings.language": "Idioma",
    "settings.background": "Fondo", "settings.music": "Música del juego", "settings.gameplay": "Jugabilidad",
    "settings.changepassword": "Cambiar contraseña"
  },
  fr: {
    "nav.home": "Accueil", "nav.quests": "Aventures", "nav.missions": "Missions",
    "nav.leaderboard": "Classement", "nav.friends": "Amis", "nav.clans": "Clans",
    "nav.battle": "Bataille", "nav.trivia": "Quiz", "nav.badges": "Badges",
    "nav.shop": "Boutique", "nav.tutor": "Tuteur IA", "nav.feedback": "Avis", "nav.gopro": "Passer Pro",
    "auth.signin": "Se connecter", "auth.signup": "Créer un compte",
    "title.suspended": "Compte suspendu", "title.home": "Accueil", "title.quests": "Choisis ton aventure",
    "title.missions": "Missions quotidiennes", "title.leaderboard": "Classement", "title.friends": "Amis",
    "title.clans": "Clans", "title.battle": "Bataille", "title.teambattle": "Bataille d'équipe",
    "title.tutor": "Tuteur IA", "title.trivia": "Quiz", "title.badges": "Badges", "title.shop": "Boutique",
    "title.photohelp": "Aide photo", "title.studymode": "Mode étude", "title.settings": "Paramètres",
    "title.admin": "Panneau d'administration", "title.profile": "Profil", "title.feedback": "Avis",
    "title.pro": "version5 Pro",
    "settings.friends": "Tes amis", "settings.blocked": "Bloqués", "settings.joinclan": "Rejoindre un clan",
    "settings.clanleaderboard": "🏆 Classement des clans", "settings.language": "Langue",
    "settings.background": "Arrière-plan", "settings.music": "Musique du jeu", "settings.gameplay": "Jouabilité",
    "settings.changepassword": "Changer le mot de passe"
  },
  de: {
    "nav.home": "Start", "nav.quests": "Abenteuer", "nav.missions": "Aufgaben",
    "nav.leaderboard": "Bestenliste", "nav.friends": "Freunde", "nav.clans": "Clans",
    "nav.battle": "Kampf", "nav.trivia": "Quiz", "nav.badges": "Abzeichen",
    "nav.shop": "Shop", "nav.tutor": "KI-Tutor", "nav.feedback": "Feedback", "nav.gopro": "Pro werden",
    "auth.signin": "Anmelden", "auth.signup": "Konto erstellen",
    "title.suspended": "Konto gesperrt", "title.home": "Start", "title.quests": "Wähle dein Abenteuer",
    "title.missions": "Tägliche Aufgaben", "title.leaderboard": "Bestenliste", "title.friends": "Freunde",
    "title.clans": "Clans", "title.battle": "Kampf", "title.teambattle": "Team-Kampf",
    "title.tutor": "KI-Tutor", "title.trivia": "Quiz", "title.badges": "Abzeichen", "title.shop": "Shop",
    "title.photohelp": "Foto-Hilfe", "title.studymode": "Lernmodus", "title.settings": "Einstellungen",
    "title.admin": "Admin-Bereich", "title.profile": "Profil", "title.feedback": "Feedback",
    "title.pro": "version5 Pro",
    "settings.friends": "Deine Freunde", "settings.blocked": "Blockiert", "settings.joinclan": "Einem Clan beitreten",
    "settings.clanleaderboard": "🏆 Clan-Bestenliste", "settings.language": "Sprache",
    "settings.background": "Hintergrund", "settings.music": "Spielmusik", "settings.gameplay": "Spielweise",
    "settings.changepassword": "Passwort ändern"
  },
  pt: {
    "nav.home": "Início", "nav.quests": "Aventuras", "nav.missions": "Missões",
    "nav.leaderboard": "Classificação", "nav.friends": "Amigos", "nav.clans": "Clãs",
    "nav.battle": "Batalha", "nav.trivia": "Trivia", "nav.badges": "Emblemas",
    "nav.shop": "Loja", "nav.tutor": "Tutor de IA", "nav.feedback": "Feedback", "nav.gopro": "Seja Pro",
    "auth.signin": "Entrar", "auth.signup": "Criar conta",
    "title.suspended": "Conta suspensa", "title.home": "Início", "title.quests": "Escolha sua aventura",
    "title.missions": "Missões diárias", "title.leaderboard": "Classificação", "title.friends": "Amigos",
    "title.clans": "Clãs", "title.battle": "Batalha", "title.teambattle": "Batalha em equipe",
    "title.tutor": "Tutor de IA", "title.trivia": "Trivia", "title.badges": "Emblemas", "title.shop": "Loja",
    "title.photohelp": "Ajuda por foto", "title.studymode": "Modo de estudo", "title.settings": "Configurações",
    "title.admin": "Painel de administração", "title.profile": "Perfil", "title.feedback": "Feedback",
    "title.pro": "version5 Pro",
    "settings.friends": "Seus amigos", "settings.blocked": "Bloqueados", "settings.joinclan": "Entrar em um clã",
    "settings.clanleaderboard": "🏆 Classificação de clãs", "settings.language": "Idioma",
    "settings.background": "Plano de fundo", "settings.music": "Música do jogo", "settings.gameplay": "Jogabilidade",
    "settings.changepassword": "Alterar senha"
  },
  zh: {
    "nav.home": "首页", "nav.quests": "冒险", "nav.missions": "任务",
    "nav.leaderboard": "排行榜", "nav.friends": "好友", "nav.clans": "部落",
    "nav.battle": "对战", "nav.trivia": "问答", "nav.badges": "徽章",
    "nav.shop": "商店", "nav.tutor": "AI导师", "nav.feedback": "反馈", "nav.gopro": "升级Pro",
    "auth.signin": "登录", "auth.signup": "创建账户",
    "title.suspended": "账户已暂停", "title.home": "首页", "title.quests": "选择你的冒险",
    "title.missions": "每日任务", "title.leaderboard": "排行榜", "title.friends": "好友",
    "title.clans": "部落", "title.battle": "对战", "title.teambattle": "团队对战",
    "title.tutor": "AI导师", "title.trivia": "问答", "title.badges": "徽章", "title.shop": "商店",
    "title.photohelp": "拍照求助", "title.studymode": "学习模式", "title.settings": "设置",
    "title.admin": "管理面板", "title.profile": "个人资料", "title.feedback": "反馈",
    "title.pro": "version5 Pro",
    "settings.friends": "我的好友", "settings.blocked": "已屏蔽", "settings.joinclan": "加入部落",
    "settings.clanleaderboard": "🏆 部落排行榜", "settings.language": "语言",
    "settings.background": "背景", "settings.music": "游戏音乐", "settings.gameplay": "游戏玩法",
    "settings.changepassword": "修改密码"
  }
};

function getCurrentLanguage() {
  return (typeof currentUserData !== "undefined" && currentUserData && currentUserData.language) || "en";
}

function t(key) {
  const lang = getCurrentLanguage();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}
