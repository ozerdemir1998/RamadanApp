import { RamadanDay } from '../data/ramadanData';

const BASE_URL = 'https://api.aladhan.com/v1/calendarByCity';
const CITY = 'Istanbul';
const COUNTRY = 'Turkey';
const METHOD = 13; // Diyanet İşleri Başkanlığı

// 2026 Ramazan: 18 Şubat - 19 Mart (Tahmini)
// Hicri takvime göre dinamik güncelleyebiliriz ama şimdilik sabit tarihlerle ilerleyelim.
const RAMADAN_START = new Date(2026, 1, 18); // 18 Şubat (Ay 0-indeksli)
const RAMADAN_END = new Date(2026, 2, 19);   // 19 Mart

export const getRamadanPrayerTimes = async (): Promise<RamadanDay[]> => {
    try {
        // Ramazan iki aya yayılıyor: Şubat ve Mart 2026
        const febData = await fetchMonthData(2026, 2); // API 1-indeksli: Şubat = 2
        const marData = await fetchMonthData(2026, 3); // Mart = 3

        const allDays = [...febData, ...marData];

        // Sadece Ramazan günlerini filtrele ve dönüştür
        const ramadanDays = allDays.filter(item => {
            // Tarih formatı: DD-MM-YYYY
            const [day, month, year] = item.date.gregorian.date.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date >= RAMADAN_START && date <= RAMADAN_END;
        });

        return ramadanDays.map((item, index) => {
            const dayIndex = index + 1;
            const isKadirGecesi = dayIndex === 27;

            let selectedDua = {
                arabic: "",
                meaning: "",
                zikir: ""
            };

            if (dayIndex <= 10) {
                // 1. On Gün: Rahmet
                selectedDua = {
                    zikir: "Ya Erhamerrahimin\n(Ey Merhametlilerin En Merhametlisi)",
                    arabic: "Allahümmerhamnî bi rahmetike yâ erhamerrahimîn.",
                    meaning: "Allah'ım! Beni rahmetinle kuşat, ibadetlerimi kolaylaştır ve kalbimi temizle."
                };
            } else if (dayIndex <= 20) {
                // 2. On Gün: Mağfiret
                selectedDua = {
                    zikir: "Ya Gafferaz-zünub\n(Ey Günahları Bağışlayan)",
                    arabic: "Allahümmağfirlî zünûbî yâ gaffârez-zünûb.",
                    meaning: "Allah'ım! Bilerek veya bilmeyerek işlediğim hatalarımı affet, beni mağfiretine nail eyle."
                };
            } else {
                // 3. On Gün: Kurtuluş
                selectedDua = {
                    zikir: "Ya Atikar-rikab\n(Ey Boyunları Cehennemden Azat Eden)",
                    arabic: "Allahümme ecirnâ minen-nâr yâ atîkar-rikâb.",
                    meaning: "Allah'ım! Bizi cehennem azabından koru, boyunlarımızı ateşten azat eyle."
                };
            }

            // Kadir Gecesi Özel
            if (isKadirGecesi) {
                selectedDua = {
                    zikir: "Allahümme inneke afüvvün\n(Sen Affedicisin)",
                    arabic: "Allahümme inneke afüvvün, tuhibbü'l-afve fa'fu annî.",
                    meaning: "Allah’ım! Sen affedicisin, affı seversin, beni de affet."
                };
            }

            return {
                day: dayIndex,
                date: `${dayIndex} Ramazan`,
                gregorian: formatGregorianDate(item.date.gregorian.date),
                isKadirGecesi,
                times: {
                    imsak: fixTime(item.timings.Fajr),
                    gunes: fixTime(item.timings.Sunrise),
                    ogle: fixTime(item.timings.Dhuhr),
                    ikindi: fixTime(item.timings.Asr),
                    aksam: fixTime(item.timings.Maghrib),
                    yatsi: fixTime(item.timings.Isha),
                },
                dua: {
                    title: isKadirGecesi ? "Kadir Gecesi Duası" : `${dayIndex}. Gün Duası`,
                    arabic: selectedDua.arabic,
                    meaning: selectedDua.meaning
                },
                zikir: selectedDua.zikir
            };
        });

    } catch (error) {
        console.error('Error fetching prayer times:', error);
        throw error;
    }
};

const fetchMonthData = async (year: number, month: number) => {
    const response = await fetch(`${BASE_URL}/${year}/${month}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`);
    const json = await response.json();
    if (json.code !== 200) throw new Error('API Error');
    return json.data;
};

// "18-02-2026" -> "18 Şubat"
const formatGregorianDate = (dateStr: string) => {
    const [d, m, y] = dateStr.split('-');
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleString('tr-TR', { day: 'numeric', month: 'long' });
};

// API "05:42 (EET)" dönebilir, "(EET)" kısmını at
const fixTime = (time: string) => {
    return time.split(' ')[0];
};
