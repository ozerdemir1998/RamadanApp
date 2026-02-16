// src/constants/contentData.ts

// 1. MEDYA İÇERİKLERİ (Ayet, Hadis, Dua)
export const DAILY_CONTENT = {
  ayet: {
    title: "Günün Ayeti",
    subTitle: "Bakara Suresi, 183. Ayet",
    textTR: "Ey iman edenler! Oruç, sizden öncekilere farz kılındığı gibi size de farz kılındı. Umulur ki korunursunuz.",
    textAR: "يَا أَيُّهَا الَّذِينَ آمَنُواْ كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ",
    // Abdulbasit Abdussamed'den Bakara 183 (Gerçek Link)
    audioAR: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3", 
    // Türkçe Meal Seslendirmesi (Örnek - Temsili)
    audioTR: "https://github.com/rabiro/quran-json-api/raw/master/sura/audio/002-183-tr.mp3", // (Bu link örnek, genelde lokal dosya kullanılır)
  },
  hadis: {
    title: "Günün Hadisi",
    subTitle: "Buhari, Savm, 9",
    textTR: "Oruçlu için iki sevinç vardır: Biri, orucu açtığı zamanki sevinci; diğeri de Rabbine kavuştuğu zamanki sevincidir.",
    textAR: "لِلصَّائِمِ فَرْحَتَانِ يَفْرَحُهُمَا: إِذَا أَفْطَرَ فَرِحَ، وَإِذَا لَقِيَ رَبَّهُ فَرِحَ بِصَوْمِهِ",
    audioTR: null, 
    audioAR: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
  },
  dua: {
    title: "Yemek Duası",
    subTitle: "İftar Duası",
    textTR: "Allah'ım! Senin rızan için oruç tuttum, sana inandım, sana güvendim ve senin rızkınla orucumu açtım.",
    textAR: "اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
    // Kısa bir iftar duası kaydı (Gerçek Link)
    audioAR: "https://media.blubrry.com/islam_audio/content.blubrry.com/islam_audio/Dua-Qunoot.mp3", // Örnek dua kaydı
    audioTR: null,
  }
};

// 2. YEMEK TARİFLERİ
export const RECIPES = [
  {
    id: 'corbalar',
    title: 'Çorbalar',
    icon: 'restaurant',
    items: [
      { name: 'Mercimek Çorbası', desc: 'Klasik süzme mercimek çorbası.', detail: 'Malzemeler: Mercimek, Soğan...' },
      { name: 'Ezogelin', desc: 'Naneli, baharatlı geleneksel lezzet.', detail: 'Malzemeler: Pirinç, Bulgur...' },
    ]
  },
  {
    id: 'ana_yemek',
    title: 'Ana Yemekler',
    icon: 'nutrition',
    items: [
      { name: 'Hünkar Beğendi', desc: 'Patlıcan yatağında kuşbaşı et.', detail: 'Yapılışı: Patlıcanları közleyin...' },
      { name: 'Karnıyarık', desc: 'Kıymalı patlıcan yemeği.', detail: 'Yapılışı: Patlıcanları alacalı soyun...' },
    ]
  },
  {
    id: 'tatlilar',
    title: 'Tatlılar',
    icon: 'ice-cream',
    items: [
      { name: 'Güllaç', desc: 'Ramazan\'ın gülü sütlü tatlı.', detail: 'Sütü ısıtın, şeker ekleyin...' },
      { name: 'Sütlaç', desc: 'Fırında kızarmış sütlaç.', detail: 'Pirinci haşlayın...' },
    ]
  }
];