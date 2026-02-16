export interface RamadanDay {
    day: number;
    date: string;
    gregorian: string;
    isKadirGecesi?: boolean;
    times: {
        imsak: string;
        gunes: string;
        ogle: string;
        ikindi: string;
        aksam: string;
        yatsi: string;
    };
    dua: {
        title: string;
        arabic: string;
        meaning: string;
    };
    zikir: string;
}

// 2026 Ramazan - 18 Şubat Başlangıç (Tahmini)
const BASE_TIMES = {
    imsak: [6, 10],  // Şubat günleri geç doğar
    gunes: [7, 35],
    ogle: [13, 25],
    ikindi: [16, 20],
    aksam: [18, 50], // Erken batar
    yatsi: [20, 10]
};

export const DUALAR = [
    { arabic: "Allahümme leke sumtu ve bike âmentü ve aleyke tevekkeltü ve alâ rızkıke eftartü.", meaning: "Allah'ım! Senin rızan için oruç tuttum, sana inandım, sana güvendim ve senin rızkınla orucumu açtım." },
    { arabic: "Allahümme innî es'elüke birehmetikelleti vesiat külle şey'in en tağfire lî.", meaning: "Allah'ım! Her şeyi kuşatan rahmetinle beni bağışlamanı diliyorum." },
    { arabic: "Allahümme innî es'elüke min hayri mâ se'eleke minhü nebiyyüke Muhammedün sallallahu aleyhi ve sellem.", meaning: "Allah'ım! Peygamberin Muhammed'in (s.a.v.) senden istediği hayırları ben de istiyorum." },
    // ... Diğer dualar buraya eklenebilir, şimdilik döngüsel kullanacağız
];

export const RAMADAN_DATA: RamadanDay[] = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    // 2026, 1 (Şubat), 18 (Başlangıç)
    // Javascript Date ay 0-indeksli: 0=Ocak, 1=Şubat, 2=Mart
    const date = new Date(2026, 1, 18 + i);
    const gun = date.getDate();
    const ay = date.toLocaleString('tr-TR', { month: 'long' });

    // Şubat-Mart geçişi, günler uzuyor
    // İmsak her gün ~1-2 dk azalır, Akşam her gün ~1 dk artar.
    const timeShift = i;
    const formatTime = (h: number, m: number, shift: number) => {
        let newM = m + shift;
        let newH = h;
        // Dakika taşması kontrolü
        while (newM >= 60) { newM -= 60; newH += 1; }
        while (newM < 0) { newM += 60; newH -= 1; }

        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    // ... (Date calculations remain the same)
    const isKadirGecesi = day === 27;

    let selectedDua = {
        arabic: "",
        meaning: "",
        zikir: ""
    };

    if (day <= 10) {
        // 1. On Gün: Rahmet
        selectedDua = {
            zikir: "Ya Erhamerrahimin\n(Ey Merhametlilerin En Merhametlisi)",
            arabic: "Allahümmerhamnî bi rahmetike yâ erhamerrahimîn.",
            meaning: "Allah'ım! Beni rahmetinle kuşat, ibadetlerimi kolaylaştır ve kalbimi temizle."
        };
    } else if (day <= 20) {
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
        day,
        date: `${day} Ramazan`,
        gregorian: `${gun} ${ay}`,
        isKadirGecesi,
        times: {
            imsak: formatTime(BASE_TIMES.imsak[0], BASE_TIMES.imsak[1], -i),
            gunes: formatTime(BASE_TIMES.gunes[0], BASE_TIMES.gunes[1], -i),
            ogle: formatTime(BASE_TIMES.ogle[0], BASE_TIMES.ogle[1], 0),
            ikindi: formatTime(BASE_TIMES.ikindi[0], BASE_TIMES.ikindi[1], Math.floor(i / 2)),
            aksam: formatTime(BASE_TIMES.aksam[0], BASE_TIMES.aksam[1], i),
            yatsi: formatTime(BASE_TIMES.yatsi[0], BASE_TIMES.yatsi[1], i),
        },
        dua: {
            title: isKadirGecesi ? "Kadir Gecesi Duası" : `${day}. Gün Duası`,
            arabic: selectedDua.arabic,
            meaning: selectedDua.meaning
        },
        zikir: selectedDua.zikir
    };
});
