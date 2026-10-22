// Official PG Soft Lucky Neko (Kucing Keberuntungan) - Core Engine
// 6 Reels x 5 Rows Cascading Tumbling Engine with Lucky Cat +2 Multipliers & 32,400 Ways
(function () {
  const COLS = 6;
  const PLAYABLE_ROWS = 5;
  const SPRITE_DIR = 'assets/sprites/';

  const BET_OPTIONS = [
    200, 400, 600, 800, 1000, 1500, 2000, 3000, 4000, 5000,
    10000, 15000, 20000, 30000, 40000, 50000, 75000, 100000
  ];

  const state = {
    balance: 1000000,
    betIndex: 6, // Rp 2.000,00
    isSpinning: false,
    isTurbo: false,
    autoSpinsRemaining: 0,
    inFreeSpins: false,
    freeSpinsRemaining: 0,
    freeSpinsTotalWon: 0,
    catMultiplier: 1, // Signature Lucky Neko feature: +2 per Cat
    grid: [],
    history: []
  };

  const els = {
    appBackdrop: document.getElementById('appBackdrop'),
    gameShell: document.getElementById('gameShell'),
    splashOverlay: document.getElementById('splashOverlay'),
    splashProgress: document.getElementById('splashProgress'),
    splashCenterCta: document.getElementById('splashCenterCta'),
    startBtn: document.getElementById('startBtn'),
    reelBoard: document.getElementById('reelBoard'),
    reelCols: [],
    catBadge: document.getElementById('catBadge'),
    catMultVal: document.getElementById('catMultVal'),
    balanceVal: document.getElementById('balanceVal'),
    betVal: document.getElementById('betVal'),
    winVal: document.getElementById('winVal'),
    pillWinBox: document.getElementById('pillWinBox'),
    pgShieldIcon: document.getElementById('pgShieldIcon'),
    bannerWin: document.getElementById('bannerWin'),
    bannerWinVal: document.getElementById('bannerWinVal'),
    spinBtn: document.getElementById('spinBtn'),
    spinArrowImg: document.getElementById('spinArrowImg'),
    autoBadge: document.getElementById('autoBadge'),
    turboBtn: document.getElementById('turboBtn'),
    turboIconImg: document.getElementById('turboIconImg'),
    betMinusBtn: document.getElementById('betMinusBtn'),
    betPlusBtn: document.getElementById('betPlusBtn'),
    autoBtn: document.getElementById('autoBtn'),
    walletMeterBtn: document.getElementById('walletMeterBtn'),
    winMeterBtn: document.getElementById('winMeterBtn'),
    betMeterBtn: document.getElementById('betMeterBtn'),
    demoMenuBtn: document.getElementById('demoMenuBtn'),
    demoPopupMenu: document.getElementById('demoPopupMenu'),
    demoScatterBtn: document.getElementById('demoScatterBtn'),
    demoCatWinBtn: document.getElementById('demoCatWinBtn'),
    celebModal: document.getElementById('celebModal'),
    celebTitle: document.getElementById('celebTitle'),
    celebAmount: document.getElementById('celebAmount'),
    coinCanvas: document.getElementById('coinCanvas'),
    betSheetModal: document.getElementById('betSheetModal'),
    betOptionsGrid: document.getElementById('betOptionsGrid'),
    closeBetSheetBtn: document.getElementById('closeBetSheetBtn'),
    autoSheetModal: document.getElementById('autoSheetModal'),
    closeAutoSheetBtn: document.getElementById('closeAutoSheetBtn'),
    historyModal: document.getElementById('historyModal'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    historyList: document.getElementById('historyList'),
    paytableModal: document.getElementById('paytableModal'),
    paytableBtn: document.getElementById('paytableBtn'),
    closePaytableBtn: document.getElementById('closePaytableBtn'),
    paytableGrid: document.getElementById('paytableGrid'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
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

  // Symbol distribution with Lucky Neko cat, daruma, lantern, etc.
  const WEIGHTED_POOL = [
    { type: 'neko', weight: 6 }, // Lucky Cat (+2 multiplier)
    { type: 'scatter', weight: 4 },
    { type: 'wild', weight: 6 },
    { type: 'drum', weight: 14 },
    { type: 'lantern', weight: 14 },
    { type: 'fan', weight: 16 },
    { type: 'sushi', weight: 18 },
    { type: 'amulet', weight: 22 },
    { type: 'card_a', weight: 26 },
    { type: 'card_k', weight: 28 },
    { type: 'card_q', weight: 30 },
    { type: 'card_j', weight: 32 },
    { type: 'card_10', weight: 34 }
  ];

  function pickRandomType() {
    const total = WEIGHTED_POOL.reduce((acc, cur) => acc + cur.weight, 0);
    let rand = Math.random() * total;
    for (const item of WEIGHTED_POOL) {
      if (rand < item.weight) return item.type;
      rand -= item.weight;
    }
    return 'drum';
  }

  function createCell(type = null, gold = null) {
    const cellType = type || pickRandomType();
    let isGold = gold;
    if (isGold === null) {
      // Golden framed symbols can appear on reels 1, 2, 3, 4 (not scatter/wild/neko)
      isGold = Math.random() < 0.16 && !['scatter', 'wild', 'neko'].includes(cellType);
    }
    return {
      type: cellType,
      gold: isGold,
      id: Math.random().toString(36).slice(2, 9)
    };
  }

  function initializeGrid() {
    state.grid = [];
    for (let c = 0; c < COLS; c++) {
      const col = [];
      for (let r = 0; r < PLAYABLE_ROWS; r++) {
        col.push(createCell());
      }
      state.grid.push(col);
    }
  }

  function renderReels() {
    els.reelBoard.innerHTML = '';
    els.reelCols = [];

    for (let c = 0; c < COLS; c++) {
      const colEl = document.createElement('div');
      colEl.className = 'neko-reel-col';
      colEl.dataset.col = c;

      const trackEl = document.createElement('div');
      trackEl.className = 'neko-reel-track';

      for (let r = 0; r < PLAYABLE_ROWS; r++) {
        const cell = state.grid[c][r];
        const cellEl = document.createElement('div');
        cellEl.className = 'neko-cell-slot';
        cellEl.dataset.col = c;
        cellEl.dataset.row = r;
        cellEl.innerHTML = window.NekoTiles.renderTileHTML(cell, false);
        trackEl.appendChild(cellEl);
      }

      colEl.appendChild(trackEl);
      els.reelBoard.appendChild(colEl);
      els.reelCols.push(colEl);
    }
  }

  function updateDashboardUI() {
    els.balanceVal.textContent = formatIDR(state.balance);
    els.betVal.textContent = formatIDR(BET_OPTIONS[state.betIndex]);
    els.catMultVal.textContent = `x${state.catMultiplier}`;

    if (state.autoSpinsRemaining > 0) {
      els.autoBadge.style.display = 'flex';
      els.autoBadge.textContent = state.autoSpinsRemaining > 99 ? '∞' : state.autoSpinsRemaining;
      els.spinBtn.classList.add('auto-active');
    } else {
      els.autoBadge.style.display = 'none';
      els.spinBtn.classList.remove('auto-active');
    }

    if (state.inFreeSpins) {
      els.gameShell.classList.add('free-spin-active');
    } else {
      els.gameShell.classList.remove('free-spin-active');
    }
  }

  function showBannerWin(amount, isPermanent = false) {
    if (amount <= 0) {
      els.bannerWin.classList.remove('active');
      return;
    }
    els.bannerWinVal.textContent = formatIDR(amount);
    els.bannerWin.classList.add('active');
    els.winVal.textContent = formatIDR(amount);
    els.pillWinBox.classList.remove('hidden');
    els.pgShieldIcon.classList.add('hidden');

    if (!isPermanent) {
      setTimeout(() => {
        if (!state.isSpinning) els.bannerWin.classList.remove('active');
      }, 2500);
    }
  }

  function highlightCatBadge() {
    els.catBadge.classList.add('glowing');
    setTimeout(() => els.catBadge.classList.remove('glowing'), 1200);
  }

  // Payways matching algorithm for 6 Reels
  function evaluateWaysWin() {
    const symbolTypes = Object.keys(window.NekoTiles.SYMBOLS).filter(k => k !== 'scatter' && k !== 'wild');
    let totalWin = 0;
    const winningCoords = [];
    const winDetails = [];

    for (const symType of symbolTypes) {
      const countsPerCol = [];
      const coordsPerCol = [];

      for (let c = 0; c < COLS; c++) {
        let countInCol = 0;
        const coordsInCol = [];
        for (let r = 0; r < PLAYABLE_ROWS; r++) {
          const cell = state.grid[c][r];
          if (cell.type === symType || cell.type === 'wild') {
            countInCol++;
            coordsInCol.push({ c, r });
          }
        }
        if (countInCol > 0) {
          countsPerCol.push(countInCol);
          coordsPerCol.push(coordsInCol);
        } else {
          break; // Must be consecutive from reel 0
        }
      }

      const matchLength = countsPerCol.length;
      if (matchLength >= 3) {
        const payVal = window.NekoTiles.SYMBOLS[symType].pays[matchLength] || 0;
        if (payVal > 0) {
          const ways = countsPerCol.reduce((a, b) => a * b, 1);
          const currentBet = BET_OPTIONS[state.betIndex];
          const baseBetUnits = currentBet / 20;
          const comboPayout = Math.round(ways * payVal * (baseBetUnits / 20));

          totalWin += comboPayout;
          winDetails.push({ symbol: symType, matchLength, ways, payout: comboPayout });

          for (let c = 0; c < matchLength; c++) {
            coordsPerCol[c].forEach(coord => winningCoords.push(coord));
          }
        }
      }
    }

    return { totalWin, winningCoords, winDetails };
  }

  // Core Spin execution
  async function spin() {
    if (state.isSpinning) return;
    const currentBet = BET_OPTIONS[state.betIndex];

    if (!state.inFreeSpins) {
      if (state.balance < currentBet) {
        alert('Saldo tidak mencukupi! Silakan klik dompet saldo untuk isi ulang demo.');
        state.autoSpinsRemaining = 0;
        updateDashboardUI();
        return;
      }
      state.balance -= currentBet;
      state.catMultiplier = 1; // Reset to 1 on regular spins
    }

    state.isSpinning = true;
    els.spinBtn.classList.add('spinning-state');
    els.bannerWin.classList.remove('active');
    updateDashboardUI();

    window.MahjongSound.playSpinStart();

    // 1. Roll animation on tracks
    els.reelCols.forEach((col, idx) => {
      col.classList.add('reel-spinning');
    });

    await sleep(450, 180);

    // 2. Generate new grid symbols
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < PLAYABLE_ROWS; r++) {
        state.grid[c][r] = createCell();
      }
    }

    // 3. Stop reels left to right
    for (let c = 0; c < COLS; c++) {
      await sleep(140, 50);
      els.reelCols[c].classList.remove('reel-spinning');
      const track = els.reelCols[c].querySelector('.neko-reel-track');
      for (let r = 0; r < PLAYABLE_ROWS; r++) {
        const slot = track.children[r];
        if (slot) {
          slot.innerHTML = window.NekoTiles.renderTileHTML(state.grid[c][r], false);
        }
      }
      window.MahjongSound.playReelStop(false, state.isTurbo);
    }

    window.MahjongSound.stopSpinLoop();
    els.spinBtn.classList.remove('spinning-state');

    // 4. Check for Lucky Cat (+2 Multiplier per Cat)
    let catCount = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < PLAYABLE_ROWS; r++) {
        if (state.grid[c][r].type === 'neko') {
          catCount++;
          const slot = els.reelCols[c].querySelector(`.neko-cell-slot[data-row="${r}"]`);
          if (slot) slot.classList.add('cat-bounce');
        }
      }
    }

    if (catCount > 0) {
      state.catMultiplier += catCount * 2;
      highlightCatBadge();
      updateDashboardUI();
      window.MahjongSound.playGeneral('prizeMedwin', 0.95);
      await sleep(500, 250);
    }

    // 5. Cascade loop
    let spinTotalWin = 0;
    let cascadeCount = 0;

    while (true) {
      const result = evaluateWaysWin();
      if (result.totalWin <= 0) break;

      cascadeCount++;
      const stepWin = result.totalWin * state.catMultiplier;
      spinTotalWin += stepWin;
      state.balance += stepWin;

      // Highlight winning cells
      result.winningCoords.forEach(({ c, r }) => {
        const slot = els.reelCols[c].querySelector(`.neko-cell-slot[data-row="${r}"]`);
        if (slot) slot.classList.add('winning-cell');
      });

      window.MahjongSound.playCascadeWin(cascadeCount, null, result.winDetails.length > 1);
      showBannerWin(stepWin, false);
      updateDashboardUI();

      await sleep(750, 350);

      // Shatter & Morph gold symbols to Wild
      for (const { c, r } of result.winningCoords) {
        const cell = state.grid[c][r];
        if (cell.gold && cell.type !== 'wild') {
          cell.type = 'wild';
          cell.gold = false;
        } else {
          // Empty cell
          state.grid[c][r] = null;
        }
      }

      window.MahjongSound.playTileShatter();
      await sleep(350, 160);

      // Drop falling tiles & fill new on top
      for (let c = 0; c < COLS; c++) {
        const survivors = state.grid[c].filter(x => x !== null);
        while (survivors.length < PLAYABLE_ROWS) {
          survivors.unshift(createCell());
        }
        state.grid[c] = survivors;
      }

      // Re-render
      for (let c = 0; c < COLS; c++) {
        const track = els.reelCols[c].querySelector('.neko-reel-track');
        for (let r = 0; r < PLAYABLE_ROWS; r++) {
          const slot = track.children[r];
          slot.classList.remove('winning-cell', 'cat-bounce');
          slot.innerHTML = window.NekoTiles.renderTileHTML(state.grid[c][r], false);
        }
      }

      window.MahjongSound.playTileCollapseImpact();
      await sleep(350, 180);

      // Check if newly dropped tiles have Cats
      let newCats = 0;
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < PLAYABLE_ROWS; r++) {
          if (state.grid[c][r].type === 'neko') newCats++;
        }
      }
      if (newCats > 0 && Math.random() < 0.3) {
        state.catMultiplier += 2;
        highlightCatBadge();
        updateDashboardUI();
      }
    }

    // 6. Check Scatters for Free Spins (4 scatters = 10 Free Spins)
    let scatterCount = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < PLAYABLE_ROWS; r++) {
        if (state.grid[c][r].type === 'scatter') scatterCount++;
      }
    }

    if (scatterCount >= 4 && !state.inFreeSpins) {
      const awarded = 10 + (scatterCount - 4) * 2;
      window.MahjongSound.playScatterTrigger(true);
      await showBigWinCelebration('PUTARAN GRATIS', awarded, 'PUTARAN');
      state.inFreeSpins = true;
      state.freeSpinsRemaining = awarded;
      state.catMultiplier = Math.max(2, state.catMultiplier); // Starts at min x2
      window.MahjongSound.startBgm(true);
      updateDashboardUI();
    }

    // 7. Big Win Celebration if win >= 20x bet
    if (spinTotalWin >= currentBet * 20) {
      window.MahjongSound.playScatterTrigger(false);
      await showBigWinCelebration('MENANG BESAR', spinTotalWin, 'IDR');
    }

    // Free spin progress
    if (state.inFreeSpins) {
      state.freeSpinsRemaining--;
      state.freeSpinsTotalWon += spinTotalWin;
      if (state.freeSpinsRemaining <= 0) {
        state.inFreeSpins = false;
        await showBigWinCelebration('TOTAL MENANG FITUR', state.freeSpinsTotalWon, 'IDR');
        state.freeSpinsTotalWon = 0;
        state.catMultiplier = 1;
        window.MahjongSound.startBgm(false);
      }
    }

    if (spinTotalWin > 0) {
      showBannerWin(spinTotalWin, true);
      state.history.unshift({
        time: new Date().toTimeString().slice(0, 8),
        bet: currentBet,
        win: spinTotalWin,
        mult: state.catMultiplier
      });
      if (state.history.length > 25) state.history.pop();
    }

    state.isSpinning = false;
    updateDashboardUI();

    // Auto spin handling
    if (state.autoSpinsRemaining > 0) {
      state.autoSpinsRemaining--;
      updateDashboardUI();
      if (state.autoSpinsRemaining > 0) {
        setTimeout(spin, state.isTurbo ? 350 : 750);
      }
    }
  }

  // Celebration Modal (Big Win / Free Spins)
  function showBigWinCelebration(title, amount, mode = 'IDR') {
    return new Promise(resolve => {
      els.celebTitle.textContent = title;
      els.celebModal.classList.add('active');

      let current = 0;
      const step = Math.max(1, Math.floor(amount / 30));
      const timer = setInterval(() => {
        current = Math.min(amount, current + step);
        els.celebAmount.textContent = mode === 'IDR' ? formatIDR(current) : `${current} PUTARAN`;
        window.MahjongSound.playCoinTick();

        if (current >= amount) {
          clearInterval(timer);
          window.MahjongSound.playBigWinEnd();
          setTimeout(() => {
            els.celebModal.classList.remove('active');
            resolve();
          }, 1800);
        }
      }, 45);
    });
  }

  // Event Listeners setup
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
      els.turboIconImg.src = state.isTurbo ? `${SPRITE_DIR}turbo_on.png` : `${SPRITE_DIR}turbo_off.png`;
      window.MahjongSound.playUiClick();
    });

    els.betMinusBtn.addEventListener('click', () => {
      state.betIndex = Math.max(0, state.betIndex - 1);
      window.MahjongSound.playUiClick();
      updateDashboardUI();
    });

    els.betPlusBtn.addEventListener('click', () => {
      state.betIndex = Math.min(BET_OPTIONS.length - 1, state.betIndex + 1);
      window.MahjongSound.playUiClick();
      updateDashboardUI();
    });

    els.autoBtn.addEventListener('click', () => {
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

    els.walletMeterBtn.addEventListener('click', () => {
      window.MahjongSound.playUiClick();
      state.balance += 1000000;
      updateDashboardUI();
      alert('Demo Saldo berhasil ditambahkan Rp1.000.000,00!');
    });

    els.betMeterBtn.addEventListener('click', () => {
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

    // Demo menu (Instant Free Spins or Cat combo)
    els.demoMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.MahjongSound.playUiClick();
      els.demoPopupMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      els.demoPopupMenu.classList.add('hidden');
    });

    els.demoScatterBtn.addEventListener('click', () => {
      state.grid[0][1] = createCell('scatter');
      state.grid[1][2] = createCell('scatter');
      state.grid[3][1] = createCell('scatter');
      state.grid[5][2] = createCell('scatter');
      renderReels();
      spin();
    });

    els.demoCatWinBtn.addEventListener('click', () => {
      state.grid[1][1] = createCell('neko');
      state.grid[2][2] = createCell('neko');
      state.grid[4][1] = createCell('neko');
      state.grid[0][0] = createCell('daruma');
      state.grid[1][0] = createCell('daruma');
      state.grid[2][0] = createCell('daruma');
      state.grid[3][0] = createCell('daruma');
      renderReels();
      spin();
    });

    els.soundToggleBtn.addEventListener('click', () => {
      const on = window.MahjongSound.toggleMute();
      const soundIc = document.getElementById('soundIc');
      if (soundIc) soundIc.textContent = on ? '🔊' : '🔇';
      els.soundToggleBtn.classList.toggle('muted', !on);
    });

    els.paytableBtn.addEventListener('click', () => {
      window.MahjongSound.playUiClick();
      buildPaytable();
      els.paytableModal.classList.add('open');
    });

    els.closePaytableBtn.addEventListener('click', () => {
      els.paytableModal.classList.remove('open');
    });

    function buildPaytable() {
      els.paytableGrid.innerHTML = '';
      Object.values(window.NekoTiles.SYMBOLS).forEach(sym => {
        const item = document.createElement('div');
        item.className = 'paytable-item';
        item.innerHTML = `
          <img src="assets/sprites/${sym.img}" alt="${sym.name}" style="width:48px;height:48px;margin-bottom:6px;object-fit:contain;" />
          <div style="font-weight:800;font-size:11px;color:#ffe082;">${sym.name}</div>
          <div style="font-size:10px;color:#e0e0e0;margin-top:4px;">
            ${sym.pays[6] ? `6: ${sym.pays[6]}x | ` : ''}5: ${sym.pays[5] || '-'}x | 4: ${sym.pays[4] || '-'}x | 3: ${sym.pays[3] || '-'}x
          </div>
        `;
        els.paytableGrid.appendChild(item);
      });
    }

    // Spacebar to spin
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !state.isSpinning) {
        e.preventDefault();
        spin();
      }
    });

    // PWA install prompt
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      if (els.installPwaBtn) els.installPwaBtn.classList.add('pwa-ready');
    });

    if (els.installPwaBtn) {
      els.installPwaBtn.addEventListener('click', async () => {
        window.MahjongSound.playUiClick();
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

  // Init Game
  window.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    renderReels();
    updateDashboardUI();
    setupEvents();

    // Fake loading progress
    let p = 0;
    const progressTimer = setInterval(() => {
      p += Math.floor(Math.random() * 20) + 10;
      if (p >= 100) {
        p = 100;
        clearInterval(progressTimer);
        els.splashProgress.style.display = 'none';
        els.splashCenterCta.style.display = 'flex';
      }
      els.splashProgress.querySelector('.splash-progress-fill').style.width = p + '%';
      els.splashProgress.querySelector('.splash-progress-text').textContent = `Memuat... ${p}%`;
    }, 150);
  });
})();
