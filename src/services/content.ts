// src/services/content.ts

// 1. AYET SERVİSİ (Önce interneti dener, yoksa yedek döner)
export const fetchDailyAyet = async () => {
  try {
    // 3 saniyelik zaman aşımı (Timeout) ekleyelim ki uygulama donmasın
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const randomSurah = Math.floor(Math.random() * (114 - 80 + 1)) + 80;
    const randomVerse = 1;

    // AlQuran Cloud API (Daha güvenilir)
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${randomSurah}:${randomVerse}/tr.diyanet`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId); // İşlem başarılıysa zamanlayıcıyı iptal et

    if (!response.ok) throw new Error("API yanıt vermedi");

    const json = await response.json();
    const ayet = json.data.text;
    const sureAdi = json.data.surah.englishName;
    const ayetNo = json.data.numberInSurah;

    return {
      title: 'Günün Ayeti',
      content: `"${ayet}"\n\n(${sureAdi}, ${ayetNo})`,
      type: 'ayet',
      color: '#2E8B57',
      icon: 'book'
    };
  } catch (error) {
    console.log("Ayet internetten çekilemedi, yedek gösteriliyor.");
    // İnternet yoksa gösterilecek sabit veri
    return {
      title: 'Günün Ayeti',
      content: '"Şüphesiz güçlükle beraber bir kolaylık vardır." (İnşirah, 5)',
      type: 'ayet',
      color: '#2E8B57',
      icon: 'book'
    };
  }
};

// 2. HADİS SERVİSİ (ARTIK LOKAL - Hata vermez, internet gerektirmez)
const HADIS_HAVUZU = [
  "Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.",
  "Ameller niyetlere göredir. Herkes için niyet ettiği şey vardır.",
  "Sizin en hayırlınız, Kur'an'ı öğrenen ve öğreteninizdir.",
  "Temizlik imanın yarısıdır.",
  "Hiçbir baba, çocuğuna güzel terbiyeden daha kıymetli bir miras bırakmamıştır.",
  "İnsanlara merhamet etmeyene Allah da merhamet etmez.",
  "Güzel söz sadakadır.",
  "Komşusu açken tok yatan bizden değildir.",
  "İki nimet vardır ki insanların çoğu bunların kıymetini bilmez: Sağlık ve boş vakit.",
  "Bizi aldatan bizden değildir."
];

export const fetchDailyHadis = async () => {
  // Havuzdan rastgele bir hadis seç
  const randomHadis = HADIS_HAVUZU[Math.floor(Math.random() * HADIS_HAVUZU.length)];
  
  // Sanki API'den geliyormuş gibi döndür (Promise yapısı bozulmasın diye async bıraktık)
  return {
    title: 'Günün Hadisi',
    content: `"${randomHadis}"`,
    type: 'hadis',
    color: '#1E88E5',
    icon: 'chatbubbles'
  };
};

// 3. İSİM VE TARİH (Zaten Lokaldi, sorunsuz)
const NAMES_POOL = [
  { m: 'Yusuf', f: 'Zeynep' },
  { m: 'Ahmet', f: 'Ayşe' },
  { m: 'Mustafa', f: 'Fatma' },
  { m: 'Ömer', f: 'Elif' },
  { m: 'Hamza', f: 'Meryem' },
  { m: 'Ali', f: 'Zehra' },
  { m: 'İbrahim', f: 'Hacer' }
];

const HISTORY_POOL = [
  'Hicretin 8. yılında Mekke fethedildi.',
  'Bugün Bedir Savaşı kazanıldı.',
  'İlk Cuma namazı kılındı.',
  'Kadir Gecesi bu ayda aranır.',
  'Müslümanlar ilk kez Kabe\'ye yönelerek namaz kıldı.',
];

export const fetchDailyName = async () => {
  const random = NAMES_POOL[Math.floor(Math.random() * NAMES_POOL.length)];
  return {
    title: 'Günün İsmi',
    content: `Erkek: ${random.m}\nKız: ${random.f}`,
    type: 'isim',
    color: '#E91E63',
    icon: 'people'
  };
};

export const fetchHistory = async () => {
  const random = HISTORY_POOL[Math.floor(Math.random() * HISTORY_POOL.length)];
  return {
    title: 'Tarihte Bugün',
    content: random,
    type: 'tarih',
    color: '#F9A825',
    icon: 'time'
  };
};