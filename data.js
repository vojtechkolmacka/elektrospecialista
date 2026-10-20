const PRODUCTS_DATA = [
    { id: 'bat_aa', name: 'AA alkalické baterie 4ks', category: 'baterie', price: 99, cost: 40 },
    { id: 'bat_knoflik', name: 'Knoflíková baterie CR2032 do autoklíče', category: 'baterie', price: 49, cost: 15 },
    { id: 'nab_rychla', name: 'Rychlonabíječka GaN 65W', category: 'nabijecky', price: 899, cost: 350 },
    { id: 'kabel_usbc', name: 'Armor kabel USB-C s pancéřovým opletením', category: 'kabely', price: 349, cost: 80 },
    { id: 'sluch_drát', name: 'Retro drátová sluchátka s molitany', category: 'sluchatka', price: 199, cost: 50 },
    { id: 'power_20k', name: 'Powerbanka 20 000 mAh (schválená do letadla)', category: 'powerbanky', price: 999, cost: 400 },
    { id: 'sklo_mobil', name: 'Hydrogelová fólie na míra + nalepení', category: 'prislušenstvi', price: 499, cost: 40, minigame: 'foil' },
    { id: 'rep_bt', name: 'Vodotěsný Party reproduktor s blikátkem', category: 'reproduktory', price: 1499, cost: 650 },
    { id: 'mys_vertikal', name: 'Ergonomická vertikální myš proti karpálům', category: 'pc', price: 799, cost: 300 },
    { id: 'konvice_wifi', name: 'Smart konvice s přehříváním a aplikací', category: 'domacnost', price: 1299, cost: 500 },
    { id: 'vysavac_robot', name: 'Robotický vysavač, co naráží do zdí', category: 'domacnost', price: 4999, cost: 2200 },
    { id: 'tv_oled', name: '55" OLED TV s Vypálenou reklamou v menu', category: 'televizory', price: 18999, cost: 12000 },
    { id: 'mobil_odolny', name: 'Vojenský "cementofon" s 10000mAh baterií', category: 'mobily', price: 4599, cost: 3000, minigame: 'foil' }
];

const SERVICES_DATA = [
    { id: 'srv_pojisteni', name: 'Okamžitá výměna: Pojištění proti rozbití o chodník', price: 799, cost: 50 },
    { id: 'srv_zaruka', name: 'Prodloužená záruka "Když se to rozbije po záruce"', price: 599, cost: 30 },
    { id: 'srv_nastaveni', name: 'Prvotní nastavení telefonu "Aby to špehovalo správně"', price: 399, cost: 10 },
    { id: 'srv_flexa', name: 'Splátky s úrokem, že prodáte i ledvinu', price: 299, cost: 20 }
];

const CUSTOMER_ARCHETYPES = [
    {
        name: 'Ekonomický detektiv',
        avatar: '🕵️‍♂️',
        dialogs: [
            "Na Alze to mají levnější o korunu padesát a ještě k tomu posílají čokoládu. Co mi dáte vy jako morální kompenzaci?",
            "Já jsem si to zkusil v prodejně, ale koupím to v čínském e-shopu. Jen mi řekněte, jak se to zapíná, ať vím, co objednávám.",
            "Proč tahle žárovka stojí 50 Kč, když v televizi říkali, že inflace klesá?"
        ],
        choices: [
            { text: "Dát mu slevu z vlastní pokladny a sušenku z pultu.", effect: { turnover: +100, margin: -20, stress: +5 } },
            { text: "Oznámit mu, že čokoládu v Datartu nahrazuje čistá radost z nákupu.", effect: { satisfaction: -10, stress: +10 } },
            { text: "Odkázat ho na e-shop s tím, že my jsme fyzická prodejna a chceme žít.", effect: { turnover: -50, stress: -5 } }
        ]
    },
    {
        name: 'Inženýr z internetu',
        avatar: '🤓',
        dialogs: [
            "Potřebuji redukci z USB-A na scart, abych mohl 4K monitor připojit k dědově gramofonu z roku 1974.",
            "V recenzích na YouTube říkali, že tenhle procesor má o 0.4 % horší chlazení v zátěži. Chci slevu za psychickou újmu.",
            "Já IT rozumím, dělal jsem v Excelu v roce 1998. Proč mi tady nutíte ovladače?"
        ],
        choices: [
            { text: "Předstírat odborný souhlas a prodat mu nejdražší zbytečný kabel.", effect: { turnover: +599, margin: +400, stress: +10 } },
            { text: "Sestavit mu fyzickou redukci z izolepy a starého síťového kabelu.", effect: { satisfaction: +15, turnover: +199 } },
            { text: "Poslat ho do hračkářství, že tam mívají kompatibilnější hardware.", effect: { satisfaction: -20, stress: +15 } }
        ]
    },
    {
        name: 'Nezastavitelný spěchal',
        avatar: '🏃‍♀️',
        dialogs: [
            "Jdu kolem už tři minuty a nikdo se mi neklaní! Potřebuji dárek pro tchyni, stíhám vlak a chci, aby to vypadalo draze.",
            "Nemám čas na vaše vysvětlování, ukažte mi to nejlepší, nejlehčí a nejčervenější hned teď!",
            "Kde máte pokladnu sakra? Já platím obědem!"
        ],
        choices: [
            { text: "Popadnout první blikající reproduktor a napasovat ho do tašky.", effect: { turnover: +1499, margin: +800, stress: +15 } },
            { text: "Ukázat mu prstem na východ s tím, že nejrychlejší je útěk.", effect: { satisfaction: -5, stress: -10 } },
            { text: "Rychle mu vnutit prodlouženou záruku, ať se nevrací.", effect: { turnover: +899, services: +1 } }
        ]
    },
    {
        name: 'Reklamační filozof',
        avatar: '🧐',
        dialogs: [
            "Včera jsem na tom vysavači vysál vodu z akvária a on přestal dýchat. Vy jste mi zatajili, že neumí plavat!",
            "Ten telefon má moc ostré rohy, píchá mě do ucha, když spím. Chci vrácení peněz v hotovosti i s úroky.",
            "Tato powerbanka nenabíjí mé duchovní energie, pouze telefon. Klamavá reklama!"
        ],
        choices: [
            { text: "Vysvětlit mu rozdíl mezi sušičkou a akváriem za pomocí gestikulace.", effect: { stress: +20, satisfaction: -10 } },
            { text: "Předat ho kolegovi s tím, že dneska máte den pro mentálně otevřené.", effect: { stress: -10, turnover: 0 } },
            { text: "Prodat mu ochranné pouzdro na ucho proti ostrým rohům telefonu.", effect: { turnover: +349, margin: +300 } }
        ]
    },
    {
        name: 'Babička s celým vesmírem v tašce',
        avatar: '👵',
        dialogs: [
            "Synáčku, synku, mě ten čtvercový internět v té ploše nějak zlobí. Nemůžu se dovolat do sousedovic kočky.",
            "Před padesáti lety stály tyhle rádia deset korun a hrály celou noc. Proč tohle chce po mně heslo na mail?",
            "A nemáte k tomu prosím nějaký hezký hrneček zdarma?"
        ],
        choices: [
            { text: "S trpělivostí svatého člověka jí vysvětlit, že tohle je indukční vařič.", effect: { satisfaction: +20, stress: -5, turnover: +1299 } },
            { text: "Darovat jí firemní propisku jako bonus za psychickou odolnost.", effect: { satisfaction: +10, turnover: +99 } },
            { text: "Zapnout jí na tabletu pohádku a nechat ji odpočinout v křesle.", effect: { satisfaction: +25, stress: -15 } }
        ]
    }
];

const EVENTS_DATA = [
    {
        title: 'Inspekce vedoucího v zázemí',
        desc: 'Vedoucí jde zkontrolovat, jestli v krabicích od telefonů neschováváte nedojedený oběd.',
        action: 'keyhole'
    },
    {
        title: 'Najíždí panická vlna doplňkových služeb',
        desc: 'Oblastní ředitel poslal tabulku: kdo neprodá do deseti minut pojištění na kabel, končí.',
        action: 'toilet'
    },
    {
        title: 'Zasekl se tisk cenovek',
        desc: 'Tiskárna chrčí, pálí se papír a místo cenovek chrlí básničky o slevách.',
        action: 'foil'
    }
];

const SHIFT_QUOTES = [
    "Obrat splněn. Nervová soustava úspěšně zreklamována.",
    "Fólie nalepena bez jediného chlupu. Zázrak!",
    "Schovávání na záchodě povýšilo na uměleckou disciplínu.",
    "Vedoucí nic nezjistil. Párátko v klíčové dírce zafungovalo.",
    "Přežil jsi směnu plnou inženýrů z YouTube a babiček s tabletem."
];
