const PRODUCTS_DATA = [
    { id: 'bat_aa', name: 'AA alkalické baterie (výprodej)', category: 'baterie', price: 99, cost: 40, batteryCount: 4 },
    { id: 'bat_aaa', name: 'AAA alkalické baterie do ovladače', category: 'baterie', price: 79, cost: 30, batteryCount: 6 },
    { id: 'bat_knoflik', name: 'Knoflíková baterie CR2032 do klíče', category: 'baterie', price: 49, cost: 15, batteryCount: 1 },
    { id: 'nab_rychla', name: 'Rychlonabíječka GaN 65W', category: 'nabijecky', price: 899, cost: 350 },
    { id: 'kabel_usbc', name: 'Armor kabel USB-C pancéřový', category: 'kabely', price: 349, cost: 80 },
    { id: 'sklo_mobil', name: 'Hydrogelová fólie na míru + nalepení', category: 'prislušenstvi', price: 499, cost: 40, minigame: 'foil' },
    { id: 'rep_bt', name: 'Vodotěsný Party reproduktor s blikátkem', category: 'reproduktory', price: 1499, cost: 650 },
    { id: 'mobil_odolny', name: 'Vojenský "cementofon" s 10000mAh', category: 'mobily', price: 4599, cost: 3000, minigame: 'foil' }
];

const SERVICES_DATA = [
    { id: 'srv_pojisteni', name: 'Pojištění proti rozbití o chodník', price: 799, cost: 50 },
    { id: 'srv_zaruka', name: 'Prodloužená záruka "Když se to rozbije"', price: 599, cost: 30 },
    { id: 'srv_nastaveni', name: 'Prvotní nastavení telefonu', price: 399, cost: 10 }
];

const CUSTOMER_ARCHETYPES = [
    {
        name: 'Lovec baterek do budíku',
        avatar: '🔋',
        dialogs: [
            "Potřebuji baterky do nástěnných hodin, ale hlavně ať jsou levné!",
            "Kolik stojí tyhle tužkové? A vydrží aspoň do příští zimy?",
            "Já nechci žádné drahé alkalické, dejte mi ty neobyčejnější."
        ],
        requiredBatteries: Math.floor(Math.random() * 8) + 2
    },
    {
        name: 'Inženýr z internetu',
        avatar: '🤓',
        dialogs: [
            "Na YouTube říkali, že tenhle ventilátor má o 0.4% horší chlazení. Chci slevu!",
            "Potřebuji redukci z USB-A na scart pro dědův gramofon z 1974."
        ],
        requiredBatteries: 0
    },
    {
        name: 'Nezastavitelný spěchal',
        avatar: '🏃‍♀️',
        dialogs: [
            "Stíhám vlak! Rychle mi dejte troje baterky do ovladače od brány a neukecávejte mě!",
            "Nemám čas, ukažte mi to nejlepší hned!"
        ],
        requiredBatteries: Math.floor(Math.random() * 4) + 1
    }
];

const EVENTS_DATA = [
    { title: 'Inspekce vedoucího v klíčové dírce', desc: 'Vedoucí jde šmírovat do zázemí, utíkej ke dveřím s párátkem!', action: 'keyhole' },
    { title: 'Útěk na záchod a chytání lelků', desc: 'Na prodejně je moc zákazníků, zalez na WC a chytaj lelky!', action: 'lelky' },
    { title: 'Hledání ztraceného balíku', desc: 'Zákazník zuří u pokladny, že jeho e-shopová objednávka nikde.', action: 'package' }
];

const SHIFT_QUOTES = [
    "Obrat splněn. Sankce od vedoucího byly tentokrát milosrdné.",
    "Fólie plná chlupů přinesla zákazníkovi historickou slevu.",
    "Lelci na záchodě poaplaudovali tvému postřehu.",
    "Párátko v oku vedoucího zachránilo tvé osobní ohodnocení."
];
