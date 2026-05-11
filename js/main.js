    /* ── Custom cursor ── */
    const cursor = document.getElementById('cursor');
    let mx = -100, my = -100;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    /* ── ISO WORLD ENGINE ── */
    /* ── ISO WORLD ENGINE ── */
    (function IsoWorld() {
      const canvas = document.getElementById('iso-canvas');
      const ctx    = canvas.getContext('2d');

      // Tile + world constants
      const TW = 96, TH = 48;          // wider isometric tiles
      const WW = 60, WH = 60;
      const GRASS_END = 18, CITY_END = 38;

      // ── Warm retro palette (ref: #2a9d8f #264653 #e76f51 #f4a261 #e9c46a) ──
      const P = {
        skyTop:'#0d1f28', skyHorizon:'#1a3a42',
        // Grass
        gA:'#3a8a55', gB:'#2e7244', gC:'#4aaa66', gD:'#5ac870',
        dirt:'#a07840', dirtL:'#c09050',
        water:'#1a7a8f', waterL:'#2a9d8f', waterS:'#4abec8',
        trunk:'#6a4020', trunkD:'#4a2c10',
        leafA:'#2a7a40', leafB:'#3a9a55', leafC:'#1a5a30',
        flowerR:'#e76f51', flowerY:'#e9c46a',
        // City
        road:'#2a3540', roadL:'#3a4550', roadM:'#e9c46a',
        walk:'#3a4a55', walkL:'#4a5a66',
        bldTp:'#c25540', bldL:'#9a3f2e', bldR:'#7a3020',   // terracotta buildings!
        bldTp2:'#2a9d8f', bldL2:'#1a7a6a', bldR2:'#125a50', // teal variant
        win:'#e9c46a', winD:'#5a3010',
        lamp:'#c8b080', lampG:'#f4a261',
        // Medical
        hFloor:'#e8dcc8', hLine:'#c8b8a0',
        hWallT:'#fdf6ec', hWallL:'#e8dcc8', hWallR:'#d0c4b0',
        cross:'#e76f51',
        bed:'#fdf6ec', bedF:'#e8f4f0', pillow:'#ffffff',
        desk:'#d0c4b0', deskT:'#e8dcc8',
        plant:'#2a7a40', plantL:'#3a9a55', pot:'#c25540',
        // Chibi character – coral/teal outfit
        hair:'#1a2a40', hairH:'#2a9d8f',
        hairC:'#e76f51',                  // coral highlight streak
        skin:'#f4c89a', skinD:'#daa870',
        eye:'#2a9d8f', eyeD:'#0d1f28',
        jkt:'#264653', jktL:'#2a5a6a',
        shirt:'#fdf6ec',
        belt:'#1a2a40', buckle:'#e9c46a',
        pants:'#1a3a4a', pantsD:'#102530',
        boot:'#1a2a20', bootD:'#0d1a12',
        teal:'#2a9d8f', coral:'#e76f51',
        acc:'#e9c46a',
      };

      // World generation (seeded)
      let _seed = 2847;
      function rng() { _seed = (_seed * 1664525 + 1013904223) & 0x7fffffff; return _seed / 0x7fffffff; }

      const worldMap = [], objMap = [];
      for (let r = 0; r < WH; r++) {
        worldMap[r] = []; objMap[r] = [];
        for (let c = 0; c < WW; c++) {
          const rv = rng();
          if (r < GRASS_END) {
            const path = (c === 10 || c === 11);
            if (path)                                                                { worldMap[r][c]='dirt';  objMap[r][c]=null; }
            else if (rv < 0.05)                                                      { worldMap[r][c]='grass'; objMap[r][c]='tree'; }
            else if (rv < 0.08)                                                      { worldMap[r][c]='grass'; objMap[r][c]='flower_r'; }
            else if (rv < 0.11)                                                      { worldMap[r][c]='grass'; objMap[r][c]='flower_y'; }
            else if (rv < 0.13 && r>3 && r<GRASS_END-2 && c>14 && c<26)            { worldMap[r][c]='water'; objMap[r][c]=null; }
            else                                                                     { worldMap[r][c]='grass'; objMap[r][c]=null; }
          } else if (r < CITY_END) {
            const roadR = ((r - GRASS_END) % 5 === 0);
            const roadC = (c % 7 === 0);
            if (roadR || roadC) { worldMap[r][c]='road'; objMap[r][c]=(roadC&&!roadR&&rv<0.45)?'lamp':null; }
            else if (rv < 0.50) { worldMap[r][c]='walk'; objMap[r][c]='bldA'; }
            else                { worldMap[r][c]='walk'; objMap[r][c]='bldB'; }
          } else {
            if      (rv < 0.16) { worldMap[r][c]='hf'; objMap[r][c]='bed'; }
            else if (rv < 0.24) { worldMap[r][c]='hf'; objMap[r][c]='cross_obj'; }
            else if (rv < 0.28) { worldMap[r][c]='hf'; objMap[r][c]='desk'; }
            else if (rv < 0.32) { worldMap[r][c]='hf'; objMap[r][c]='plant'; }
            else                { worldMap[r][c]='hf'; objMap[r][c]=null; }
          }
        }
      }

      const cam = { x: 0, y: 0 };
      let vw = 0, vh = 0;

      function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        vw = canvas.offsetWidth; vh = canvas.offsetHeight;
        canvas.width  = vw * dpr; canvas.height = vh * dpr;
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;
      }

      function toScreen(gx, gy) {
        return { x: (gx - gy) * (TW / 2) - cam.x + vw / 2,
                 y: (gx + gy) * (TH / 2) - cam.y + vh / 2.8 };
      }
      function inView(sx, sy) {
        return sx > -TW * 4 && sx < vw + TW * 4 && sy > -TH * 16 && sy < vh + TH * 4;
      }

      // ── Draw helpers ──
      function diamond(x, y, fill, stroke) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + TW/2, y + TH/2);
        ctx.lineTo(x, y + TH); ctx.lineTo(x - TW/2, y + TH/2);
        ctx.closePath(); ctx.fill();
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.6; ctx.stroke(); }
      }
      function block(x, y, h, topC, leftC, rightC) {
        diamond(x, y, topC);
        ctx.fillStyle = leftC; ctx.beginPath();
        ctx.moveTo(x-TW/2,y+TH/2); ctx.lineTo(x,y+TH); ctx.lineTo(x,y+TH+h); ctx.lineTo(x-TW/2,y+TH/2+h);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = rightC; ctx.beginPath();
        ctx.moveTo(x+TW/2,y+TH/2); ctx.lineTo(x,y+TH); ctx.lineTo(x,y+TH+h); ctx.lineTo(x+TW/2,y+TH/2+h);
        ctx.closePath(); ctx.fill();
      }

      // ── Tile drawers ──
      function drawGrass(x, y, v) {
        diamond(x, y, v===1 ? P.gB : v===2 ? P.gC : P.gA, 'rgba(0,0,0,0.05)');
        if (v===2) { ctx.fillStyle=P.gD; ctx.fillRect(x-2,y+TH*0.6,4,3); ctx.fillRect(x+8,y+TH*0.5,3,4); }
      }
      function drawDirt(x, y) {
        diamond(x, y, P.dirt, 'rgba(0,0,0,0.08)');
        ctx.fillStyle = P.dirtL; ctx.fillRect(x-4, y+TH*0.42, 8, TH*0.36);
      }
      function drawWater(x, y, t) {
        diamond(x, y, P.water);
        const off = Math.sin(t * 0.035 + x * 0.06) * 5;
        ctx.fillStyle = P.waterL; ctx.fillRect(x-20+off, y+TH*0.38, 18, 2.5);
        ctx.fillStyle = P.waterS; ctx.fillRect(x-8+off,  y+TH*0.54, 24, 1.5);
      }
      function drawRoad(x, y) {
        diamond(x, y, P.road);
        ctx.fillStyle = P.roadM;
        ctx.fillRect(x-2, y+TH*0.44, 4, 2.5);
        ctx.fillRect(x+10, y+TH*0.52, 4, 2.5);
        ctx.fillRect(x-14, y+TH*0.36, 4, 2.5);
      }
      function drawWalk(x, y) { diamond(x, y, P.walk, 'rgba(0,0,0,0.07)'); }
      function drawHF(x, y) {
        diamond(x, y, P.hFloor, 'rgba(0,0,0,0.04)');
        ctx.strokeStyle = P.hLine; ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x-TW*0.3, y+TH*0.32); ctx.lineTo(x+TW*0.3, y+TH*0.68);
        ctx.stroke();
      }

      // ── Object drawers ──
      function drawTree(x, y) {
        block(x, y-38, 12, P.trunk, P.trunkD, P.trunkD);
        ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.beginPath();
        ctx.ellipse(x, y+TH*0.72, 18, 6, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = P.leafC; ctx.beginPath(); ctx.arc(x, y-58, 22, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = P.leafA; ctx.beginPath(); ctx.arc(x-9, y-66, 17, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = P.leafB; ctx.beginPath(); ctx.arc(x+8, y-64, 16, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = P.leafA; ctx.beginPath(); ctx.arc(x, y-74, 14, 0, Math.PI*2); ctx.fill();
      }
      function drawFlower(x, y, col) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y+TH*0.26, 4.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(x, y+TH*0.26, 1.8, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = P.leafB; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, y+TH*0.26); ctx.lineTo(x, y+TH*0.65); ctx.stroke();
      }
      function drawBuilding(x, y, teal) {
        const h = teal ? 70 : 52;
        if (teal) block(x, y-h, h, P.bldTp2, P.bldL2, P.bldR2);
        else      block(x, y-h, h, P.bldTp,  P.bldL,  P.bldR);
        const rows = teal ? 4 : 3;
        for (let r = 0; r < rows; r++) {
          const wy = y - h + 12 + r * 16;
          const wc = teal ? (Math.sin(x+r)>0 ? P.win : '#aaeedd') : (Math.sin(x+y+r)>0 ? P.win : P.winD);
          ctx.fillStyle = wc; ctx.fillRect(x-36, wy, 10, 7);
          ctx.fillStyle = wc; ctx.fillRect(x-22, wy+4, 10, 7);
          ctx.fillStyle = wc; ctx.fillRect(x+10, wy,   10, 7);
          ctx.fillStyle = wc; ctx.fillRect(x+24, wy+4, 10, 7);
        }
      }
      function drawLamp(x, y) {
        ctx.strokeStyle = P.lamp; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x, y+TH*0.5); ctx.lineTo(x, y-28); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y-28); ctx.lineTo(x+14, y-34); ctx.stroke();
        ctx.shadowColor = P.lampG; ctx.shadowBlur = 14;
        ctx.fillStyle = P.lampG; ctx.beginPath(); ctx.arc(x+14, y-34, 4, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      function drawBed(x, y) {
        block(x, y-10, 10, P.bed, '#d8ccb8', '#c0b0a0');
        ctx.fillStyle = P.bedF;   ctx.fillRect(x-28, y-17, 20, 8);
        ctx.fillStyle = P.pillow; ctx.fillRect(x-26, y-19, 12, 7);
      }
      function drawCrossObj(x, y) {
        ctx.fillStyle = P.cross;
        ctx.fillRect(x-2.5, y-22, 5, 18); ctx.fillRect(x-9, y-18, 18, 5);
      }
      function drawDesk(x, y) {
        block(x, y-12, 12, P.deskT, P.desk, '#b8a898');
        ctx.fillStyle = '#fdf6ec'; ctx.fillRect(x-15, y-19, 10, 5);
      }
      function drawPlant(x, y) {
        block(x, y-8, 8, P.pot, '#a04030', '#803020');
        ctx.fillStyle = P.plant;  ctx.beginPath(); ctx.arc(x-6, y-15, 9, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = P.plantL; ctx.beginPath(); ctx.arc(x+5, y-18, 8, 0, Math.PI*2); ctx.fill();
      }

      // ── CHIBI CHARACTER – 256px tall ──
      // Art grid: 18W x 32H pixel-art units, S=8 → 144x256 canvas pixels
      const S = 8, CHAR_W = 18, CHAR_H = 32;

      // Each rect: [x, y, w, h, colorKey]  (art-pixel coordinates)
      const FRAMES = [
        [ // Frame 0 – stride A (left foot forward)
          // Big chibi head (rows 0-11)
          [3,0,12,2,'hair'],[1,1,16,3,'hair'],          // hair top mass
          [4,0,5,3,'hairH'],[10,0,3,2,'hairC'],         // teal + coral streaks
          [2,3,14,9,'skin'],[3,4,12,9,'skin'],           // wide round face
          // Eyes (big chibi eyes)
          [3,6,4,4,'eyeD'],[4,6,2,3,'eye'],             // left eye
          [11,6,4,4,'eyeD'],[12,6,2,3,'eye'],           // right eye
          // Blush
          [3,9,3,2,'coral'],[12,9,3,2,'coral'],
          // Mouth
          [6,10,5,1,'eyeD'],
          // Hair fringe/front
          [2,2,4,4,'hair'],[13,2,3,3,'hair'],
          // Chin / hair bottom
          [2,11,14,2,'hair'],
          // Neck
          [7,12,4,3,'skin'],
          // Body (rows 13-21, compact chibi torso)
          [3,15,12,2,'shirt'],                          // collar
          [2,15,14,8,'jkt'],                            // jacket
          [6,15,6,8,'teal'],                            // teal chest stripe
          [7,14,4,3,'shirt'],                           // inner shirt
          // Belt
          [2,22,14,2,'belt'],[7,22,5,2,'buckle'],
          // Legs (rows 23-31, chibi wide short legs)
          [2,24,6,8,'pants'],[10,24,6,8,'pants'],       // left forward, right back
          [1,31,7,3,'boot'],[9,31,7,3,'boot'],          // big round boots
        ],
        [ // Frame 1 – plant A
          [3,0,12,2,'hair'],[1,1,16,3,'hair'],
          [4,0,5,3,'hairH'],[10,0,3,2,'hairC'],
          [2,3,14,9,'skin'],[3,4,12,9,'skin'],
          [3,6,4,4,'eyeD'],[4,6,2,3,'eye'],
          [11,6,4,4,'eyeD'],[12,6,2,3,'eye'],
          [3,9,3,2,'coral'],[12,9,3,2,'coral'],
          [6,10,5,1,'eyeD'],
          [2,2,4,4,'hair'],[13,2,3,3,'hair'],
          [2,11,14,2,'hair'],
          [7,12,4,3,'skin'],
          [3,15,12,2,'shirt'],[2,15,14,8,'jkt'],[6,15,6,8,'teal'],[7,14,4,3,'shirt'],
          [2,22,14,2,'belt'],[7,22,5,2,'buckle'],
          // legs closer together (planted)
          [4,24,5,8,'pants'],[9,24,5,8,'pants'],
          [3,31,7,3,'boot'],[8,31,7,3,'boot'],
        ],
        [ // Frame 2 – stride B (right foot forward) – slightly different leg pos
          [3,0,12,2,'hair'],[1,1,16,3,'hair'],
          [3,0,5,3,'hairH'],[11,0,3,2,'hairC'],
          [2,3,14,9,'skin'],[3,4,12,9,'skin'],
          [3,6,4,4,'eyeD'],[4,6,2,3,'eye'],
          [11,6,4,4,'eyeD'],[12,6,2,3,'eye'],
          [3,9,3,2,'coral'],[12,9,3,2,'coral'],
          [6,10,5,1,'eyeD'],
          [2,2,4,4,'hair'],[13,2,3,3,'hair'],
          [2,11,14,2,'hair'],
          [7,12,4,3,'skin'],
          [3,15,12,2,'shirt'],[2,15,14,8,'jkt'],[6,15,6,8,'teal'],[7,14,4,3,'shirt'],
          [2,22,14,2,'belt'],[7,22,5,2,'buckle'],
          // right leg forward now
          [2,24,6,8,'pants'],[10,24,6,8,'pants'],
          [1,31,7,3,'boot'],[9,31,7,3,'boot'],
        ],
        [ // Frame 3 – plant B
          [3,0,12,2,'hair'],[1,1,16,3,'hair'],
          [4,0,5,3,'hairH'],[10,0,3,2,'hairC'],
          [2,3,14,9,'skin'],[3,4,12,9,'skin'],
          [3,6,4,4,'eyeD'],[4,6,2,3,'eye'],
          [11,6,4,4,'eyeD'],[12,6,2,3,'eye'],
          [3,9,3,2,'coral'],[12,9,3,2,'coral'],
          [6,10,5,1,'eyeD'],
          [2,2,4,4,'hair'],[13,2,3,3,'hair'],
          [2,11,14,2,'hair'],
          [7,12,4,3,'skin'],
          [3,15,12,2,'shirt'],[2,15,14,8,'jkt'],[6,15,6,8,'teal'],[7,14,4,3,'shirt'],
          [2,22,14,2,'belt'],[7,22,5,2,'buckle'],
          [3,24,5,8,'pants'],[9,24,5,8,'pants'],
          [2,31,7,3,'boot'],[8,31,7,3,'boot'],
        ],
      ];

      function drawChar(sx, sy, frame, flipLeft) {
        const rects = FRAMES[frame % 4];
        // shadow ellipse
        ctx.fillStyle = 'rgba(0,0,0,0.20)';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 4, CHAR_W*S*0.46, 7, 0, 0, Math.PI*2);
        ctx.fill();
        // pixel art
        if (flipLeft) { ctx.save(); ctx.translate(sx*2, 0); ctx.scale(-1, 1); }
        const ox = sx - CHAR_W*S/2, oy = sy - CHAR_H*S;
        for (const [rx, ry, rw, rh, ck] of rects) {
          ctx.fillStyle = P[ck];
          ctx.fillRect(ox + rx*S, oy + ry*S, rw*S, rh*S);
        }
        if (flipLeft) ctx.restore();
      }

      // ── Character & movement state ──
      const char = { gx: 10.5, gy: 5.0, facing: 1, wf: 0 };
      const PSPD = 0.06, ASPD = 0.030;
      const WPS = [
        {gx:10,gy:4},{gx:18,gy:4},{gx:26,gy:8},{gx:36,gy:10},{gx:44,gy:6},
        {gx:50,gy:12},{gx:44,gy:15},{gx:32,gy:14},{gx:18,gy:15},{gx:10,gy:17},
        {gx:10,gy:22},{gx:22,gy:26},{gx:36,gy:24},{gx:48,gy:28},{gx:52,gy:34},
        {gx:42,gy:38},{gx:28,gy:40},{gx:14,gy:44},{gx:8,gy:50},{gx:22,gy:54},
        {gx:36,gy:52},{gx:50,gy:48},{gx:55,gy:40},{gx:55,gy:28},{gx:52,gy:14},
        {gx:40,gy:5},{gx:26,gy:3},{gx:10,gy:4},
      ];
      let wpIdx = 0, autoWalk = true, idleTimer = null;

      const keys = new Set();
      window.addEventListener('keydown', e => {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) {
          e.preventDefault(); keys.add(e.key);
          autoWalk = false; clearTimeout(idleTimer);
          idleTimer = setTimeout(() => { autoWalk = true; }, 5000);
        }
      });
      window.addEventListener('keyup', e => keys.delete(e.key));

      // ── Zone label ──
      const zoneEl = document.getElementById('zone-name');
      const ZONES = [
        { maxRow: GRASS_END-1, name: '◆  GRASS PLAINS',  col: '#2a9d8f' },
        { maxRow: CITY_END-1,  name: '◆  CITY',          col: '#e9c46a' },
        { maxRow: WH,          name: '◆  MEDICAL FIELD', col: '#e76f51' },
      ];
      let lastZone = -1;
      function updateZone() {
        let idx = ZONES.findIndex(z => char.gy <= z.maxRow);
        if (idx < 0) idx = ZONES.length - 1;
        if (idx !== lastZone) {
          zoneEl.classList.remove('visible');
          setTimeout(() => {
            zoneEl.textContent = ZONES[idx].name;
            zoneEl.style.borderColor = ZONES[idx].col;
            zoneEl.style.color = ZONES[idx].col;
            zoneEl.classList.add('visible');
          }, 420);
          lastZone = idx;
        }
      }

      // ── RAF pause ──
      let rafPaused = false, rafId = null;
      new IntersectionObserver(entries => {
        rafPaused = entries[0].intersectionRatio < 0.04;
        if (!rafPaused && !rafId) rafId = requestAnimationFrame(loop);
      }, { threshold: [0, 0.04] }).observe(document.getElementById('hero'));

      // ── Sky with warm stars ──
      function drawSky(t) {
        const g = ctx.createLinearGradient(0, 0, 0, vh);
        g.addColorStop(0, P.skyTop); g.addColorStop(1, P.skyHorizon);
        ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh);
        for (let i = 0; i < 55; i++) {
          const sx2 = (i * 193 + 41) % vw, sy2 = (i * 107 + 19) % (vh * 0.48);
          ctx.globalAlpha = Math.abs(Math.sin(t * 0.004 + i * 1.6)) * 0.5;
          const warmStar = i % 5 === 0 ? '#f4a261' : i % 3 === 0 ? '#e9c46a' : '#fdf6ec';
          ctx.fillStyle = warmStar;
          ctx.fillRect(sx2, sy2, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
        }
        ctx.globalAlpha = 1;
      }

      // ── Main loop ──
      let tick = 0;
      function loop() {
        if (rafPaused) { rafId = null; return; }

        let dx = 0, dy = 0;
        if (!autoWalk) {
          if (keys.has('ArrowUp')    || keys.has('w')) { dx -= PSPD; dy -= PSPD; }
          if (keys.has('ArrowDown')  || keys.has('s')) { dx += PSPD; dy += PSPD; }
          if (keys.has('ArrowLeft')  || keys.has('a')) { dx -= PSPD; dy += PSPD; }
          if (keys.has('ArrowRight') || keys.has('d')) { dx += PSPD; dy -= PSPD; }
        } else {
          const wp = WPS[wpIdx % WPS.length];
          const ddx = wp.gx - char.gx, ddy = wp.gy - char.gy;
          const dist = Math.hypot(ddx, ddy);
          if (dist < 0.3) wpIdx++;
          else { dx = (ddx / dist) * ASPD; dy = (ddy / dist) * ASPD; }
        }
        if (dx !== 0 || dy !== 0) {
          char.gx = Math.max(0, Math.min(WW-1, char.gx + dx));
          char.gy = Math.max(0, Math.min(WH-1, char.gy + dy));
          char.facing = dx >= 0 ? 1 : -1;
          if (tick % 6 === 0) char.wf++;
        }

        // Smooth camera (biased above center so character + world below visible)
        const cs = toScreen(char.gx, char.gy);
        cam.x += (cs.x - vw/2)  * 0.08;
        cam.y += (cs.y - vh/2.2) * 0.08;

        ctx.clearRect(0, 0, vw, vh);
        drawSky(tick);

        // Draw all tiles (painter's order)
        for (let gy2 = 0; gy2 < WH; gy2++) {
          for (let gx2 = 0; gx2 < WW; gx2++) {
            const s = toScreen(gx2, gy2);
            if (!inView(s.x, s.y)) continue;
            const t2 = worldMap[gy2][gx2];
            if      (t2 === 'grass') drawGrass(s.x, s.y, (gx2*3+gy2*2)%3);
            else if (t2 === 'dirt')  drawDirt(s.x, s.y);
            else if (t2 === 'water') drawWater(s.x, s.y, tick);
            else if (t2 === 'road')  drawRoad(s.x, s.y);
            else if (t2 === 'walk')  drawWalk(s.x, s.y);
            else if (t2 === 'hf')    drawHF(s.x, s.y);
            const o = objMap[gy2][gx2];
            if      (o === 'tree')      drawTree(s.x, s.y);
            else if (o === 'flower_r')  drawFlower(s.x, s.y, P.flowerR);
            else if (o === 'flower_y')  drawFlower(s.x, s.y, P.flowerY);
            else if (o === 'bldA')      drawBuilding(s.x, s.y, false);
            else if (o === 'bldB')      drawBuilding(s.x, s.y, true);
            else if (o === 'lamp')      drawLamp(s.x, s.y);
            else if (o === 'bed')       drawBed(s.x, s.y);
            else if (o === 'cross_obj') drawCrossObj(s.x, s.y);
            else if (o === 'desk')      drawDesk(s.x, s.y);
            else if (o === 'plant')     drawPlant(s.x, s.y);
          }
        }

        // Draw character on top of all tiles (256px chibi, prominent hero)
        const cs2 = toScreen(char.gx, char.gy);
        drawChar(cs2.x, cs2.y + TH * 0.5, char.wf, char.facing < 0);

        updateZone();
        tick++;
        rafId = requestAnimationFrame(loop);
      }

      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
      const init = toScreen(char.gx, char.gy);
      cam.x = init.x - vw/2; cam.y = init.y - vh/2.8;
      rafId = requestAnimationFrame(loop);
    })();

    /* ── PIANO JAZZ SOUNDTRACK ── */
    (function PianoJazz() {
      let actx = null, masterGain = null, isPlaying = false;
      let schedulerTimer = null, nextNoteTime = 0, beatIdx = 0;

      // ii-V-I-VI in F: Gm7 | C7 | Fmaj7 | Dm7  (two bars each)
      const BPM = 138;
      const BEAT = 60 / BPM;
      // Frequencies for jazz chords (root, 3rd, 5th, 7th)
      const CHORDS = [
        [196.00, 233.08, 293.66, 349.23],  // Gm7
        [261.63, 311.13, 392.00, 466.16],  // C7
        [174.61, 220.00, 261.63, 329.63],  // Fmaj7
        [146.83, 174.61, 220.00, 261.63],  // Dm7
      ];
      // Walk-bass notes (root on 1&3, fifth on 2&4)
      const BASS = [
        [98.00, 146.83, 98.00, 146.83],
        [130.81, 196.00, 130.81, 196.00],
        [87.31, 130.81, 87.31, 130.81],
        [73.42, 110.00, 73.42, 110.00],
      ];
      // Melody motif (scale-degree numbers, resolved per chord)
      const MEL_OFFSETS = [0,2,4,7, 4,2,0,2,  4,7,9,7, 4,2,0,-3];

      function piano(freq, t, dur, vol) {
        if (!actx) return;
        const g   = actx.createGain();
        const o1  = actx.createOscillator();
        const o2  = actx.createOscillator();
        const o3  = actx.createOscillator();
        o1.type = 'triangle'; o1.frequency.value = freq;
        o2.type = 'sine';     o2.frequency.value = freq * 2.003;
        o3.type = 'sine';     o3.frequency.value = freq * 3.01;
        const vols = [vol, vol*0.4, vol*0.15];
        [o1,o2,o3].forEach((o,i)=>{
          const og = actx.createGain();
          og.gain.setValueAtTime(vols[i], t);
          og.gain.exponentialRampToValueAtTime(0.0001, t+dur);
          o.connect(og); og.connect(g);
          o.start(t); o.stop(t+dur+0.05);
        });
        g.gain.value = 1;
        g.connect(masterGain);
      }

      function schedule() {
        while (nextNoteTime < actx.currentTime + 0.35) {
          const bar   = Math.floor(beatIdx / 8);
          const chord = CHORDS[bar % 4];
          const bass  = BASS[bar % 4];
          const beat  = beatIdx % 8;

          // Chord voicing: strum on 1, light on 3
          if (beat === 0) {
            chord.forEach((f, i) => piano(f, nextNoteTime + i*0.018, BEAT*3.2, 0.045));
            piano(bass[0] * 0.5, nextNoteTime, BEAT*0.9, 0.1);
          }
          if (beat === 2) piano(bass[1] * 0.5, nextNoteTime, BEAT*0.8, 0.08);
          if (beat === 4) {
            chord.slice(1).forEach((f, i) => piano(f, nextNoteTime + i*0.012, BEAT*1.6, 0.032));
            piano(bass[2] * 0.5, nextNoteTime, BEAT*0.9, 0.09);
          }
          if (beat === 6) piano(bass[3] * 0.5, nextNoteTime, BEAT*0.8, 0.07);

          // Melody (every other beat)
          if (beat % 2 === 1) {
            const root = chord[0] * 2;
            const ratio = Math.pow(2, MEL_OFFSETS[(bar*4 + Math.floor(beat/2)) % MEL_OFFSETS.length] / 12);
            piano(root * ratio, nextNoteTime, BEAT*0.65, 0.11);
          }

          nextNoteTime += BEAT * (beat===1||beat===5 ? 0.95 : 1.05); // swing feel
          beatIdx++;
        }
        schedulerTimer = setTimeout(schedule, 150);
      }

      function start() {
        if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = actx.createGain();
        masterGain.gain.value = 0.38;
        // Soft reverb-like filtering
        const filter = actx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 4000;
        masterGain.connect(filter); filter.connect(actx.destination);
        nextNoteTime = actx.currentTime + 0.15;
        beatIdx = 0;
        schedule();
        isPlaying = true;
      }
      function stop() {
        clearTimeout(schedulerTimer);
        if (masterGain) { masterGain.gain.setTargetAtTime(0, actx.currentTime, 0.6); }
        setTimeout(() => { isPlaying = false; }, 700);
      }

      const btn = document.getElementById('music-toggle');
      if (btn) btn.addEventListener('click', () => {
        if (isPlaying) { stop(); btn.classList.remove('playing'); btn.innerHTML='&#9835;'; }
        else { start(); btn.classList.add('playing'); btn.innerHTML='&#9835; ON'; }
      });

      // Auto-start on first page interaction
      document.addEventListener('pointerdown', function kick() {
        if (!isPlaying) {
          start();
          if (btn) { btn.classList.add('playing'); btn.innerHTML='&#9835; ON'; }
        }
        document.removeEventListener('pointerdown', kick);
      }, { once: true });
    })();


    /* ── Scroll-triggered card reveal ── */
    const cards = document.querySelectorAll('.project-card');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach(c => observer.observe(c));

    /* ── Footer easter egg (triple-click) ── */
    let clickCount = 0, clickTimer;
    document.getElementById('footer').addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => clickCount = 0, 500);
      if (clickCount >= 3) {
        document.getElementById('easter').classList.add('revealed');
        clickCount = 0;
      }
    });

    /* ── Contact form handler ── */
    function handleSubmit(e) {
      e.preventDefault();
      const btn  = e.target.querySelector('.submit-btn span');
      const orig = btn.textContent;
      btn.textContent = 'Message Sent ✓';
      e.target.reset();
      setTimeout(() => btn.textContent = orig, 3000);
    }

/* ══════════════════════════════════════
   SKILLS SHOWCASE
══════════════════════════════════════ */
(function SkillsShowcase() {
  const canvas = document.getElementById('char-main-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Pixel scale — each art-pixel = 16 screen pixels → big, sticker-worthy
  const S = 16, CHAR_W = 18, CHAR_H = 32, PAD_X = 64, PAD_Y = 48;
  canvas.width  = CHAR_W * S + PAD_X * 2;   // 416
  canvas.height = CHAR_H * S + PAD_Y * 2;   // 608

  // ── Palette ──────────────────────────────────────────────────────
  const P = {
    hair:'#1a2a40',hairH:'#2a9d8f',hairC:'#e76f51',
    skin:'#f4c89a',skinD:'#daa870',
    eye:'#2a9d8f',eyeD:'#0d1f28',
    jkt:'#264653',jktL:'#2a5a6a',shirt:'#fdf6ec',
    belt:'#1a2a40',buckle:'#e9c46a',
    pants:'#1a3a4a',pantsD:'#102530',
    boot:'#1a2a20',bootD:'#0d1a12',
    teal:'#2a9d8f',coral:'#e76f51',acc:'#e9c46a',
    sword:'#00ffaa',swordD:'#006644',swordE:'#ffffff',
    gun:'#445566',gunD:'#334455',gunA:'#ffaa00',
    shield:'#2255cc',shieldL:'#3366ee',shieldE:'#ffffff',
    ham:'#887755',hamD:'#665533',hamH:'#ccaa66',
  };

  // ── Shared pixel-art body parts ──────────────────────────────────
  const HEAD = [
    [3,0,12,2,'hair'],[1,1,16,3,'hair'],
    [4,0,5,3,'hairH'],[10,0,3,2,'hairC'],
    [2,2,4,4,'hair'],[13,2,3,3,'hair'],
    [2,11,14,2,'hair'],
    [2,3,14,9,'skin'],[3,4,12,9,'skin'],
    [3,6,4,4,'eyeD'],[4,6,2,3,'eye'],
    [11,6,4,4,'eyeD'],[12,6,2,3,'eye'],
    [3,9,3,2,'coral'],[12,9,3,2,'coral'],
    [6,10,5,1,'eyeD'],
    [7,12,4,3,'skin'],
  ];
  const BODY = [
    [3,15,12,2,'shirt'],[2,15,14,8,'jkt'],[6,15,6,8,'teal'],[7,14,4,3,'shirt'],
    [2,22,14,2,'belt'],[7,22,5,2,'buckle'],
  ];
  const LEGS_IDLE  = [[2,24,6,8,'pants'],[10,24,6,8,'pants'],[1,31,7,3,'boot'],[9,31,7,3,'boot']];
  const LEGS_WIDE  = [[1,24,6,9,'pants'],[11,24,6,9,'pants'],[0,32,8,3,'boot'],[10,32,8,3,'boot']];
  const LEGS_CLOSE = [[4,24,5,8,'pants'],[9,24,5,8,'pants'],[3,31,7,3,'boot'],[8,31,7,3,'boot']];
  const LEGS_LEAN  = [[3,24,6,7,'pants'],[10,24,6,7,'pants'],[2,30,7,4,'boot'],[9,30,7,4,'boot']];

  const FRAMES = {
    idle:     [...HEAD,...BODY,...LEGS_IDLE],
    critical: [...HEAD,...BODY,...LEGS_WIDE],
    strike:   [...HEAD,...BODY,...LEGS_WIDE],
    guard:    [...HEAD,...BODY,...LEGS_CLOSE],
    gunner:   [...HEAD,...BODY,...LEGS_WIDE],
    beast:    [...HEAD,...BODY,...LEGS_IDLE],
    warp:     [...HEAD,...BODY,...LEGS_LEAN],
  };

  const SKILL_INFO = {
    idle:     {label:'IDLE',            desc:'Hover a skill card to activate',                                        color:'#00ffaa'},
    critical: {label:'CRITICAL ACTIVATE',desc:'Channel raw energy into a single devastating blade strike.',           color:'#00ffaa'},
    strike:   {label:'STRIKE',           desc:'A precise cut through any defense — executed in under 0.3 seconds.',   color:'#ff4488'},
    guard:    {label:'GUARD',            desc:'Absorb, redirect, and wait for the perfect counter.',                  color:'#4499ff'},
    gunner:   {label:'GUNNER',           desc:'300 rounds per second of pure suppression fire. No reloads.',          color:'#ffaa00'},
    beast:    {label:'BEAST RIDER',      desc:'Summon the data-beast. Charge headlong through any firewall.',         color:'#cc44ff'},
    warp:     {label:'WARP DRIVE',       desc:'Break the speed limit. Appear behind the problem before it sees you.', color:'#44ffee'},
  };

  let currentSkill = 'idle', tick = 0, effectPh = 0;

  // ── Web Audio ────────────────────────────────────────────────────
  let actx = null;
  function ac() {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    return actx;
  }
  function tone(freq, dur, vol=0.12, type='square', startDelay=0) {
    try {
      const a=ac(), o=a.createOscillator(), g=a.createGain();
      o.type=type; o.frequency.setValueAtTime(freq, a.currentTime+startDelay);
      g.gain.setValueAtTime(vol, a.currentTime+startDelay);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime+startDelay+dur);
      o.connect(g); g.connect(a.destination);
      o.start(a.currentTime+startDelay); o.stop(a.currentTime+startDelay+dur+0.01);
    } catch(e){}
  }
  function sweep(f0,f1,dur,vol=0.14,type='sawtooth') {
    try {
      const a=ac(), o=a.createOscillator(), g=a.createGain();
      o.type=type;
      o.frequency.setValueAtTime(f0, a.currentTime);
      o.frequency.exponentialRampToValueAtTime(f1, a.currentTime+dur);
      g.gain.setValueAtTime(vol, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime+dur);
      o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime+dur+0.01);
    } catch(e){}
  }

  const SOUNDS = {
    hover:    () => tone(440+Math.random()*160, 0.06, 0.08),
    critical: () => { [523,659,784,1047].forEach((f,i)=>tone(f,0.14,0.11,'square',i*0.07)); },
    strike:   () => { sweep(880,440,0.08,0.13,'sawtooth'); setTimeout(()=>tone(320,0.08,0.08,'square'),80); },
    guard:    () => { tone(200,0.15,0.14,'triangle'); setTimeout(()=>tone(260,0.07,0.08,'square'),90); },
    gunner:   () => { [0,55,110,165,220].forEach(d=>setTimeout(()=>tone(300+Math.random()*200,0.05,0.1,'square'),d)); },
    beast:    () => sweep(80,320,0.32,0.18,'sawtooth'),
    warp:     () => sweep(200,2400,0.26,0.12,'sine'),
    export:   () => { tone(1200,0.025,0.12,'square'); setTimeout(()=>tone(800,0.04,0.08,'sine'),30); },
  };

  // ── Canvas drawing ───────────────────────────────────────────────
  function drawScene(skill, t) {
    const W = canvas.width, H = canvas.height;
    const info = SKILL_INFO[skill];
    const col = info.color;
    ctx.clearRect(0,0,W,H);

    // Background radial glow
    const bg = ctx.createRadialGradient(W/2,H*0.65,20,W/2,H*0.65,W*0.75);
    bg.addColorStop(0, col+'22');
    bg.addColorStop(1,'rgba(7,5,26,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // CRT scanlines
    for(let y=0;y<H;y+=4){ctx.fillStyle='rgba(0,0,0,0.07)';ctx.fillRect(0,y,W,2);}

    // Shadow under character
    ctx.fillStyle='rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(PAD_X+CHAR_W*S/2, PAD_Y+CHAR_H*S+10, CHAR_W*S*0.42, 11, 0, 0, Math.PI*2);
    ctx.fill();

    // Pulsing aura (non-idle)
    effectPh += 0.045;
    if (skill !== 'idle') {
      const pulse = Math.abs(Math.sin(effectPh));
      ctx.save();
      ctx.shadowColor=col; ctx.shadowBlur=50*pulse;
      ctx.globalAlpha=0.08*pulse;
      ctx.fillStyle=col;
      ctx.beginPath();
      ctx.ellipse(PAD_X+CHAR_W*S/2, PAD_Y+CHAR_H*S*0.5, 70,110,0,0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1; ctx.restore();
    }

    // ── Pixel character ──
    const rects = FRAMES[skill]||FRAMES.idle;
    ctx.save();
    if(skill!=='idle'){ctx.shadowColor=col; ctx.shadowBlur=6;}
    for(const [rx,ry,rw,rh,ck] of rects){
      ctx.fillStyle=P[ck]||'#888';
      ctx.fillRect(PAD_X+rx*S, PAD_Y+ry*S, rw*S, rh*S);
    }
    ctx.restore();

    // ── Skill-specific FX ──
    const ph = effectPh;
    const ox = PAD_X, oy = PAD_Y;

    if (skill==='critical') {
      // Diagonal energy sword top-right
      ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=22;
      for(let i=0;i<9;i++){
        ctx.fillStyle = i%3===0?'#ffffff':col;
        ctx.fillRect(ox+(15+i)*S, oy+(9-i)*S, S, S*2);
      }
      // Orbiting energy sparks
      for(let i=0;i<6;i++){
        const a2=ph+i*1.05, px2=ox+CHAR_W*S*0.5+Math.cos(a2)*52, py2=oy+CHAR_H*S*0.35+Math.sin(a2)*38;
        ctx.globalAlpha=Math.abs(Math.sin(ph+i))*0.9;
        ctx.fillStyle=i%2?col:'#ffffff';
        ctx.fillRect(px2,py2,8,8);
      }
      ctx.globalAlpha=1; ctx.restore();
    }

    if (skill==='strike') {
      ctx.save();
      const flash=Math.abs(Math.sin(ph*2.5));
      ctx.strokeStyle=col; ctx.lineWidth=5; ctx.shadowColor=col; ctx.shadowBlur=18;
      ctx.globalAlpha=flash;
      ctx.beginPath();
      ctx.arc(ox+CHAR_W*S*0.5+50, oy+CHAR_H*S*0.38, 54, -Math.PI*0.85, Math.PI*0.05);
      ctx.stroke();
      // Speed lines right side
      for(let i=0;i<6;i++){
        const lx=ox+CHAR_W*S+8+i*10, ly=oy+(9+i*3)*S;
        ctx.globalAlpha=(0.55-i*0.08)*flash;
        ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+36,ly+12); ctx.stroke();
      }
      ctx.globalAlpha=1; ctx.restore();
    }

    if (skill==='guard') {
      ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=20;
      // Shield left of character
      ctx.fillStyle=P.shield; ctx.fillRect(ox-3*S, oy+13*S, 4*S, 6*S);
      ctx.fillStyle=P.shieldL; ctx.fillRect(ox-2*S, oy+14*S, 2*S, 4*S);
      ctx.fillStyle='#ffffff'; ctx.fillRect(ox-S*1.5, oy+15*S, S, 2*S);
      // Pulse ring
      const r=45+Math.sin(ph)*12;
      ctx.globalAlpha=Math.abs(Math.sin(ph))*0.45;
      ctx.strokeStyle=col; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(ox+CHAR_W*S*0.5, oy+CHAR_H*S*0.5, r, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha=1; ctx.restore();
    }

    if (skill==='gunner') {
      ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=16;
      // Large gun on left
      ctx.fillStyle=P.gunD; ctx.fillRect(ox-7*S, oy+14*S, 9*S, 3*S);
      ctx.fillStyle=P.gun;  ctx.fillRect(ox-5*S, oy+16*S, 6*S, 4*S);
      ctx.fillStyle=P.gunA; ctx.fillRect(ox-3*S, oy+17*S, 2*S, 2*S);
      // Muzzle flash
      if(Math.sin(ph*9)>0.3){
        ctx.fillStyle='#ffffaa'; ctx.globalAlpha=0.85;
        ctx.fillRect(ox-10*S, oy+14*S, 4*S, 3*S);
        ctx.fillStyle='#ffffff'; ctx.globalAlpha=0.6;
        ctx.fillRect(ox-12*S, oy+15*S, 3*S, S);
      }
      ctx.globalAlpha=1; ctx.restore();
    }

    if (skill==='beast') {
      ctx.save();
      for(let i=0;i<4;i++){
        const r2=35+i*28+Math.sin(ph+i)*10;
        ctx.strokeStyle=col; ctx.lineWidth=2;
        ctx.globalAlpha=(0.45-i*0.09)*Math.abs(Math.sin(ph*0.9+i));
        ctx.shadowColor=col; ctx.shadowBlur=10;
        ctx.beginPath(); ctx.arc(ox+CHAR_W*S/2, oy+CHAR_H*S*0.48, r2,0,Math.PI*2); ctx.stroke();
      }
      // Beast rune triangle
      ctx.globalAlpha=Math.abs(Math.sin(ph))*0.55;
      ctx.strokeStyle=col; ctx.lineWidth=2;
      const cx2=ox+CHAR_W*S/2, cy2=oy+CHAR_H*S*0.48, rr=70;
      ctx.beginPath();
      for(let i=0;i<3;i++){
        const a2=ph+i*Math.PI*2/3-Math.PI/2;
        i===0?ctx.moveTo(cx2+Math.cos(a2)*rr,cy2+Math.sin(a2)*rr):ctx.lineTo(cx2+Math.cos(a2)*rr,cy2+Math.sin(a2)*rr);
      }
      ctx.closePath(); ctx.stroke();
      ctx.globalAlpha=1; ctx.restore();
    }

    if (skill==='warp') {
      ctx.save();
      const rects2=FRAMES.warp;
      for(let i=1;i<=6;i++){
        ctx.globalAlpha=(0.3-i*0.04)*Math.abs(Math.sin(ph*3));
        for(const [rx,ry,rw,rh,ck] of rects2){
          ctx.fillStyle=col;
          ctx.fillRect(ox+rx*S+i*9, oy+ry*S+i*4, rw*S, rh*S);
        }
      }
      ctx.globalAlpha=1;
      // Speed streaks
      ctx.strokeStyle=col; ctx.lineWidth=2;
      for(let i=0;i<8;i++){
        const lx=ox+CHAR_W*S+4+i*12, ly=oy+(5+i*3)*S;
        ctx.globalAlpha=(0.6-i*0.07)*Math.abs(Math.sin(ph*4+i));
        ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+40+i*8,ly+i*4); ctx.stroke();
      }
      ctx.globalAlpha=1; ctx.restore();
    }
  }

  // ── Animation loop ────────────────────────────────────────────────
  function loop() { drawScene(currentSkill, tick++); requestAnimationFrame(loop); }
  loop();

  // ── Skill card interactions ───────────────────────────────────────
  const labelEl = document.getElementById('skill-active-label');
  const descEl  = document.getElementById('skill-desc-text');

  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const sk = card.dataset.skill;
      currentSkill = sk;
      document.querySelectorAll('.skill-card').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      const info = SKILL_INFO[sk];
      if(labelEl){ labelEl.textContent=info.label; labelEl.style.color=info.color; labelEl.style.textShadow=`0 0 22px ${info.color}`; }
      if(descEl) descEl.textContent=info.desc;
      SOUNDS.hover();
    });
    card.addEventListener('click', () => { if(SOUNDS[card.dataset.skill]) SOUNDS[card.dataset.skill](); });
  });

  // ── Export as PNG ─────────────────────────────────────────────────
  document.getElementById('export-btn')?.addEventListener('click', () => {
    SOUNDS.export();
    const ec = document.createElement('canvas');
    ec.width = canvas.width; ec.height = canvas.height;
    const ectx = ec.getContext('2d');
    ectx.imageSmoothingEnabled = false;
    // Transparent bg with soft glow for sticker
    const info = SKILL_INFO[currentSkill];
    ectx.shadowColor = info.color; ectx.shadowBlur = 18;
    const rects = FRAMES[currentSkill]||FRAMES.idle;
    for(const [rx,ry,rw,rh,ck] of rects){
      ectx.fillStyle=P[ck]||'#888';
      ectx.fillRect(PAD_X+rx*S, PAD_Y+ry*S, rw*S, rh*S);
    }
    const a = document.createElement('a');
    a.download = `prakit-${currentSkill}.png`;
    a.href = ec.toDataURL('image/png');
    a.click();
  });

})();
