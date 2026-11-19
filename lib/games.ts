import type { T } from "@/lib/i18n"

export type GameId =
  | "snake"
  | "2048"
  | "tictactoe"
  | "memory"
  | "reaction"
  | "breakout"
  | "minesweeper"
  | "typing"
  | "simon"
  | "puzzle"
  | "connect4"
  | "duo-tictactoe"
  | "rps"
  | "quiz"
  | "duo-reaction"
export type GameCategory = "arcade" | "puzzle" | "strategy" | "speed" | "duo"

export interface GameMeta {
  id: GameId
  category: GameCategory
  title: T
  tagline: T
  description: T
  objective: T
  howToPlay: T[]
  tip: T
  shortcuts: string[]
  controls: T
  scoreKey: string
  scoreUnit?: "pts" | "ms" | "moves" | "wins" | "wpm" | "s"
  lowerIsBetter?: boolean
}

export const gameCategoryLabels: Record<GameCategory, T> = {
  arcade: { fr: "Arcade", en: "Arcade", de: "Arcade", zh: "街机" },
  puzzle: { fr: "Puzzle", en: "Puzzle", de: "Puzzle", zh: "益智" },
  strategy: { fr: "Stratégie", en: "Strategy", de: "Strategie", zh: "策略" },
  speed: { fr: "Rapidité", en: "Speed", de: "Tempo", zh: "反应" },
  duo: { fr: "Duo 1v1", en: "Online Duo", de: "Online-Duo", zh: "双人对战" },
}

export const gamesList: GameMeta[] = [
  {
    id: "snake",
    category: "arcade",
    title: {
      fr: "Snake",
      en: "Snake",
      de: "Snake",
      zh: "贪吃蛇",
    },
    tagline: {
      fr: "Classique revisité",
      en: "Reimagined classic",
      de: "Klassiker neu gedacht",
      zh: "经典重制",
    },
    description: {
      fr: "Guidez le serpent sur la grille pour avaler un maximum de cibles orange sans jamais percuter un mur ni votre propre corps.",
      en: "Guide the snake across the grid to eat as many orange targets as possible without hitting a wall or your own body.",
      de: "Steuere die Schlange über das Raster, um möglichst viele orange Ziele zu fressen, ohne eine Wand oder dich selbst zu treffen.",
      zh: "控制贪吃蛇在网格中吃掉尽可能多的橙色目标，避免撞墙或撞到自己的身体。",
    },
    objective: {
      fr: "Allonger le serpent le plus possible et battre votre record personnel.",
      en: "Grow the snake as long as possible and beat your personal best.",
      de: "Lass die Schlange so lang wie möglich wachsen und schlage deinen Rekord.",
      zh: "让贪吃蛇尽可能变长并打破你的个人最高分。",
    },
    howToPlay: [
      {
        fr: "Cliquez sur Démarrer puis dirigez le serpent avec les flèches, WASD ou en glissant le doigt sur la grille.",
        en: "Click Start and steer the snake with Arrow keys, WASD, or by swiping on the grid.",
        de: "Klicke auf Starten und steuere mit Pfeiltasten, WASD oder per Wischen.",
        zh: "点击开始，使用方向键、WASD 或在棋盘上滑动来控制方向。",
      },
      {
        fr: "Chaque cible mangée ajoute +1 point, fait grandir le serpent et accélère progressivement la cadence.",
        en: "Each target eaten adds +1 point, grows the snake, and gradually increases the speed.",
        de: "Jedes Ziel bringt +1 Punkt, verlängert die Schlange und erhöht das Tempo.",
        zh: "每吃掉一个目标得 1 分，蛇身变长且移动速度逐渐加快。",
      },
      {
        fr: "Évitez les bords de l'arène et votre propre queue : la moindre collision met fin à la partie.",
        en: "Avoid the arena walls and your own tail — any collision ends the run.",
        de: "Meide die Ränder und deinen eigenen Körper — jede Kollision beendet das Spiel.",
        zh: "避开边界和蛇身，任何碰撞都会导致游戏结束。",
      },
      {
        fr: "Appuyez sur Espace à tout moment pour mettre la partie en pause ou la reprendre.",
        en: "Press Space anytime to pause or resume the game.",
        de: "Drücke jederzeit die Leertaste zum Pausieren oder Fortsetzen.",
        zh: "随时按空格键暂停或继续游戏。",
      },
    ],
    tip: {
      fr: "Longez les bords et gardez toujours une voie de sortie libre plutôt que de couper le terrain en deux.",
      en: "Hug the edges and always keep an escape lane open instead of splitting the board in half.",
      de: "Halte dich an den Rändern und lass immer einen Fluchtweg frei.",
      zh: "尽量沿边缘移动，始终留出逃生路线，不要把场地一分为二。",
    },
    shortcuts: ["↑ ↓ ← →", "W A S D", "Espace", "Swipe"],
    controls: {
      fr: "Flèches / WASD · Swipe · Espace (pause)",
      en: "Arrows / WASD · Swipe · Space (pause)",
      de: "Pfeile / WASD · Wischen · Leertaste (Pause)",
      zh: "方向键 / WASD · 滑动 · 空格暂停",
    },
    scoreKey: "fj_game_best_snake",
    scoreUnit: "pts",
  },
  {
    id: "2048",
    category: "puzzle",
    title: {
      fr: "2048",
      en: "2048",
      de: "2048",
      zh: "2048",
    },
    tagline: {
      fr: "Fusion de tuiles",
      en: "Tile fusion",
      de: "Kachel-Fusion",
      zh: "数字合并",
    },
    description: {
      fr: "Un casse-tête mathématique addictif sur une grille 4×4 où chaque mouvement déplace toutes les tuiles simultanément.",
      en: "An addictive 4×4 math puzzle where every move slides all tiles on the board at once.",
      de: "Ein fesselndes 4×4-Zahlenpuzzle, bei dem jeder Zug alle Kacheln gleichzeitig verschiebt.",
      zh: "经典的 4×4 数字益智游戏，每次滑动都会同时移动棋盘上的所有方块。",
    },
    objective: {
      fr: "Fusionner les puissances de 2 jusqu'à créer la tuile 2048 — puis continuer pour viser le plus gros score.",
      en: "Merge powers of 2 until you build the 2048 tile — then keep going for a massive score.",
      de: "Verschmelze Zweierpotenzen bis zur 2048-Kachel — und spiele danach weiter für den Highscore.",
      zh: "合并 2 的幂次方直到合成 2048 方块，之后还可以继续挑战更高分。",
    },
    howToPlay: [
      {
        fr: "Utilisez les flèches, WASD ou glissez sur la grille pour faire glisser toutes les tuiles dans une direction.",
        en: "Use Arrow keys, WASD, or swipe on the board to slide all tiles in one direction.",
        de: "Nutze Pfeiltasten, WASD oder Wischen, um alle Kacheln in eine Richtung zu schieben.",
        zh: "使用方向键、WASD 或滑动屏幕，让所有方块朝一个方向移动。",
      },
      {
        fr: "Lorsque deux tuiles de même valeur se rencontrent, elles fusionnent en une seule tuile de valeur double (2+2 → 4, 64+64 → 128).",
        en: "When two tiles with the same value collide, they merge into one tile with double the value (2+2 → 4, 64+64 → 128).",
        de: "Treffen zwei gleiche Kacheln aufeinander, verschmelzen sie zum doppelten Wert (2+2 → 4).",
        zh: "两个相同数字的方块碰撞时会合并为两倍数值（如 2+2 → 4，64+64 → 128）。",
      },
      {
        fr: "À chaque coup valide, une nouvelle tuile (2 ou 4) apparaît dans une case vide.",
        en: "After every valid move, a new tile (2 or 4) spawns in an empty cell.",
        de: "Nach jedem gültigen Zug erscheint eine neue Kachel (2 oder 4) auf einem freien Feld.",
        zh: "每次有效移动后，空格中会随机生成一个新的 2 或 4。",
      },
      {
        fr: "Le bouton Annuler (↩) permet de revenir en arrière d'un coup en cas d'erreur.",
        en: "Use the Undo button (↩) to step back one move if you make a mistake.",
        de: "Mit dem Zurück-Button (↩) kannst du einen Zug rückgängig machen.",
        zh: "如果走错了，可以点击撤销按钮（↩）退回一步。",
      },
    ],
    tip: {
      fr: "Gardez toujours votre plus grosse tuile bloquée dans un coin et empilez les valeurs décroissantes sur le même bord.",
      en: "Keep your highest tile anchored in one corner and stack descending values along that edge.",
      de: "Halte deine höchste Kachel immer in einer Ecke und ordne kleinere Werte daneben an.",
      zh: "始终把最大的方块固定在一个角落，并沿该边按从大到小排列。",
    },
    shortcuts: ["↑ ↓ ← →", "W A S D", "Swipe", "↩ Annuler"],
    controls: {
      fr: "Flèches / WASD · Swipe · Annuler",
      en: "Arrows / WASD · Swipe · Undo",
      de: "Pfeile / WASD · Wischen · Zurück",
      zh: "方向键 / WASD · 滑动 · 撤销",
    },
    scoreKey: "fj_game_best_2048",
    scoreUnit: "pts",
  },
  {
    id: "tictactoe",
    category: "strategy",
    title: {
      fr: "Morpion IA",
      en: "Tic-Tac-Toe AI",
      de: "Tic-Tac-Toe KI",
      zh: "井字棋 AI",
    },
    tagline: {
      fr: "Minimax & 2 joueurs",
      en: "Minimax & 2 players",
      de: "Minimax & 2 Spieler",
      zh: "极小化极大算法",
    },
    description: {
      fr: "Le célèbre jeu de stratégie en 3×3 revisité avec une IA calculant chaque coup optimal grâce à l'algorithme Minimax.",
      en: "The classic 3×3 strategy game powered by an AI that computes optimal moves using the Minimax algorithm.",
      de: "Das klassische 3×3-Strategiespiel mit einer KI, die optimale Züge per Minimax-Algorithmus berechnet.",
      zh: "经典 3×3 策略对战，内置基于极小化极大（Minimax）算法的最优决策 AI。",
    },
    objective: {
      fr: "Aligner 3 symboles identiques horizontalement, verticalement ou en diagonale avant votre adversaire.",
      en: "Align 3 matching symbols horizontally, vertically, or diagonally before your opponent.",
      de: "Bringe 3 gleiche Symbole waagerecht, senkrecht oder diagonal in eine Reihe.",
      zh: "抢先在横、竖或斜线上连成 3 个相同的符号。",
    },
    howToPlay: [
      {
        fr: "Choisissez votre mode : IA Impossible (Minimax parfait), IA Normale (quelques ouvertures) ou 2 Joueurs en local.",
        en: "Pick a mode: Unbeatable AI (perfect Minimax), Normal AI (leaves openings), or local 2 Players.",
        de: "Wähle einen Modus: Unschlagbare KI (Minimax), Normale KI oder 2 Spieler lokal.",
        zh: "选择模式：无敌 AI（完美 Minimax）、普通 AI 或双人本地对战。",
      },
      {
        fr: "Vous jouez les X et commencez la partie en cliquant sur la case de votre choix.",
        en: "You play as X and go first by clicking any open square.",
        de: "Du spielst als X und beginnst mit einem Klick auf ein freies Feld.",
        zh: "你执 X 先手，点击任意空格落子。",
      },
      {
        fr: "En mode IA, vos victoires cumulées sont automatiquement enregistrées dans votre record.",
        en: "In AI modes, your cumulative wins are automatically saved to your personal record.",
        de: "Im KI-Modus werden deine Siege automatisch als Rekord gespeichert.",
        zh: "在 AI 模式下，你的累计胜场会自动保存至个人记录。",
      },
    ],
    tip: {
      fr: "En mode IA Impossible, la victoire est mathématiquement impossible — le vrai défi est de ne jamais perdre et de forcer le match nul !",
      en: "In Unbeatable mode, winning is mathematically impossible — the real challenge is never losing and forcing a draw!",
      de: "Im Modus Unschlagbare KI ist ein Sieg unmöglich — die Kunst ist es, immer ein Unentschieden zu erzwingen!",
      zh: "在无敌 AI 模式下获胜在数学上是不可能的——真正的挑战是稳守不败、逼平 AI！",
    },
    shortcuts: ["Clic", "Toucher"],
    controls: {
      fr: "Clic / Toucher",
      en: "Click / Tap",
      de: "Klicken / Tippen",
      zh: "点击 / 触控",
    },
    scoreKey: "fj_game_best_tictactoe",
    scoreUnit: "wins",
  },
  {
    id: "memory",
    category: "puzzle",
    title: {
      fr: "Memory Dev",
      en: "Dev Memory",
      de: "Dev Memory",
      zh: "开发者记忆翻牌",
    },
    tagline: {
      fr: "Paires d'icônes tech",
      en: "Tech icon pairs",
      de: "Tech-Icon-Paare",
      zh: "技术图标配对",
    },
    description: {
      fr: "Un jeu de mémoire visuelle illustré par des icônes de développement (Code, CLI, AI, SQL, Git, Web, UI, Sec).",
      en: "A visual memory game featuring developer icons (Code, CLI, AI, SQL, Git, Web, UI, Sec).",
      de: "Ein visuelles Gedächtnisspiel mit Entwickler-Symbolen (Code, CLI, AI, SQL, Git, Web, UI, Sec).",
      zh: "以开发者图标（Code、CLI、AI、SQL、Git、Web、UI、Sec）为主题的视觉记忆配对游戏。",
    },
    objective: {
      fr: "Découvrir toutes les paires identiques en réalisant le moins de coups possible.",
      en: "Uncover every matching pair in the fewest possible moves.",
      de: "Decke alle passenden Paare mit so wenigen Zügen wie möglich auf.",
      zh: "用尽可能少的步数翻出所有成对的图标。",
    },
    howToPlay: [
      {
        fr: "Sélectionnez votre format de grille : 4×3 (6 paires) pour un échauffement ou 4×4 (8 paires) pour le défi standard.",
        en: "Choose your board size: 4×3 (6 pairs) for a warm-up or 4×4 (8 pairs) for the standard challenge.",
        de: "Wähle die Größe: 4×3 (6 Paare) zum Aufwärmen oder 4×4 (8 Paare) als Standard-Challenge.",
        zh: "选择棋盘规格：4×3（6 对）适合热身，4×4（8 对）为标准挑战。",
      },
      {
        fr: "Cliquez sur deux cartes pour les retourner. Le chronomètre démarre dès la première carte retournée.",
        en: "Click two cards to flip them over. The timer starts on your very first flip.",
        de: "Klicke zwei Karten an, um sie umzudrehen. Die Zeit startet beim ersten Zug.",
        zh: "点击两张卡片将其翻开，翻开第一张牌时计时器自动启动。",
      },
      {
        fr: "Si les deux icônes correspondent, la paire reste verrouillée ; sinon, les cartes se retournent face cachée.",
        en: "If both icons match, the pair stays open; otherwise they flip back face down.",
        de: "Stimmen die Symbole überein, bleibt das Paar offen; sonst drehen sie sich zurück.",
        zh: "如果图标相同则保持翻开，否则稍后会自动翻回背面。",
      },
    ],
    tip: {
      fr: "Parcourez les cartes dans l'ordre (ligne par ligne) au début pour mémoriser rapidement les emplacements clés.",
      en: "Scan cards systematically row by row at the start so you remember key positions faster.",
      de: "Öffne die Karten anfangs Reihe für Reihe, um dir Positionen leichter zu merken.",
      zh: "开局时按行依次翻牌，能更快记住各个关键图标的位置。",
    },
    shortcuts: ["Clic", "Toucher"],
    controls: {
      fr: "Clic / Toucher",
      en: "Click / Tap",
      de: "Klicken / Tippen",
      zh: "点击 / 触控",
    },
    scoreKey: "fj_game_best_memory",
    scoreUnit: "moves",
    lowerIsBetter: true,
  },
  {
    id: "reaction",
    category: "speed",
    title: {
      fr: "Réflexe",
      en: "Reflex",
      de: "Reflex",
      zh: "反应测试",
    },
    tagline: {
      fr: "Temps de réaction en ms",
      en: "Reaction time in ms",
      de: "Reaktionszeit in ms",
      zh: "毫秒级反应",
    },
    description: {
      fr: "Un chronomètre de précision à la milliseconde pour mesurer votre vitesse de réaction visuelle face à un signal imprévisible.",
      en: "A millisecond-precision timer that measures your visual reaction speed against an unpredictable signal.",
      de: "Eine Millisekunden-Stoppuhr, die deine visuelle Reaktionsgeschwindigkeit auf ein unvorhersehbares Signal misst.",
      zh: "毫秒级精度计时器，测试你面对随机视觉信号时的反应速度。",
    },
    objective: {
      fr: "Descendre sous la barre des 200 ms et obtenir la meilleure moyenne possible sur 5 essais consécutifs.",
      en: "Break under 200 ms and achieve the lowest possible average across 5 consecutive attempts.",
      de: "Unter 200 ms bleiben und den besten Schnitt über 5 aufeinanderfolgende Versuche erzielen.",
      zh: "突破 200 毫秒大关，并在连续 5 次测试中取得最低平均时间。",
    },
    howToPlay: [
      {
        fr: "Cliquez sur la zone de test (ou appuyez sur Espace) pour lancer un essai.",
        en: "Click the test pad (or press Space) to begin a round.",
        de: "Klicke auf das Testfeld (oder drücke die Leertaste), um zu starten.",
        zh: "点击测试区域（或按空格键）开始一轮测试。",
      },
      {
        fr: "Pendant la phase orange, restez concentré et ne cliquez pas encore : le délai est aléatoire.",
        en: "During the amber phase, stay focused and don't click yet — the delay is randomized.",
        de: "Bleibe in der orangen Phase konzentriert und klicke noch nicht — die Wartezeit ist zufällig.",
        zh: "在橙色等待阶段保持专注，不要提前点击——等待时间是随机的。",
      },
      {
        fr: "Dès que la zone passe au bleu cobalt, cliquez ou appuyez sur Espace le plus vite possible.",
        en: "The instant the pad turns cobalt blue, click or press Space as fast as you can.",
        de: "Sobald das Feld kobaltblau wird, klicke oder drücke so schnell wie möglich die Leertaste.",
        zh: "当区域变为钴蓝色的瞬间，立即点击或按空格键。",
      },
    ],
    tip: {
      fr: "Sur ordinateur, utiliser la barre Espace élimine le léger délai mécanique d'un clic de souris.",
      en: "On desktop, pressing Space can shave a few milliseconds off compared to clicking a mouse button.",
      de: "Am Desktop spart die Leertaste oft ein paar Millisekunden gegenüber dem Mausklick.",
      zh: "在电脑上使用空格键通常比鼠标点击能快上几毫秒。",
    },
    shortcuts: ["Clic", "Toucher", "Espace"],
    controls: {
      fr: "Clic / Toucher / Espace",
      en: "Click / Tap / Space",
      de: "Klicken / Tippen / Leertaste",
      zh: "点击 / 触控 / 空格键",
    },
    scoreKey: "fj_game_best_reaction",
    scoreUnit: "ms",
    lowerIsBetter: true,
  },
  {
    id: "breakout",
    category: "arcade",
    title: {
      fr: "Casse-Briques",
      en: "Breakout",
      de: "Breakout",
      zh: "打砖块",
    },
    tagline: {
      fr: "Arcade rétro & rebonds",
      en: "Retro arcade & rebounds",
      de: "Retro-Arcade & Abpraller",
      zh: "经典弹球打砖块",
    },
    description: {
      fr: "Contrôlez la raquette pour faire rebondir la balle et détruire tous les murs de briques niveau après niveau.",
      en: "Control the paddle to bounce the ball and shatter every wall of bricks level after level.",
      de: "Steuere das Paddle, lasse den Ball abprallen und zerstöre alle Ziegelreihen Level für Level.",
      zh: "控制挡板反弹小球，逐关击碎所有砖块墙。",
    },
    objective: {
      fr: "Vider toutes les briques de chaque niveau sans perdre vos 3 vies et accumuler le meilleur score.",
      en: "Clear all bricks in each level without losing your 3 lives and rack up the highest score.",
      de: "Räume alle Steine ab, ohne deine 3 Leben zu verlieren, und erreiche den höchsten Punktestand.",
      zh: "在失去 3 条生命前清除所有砖块并冲击最高分。",
    },
    howToPlay: [
      {
        fr: "Déplacez la raquette à la souris, au doigt (sur mobile) ou avec les touches Flèches Gauche/Droite (A/D).",
        en: "Move the paddle with your mouse, finger (on mobile), or Left/Right arrow keys (A/D).",
        de: "Bewege das Paddle per Maus, Finger oder Pfeiltasten Links/Rechts (A/D).",
        zh: "使用鼠标、手指滑动或左右方向键（A/D）移动挡板。",
      },
      {
        fr: "Plus la balle touche le bord de la raquette, plus son angle de rebond est prononcé.",
        en: "The closer the ball hits the edge of the paddle, the sharper its rebound angle.",
        de: "Je weiter außen der Ball das Paddle trifft, desto steiler wird der Abprallwinkel.",
        zh: "小球击中挡板边缘越靠外，反弹角度越大。",
      },
      {
        fr: "Les rangées supérieures rapportent plus de points. Compléter un tableau passe au niveau suivant plus rapide.",
        en: "Higher rows award more points. Clearing a board advances to a faster next level.",
        de: "Obere Reihen geben mehr Punkte. Ein geleertes Feld startet das nächste, schnellere Level.",
        zh: "越靠上的砖块分值越高，清空后自动进入更快的新关卡。",
      },
    ],
    tip: {
      fr: "Essayez de creuser un tunnel sur un côté pour envoyer la balle au-dessus des briques et enchaîner les combos automatiques.",
      en: "Try carving a tunnel up one side to trap the ball above the bricks for automatic combos.",
      de: "Grabe einen Tunnel an der Seite, damit der Ball über den Steinen automatisch abräumt.",
      zh: "尝试从一侧打通缺口，让小球进入砖块上方自动连续消块。",
    },
    shortcuts: ["Souris / Toucher", "← →", "A / D", "Espace"],
    controls: {
      fr: "Souris / Toucher · Flèches ← → · Espace (pause)",
      en: "Mouse / Touch · Arrows ← → · Space (pause)",
      de: "Maus / Touch · Pfeile ← → · Leertaste (Pause)",
      zh: "鼠标 / 触控 · 方向键 ← → · 空格暂停",
    },
    scoreKey: "fj_game_best_breakout",
    scoreUnit: "pts",
  },
  {
    id: "minesweeper",
    category: "strategy",
    title: {
      fr: "Démineur",
      en: "Minesweeper",
      de: "Minesweeper",
      zh: "扫雷",
    },
    tagline: {
      fr: "Déduction 9×9 · 10 mines",
      en: "9×9 deduction · 10 mines",
      de: "9×9 Logik · 10 Minen",
      zh: "9×9 逻辑推理 · 10 颗雷",
    },
    description: {
      fr: "Le grand classique de logique : révélez toutes les cases sûres en déduisant l'emplacement exact des 10 mines grâce aux chiffres.",
      en: "The timeless logic classic: reveal every safe cell by deducing the exact position of all 10 mines from the numbers.",
      de: "Der zeitlose Logik-Klassiker: Decke alle sicheren Felder auf und markiere alle 10 Minen anhand der Zahlen.",
      zh: "经典逻辑推理游戏：根据数字提示推理出 10 颗地雷的位置，翻开所有安全格。",
    },
    objective: {
      fr: "Déminer entièrement la grille 9×9 le plus rapidement possible (meilleur temps en secondes).",
      en: "Clear the entire 9×9 board as fast as possible (best time in seconds).",
      de: "Räume das 9×9-Feld so schnell wie möglich ab (Bestzeit in Sekunden).",
      zh: "以最快速度清空整个 9×9 雷区（最佳用时以秒计）。",
    },
    howToPlay: [
      {
        fr: "Cliquez sur n'importe quelle case pour commencer : le premier clic est toujours garanti sans mine.",
        en: "Click any cell to begin — your very first click is always guaranteed safe.",
        de: "Klicke auf ein beliebiges Feld — der erste Klick ist immer garantiert sicher.",
        zh: "点击任意格子开始，第一步永远保证安全。",
      },
      {
        fr: "Chaque chiffre indique combien de mines se cachent parmi les 8 cases adjacentes.",
        en: "Each number tells you how many mines are hidden in the 8 surrounding squares.",
        de: "Jede Zahl zeigt an, wie viele Minen in den 8 Nachbarfeldern liegen.",
        zh: "每个数字代表其周围 8 个格子中隐藏的地雷数量。",
      },
      {
        fr: "Faites un clic droit (ou activez le mode Drapeau 🚩 sur mobile) pour marquer les mines suspectées.",
        en: "Right-click (or toggle Flag mode 🚩 on mobile) to mark suspected mines.",
        de: "Rechtsklicke (oder aktiviere den Flaggen-Modus 🚩) zum Markieren vermuteter Minen.",
        zh: "右键点击（或在手机上开启插旗模式 🚩）标记疑似地雷。",
      },
    ],
    tip: {
      fr: "Quand un 1 n'a plus qu'une seule case couverte autour de lui, c'est forcément une mine — marquez-la vite !",
      en: "When a 1 only touches a single covered square, that square is guaranteed to be a mine — flag it!",
      de: "Berührt eine 1 nur noch ein verdecktes Feld, liegt dort garantiert eine Mine!",
      zh: "当数字 1 周围只剩一个未翻开的格子时，那里一定是地雷！",
    },
    shortcuts: ["Clic gauche (révéler)", "Clic droit / 🚩 (drapeau)"],
    controls: {
      fr: "Clic gauche (révéler) · Clic droit ou 🚩 (drapeau)",
      en: "Left click (reveal) · Right click or 🚩 (flag)",
      de: "Linksklick (aufdecken) · Rechtsklick / 🚩 (Flagge)",
      zh: "左键翻开 · 右键或 🚩 标记地雷",
    },
    scoreKey: "fj_game_best_minesweeper",
    scoreUnit: "s",
    lowerIsBetter: true,
  },
  {
    id: "typing",
    category: "speed",
    title: {
      fr: "Dactylo Dev",
      en: "Dev Typing",
      de: "Dev-Tippen",
      zh: "极速打字 Dev",
    },
    tagline: {
      fr: "Vitesse de frappe (MPM)",
      en: "Typing speed (WPM)",
      de: "Tippgeschwindigkeit (WPM)",
      zh: "编程词汇打字测试",
    },
    description: {
      fr: "Testez votre vitesse de frappe pendant 30 secondes sur un flux de mots clés tech, frameworks et expressions de développeur.",
      en: "Test your typing speed for 30 seconds on a stream of tech keywords, frameworks, and developer terms.",
      de: "Teste 30 Sekunden lang deine Tippgeschwindigkeit mit Tech-Begriffen und Frameworks.",
      zh: "在 30 秒内输入技术关键词与开发术语，测试你的打字速度（WPM）与准确率。",
    },
    objective: {
      fr: "Atteindre le plus grand nombre de mots par minute (MPM) tout en gardant une précision maximale.",
      en: "Reach the highest Words Per Minute (WPM) while maintaining high accuracy.",
      de: "Erreiche möglichst viele Wörter pro Minute (WPM) bei hoher Genauigkeit.",
      zh: "在保持高准确率的同时冲刺最高每分钟字数（WPM）。",
    },
    howToPlay: [
      {
        fr: "Commencez simplement à taper dans la zone dédiée : le compte à rebours de 30 secondes démarre dès la première lettre.",
        en: "Simply start typing in the input box — the 30-second countdown starts on your first keystroke.",
        de: "Tippe einfach los — der 30-Sekunden-Countdown startet beim ersten Tastenanschlag.",
        zh: "直接在输入框中开始打字，按下第一个字符时 30 秒倒计时自动启动。",
      },
      {
        fr: "Les caractères corrects s'allument en vert/bleu, les fautes de frappe apparaissent en rouge.",
        en: "Correct characters highlight cleanly while typos appear in red.",
        de: "Korrekte Zeichen werden hervorgehoben, Tippfehler erscheinen rot.",
        zh: "正确字符高亮显示，拼写错误会以红色提示。",
      },
      {
        fr: "À la fin des 30 secondes, votre score MPM (WPM) et votre précision sont calculés et envoyés au classement.",
        en: "When time runs out, your WPM score and accuracy are calculated and posted to the leaderboard.",
        de: "Nach Ablauf der Zeit werden deine WPM und Genauigkeit berechnet und gespeichert.",
        zh: "时间结束时自动结算你的 WPM 成绩与准确率并计入排行榜。",
      },
    ],
    tip: {
      fr: "Privilégiez la régularité et la précision : corriger une erreur coûte souvent plus de temps que de taper légèrement plus posément.",
      en: "Prioritize rhythm and accuracy — backspacing mistakes costs more time than typing steadily.",
      de: "Rhythmus und Genauigkeit schlagen Hektik — Korrekturen kosten am meisten Zeit.",
      zh: "保持节奏和准确率比盲目求快更重要，退格改错最浪费时间。",
    },
    shortcuts: ["Clavier", "Tab / Rejouer"],
    controls: {
      fr: "Clavier · Chrono 30 secondes",
      en: "Keyboard · 30-second timer",
      de: "Tastatur · 30-Sekunden-Timer",
      zh: "键盘输入 · 30 秒限时",
    },
    scoreKey: "fj_game_best_typing",
    scoreUnit: "wpm",
  },
  {
    id: "simon",
    category: "puzzle",
    title: {
      fr: "Simon",
      en: "Simon",
      de: "Simon",
      zh: "西蒙记忆",
    },
    tagline: {
      fr: "Séquence lumineuse & sonore",
      en: "Light & sound sequence",
      de: "Licht- & Tonsequenz",
      zh: "声光序列记忆",
    },
    description: {
      fr: "Observez et écoutez la séquence qui s'illumine sur les 4 pavés, puis reproduisez-la dans l'ordre exact. Chaque niveau ajoute une note.",
      en: "Watch and listen to the sequence lighting up on the 4 pads, then repeat it in exact order. Every level adds one more step.",
      de: "Beobachte die Licht- und Tonfolge auf den 4 Feldern und wiederhole sie exakt. Jedes Level fügt einen Schritt hinzu.",
      zh: "观察并聆听 4 个色块的声光序列，然后按准确顺序复现。每一关都会增加一步。",
    },
    objective: {
      fr: "Mémoriser la plus longue séquence possible sans faire une seule erreur.",
      en: "Memorize the longest possible sequence without a single mistake.",
      de: "Merke dir die längstmögliche Sequenz ohne einen einzigen Fehler.",
      zh: "零失误记住尽可能长的声光序列。",
    },
    howToPlay: [
      {
        fr: "Cliquez sur Démarrer et regardez attentivement l'ordre dans lequel les 4 pavés s'illuminent.",
        en: "Click Start and carefully watch the order in which the 4 pads light up.",
        de: "Klicke auf Starten und merke dir die Reihenfolge der aufleuchtenden Felder.",
        zh: "点击开始，仔细记住 4 个色块依次亮起的顺序。",
      },
      {
        fr: "Quand c'est votre tour, cliquez sur les pavés (ou utilisez les touches 1, 2, 3, 4) dans le même ordre.",
        en: "When it's your turn, click the pads (or press keys 1, 2, 3, 4) in the exact same order.",
        de: "Klicke danach die Felder (oder Tasten 1–4) in exakt derselben Reihenfolge an.",
        zh: "轮到你时，按相同顺序点击色块（或按键盘 1、2、3、4）。",
      },
      {
        fr: "Vous pouvez activer ou couper les notes sonores à tout moment via l'icône haut-parleur.",
        en: "You can toggle the synthesized musical notes anytime using the speaker icon.",
        de: "Über das Lautsprecher-Symbol kannst du die Töne jederzeit ein- oder ausschalten.",
        zh: "随时可通过喇叭图标开启或关闭合成音效。",
      },
    ],
    tip: {
      fr: "Laissez le son activé et regroupez les couleurs par blocs de 3 ou 4 dans votre tête comme une petite mélodie.",
      en: "Keep sound on and chunk the pattern into groups of 3 or 4 like a short melody.",
      de: "Lass den Ton an und merke dir die Folge in 3er- oder 4er-Blöcken wie eine Melodie.",
      zh: "开启音效，把序列按 3 到 4 个一组当成旋律来记忆效果最好。",
    },
    shortcuts: ["Clic / Toucher", "Touches 1 2 3 4"],
    controls: {
      fr: "Clic / Toucher · Touches 1–4",
      en: "Click / Tap · Keys 1–4",
      de: "Klicken / Tippen · Tasten 1–4",
      zh: "点击 / 触控 · 数字键 1–4",
    },
    scoreKey: "fj_game_best_simon",
    scoreUnit: "pts",
  },
  {
    id: "puzzle",
    category: "puzzle",
    title: {
      fr: "Puzzle Photo",
      en: "Photo Puzzle",
      de: "Foto-Puzzle",
      zh: "自定义拼图",
    },
    tagline: {
      fr: "Importez votre propre photo",
      en: "Import your own photo",
      de: "Eigenes Foto importieren",
      zh: "导入照片滑动拼图",
    },
    description: {
      fr: "Transformez n'importe quelle photo de votre téléphone ou ordinateur en jeu de taquin (3×3, 4×4 ou 5×5) — ou jouez avec nos thèmes intégrés.",
      en: "Turn any photo from your phone or computer into a sliding puzzle (3×3, 4×4, or 5×5) — or play with built-in art themes.",
      de: "Verwandle jedes eigene Foto in ein Schiebepuzzle (3×3, 4×4 oder 5×5) — oder nutze die integrierten Motive.",
      zh: "将手机或电脑中的任意照片变成 3×3、4×4 或 5×5 滑动拼图，也可直接使用内置主题。",
    },
    objective: {
      fr: "Reconstituer l'image complète en faisant glisser les pièces en un minimum de coups.",
      en: "Reassemble the complete image by sliding tiles in the fewest possible moves.",
      de: "Setze das vollständige Bild mit so wenigen Zügen wie möglich wieder zusammen.",
      zh: "用最少的步数滑动方块还原完整照片。",
    },
    howToPlay: [
      {
        fr: "Cliquez sur Importer une photo pour charger une image personnelle, ou choisissez un thème prêt à jouer (Cobalt, Douala, Neon).",
        en: "Click Import photo to load your own picture, or pick a ready-to-play theme (Cobalt, Douala, Neon).",
        de: "Klicke auf Foto importieren oder wähle ein fertiges Motiv (Cobalt, Douala, Neon).",
        zh: "点击导入照片上传你的图片，或选择内置主题（Cobalt、Douala、Neon）。",
      },
      {
        fr: "Choisissez la taille de la grille : 3×3 (rapide), 4×4 (classique) ou 5×5 (expert).",
        en: "Select your grid size: 3×3 (quick), 4×4 (classic), or 5×5 (expert).",
        de: "Wähle die Rastergröße: 3×3 (schnell), 4×4 (klassisch) oder 5×5 (Experte).",
        zh: "选择棋盘难度：3×3（快速）、4×4（经典）或 5×5（专家）。",
      },
      {
        fr: "Touchez une pièce adjacente à la case vide (ou utilisez les flèches du clavier) pour la faire glisser.",
        en: "Tap any tile next to the empty space (or use Arrow keys) to slide it into place.",
        de: "Tippe auf ein Feld neben der Lücke (oder nutze Pfeiltasten), um es zu verschieben.",
        zh: "点击空格旁边的拼块（或使用方向键）将其滑入空位。",
      },
      {
        fr: "Utilisez le bouton Modèle pour revoir l'image originale et le bouton # pour afficher ou masquer les numéros.",
        en: "Use Peek to preview the original image and # to toggle helper tile numbers.",
        de: "Nutze Vorschau für das Originalbild und # für die Hilfsnummern.",
        zh: "点击预览可随时查看原图，点击 # 可显示或隐藏数字提示。",
      },
    ],
    tip: {
      fr: "Résolvez toujours la première ligne (1, 2, 3…) puis la colonne de gauche avant de vous attaquer au carré restant.",
      en: "Always solve the top row first (1, 2, 3…), then the left column, before finishing the remaining corner.",
      de: "Löse zuerst die oberste Reihe und dann die linke Spalte.",
      zh: "先拼好第一行，再拼最左一列，最后处理剩余区域会轻松很多。",
    },
    shortcuts: ["Importer photo", "Clic / Toucher", "↑ ↓ ← →"],
    controls: {
      fr: "Importer photo · Clic / Toucher · Flèches",
      en: "Import photo · Click / Tap · Arrows",
      de: "Foto importieren · Klicken / Tippen · Pfeile",
      zh: "导入照片 · 点击 / 触控 · 方向键",
    },
    scoreKey: "fj_game_best_puzzle",
    scoreUnit: "moves",
    lowerIsBetter: true,
  },
  {
    id: "connect4",
    category: "duo",
    title: {
      fr: "Puissance 4",
      en: "Connect 4",
      de: "Vier gewinnt",
      zh: "四子棋 1v1",
    },
    tagline: {
      fr: "Duel 1v1 en ligne · 7×6",
      en: "Online 1v1 duel · 7×6",
      de: "Online 1v1 · 7×6",
      zh: "在线 1v1 · 7×6 棋盘",
    },
    description: {
      fr: "Lâchez vos jetons dans la grille 7×6 en ligne contre un ami et alignez 4 pions avant votre adversaire.",
      en: "Drop your discs into the 7×6 grid online against a friend and connect 4 in a row first.",
      de: "Wirf deine Spielsteine online in das 7×6-Raster und verbinde als Erster 4 in einer Reihe.",
      zh: "与好友在线对战，在 7×6 棋盘中率先连成 4 颗同色棋子。",
    },
    objective: {
      fr: "Aligner 4 jetons de votre couleur horizontalement, verticalement ou en diagonale.",
      en: "Line up 4 discs of your color horizontally, vertically, or diagonally.",
      de: "Bringe 4 Steine deiner Farbe waagerecht, senkrecht oder diagonal in eine Reihe.",
      zh: "在横、竖或斜线上率先连成 4 颗同色棋子。",
    },
    howToPlay: [
      {
        fr: "Cliquez sur Créer un salon privé et partagez le lien ou le code à 6 caractères à votre ami.",
        en: "Click Create private room and share the link or 6-character code with your friend.",
        de: "Erstelle einen privaten Raum und teile den Link oder Code mit deinem Freund.",
        zh: "点击创建私人房间，将链接或 6 位房间码发给好友。",
      },
      {
        fr: "Chacun joue à tour de rôle en cliquant sur une colonne : le jeton tombe automatiquement tout en bas.",
        en: "Take turns clicking any column — your disc drops to the lowest available slot.",
        de: "Klickt abwechselnd auf eine Spalte — der Stein fällt automatisch nach unten.",
        zh: "双方轮流点击任意一列，棋子会自动落到最底层。",
      },
      {
        fr: "Le premier joueur à aligner 4 jetons remporte la manche et marque +1 victoire au classement.",
        en: "The first player to connect 4 wins the round and scores +1 win on the leaderboard.",
        de: "Wer zuerst 4 verbindet, gewinnt die Runde und erhält +1 Sieg in der Bestenliste.",
        zh: "率先连成 4 子的一方获胜并计入排行榜。",
      },
    ],
    tip: {
      fr: "Contrôlez la colonne centrale dès le début : elle offre le plus de combinaisons gagnantes en diagonale.",
      en: "Control the center column early — it unlocks the most horizontal and diagonal winning lines.",
      de: "Kontrolliere früh die mittlere Spalte für maximale diagonale Optionen.",
      zh: "开局尽量抢占中间一列，可以创造最多的横斜连线机会。",
    },
    shortcuts: ["Lien d'invitation", "Clic colonne"],
    controls: {
      fr: "Lien d'invitation · Clic sur une colonne",
      en: "Invite link · Click a column",
      de: "Einladungslink · Spalte anklicken",
      zh: "邀请链接 · 点击落子列",
    },
    scoreKey: "fj_game_best_connect4",
    scoreUnit: "wins",
  },
  {
    id: "duo-tictactoe",
    category: "duo",
    title: {
      fr: "Morpion 1v1",
      en: "Tic-Tac-Toe 1v1",
      de: "Tic-Tac-Toe 1v1",
      zh: "井字棋 1v1",
    },
    tagline: {
      fr: "Duel en ligne · 3×3",
      en: "Online duel · 3×3",
      de: "Online-Duell · 3×3",
      zh: "在线 1v1 · 3×3 棋盘",
    },
    description: {
      fr: "Affrontez un ami à distance au Morpion classique en temps réel grâce à un lien de salon partageable.",
      en: "Challenge a friend remotely in classic real-time Tic-Tac-Toe via a shareable room link.",
      de: "Spiele klassisches Tic-Tac-Toe live gegen einen Freund per teilbarem Raumlink.",
      zh: "通过分享房间链接，与好友远程实时进行经典井字棋对决。",
    },
    objective: {
      fr: "Aligner 3 X ou 3 O avant votre adversaire et enchaîner les victoires.",
      en: "Align 3 X's or 3 O's before your opponent and rack up wins.",
      de: "Bringe 3 X oder 3 O in eine Reihe vor deinem Gegner.",
      zh: "抢先连成 3 个 X 或 O 赢得胜利。",
    },
    howToPlay: [
      {
        fr: "Créez un salon et envoyez le lien d'invitation à votre adversaire.",
        en: "Create a room and send the invite link to your opponent.",
        de: "Erstelle einen Raum und sende den Einladungslink an deinen Gegner.",
        zh: "创建房间并将邀请链接发给对手。",
      },
      {
        fr: "L'hôte joue X et l'invité joue O. Les coups sont synchronisés en direct.",
        en: "Host plays X and guest plays O. Moves sync live in real time.",
        de: "Der Host spielt X, der Gast spielt O — Züge werden live synchronisiert.",
        zh: "房主执 X，访客执 O，落子实时同步。",
      },
      {
        fr: "Cliquez sur Revanche après une manche : le joueur qui commence alterne automatiquement.",
        en: "Hit Rematch after a round — the starting player alternates automatically.",
        de: "Klicke auf Revanche — der Startspieler wechselt automatisch.",
        zh: "点击再来一局，先手玩家自动轮换。",
      },
    ],
    tip: {
      fr: "Visez le centre ou un coin en premier coup pour créer une double menace imparable.",
      en: "Claim the center or a corner first to build an unstoppable double fork.",
      de: "Nimm zuerst Mitte oder Ecke für eine doppelte Drohung.",
      zh: "先手占领中心或角落，更容易制造双杀局面。",
    },
    shortcuts: ["Lien d'invitation", "Clic / Toucher"],
    controls: {
      fr: "Lien d'invitation · Clic / Toucher",
      en: "Invite link · Click / Tap",
      de: "Einladungslink · Klicken / Tippen",
      zh: "邀请链接 · 点击 / 触控",
    },
    scoreKey: "fj_game_best_duo_tictactoe",
    scoreUnit: "wins",
  },
  {
    id: "rps",
    category: "duo",
    title: {
      fr: "Chifoumi",
      en: "Rock Paper Scissors",
      de: "Schere Stein Papier",
      zh: "石头剪刀布 1v1",
    },
    tagline: {
      fr: "Duel secret · Premier à 3",
      en: "Secret duel · First to 3",
      de: "Geheimes Duell · Bis 3",
      zh: "暗选对决 · 先赢 3 局",
    },
    description: {
      fr: "Pierre, Feuille, Ciseaux en ligne : chaque joueur choisit secrètement son coup, révélé simultanément dès que les deux ont validé.",
      en: "Online Rock, Paper, Scissors: each player picks secretly, revealing simultaneously once both lock in.",
      de: "Schere, Stein, Papier online: Beide wählen geheim, die Auflösung erfolgt gleichzeitig.",
      zh: "在线石头剪刀布：双方秘密出拳，锁定后同时揭晓胜负。",
    },
    objective: {
      fr: "Être le premier joueur à remporter 3 manches contre son adversaire.",
      en: "Be the first player to win 3 rounds against your opponent.",
      de: "Gewinne als Erster 3 Runden gegen deinen Gegner.",
      zh: "率先赢得 3 小局击败对手。",
    },
    howToPlay: [
      {
        fr: "Créez un salon Chifoumi et invitez un ami via le lien ou le code.",
        en: "Create a room and invite a friend using the link or room code.",
        de: "Erstelle einen Raum und lade einen Freund per Link oder Code ein.",
        zh: "创建房间并通过链接或房间码邀请好友。",
      },
      {
        fr: "Choisissez Pierre 🪨, Feuille 📄 ou Ciseaux ✂️ : votre choix reste caché tant que votre adversaire n'a pas joué.",
        en: "Pick Rock 🪨, Paper 📄, or Scissors ✂️ — your choice stays hidden until your opponent locks in.",
        de: "Wähle Stein 🪨, Papier 📄 oder Schere ✂️ — deine Wahl bleibt bis zur Auflösung geheim.",
        zh: "选择石头 🪨、布 📄 或剪刀 ✂️，双方都确认前不会暴露。",
      },
      {
        fr: "Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre. Le premier à 3 points gagne !",
        en: "Rock beats Scissors, Scissors beats Paper, Paper beats Rock. First to 3 points wins!",
        de: "Stein schlägt Schere, Schere schlägt Papier, Papier schlägt Stein. Erster bei 3 gewinnt!",
        zh: "石头胜剪刀，剪刀胜布，布胜石头，先得 3 分获胜！",
      },
    ],
    tip: {
      fr: "Les joueurs ont tendance à rejouer le coup qui vient de les faire gagner — anticipez et contrez-le !",
      en: "Players often repeat the move that just won them a round — anticipate and counter it!",
      de: "Viele wiederholen den Gewinnerzug der Vorrunde — kontere ihn!",
      zh: "人们往往倾向于重复上一局赢过的手势，可以反向预判！",
    },
    shortcuts: ["🪨 Pierre", "📄 Feuille", "✂️ Ciseaux"],
    controls: {
      fr: "Lien d'invitation · Choix simultané",
      en: "Invite link · Simultaneous pick",
      de: "Einladungslink · Geheime Wahl",
      zh: "邀请链接 · 同时暗选",
    },
    scoreKey: "fj_game_best_rps",
    scoreUnit: "wins",
  },
  {
    id: "quiz",
    category: "duo",
    title: {
      fr: "Quiz Dev 1v1",
      en: "Dev Quiz 1v1",
      de: "Dev-Quiz 1v1",
      zh: "开发者问答 1v1",
    },
    tagline: {
      fr: "5 questions tech en duel",
      en: "5 tech trivia questions",
      de: "5 Tech-Fragen im Duell",
      zh: "5 道编程问答对决",
    },
    description: {
      fr: "Affrontez un ami sur 5 questions aléatoires de développement (React, Next.js, TypeScript, Git, SQL, HTTP) et comparez vos scores en direct.",
      en: "Face off against a friend on 5 random developer questions (React, Next.js, TypeScript, Git, SQL, HTTP) and compare live scores.",
      de: "Tritt gegen einen Freund in 5 zufälligen Entwickler-Fragen an und vergleicht eure Punkte live.",
      zh: "与好友在 5 道随机编程题目（React、Next.js、TS、Git、SQL、HTTP）中实时比拼正确率。",
    },
    objective: {
      fr: "Obtenir le meilleur score sur 5 questions pour battre votre adversaire.",
      en: "Score more correct answers out of 5 than your opponent.",
      de: "Beantworte mehr der 5 Fragen richtig als dein Gegner.",
      zh: "在 5 道题中答对更多题目以战胜对手。",
    },
    howToPlay: [
      {
        fr: "Créez un salon Quiz Dev et partagez le lien avec votre adversaire.",
        en: "Create a Dev Quiz room and share the link with your opponent.",
        de: "Erstelle einen Quiz-Raum und teile den Link mit deinem Gegner.",
        zh: "创建问答房间并将链接分享给对手。",
      },
      {
        fr: "Les deux joueurs reçoivent exactement les mêmes 5 questions tirées aléatoirement.",
        en: "Both players receive the exact same 5 randomly drawn questions.",
        de: "Beide Spieler erhalten exakt dieselben 5 Zufallsfragen.",
        zh: "两位玩家会收到完全相同的 5 道随机题目。",
      },
      {
        fr: "Dès que les deux joueurs ont terminé, le vainqueur est annoncé et gagne +1 au classement.",
        en: "Once both players finish, the winner is crowned and earns +1 win on the leaderboard.",
        de: "Sobald beide fertig sind, wird der Sieger gekürt.",
        zh: "双方作答完毕后立刻揭晓胜者并计入排行榜。",
      },
    ],
    tip: {
      fr: "Lisez bien chaque proposition : certaines réponses pièges se ressemblent entre SQL, HTTP et Git !",
      en: "Read every option carefully — some distractors look very similar across SQL, HTTP, and Git!",
      de: "Lies jede Option genau — manche Antworten klingen ähnlich!",
      zh: "仔细阅读每个选项，避免被相似的术语干扰！",
    },
    shortcuts: ["Lien d'invitation", "Choix A B C D"],
    controls: {
      fr: "Lien d'invitation · 5 questions QCM",
      en: "Invite link · 5 multiple-choice questions",
      de: "Einladungslink · 5 Quizfragen",
      zh: "邀请链接 · 5 道选择题",
    },
    scoreKey: "fj_game_best_quiz",
    scoreUnit: "wins",
  },
  {
    id: "duo-reaction",
    category: "duo",
    title: {
      fr: "Duel Réflexe",
      en: "Reflex Duel",
      de: "Reflex-Duell",
      zh: "反应对决 1v1",
    },
    tagline: {
      fr: "1v1 en ligne · 3 manches",
      en: "Online 1v1 · 3 rounds",
      de: "Online 1v1 · 3 Runden",
      zh: "在线 1v1 · 3 轮测速",
    },
    description: {
      fr: "Qui a les meilleurs réflexes ? Affrontez un ami sur 3 essais chronométrés à la milliseconde — la meilleure moyenne remporte le duel.",
      en: "Who has the sharpest reflexes? Battle a friend across 3 millisecond-timed attempts — lowest average wins.",
      de: "Wer hat die schnellsten Reflexe? 3 Millisekunden-Versuche — der niedrigste Schnitt gewinnt.",
      zh: "谁的反应更快？与好友进行 3 轮毫秒级反应测试，平均时间更短者获胜。",
    },
    objective: {
      fr: "Obtenir une moyenne de réaction (en ms) plus rapide que celle de votre adversaire sur 3 essais.",
      en: "Achieve a faster 3-attempt average reaction time (in ms) than your opponent.",
      de: "Erziele einen schnelleren Durchschnitt über 3 Versuche als dein Gegner.",
      zh: "在 3 次测试中取得比对手更快的平均反应时间（毫秒）。",
    },
    howToPlay: [
      {
        fr: "Créez un salon Duel Réflexe et envoyez le lien d'invitation à votre ami.",
        en: "Create a Reflex Duel room and send the invite link to your friend.",
        de: "Erstelle einen Reflex-Duell-Raum und sende den Link an deinen Freund.",
        zh: "创建反应对决房间并将邀请链接发给好友。",
      },
      {
        fr: "Effectuez vos 3 essais : attendez le signal bleu cobalt puis cliquez le plus vite possible.",
        en: "Complete your 3 attempts: wait for the cobalt blue signal and click immediately.",
        de: "Absolviere deine 3 Versuche: Warte auf Blau und klicke sofort.",
        zh: "完成 3 轮测试：等待区域变为钴蓝色时立刻点击。",
      },
      {
        fr: "Dès que les deux joueurs ont terminé leurs 3 essais, les moyennes sont comparées et le vainqueur est couronné.",
        en: "Once both finish their 3 attempts, averages are compared and the faster player wins.",
        de: "Sobald beide 3 Versuche fertig haben, gewinnt der schnellere Schnitt.",
        zh: "双方完成 3 轮后对比平均成绩，更快者获胜。",
      },
    ],
    tip: {
      fr: "Gardez votre doigt ou souris posé sur la zone sans anticiper : un clic trop tôt annule l'essai !",
      en: "Keep your cursor steady on the pad without jumping the gun — early clicks reset the attempt!",
      de: "Bleib ruhig auf dem Feld — ein zu früher Klick startet den Versuch neu!",
      zh: "保持专注不要抢跑，提前点击会重置当前回合！",
    },
    shortcuts: ["Lien d'invitation", "Clic / Toucher"],
    controls: {
      fr: "Lien d'invitation · Clic / Toucher (3 manches)",
      en: "Invite link · Click / Tap (3 rounds)",
      de: "Einladungslink · Klicken / Tippen (3 Runden)",
      zh: "邀请链接 · 点击 / 触控（3 轮）",
    },
    scoreKey: "fj_game_best_duo_reaction",
    scoreUnit: "wins",
  },
]

export const gamesCopy = {
  eyebrow: {
    fr: "Playground — 15 jeux jouables (10 Solo · 5 Duo 1v1)",
    en: "Playground — 15 playable games (10 Solo · 5 Online Duo)",
    de: "Playground — 15 spielbare Spiele (10 Solo · 5 Online-Duo)",
    zh: "游乐场 — 15 款可玩游戏（10 单人 · 5 在线双人）",
  },
  title: {
    fr: "Jeux",
    en: "Games",
    de: "Spiele",
    zh: "游戏",
  },
  intro: {
    fr: "Une parenthèse interactive au cœur du portfolio. Testez vos réflexes, votre logique et votre stratégie directement dans le navigateur — vos records sont sauvegardés localement.",
    en: "An interactive break inside the portfolio. Test your reflexes, logic, and strategy right in the browser — your high scores are saved locally.",
    de: "Eine interaktive Pause mitten im Portfolio. Teste Reflexe, Logik und Strategie direkt im Browser — deine Bestwerte werden lokal gespeichert.",
    zh: "作品集里的互动小憩。直接在浏览器中测试你的反应、逻辑与策略——所有最高记录均保存在本地。",
  },
  play: { fr: "Jouer", en: "Play", de: "Spielen", zh: "开始" },
  playing: { fr: "En cours", en: "Playing", de: "Aktiv", zh: "进行中" },
  record: { fr: "Record", en: "Best", de: "Rekord", zh: "最佳" },
  noRecord: { fr: "Aucun record", en: "No record yet", de: "Kein Rekord", zh: "暂无记录" },
  score: { fr: "Score", en: "Score", de: "Punkte", zh: "得分" },
  restart: { fr: "Rejouer", en: "Restart", de: "Neu starten", zh: "重新开始" },
  start: { fr: "Démarrer", en: "Start", de: "Starten", zh: "开始" },
  pause: { fr: "Pause", en: "Pause", de: "Pause", zh: "暂停" },
  resume: { fr: "Reprendre", en: "Resume", de: "Weiter", zh: "继续" },
  gameOver: { fr: "Partie terminée", en: "Game Over", de: "Spiel vorbei", zh: "游戏结束" },
  newRecord: { fr: "Nouveau record !", en: "New high score!", de: "Neuer Rekord!", zh: "新纪录！" },
  controlsLabel: { fr: "Contrôles", en: "Controls", de: "Steuerung", zh: "操作" },
  arenaEyebrow: { fr: "Arène active", en: "Active arena", de: "Aktive Arena", zh: "当前游戏" },
  selectGame: { fr: "Choisir un jeu", en: "Choose a game", de: "Spiel wählen", zh: "选择游戏" },
  aboutGame: { fr: "À propos du jeu", en: "About the game", de: "Über das Spiel", zh: "关于游戏" },
  objective: { fr: "Objectif", en: "Objective", de: "Ziel", zh: "目标" },
  howToPlay: { fr: "Comment ça marche", en: "How it works", de: "So funktioniert's", zh: "玩法说明" },
  proTip: { fr: "Astuce", en: "Pro tip", de: "Tipp", zh: "小技巧" },
  leaderboard: { fr: "Classement", en: "Leaderboard", de: "Bestenliste", zh: "排行榜" },
  topPlayers: { fr: "Meilleurs joueurs", en: "Top players", de: "Beste Spieler", zh: "最佳玩家" },
  noLeaderboardYet: {
    fr: "Aucun score enregistré pour le moment. Soyez le premier sur le podium !",
    en: "No scores recorded yet. Be the first on the podium!",
    de: "Noch keine Einträge. Sei der Erste auf dem Podium!",
    zh: "暂无上榜记录，快来成为第一位榜首吧！",
  },
  playerLabel: { fr: "Joueur", en: "Player", de: "Spieler", zh: "玩家" },
  youBadge: { fr: "Vous", en: "You", de: "Du", zh: "你" },
  enterPseudoTitle: {
    fr: "Entrez votre pseudo pour jouer",
    en: "Enter your nickname to play",
    de: "Gib deinen Namen ein",
    zh: "输入你的昵称开始游戏",
  },
  enterPseudoDesc: {
    fr: "Votre nom apparaîtra dans le classement des meilleurs joueurs. Votre session est associée de manière anonyme à votre adresse IP pour sécuriser vos records.",
    en: "Your name will appear on the leaderboard. Your session is anonymously linked to your IP to secure your records.",
    de: "Dein Name erscheint in der Bestenliste. Deine Sitzung wird anonym über deine IP-Adresse zugeordnet.",
    zh: "你的昵称将显示在排行榜中，系统会通过匿名 IP 哈希自动保存你的最高记录。",
  },
  pseudoPlaceholder: {
    fr: "Ex : Junior_237, Alex…",
    en: "e.g. Junior_237, Alex…",
    de: "z. B. Junior_237, Alex…",
    zh: "例如：Junior_237、Alex…",
  },
  saveAndPlay: {
    fr: "Valider et jouer",
    en: "Save & play",
    de: "Speichern & spielen",
    zh: "确认并开始",
  },
  changePseudo: {
    fr: "Changer",
    en: "Edit",
    de: "Ändern",
    zh: "修改",
  },
  share: { fr: "Partager", en: "Share", de: "Teilen", zh: "分享" },
  linkCopied: { fr: "Lien copié !", en: "Link copied!", de: "Link kopiert!", zh: "链接已复制！" },
  resetScores: {
    fr: "Réinitialiser les records",
    en: "Reset high scores",
    de: "Rekorde zurücksetzen",
    zh: "重置记录",
  },
} satisfies Record<string, T>

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  avatarUrl?: string | null
  updatedAt: string
  isCurrentPlayer?: boolean
}

export const PLAYER_NAME_KEY = "fj_game_player_name"
export const PLAYER_AVATAR_KEY = "fj_game_player_avatar"
export const PLAYER_ID_KEY = "fj_game_player_id"
export const DEVICE_COOKIE_NAME = "fj_device_id"

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const prefix = `${name}=`
  const parts = document.cookie.split(";")
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length))
    }
  }
  return null
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
}

export function getPlayerId(): string {
  if (typeof window === "undefined") return ""
  try {
    let id = window.localStorage.getItem(PLAYER_ID_KEY) || readCookie(DEVICE_COOKIE_NAME)
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    }
    window.localStorage.setItem(PLAYER_ID_KEY, id)
    writeCookie(DEVICE_COOKIE_NAME, id)
    return id
  } catch {
    return readCookie(DEVICE_COOKIE_NAME) || `tmp-${Math.random().toString(36).slice(2, 10)}`
  }
}

const SCORE_KEY_TO_GAME: Record<string, GameId> = {
  fj_game_best_snake: "snake",
  fj_game_best_2048: "2048",
  fj_game_best_tictactoe: "tictactoe",
  fj_game_best_memory: "memory",
  fj_game_best_reaction: "reaction",
  fj_game_best_breakout: "breakout",
  fj_game_best_minesweeper: "minesweeper",
  fj_game_best_typing: "typing",
  fj_game_best_simon: "simon",
  fj_game_best_puzzle: "puzzle",
  fj_game_best_connect4: "connect4",
  fj_game_best_duo_tictactoe: "duo-tictactoe",
  fj_game_best_rps: "rps",
  fj_game_best_quiz: "quiz",
  fj_game_best_duo_reaction: "duo-reaction",
}

const pendingSubmitTimers: Partial<Record<GameId, number>> = {}

/** Detect accidental 6-char room codes like "U5PFJ3" typed as a player name. */
export function looksLikeRoomCode(value: string): boolean {
  const s = value.trim()
  return /^[A-Z0-9]{6}$/.test(s) && /[A-Z]/.test(s) && /\d/.test(s)
}

export function getPlayerName(): string {
  if (typeof window === "undefined") return ""
  try {
    const raw = window.localStorage.getItem(PLAYER_NAME_KEY)?.trim() || ""
    if (looksLikeRoomCode(raw)) {
      window.localStorage.removeItem(PLAYER_NAME_KEY)
      return ""
    }
    return raw
  } catch {
    return ""
  }
}

export function setPlayerName(name: string): string {
  const clean = name.replace(/[<>"'`]/g, "").replace(/\s+/g, " ").trim().slice(0, 24)
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PLAYER_NAME_KEY, clean)
      window.dispatchEvent(new CustomEvent("fj-player-name-updated", { detail: clean }))
    } catch {}
  }
  return clean
}

export function getPlayerAvatar(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(PLAYER_AVATAR_KEY)?.trim() || ""
  } catch {
    return ""
  }
}

export function setPlayerAvatar(url: string): void {
  if (typeof window === "undefined") return
  try {
    if (url) window.localStorage.setItem(PLAYER_AVATAR_KEY, url)
    else window.localStorage.removeItem(PLAYER_AVATAR_KEY)
  } catch {}
}

export function submitLeaderboardScore(game: GameId, score: number) {
  if (typeof window === "undefined") return
  const name = getPlayerName()
  if (name.length < 2) return

  const existing = pendingSubmitTimers[game]
  if (existing) window.clearTimeout(existing)

  pendingSubmitTimers[game] = window.setTimeout(async () => {
    delete pendingSubmitTimers[game]
    try {
      const deviceId = getPlayerId()
      const avatarUrl = getPlayerAvatar() || null
      const res = await fetch("/api/games/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, name, score, deviceId, avatarUrl }),
      })
      if (!res.ok) return
      const data = await res.json()
      window.dispatchEvent(
        new CustomEvent("fj-leaderboard-updated", {
          detail: { game, entries: data.entries as LeaderboardEntry[] },
        }),
      )
    } catch {}
  }, 600)
}

export function readScore(key: string): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveBestScore(key: string, value: number, lowerIsBetter = false): { best: number; isNew: boolean } {
  const prev = readScore(key)
  const isNew = prev === null || (lowerIsBetter ? value < prev : value > prev)
  const best = isNew ? value : prev!
  if (typeof window !== "undefined") {
    if (isNew) {
      try {
        window.localStorage.setItem(key, String(best))
        window.dispatchEvent(new CustomEvent("fj-game-score-updated"))
      } catch {}
    }
    const gameId = SCORE_KEY_TO_GAME[key]
    if (gameId) {
      submitLeaderboardScore(gameId, best)
    }
  }
  return { best, isNew }
}

export function formatScore(value: number | null, unit?: GameMeta["scoreUnit"], lang = "fr"): string {
  if (value === null) return "—"
  if (unit === "ms") return `${value} ms`
  if (unit === "s") return `${value} s`
  if (unit === "wpm") return `${value} ${lang === "fr" ? "MPM" : "WPM"}`
  if (unit === "moves") {
    const labels: Record<string, string> = { fr: "coups", en: "moves", de: "Züge", zh: "步" }
    return `${value} ${labels[lang] || "coups"}`
  }
  if (unit === "wins") {
    const labels: Record<string, string> = { fr: "victoires", en: "wins", de: "Siege", zh: "胜" }
    return `${value} ${labels[lang] || "victoires"}`
  }
  return `${value} pts`
}
