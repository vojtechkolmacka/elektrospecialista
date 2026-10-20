const PRODUCTS_DATA = [
    { id: 'bat_aa', name: 'AA alkalické baterie 4ks', category: 'baterie', price: 99, cost: 40 },
    { id: 'bat_knoflik', name: 'Knoflíková baterie CR2032 do autoklíče', category: 'baterie', price: 49, cost: 15 },
    { id: 'nab_rychla', name: 'Rychlonabíječka GaN 65W', category: 'nabijecky', price: 899, cost: 350 },
    { id: 'kabel_usbc', name: 'Armor kabel USB-C s pancéřovým opletením', category: 'kabely', price: 349, cost: 80 },
    { id: 'sklo_mobil', name: 'Hydrogelová fólie na míru + nalepení', category: 'prislušenstvi', price: 499, cost: 40, minigame: 'foil' },
    { id: 'rep_bt', name: 'Vodotěsný Party reproduktor s blikátkem', category: 'reproduktory', price: 1499, cost: 650 },
    { id: 'mobil_odolny', name: 'Vojenský "cementofon" s 10000mAh baterií', category: 'mobily', price: 4599, cost: 3000, minigame: 'foil' }
];

const SERVICES_DATA = [
    { id: 'srv_pojisteni', name: 'Pojištění proti rozbití o chodník', price: 799, cost: 50 },
    { id: 'srv_zaruka', name: 'Prodloužená záruka "Když se to rozbije po záruce"', price: 599, cost: 30 },
    { id: 'srv_nastaveni', name: 'Prvotní nastavení telefonu', price: 399, cost: 10 }
];

const CUSTOMER_ARCHETYPES = [
    {
        name: 'Ekonomický detektiv',
        avatar: '🕵️‍♂️',
        dialogs: [
            "Na Alze to mají levnější o korunu padesát a ještě k tomu posílají čokoládu. Co mi dáte vy?",
            "Já jsem si to zkusil v prodejně, ale koupím to v čínském e-shopu. Jak se to zapíná?",
            "Proč tahle žárovka stojí 50 Kč, když v televizi říkali, že inflace klesá?"
        ],
        choices: [
            { text: "Dát mu slevu z vlastní pokladny a sušenku z pultu.", effect: { turnover: +100, margin: -20, stress: +5 } },
            { text: "Oznámit mu, že čokoládu nahrazuje čistá radost z nákupu v Datartu.", effect: { satisfaction: -10, stress: +10 } }
        ]
    },
    {
        name: 'Inženýr z internetu',
        avatar: '🤓',
        dialogs: [
            "Potřebuji redukci z USB-A na scart, abych 4K monitor připojil k dědově gramofonu z 1974.",
            "V recenzích na YouTube říkali, že tenhle ventilátor má o 0.4% horší chlazení. Chci slevu!",
            "Já IT rozumím, dělal jsem v Excelu v roce 1998. Proč mi tady nutíte ovladače?"
        ],
        choices: [
            { text: "Prodat mu nejdražší zbytečný kabel a tvářit se odborně.", effect: { turnover: +599, margin: +400, stress: +10 } },
            { text: "Sestavit mu redukci z izolepy a starého síťového kabelu.", effect: { satisfaction: +15, turnover: +199 } }
        ]
    },
    {
        name: 'Nezastavitelný spěchal',
        avatar: '🏃‍♀️',
        dialogs: [
            "Jdu kolem už tři minuty a nikdo se mi neklaní! Stíhám vlak a chci dárek pro tchyni.",
            "Nemám čas na vysvětlování, ukažte mi to nejlepší, nejlehčí a nejčervenější hned!",
            "Kde máte pokladnu sakra? Já platím obědem!"
        ],
        choices: [
            { text: "Popadnout první blikající reproduktor a hodit ho do tašky.", effect: { turnover: +1499, margin: +800, stress: +15 } },
            { text: "Rychle vnutit prodlouženou záruku, ať se nevrací.", effect: { turnover: +899, services: +1 } }
        ]
    }
];

const EVENTS_DATA = [
    { title: 'Inspekce vedoucího v zázemí', desc: 'Vedoucí jde zkontrolovat, jestli v krabicích neschováváte oběd.', action: 'keyhole' },
    { title: 'Panická vlna plnění tabulek', desc: 'Oblastní ředitel poslal tabulku: kdo hned neprodejní pojištění, končí.', action: 'toilet' },
    { title: 'Hledání e-shopové objednávky', desc: 'Zákazník stojí u pokladny a zuří, že balík není připravený.', action: 'package' }
];

const SHIFT_QUOTES = [
    "Obrat splněn. Nervová soustava úspěšně zreklamována.",
    "Fólie nalepena, i když pod ní zbyl jeden pes a dva chlupy.",
    "Schovávání na záchodě povýšilo na uměleckou disciplínu.",
    "Párátko v oku vedoucího zachránilo další den na prodejně."
];
