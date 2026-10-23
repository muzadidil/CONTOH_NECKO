// Official PG Soft Lucky Neko (Game ID 89) — Authentic Tile, Block, Frame & Number Sprite Engine
// 1:1 Sliced Native Sprites from PG Soft Lucky Neko Texture Atlases (assets/sprites/neko/)
(function () {
  const NEKO_DIR = 'assets/sprites/neko/';
  const _preloadedImages = [];

  // Authentic PG Soft Lucky Neko Paytable & Sprite Mapping (from Cocos Creator scene_tree.json)
  const SYMBOLS = {
    neko: {
      id: 'neko',
      name: 'Kucing Keberuntungan (Maneki-Neko)',
      isSpecial: true,
      hasCatMult: true,
      blockPrefix: 'h_block',
      blockColor: 'yellow',
      glyphBase: 'h_neko',
      hasCD: true,
      pays: { 3: 30, 4: 40, 5: 50, 6: 80 }
    },
    wild: {
      id: 'wild',
      name: 'Simbol Wild (Gong Emas)',
      isSpecial: true,
      blockPrefix: null,
      blockColor: null,
      glyphBase: 's_wild',
      hasABCD: true,
      pays: { 3: 0, 4: 0, 5: 0, 6: 0 }
    },
    scatter: {
      id: 'scatter',
      name: 'Simbol Scatter (Koin Koban)',
      isSpecial: true,
      blockPrefix: null,
      blockColor: null,
      glyphBase: 's_scatter',
      pays: { 3: 0, 4: 0, 5: 0, 6: 0 }
    },
    drum: {
      id: 'drum',
      name: 'Gendang Taiko',
      blockPrefix: 'h_block',
      blockColor: 'orange',
      glyphBase: 'h_drum',
      pays: { 3: 20, 4: 25, 5: 30, 6: 50 }
    },
    lantern: {
      id: 'lantern',
      name: 'Lentera Chochin',
      blockPrefix: 'h_block',
      blockColor: 'red',
      glyphBase: 'h_lantern',
      pays: { 3: 10, 4: 25, 5: 30, 6: 40 }
    },
    fan: {
      id: 'fan',
      name: 'Kipas Sensu',
      blockPrefix: 'h_block',
      blockColor: 'violet',
      glyphBase: 'h_fan',
      pays: { 3: 8, 4: 15, 5: 20, 6: 30 }
    },
    f_sushi: {
      id: 'f_sushi',
      name: 'Sushi Salmon Nigiri',
      blockPrefix: 'h_block',
      blockColor: 'blue',
      glyphBase: 'h_f_sushi',
      pays: { 3: 6, 4: 10, 5: 12, 6: 15 }
    },
    sushi: {
      id: 'sushi',
      name: 'Sushi Maki Roll',
      blockPrefix: 'h_block',
      blockColor: 'green',
      glyphBase: 'h_sushi',
      pays: { 3: 6, 4: 10, 5: 12, 6: 15 }
    },
    card_a: {
      id: 'card_a',
      name: 'Simbol A',
      blockPrefix: 'l_block',
      blockColor: 'orange',
      glyphBase: 'l_a',
      isLow: true,
      pays: { 3: 4, 4: 6, 5: 8, 6: 10 }
    },
    card_k: {
      id: 'card_k',
      name: 'Simbol K',
      blockPrefix: 'l_block',
      blockColor: 'red',
      glyphBase: 'l_k',
      isLow: true,
      pays: { 3: 4, 4: 6, 5: 8, 6: 10 }
    },
    card_q: {
      id: 'card_q',
      name: 'Simbol Q',
      blockPrefix: 'l_block',
      blockColor: 'purple',
      glyphBase: 'l_q',
      isLow: true,
      pays: { 3: 2, 4: 3, 5: 4, 6: 6 }
    },
    card_j: {
      id: 'card_j',
      name: 'Simbol J',
      blockPrefix: 'l_block',
      blockColor: 'blue',
      glyphBase: 'l_j',
      isLow: true,
      pays: { 3: 2, 4: 3, 5: 4, 6: 6 }
    },
    card_10: {
      id: 'card_10',
      name: 'Simbol 10',
      blockPrefix: 'l_block',
      blockColor: 'green',
      glyphBase: 'l_10',
      isLow: true,
      pays: { 3: 1, 4: 2, 5: 3, 6: 4 }
    }
  };

  const SPAN_KEYS = { 1: 'a', 2: 'b', 3: 'c', 4: 'd' };

  function getGlyphFile(sym, span, isBlurred) {
    const blurSfx = isBlurred ? '_blur_tight.png' : '_tight.png';
    if (sym.hasABCD) {
      const k = SPAN_KEYS[span] || 'a';
      return `${NEKO_DIR}${sym.glyphBase}_${k}${blurSfx}`;
    }
    if (sym.hasCD) {
      const k = span === 1 ? 'a' : (span === 2 ? 'b' : 'cd');
      return `${NEKO_DIR}${sym.glyphBase}_${k}${blurSfx}`;
    }
    const k = span >= 2 ? 'b' : 'a';
    return `${NEKO_DIR}${sym.glyphBase}_${k}${blurSfx}`;
  }

  function getBlockFile(sym, span, isBlurred) {
    if (!sym.blockPrefix || !sym.blockColor) return null;
    const k = SPAN_KEYS[span] || 'a';
    const blurSfx = isBlurred ? '_blur_tight.png' : '_tight.png';
    return `${NEKO_DIR}${sym.blockPrefix}_${k}_${sym.blockColor}${blurSfx}`;
  }

  function getFrameFile(frameType, span, isBlurred) {
    if (!frameType) return null;
    const k = SPAN_KEYS[span] || 'a';
    const blurSfx = isBlurred ? '_blur_tight.png' : '_tight.png';
    return `${NEKO_DIR}s_${frameType}_frame_${k}${blurSfx}`;
  }

  // Preload all normal and motion-blurred tile sprites so spin strips render instantaneously
  function preloadTileSprites() {
    const urls = new Set();
    Object.values(SYMBOLS).forEach(sym => {
      [false, true].forEach(blur => {
        [1, 2, 3, 4].forEach(span => {
          urls.add(getGlyphFile(sym, span, blur));
          const blk = getBlockFile(sym, span, blur);
          if (blk) urls.add(blk);
        });
      });
    });
    ['silver', 'gold'].forEach(ft => {
      [false, true].forEach(blur => {
        [1, 2, 3, 4].forEach(span => {
          urls.add(getFrameFile(ft, span, blur));
        });
      });
    });
    urls.forEach(u => {
      if (!u) return;
      const img = new Image();
      img.src = u;
      _preloadedImages.push(img);
    });
  }

  // Render authentic layered PG Soft Lucky Neko tile (background block + glyph + silver/gold border + x2 badge)
  function renderTileHTML(cellData, isBlurred = false) {
    if (!cellData) return '';
    const sym = SYMBOLS[cellData.type] || SYMBOLS.drum;
    const span = cellData.span || 1;
    const spanKey = SPAN_KEYS[span] || 'a';
    const isGold = !!cellData.gold;
    const isSilver = !!cellData.silver && !isGold;
    const blurClass = isBlurred ? 'is-blurred' : '';

    const glyphSrc = getGlyphFile(sym, span, isBlurred);
    const blockSrc = getBlockFile(sym, span, isBlurred);
    const frameType = isGold ? 'gold' : (isSilver ? 'silver' : null);
    const frameSrc = getFrameFile(frameType, span, isBlurred);

    if (cellData.type === 'wild') {
      return `
        <div class="neko-tile neko-tile-wild span-${spanKey} ${blurClass}" data-sym="wild" data-span="${span}">
          <img class="neko-special-full" src="${glyphSrc}" alt="WILD" draggable="false" />
        </div>`;
    }

    if (cellData.type === 'scatter') {
      return `
        <div class="neko-tile neko-tile-scatter span-${spanKey} ${blurClass}" data-sym="scatter" data-span="${span}">
          <img class="neko-special-full" src="${glyphSrc}" alt="SCATTER" draggable="false" />
        </div>`;
    }

    const blockHTML = blockSrc
      ? `<img class="neko-tile-block" src="${blockSrc}" alt="" draggable="false" />`
      : '';
    const frameHTML = frameSrc
      ? `<img class="neko-tile-border frame-${frameType}" src="${frameSrc}" alt="" draggable="false" />`
      : '';

    // Lucky Neko cat symbols display the authentic x2 multiplier badge when active
    let catMultHTML = '';
    if (sym.hasCatMult && !isBlurred) {
      catMultHTML = `
        <div class="neko-cat-mult-badge">
          <img class="mult-x-ic" src="${NEKO_DIR}multiplier_x_tight.png" alt="x" draggable="false" />
          <img class="mult-2-ic" src="${NEKO_DIR}multiplier_2_tight.png" alt="2" draggable="false" />
        </div>`;
    }

    const glyphClass = sym.isLow ? 'neko-glyph low-glyph' : `neko-glyph high-glyph sym-${sym.id}`;

    return `
      <div class="neko-tile span-${spanKey} ${frameType ? 'has-' + frameType : ''} ${blurClass}" data-sym="${sym.id}" data-span="${span}">
        ${blockHTML}
        <img class="${glyphClass}" src="${glyphSrc}" alt="${sym.name}" draggable="false" />
        ${frameHTML}
        ${catMultHTML}
      </div>`;
  }

  // Render dynamic Ways count using authentic ways_0..9.png + ways_1_text_tight.png ("CARA")
  function renderWaysSprites(waysCount) {
    const str = String(Math.max(0, Math.floor(waysCount)));
    let html = '<div class="ways-digits-group">';
    for (const ch of str) {
      if (ch >= '0' && ch <= '9') {
        html += `<img class="ways-digit-sp" src="${NEKO_DIR}ways_${ch}_tight.png" alt="${ch}" draggable="false" />`;
      }
    }
    html += '</div>';
    html += `<img class="ways-cara-sp" src="${NEKO_DIR}ways_1_text_tight.png" alt="CARA" draggable="false" />`;
    return html;
  }

  // Render Cat Multiplier (x2, x4, x6...) using multiplier_x_tight.png + multiplier_0..9_tight.png
  function renderMultiplierSprites(multValue) {
    const val = Math.floor(multValue);
    if (val < 2) return '';
    const str = String(val);
    let html = `<img class="shrine-mult-x" src="${NEKO_DIR}multiplier_x_tight.png" alt="x" draggable="false" />`;
    for (const ch of str) {
      if (ch >= '0' && ch <= '9') {
        html += `<img class="shrine-mult-digit" src="${NEKO_DIR}multiplier_${ch}_tight.png" alt="${ch}" draggable="false" />`;
      }
    }
    return html;
  }

  // Render Infoboard Win / Total Win numbers using info_num_0..9.png + info_comma.png + info_full_stop.png
  function renderInfoAmountSprites(amount) {
    const formatted = Math.floor(amount).toLocaleString('id-ID') + ',00';
    let html = '<span class="info-curr-rp">Rp</span>';
    for (const ch of formatted) {
      if (ch >= '0' && ch <= '9') {
        html += `<img class="info-num-sp" src="${NEKO_DIR}info_num_${ch}_tight.png" alt="${ch}" draggable="false" />`;
      } else if (ch === '.') {
        html += `<img class="info-sep-sp dot" src="${NEKO_DIR}info_full_stop_tight.png" alt="." draggable="false" />`;
      } else if (ch === ',') {
        html += `<img class="info-sep-sp comma" src="${NEKO_DIR}info_comma_tight.png" alt="," draggable="false" />`;
      }
    }
    return html;
  }

  // Render Big Win / Total Win / Free Spins Count numbers using bw_0..9.png or tw_0..9.png
  function renderCelebrationNumberSprites(amount, mode = 'bw') {
    if (mode === 'fs_count') {
      const str = String(Math.floor(amount));
      let html = '';
      for (const ch of str) {
        if (ch >= '0' && ch <= '9') {
          html += `<img class="tw-digit-sp fs-count-sp" src="${NEKO_DIR}tw_${ch}_tight.png" alt="${ch}" draggable="false" />`;
        }
      }
      return html;
    }

    const prefix = mode === 'tw' ? 'tw' : 'bw';
    const formatted = Math.floor(amount).toLocaleString('id-ID') + ',00';
    let html = '';
    for (const ch of formatted) {
      if (ch >= '0' && ch <= '9') {
        html += `<img class="${prefix}-digit-sp" src="${NEKO_DIR}${prefix}_${ch}_tight.png" alt="${ch}" draggable="false" />`;
      } else if (ch === '.') {
        html += `<img class="bw-sep-sp dot" src="${NEKO_DIR}bw_fuu_stop_tight.png" alt="." draggable="false" />`;
      } else if (ch === ',') {
        html += `<img class="bw-sep-sp comma" src="${NEKO_DIR}bw_comma_tight.png" alt="," draggable="false" />`;
      }
    }
    return html;
  }

  preloadTileSprites();

  window.NekoTiles = {
    NEKO_DIR,
    SYMBOLS,
    getGlyphFile,
    getBlockFile,
    getFrameFile,
    preloadTileSprites,
    renderTileHTML,
    renderWaysSprites,
    renderMultiplierSprites,
    renderInfoAmountSprites,
    renderCelebrationNumberSprites
  };
})();
