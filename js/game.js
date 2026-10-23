// Official PG Soft Lucky Neko (Game ID 89) — Complete 1:1 Game Engine
// Features: 4-Cell Top Horizontal Reel + 6x5 Multi-Row Main Reel (Up to 32,400 Ways),
// Silver Frame -> Gold Frame -> Wild (Wilds-on-the-Way), +2 Cat Multiplier, Feature Buy & Free Spins
(function () {
  const COLS = 6;
  const PLAYABLE_ROWS = 5;
  const TOP_REEL_CELLS = 4; // Sits above columns 1, 2, 3, 4 (0-indexed)
  const NEKO_DIR = 'assets/sprites/neko/';

  const BET_OPTIONS = [
    200, 400, 600, 800, 1000, 1500, 2000, 3000, 4000, 5000,
    10000, 15000, 20000, 30000, 40000, 50000, 75000, 100000
  ];

  const state = {
    balance: 1000000,
    betIndex: 6, // Default Rp2.000,00
    isSpinning: false,
    isTurbo: false,
    autoSpinsRemaining: 0,
    inFreeSpins: false,
    freeSpinsRemaining: 0,
    freeSpinsTotalAwarded: 0,
    freeSpinsTotalWon: 0,
    catMultiplier: 0, // 0 in base game until a Neko lands (+2 per Neko); starts at 2 in Free Spins
    topGrid: [],      // 4 cells above cols 1, 2, 3, 4
    grid: [],         // 6 columns, each column is an array of cells whose spans sum to 5
    waysCount: 10800,
    history: [],
    tipIndex: 1
  };

  const els = {
    appBackdrop: document.getElementById('appBackdrop'),
    gameShell: document.getElementById('gameShell'),
    splashOverlay: document.getElementById('splashOverlay'),
    splashProgress: document.getElementById('splashProgress'),
    splashProgressFill: document.getElementById('splashProgressFill'),
    splashProgressText: document.getElementById('splashProgressText'),
    splashCenterCta: document.getElementById('splashCenterCta'),
    startBtn: document.getElementById('startBtn'),
    sakuraPetalsLayer: document.getElementById('sakuraPetalsLayer'),
    waysSpritesBox: document.getElementById('waysSpritesBox'),
    topReelBoard: document.getElementById('topReelBoard'),
    reelBoard: document.getElementById('reelBoard'),
    reelCols: [],
    symbolPayoutPopup: document.getElementById('symbolPayoutPopup'),
    symbolPayoutCard: document.getElementById('symbolPayoutCard'),
    catBadge: document.getElementById('catBadge'),
    catMultVal: document.getElementById('catMultVal'),
    featureBuyBtn: document.getElementById('featureBuyBtn'),
    featureBuyModal: document.getElementById('featureBuyModal'),
    fbModalPrice: document.getElementById('fbModalPrice'),
    fbCancelBtn: document.getElementById('fbCancelBtn'),
    fbConfirmBtn: document.getElementById('fbConfirmBtn'),
    balanceVal: document.getElementById('balanceVal'),
    betVal: document.getElementById('betVal'),
    winVal: document.getElementById('winVal'),
    pillWinBox: document.getElementById('pillWinBox'),
    pgShieldIcon: document.getElementById('pgShieldIcon'),
    bannerWin: document.getElementById('bannerWin'),
    ibBarBg: document.getElementById('ibBarBg'),
    ibTipMarquee: document.getElementById('ibTipMarquee'),
    ibTipSprite: document.getElementById('ibTipSprite'),
    ibWinDisplay: document.getElementById('ibWinDisplay'),
    ibWinTag: document.getElementById('ibWinTag'),
    bannerWinVal: document.getElementById('bannerWinVal'),
    controlsRow: document.getElementById('controlsRow'),
    freeSpinCounterBar: document.getElementById('freeSpinCounterBar'),
    rfsLabelImg: document.getElementById('rfsLabelImg'),
    rfsCountSprites: document.getElementById('rfsCountSprites'),
    lfsLabelImg: document.getElementById('lfsLabelImg'),
    spinBtn: document.getElementById('spinBtn'),
    spinArrowImg: document.getElementById('spinArrowImg'),
    spinAutoRing: document.getElementById('spinAutoRing'),
    autoBadge: document.getElementById('autoBadge'),
    turboBtn: document.getElementById('turboBtn'),
    turboIconImg: document.getElementById('turboIconImg'),
    betMinusBtn: document.getElementById('betMinusBtn'),
    betPlusBtn: document.getElementById('betPlusBtn'),
    autoBtn: document.getElementById('autoBtn'),
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    utilityDrawer: document.getElementById('utilityDrawer'),
    walletMeterBtn: document.getElementById('walletMeterBtn'),
    winMeterBtn: document.getElementById('winMeterBtn'),
    betMeterBtn: document.getElementById('betMeterBtn'),
    demoMenuBtn: document.getElementById('demoMenuBtn'),
    demoPopupMenu: document.getElementById('demoPopupMenu'),
    demoScatterBtn: document.getElementById('demoScatterBtn'),
    demoCatWinBtn: document.getElementById('demoCatWinBtn'),
    fsIntroModal: document.getElementById('fsIntroModal'),
    fsWonCountSprites: document.getElementById('fsWonCountSprites'),
    fsStartBtn: document.getElementById('fsStartBtn'),
    celebModal: document.getElementById('celebModal'),
    celebTitleImg: document.getElementById('celebTitleImg'),
    celebTitle: document.getElementById('celebTitle'),
    celebAmountSprites: document.getElementById('celebAmountSprites'),
    celebAmount: document.getElementById('celebAmount'),
    celebCollectBtn: document.getElementById('celebCollectBtn'),
    betSheetModal: document.getElementById('betSheetModal'),
    betOptionsGrid: document.getElementById('betOptionsGrid'),
    closeBetSheetBtn: document.getElementById('closeBetSheetBtn'),
    autoSheetModal: document.getElementById('autoSheetModal'),
    closeAutoSheetBtn: document.getElementById('closeAutoSheetBtn'),
    historyModal: document.getElementById('historyModal'),
    historyBtn: document.getElementById('historyBtn'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    historyList: document.getElementById('historyList'),
    paytableModal: document.getElementById('paytableModal'),
    paytableBtn: document.getElementById('paytableBtn'),
    rulesBtn: document.getElementById('rulesBtn'),
    closePaytableBtn: document.getElementById('closePaytableBtn'),
    paytableGrid: document.getElementById('paytableGrid'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundSpIc: document.getElementById('soundSpIc'),
    installPwaBtn: document.getElementById('installPwaBtn'),
    installGuideModal: document.getElementById('installGuideModal'),
    closeInstallGuideBtn: document.getElementById('closeInstallGuideBtn')
  };

  function formatIDR(amount) {
    return 'Rp' + Math.floor(amount).toLocaleString('id-ID') + ',00';
  }

  function waitMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function sleep(normalMs, turboMs) {
    return waitMs(state.isTurbo ? turboMs : normalMs);
  }

  // Weighted Symbol Pool for Authentic PG Soft Lucky Neko
  const WEIGHTED_POOL = [
    { type: 'neko', weight: 7 },
    { type: 'scatter', weight: 4 },
    { type: 'wild', weight: 4 },
    { type: 'drum', weight: 13 },
    { type: 'lantern', weight: 14 },
    { type: 'fan', weight: 16 },
    { type: 'f_sushi', weight: 18 },
    { type: 'sushi', weight: 18 },
    { type: 'card_a', weight: 24 },
    { type: 'card_k', weight: 26 },
    { type: 'card_q', weight: 28 },
    { type: 'card_j', weight: 30 },
    { type: 'card_10', weight: 32 }
  ];

  const REGULAR_TYPES = ['neko', 'drum', 'lantern', 'fan', 'f_sushi', 'sushi', 'card_a', 'card_k', 'card_q', 'card_j', 'card_10'];

  function pickRandomType(allowSpecial = true) {
    const pool = allowSpecial ? WEIGHTED_POOL : WEIGHTED_POOL.filter(i => !['scatter', 'wild'].includes(i.type));
    const total = pool.reduce((acc, cur) => acc + cur.weight, 0);
    let rand = Math.random() * total;
    for (const item of pool) {
      if (rand < item.weight) return item.type;
      rand -= item.weight;
    }
    return 'drum';
  }

  function createCell(type = null, span = 1, frame = null) {
    const cellType = type || pickRandomType(span === 1);
    let silver = false;
    let gold = false;

    if (frame === 'silver') silver = true;
    else if (frame === 'gold') gold = true;
    else if (frame === null && !['scatter', 'wild'].includes(cellType)) {
      if (span >= 2) {
        const r = Math.random();
        if (r < 0.42) silver = true;
        else if (r < 0.62) gold = true;
      } else if (Math.random() < 0.14) {
        silver = true;
      }
    }

    return {
      type: cellType,
      span: span,
      silver: silver,
      gold: gold,
      id: Math.random().toString(36).slice(2, 9)
    };
  }

  // Generate a column of cells whose spans sum to PLAYABLE_ROWS (5)
  function generateColumnCells(colIndex) {
    // Columns 0 and 5 only have 1x1 symbols; Columns 1, 2, 3, 4 can have multi-row symbols (1x1..1x4)
    if (colIndex === 0 || colIndex === 5) {
      const col = [];
      for (let r = 0; r < PLAYABLE_ROWS; r++) {
        col.push(createCell(null, 1));
      }
      return col;
    }

    const col = [];
    let remaining = PLAYABLE_ROWS;
    while (remaining > 0) {
      let span = 1;
      if (remaining >= 2 && Math.random() < 0.44) {
        const maxSpan = Math.min(3, remaining);
        span = 2 + Math.floor(Math.random() * (maxSpan - 1));
      }
      const symType = pickRandomType(span === 1);
      col.push(createCell(symType, span, null));
      remaining -= span;
    }
    return col;
  }

  // Initialize with the exact 10,800 CARA attract board from the live PG Soft Lucky Neko game
  function initializeDefaultBoard() {
    state.topGrid = [
      createCell('drum', 1, 'none'),
      createCell('f_sushi', 1, 'none'),
      createCell('neko', 1, 'none'),
      createCell('lantern', 1, 'none')
    ];

    state.grid = [
      // Col 0 (5 cells)
      [
        createCell('card_a', 1, 'none'),
        createCell('lantern', 1, 'none'),
        createCell('scatter', 1, 'none'),
        createCell('card_q', 1, 'none'),
        createCell('sushi', 1, 'none')
      ],
      // Col 1 (2 cells: 3-high Gold Neko + 2-high Silver Drum)
      [
        createCell('neko', 3, 'gold'),
        createCell('drum', 2, 'silver')
      ],
      // Col 2 (5 cells)
      [
        createCell('wild', 1, 'none'),
        createCell('wild', 1, 'none'),
        createCell('wild', 1, 'none'),
        createCell('card_j', 1, 'none'),
        createCell('card_q', 1, 'none')
      ],
      // Col 3 (5 cells)
      [
        createCell('wild', 1, 'none'),
        createCell('card_k', 1, 'none'),
        createCell('card_10', 1, 'none'),
        createCell('sushi', 1, 'none'),
        createCell('sushi', 1, 'none')
      ],
      // Col 4 (3 cells: 2-high Silver Lantern + 1-high Wild + 2-high Gold Fan)
      [
        createCell('lantern', 2, 'silver'),
        createCell('wild', 1, 'none'),
        createCell('fan', 2, 'gold')
      ],
      // Col 5 (5 cells)
      [
        createCell('card_10', 1, 'none'),
        createCell('fan', 1, 'none'),
        createCell('scatter', 1, 'none'),
        createCell('card_j', 1, 'none'),
        createCell('f_sushi', 1, 'none')
      ]
    ];

    calculateAndRenderWays();
  }

  function calculateAndRenderWays() {
    if (!state.grid || state.grid.length < COLS) return 10800;
    let ways = 1;
    for (let c = 0; c < COLS; c++) {
      const mainCount = state.grid[c].length;
      const topCount = (c >= 1 && c <= 4) ? 1 : 0;
      ways *= (mainCount + topCount);
    }
    state.waysCount = ways;
    if (els.waysSpritesBox) {
      els.waysSpritesBox.innerHTML = window.NekoTiles.renderWaysSprites(ways);
    }
    return ways;
  }

  function renderTopReel(isBlurred = false) {
    if (!els.topReelBoard) return;
    els.topReelBoard.innerHTML = '';
    for (let i = 0; i < TOP_REEL_CELLS; i++) {
      const cell = state.topGrid[i];
      const slot = document.createElement('div');
      slot.className = 'top-cell-slot';
      slot.dataset.topIdx = i;
      slot.innerHTML = window.NekoTiles.renderTileHTML(cell, isBlurred);
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!state.isSpinning && cell) showSymbolPayoutPopup(cell.type);
      });
      els.topReelBoard.appendChild(slot);
    }
  }

  function renderMainReels(isBlurred = false) {
    els.reelBoard.innerHTML = '';
    els.reelCols = [];

    for (let c = 0; c < COLS; c++) {
      const colEl = document.createElement('div');
      colEl.className = 'neko-reel-col';
      colEl.dataset.col = c;

      const trackEl = document.createElement('div');
      trackEl.className = 'neko-reel-track';

      const colCells = state.grid[c] || [];
      colCells.forEach((cell, idx) => {
        const span = cell.span || 1;
        const cellEl = document.createElement('div');
        cellEl.className = `neko-cell-slot span-${span}`;
        cellEl.dataset.col = c;
        cellEl.dataset.idx = idx;
        cellEl.innerHTML = window.NekoTiles.renderTileHTML(cell, isBlurred);
        cellEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!state.isSpinning && cell) showSymbolPayoutPopup(cell.type);
        });
        trackEl.appendChild(cellEl);
      });

      colEl.appendChild(trackEl);
      els.reelBoard.appendChild(colEl);
      els.reelCols.push(colEl);
    }
  }

  function renderAllReels(isBlurred = false) {
    renderTopReel(isBlurred);
    renderMainReels(isBlurred);
    calculateAndRenderWays();
  }

  // Show authentic Symbol Payout Popup when a player taps any tile on the board
  function showSymbolPayoutPopup(symType) {
    const sym = window.NekoTiles.SYMBOLS[symType];
    if (!sym || !els.symbolPayoutPopup) return;
    window.MahjongSound.playTileClick();

    const previewCell = { type: symType, span: 1, silver: false, gold: false };
    let paysHTML = '';
    if (symType === 'wild') {
      paysHTML = `<div style="font-size:11px;line-height:1.35;">Simbol Wild menggantikan semua simbol kecuali simbol Scatter.</div>`;
    } else if (symType === 'scatter') {
      paysHTML = `<div style="font-size:11px;line-height:1.35;">4 simbol Scatter di mana saja memicu 10 Putaran Gratis.</div>`;
    } else {
      paysHTML = [6, 5, 4, 3].map(n =>
        `<div class="payout-row"><span>${n}</span><span>${sym.pays[n]}</span></div>`
      ).join('');
    }

    els.symbolPayoutCard.innerHTML = `
      <div class="payout-popup-sym">${window.NekoTiles.renderTileHTML(previewCell, false)}</div>
      <div class="payout-popup-table">${paysHTML}</div>
    `;
    els.symbolPayoutPopup.classList.remove('hidden');
  }

  function updateDashboardUI() {
    els.balanceVal.textContent = formatIDR(state.balance);
    els.betVal.textContent = formatIDR(BET_OPTIONS[state.betIndex]);

    // Cat Multiplier Plaque in Shrine
    const displayMult = state.inFreeSpins ? Math.max(2, state.catMultiplier) : state.catMultiplier;
    if (displayMult >= 2) {
      els.catBadge.classList.add('active');
      els.catMultVal.innerHTML = window.NekoTiles.renderMultiplierSprites(displayMult);
    } else {
      els.catBadge.classList.remove('active');
      els.catMultVal.innerHTML = '';
    }

    // Auto Spin button state
    if (state.autoSpinsRemaining > 0) {
      els.autoBadge.style.display = 'flex';
      els.autoBadge.textContent = state.autoSpinsRemaining > 999 ? '∞' : state.autoSpinsRemaining;
      if (els.spinAutoRing) els.spinAutoRing.classList.remove('hidden');
      els.spinBtn.classList.add('auto-active');
    } else {
      els.autoBadge.style.display = 'none';
      if (els.spinAutoRing) els.spinAutoRing.classList.add('hidden');
      els.spinBtn.classList.remove('auto-active');
    }

    // Free Spins Night Mode & Remaining Counter Bar
    if (state.inFreeSpins) {
      els.gameShell.classList.add('free-spin-active');
      els.controlsRow.classList.add('hidden');
      els.freeSpinCounterBar.classList.remove('hidden');

      if (state.freeSpinsRemaining <= 1) {
        els.rfsLabelImg.classList.add('hidden');
        els.rfsCountSprites.classList.add('hidden');
        els.lfsLabelImg.classList.remove('hidden');
      } else {
        els.rfsLabelImg.classList.remove('hidden');
        els.rfsCountSprites.classList.remove('hidden');
        els.lfsLabelImg.classList.add('hidden');
        els.rfsCountSprites.innerHTML = window.NekoTiles.renderCelebrationNumberSprites(state.freeSpinsRemaining, 'fs_count');
      }
    } else {
      els.gameShell.classList.remove('free-spin-active');
      els.controlsRow.classList.remove('hidden');
      els.freeSpinCounterBar.classList.add('hidden');
    }
  }

  // Infoboard Win / Total Win Display using authentic PG Soft sprites
  function showBannerWin(amount, isTotalWin = false) {
    if (amount <= 0) {
      els.bannerWin.classList.remove('win-mode');
      els.ibBarBg.src = `${NEKO_DIR}ib_bar_a_tight.png`;
      els.ibTipMarquee.classList.remove('hidden');
      els.ibWinDisplay.classList.add('hidden');
      return;
    }

    els.bannerWin.classList.add('win-mode');
    els.ibBarBg.src = isTotalWin ? `${NEKO_DIR}ib_bar_c_tight.png` : `${NEKO_DIR}ib_bar_b_tight.png`;
    els.ibWinTag.src = isTotalWin ? `${NEKO_DIR}tw_info_tight.png` : `${NEKO_DIR}win_info_tight.png`;
    els.bannerWinVal.innerHTML = window.NekoTiles.renderInfoAmountSprites(amount);
    els.ibTipMarquee.classList.add('hidden');
    els.ibWinDisplay.classList.remove('hidden');

    els.winVal.textContent = formatIDR(amount);
    els.pillWinBox.classList.remove('hidden');
    els.pgShieldIcon.classList.add('hidden');
  }

  function highlightCatBadge() {
    els.catBadge.classList.add('active', 'glowing');
    setTimeout(() => els.catBadge.classList.remove('glowing'), 950);
  }

  // Evaluate 6-Reel + 4-Cell Top Horizontal Reel Ways to Win
  function evaluateWaysWin() {
    const symbolTypes = Object.keys(window.NekoTiles.SYMBOLS).filter(k => k !== 'scatter' && k !== 'wild');
    let baseWin = 0;
    const winningMainMap = new Map(); // key: `${c}_${idx}`
    const winningTopSet = new Set();  // topIdx 0..3
    const winDetails = [];

    for (const symType of symbolTypes) {
      const countsPerCol = [];
      const mainCoordsPerCol = [];
      const topCoordsPerCol = [];

      for (let c = 0; c < COLS; c++) {
        let countInCol = 0;
        const mCoords = [];
        const tCoords = [];

        // Check main reel column c
        const colCells = state.grid[c] || [];
        colCells.forEach((cell, idx) => {
          if (cell && (cell.type === symType || cell.type === 'wild')) {
            countInCol++;
            mCoords.push({ c, idx });
          }
        });

        // Check top horizontal reel if column is 1, 2, 3, or 4
        if (c >= 1 && c <= 4) {
          const topIdx = c - 1;
          const topCell = state.topGrid[topIdx];
          if (topCell && (topCell.type === symType || topCell.type === 'wild')) {
            countInCol++;
            tCoords.push(topIdx);
          }
        }

        if (countInCol > 0) {
          countsPerCol.push(countInCol);
          mainCoordsPerCol.push(mCoords);
          topCoordsPerCol.push(tCoords);
        } else {
          break; // Consecutive from reel 0 required
        }
      }

      const matchLength = countsPerCol.length;
      if (matchLength >= 3) {
        const payVal = window.NekoTiles.SYMBOLS[symType].pays[matchLength] || 0;
        if (payVal > 0) {
          const ways = countsPerCol.reduce((a, b) => a * b, 1);
          const currentBet = BET_OPTIONS[state.betIndex];
          const betUnit = currentBet / 20;
          const comboPayout = Math.round(ways * payVal * (betUnit / 20));

          baseWin += comboPayout;
          winDetails.push({ symbol: symType, matchLength, ways, payout: comboPayout });

          for (let c = 0; c < matchLength; c++) {
            mainCoordsPerCol[c].forEach(coord => winningMainMap.set(`${coord.c}_${coord.idx}`, coord));
            topCoordsPerCol[c].forEach(tIdx => winningTopSet.add(tIdx));
          }
        }
      }
    }

    return {
      totalWin: baseWin,
      winningMain: Array.from(winningMainMap.values()),
      winningTop: Array.from(winningTopSet),
      winDetails
    };
  }

  // Count and animate Lucky Cat (+2 Multiplier per Cat symbol on board)
  async function checkAndApplyCatMultipliers(countedIds) {
    let newCats = 0;

    // Check Top Horizontal Reel
    for (let i = 0; i < TOP_REEL_CELLS; i++) {
      const cell = state.topGrid[i];
      if (cell && cell.type === 'neko' && !countedIds.has(cell.id)) {
        countedIds.add(cell.id);
        newCats++;
        const slot = els.topReelBoard.children[i];
        if (slot) slot.classList.add('cat-bounce');
      }
    }

    // Check Main 6x5 Reel
    for (let c = 0; c < COLS; c++) {
      const colCells = state.grid[c] || [];
      colCells.forEach((cell, idx) => {
        if (cell && cell.type === 'neko' && !countedIds.has(cell.id)) {
          countedIds.add(cell.id);
          newCats++;
          const slot = els.reelCols[c].querySelector(`.neko-cell-slot[data-idx="${idx}"]`);
          if (slot) slot.classList.add('cat-bounce');
        }
      });
    }

    if (newCats > 0) {
      state.catMultiplier += newCats * 2;
      highlightCatBadge();
      updateDashboardUI();
      window.MahjongSound.playMultiplierUp(Math.min(3, newCats));
      await sleep(420, 200);
    }
  }

  // Core Spin Execution
  async function spin(forcedMode = null) {
    if (state.isSpinning) return;
    if (els.symbolPayoutPopup) els.symbolPayoutPopup.classList.add('hidden');
    if (els.utilityDrawer) els.utilityDrawer.classList.add('hidden');

    const currentBet = BET_OPTIONS[state.betIndex];

    if (!state.inFreeSpins) {
      if (forcedMode !== 'feature_buy') {
        if (state.balance < currentBet) {
          alert('Saldo tidak mencukupi! Klik dompet saldo di kiri bawah untuk isi ulang demo Rp1.000.000.');
          state.autoSpinsRemaining = 0;
          updateDashboardUI();
          return;
        }
        state.balance -= currentBet;
      }
      state.catMultiplier = 0; // Reset on normal spin
      showBannerWin(0, false);
    }

    state.isSpinning = true;
    els.spinBtn.classList.add('spinning-state');
    els.spinArrowImg.src = `${NEKO_DIR}sb_arrow_tight.png`;
    updateDashboardUI();

    window.MahjongSound.playSpinStart();

    // 1. Start Spin Blur Animation on Top Reel & Main 6 Columns
    els.topReelBoard.classList.add('top-spinning');
    els.reelCols.forEach(col => col.classList.add('reel-spinning'));

    await sleep(420, 160);

    // 2. Generate New Symbols for Top Reel and Main 6x5 Reel
    state.topGrid = [];
    for (let i = 0; i < TOP_REEL_CELLS; i++) {
      state.topGrid.push(createCell(null, 1));
    }
    state.grid = [];
    for (let c = 0; c < COLS; c++) {
      state.grid.push(generateColumnCells(c));
    }

    // Apply Forced Demo / Feature Buy Outcomes if requested
    if (forcedMode === 'scatter' || forcedMode === 'feature_buy') {
      state.grid[0][1] = createCell('scatter', 1, 'none');
      state.grid[1][0] = createCell('scatter', state.grid[1][0].span, 'none');
      state.grid[3][0] = createCell('scatter', state.grid[3][0].span, 'none');
      state.grid[5][2] = createCell('scatter', 1, 'none');
    } else if (forcedMode === 'cat_win') {
      state.topGrid[0] = createCell('neko', 1, 'none');
      state.topGrid[2] = createCell('neko', 1, 'none');
      state.grid[0][0] = createCell('drum', 1, 'none');
      state.grid[0][1] = createCell('neko', 1, 'none');
      state.grid[1] = [createCell('drum', 2, 'gold'), createCell('neko', 3, 'silver')];
      state.grid[2] = [createCell('wild', 2, 'none'), createCell('drum', 3, 'gold')];
      state.grid[3] = [createCell('drum', 2, 'silver'), createCell('wild', 1, 'none'), createCell('neko', 2, 'none')];
    }

    // 3. Stop Top Horizontal Reel & Main Reels Left-to-Right
    els.topReelBoard.classList.remove('top-spinning');
    renderTopReel(false);

    for (let c = 0; c < COLS; c++) {
      await sleep(115, 40);
      els.reelCols[c].classList.remove('reel-spinning');
      const track = els.reelCols[c].querySelector('.neko-reel-track');
      track.innerHTML = '';
      state.grid[c].forEach((cell, idx) => {
        const span = cell.span || 1;
        const cellEl = document.createElement('div');
        cellEl.className = `neko-cell-slot span-${span}`;
        cellEl.dataset.col = c;
        cellEl.dataset.idx = idx;
        cellEl.innerHTML = window.NekoTiles.renderTileHTML(cell, false);
        cellEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!state.isSpinning && cell) showSymbolPayoutPopup(cell.type);
        });
        track.appendChild(cellEl);
      });

      const hasScatter = state.grid[c].some(cell => cell.type === 'scatter');
      window.MahjongSound.playReelStop(hasScatter, state.isTurbo);
    }

    calculateAndRenderWays();
    window.MahjongSound.stopSpinLoop();
    els.spinBtn.classList.remove('spinning-state');
    els.spinArrowImg.src = `${NEKO_DIR}sb_arrow_grey_tight.png`;

    // Track counted Neko cat symbols during this spin's cascades
    const countedCatIds = new Set();
    await checkAndApplyCatMultipliers(countedCatIds);

    // 4. Cascading & Wilds-on-the-Way Loop
    let spinTotalWin = 0;
    let cascadeStep = 0;

    while (true) {
      const result = evaluateWaysWin();
      if (result.totalWin <= 0) break;

      cascadeStep++;
      const activeMult = Math.max(1, state.inFreeSpins ? Math.max(2, state.catMultiplier) : state.catMultiplier);
      const stepWin = result.totalWin * activeMult;
      spinTotalWin += stepWin;
      state.balance += stepWin;

      // Highlight winning cells on Top Reel & Main Reel
      result.winningTop.forEach(tIdx => {
        const slot = els.topReelBoard.children[tIdx];
        if (slot) slot.classList.add('winning-cell');
      });
      result.winningMain.forEach(({ c, idx }) => {
        const slot = els.reelCols[c].querySelector(`.neko-cell-slot[data-idx="${idx}"]`);
        if (slot) slot.classList.add('winning-cell');
      });

      window.MahjongSound.playCascadeWin(cascadeStep - 1, null, result.winDetails.length > 1);
      showBannerWin(stepWin, false);
      updateDashboardUI();

      await sleep(700, 320);

      // Wilds-on-the-Way Transformation:
      // Silver Frame -> Random Symbol with Gold Frame
      // Gold Frame   -> WILD
      // Normal       -> Shatter & Cascade
      let morphedAny = false;
      for (const { c, idx } of result.winningMain) {
        const cell = state.grid[c][idx];
        if (!cell) continue;
        if (cell.silver) {
          cell.type = REGULAR_TYPES[Math.floor(Math.random() * REGULAR_TYPES.length)];
          cell.silver = false;
          cell.gold = true;
          cell.id = Math.random().toString(36).slice(2, 9);
          morphedAny = true;
        } else if (cell.gold && cell.type !== 'wild') {
          cell.type = 'wild';
          cell.gold = false;
          cell.silver = false;
          cell.id = Math.random().toString(36).slice(2, 9);
          morphedAny = true;
        } else {
          state.grid[c][idx] = null;
        }
      }

      for (const tIdx of result.winningTop) {
        state.topGrid[tIdx] = null;
      }

      if (morphedAny) {
        window.MahjongSound.playGoldToWild();
      } else {
        window.MahjongSound.playTileShatter();
      }

      await sleep(300, 140);

      // Refill Top Horizontal Reel (slides right-to-left)
      const topSurvivors = state.topGrid.filter(x => x !== null);
      while (topSurvivors.length < TOP_REEL_CELLS) {
        topSurvivors.push(createCell(null, 1));
      }
      state.topGrid = topSurvivors;

      // Refill Main 6 Columns so each column's spans sum to PLAYABLE_ROWS (5)
      for (let c = 0; c < COLS; c++) {
        const survivors = state.grid[c].filter(x => x !== null);
        let usedRows = survivors.reduce((sum, cell) => sum + (cell.span || 1), 0);
        while (usedRows < PLAYABLE_ROWS) {
          const rem = PLAYABLE_ROWS - usedRows;
          let span = 1;
          if (c >= 1 && c <= 4 && rem >= 2 && Math.random() < 0.35) {
            span = 2;
          }
          survivors.unshift(createCell(null, span));
          usedRows += span;
        }
        state.grid[c] = survivors;
      }

      renderAllReels(false);
      window.MahjongSound.playTileCollapseImpact();
      await sleep(340, 160);

      // Check if any newly cascaded Neko symbols landed
      await checkAndApplyCatMultipliers(countedCatIds);
    }

    // Show Total Win on Infoboard if won
    if (spinTotalWin > 0) {
      showBannerWin(spinTotalWin, true);
      state.history.unshift({
        time: new Date().toTimeString().slice(0, 8),
        bet: currentBet,
        win: spinTotalWin,
        mult: Math.max(1, state.catMultiplier)
      });
      if (state.history.length > 30) state.history.pop();
    }

    // 5. Big Win / Mega Win / Super Mega Win Celebration if spinTotalWin >= 15x bet
    if (spinTotalWin >= currentBet * 15) {
      window.MahjongSound.playScatterTrigger(false);
      let tier = 'bw'; // MENANG BESAR
      if (spinTotalWin >= currentBet * 50) tier = 'smw'; // MENANG SUPER LUAR BIASA
      else if (spinTotalWin >= currentBet * 30) tier = 'mw'; // MENANG LUAR BIASA
      await showCelebrationModal(tier, spinTotalWin);
    }

    // 6. Check Scatters for Free Spins Trigger (4 Scatters = 10 Free Spins, +2 per extra Scatter)
    let scatterCount = 0;
    state.topGrid.forEach(cell => { if (cell && cell.type === 'scatter') scatterCount++; });
    for (let c = 0; c < COLS; c++) {
      state.grid[c].forEach(cell => { if (cell && cell.type === 'scatter') scatterCount++; });
    }

    if (scatterCount >= 4 && !state.inFreeSpins) {
      const awarded = 10 + (scatterCount - 4) * 2;
      window.MahjongSound.playScatterTrigger(true);
      await showFreeSpinsIntroModal(awarded);
      state.inFreeSpins = true;
      state.freeSpinsRemaining = awarded;
      state.freeSpinsTotalAwarded = awarded;
      state.freeSpinsTotalWon = 0;
      state.catMultiplier = 2; // Free Spins always start with x2 Cat Multiplier
      window.MahjongSound.startBgm(true);
      updateDashboardUI();
    } else if (state.inFreeSpins) {
      if (scatterCount >= 4) {
        const extra = 10 + (scatterCount - 4) * 2;
        state.freeSpinsRemaining += extra;
        state.freeSpinsTotalAwarded += extra;
      }
      state.freeSpinsRemaining--;
      state.freeSpinsTotalWon += spinTotalWin;
      updateDashboardUI();

      if (state.freeSpinsRemaining <= 0) {
        await sleep(500, 250);
        await showCelebrationModal('tw', state.freeSpinsTotalWon);
        state.inFreeSpins = false;
        state.freeSpinsTotalWon = 0;
        state.catMultiplier = 0;
        window.MahjongSound.startBgm(false);
        updateDashboardUI();
      }
    }

    state.isSpinning = false;
    updateDashboardUI();

    // Continue Free Spins or Auto Spins automatically
    if (state.inFreeSpins && state.freeSpinsRemaining > 0) {
      setTimeout(() => spin(), state.isTurbo ? 420 : 800);
    } else if (state.autoSpinsRemaining > 0) {
      state.autoSpinsRemaining--;
      updateDashboardUI();
      if (state.autoSpinsRemaining > 0) {
        setTimeout(() => spin(), state.isTurbo ? 350 : 750);
      }
    }
  }

  // Authentic Free Spins Intro Modal (fs_bg.jpg + fsw_tight.png + MULAI button)
  function showFreeSpinsIntroModal(spinsAwarded) {
    return new Promise(resolve => {
      els.fsWonCountSprites.innerHTML = window.NekoTiles.renderCelebrationNumberSprites(spinsAwarded, 'fs_count');
      els.fsIntroModal.classList.add('active');

      const onStart = () => {
        els.fsStartBtn.removeEventListener('click', onStart);
        window.MahjongSound.playCollect();
        els.fsIntroModal.classList.remove('active');
        resolve();
      };
      els.fsStartBtn.addEventListener('click', onStart);
    });
  }

  // Authentic Big Win / Mega Win / Super Mega Win / Total Win Celebration Modal
  function showCelebrationModal(tier, amount) {
    return new Promise(resolve => {
      const spriteMap = {
        bw: 'bw_tight.png',
        mw: 'mw_tight.png',
        smw: 'smw_tight.png',
        tw: 'tw_tight.png'
      };
      els.celebTitleImg.src = `${NEKO_DIR}${spriteMap[tier] || 'bw_tight.png'}`;
      els.celebModal.classList.add('active');

      let current = 0;
      const step = Math.max(1, Math.floor(amount / 32));
      let finished = false;

      const finishRollup = () => {
        if (finished) return;
        finished = true;
        clearInterval(timer);
        els.celebAmountSprites.innerHTML = window.NekoTiles.renderCelebrationNumberSprites(amount, tier === 'tw' ? 'tw' : 'bw');
        els.celebAmount.textContent = formatIDR(amount);
        window.MahjongSound.playBigWinEnd();
      };

      const closeCelebration = () => {
        if (!finished) {
          finishRollup();
          return;
        }
        els.celebCollectBtn.removeEventListener('click', closeCelebration);
        clearInterval(timer);
        window.MahjongSound.playCollect();
        els.celebModal.classList.remove('active');
        resolve();
      };

      els.celebCollectBtn.addEventListener('click', closeCelebration);

      const timer = setInterval(() => {
        current = Math.min(amount, current + step);
        els.celebAmountSprites.innerHTML = window.NekoTiles.renderCelebrationNumberSprites(current, tier === 'tw' ? 'tw' : 'bw');
        els.celebAmount.textContent = formatIDR(current);
        window.MahjongSound.playCoinTick();

        if (current >= amount) {
          finishRollup();
          setTimeout(() => {
            if (els.celebModal.classList.contains('active')) {
              closeCelebration();
            }
          }, 2200);
        }
      }, 45);
    });
  }

  // Spawn Falling Sakura Petals on Top Temple Roof
  function initSakuraPetals() {
    if (!els.sakuraPetalsLayer) return;
    els.sakuraPetalsLayer.innerHTML = '';
    for (let i = 0; i < 14; i++) {
      const petal = document.createElement('div');
      petal.className = 'sakura-petal';
      petal.style.left = `${Math.random() * 95}%`;
      petal.style.animationDuration = `${4.5 + Math.random() * 4.5}s`;
      petal.style.animationDelay = `${Math.random() * 5}s`;
      const size = 7 + Math.random() * 6;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 0.72}px`;
      els.sakuraPetalsLayer.appendChild(petal);
    }
  }

  // Rotate Infoboard Idle Tip Sprites (info_1_text .. info_4_text)
  function startInfoboardTipCycle() {
    setInterval(() => {
      if (state.isSpinning || els.bannerWin.classList.contains('win-mode')) return;
      state.tipIndex = (state.tipIndex % 4) + 1;
      if (els.ibTipSprite) {
        els.ibTipSprite.src = `${NEKO_DIR}info_${state.tipIndex}_text_tight.png`;
      }
    }, 9000);
  }

  function setupEvents() {
    els.startBtn.addEventListener('click', () => {
      window.MahjongSound.init();
      window.MahjongSound.playStartGameButton();
      window.MahjongSound.startBgm(false);
      els.splashOverlay.classList.add('fade-out');
    });

    els.spinBtn.addEventListener('click', () => {
      if (state.autoSpinsRemaining > 0) {
        state.autoSpinsRemaining = 0;
        updateDashboardUI();
        return;
      }
      spin();
    });

    els.turboBtn.addEventListener('click', () => {
      state.isTurbo = !state.isTurbo;
      els.turboIconImg.src = state.isTurbo
        ? `${NEKO_DIR}turbo_on_tight.png`
        : `${NEKO_DIR}turbo_off_tight.png`;
      window.MahjongSound.playUiClick();
    });

    els.betMinusBtn.addEventListener('click', () => {
      if (state.isSpinning || state.inFreeSpins) return;
      state.betIndex = Math.max(0, state.betIndex - 1);
      window.MahjongSound.playUiClick();
      updateDashboardUI();
    });

    els.betPlusBtn.addEventListener('click', () => {
      if (state.isSpinning || state.inFreeSpins) return;
      state.betIndex = Math.min(BET_OPTIONS.length - 1, state.betIndex + 1);
      window.MahjongSound.playUiClick();
      updateDashboardUI();
    });

    // Feature Buy ("BELI FITUR" — 75x Bet)
    if (els.featureBuyBtn) {
      els.featureBuyBtn.addEventListener('click', () => {
        if (state.isSpinning || state.inFreeSpins) return;
        window.MahjongSound.playUiClick();
        const cost = BET_OPTIONS[state.betIndex] * 75;
        els.fbModalPrice.textContent = formatIDR(cost);
        els.featureBuyModal.classList.add('open');
      });
    }

    if (els.fbCancelBtn) {
      els.fbCancelBtn.addEventListener('click', () => {
        window.MahjongSound.playUiClick();
        els.featureBuyModal.classList.remove('open');
      });
    }

    if (els.fbConfirmBtn) {
      els.fbConfirmBtn.addEventListener('click', () => {
        const cost = BET_OPTIONS[state.betIndex] * 75;
        if (state.balance < cost) {
          alert('Saldo tidak mencukupi untuk Beli Fitur! Klik dompet saldo untuk isi ulang demo.');
          return;
        }
        state.balance -= cost;
        els.featureBuyModal.classList.remove('open');
        updateDashboardUI();
        spin('feature_buy');
      });
    }

    els.autoBtn.addEventListener('click', () => {
      if (state.inFreeSpins) return;
      window.MahjongSound.playUiClick();
      els.autoSheetModal.classList.add('open');
    });

    document.querySelectorAll('.auto-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.spins, 10);
        state.autoSpinsRemaining = count;
        els.autoSheetModal.classList.remove('open');
        updateDashboardUI();
        spin();
      });
    });

    els.closeAutoSheetBtn.addEventListener('click', () => {
      els.autoSheetModal.classList.remove('open');
    });

    // Hamburger Menu Toggle
    if (els.menuToggleBtn) {
      els.menuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.MahjongSound.playUiClick();
        els.utilityDrawer.classList.toggle('hidden');
      });
    }

    if (els.symbolPayoutPopup) {
      els.symbolPayoutPopup.addEventListener('click', () => {
        els.symbolPayoutPopup.classList.add('hidden');
      });
    }

    els.walletMeterBtn.addEventListener('click', () => {
      window.MahjongSound.playUiClick();
      state.balance += 1000000;
      updateDashboardUI();
    });

    els.betMeterBtn.addEventListener('click', () => {
      if (state.inFreeSpins) return;
      window.MahjongSound.playUiClick();
      buildBetGrid();
      els.betSheetModal.classList.add('open');
    });

    els.closeBetSheetBtn.addEventListener('click', () => {
      els.betSheetModal.classList.remove('open');
    });

    function buildBetGrid() {
      els.betOptionsGrid.innerHTML = '';
      BET_OPTIONS.forEach((val, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `bet-choice-btn ${idx === state.betIndex ? 'active' : ''}`;
        btn.textContent = formatIDR(val);
        btn.addEventListener('click', () => {
          state.betIndex = idx;
          els.betSheetModal.classList.remove('open');
          updateDashboardUI();
        });
        els.betOptionsGrid.appendChild(btn);
      });
    }

    // Demo Menu (Instant 4 Scatters or Cat Win)
    els.demoMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.MahjongSound.playUiClick();
      els.demoPopupMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      els.demoPopupMenu.classList.add('hidden');
    });

    els.demoScatterBtn.addEventListener('click', () => {
      els.demoPopupMenu.classList.add('hidden');
      spin('scatter');
    });

    els.demoCatWinBtn.addEventListener('click', () => {
      els.demoPopupMenu.classList.add('hidden');
      spin('cat_win');
    });

    els.soundToggleBtn.addEventListener('click', () => {
      const on = window.MahjongSound.toggleMute();
      if (els.soundSpIc) {
        els.soundSpIc.src = on
          ? `${NEKO_DIR}sound_on_tight.png`
          : `${NEKO_DIR}sound_off_tight.png`;
      }
      els.soundToggleBtn.classList.toggle('muted', !on);
    });

    const openPaytable = () => {
      window.MahjongSound.playUiClick();
      buildPaytable();
      els.paytableModal.classList.add('open');
      els.utilityDrawer.classList.add('hidden');
    };
    els.paytableBtn.addEventListener('click', openPaytable);
    if (els.rulesBtn) els.rulesBtn.addEventListener('click', openPaytable);

    els.closePaytableBtn.addEventListener('click', () => {
      els.paytableModal.classList.remove('open');
    });

    function buildPaytable() {
      els.paytableGrid.innerHTML = '';
      Object.values(window.NekoTiles.SYMBOLS).forEach(sym => {
        const item = document.createElement('div');
        item.className = 'paytable-item';
        const sampleCell = { type: sym.id, span: 1, silver: false, gold: false };
        item.innerHTML = `
          <div style="width:56px;height:56px;margin:0 auto 6px;position:relative;">
            ${window.NekoTiles.renderTileHTML(sampleCell, false)}
          </div>
          <div style="font-weight:800;font-size:11px;color:#ffe082;">${sym.name}</div>
          <div style="font-size:10px;color:#e0e0e0;margin-top:4px;">
            ${sym.pays[6] ? `6: ${sym.pays[6]} | ` : ''}5: ${sym.pays[5] || '-'} | 4: ${sym.pays[4] || '-'} | 3: ${sym.pays[3] || '-'}
          </div>
        `;
        els.paytableGrid.appendChild(item);
      });
    }

    if (els.historyBtn) {
      els.historyBtn.addEventListener('click', () => {
        window.MahjongSound.playUiClick();
        buildHistoryList();
        els.historyModal.classList.add('open');
        els.utilityDrawer.classList.add('hidden');
      });
    }

    if (els.closeHistoryBtn) {
      els.closeHistoryBtn.addEventListener('click', () => {
        els.historyModal.classList.remove('open');
      });
    }

    function buildHistoryList() {
      if (!els.historyList) return;
      if (state.history.length === 0) {
        els.historyList.innerHTML = '<div style="text-align:center;color:#aaa;padding:16px;">Belum ada riwayat kemenangan.</div>';
        return;
      }
      els.historyList.innerHTML = state.history.map(h => `
        <div class="history-row">
          <span>${h.time} (x${h.mult})</span>
          <span style="color:#ffd54f;font-weight:800;">+${formatIDR(h.win)}</span>
        </div>
      `).join('');
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !state.isSpinning) {
        e.preventDefault();
        spin();
      }
    });

    // PWA Install Prompt
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      if (els.installPwaBtn) els.installPwaBtn.classList.add('pwa-ready');
    });

    if (els.installPwaBtn) {
      els.installPwaBtn.addEventListener('click', async () => {
        window.MahjongSound.playUiClick();
        els.utilityDrawer.classList.add('hidden');
        if (deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
        } else {
          els.installGuideModal.classList.add('open');
        }
      });
    }

    if (els.closeInstallGuideBtn) {
      els.closeInstallGuideBtn.addEventListener('click', () => {
        els.installGuideModal.classList.remove('open');
      });
    }
  }

  // Initialize Game on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    initializeDefaultBoard();
    renderAllReels(false);
    initSakuraPetals();
    updateDashboardUI();
    setupEvents();
    startInfoboardTipCycle();

    // Authentic Splash Loading Bar Progression ("Memuat Permainan [XX%]")
    let p = 0;
    const progressTimer = setInterval(() => {
      p += Math.floor(Math.random() * 18) + 12;
      if (p >= 100) {
        p = 100;
        clearInterval(progressTimer);
        setTimeout(() => {
          els.splashProgress.style.display = 'none';
          els.splashCenterCta.style.display = 'flex';
        }, 220);
      }
      if (els.splashProgressFill) els.splashProgressFill.style.width = p + '%';
      if (els.splashProgressText) els.splashProgressText.textContent = `Memuat Permainan [${p}%]`;
    }, 140);
  });
})();
