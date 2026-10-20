class Game {
    constructor() {
        this.state = {
            turnover: 0,
            target: 10000,
            margin: 0,
            stress: 0,
            satisfaction: 100,
            round: 1,
            maxRounds: 10,
            servicesSold: 0,
            customersServed: 0,
            currentCustomer: null,
            inProgress: false
        };

        this.stats = { totalShifts: 0, maxTurnover: 0, totalRevenue: 0, history: [] };
        this.loadLocalStorage();
        this.initListeners();
    }

    loadLocalStorage() {
        const saved = localStorage.getItem('elektro_save_v3');
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
        localStorage.setItem('elektro_save_v3', JSON.stringify({ state: this.state, stats: this.stats }));
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
        document.getElementById('btn-close-minigame').addEventListener('click', () => this.showScreen('screen-game'));

        document.getElementById('btn-export').addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state));
            const dl = document.createElement('a');
            dl.setAttribute("href", dataStr);
            dl.setAttribute("download", "elektro_save.json");
            dl.click();
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
            if (confirm("Opravdu vymazat postup?")) {
                localStorage.removeItem('elektro_save_v3');
                location.reload();
            }
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
            turnover: 0,
            target: 10000 + Math.floor(Math.random() * 5000),
            margin: 0,
            stress: 0,
            satisfaction: 100,
            round: 1,
            maxRounds: 10,
            servicesSold: 0,
            customersServed: 0,
            currentCustomer: null,
            inProgress: true
        };
        this.saveLocalStorage();
        this.showScreen('screen-game');
        this.nextRound();
    }

    continueGame() {
        this.showScreen('screen-game');
        this.renderCustomer();
    }

    nextRound() {
        if (this.state.round > this.state.maxRounds) {
            this.endShift();
            return;
        }

        if (Math.random() < 0.35 && this.state.round > 1) {
            this.triggerEvent();
            return;
        }

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

        // Zobrazení vtipných voleb reakcí na zákazníka
        cust.choices.forEach(ch => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            div.innerHTML = `<div class="rec-info"><div class="title">💬 ${ch.text}</div></div>`;
            div.addEventListener('click', () => {
                this.applyChoiceEffect(ch.effect);
            });
            area.appendChild(div);
        });

        // Přidání možnosti prodat produkt nebo minihru s fólií
        const prod = PRODUCTS_DATA[Math.floor(Math.random() * PRODUCTS_DATA.length)];
        const pDiv = document.createElement('div');
        pDiv.className = 'rec-item';
        pDiv.style.border = '2px solid var(--primary)';
        pDiv.innerHTML = `
            <div class="rec-info">
                <div class="title">📦 Prodat zboží: ${prod.name}</div>
                <div class="price">${prod.price} Kč</div>
            </div>
            <button class="btn primary" style="padding:6px 12px; font-size:0.8rem;">Vybrat</button>
        `;
        pDiv.addEventListener('click', () => {
            if (prod.minigame === 'foil') {
                this.startFoilMinigame(prod);
            } else {
                this.makeSale(prod);
            }
        });
        area.appendChild(pDiv);
    }

    applyChoiceEffect(effect) {
        if (effect.turnover) this.state.turnover += effect.turnover;
        if (effect.margin) this.state.margin += effect.margin;
        if (effect.stress) this.state.stress = Math.min(100, Math.max(0, this.state.stress + effect.stress));
        if (effect.satisfaction) this.state.satisfaction = Math.min(100, Math.max(0, this.state.satisfaction + effect.satisfaction));
        if (effect.services) this.state.servicesSold += effect.services;

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

    // --- INTERAKTIVNÍ MINIHRY ---

    startKeyholeMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "👁️ Párátko v oku vedoucího";
        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:8px; font-size:0.85rem;">Vedoucí šmíruje! Klikni na oko přesně ve chvíli, kdy se přiblíží!</p>
            <div class="keyhole-view" id="keyhole-box">
                <div class="boss-eye" id="boss-eye">👁️</div>
            </div>
            <p id="keyhole-status" style="margin-top:10px; font-weight:bold;">Trefy: 0 / 3</p>
        `;

        let hits = 0;
        const eye = document.getElementById('boss-eye');
        const status = document.getElementById('keyhole-status');

        const moveLoop = setInterval(() => {
            const scale = Math.random() * 1.5 + 0.5;
            eye.style.transform = `translate(-50%, -50%) scale(${scale})`;
            const x = (Math.random() * 100) - 50;
            const y = (Math.random() * 100) - 50;
            eye.style.left = `calc(50% + ${x}px)`;
            eye.style.top = `calc(50% + ${y}px)`;
        }, 600);

        eye.onclick = () => {
            hits++;
            status.innerText = `Trefy: ${hits} / 3`;
            if (hits >= 3) {
                clearInterval(moveLoop);
                this.state.stress = Math.max(0, this.state.stress - 30);
                alert("🎯 Zásah! Vedoucí má oko v obvazu, dnes už tě otravovat nebude. Stres -30%!");
                this.showScreen('screen-game');
                this.renderCustomer();
            }
        };
    }

    startToiletMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "🚽 Schovávačka na WC s mobilem";
        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:8px; font-size:0.85rem;">Sbírej lajky a kafe na mobilu, než vedoucí vyrazí dveře! (Klikni 8x)</p>
            <div class="phone-screen" id="toilet-screen" style="height:280px; position:relative;">
                <div id="item-target" style="position:absolute; font-size:2.5rem; cursor:pointer; top:50px; left:50px;">📱</div>
            </div>
            <p id="toilet-counter" style="margin-top:10px;">Skóre: 0 / 8</p>
        `;

        let score = 0;
        const target = document.getElementById('item-target');
        const counter = document.getElementById('toilet-counter');
        const icons = ['📱', '☕', '🍩', '💬'];

        target.onclick = () => {
            score++;
            counter.innerText = `Skóre: ${score} / 8`;
            if (score >= 8) {
                this.state.stress = Math.max(0, this.state.stress - 25);
                alert("✨ Úspěšně proscrollováno! Stres poklesl o 25%.");
                this.showScreen('screen-game');
                this.renderCustomer();
            } else {
                target.innerText = icons[Math.floor(Math.random() * icons.length)];
                target.style.top = `${Math.random() * 200 + 20}px`;
                target.style.left = `${Math.random() * 140 + 20}px`;
            }
        };
    }

    startFoilMinigame(item) {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "📱 Lepení fólie bez prachu";
        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:8px; font-size:0.85rem;">Prstem nebo klikem setři všechna smítka prachu z displeje!</p>
            <div class="phone-screen" id="foil-area" style="height:280px; position:relative; background:#000;">
                <div id="dust-box"></div>
            </div>
            <button id="btn-confirm-foil" class="btn primary" style="margin-top:10px; padding:8px 16px;">Přitlačit fólii</button>
        `;

        const dustBox = document.getElementById('dust-box');
        dustBox.innerHTML = '';
        let particlesCount = 6;

        for (let i = 0; i < particlesCount; i++) {
            const p = document.createElement('div');
            p.className = 'dust-particle';
            p.style.top = `${Math.random() * 220 + 20}px`;
            p.style.left = `${Math.random() * 150 + 20}px`;
            p.onclick = () => {
                p.remove();
                particlesCount--;
            };
            dustBox.appendChild(p);
        }

        document.getElementById('btn-confirm-foil').onclick = () => {
            if (particlesCount === 0) {
                alert("💎 Mistrovské dílo! Fólie nalepena absolutně bez jediného chlupu.");
                this.makeSale(item);
            } else {
                alert(`⚠️ Pod fólií zbylo ${particlesCount} smítek! Zákazník nadává, ale platí.`);
                this.state.stress += 12;
                this.makeSale(item);
            }
            this.showScreen('screen-game');
        };
    }

    triggerEvent() {
        const ev = EVENTS_DATA[Math.floor(Math.random() * EVENTS_DATA.length)];
        if (ev.action === 'keyhole') {
            this.startKeyholeMinigame();
            return;
        } else if (ev.action === 'toilet') {
            this.startToiletMinigame();
            return;
        }

        // Klasický event fallback
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
