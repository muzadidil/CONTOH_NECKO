// Official PG Soft Lucky Neko (Kucing Keberuntungan) - Tile & Paytable Definitions
// Genuine sliced PG Soft PNG textures with normal & motion blur variants
(function () {
  const SPRITE_DIR = 'assets/sprites/';

  const SYMBOLS = {
    neko: {
      id: 'neko',
      name: 'Kucing Keberuntungan (Maneki-Neko)',
      isSpecial: true,
      img: 'h_neko.png',
      blurImg: 'h_neko_blur.png',
      block: 'block_red.png',
      pays: { 3: 30, 4: 40, 5: 50, 6: 80 }
    },
    wild: {
      id: 'wild',
      name: 'Simbol Wild (Gong Emas)',
      isSpecial: true,
      img: 's_wild.png',
      blurImg: 's_wild_blur.png',
      block: null,
      pays: { 3: 0, 4: 0, 5: 0, 6: 0 }
    },
    scatter: {
      id: 'scatter',
      name: 'Simbol Scatter (Koin Emas)',
      isSpecial: true,
      img: 's_scatter.png',
      blurImg: 's_scatter_blur.png',
      block: null,
      pays: { 3: 0, 4: 0, 5: 0, 6: 0 }
    },
    drum: {
      id: 'drum',
      name: 'Gendang Taiko Tradisional',
      img: 'h_drum.png',
      blurImg: 'h_drum_blur.png',
      block: 'block_red.png',
      pays: { 3: 20, 4: 25, 5: 30, 6: 50 }
    },
    lantern: {
      id: 'lantern',
      name: 'Lentera Merah Chochin',
      img: 'h_lantern.png',
      blurImg: 'h_lantern_blur.png',
      block: 'block_red.png',
      pays: { 3: 10, 4: 25, 5: 30, 6: 40 }
    },
    fan: {
      id: 'fan',
      name: 'Kipas Lipat Sensu',
      img: 'h_fan.png',
      blurImg: 'h_fan_blur.png',
      block: 'block_red.png',
      pays: { 3: 8, 4: 15, 5: 20, 6: 30 }
    },
    sushi: {
      id: 'sushi',
      name: 'Sushi Salmon Nigiri',
      img: 'h_sushi.png',
      blurImg: 'h_sushi_blur.png',
      block: 'block_red.png',
      pays: { 3: 6, 4: 10, 5: 12, 6: 15 }
    },
    amulet: {
      id: 'amulet',
      name: 'Jimat Keberuntungan Omamori',
      img: 'h_amulet.png',
      blurImg: 'h_amulet_blur.png',
      block: 'block_red.png',
      pays: { 3: 6, 4: 10, 5: 12, 6: 15 }
    },
    card_a: {
      id: 'card_a',
      name: 'Kartu As (A)',
      img: 'l_a.png',
      blurImg: 'l_a_blur.png',
      block: 'block_card.png',
      pays: { 3: 4, 4: 6, 5: 8, 6: 10 }
    },
    card_k: {
      id: 'card_k',
      name: 'Kartu King (K)',
      img: 'l_k.png',
      blurImg: 'l_k_blur.png',
      block: 'block_card.png',
      pays: { 3: 4, 4: 6, 5: 8, 6: 10 }
    },
    card_q: {
      id: 'card_q',
      name: 'Kartu Queen (Q)',
      img: 'l_q.png',
      blurImg: 'l_q_blur.png',
      block: 'block_card.png',
      pays: { 3: 2, 4: 3, 5: 4, 6: 6 }
    },
    card_j: {
      id: 'card_j',
      name: 'Kartu Jack (J)',
      img: 'l_j.png',
      blurImg: 'l_j_blur.png',
      block: 'block_card.png',
      pays: { 3: 2, 4: 3, 5: 4, 6: 6 }
    },
    card_10: {
      id: 'card_10',
      name: 'Kartu Angka (10)',
      img: 'l_10.png',
      blurImg: 'l_10_blur.png',
      block: 'block_card.png',
      pays: { 3: 1, 4: 2, 5: 3, 6: 4 }
    }
  };

  // Render authentic PG Soft Lucky Neko layered tile HTML
  function renderTileHTML(cellData, isBlurred = false) {
    const sym = SYMBOLS[cellData.type] || SYMBOLS.drum;
    const isGold = !!cellData.gold;
    const isSilver = !!cellData.silver;
    const blurClass = isBlurred ? 'is-blurred' : '';
    const symImg = isBlurred ? sym.blurImg : sym.img;

    if (cellData.type === 'neko') {
      return `
        <div class="neko-tile neko-tile-special ${blurClass}">
          <div class="neko-glow-aura"></div>
          <img class="neko-glyph" src="${SPRITE_DIR}${symImg}" alt="${sym.name}" draggable="false" />
          <div class="neko-mult-tag">+2</div>
        </div>`;
    }

    if (cellData.type === 'wild') {
      return `
        <div class="neko-tile neko-tile-wild ${blurClass}">
          <div class="neko-wild-flare"></div>
          <img class="neko-glyph" src="${SPRITE_DIR}${symImg}" alt="WILD" draggable="false" />
        </div>`;
    }

    if (cellData.type === 'scatter') {
      return `
        <div class="neko-tile neko-tile-scatter ${blurClass}">
          <div class="neko-scatter-pulse"></div>
          <img class="neko-glyph" src="${SPRITE_DIR}${symImg}" alt="SCATTER" draggable="false" />
        </div>`;
    }

    let frameHTML = '';
    let frameClass = 'neko-tile-standard';
    if (isGold) {
      frameClass = 'neko-tile-gold';
      frameHTML = `<img class="neko-tile-frame" src="${SPRITE_DIR}gold_frame.png" alt="Gold Frame" draggable="false" />`;
    } else if (isSilver) {
      frameClass = 'neko-tile-silver';
      frameHTML = `<img class="neko-tile-frame" src="${SPRITE_DIR}silver_frame.png" alt="Silver Frame" draggable="false" />`;
    }

    return `
      <div class="neko-tile ${frameClass} ${blurClass}">
        ${frameHTML}
        <img class="neko-glyph" src="${SPRITE_DIR}${symImg}" alt="${sym.name}" draggable="false" />
      </div>`;
  }

  window.NekoTiles = {
    SYMBOLS,
    renderTileHTML
  };
})();
