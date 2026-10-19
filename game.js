
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

        this.settings = {
            sound: true,
            animations: true
        };

        this.loadLocalStorage();
        this.initListeners();
    }

    loadLocalStorage() {
        const savedGame = localStorage.getItem('elektro_save');
        if (savedGame) {
            try {
                const data = JSON.parse(savedGame);
                this.state = data.state || this.state;
                this.stats = data.stats || this.stats;
                this.settings = data.settings || this.settings;
            } catch (e) {
                console.error("Chyba načítání uložené hry", e);
            }
        }
        
        if (this.state.inProgress) {
            document.getElementById('btn-continue').style.display = 'block';
        }
    }

    saveLocalStorage() {
        localStorage.setItem('elektro_save', JSON.stringify({
            state: this.state,
            stats: this.stats,
            settings: this.settings
        }));
    }

    initListeners() {
        document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('btn-continue').addEventListener('click', () => this.continueGame());
        document.getElementById('btn-stats').addEventListener('click', () => this.showScreen('screen-stats'));
        document.getElementById('btn-settings').addEventListener('click', () => this.showScreen('screen-settings'));
        document.getElementById('btn-pause-menu').addEventListener('click', () => this.toMenu());
        document.getElementById('btn-finish-shift').addEventListener('click', () => this.toMenu());

        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', () => this.toMenu());
        });

        document.getElementById('btn-export').addEventListener('click', () => this.exportData());
        document.getElementById('file-import').addEventListener('change', (e) => this.importData(e));
        document.getElementById('btn-reset').addEventListener('click', () => this.resetData());
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        if (screenId === 'screen-stats') {
            this.updateStatsView();
        }
    }

    toMenu() {
        this.saveLocalStorage();
        this.showScreen('screen-menu');
        if (this.state.inProgress) {
            document.getElementById('btn-continue').style.display = 'block';
        }
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

        if (Math.random() < 0.3 && this.state.round > 1) {
            this.triggerEvent();
            return;
        }

        const archetype = CUSTOMER_ARCHETYPES[Math.floor(Math.random() * CUSTOMER_ARCHETYPES.length)];
        const dialog = archetype.dialogs[Math.floor(Math.random() * archetype.dialogs.length)];
        
        this.state.currentCustomer = {
            archetype: archetype.name,
            dialog: dialog
        };

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
        document.getElementById('customer-archetype-name').innerText = cust.archetype;
        document.getElementById('customer-dialog').innerText = `„${cust.dialog}“`;

        const area = document.getElementById('product-recommendation-area');
        area.innerHTML = '';

        const randomProducts = [...PRODUCTS_DATA].sort(() => 0.5 - Math.random()).slice(0, 2);
        const randomService = SERVICES_DATA[Math.floor(Math.random() * SERVICES_DATA.length)];
        const options = [...randomProducts, randomService];

        options.forEach(item => {
            const div = document.createElement('div');
            div.className = 'rec-item';
            div.innerHTML = `
                <div class="rec-info">
                    <div class="title">${item.name}</div>
                    <div class="price">${item.price} Kč</div>
                </div>
                <button class="btn primary" style="padding: 6px 12px; font-size: 0.8rem;">Prodat</button>
            `;
            div.addEventListener('click', () => this.makeSale(item));
            area.appendChild(div);
        });

        const skipDiv = document.createElement('div');
        skipDiv.className = 'rec-item';
        skipDiv.style.background = '#fff0f0';
        skipDiv.innerHTML = `
            <div class="rec-info">
                <div class="title" style="color: var(--danger);">Odmítnout / Odešel bez nákupu</div>
            </div>
        `;
        skipDiv.addEventListener('click', () => this.makeSale(null));
        area.appendChild(skipDiv);
    }

    makeSale(item) {
        if (item) {
            const isService = item.id.startsWith('srv_');
            const itemMargin = item.price - item.cost;
            
            this.state.turnover += item.price;
            this.state.margin += itemMargin;
            if (isService) {
                this.state.servicesSold++;
            }
            this.state.stress = Math.max(0, this.state.stress - 2);
        } else {
            this.state.stress += 5;
            this.state.satisfaction = Math.max(0, this.state.satisfaction - 10);
        }

        this.state.customersServed++;
        this.state.round++;
        this.saveLocalStorage();
        this.nextRound();
    }

    triggerEvent() {
        const event = EVENTS_DATA[Math.floor(Math.random() * EVENTS_DATA.length)];
        document.getElementById('event-title').innerText = event.title;
        document.getElementById('event-desc').innerText = event.desc;

        const optArea = document.getElementById('event-options');
        optArea.innerHTML = '';

        event.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn secondary';
            btn.innerText = opt.text;
            btn.addEventListener('click', () => {
                this.state.stress = Math.min(100, Math.max(0, this.state.stress + (opt.effect.stress || 0)));
                if (opt.effect.turnover) this.state.turnover += opt.effect.turnover;
                if (opt.effect.satisfaction) this.state.satisfaction = Math.min(100, Math.max(0, this.state.satisfaction + opt.effect.satisfaction));
                
                this.state.round++;
                this.saveLocalStorage();
                this.showScreen('screen-game');
                this.nextRound();
            });
            optArea.appendChild(btn);
        });

        this.showScreen('screen-event');
    }

    endShift() {
        this.state.inProgress = false;
        
        this.stats.totalShifts++;
        if (this.state.turnover > this.stats.maxTurnover) {
            this.stats.maxTurnover = this.state.turnover;
        }
        this.stats.totalRevenue += this.state.turnover;
        
        this.stats.history.unshift({
            date: new Date().toLocaleDateString('cs-CZ'),
            turnover: this.state.turnover,
            target: this.state.target
        });

        this.saveLocalStorage();

        document.getElementById('sum-turnover').innerText = `${this.state.turnover} Kč`;
        document.getElementById('sum-margin').innerText = `${this.state.margin} Kč`;
        const targetPct = Math.round((this.state.turnover / this.state.target) * 100);
        document.getElementById('sum-target-pct').innerText = `${targetPct}%`;
        document.getElementById('sum-customers').innerText = this.state.customersServed;
        document.getElementById('sum-services').innerText = this.state.servicesSold;
        document.getElementById('sum-satisfaction').innerText = `${this.state.satisfaction}%`;
        document.getElementById('sum-stress').innerText = `${this.state.stress}%`;

        const randomQuote = SHIFT_QUOTES[Math.floor(Math.random() * SHIFT_QUOTES.length)];
        document.getElementById('summary-quote').innerText = `„${randomQuote}“`;

        document.getElementById('btn-continue').style.display = 'none';
        this.showScreen('screen-summary');
    }

    updateStatsView() {
        document.getElementById('stat-total-shifts').innerText = this.stats.totalShifts;
        document.getElementById('stat-max-turnover').innerText = this.stats.maxTurnover;
        document.getElementById('stat-total-revenue').innerText = this.stats.totalRevenue;

        const histList = document.getElementById('history-list');
        histList.innerHTML = '';
        this.stats.history.forEach(h => {
            const li = document.createElement('li');
            li.innerHTML = `${h.date}: <strong>${h.turnover} Kč</strong> (Cíl: ${h.target} Kč)`;
            histList.appendChild(li);
        });
    }

    exportData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            state: this.state,
            stats: this.stats,
            settings: this.settings
        }));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "elektrospecialista_save.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed.state && parsed.stats) {
                    this.state = parsed.state;
                    this.stats = parsed.stats;
                    this.settings = parsed.settings || this.settings;
                    this.saveLocalStorage();
                    alert("Data byla úspěšně importována!");
                    this.toMenu();
                } else {
                    alert("Neplatná struktura souboru.");
                }
            } catch (err) {
                alert("Chyba při parsování JSON souboru.");
            }
        };
        reader.readAsText(file);
    }

    resetData() {
        if (confirm("Opravdu chcete vymazat veškerý postup a statistiky?")) {
            localStorage.removeItem('elektro_save');
            location.reload();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
