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
        const saved = localStorage.getItem('elektro_save_v4');
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
        localStorage.setItem('elektro_save_v4', JSON.stringify({ state: this.state, stats: this.stats }));
    }

    initListeners() {
        document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-continue').addEventListener('click', () => this.continueGame());
        document.getElementById('btn-stats').addEventListener('click', () => this.showScreen('screen-stats'));
        document.getElementById('btn-settings').addEventListener('click', () => this.showScreen('screen-settings'));
        document.getElementById('btn-pause-menu').addEventListener('click', () => this.toMenu());
        document.getElementById('btn-finish-shift').addEventListener('click', () => this.toMenu());

        document.querySelectorAll('.btn-close').forEach(b => b.addEventListener('click', () => this.toMenu()));

        document.getElementById('btn-toilet').addEventListener('click', () => this.startToiletMinigame());
        document.getElementById('btn-keyhole').addEventListener('click', () => this.startKeyholeMinigame());
        document.getElementById('btn-package').addEventListener('click', () => this.startPackageMinigame());
        document.getElementById('btn-close-minigame').addEventListener('click', () => this.showScreen('screen-game'));

        document.getElementById('btn-export').addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
            const dl = document.createElement('a'); dl.setAttribute("href", dataStr); dl.setAttribute("download", "elektro_save.json"); dl.click();
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
            if (confirm("Opravdu vymazat postup?")) { localStorage.removeItem('elektro_save_v4'); location.reload(); }
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
        this.state.currentCustomer = { archetype: arch.name, avatar: arch.avatar, dialog: dlg, choices: arch.choices };
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
        document.getElementById('customer-archetype-name').innerText = cust.archetype;
        document.getElementById('customer-dialog').innerText = `„${cust.dialog}“`;

        const area = document.getElementById('product-recommendation-area');
        area.innerHTML = '';

        cust.choices.forEach(ch => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            div.innerHTML = `<div class="rec-info"><div class="title">💬 ${ch.text}</div></div>`;
            div.addEventListener('click', () => this.applyChoiceEffect(ch.effect));
            area.appendChild(div);
        });

        const prod = PRODUCTS_DATA[Math.floor(Math.random() * PRODUCTS_DATA.length)];
        const pDiv = document.createElement('div');
        pDiv.className = 'rec-item';
        pDiv.style.border = '2px solid var(--primary)';
        pDiv.innerHTML = `
            <div class="rec-info"><div class="title">📦 Prodat zboží: ${prod.name}</div><div class="price">${prod.price} Kč</div></div>
            <button class="btn primary" style="padding:6px 12px; font-size:0.8rem;">Vybrat</button>
        `;
        pDiv.addEventListener('click', () => {
            if (prod.minigame === 'foil') this.startFoilMinigame(prod);
            else this.makeSale(prod);
        });
        area.appendChild(pDiv);
    }

    applyChoiceEffect(effect) {
        if (effect.turnover) this.state.turnover += effect.turnover;
        if (effect.margin) this.state.margin += effect.margin;
        if (effect.stress) this.state.stress = Math.min(100, Math.max(0, this.state.stress + effect.stress));
        if (effect.satisfaction) this.state.satisfaction = Math.min(100, Math.max(0, this.state.satisfaction + effect.satisfaction));
        this.state.customersServed++;
        this.state.round++;
        this.saveLocalStorage();
        this.nextRound();
    }

    makeSale(item) {
        this.state.turnover += item.price;
        this.state.margin += (item.price - item.cost);
        this.state.stress = Math.max(0, this.state.stress - 3);
        this.state.customersServed++;
        this.state.round++;
        this.saveLocalStorage();
        this.nextRound();
    }

    // --- MINIHRY ---

    // 1. Klíčová dírka s časovačem a uhýbajícím okem
    startKeyholeMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "👁️ Párátko v oku vedoucího";
        document.getElementById('btn-close-minigame').style.display = 'none';
        
        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p id="kh-timer" style="margin-bottom:5px; color:var(--danger); font-weight:bold;">Čas: 7s</p>
            <div class="keyhole-view">
                <div class="boss-eye" id="boss-eye">👁️</div>
            </div>
            <p id="kh-status" style="margin-top:5px; font-weight:bold;">Zásahy: 0 / 3</p>
        `;

        let hits = 0;
        let timeLeft = 7;
        const eye = document.getElementById('boss-eye');
        const status = document.getElementById('kh-status');
        const timerText = document.getElementById('kh-timer');

        const timer = setInterval(() => {
            timeLeft--;
            timerText.innerText = `Čas: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                clearInterval(moveLoop);
                this.state.stress += 15;
                alert("⏰ Čas vypršel! Vedoucí tě přistihl, jak držíš v ruce párátko. Stres +15%!");
                this.showScreen('screen-game');
                this.renderCustomer();
            }
        }, 1000);

        const moveLoop = setInterval(() => {
            const scale = Math.random() * 1.2 + 0.4;
            eye.style.transform = `scale(${scale})`;
            eye.style.left = `${Math.random() * 140 + 20}px`;
            eye.style.top = `${Math.random() * 140 + 20}px`;
        }, 450);

        eye.onclick = () => {
            hits++;
            status.innerText = `Zásahy: ${hits} / 3`;
            if (hits >= 3) {
                clearInterval(timer);
                clearInterval(moveLoop);
                this.state.stress = Math.max(0, this.state.stress - 30);
                alert("🎯 Úspěch! Píchnul jsi vedoucího přesně do oka. Stres -30%!");
                this.showScreen('screen-game');
                this.renderCustomer();
            }
        };
    }

    // 2. Schovka na záchodě / chytání lelků
    startToiletMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "🚽 Schovávačka s mobilem na WC";
        document.getElementById('btn-close-minigame').style.display = 'none';

        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:5px; font-size:0.8rem;">Chytej lajky a kafe dřív, než vyrazí dveře! (8x)</p>
            <div class="phone-screen" id="toilet-screen" style="height:260px; position:relative;">
                <div id="toilet-item" style="position:absolute; font-size:2.5rem; cursor:pointer; top:80px; left:80px;">📱</div>
            </div>
            <p id="toilet-score" style="margin-top:5px;">Skóre: 0 / 8</p>
        `;

        let score = 0;
        const item = document.getElementById('toilet-item');
        const counter = document.getElementById('toilet-score');
        const icons = ['📱', '☕', '🍩', '💬', '🔥'];

        item.onclick = () => {
            score++;
            counter.innerText = `Skóre: ${score} / 8`;
            if (score >= 8) {
                this.state.stress = Math.max(0, this.state.stress - 25);
                alert("✨ Úspěšně proscrollováno v kabince! Stres poklesl o 25%.");
                this.showScreen('screen-game');
                this.renderCustomer();
            } else {
                item.innerText = icons[Math.floor(Math.random() * icons.length)];
                item.style.top = `${Math.random() * 180 + 20}px`;
                item.style.left = `${Math.random() * 140 + 20}px`;
            }
        };
    }

    // 3. Hledání ztraceného balíku na čas v chaotickém skladu
    startPackageMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "📦 Hledání ztraceného balíku";
        document.getElementById('btn-close-minigame').style.display = 'none';

        const content = document.getElementById('minigame-content');
        const winningIndex = Math.floor(Math.random() * 6);

        content.innerHTML = `
            <p style="margin-bottom:5px; font-size:0.8rem;">Najdi správnou krabici v rozházeném skladu!</p>
            <div class="warehouse-grid" id=" warehouse-grid">
                ${[0,1,2,3,4,5].map(i => `<div class="warehouse-box" data-idx="${i}">📦</div>`).join('')}
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
                alert("⏰ Čas vypršel! Zákazník mezitím odešel nadávat na sociální sítě. Stres +15%!");
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
                    alert("🎉 Našel jsi ho! VIP balík předán zákazníkovi. Obrat +799 Kč!");
                } else {
                    this.state.stress += 10;
                    this.state.satisfaction = Math.max(0, this.state.satisfaction - 10);
                    alert("💥 Špatná krabice! Našel jsi jen staré kalendáře a svačinu brigádníka. Stres +10%!");
                }
                this.showScreen('screen-game');
                this.renderCustomer();
            };
        });
    }

    // 4. Lepení fólie (tlacitko uskakuje, prach padá v reálném čase)
    startFoilMinigame(item) {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "📱 Lepení fólie bez prachu";
        document.getElementById('btn-close-minigame').style.display = 'none';

        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:5px; font-size:0.80rem;">Odstraň smítka prachu a klikni na tlačítko (pokaždé jinde)!</p>
            <div class="phone-screen" id="foil-area" style="height:220px; position:relative; background:#000;">
                <div id="dust-box"></div>
            </div>
            <div id="btn-container" style="margin-top:10px; position:relative; height:45px;">
                <button id="btn-confirm-foil" class="btn primary" style="position:absolute; left:50%; transform:translateX(-50%); padding:8px 16px;">Nalepit fólii</button>
            </div>
        `;

        const dustBox = document.getElementById('dust-box');
        let particlesCount = 5;

        for (let i = 0; i < particlesCount; i++) {
            const p = document.createElement('div');
            p.className = 'dust-particle';
            p.style.top = `${Math.random() * 160 + 20}px`;
            p.style.left = `${Math.random() * 160 + 20}px`;
            p.onclick = () => { p.remove(); particlesCount--; };
            dustBox.appendChild(p);
        }

        // Padání nového prachu v reálném čase
        const dustSpawner = setInterval(() => {
            if (particlesCount < 7) {
                particlesCount++;
                const p = document.createElement('div');
                p.className = 'dust-particle';
                p.style.top = `${Math.random() * 160 + 20}px`;
                p.style.left = `${Math.random() * 160 + 20}px`;
                p.onclick = () => { p.remove(); particlesCount--; };
                dustBox.appendChild(p);
            }
        }, 1200);

        const foilBtn = document.getElementById('btn-confirm-foil');
        
        // Tlačítko uskočí na náhodnou pozici při každém najetí / pokusu
        const randomizeBtnPos = () => {
            const randomX = (Math.random() * 160) - 80;
            foilBtn.style.transform = `translateX(calc(-50% + ${randomX}px))`;
        };

        foilBtn.onmouseover = randomizeBtnPos;
        foilBtn.ontouchstart = randomizeBtnPos;

        foilBtn.onclick = () => {
            clearInterval(dustSpawner);
            if (particlesCount === 0) {
                alert("💎 Dokonalost! Fólie nalepena absolutně bez jediného smítka.");
                this.makeSale(item);
            } else {
                alert(`⚠️ Pod fólií zůstalo ${particlesCount} smítek prachu! Zákazník zuří, ale platí.`);
                this.state.stress += 12;
                this.makeSale(item);
            }
            this.showScreen('screen-game');
        };
    }

    triggerEvent() {
        const ev = EVENTS_DATA[Math.floor(Math.random() * EVENTS_DATA.length)];
        if (ev.action === 'keyhole') { this.startKeyholeMinigame(); return; }
        if (ev.action === 'toilet') { this.startToiletMinigame(); return; }
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
