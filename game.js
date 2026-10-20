class Game {
    constructor() {
        this.state = {
            turnover: 0, target: 10000, margin: 0, stress: 0, satisfaction: 100,
            round: 1, maxRounds: 10, servicesSold: 0, customersServed: 0, currentCustomer: null, inProgress: false
        };
        this.stats = { totalShifts: 0, maxTurnover: 0, totalRevenue: 0, history: [] };
        this.loadLocalStorage();
        this.initListeners();
    }

    loadLocalStorage() {
        const saved = localStorage.getItem('elektro_save_v5');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.state = data.state || this.state;
                this.stats = data.stats || this.stats;
            } catch (e) { console.error(e); }
        }
        if (this.state.inProgress) document.getElementById('btn-continue').style.display = 'block';
    }

    saveLocalStorage() {
        localStorage.setItem('elektro_save_v5', JSON.stringify({ state: this.state, stats: this.stats }));
    }

    initListeners() {
        document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-continue').addEventListener('click', () => this.continueGame());
        document.getElementById('btn-stats').addEventListener('click', () => this.showScreen('screen-stats'));
        document.getElementById('btn-settings').addEventListener('click', () => this.showScreen('screen-settings'));
        document.getElementById('btn-pause-menu').addEventListener('click', () => this.toMenu());
        document.getElementById('btn-finish-shift').addEventListener('click', () => this.toMenu());

        document.querySelectorAll('.btn-close').forEach(b => b.addEventListener('click', () => this.toMenu()));

        document.getElementById('btn-toilet').addEventListener('click', () => this.startLelkyMinigame());
        document.getElementById('btn-keyhole').addEventListener('click', () => this.startKeyholeMinigame());
        document.getElementById('btn-package').addEventListener('click', () => this.startPackageMinigame());
        document.getElementById('btn-close-minigame').addEventListener('click', () => this.showScreen('screen-game'));

        document.getElementById('btn-export').addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
            const dl = document.createElement('a'); dl.setAttribute("href", dataStr); dl.setAttribute("download", "elektro_save.json"); dl.click();
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
            if (confirm("Opravdu vymazat postup?")) { localStorage.removeItem('elektro_save_v5'); location.reload(); }
        });
    }

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        if (id === 'screen-stats') this.updateStatsView();
    }

    toMenu() {
        this.saveLocalStorage();
        this.showScreen('screen-menu');
        if (this.state.inProgress) document.getElementById('btn-continue').style.display = 'block';
    }

    startNewGame() {
        this.state = {
            turnover: 0, target: 10000 + Math.floor(Math.random() * 5000), margin: 0, stress: 0, satisfaction: 100,
            round: 1, maxRounds: 10, servicesSold: 0, customersServed: 0, currentCustomer: null, inProgress: true
        };
        this.saveLocalStorage();
        this.showScreen('screen-game');
        this.nextRound();
    }

    continueGame() { this.showScreen('screen-game'); this.renderCustomer(); }

    nextRound() {
        if (this.state.round > this.state.maxRounds) { this.endShift(); return; }
        if (Math.random() < 0.35 && this.state.round > 1) { this.triggerEvent(); return; }

        const arch = CUSTOMER_ARCHETYPES[Math.floor(Math.random() * CUSTOMER_ARCHETYPES.length)];
        const dlg = arch.dialogs[Math.floor(Math.random() * arch.dialogs.length)];
        this.state.currentCustomer = { archetype: arch.name, avatar: arch.avatar, dialog: dlg, requiredBatteries: arch.requiredBatteries };
        this.saveLocalStorage();
        this.renderCustomer();
    }

    renderCustomer() {
        document.getElementById('hud-turnover').innerText = this.state.turnover;
        document.getElementById('hud-target').innerText = this.state.target;
        document.getElementById('hud-stress').innerText = this.state.stress;
        document.getElementById('hud-round').innerText = this.state.round;
        document.getElementById('hud-margin').innerText = this.state.margin;
        document.getElementById('hud-satisfaction').innerText = this.state.satisfaction;

        const cust = this.state.currentCustomer;
        document.getElementById('avatar-icon').innerText = cust.avatar;
        document.getElementById('customer-archetype-name').innerText = `${cust.archetype} (Požaduje baterií: ${cust.requiredBatteries})`;
        document.getElementById('customer-dialog').innerText = `„${cust.dialog}“`;

        const area = document.getElementById('product-recommendation-area');
        area.innerHTML = '';

        // Tlačítko prodeje baterií podle požadavku zákazníka
        const batProd = PRODUCTS_DATA.find(p => p.category === 'baterie');
        const batDiv = document.createElement('div');
        batDiv.className = 'rec-item';
        batDiv.style.border = '2px solid var(--primary)';
        batDiv.innerHTML = `
            <div class="rec-info"><div class="title">🔋 Prodat baterie (${cust.requiredBatteries} ks)</div><div class="price">${batProd.price * cust.requiredBatteries} Kč</div></div>
            <button class="btn primary" style="padding:6px 12px; font-size:0.8rem;">Prodat</button>
        `;
        batDiv.addEventListener('click', () => {
            this.makeBatterySale(batProd, cust.requiredBatteries, true);
        });
        area.appendChild(batDiv);

        // Náhodný další produkt nebo minihra s fólií
        const prod = PRODUCTS_DATA[Math.floor(Math.random() * PRODUCTS_DATA.length)];
        const pDiv = document.createElement('div');
        pDiv.className = 'rec-item';
        pDiv.innerHTML = `
            <div class="rec-info"><div class="title">📦 ${prod.name}</div><div class="price">${prod.price} Kč</div></div>
            <button class="btn secondary" style="padding:6px 12px; font-size:0.8rem;">Zvolit</button>
        `;
        pDiv.addEventListener('click', () => {
            if (prod.minigame === 'foil') this.startFoilMinigame(prod);
            else this.makeBatterySale(prod, 0, false);
        });
        area.appendChild(pDiv);

        // Možnost odmítnout / neprodat baterie (pokud je zákazník vyžadoval -> sankce)
        const skip = document.createElement('div');
        skip.className = 'rec-item';
        skip.style.background = '#3f3f46';
        skip.innerHTML = `<div class="rec-info"><div class="title" style="color: var(--danger);">Odmítnout / Ignorovat baterie</div></div>`;
        skip.addEventListener('click', () => {
            if (cust.requiredBatteries > 0) {
                const fine = cust.requiredBatteries * 50;
                this.state.turnover = Math.max(0, this.state.turnover - fine);
                this.state.stress += 12;
                alert(`💸 Zákazník chtěl ${cust.requiredBatteries} baterií, ale odešel s prázdnou! Vedoucí ti udělil finanční sankci -${fine} Kč z osobního ohodnocení.`);
            } else {
                alert("Zákazník odešel bez nákupu, ale žádné baterie nepožadoval.");
            }
            this.state.customersServed++;
            this.state.round++;
            this.saveLocalStorage();
            this.nextRound();
        });
        area.appendChild(skip);
    }

    makeBatterySale(item, count, isBattery) {
        const totalCount = isBattery ? count : 1;
        const totalPrice = item.price * totalCount;
        const totalCost = item.cost * totalCount;

        this.state.turnover += totalPrice;
        this.state.margin += (totalPrice - totalCost);
        this.state.stress = Math.max(0, this.state.stress - 3);
        this.state.customersServed++;
        this.state.round++;
        this.saveLocalStorage();
        this.nextRound();
    }

    // --- MINIHRY ---

    // 1. Klíčová dírka s uhýbajícím okem a časovačem
    startKeyholeMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "👁️ Párátko v oku vedoucího";
        document.getElementById('btn-close-minigame').style.display = 'none';
        
        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p id="kh-timer" style="margin-bottom:5px; color:var(--danger); font-weight:bold;">Čas: 6s</p>
            <div class="keyhole-view" style="position:relative; width:220px; height:220px; overflow:hidden;">
                <div class="boss-eye" id="boss-eye" style="position:absolute; font-size:3rem; cursor:pointer;">👁️</div>
            </div>
            <p id="kh-status" style="margin-top:5px; font-weight:bold;">Zásahy: 0 / 3</p>
        `;

        let hits = 0;
        let timeLeft = 6;
        const eye = document.getElementById('boss-eye');
        const status = document.getElementById('kh-status');
        const timerText = document.getElementById('kh-timer');

        const timer = setInterval(() => {
            timeLeft--;
            timerText.innerText = `Čas: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                clearInterval(moveLoop);
                this.state.stress += 20;
                alert("⏰ Čas vypršel! Vedoucí tě přistihl u klíčové dírky. Stres +20%!");
                this.showScreen('screen-game');
                this.renderCustomer();
            }
        }, 1000);

        const moveLoop = setInterval(() => {
            const x = Math.random() * 140;
            const y = Math.random() * 140;
            const scale = Math.random() * 0.8 + 0.6;
            eye.style.left = `${x}px`;
            eye.style.top = `${y}px`;
            eye.style.transform = `scale(${scale})`;
        }, 400);

        eye.onclick = () => {
            hits++;
            status.innerText = `Zásahy: ${hits} / 3`;
            if (hits >= 3) {
                clearInterval(timer);
                clearInterval(moveLoop);
                this.state.stress = Math.max(0, this.state.stress - 30);
                alert("🎯 Zásah! Vedoucí má oko v obvazu, stres klesl o 30%!");
                this.showScreen('screen-game');
                this.renderCustomer();
            }
        };
    }

    // 2. Chytání lelků na WC (skuteční ptáci / lelci)
    startLelkyMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "🐦 Chytání lelků na WC";
        document.getElementById('btn-close-minigame').style.display = 'none';

        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:5px; font-size:0.8rem;">Chyť 6 poletujících lelků na záchodě!</p>
            <div class="phone-screen" id="lelky-screen" style="height:260px; position:relative; background:#18181b;">
                <div id="lelky-target" style="position:absolute; font-size:2.5rem; cursor:pointer; top:80px; left:80px;">🦅</div>
            </div>
            <p id="lelky-score" style="margin-top:5px;">Chyceno lelků: 0 / 6</p>
        `;

        let score = 0;
        const target = document.getElementById('lelky-target');
        const counter = document.getElementById('lelky-score');
        const lelkyIcons = ['🦅', '🦉', '🦆', '🦇', '🦜'];

        target.onclick = () => {
            score++;
            counter.innerText = `Chyceno lelků: ${score} / 6`;
            if (score >= 6) {
                this.state.stress = Math.max(0, this.state.stress - 25);
                alert("✨ Úspěšně chyceno 6 lelků! Zpět na prodejnu, stres -25%.");
                this.showScreen('screen-game');
                this.renderCustomer();
            } else {
                target.innerText = lelkyIcons[Math.floor(Math.random() * lelkyIcons.length)];
                target.style.top = `${Math.random() * 180 + 20}px`;
                target.style.left = `${Math.random() * 140 + 20}px`;
            }
        };
    }

    // 3. Hledání balíku na čas
    startPackageMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "📦 Hledání ztraceného balíku";
        document.getElementById('btn-close-minigame').style.display = 'none';

        const content = document.getElementById('minigame-content');
        const winningIndex = Math.floor(Math.random() * 6);

        content.innerHTML = `
            <p style="margin-bottom:5px; font-size:0.8rem;">Najdi správnou krabici v rozházeném skladu!</p>
            <div class="warehouse-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; max-width:280px; margin:10px auto;">
                ${[0,1,2,3,4,5].map(i => `<div class="warehouse-box" data-idx="${i}" style="background:#3f3f46; padding:15px; border-radius:8px; font-size:1.8rem; cursor:pointer;">📦</div>`).join('')}
            </div>
            <p id="pkg-timer" style="margin-top:5px; color:var(--danger); font-weight:bold;">Čas: 5s</p>
        `;

        let timeLeft = 5;
        const timerText = document.getElementById('pkg-timer');

        const timer = setInterval(() => {
            timeLeft--;
            timerText.innerText = `Čas: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.state.stress += 15;
                alert("⏰ Čas vypršel! Zákazník odešel zuřit. Stres +15%!");
                this.showScreen('screen-game');
                this.renderCustomer();
            }
        }, 1000);

        document.querySelectorAll('.warehouse-box').forEach(box => {
            box.onclick = () => {
                clearInterval(timer);
                const idx = parseInt(box.getAttribute('data-idx'));
                if (idx === winningIndex) {
                    this.state.turnover += 799;
                    this.state.margin += 400;
                    this.state.stress = Math.max(0, this.state.stress - 10);
                    alert("🎉 Balík nalezen a předán! Obrat +799 Kč.");
                } else {
                    this.state.stress += 10;
                    alert("💥 Špatná krabice! Našel jsi jen staré prospekty. Stres +10%!");
                }
                this.showScreen('screen-game');
                this.renderCustomer();
            };
        });
    }

    // 4. Lepení fólie: prach a chlupy přibývají, odklikáváš je, tlačítko uskakuje, sleva podle chlupů
    startFoilMinigame(item) {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "📱 Lepení fólie (Prachové peklo)";
        document.getElementById('btn-close-minigame').style.display = 'none';

        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:5px; font-size:0.75rem;">Odstraňuj prach a chlupy rychlým kliknutím! Tlačítko nalepit uskakuje.</p>
            <div class="phone-screen" id="foil-area" style="height:200px; width:220px; position:relative; background:#000; margin:0 auto; border:4px solid #444; border-radius:12px; overflow:hidden;">
                <div id="dust-box"></div>
            </div>
            <div id="btn-container" style="margin-top:15px; position:relative; height:45px;">
                <button id="btn-confirm-foil" class="btn primary" style="position:absolute; left:50%; transform:translateX(-50%); padding:8px 16px;">Nalepit fólii</button>
            </div>
        `;

        const dustBox = document.getElementById('dust-box');
        let dustCount = 4;

        const spawnDust = () => {
            if (dustCount < 12) {
                dustCount++;
                const p = document.createElement('div');
                p.className = 'dust-particle';
                p.style.position = 'absolute';
                p.style.width = '14px';
                p.style.height = '14px';
                p.style.background = '#fff';
                p.style.borderRadius = '50%';
                p.style.cursor = 'pointer';
                p.style.top = `${Math.random() * 160 + 15}px`;
                p.style.left = `${Math.random() * 180 + 15}px`;
                p.style.boxShadow = '0 0 4px #ff6600';
                p.onclick = () => { p.remove(); dustCount = Math.max(0, dustCount - 1); };
                dustBox.appendChild(p);
            }
        };

        // Vytvoření počátečního prachu
        for(let i=0; i<4; i++) spawnDust();

        // Prach a chlupy rychle přibývají v reálném čase
        const dustSpawner = setInterval(spawnDust, 700);

        const foilBtn = document.getElementById('btn-confirm-foil');
        const randomizeBtnPos = () => {
            const randomX = (Math.random() * 160) - 80;
            foilBtn.style.transform = `translateX(calc(-50% + ${randomX}px))`;
        };

        foilBtn.onmouseover = randomizeBtnPos;
        foilBtn.ontouchstart = randomizeBtnPos;

        foilBtn.onclick = () => {
            clearInterval(dustSpawner);
            
            // Čím víc chlupů, tím větší sleva (snížení marže)
            const discount = dustCount * 30;
            const finalPrice = Math.max(50, item.price - discount);
            const finalMargin = Math.max(5, (finalPrice - item.cost));

            if (dustCount === 0) {
                alert(`💎 Mistrovské dílo! Fólie nalepena absolutně bez smítka. Plná cena ${finalPrice} Kč.`);
            } else {
                alert(`⚠️ Pod fólií zůstalo ${dustCount} chlupů a smítek prachu! Zákazník dostal slevu ${discount} Kč, cena je ${finalPrice} Kč a marže klesla.`);
                this.state.stress += 8;
            }

            this.state.turnover += finalPrice;
            this.state.margin += finalMargin;
            this.state.customersServed++;
            this.state.round++;
            this.saveLocalStorage();
            this.showScreen('screen-game');
            this.nextRound();
        };
    }

    triggerEvent() {
        const ev = EVENTS_DATA[Math.floor(Math.random() * EVENTS_DATA.length)];
        if (ev.action === 'keyhole') { this.startKeyholeMinigame(); return; }
        if (ev.action === 'lelky') { this.startLelkyMinigame(); return; }
        if (ev.action === 'package') { this.startPackageMinigame(); return; }

        this.state.stress += 10;
        this.state.round++;
        this.saveLocalStorage();
        this.nextRound();
    }

    endShift() {
        this.state.inProgress = false;
        this.stats.totalShifts++;
        if (this.state.turnover > this.stats.maxTurnover) this.stats.maxTurnover = this.state.turnover;
        this.stats.totalRevenue += this.state.turnover;
        this.stats.history.unshift({ date: new Date().toLocaleDateString('cs-CZ'), turnover: this.state.turnover, target: this.state.target });
        this.saveLocalStorage();

        document.getElementById('sum-turnover').innerText = `${this.state.turnover} Kč`;
        document.getElementById('sum-margin').innerText = `${this.state.margin} Kč`;
        document.getElementById('sum-target-pct').innerText = `${Math.round((this.state.turnover / this.state.target) * 100)}%`;
        document.getElementById('sum-customers').innerText = this.state.customersServed;
        document.getElementById('sum-stress').innerText = `${this.state.stress}%`;
        document.getElementById('summary-quote').innerText = `„${SHIFT_QUOTES[Math.floor(Math.random() * SHIFT_QUOTES.length)]}“`;

        document.getElementById('btn-continue').style.display = 'none';
        this.showScreen('screen-summary');
    }

    updateStatsView() {
        document.getElementById('stat-total-shifts').innerText = this.stats.totalShifts;
        document.getElementById('stat-max-turnover').innerText = this.stats.maxTurnover;
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        this.stats.history.forEach(h => {
            const li = document.createElement('li');
            li.innerHTML = `${h.date}: <strong>${h.turnover} Kč</strong> (Cíl: ${h.target} Kč)`;
            list.appendChild(li);
        });
    }
}

window.addEventListener('DOMContentLoaded', () => { window.gameInstance = new Game(); });
