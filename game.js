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

        this.stats = {
            totalShifts: 0,
            maxTurnover: 0,
            totalRevenue: 0,
            history: []
        };

        this.loadLocalStorage();
        this.initListeners();
    }

    loadLocalStorage() {
        const saved = localStorage.getItem('elektro_save_v2');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.state = data.state || this.state;
                this.stats = data.stats || this.stats;
            } catch (e) { console.error(e); }
        }
        if (this.state.inProgress) {
            document.getElementById('btn-continue').style.display = 'block';
        }
    }

    saveLocalStorage() {
        localStorage.setItem('elektro_save_v2', JSON.stringify({
            state: this.state,
            stats: this.stats
        }));
    }

    initListeners() {
        document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-continue').addEventListener('click', () => this.continueGame());
        document.getElementById('btn-stats').addEventListener('click', () => this.showScreen('screen-stats'));
        document.getElementById('btn-settings').addEventListener('click', () => this.showScreen('screen-settings'));
        document.getElementById('btn-pause-menu').addEventListener('click', () => this.toMenu());
        document.getElementById('btn-finish-shift').addEventListener('click', () => this.toMenu());

        document.querySelectorAll('.btn-close').forEach(b => b.addEventListener('click', () => this.toMenu()));

        document.getElementById('btn-toilet').addEventListener('click', () => this.playToiletHide());
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
            if (confirm("Opravdu vymazat hru?")) {
                localStorage.removeItem('elektro_save_v2');
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
        
        this.state.currentCustomer = { archetype: arch.name, avatar: arch.avatar, dialog: dlg };
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

        const prods = [...PRODUCTS_DATA].sort(() => 0.5 - Math.random()).slice(0, 2);
        const srv = SERVICES_DATA[Math.floor(Math.random() * SERVICES_DATA.length)];

        [...prods, srv].forEach(item => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            div.innerHTML = `
                <div class="rec-info">
                    <div class="title">${item.name}</div>
                    <div class="price">${item.price} Kč</div>
                </div>
                <button class="btn primary" style="padding: 6px 12px; font-size: 0.8rem;">Prodat</button>
            `;
            div.addEventListener('click', () => {
                if (item.minigame === 'foil') {
                    this.startFoilMinigame(item);
                } else {
                    this.makeSale(item);
                }
            });
            area.appendChild(div);
        });

        const skip = document.createElement('div');
        skip.className = 'rec-item';
        skip.style.background = '#27272a';
        skip.innerHTML = `<div class="rec-info"><div class="title" style="color: var(--danger);">Odmítnout / Odešel bez nákupu</div></div>`;
        skip.addEventListener('click', () => this.makeSale(null));
        area.appendChild(skip);
    }

    makeSale(item) {
        if (item) {
            const isSrv = item.id.startsWith('srv_');
            this.state.turnover += item.price;
            this.state.margin += (item.price - item.cost);
            if (isSrv) this.state.servicesSold++;
            this.state.stress = Math.max(0, this.state.stress - 3);
        } else {
            this.state.stress += 8;
            this.state.satisfaction = Math.max(0, this.state.satisfaction - 10);
        }
        this.state.customersServed++;
        this.state.round++;
        this.saveLocalStorage();
        this.nextRound();
    }

    // --- MINIHRY ---

    playToiletHide() {
        this.state.stress = Math.max(0, this.state.stress - 20);
        alert("🚽 Schoval ses na záchodě s mobilem v ruce a 5 minut scroluješ sociální sítě. Stres poklesl o 20%, ale fronta prská vzteky!");
        this.renderCustomer();
    }

    startKeyholeMinigame() {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "👁️ Kontrola vedoucího klíčovou dírkou";
        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:10px; font-size:0.9rem;">Klikni co nejrychleji na vedoucího oko a píchni ho párátkem!</p>
            <div class="keyhole-view">
                <div class="boss-eye" id="boss-eye">👁️</div>
            </div>
            <p id="keyhole-score" style="margin-top:10px;">Zásahy: 0 / 5</p>
        `;

        let hits = 0;
        const eye = document.getElementById('boss-eye');
        const scoreText = document.getElementById('keyhole-score');

        const moveEye = () => {
            if (hits >= 5) return;
            const x = (Math.random() * 120) - 60;
            const y = (Math.random() * 120) - 60;
            eye.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        };

        const interval = setInterval(moveEye, 800);

        eye.onclick = () => {
            hits++;
            scoreText.innerText = `Zásahy: ${hits} / 5`;
            if (hits >= 5) {
                clearInterval(interval);
                this.state.stress = Math.max(0, this.state.stress - 30);
                alert("🎯 Úspěch! Píchnul jsi vedoucího párátkem do oka. Má zmatený den, stres klesl o 30%!");
                this.showScreen('screen-game');
                this.renderCustomer();
            }
        };
    }

    startFoilMinigame(item) {
        this.showScreen('screen-minigame');
        document.getElementById('minigame-title').innerText = "📱 Lepení ochranné fólie";
        const content = document.getElementById('minigame-content');
        content.innerHTML = `
            <p style="margin-bottom:10px; font-size:0.85rem;">Klikni na prach a chlupy dřív, než zaplní celý displej!</p>
            <div class="phone-screen" id="phone-screen">
                <div id="dust-container"></div>
            </div>
            <button id="btn-apply-foil" class="btn primary" style="margin-top:10px; padding:8px 16px;">Nalepit fólii</button>
        `;

        const dustContainer = document.getElementById('dust-container');
        dustContainer.innerHTML = '';
        let particles = 0;

        const spawner = setInterval(() => {
            if (particles < 8) {
                particles++;
                const p = document.createElement('div');
                p.className = 'dust-particle';
                p.style.top = `${Math.random() * 280 + 20}px`;
                p.style.left = `${Math.random() * 150 + 20}px`;
                p.onclick = () => {
                    p.remove();
                    particles--;
                };
                dustContainer.appendChild(p);
            }
        }, 500);

        document.getElementById('btn-apply-foil').onclick = () => {
            clearInterval(spawner);
            const remaining = dustContainer.children.length;
            if (remaining === 0) {
                alert("✨ Perfektní! Fólie nalepena bez jediného smítka prachu.");
                this.makeSale(item);
            } else {
                alert(`💥 Juchů, pod fólií zůstalo ${remaining} chlupů! Zákazník zuří, ale zboží bere.`);
                this.state.stress += 10;
                this.makeSale(item);
            }
            this.showScreen('screen-game');
        };
    }

    triggerEvent() {
        const ev = EVENTS_DATA[Math.floor(Math.random() * EVENTS_DATA.length)];
        document.getElementById('event-title').innerText = ev.title;
        document.getElementById('event-desc').innerText = ev.desc;

        const area = document.getElementById('event-options');
        area.innerHTML = '';

        ev.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn secondary';
            btn.innerText = opt.text;
            btn.onclick = () => {
                if (opt.effect.action === 'keyhole') {
                    this.startKeyholeMinigame();
                    return;
                }
                if (opt.effect.stress) this.state.stress = Math.min(100, Math.max(0, this.state.stress + opt.effect.stress));
                if (opt.effect.turnover) this.state.turnover += opt.effect.turnover;
                if (opt.effect.satisfaction) this.state.satisfaction = Math.min(100, Math.max(0, this.state.satisfaction + opt.effect.satisfaction));

                this.state.round++;
                this.saveLocalStorage();
                this.showScreen('screen-game');
                this.nextRound();
            };
            area.appendChild(btn);
        });

        this.showScreen('screen-event');
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
