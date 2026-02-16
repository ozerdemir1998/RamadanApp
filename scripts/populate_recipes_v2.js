const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCRZRqz7kGqk2cCmw6GQ0WcrjpWwEUcrhI",
    authDomain: "ramadanapp-b9046.firebaseapp.com",
    projectId: "ramadanapp-b9046",
    storageBucket: "ramadanapp-b9046.firebasestorage.app",
    messagingSenderId: "821611684902",
    appId: "1:821611684902:web:912ce35990412ffaafb2e7",
    measurementId: "G-C1TY3ET645"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data with empty images as requested
const recipes = [
    // --- ÇORBALAR (15) ---
    { "category": "Çorbalar", "title": "Mercimek Çorbası", "image": "", "ingredients": ["Kırmızı mercimek", "Soğan", "Havuç", "Tereyağı"], "instructions": "Sebzeleri kavurup mercimeği ekleyin, suyla pişirip blenderdan geçirin." },
    { "category": "Çorbalar", "title": "Ezogelin Çorbası", "image": "", "ingredients": ["Kırmızı mercimek", "Bulgur", "Pirinç", "Salça"], "instructions": "Bakliyatları haşlayın, salçalı ve naneli sosu ekleyerek kaynatın." },
    { "category": "Çorbalar", "title": "Yayla Çorbası", "image": "", "ingredients": ["Yoğurt", "Pirinç", "Yumurta sarısı", "Nane"], "instructions": "Pirinçleri haşlayın, yoğurtlu terbiyeyi ılıştırarak ekleyin ve nane yakın." },
    { "category": "Çorbalar", "title": "Domates Çorbası", "image": "", "ingredients": ["Domates", "Un", "Tereyağı", "Süt"], "instructions": "Unu kavurup domatesle pişirin, süt ekleyerek kıvamını açın." },
    { "category": "Çorbalar", "title": "Tarhana Çorbası", "image": "", "ingredients": ["Toz tarhana", "Salça", "Sarımsak", "Nane"], "instructions": "Tarhanayı suda çözüp salçalı karışımla kaynayana kadar karıştırın." },
    { "category": "Çorbalar", "title": "Düğün Çorbası", "image": "", "ingredients": ["Gerdan eti", "Yoğurt", "Limon", "Un"], "instructions": "Etleri didikleyin, yoğurtlu terbiye ile bağlayıp üzerine yağ yakın." },
    { "category": "Çorbalar", "title": "Tavuk Suyu Çorbası", "image": "", "ingredients": ["Tavuk göğsü", "Şehriye", "Limon", "Maydanoz"], "instructions": "Haşlanan tavukları didikleyip şehriye ile pişirin, limonla servis edin." },
    { "category": "Çorbalar", "title": "Mantar Çorbası", "image": "", "ingredients": ["Kültür mantarı", "Krema", "Soğan", "Süt"], "instructions": "Mantarları soteleyip un ve süt ile bağlayın, krema ekleyin." },
    { "category": "Çorbalar", "title": "Şehriye Çorbası", "image": "", "ingredients": ["Arpa şehriye", "Domates rendesi", "Et suyu"], "instructions": "Salçayı kavurup su ve şehriyeleri ekleyin, yumuşayana kadar pişirin." },
    { "category": "Çorbalar", "title": "Brokoli Çorbası", "image": "", "ingredients": ["Brokoli", "Patates", "Krema", "Sarımsak"], "instructions": "Sebzeleri haşlayıp blenderdan geçirin, krema ile tatlandırın." },
    { "category": "Çorbalar", "title": "Beyran", "image": "", "ingredients": ["Kuzu eti", "Pirinç", "Sarımsak", "Bol acı"], "instructions": "Etleri haşlayıp didikleyin, pirinç ve et suyuyla yüksek ateşte kaynatın." },
    { "category": "Çorbalar", "title": "İşkembe Çorbası", "image": "", "ingredients": ["İşkembe", "Sarımsak", "Sirke", "Yumurta"], "instructions": "İşkembeyi haşlayıp doğrayın, terbiye ve bol sarımsaklı sirke ekleyin." },
    { "category": "Çorbalar", "title": "Lebeniye Çorbası", "image": "", "ingredients": ["Nohut", "Buğday", "Yoğurt", "Minik köfte"], "instructions": "Yoğurtlu çorbaya haşlanmış bakliyatları ve kızarmış köfteleri ekleyin." },
    { "category": "Çorbalar", "title": "Kelle Paça", "image": "", "ingredients": ["Kelle eti", "Sirke", "Sarımsak", "Un"], "instructions": "Etleri haşlayıp terbiye ile bağlayın, sirke sosu ile servis yapın." },
    { "category": "Çorbalar", "title": "Soğan Çorbası", "image": "", "ingredients": ["Karamelize soğan", "Et suyu", "Ekmek", "Peynir"], "instructions": "Soğanları iyice karamelize edin, et suyuyla pişirip peynirli ekmekle fırınlayın." },

    // --- ET YEMEKLERİ (15) ---
    { "category": "Et yemekleri", "title": "İskender Kebap", "image": "", "ingredients": ["Döner eti", "Pide", "Yoğurt", "Tereyağı"], "instructions": "Pideleri dizin, üzerine döner etini ve domates sosunu ekleyip tereyağı dökün." },
    { "category": "Et yemekleri", "title": "Hünkar Beğendi", "image": "", "ingredients": ["Kuzu eti", "Patlıcan", "Kaşar", "Süt"], "instructions": "Közlenmiş patlıcanlı beğendi üzerine ağır ateşte pişmiş etleri ekleyin." },
    { "category": "Et yemekleri", "title": "İzmir Köfte", "image": "", "ingredients": ["Kıyma", "Patates", "Biber", "Domates"], "instructions": "Köfte ve patatesleri kızartıp salçalı sos ile fırında pişirin." },
    { "category": "Et yemekleri", "title": "Kuzu İncik", "image": "", "ingredients": ["Kuzu incik", "Arpacık soğan", "Sarımsak"], "instructions": "Etleri mühürleyip sebzelerle birlikte fırın poşetinde veya tencerede pişirin." },
    { "category": "Et yemekleri", "title": "Karnıyarık", "image": "", "ingredients": ["Patlıcan", "Kıyma", "Soğan", "Biber"], "instructions": "Patlıcanları kızartıp kıymalı harç ile doldurun ve fırınlayın." },
    { "category": "Et yemekleri", "title": "Ali Nazik", "image": "", "ingredients": ["Süzme yoğurt", "Patlıcan", "Kuşbaşı et"], "instructions": "Yoğurtlu patlıcan yatağına tereyağlı etleri ilave edin." },
    { "category": "Et yemekleri", "title": "Tas Kebabı", "image": "", "ingredients": ["Dana eti", "Patates", "Bezelye"], "instructions": "Etleri sebzelerle birlikte kendi suyunda ağır ağır pişirin." },
    { "category": "Et yemekleri", "title": "Çoban Kavurma", "image": "", "ingredients": ["Kuzu kuşbaşı", "Arpacık soğan", "Biber"], "instructions": "Yüksek ateşte etleri ve sebzeleri soteleyerek pişirin." },
    { "category": "Et yemekleri", "title": "Kayseri Yağlaması", "image": "", "ingredients": ["Lavaş", "Kıyma", "Yoğurt", "Domates"], "instructions": "Lavaşların arasına kıymalı harç sürerek kat kat dizin." },
    { "category": "Et yemekleri", "title": "Kağıt Kebabı", "image": "", "ingredients": ["Kuzu eti", "Bezelye", "Havuç", "Patates"], "instructions": "Malzemeleri yağlı kağıda sarıp kendi buharında fırınlayın." },
    { "category": "Et yemekleri", "title": "Adana Kebap", "image": "", "ingredients": ["Zırh kıyması", "Kuyruk yağı", "Pul biber"], "instructions": "Etleri şişe saplayıp kömür ateşinde pişirin." },
    { "category": "Et yemekleri", "title": "Orman Kebabı", "image": "", "ingredients": ["Kuzu eti", "Havuç", "Patates", "Bezelye"], "instructions": "Tencerede tüm malzemeleri etler yumuşayana kadar pişirin." },
    { "category": "Et yemekleri", "title": "İçli Köfte", "image": "", "ingredients": ["Bulgur", "Kıyma", "Ceviz"], "instructions": "Dış hamuru hazırlayıp içine kavrulmuş kıymalı harcı doldurup haşlayın veya kızartın." },
    { "category": "Et yemekleri", "title": "Etli Ekmek", "image": "", "ingredients": ["Hamur", "Kıyma", "Sebze karışımı"], "instructions": "İnce açılmış hamur üzerine harcı yayıp taş fırında pişirin." },
    { "category": "Et yemekleri", "title": "Sac Kavurma", "image": "", "ingredients": ["Kuzu eti", "Sac", "Domates", "Biber"], "instructions": "İnce doğranmış etleri sac üzerinde sebzelerle soteleyin." },

    // --- TAVUK (15) ---
    { "category": "Tavuk", "title": "Tavuk Sote", "image": "", "ingredients": ["Tavuk göğsü", "Biber", "Mantar"], "instructions": "Tavukları sebzelerle birlikte yüksek ateşte kavurun." },
    { "category": "Tavuk", "title": "Tavuk Şinitzel", "image": "", "ingredients": ["Tavuk fileto", "Galeta unu", "Yumurta"], "instructions": "Tavukları paneleyip altın sarısı olana kadar kızartın." },
    { "category": "Tavuk", "title": "Köri Soslu Tavuk", "image": "", "ingredients": ["Tavuk", "Köri", "Krema"], "instructions": "Tavukları soteleyip köri ve krema ile bağlayın." },
    { "category": "Tavuk", "title": "Tavuklu Pilav", "image": "", "ingredients": ["Tavuk baget", "Pirinç", "Nohut"], "instructions": "Haşlanmış tavukları didikleyip nohutlu pilavın üzerine ekleyin." },
    { "category": "Tavuk", "title": "Tavuk Fajita", "image": "", "ingredients": ["Tavuk şeritleri", "Renkli biberler", "Soğan"], "instructions": "Döküm tavada sebze ve etleri baharatlarla soteleyin." },
    { "category": "Tavuk", "title": "Çıtır Tavuk", "image": "", "ingredients": ["Tavuk kanat", "Mısır gevreği", "Baharat"], "instructions": "Tavukları baharatlı karışıma bulayıp fırınlayın." },
    { "category": "Tavuk", "title": "Tavuk Haşlama", "image": "", "ingredients": ["Tavuk but", "Patates", "Havuç"], "instructions": "Tüm malzemeleri su ve terbiye ile haşlayın." },
    { "category": "Tavuk", "title": "Tavuklu Saray Sarması", "image": "", "ingredients": ["Tavuk göğsü", "Milföy", "Bezelye"], "instructions": "İç harcı hazırlayıp hamura sarın ve fırınlayın." },
    { "category": "Tavuk", "title": "Tavuk Şiş", "image": "", "ingredients": ["Tavuk kuşbaşı", "Yoğurt sosu", "Biber"], "instructions": "Marine edilmiş tavukları şişe dizip ızgara yapın." },
    { "category": "Tavuk", "title": "Tavuk Kapama", "image": "", "ingredients": ["Tavuk but", "Pirinç", "Baharat"], "instructions": "Fırın tepsisine pirinci ve tavukları dizip fırınlayın." },
    { "category": "Tavuk", "title": "Tavuklu Mantar Güveç", "image": "", "ingredients": ["Tavuk", "Mantar", "Kaşar peyniri"], "instructions": "Güveç kaplarında pişirip üzerine kaşar eriterek servis yapın." },
    { "category": "Tavuk", "title": "Tavuk Burger", "image": "", "ingredients": ["Tavuk kıyması", "Burger ekmeği", "Marul"], "instructions": "Tavuk köftelerini pişirip garnitürlerle birleştirin." },
    { "category": "Tavuk", "title": "Tavuk Kanat Izgara", "image": "", "ingredients": ["Tavuk kanat", "Acı sos"], "instructions": "Kanatları soslayıp mangalda veya fırında pişirin." },
    { "category": "Tavuk", "title": "Tavuklu Çökertme", "image": "", "ingredients": ["Kibrit patates", "Tavuk göğsü", "Yoğurt"], "instructions": "Çıtır patateslerin üzerine yoğurt ve sote tavuk ekleyin." },
    { "category": "Tavuk", "title": "Kremalı Tavuklu Makarna", "image": "", "ingredients": ["Penne", "Tavuk", "Krema"], "instructions": "Makarnayı haşlayıp kremalı tavuk sosuyla harmanlayın." },

    // --- ARA SICAK (15) ---
    { "category": "Ara sıcak", "title": "Paçanga Böreği", "image": "", "ingredients": ["Pastırma", "Kaşar", "Yufka"], "instructions": "Yufkanın içine malzemeleri sarıp kızartın." },
    { "category": "Ara sıcak", "title": "Mücver", "image": "", "ingredients": ["Kabak", "Yumurta", "Un", "Dereotu"], "instructions": "Rendelenmiş kabağı diğer malzemelerle karıştırıp kaşıkla kızartın." },
    { "category": "Ara sıcak", "title": "Arnavut Ciğeri", "image": "", "ingredients": ["Kuzu ciğeri", "Soğan", "Sumak"], "instructions": "Ciğerleri unlayıp kızartın, sumaklı soğanla servis edin." },
    { "category": "Ara sıcak", "title": "Sigara Böreği", "image": "", "ingredients": ["Lor peyniri", "Yufka", "Maydanoz"], "instructions": "İnce rulo şeklinde sarıp bol yağda kızartın." },
    { "category": "Ara sıcak", "title": "İçli Köfte", "image": "", "ingredients": ["Bulgur", "Kıyma"], "instructions": "Bulgur hamurunun içine kıyma doldurup kızartın." },
    { "category": "Ara sıcak", "title": "Pastırmalı Humus", "image": "", "ingredients": ["Nohut", "Tahin", "Pastırma"], "instructions": "Sıcak humusun üzerine tereyağlı pastırma ekleyin." },
    { "category": "Ara sıcak", "title": "Kalamar Tava", "image": "", "ingredients": ["Kalamar halkaları", "Tarator sos"], "instructions": "Kalamarları sosa bulayıp kızgın yağda pişirin." },
    { "category": "Ara sıcak", "title": "Karides Güveç", "image": "", "ingredients": ["Ayıklanmış karides", "Mantar", "Kaşar"], "instructions": "Güveçte sebzelerle pişirip kaşar eritin." },
    { "category": "Ara sıcak", "title": "Fındık Lahmacun", "image": "", "ingredients": ["Kıyma", "Hamur"], "instructions": "Minik hamurların üzerine harç sürüp fırınlayın." },
    { "category": "Ara sıcak", "title": "Halloumi Izgara", "image": "", "ingredients": ["Hellim peyniri"], "instructions": "Peynirleri dilimleyip izli tavada kızartın." },
    { "category": "Ara sıcak", "title": "Kabak Çiçeği Dolması", "image": "", "ingredients": ["Kabak çiçeği", "Pirinç"], "instructions": "Çiçekleri pirinçli harçla doldurup zeytinyağında pişirin." },
    { "category": "Ara sıcak", "title": "Peynirli Kroket", "image": "", "ingredients": ["Peynir karışımı", "Pane harcı"], "instructions": "Top şekli verip galeta ununa bulayıp kızartın." },
    { "category": "Ara sıcak", "title": "Sıcak Ot Kavurma", "image": "", "ingredients": ["Ebegümeci", "Yoğurt"], "instructions": "Otları soğanla kavurup üzerine yoğurt gezdirin." },
    { "category": "Ara sıcak", "title": "Kadınbudu Köfte", "image": "", "ingredients": ["Pirinç", "Kıyma", "Yumurta"], "instructions": "Haşlanmış pirinçli köfteleri yumurtaya bulayıp kızartın." },
    { "category": "Ara sıcak", "title": "Fırın Mantar", "image": "", "ingredients": ["Mantar", "Tereyağı", "Kaşar"], "instructions": "Mantarların içine tereyağı ve kaşar koyup fırınlayın." },

    // --- SALATA (15) ---
    { "category": "Salata", "title": "Gavurdağı", "image": "", "ingredients": ["Ceviz", "Domates", "Nar ekşisi"], "instructions": "Tüm malzemeyi incecik doğrayıp cevizle harmanlayın." },
    { "category": "Salata", "title": "Çoban Salatası", "image": "", "ingredients": ["Salatalık", "Domates", "Biber"], "instructions": "Küçük küpler halinde doğrayıp limon ve yağ ekleyin." },
    { "category": "Salata", "title": "Sezar Salata", "image": "", "ingredients": ["Marul", "Tavuk", "Kruton"], "instructions": "Marulun üzerine tavuk ve sosu ekleyin." },
    { "category": "Salata", "title": "Akdeniz Salatası", "image": "", "ingredients": ["Beyaz peynir", "Zeytin", "Yeşillik"], "instructions": "Yeşillikleri peynir ve zeytinle karıştırın." },
    { "category": "Salata", "title": "Piyaz", "image": "", "ingredients": ["Kuru fasulye", "Tahin", "Yumurta"], "instructions": "Fasulyeleri tahinli sos ve soğanla karıştırın." },
    { "category": "Salata", "title": "Roka Salatası", "image": "", "ingredients": ["Roka", "Parmesan", "Domates"], "instructions": "Rokaları balzamik sirke ve peynirle servis edin." },
    { "category": "Salata", "title": "Patates Salatası", "image": "", "ingredients": ["Patates", "Taze soğan", "Maydanoz"], "instructions": "Haşlanmış patatesleri yeşillik ve baharatla karıştırın." },
    { "category": "Salata", "title": "Semizotu Salatası", "image": "", "ingredients": ["Semizotu", "Yoğurt", "Sarımsak"], "instructions": "Semizotunu sarımsaklı yoğurtla karıştırın." },
    { "category": "Salata", "title": "Kısır", "image": "", "ingredients": ["İnce bulgur", "Salça", "Yeşillik"], "instructions": "Bulguru ıslatıp salça ve bol yeşillikle yoğurun." },
    { "category": "Salata", "title": "Börülce Salatası", "image": "", "ingredients": ["Deniz börülcesi", "Sarımsak", "Limon"], "instructions": "Börülceleri haşlayıp kılçıklarını ayıklayın ve soslayın." },
    { "category": "Salata", "title": "Ton Balıklı Salata", "image": "", "ingredients": ["Ton balığı", "Mısır", "Marul"], "instructions": "Yeşilliklerin üzerine mısır ve ton balığı ekleyin." },
    { "category": "Salata", "title": "Mevsim Salatası", "image": "", "ingredients": ["Lahana", "Havuç", "Marul"], "instructions": "Rendelenmiş sebzeleri sirkeli sosla karıştırın." },
    { "category": "Salata", "title": "Pancar Salatası", "image": "", "ingredients": ["Kırmızı pancar", "Sirke", "Sarımsak"], "instructions": "Pancarları haşlayıp sirkeli suda bekletin." },
    { "category": "Salata", "title": "Patlıcan Salatası", "image": "", "ingredients": ["Patlıcan", "Köz biber", "Zeytinyağı"], "instructions": "Közlenmiş sebzeleri doğrayıp yağ ve limonla karıştırın." },
    { "category": "Salata", "title": "Buğday Salatası", "image": "", "ingredients": ["Aşurelik buğday", "Mısır", "Köz biber"], "instructions": "Haşlanmış buğdayı garnitürlerle birleştirin." },

    // --- SEBZE (15) ---
    { "category": "Sebze", "title": "Zeytinyağlı Enginar", "image": "", "ingredients": ["Enginar", "Garnitür", "Dereotu"], "instructions": "Enginarları garnitürle zeytinyağında pişirin." },
    { "category": "Sebze", "title": "Taze Fasulye", "image": "", "ingredients": ["Fasulye", "Domates", "Zeytinyağı"], "instructions": "Fasulyeleri domatesli sosla ağır ateşte pişirin." },
    { "category": "Sebze", "title": "İmambayıldı", "image": "", "ingredients": ["Patlıcan", "Bol soğan", "Domates"], "instructions": "Patlıcanları soğanlı harçla doldurup zeytinyağında pişirin." },
    { "category": "Sebze", "title": "Türlü", "image": "", "ingredients": ["Karışık sebze", "Salça"], "instructions": "Tüm sebzeleri tencerede harmanlayıp pişirin." },
    { "category": "Sebze", "title": "Yaprak Sarma", "image": "", "ingredients": ["Asma yaprağı", "Pirinç", "Baharat"], "instructions": "Pirinçli harcı yapraklara sarıp zeytinyağında pişirin." },
    { "category": "Sebze", "title": "Kabak Dolması", "image": "", "ingredients": ["Kabak", "Kıyma", "Pirinç"], "instructions": "Kabakların içini doldurup yoğurtla servis edin." },
    { "category": "Sebze", "title": "Pırasa", "image": "", "ingredients": ["Pırasa", "Havuç", "Pirinç"], "instructions": "Pırasaları havuçla zeytinyağında soteleyin." },
    { "category": "Sebze", "title": "Ispanak", "image": "", "ingredients": ["Ispanak", "Yumurta", "Yoğurt"], "instructions": "Ispanakları kavurup üzerine yumurta kırın." },
    { "category": "Sebze", "title": "Biber Dolması", "image": "", "ingredients": ["Dolmalık biber", "Pirinç", "Kuş üzümü"], "instructions": "Biberleri harçla doldurup tencerede pişirin." },
    { "category": "Sebze", "title": "Bamya", "image": "", "ingredients": ["Bamya", "Limon suyu", "Domates"], "instructions": "Bamyaları salyalanmaması için limonlu suda pişirin." },
    { "category": "Sebze", "title": "Bezelye", "image": "", "ingredients": ["Bezelye", "Patates", "Havuç"], "instructions": "Sebzeleri salçalı suda yumuşayana kadar pişirin." },
    { "category": "Sebze", "title": "Şakşuka", "image": "", "ingredients": ["Patlıcan", "Patates", "Domates sosu"], "instructions": "Kızarmış sebzelerin üzerine sarımsaklı domates sosu dökün." },
    { "category": "Sebze", "title": "Brokoli Graten", "image": "", "ingredients": ["Brokoli", "Beşamel sos", "Peynir"], "instructions": "Haşlanmış brokoliye sos ekleyip fırınlayın." },
    { "category": "Sebze", "title": "Karnabahar Kızartması", "image": "", "ingredients": ["Karnabahar", "Yoğurt", "Yumurta"], "instructions": "Karnabaharları haşlayıp paneleyerek kızartın." },
    { "category": "Sebze", "title": "Mantarlı Ispanak Kavurma", "image": "", "ingredients": ["Mantar", "Ispanak", "Soğan"], "instructions": "Mantarları ve ıspanakları yüksek ateşte soteleyin." },

    // --- TATLILAR (15) ---
    { "category": "Tatlılar", "title": "Baklava", "image": "", "ingredients": ["Yufka", "Antep fıstığı", "Şerbet"], "instructions": "İnce yufkaları fıstıkla dizip pişirin ve soğuk şerbet dökün." },
    { "category": "Tatlılar", "title": "Sütlaç", "image": "", "ingredients": ["Süt", "Pirinç", "Şeker"], "instructions": "Pirinçleri haşlayıp süt ve şekerle kıvam alana kadar pişirin." },
    { "category": "Tatlılar", "title": "Künefe", "image": "", "ingredients": ["Kadayıf", "Peynir", "Şerbet"], "instructions": "Kadayıfları peynirle kızartıp üzerine sıcak şerbet dökün." },
    { "category": "Tatlılar", "title": "Revani", "image": "", "ingredients": ["İrmik", "Yoğurt", "Şerbet"], "instructions": "Keki pişirip dilimleyin ve şerbetini verin." },
    { "category": "Tatlılar", "title": "Güllaç", "image": "", "ingredients": ["Güllaç yaprağı", "Süt", "Ceviz"], "instructions": "Yaprakları şekerli sütle ıslatıp arasına ceviz koyun." },
    { "category": "Tatlılar", "title": "İrmik Helvası", "image": "", "ingredients": ["İrmik", "Tereyağı", "Çam fıstığı"], "instructions": "İrmiği tereyağında kavurup sütlü şerbetle demlendirin." },
    { "category": "Tatlılar", "title": "Kazandibi", "image": "", "ingredients": ["Süt", "Nişasta", "Pudra şekeri"], "instructions": "Muhallebiyi tepside yakarak karamelize edin." },
    { "category": "Tatlılar", "title": "Şekerpare", "image": "", "ingredients": ["Un", "Fındık", "Şerbet"], "instructions": "Hamurları yuvarlayıp fırınlayın ve şerbetle buluşturun." },
    { "category": "Tatlılar", "title": "Trileçe", "image": "", "ingredients": ["Üç çeşit süt", "Karamel", "Kek"], "instructions": "Keki sütlü karışımla ıslatıp üzerine karamel sürün." },
    { "category": "Tatlılar", "title": "Profiterol", "image": "", "ingredients": ["Şu hamuru", "Krema", "Çikolata sos"], "instructions": "Hamurların içine krema doldurup sos dökün." },
    { "category": "Tatlılar", "title": "Kemalpaşa", "image": "", "ingredients": ["Peynir tatlısı", "Şerbet", "Tahin"], "instructions": "Kurabiye şeklindeki peynir tatlılarını şerbette haşlayın." },
    { "category": "Tatlılar", "title": "Lokma", "image": "", "ingredients": ["Maya", "Un", "Şerbet"], "instructions": "Hamurları yağda kızartıp hemen şerbete atın." },
    { "category": "Tatlılar", "title": "Kabak Tatlısı", "image": "", "ingredients": ["Balkabağı", "Şeker", "Ceviz"], "instructions": "Kabakları şekerle kendi suyunda pişirip cevizle servis edin." },
    { "category": "Tatlılar", "title": "Tavukgöğsü", "image": "", "ingredients": ["Süt", "Damla sakızı", "Tavuk lifi"], "instructions": "Gerçek tavuk liflerini sütlü muhallebiyle döverek pişirin." },
    { "category": "Tatlılar", "title": "Keşkül", "image": "", "ingredients": ["Süt", "Badem", "Hindistan cevizi"], "instructions": "Bademli sütlü muhallebiyi pişirip kâselere paylaştırın." }
];

// Node 18+ (v22 de dahil) fetch API destekler.
async function fetchImageFromTheMealDB(title) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${title}`);
        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
            return data.meals[0].strMealThumb;
        }
    } catch (error) {
        console.error(`Error fetching image for ${title}:`, error);
    }
    return "";
}

async function upload() {
    const colRef = collection(db, "recipes");

    for (const recipe of recipes) {
        try {
            let imageUrl = recipe.image;
            if (!imageUrl) {
                console.log(`Fetching image for: ${recipe.title}`);
                const fetchedImage = await fetchImageFromTheMealDB(recipe.title);
                if (fetchedImage) {
                    imageUrl = fetchedImage;
                    console.log(`Found image for ${recipe.title}`);
                } else {
                    console.log(`No image found for ${recipe.title}, keeping empty.`);
                }
            }

            const docData = {
                ...recipe,
                image: imageUrl,
                createdAt: new Date().toISOString()
            };

            await addDoc(colRef, docData);
            console.log(`Uploaded: ${recipe.title}`);

            // Add a small delay to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 200));

        } catch (e) {
            console.error(`Error uploading ${recipe.title}:`, e);
        }
    }
}

upload();
