// Official PG Soft Lucky Neko (Kucing Keberuntungan) Audio Engine
// 100% Authentic Audio Sprites extracted from PG Soft Game ID 89 AudioConstant & UIAudioConstant
(function () {
  const AUDIO_BASE = 'assets/audio/';

  // Official PG Soft Lucky Neko SFX Sprite Timestamps (general_audio.mp3 - 66.02s)
  const SFX_SPRITES = {
    fastspinEnd:                { from: 0.0,   to: 0.875021 },
    fastspinStart:              { from: 1.0,   to: 5.750000 },
    fsIntro:                    { from: 6.0,   to: 13.014083 },
    fsSpin:                     { from: 14.0,  to: 14.787521 },
    fsWonRemainingIncrease:     { from: 15.0,  to: 15.418271 },
    fsWonTitle:                 { from: 16.0,  to: 18.604188 },
    heartbeatMain:              { from: 19.0,  to: 19.955063 },
    heartbeatNoise:             { from: 20.0,  to: 22.205896 },
    heartbeatSlowdrop:          { from: 23.0,  to: 23.576979 },
    prizeInfobarTotalwin:       { from: 24.0,  to: 25.302917 },
    prizeInfobarTotalwinMedEnd: { from: 26.0,  to: 27.550542 },
    prizeInfobarTotalwinMedMain:{ from: 28.0,  to: 30.000000 },
    prizePayoutHighlight:       { from: 30.0,  to: 30.444417 },
    prizePayoutHighlightStart:  { from: 31.0,  to: 31.948458 },
    prizeSmallwin:              { from: 32.0,  to: 33.265062 },
    prizeWinMultiplied:         { from: 34.0,  to: 35.890604 },
    scatterWinHighlight:        { from: 36.0,  to: 38.500000 },
    spinActiveLoop:             { from: 39.0,  to: 39.054167 },
    spinBtn:                    { from: 40.0,  to: 41.399479 },
    spinStop:                   { from: 42.0,  to: 42.125021 },
    spinStopQuick:              { from: 43.0,  to: 43.130625 },
    symCollapse:                { from: 44.0,  to: 44.091687 },
    symMultiFly:                { from: 45.0,  to: 45.642562 },
    symMultiFlyB:               { from: 46.0,  to: 46.675021 },
    symMultiReach:              { from: 47.0,  to: 47.934396 },
    symMultiReachB:             { from: 48.0,  to: 48.650562 },
    symMultiSpawn:              { from: 49.0,  to: 49.888979 },
    symRouletteEnd:             { from: 50.0,  to: 50.777083 },
    symRouletteRolling:         { from: 51.0,  to: 51.089062 },
    symRouletteStart:           { from: 52.0,  to: 53.425542 },
    symScatter:                 { from: 54.0,  to: 54.930729 },
    symShrink:                  { from: 55.0,  to: 56.193229 },
    symWild:                    { from: 57.0,  to: 58.121625 },
    uiCollect:                  { from: 59.0,  to: 61.836979 },
    uiInfo:                     { from: 62.0,  to: 62.208354 },
    uiStart:                    { from: 63.0,  to: 65.836979 }
  };

  // Official PG Soft Lucky Neko UI Audio Sprites (ui_audio.mp3 - 5.04s)
  const UI_SPRITES = {
    btnPress:            { from: 0.0, to: 0.263 },
    listItemClick:       { from: 1.0, to: 1.121 },
    menuIconPress:       { from: 2.0, to: 2.263 },
    sliderEffect:        { from: 3.0, to: 3.157 },
    walletCountingAbove: { from: 4.0, to: 4.546 }
  };

  // Official Feature Buy Audio Sprites (feature_buy_sfx.mp3 - 8.04s)
  const FB_SPRITES = {
    featureBuyBtn:    { from: 0.0, to: 0.838458 },
    featureBuyCancel: { from: 1.0, to: 1.449521 },
    featureBuyHover:  { from: 2.0, to: 3.294271 },
    featureBuyStart:  { from: 4.0, to: 7.132854 }
  };

  class NekoAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.compressor = null;
      this.bgmGain = null;
      this.sfxGain = null;

      this.enabled = true;
      this.currentBgmKey = null;
      this.bgmFreeSpinMode = false;
      this.isBigWinBgmActive = false;
      this.isTotalWinCelebration = false;

      this.buffers = {};
      this.loadingPromises = {};

      this.activeBgmSource = null;
      this.activeBgmGain = null;
      this.activeLoopSources = {};

      this._lastCoinTick = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();

          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = 1.0;

          // Studio Dynamics Compressor (prevents clipping & loudness distortion)
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
          this.compressor.knee.setValueAtTime(24, this.ctx.currentTime);
          this.compressor.ratio.setValueAtTime(5, this.ctx.currentTime);
          this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
          this.compressor.release.setValueAtTime(0.20, this.ctx.currentTime);

          this.masterGain.connect(this.compressor);
          this.compressor.connect(this.ctx.destination);

          this.bgmGain = this.ctx.createGain();
          this.bgmGain.gain.value = 0.55;
          this.bgmGain.connect(this.masterGain);

          this.sfxGain = this.ctx.createGain();
          this.sfxGain.gain.value = 0.92;
          this.sfxGain.connect(this.masterGain);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.preloadAll();
    }

    async preloadAll() {
      const files = {
        sfx: 'general_audio.mp3',
        ui: 'ui_audio.mp3',
        fb: 'feature_buy_sfx.mp3',
        bgm_main: 'bgm_main.mp3',
        bgm_free: 'bgm_free.mp3',
        bgm_bigwin_main: 'bgm_bigwin_main.mp3',
        bgm_bigwin_end: 'bgm_bigwin_end.mp3',
        bgm_bigwin_end_coin: 'bgm_bigwin_end_coin.mp3',
        bgm_totalwin_main: 'bgm_totalwin_main.mp3',
        bgm_totalwin_end: 'bgm_totalwin_end.mp3'
      };

      const promises = Object.entries(files).map(([key, filename]) =>
        this._loadBuffer(key, AUDIO_BASE + filename)
      );
      return Promise.allSettled(promises);
    }

    async _loadBuffer(key, url) {
      if (this.buffers[key]) return this.buffers[key];
      if (this.loadingPromises[key]) return this.loadingPromises[key];

      this.loadingPromises[key] = (async () => {
        try {
          const resp = await fetch(url);
          const arr = await resp.arrayBuffer();
          if (!this.ctx) this.init();
          const decoded = await this.ctx.decodeAudioData(arr);
          this.buffers[key] = decoded;
          return decoded;
        } catch (err) {
          console.warn('Failed to load audio bank:', key, err);
          return null;
        }
      })();
      return this.loadingPromises[key];
    }

    playSprite(bankKey, spriteMap, cueName, volume = 1.0, loop = false) {
      if (!this.enabled) return null;
      this.init();
      const buf = this.buffers[bankKey];
      const sprite = spriteMap[cueName];
      if (!buf || !sprite || !this.ctx) return null;

      try {
        if (loop && this.activeLoopSources[cueName]) {
          this.stopLoopSprite(cueName);
        }

        const src = this.ctx.createBufferSource();
        src.buffer = buf;

        const gainNode = this.ctx.createGain();
        src.connect(gainNode);
        gainNode.connect(this.sfxGain);

        const duration = Math.max(0.03, sprite.to - sprite.from);
        const now = this.ctx.currentTime;

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);

        if (loop) {
          src.loop = true;
          src.loopStart = sprite.from;
          src.loopEnd = sprite.to;
          src.start(0, sprite.from);
          this.activeLoopSources[cueName] = { src, gain: gainNode };
        } else {
          gainNode.gain.setValueAtTime(volume, now + Math.max(0.01, duration - 0.010));
          gainNode.gain.linearRampToValueAtTime(0.001, now + duration);
          src.start(0, sprite.from, duration);
        }
        return src;
      } catch (e) {
        return null;
      }
    }

    stopLoopSprite(cueName) {
      const item = this.activeLoopSources[cueName];
      if (item) {
        delete this.activeLoopSources[cueName];
        try {
          const now = this.ctx.currentTime;
          item.gain.gain.setValueAtTime(item.gain.gain.value, now);
          item.gain.gain.linearRampToValueAtTime(0.001, now + 0.030);
          setTimeout(() => {
            try { item.src.stop(); } catch (e) {}
          }, 35);
        } catch (e) {}
      }
    }

    playSfx(cueName, volume = 0.90, loop = false) {
      return this.playSprite('sfx', SFX_SPRITES, cueName, volume, loop);
    }

    playUi(cueName = 'btnPress', volume = 0.85) {
      return this.playSprite('ui', UI_SPRITES, cueName, volume, false);
    }

    playFb(cueName = 'featureBuyBtn', volume = 0.90) {
      return this.playSprite('fb', FB_SPRITES, cueName, volume, false);
    }

    // Continuous, Seamless BGM Engine
    async startBgm(freeSpinMode = false) {
      if (!this.enabled || this.isBigWinBgmActive) return;
      this.init();

      const targetKey = freeSpinMode ? 'bgm_free' : 'bgm_main';
      if (this.currentBgmKey === targetKey && this.activeBgmSource) return;

      this.currentBgmKey = targetKey;
      this.bgmFreeSpinMode = freeSpinMode;

      let buf = this.buffers[targetKey];
      if (!buf) {
        buf = await this._loadBuffer(targetKey, AUDIO_BASE + (freeSpinMode ? 'bgm_free.mp3' : 'bgm_main.mp3'));
      }
      if (!buf || !this.enabled || !this.ctx || this.isBigWinBgmActive) return;

      this.stopBgm(0.20);

      try {
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;

        const trackGain = this.ctx.createGain();
        const targetVol = freeSpinMode ? 0.62 : 0.52;
        const now = this.ctx.currentTime;

        trackGain.gain.setValueAtTime(0.001, now);
        trackGain.gain.linearRampToValueAtTime(targetVol, now + 0.25);

        src.connect(trackGain);
        trackGain.connect(this.bgmGain);
        src.start(0);

        this.activeBgmSource = src;
        this.activeBgmGain = trackGain;
      } catch (e) {}
    }

    stopBgm(fadeSec = 0.20) {
      if (this.activeBgmSource) {
        const oldSrc = this.activeBgmSource;
        const oldGain = this.activeBgmGain;
        this.activeBgmSource = null;
        this.activeBgmGain = null;
        this.currentBgmKey = null;

        if (oldGain && this.ctx) {
          try {
            const now = this.ctx.currentTime;
            oldGain.gain.setValueAtTime(oldGain.gain.value, now);
            oldGain.gain.linearRampToValueAtTime(0.001, now + fadeSec);
            setTimeout(() => {
              try { oldSrc.stop(); } catch (e) {}
            }, fadeSec * 1000 + 20);
            return;
          } catch (e) {}
        }
        try { oldSrc.stop(); } catch (e) {}
      }
    }

    // Celebration Big Win / Total Win BGM
    async startBigWinBgm(isTotalWin = false) {
      if (!this.enabled) return;
      this.isBigWinBgmActive = true;
      this.isTotalWinCelebration = isTotalWin;
      this.stopBgm(0.12);

      const bankKey = isTotalWin ? 'bgm_totalwin_main' : 'bgm_bigwin_main';
      const fileName = isTotalWin ? 'bgm_totalwin_main.mp3' : 'bgm_bigwin_main.mp3';

      let buf = this.buffers[bankKey];
      if (!buf) {
        buf = await this._loadBuffer(bankKey, AUDIO_BASE + fileName);
      }
      if (!buf || !this.ctx) return;

      try {
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;

        const trackGain = this.ctx.createGain();
        trackGain.gain.value = 0.72;
        src.connect(trackGain);
        trackGain.connect(this.bgmGain);
        src.start(0);

        this.activeBgmSource = src;
        this.activeBgmGain = trackGain;
      } catch (e) {}
    }

    stopBigWinBgm() {
      if (this.isBigWinBgmActive) {
        const wasTotalWin = this.isTotalWinCelebration;
        this.isBigWinBgmActive = false;
        this.isTotalWinCelebration = false;
        this.stopBgm(0.10);
        this.playBigWinEndFanfare(wasTotalWin);
        setTimeout(() => {
          this.startBgm(this.bgmFreeSpinMode);
        }, 650);
      }
    }

    playBigWinEndFanfare(isTotalWin = false) {
      const bankKey = isTotalWin ? 'bgm_totalwin_end' : 'bgm_bigwin_end';
      const buf = this.buffers[bankKey];
      if (buf && this.ctx && this.enabled) {
        try {
          const src = this.ctx.createBufferSource();
          src.buffer = buf;
          const g = this.ctx.createGain();
          g.gain.value = 0.85;
          src.connect(g);
          g.connect(this.sfxGain);
          src.start(0);
        } catch (e) {}
      }
    }

    toggleMute() {
      this.enabled = !this.enabled;
      if (this.masterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(this.enabled ? 1.0 : 0.001, now + 0.08);
      }
      if (!this.enabled) {
        this.stopBgm(0.1);
      } else {
        this.startBgm(this.bgmFreeSpinMode);
      }
      return this.enabled;
    }

    // --- High-Level Event Audio Hooks (1:1 PG Soft Lucky Neko Sync) ---

    playStartGameButton() {
      this.playSfx('uiStart', 0.95);
    }

    playUiClick() {
      this.playUi('btnPress', 0.85);
    }

    playListItemClick() {
      this.playUi('listItemClick', 0.85);
    }

    playMenuToggle() {
      this.playUi('menuIconPress', 0.85);
    }

    playSpinStart(inFreeSpins = false) {
      if (inFreeSpins) {
        this.playSfx('fsSpin', 0.90);
      } else {
        this.playSfx('spinBtn', 0.88);
      }
      this.stopLoopSprite('spinActiveLoop');
      this.playSfx('spinActiveLoop', 0.36, true);
    }

    stopSpinLoop() {
      this.stopLoopSprite('spinActiveLoop');
      this.stopSlowdrop();
    }

    playSlowdropStart() {
      this.playSfx('fastspinStart', 0.92);
      this.playSfx('heartbeatMain', 0.80, true);
      this.playSfx('heartbeatSlowdrop', 0.85);
    }

    stopSlowdrop() {
      if (this.activeLoopSources['heartbeatMain']) {
        this.stopLoopSprite('heartbeatMain');
        this.playSfx('fastspinEnd', 0.90);
      }
    }

    playReelStop(hasScatter = false, isTurbo = false) {
      if (isTurbo) {
        this.playSfx('spinStopQuick', 0.82);
      } else {
        this.playSfx('spinStop', 0.78);
      }
      if (hasScatter) {
        setTimeout(() => this.playSfx('symScatter', 0.95), 25);
      }
    }

    playScatterLand() {
      this.playSfx('symScatter', 0.95);
    }

    playTileClick() {
      this.playSfx('uiInfo', 0.85);
    }

    playCascadeWin(isMultiplied = false) {
      this.playSfx('prizePayoutHighlightStart', 0.88);
      setTimeout(() => {
        this.playSfx('prizePayoutHighlight', 0.82);
      }, 90);
      if (isMultiplied) {
        this.playSfx('prizeWinMultiplied', 0.95);
      } else {
        this.playSfx('prizeSmallwin', 0.88);
      }
    }

    playRouletteStart() {
      this.playSfx('symRouletteStart', 0.90);
      this.playSfx('symRouletteRolling', 0.75, true);
    }

    playRouletteEnd() {
      this.stopLoopSprite('symRouletteRolling');
      this.playSfx('symRouletteEnd', 0.92);
    }

    playTileShatter() {
      this.playSfx('symShrink', 0.88);
    }

    playGoldToWild() {
      this.playSfx('symWild', 0.95);
    }

    playTileCollapseImpact() {
      this.playSfx('symCollapse', 0.86);
    }

    // Authentic 3-stage Cat Multiplier SFX: Spawn on tile -> Fly arc -> Reach shrine badge
    playCatSpawn() {
      this.playSfx('symMultiSpawn', 0.92);
    }

    playCatFly(isMultiple = false) {
      this.playSfx(isMultiple ? 'symMultiFlyB' : 'symMultiFly', 0.92);
    }

    playCatReach(isMultiple = false) {
      this.playSfx(isMultiple ? 'symMultiReachB' : 'symMultiReach', 0.95);
    }

    playCatMultiplier() {
      this.playCatSpawn();
      setTimeout(() => this.playCatFly(false), 120);
      setTimeout(() => this.playCatReach(false), 380);
    }

    playTotalWinInfobar(isMediumWin = false) {
      if (isMediumWin) {
        this.playSfx('prizeInfobarTotalwinMedMain', 0.90);
        setTimeout(() => {
          this.playSfx('prizeInfobarTotalwinMedEnd', 0.92);
        }, 550);
      } else {
        this.playSfx('prizeInfobarTotalwin', 0.90);
      }
    }

    playFsWonTitle() {
      this.playSfx('fsWonTitle', 0.95);
    }

    playFsRemainingIncrease() {
      this.playSfx('fsWonRemainingIncrease', 0.92);
    }

    playCoinTick() {
      const now = performance.now();
      if (now - this._lastCoinTick < 95) return;
      this._lastCoinTick = now;
      this.playUi('walletCountingAbove', 0.45);
    }

    playScatterTrigger() {
      this.playSfx('scatterWinHighlight', 0.95);
    }

    playFreeSpinsIntro() {
      this.playSfx('fsWonTitle', 0.95);
      setTimeout(() => {
        this.playSfx('fsIntro', 0.95);
      }, 350);
    }

    playCollect() {
      this.playSfx('uiCollect', 0.88);
    }

    playFeatureBuyOpen() {
      this.playFb('featureBuyBtn', 0.90);
    }

    playFeatureBuyCancel() {
      this.playFb('featureBuyCancel', 0.85);
    }

    playFeatureBuyStart() {
      this.playFb('featureBuyStart', 0.95);
    }
  }

  window.MahjongSound = new NekoAudioEngine();
  window.NekoAudio = window.MahjongSound;
})();
