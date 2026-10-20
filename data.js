const PRODUCTS_DATA = [
    { id: 'bat_aa', name: 'AA alkalické baterie 4ks', category: 'baterie', price: 99, cost: 40 },
    { id: 'bat_knoflik', name: 'Knoflíková baterie CR2032', category: 'baterie', price: 49, cost: 15 },
    { id: 'nab_rychla', name: 'Rychlonabíječka USB-C 20W', category: 'nabijecky', price: 399, cost: 150 },
    { id: 'kabel_usbc', name: 'Datový kabel USB-C / USB-C 1m', category: 'kabely', price: 199, cost: 60 },
    { id: 'sluch_drát', name: 'Drátová sluchátka s mikrofonem', category: 'sluchatka', price: 299, cost: 100 },
    { id: 'power_10k', name: 'Powerbanka 10 000 mAh', category: 'powerbanky', price: 699, cost: 300 },
    { id: 'sklo_mobil', name: 'Tvrzené ochranné sklo na mobil', category: 'prislušenstvi', price: 349, cost: 50, minigame: 'foil' },
    { id: 'rep_bt', name: 'Přenosný Bluetooth reproduktor', category: 'reproduktory', price: 899, cost: 400 },
    { id: 'mys_bezdrát', name: 'Bezdrátová optická myš', category: 'pc', price: 399, cost: 160 },
    { id: 'konvice', name: 'Nerezová rychlovarná konvice 1.7l', category: 'domacnost', price: 599, cost: 250 },
    { id: 'vysavac', name: 'Sáčkový vysavač 800W', category: 'domacnost', price: 1999, cost: 900 },
    { id: 'tv_smart', name: '32" HD Ready Smart LED TV', category: 'televizory', price: 4999, cost: 3200 },
    { id: 'mobil_zaklad', name: 'Smartphone 4GB/64GB', category: 'mobily', price: 2999, cost: 2100, minigame: 'foil' },
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
        avatar: '🤑',
        dialogs: [
            "Na internetu to mají o tři koruny levnější. Co mi k tomu dáte zdarma?",
            "Hlavně to chci co nejlevnější. Žádné drahé značky nepotřebuji.",
            "A není na to někde slevový kupón?"
        ]
    },
    {
        name: 'Technický génius',
        avatar: '🤓',
        dialogs: [
            "Potřebuji kabel USB-C do starého zařízení, které USB-C nemá. Máte redukci?",
            "Jakou frekvenci sběrnice podporuje procesor v téhle konvici?",
            "Chci si sám sestavit chytrou domácnost, ale nevím kde začít."
        ]
    },
    {
        name: 'Zákazník bez času',
        avatar: '🏃‍♂️',
        dialogs: [
            "Já jenom rychle. A potřeboval bych poradit s celou domácí elektronikou.",
            "Nemůžu čekat, spěchám na tramvaj! Ukažte mi to nejlepší hned.",
            "Dejte mi prostě to, co kupují všichni ostatní, ať to mám."
        ]
    },
    {
        name: 'Reklamační filozof',
        avatar: '🗣️',
        dialogs: [
            "Včera to fungovalo. Dneska ne. Takže je to jasná výrobní vada!",
            "Chci vrátit peníze, ten přístroj odmítá spolupracovat s mojí náladou.",
            "Já jsem s tím nic nedělal, ono se to rozbilo samo v tašce!"
        ]
    },
    {
        name: 'Mistr slev',
        avatar: '🧐',
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
            { text: 'Vyzvat zákazníky k platbě hotovostí nebo QR kódem', effect: { stress: +10 } },
            { text: 'Zdrhnout na chvíli do skladu a dělat že nic', effect: { stress: -10, turnover: -150 } }
        ]
    },
    {
        title: 'Naléhavý požadavek vedoucího',
        desc: 'Vedoucí buší na dveře zázemí a shání vás kvůli plnění marže!',
        options: [
            { text: 'Rychle spustit minihru s klíčovou dírkou a párátkem!', effect: { action: 'keyhole' } },
            { text: 'Přijmout stres a slíbit nemožné', effect: { stress: +20 } }
        ]
    },
    {
        title: 'Hledání ztraceného balíku',
        desc: 'V systému svítí doručená zásilka pro VIP zákazníka, ale v regálech po ní ani stopy.',
        options: [
            { text: 'Hledat pod hromadou krabic v rohu', effect: { stress: +5, turnover: +499 } },
            { text: 'Tvrdit zákazníkovi, že ho unesli marťani', effect: { stress: -5, satisfaction: -15 } }
        ]
    }
];

const SHIFT_QUOTES = [
    "Obrat splněn. Nervová soustava úspěšně zreklamována.",
    "Fólie nalepena bez jediného chlupu. Zázrak!",
    "Schovávání na záchodě povýšilo na uměleckou disciplínu.",
    "Vedoucí nic nezjistil. Oko zůstalo na svém místě (zatím).",
    "Výsledek směny: Přežil jsi s mobilem v ruce."
];
