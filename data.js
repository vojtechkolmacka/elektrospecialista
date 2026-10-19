
const PRODUCTS_DATA = [
    { id: 'bat_aa', name: 'AA alkalické baterie 4ks', category: 'baterie', price: 99, cost: 40 },
    { id: 'bat_knoflik', name: 'Knoflíková baterie CR2032', category: 'baterie', price: 49, cost: 15 },
    { id: 'nab_rychla', name: 'Rychlonabíječka USB-C 20W', category: 'nabijecky', price: 399, cost: 150 },
    { id: 'kabel_usbc', name: 'Datový kabel USB-C / USB-C 1m', category: 'kabely', price: 199, cost: 60 },
    { id: 'sluch_drát', name: 'Drátová sluchátka s mikrofonem', category: 'sluchatka', price: 299, cost: 100 },
    { id: 'power_10k', name: 'Powerbanka 10 000 mAh', category: 'powerbanky', price: 699, cost: 300 },
    { id: 'sklo_mobil', name: 'Tvrzené ochranné sklo na mobil', category: 'prislušenstvi', price: 349, cost: 50 },
    { id: 'rep_bt', name: 'Přenosný Bluetooth reproduktor', category: 'reproduktory', price: 899, cost: 400 },
    { id: 'mys_bezdrát', name: 'Bezdrátová optická myš', category: 'pc', price: 399, cost: 160 },
    { id: 'konvice', name: 'Nerezová rychlovarná konvice 1.7l', category: 'domacnost', price: 599, cost: 250 },
    { id: 'vysavac', name: 'Sáčkový vysavač 800W', category: 'domacnost', price: 1999, cost: 900 },
    { id: 'tv_smart', name: '32" HD Ready Smart LED TV', category: 'televizory', price: 4999, cost: 3200 },
    { id: 'mobil_zaklad', name: 'Smartphone 4GB/64GB', category: 'mobily', price: 2999, cost: 2100 },
    { id: 'sluch_bt', name: 'True Wireless Bluetooth sluchátka', category: 'sluchatka', price: 799, cost: 300 },
    { id: 'kabel_hdmi', name: 'HDMI 2.1 kabel 2m', category: 'kabely', price: 299, cost: 90 }
];

const SERVICES_DATA = [
    { id: 'srv_pojisteni', name: 'Pojištění proti rozbití a krádeži', price: 499, cost: 50 },
    { id: 'srv_zaruka', name: 'Prodloužená záruka o 1 rok', price: 399, cost: 30 },
    { id: 'srv_nastaveni', name: 'Odborné prvotní nastavení zařízení', price: 299, cost: 10 },
    { id: 'srv_splatky', name: 'Splátkové financování bez navýšení', price: 199, cost: 20 }
];

const CUSTOMER_ARCHETYPES = [
    {
        name: 'Lovec nejnižší ceny',
        dialogs: [
            "Na internetu to mají o tři koruny levnější. Co mi k tomu dáte zdarma?",
            "Hlavně to chci co nejlevnější. Žádné drahé značky nepotřebuji.",
            "A není na to někde slevový kupón?"
        ]
    },
    {
        name: 'Technický génius',
        dialogs: [
            "Potřebuji kabel USB-C do starého zařízení, které USB-C nemá. Máte redukci?",
            "Jakou frekvenci sběrnice podporuje procesor v téhle konvici?",
            "Chci si sám sestavit chytrou domácnost, ale nevím kde začít."
        ]
    },
    {
        name: 'Zákazník bez času',
        dialogs: [
            "Já jenom rychle. A potřeboval bych poradit s celou domácí elektronikou.",
            "Nemůžu čekat, spěchám na tramvaj! Ukažte mi to nejlepší hned.",
            "Dejte mi prostě to, co kupují všichni ostatní, ať to mám."
        ]
    },
    {
        name: 'Reklamační filozof',
        dialogs: [
            "Včera to fungovalo. Dneska ne. Takže je to jasná výrobní vada!",
            "Chci vrátit peníze, ten přístroj odmítá spolupracovat s mojí náladou.",
            "Já jsem s tím nic nedělal, ono se to rozbilo samo v tašce!"
        ]
    },
    {
        name: 'Mistr slev',
        dialogs: [
            "Když si koupím dvě baterky, dostanu třetí zdarma? A když ne, tak proč?",
            "Slevu mi dát musíte, jsem stálý zákazník!",
            "A co když vezmu rozbalený kus? Kolik mi slevíte?"
        ]
    }
];

const EVENTS_DATA = [
    {
        title: 'Výpadek platebního terminálu',
        desc: 'Terminál na kartě hlásí chybu komunikace. Zákazníci začínají nervózně šahat po peněženkách.',
        options: [
            { text: 'Vyzvat zákazníky k platbě hotovostí nebo přes QR kód', effect: { stress: +10, turnover: 0 } },
            { text: 'Restartovat terminál a doufat, že naskočí', effect: { stress: +5, turnover: -200 } }
        ]
    },
    {
        title: 'Naléhavý požadavek vedoucího',
        desc: 'Vedoucí pobočky přišel s tím, že plníte marži pomalu a chce hlášení hned teď.',
        options: [
            { text: 'Odmítnout s tím, že obsluhujete frontu', effect: { stress: +15, satisfaction: -5 } },
            { text: 'Slíbit okamžité zlepšení prodeje služeb', effect: { stress: +5, targetBonus: 200 } }
        ]
    },
    {
        title: 'Zmatený zákazník ve frontě',
        desc: 'Pán si spletl prodejnu s poštou a chce vyregistrovat televizní poplatky.',
        options: [
            { text: 'S úsměvem ho nasměrovat na správné místo', effect: { stress: -5, satisfaction: +5 } },
            { text: 'Rychle mu prodat alespoň prodlužovačku', effect: { stress: +10, turnover: +299 } }
        ]
    }
];

const SHIFT_QUOTES = [
    "Obrat splněn. Nervová soustava reklamována.",
    "Služby prodány. Zákazníci si toho všimli.",
    "Výsledek směny: přežil jsi. To se také počítá.",
    "Vedoucí má radost. Takže se určitě něco pokazilo.",
    "Výkon hodný povýšení. Nebo alespoň klidné přestávky."
];
