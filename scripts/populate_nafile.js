const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

const nafileNamazlar = [
    {
        id: "teheccud",
        name: "Teheccüd Namazı",
        arabicName: "التهجد",
        shortDesc: "Gece uykudan uyanılarak kılınan, çok faziletli bir namazdır.",
        time: "Yatsı namazından sonra, uyuyup uyandıktan sonra imsak vaktine kadar kılınabilir.",
        virtue: "Peygamber Efendimiz (s.a.v) 'Farz namazlardan sonra en faziletli namaz gece namazıdır' buyurmuştur. Manevi derecelerin artmasına vesiledir.",
        howToPray: "En az iki rekat kılınır. İki, dört, altı veya sekiz rekat olarak kılınabilir. Her iki rekatta bir selam verilmesi daha faziletlidir. Niyet edilir: 'Niyet ettim Allah rızası için Teheccüd namazı kılmaya'."
    },
    {
        id: "duha_kusluk",
        name: "Kuşluk (Duha) Namazı",
        arabicName: "الضحى",
        shortDesc: "Güneş doğduktan sonra öğle vaktine kadar kılınan rızık ve şükür namazıdır.",
        time: "Güneş doğup kerahet vakti çıktıktan sonra başlar, öğle namazına 45 dakika kalana kadar kılınabilir.",
        virtue: "Peygamberimiz (s.a.v) 'Her kim kuşluk vaktinde iki rekat namaz kılarsa, vücudunun bütün eklemleri için sadaka vermiş olur' buyurmuştur.",
        howToPray: "En az iki, en çok on iki rekat kılınabilir. Yaygın olanı dört veya sekiz rekattır. Niyet: 'Niyet ettim Allah rızası için Duha namazı kılmaya'."
    },
    {
        id: "tesbih",
        name: "Tesbih Namazı",
        arabicName: "التسابيح",
        shortDesc: "Günahların affı için kılınan, içinde 300 defa tesbih duası okunan özel bir namazdır.",
        time: "Kerahet vakitleri dışında her zaman kılınabilir.",
        virtue: "Büyük günahların affına vesile olduğu rivayet edilir. Ömürde en az bir kere kılınması tavsiye edilmiştir.",
        howToPray: "Dört rekat kılınır. Her rekatta Fatiha ve zamm-ı sure'den önce ve sonra 'Sübhanallahi velhamdülillahi ve la ilahe illallahu vallahu ekber' tesbihi okunur. Toplamda 300 defa bu tesbih söylenir."
    },
    {
        id: "tehiyyetul_menzil",
        name: "Tehıyyet-ül-menzil Namazı",
        arabicName: "تحية المنزل",
        shortDesc: "Bir yere misafir olunduğunda veya eve dönüldüğünde kılınan selamla namazıdır.",
        time: "Ev sahibi veya misafir olunan yere girildiğinde.",
        virtue: "Mekanın sahibine ve Allah'a şükür nişanesidir.",
        howToPray: "İki rekat olarak kılınır. Niyet: 'Niyet ettim Allah rızası için Tehıyyet-ül-menzil namazı kılmaya'."
    },
    {
        id: "resulullah_ruya",
        name: "Resulullah'ı Rüyada Görmek İçin",
        arabicName: "رؤية النبي",
        shortDesc: "Peygamber Efendimizi rüyada görmek ümidiyle kılınan namaz.",
        time: "Cuma geceleri veya mübarek gecelerde tavsiye edilir.",
        virtue: "Peygamber sevgisini pekiştirir ve manevi bir bağ kurulmasına vesile olur.",
        howToPray: "İki rekat namaz kılınır. Namazdan sonra çokça salavat getirilir ve samimiyetle dua edilir."
    },
    {
        id: "abher",
        name: "Abher Namazı",
        arabicName: "صلاة الأبهر",
        shortDesc: "Özel dualar ve tesbihlerle kılınan manevi bir namaz.",
        time: "Genellikle nafile ibadet zamanlarında kılınır.",
        virtue: "Manevi sıkıntıların giderilmesi ve hacetlerin kabulü için tavsiye edilir.",
        howToPray: "Dört rekat kılınır. İkinci rekatta selam verilmez. Özel duaları vardır, rüku ve secdelerde okunur."
    },
    {
        id: "subha",
        name: "Sübha Namazı",
        arabicName: "السبحة",
        shortDesc: "Yolculuktan dönüldüğünde kılınan şükür namazıdır.",
        time: "Seferden dönüp eve girildiğinde veya mescide gidildiğinde.",
        virtue: "Yolculuğun kazasız belasız tamamlanmasına şükür ifadesidir.",
        howToPray: "İki rekat olarak kılınır."
    },
    {
        id: "istihare",
        name: "İstihare Namazı",
        arabicName: "الاستخارة",
        shortDesc: "Bir işin hayırlı olup olmadığını anlamak için kılınan namaz.",
        time: "Yatsı namazından sonra, uyumadan hemen önce.",
        virtue: "Kişiyi kararsızlıktan kurtarır ve Allah'a teslimiyeti artırır.",
        howToPray: "İki rekat kılınır. Birinci rekatta Kafirun, ikinci rekatta İhlas suresi okunur. Namazdan sonra İstihare Duası okunur ve hiç konuşmadan sağ tarafa yatılır."
    },
    {
        id: "tehiyyetul_mescid",
        name: "Tehıyyet-ül-mescid Namazı",
        arabicName: "تحية المسجد",
        shortDesc: "Camiye girildiğinde, oturmadan önce kılınan selamla namazıdır.",
        time: "Bir mescide girildiğinde, kerahet vakti değilse oturmadan önce kılınır.",
        virtue: "Mescidin Rabbine bir saygı ifadesidir. Peygamberimiz (s.a.v) 'Biriniz mescide girdiğinde iki rekat namaz kılmadan oturmasın' buyurmuştur.",
        howToPray: "İki rekat olarak kılınır. Niyet: 'Niyet ettim Allah rızası için Tehıyyet-ül-mescid namazı kılmaya'."
    },
    {
        id: "evvabin",
        name: "Evvabin Namazı",
        arabicName: "الأوابين",
        shortDesc: "Akşam namazından sonra kılınan, tövbe edenlerin namazıdır.",
        time: "Akşam namazının farzı ve sünnetinden sonra kılınır.",
        virtue: "Peygamberimiz (s.a.v) 'Kim akşam namazından sonra altı rekat namaz kılarsa, bu kendisi için on iki senelik ibadete denk sayılır' buyurmuştur.",
        howToPray: "Altı rekat olarak kılınır. İkişer rekat halinde selam vererek kılınması tavsiye edilir."
    },
    {
        id: "kusuf_husuf",
        name: "Küsuf ve Husuf (Kusuf) Namazları",
        arabicName: "الكسوف",
        shortDesc: "Güneş ve Ay tutulması esnasında kılınan özel namazlardır.",
        time: "Güneş veya Ay tutulması başladığından sona erene kadar olan sürede.",
        virtue: "Allah'ın kudretini hatırlamak ve af dilemek için kılınır. Peygamberimiz bu olayları 'Allah'ın ayetlerinden iki ayet' olarak nitelendirmiştir.",
        howToPray: "İki rekat kılınır. Her rekatta kıyam ve rüku uzatılır. Cemaatle veya tek başına kılınabilir. Namazdan sonra dua edilir."
    },
    {
        id: "revatip_sunnet",
        name: "Revâtip Sünnetler",
        arabicName: "الرواتب",
        shortDesc: "Beş vakit farz namazlarla birlikte kılınan düzenli sünnetlerdir.",
        time: "Sabah, Öğle, İkindi, Akşam ve Yatsı namazlarının farzlarından önce veya sonra.",
        virtue: "Farz namazlardaki eksiklikleri tamamlar ve Peygamberimizin şefaatine vesile olur. 'Kim günde 12 rekat (revâtip) sünnet kılarsa, Allah ona cennette bir köşk bina eder.'",
        howToPray: "Sabah: Farzdan önce 2 rekat. Öğle: Farzdan önce 4, sonra 2 rekat. İkindi: Farzdan önce 4 rekat (gayr-i müekked). Akşam: Farzdan sonra 2 rekat. Yatsı: Farzdan önce 4, sonra 2 rekat."
    }
];

async function upload() {
    console.log("Populating Nafile Namazlar...");
    const colRef = db.collection("nafile_namazlar");

    for (const namaz of nafileNamazlar) {
        try {
            // ID'yi doküman ID'si olarak kullanıyoruz ki çift kayıt olmasın
            await colRef.doc(namaz.id).set(namaz);
            console.log(`Uploaded: ${namaz.name}`);
        } catch (e) {
            console.error(`Error ${namaz.name}:`, e);
        }
    }
    console.log("Done!");
}

upload();
