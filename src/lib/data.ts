export type TopoKey = "bus" | "ring" | "star";

export interface TopoInfo {
  key: TopoKey;
  level: string;
  title: string;
  /** Tagline singkat untuk kartu. */
  desc: string;
  /** Paragraf penjelasan bab. */
  long: string;
  /** Analogi dunia nyata. */
  analogi: string;
  cara: string[];
  kelebihan: string[];
  kekurangan: string[];
  cek: { q: string; a: string };
  video: { id: string; start: number; title: string; channel: string; watchUrl: string };
}

// Satu video untuk ketiga materi (WhiteboardDoodles, Bahasa Inggris —
// aktifkan subtitle Indonesia via tombol CC), mulai otomatis di chapter tiap topologi.
const VIDEO_BASE = {
  id: "fS9vZewbCs4",
  title: "Network Topologies Explained: Bus, Star, Ring & More",
  channel: "WhiteboardDoodles (YouTube)",
  watchUrl: "https://www.youtube.com/watch?v=fS9vZewbCs4",
};

export const TOPOLOGI: Record<TopoKey, TopoInfo> = {
  bus: {
    key: "bus",
    level: "Level 1 • Studi Topologi Dasar",
    title: "Topologi Bus",
    desc: "Satu kabel utama, semua komputer berbagi.",
    long: "Semua komputer terhubung ke satu kabel utama (backbone). Data dikirim sepanjang jalur, dan setiap PC memeriksa apakah paket itu untuknya.",
    analogi: "Satu jalan utama yang dilalui banyak kendaraan: begitu jalan itu terputus, semua kendaraan ikut terputus.",
    cara: [
      "Data dikirim ke backbone dan merambat ke kedua arah.",
      "Tiap PC memeriksa alamat tujuan paket.",
      "Terminator di kedua ujung menyerap sinyal agar tidak memantul.",
    ],
    kelebihan: ["Kabel hemat, instalasi mudah", "Cocok untuk jaringan kecil", "Biaya rendah"],
    kekurangan: ["Backbone putus: seluruh jaringan mati", "Rawan tabrakan data saat ramai", "Gangguan sulit dilacak"],
    cek: {
      q: "Jika kabel utama (backbone) putus di tengah, apa dampaknya pada jaringan?",
      a: "Segmen terbelah — PC di sisi berbeda tidak bisa saling berkomunikasi karena tidak ada jalur alternatif. Itulah kelemahan single point of failure pada Bus.",
    },
    video: { ...VIDEO_BASE, start: 88 },
  },
  ring: {
    key: "ring",
    level: "Level 2 • Studi Topologi Dasar",
    title: "Topologi Ring",
    desc: "Lingkaran tertutup, data mengalir satu arah.",
    long: "Komputer tersambung membentuk lingkaran tertutup. Data berjalan satu arah dari satu PC ke PC berikutnya hingga sampai di tujuan.",
    analogi: "Lingkaran rel kereta api: kereta berjalan searah jarum jam dan seluruh jalur berhenti bila satu ruas rel rusak.",
    cara: [
      "Paket data berjalan searah jarum jam.",
      "Tiap PC meneruskan paket ke tetangga berikutnya.",
      "Pada Token Ring, hanya pemegang token yang boleh mengirim.",
    ],
    kelebihan: ["Aliran data teratur, minim tabrakan", "Performa stabil saat beban tinggi", "Giliran kirim jelas"],
    kekurangan: ["Satu PC/kabel putus: aliran terhenti", "Menambah PC mengganggu jaringan", "Gangguan sulit dilacak"],
    cek: {
      q: "Mengapa topologi Ring jarang mengalami tabrakan data dibanding topologi Bus?",
      a: "Karena pengiriman diatur bergiliran (token / urutan ring). Hanya satu pengirim dalam satu waktu, tidak seperti Bus yang medianya diperebutkan bersama.",
    },
    video: { ...VIDEO_BASE, start: 276 },
  },
  star: {
    key: "star",
    level: "Level 3 • Studi Topologi Dasar",
    title: "Topologi Star",
    desc: "Semua komputer tersambung ke satu switch pusat.",
    long: "Semua PC terhubung ke satu Switch pusat. Switch meneruskan data langsung ke PC tujuan, sehingga setiap PC punya kabel sendiri.",
    analogi: "Kantor pos: semua surat masuk ke satu meja sortir, lalu disalurkan ke alamat yang tepat. Satu meja tumbang? Semua surat tertahan.",
    cara: [
      "PC mengirim data ke Switch pusat.",
      "Switch memeriksa tujuan dan meneruskan hanya ke PC itu.",
      "Kabel terpisah membuat gangguan terisolasi.",
    ],
    kelebihan: ["Kabel PC putus tidak mematikan jaringan", "Mudah ditambah dan dikelola", "Gangguan mudah dilacak"],
    kekurangan: ["Switch rusak: seluruh jaringan mati", "Butuh lebih banyak kabel", "Biaya perangkat lebih tinggi"],
    cek: {
      q: "Jika kabel PC-03 putus, PC mana saja yang masih bisa saling berkomunikasi?",
      a: "Semua PC lain (PC-01, 02, 04, 05) tetap bisa berkomunikasi via Switch. Hanya PC-03 yang terisolasi — keunggulan isolasi gangguan pada Star.",
    },
    video: { ...VIDEO_BASE, start: 176 },
  },
};

export type ConceptKey = "bus" | "ring" | "star" | "troubleshooting";

export const CONCEPT_META: Record<
  ConceptKey,
  { label: string; short: string; materiHref: string; praktikHref: string; sandboxHref: string }
> = {
  bus: {
    label: "Topologi Bus & Backbone",
    short: "Bus",
    materiHref: "/materi/bus",
    praktikHref: "/praktik/bus",
    sandboxHref: "/sandbox/bus",
  },
  ring: {
    label: "Topologi Ring & Token",
    short: "Ring",
    materiHref: "/materi/ring",
    praktikHref: "/praktik/ring",
    sandboxHref: "/sandbox/ring",
  },
  star: {
    label: "Topologi Star & Switch",
    short: "Star",
    materiHref: "/materi/star",
    praktikHref: "/praktik/star",
    sandboxHref: "/sandbox/star",
  },
  troubleshooting: {
    label: "Diagnostik & Pengujian (Ping)",
    short: "Diagnostik",
    materiHref: "/perbandingan",
    praktikHref: "/praktik/star",
    sandboxHref: "/sandbox/star",
  },
};

export interface QuizQ {
  id: number;
  tag: string;
  concept: ConceptKey;
  q: string;
  case: string;
  options: string[];
  answer: number;
  explain: string;
}

export const QUIZ: QuizQ[] = [
  {
    id: 1,
    tag: "Analisis kasus • Topologi Star",
    concept: "star",
    q: "Apa yang terjadi jika switch pusat gagal?",
    case: "Sebuah laboratorium memiliki 12 PC dalam topologi Star dengan satu switch. Semua kabel dan PC berfungsi baik, tetapi switch pusat mati total. Tidak ada jalur atau perangkat cadangan. Apa dampaknya pada komunikasi antar-PC?",
    options: [
      "Hanya satu PC yang kehilangan koneksi, sedangkan PC lain tetap saling berkomunikasi.",
      "Semua PC yang terhubung ke switch tersebut tidak dapat saling berkomunikasi melalui jaringan itu.",
      "Paket data tetap sampai karena setiap PC otomatis menjadi pengganti switch.",
      "Komunikasi antar-PC tetap normal; hanya akses internet yang terpengaruh.",
    ],
    answer: 1,
    explain: "Switch adalah titik pusat Star. Jika mati, tidak ada penerus frame — seluruh komunikasi via switch berhenti.",
  },
  {
    id: 2,
    tag: "Konsep • Topologi Ring",
    concept: "ring",
    q: "Mengapa satu kabel putus melumpuhkan Ring tunggal?",
    case: "Lima PC membentuk Ring searah jarum jam. Kabel antara PC-03 dan PC-04 putus. Apa yang terjadi pada aliran data?",
    options: [
      "Aliran tetap normal karena data memantul kembali.",
      "Aliran terhenti karena jalur melingkar terputus dan tidak ada jalur alternatif.",
      "Hanya PC-03 yang mati, sisanya membentuk Star otomatis.",
      "Switch pusat mengambil alih dan membentuk Bus.",
    ],
    answer: 1,
    explain: "Ring tunggal hanya punya satu jalur melingkar. Satu titik putus = lingkaran terbuka = paket tidak sampai.",
  },
  {
    id: 3,
    tag: "Studi kasus • Pemilihan topologi",
    concept: "star",
    q: "Lab sekolah butuh satu PC rusak tidak melumpuhkan lab. Topologi yang tepat?",
    case: "Sebuah laboratorium sekolah membutuhkan 24 PC. Jika satu kabel/komputer mengalami gangguan, komputer lain di lab harus tetap dapat berkomunikasi. Topologi yang tepat?",
    options: [
      "Topologi Bus karena jalurnya lurus dan hemat.",
      "Topologi Star karena setiap node memiliki kabel sendiri ke switch; gangguan terisolasi.",
      "Topologi Ring karena pola memutar menyeimbangkan beban.",
      "Tanpa topologi, hubungkan acak saja.",
    ],
    answer: 1,
    explain: "Topologi Star menggunakan Switch sebagai pusat distribusi data. Jika salah satu kabel PC rusak, sisa PC lainnya masih bisa berkomunikasi dengan aman!",
  },
  {
    id: 4,
    tag: "Konsep • Topologi Bus",
    concept: "bus",
    q: "Apa fungsi terminator pada ujung backbone?",
    case: "Pada topologi Bus terdapat perangkat kecil di kedua ujung kabel utama. Apa fungsinya?",
    options: [
      "Memperkuat sinyal agar berputar.",
      "Menyerap sinyal agar tidak memantul kembali dan mengganggu data.",
      "Menyimpan paket data sementara.",
      "Menggantikan switch pusat.",
    ],
    answer: 1,
    explain: "Terminator menyerap sinyal di ujung backbone agar tidak terjadi refleksi yang merusak paket.",
  },
  {
    id: 5,
    tag: "Analisis • Collision",
    concept: "bus",
    q: "Kapan collision paling rawan terjadi?",
    case: "Dua PC mengirim bersamaan pada media bersama tanpa pengaturan giliran. Topologi dan kondisi apa ini?",
    options: [
      "Star dengan switch full-duplex.",
      "Bus saat ramai — media bersama diperebutkan, sinyal bertabrakan.",
      "Ring dengan token — sudah bergiliran.",
      "Tidak pernah terjadi di jaringan kabel.",
    ],
    answer: 1,
    explain: "Media bersama Bus rentan collision saat ramai. Star-switch full-duplex dan Ring-token menghindarinya.",
  },
  {
    id: 6,
    tag: "Perangkat • Switch",
    concept: "star",
    q: "Bagaimana switch meneruskan frame?",
    case: "Switch menerima frame dari PC-01 untuk PC-04. Apa yang dilakukan switch yang sudah belajar alamat MAC?",
    options: [
      "Mengirim ke semua port selalu.",
      "Meneruskan unicast hanya ke port tujuan yang dikenal.",
      "Memutus semua kabel lain.",
      "Mengubah topologi menjadi Ring.",
    ],
    answer: 1,
    explain: "Switch belajar alamat MAC dan meneruskan unicast yang dikenal hanya ke port tujuan — efisien.",
  },
  {
    id: 7,
    tag: "Pengujian • Ping",
    concept: "troubleshooting",
    q: "Ping tidak mendapat balasan — langkah pertama?",
    case: "Ping dari PC-01 ke PC-03 gagal 100%. Apa pemeriksaan yang paling tepat lebih dulu?",
    options: [
      "Langsung ganti semua kabel lab.",
      "Periksa sambungan dan perangkat pusat, lalu alamat IP; ingat balasan juga bisa diblokir firewall.",
      "Hapus sistem operasi.",
      "Tambah 10 PC lagi.",
    ],
    answer: 1,
    explain: "Urutkan: fisik (kabel/port/switch) → logis (IP) → kebijakan (firewall/ICMP diblokir). Gagal ping bukan selalu kabel putus.",
  },
  {
    id: 8,
    tag: "Istilah • Backbone",
    concept: "bus",
    q: "Apa yang dimaksud backbone pada Bus klasik?",
    case: "Guru menyebut 'backbone putus, seluruh segmen lumpuh'. Apa itu backbone?",
    options: [
      "Kabel utama bersama yang dipakai semua node.",
      "Kabel dari PC ke switch pada Star.",
      "Lingkaran token pada Ring.",
      "Nama lain alamat IP.",
    ],
    answer: 0,
    explain: "Backbone = jalur utama yang menghubungkan bagian jaringan; pada Bus klasik berupa kabel bersama.",
  },
  {
    id: 9,
    tag: "Biaya & kebutuhan • Star vs Bus",
    concept: "star",
    q: "Mengapa Star butuh lebih banyak kabel dibanding Bus?",
    case: "Untuk 12 PC, perkiraan kebutuhan kabel Star vs Bus?",
    options: [
      "Star butuh 1 kabel total, Bus butuh 12.",
      "Star butuh kabel UTP per node ke switch (+ uplink/cadangan); Bus berbagi satu backbone.",
      "Keduanya sama persis selalu.",
      "Ring tidak butuh kabel sama sekali.",
    ],
    answer: 1,
    explain: "Star: setiap node punya kabel ke perangkat pusat. Bus: hemat karena satu kabel utama bersama.",
  },
  {
    id: 10,
    tag: "Dampak gangguan • Ring ganda",
    concept: "ring",
    q: "Apa keunggulan ring ganda dibanding ring tunggal?",
    case: "Jaringan kritis memakai ring ganda (dua jalur berlawanan arah). Apa manfaatnya saat satu jalur putus?",
    options: [
      "Tidak ada manfaat, sama saja.",
      "Punya jalur cadangan — aliran dapat dialihkan sehingga tetap berjalan.",
      "Otomatis berubah menjadi Star tanpa switch.",
      "Menghilangkan kebutuhan alamat IP.",
    ],
    answer: 1,
    explain: "Ring ganda menyediakan redundansi: saat satu jalur putus, trafik diputar ke jalur cadangan.",
  },
];

/** Latihan adaptif singkat per konsep (dipakai oleh Prescriptive Analytics / Adaptive Learning). */
export interface AdaptiveDrillQ {
  id: string;
  concept: ConceptKey;
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export const ADAPTIVE_DRILLS: Record<ConceptKey, AdaptiveDrillQ[]> = {
  bus: [
    {
      id: "drill-bus-1",
      concept: "bus",
      q: "Mengapa ujung kabel backbone pada topologi Bus wajib dipasang terminator?",
      options: [
        "Agar sinyal diserap dan tidak memantul kembali merusak paket data.",
        "Agar setiap PC mendapat alamat IP otomatis.",
        "Agar data berputar satu arah seperti cincin.",
      ],
      answer: 0,
      explain: "Tanpa terminator, sinyal listrik memantul di ujung kabel (signal reflection) sehingga mengganggu transmisi.",
    },
    {
      id: "drill-bus-2",
      concept: "bus",
      q: "Saat memasang kabel pada topologi Bus, setiap PC harus tersambung ke mana?",
      options: [
        "Langsung ke PC tetangga searah jarum jam.",
        "Ke satu kabel utama (backbone).",
        "Ke switch pusat secara terpisah.",
      ],
      answer: 1,
      explain: "Ciri khas Bus adalah satu jalur utama bersama (backbone) yang menghubungkan semua node.",
    },
    {
      id: "drill-bus-3",
      concept: "bus",
      q: "Apa risiko utama jika 30 PC aktif mengirim data bersamaan di topologi Bus?",
      options: [
        "Collision (tabrakan data) meningkat karena media dipakai bersama.",
        "Kabel otomatis berubah menjadi Ring ganda.",
        "Tidak ada dampak karena setiap PC punya jalur eksklusif.",
      ],
      answer: 0,
      explain: "Media bersama membuat trafik padat rawan tabrakan data sehingga performa menurun drastis.",
    },
  ],
  ring: [
    {
      id: "drill-ring-1",
      concept: "ring",
      q: "Bagaimana arah aliran data pada topologi Ring tunggal standar?",
      options: [
        "Acak ke segala arah tanpa urutan.",
        "Satu arah (mis. searah jarum jam) dari satu node ke node berikutnya.",
        "Langsung dari PC pengirim ke switch lalu ke tujuan.",
      ],
      answer: 1,
      explain: "Data pada Ring mengalir berurutan satu arah mengelilingi cincin hingga tiba di node tujuan.",
    },
    {
      id: "drill-ring-2",
      concept: "ring",
      q: "Mengapa tabrakan data (collision) sangat jarang terjadi pada Token Ring?",
      options: [
        "Karena kabelnya paling pendek.",
        "Karena hanya pemegang token yang mendapat giliran mengirim data.",
        "Karena menggunakan switch 24 port.",
      ],
      answer: 1,
      explain: "Mekanisme token mengatur giliran kirim sehingga dua node tidak berebut media secara bersamaan.",
    },
    {
      id: "drill-ring-3",
      concept: "ring",
      q: "Apa solusi agar gangguan satu ruas kabel pada Ring tidak mematikan seluruh jaringan?",
      options: [
        "Menggunakan ring ganda (dual ring) sebagai jalur cadangan berlawanan arah.",
        "Melepas terminator di ujung kabel.",
        "Menonaktifkan alamat IP di semua PC.",
      ],
      answer: 0,
      explain: "Dual ring menyediakan jalur redundan sehingga lalu lintas dapat diputar balik saat satu ruas putus.",
    },
  ],
  star: [
    {
      id: "drill-star-1",
      concept: "star",
      q: "Jika kabel antara PC-02 dan Switch pada topologi Star putus, apa dampaknya?",
      options: [
        "Seluruh laboratorium mati total.",
        "Hanya PC-02 yang terisolasi; PC lain tetap terhubung melalui Switch.",
        "Switch otomatis memutus PC-01 dan PC-03.",
      ],
      answer: 1,
      explain: "Isolasi gangguan adalah keunggulan utama Star: tiap PC memiliki tautan dedicated ke switch.",
    },
    {
      id: "drill-star-2",
      concept: "star",
      q: "Apa single point of failure (titik kegagalan tunggal) pada topologi Star?",
      options: [
        "Kabel menuju satu komputer siswa.",
        "Switch atau perangkat pusat.",
        "Terminator di ujung kabel.",
      ],
      answer: 1,
      explain: "Karena seluruh trafik lewat perangkat pusat, kerusakan switch menghentikan komunikasi seluruh segmen.",
    },
    {
      id: "drill-star-3",
      concept: "star",
      q: "Bagaimana switch modern meneruskan frame ke alamat MAC yang sudah dikenalnya?",
      options: [
        "Broadcast ke semua port setiap saat.",
        "Unicast hanya ke port tempat perangkat tujuan berada.",
        "Memutarnya searah jarum jam lewat semua PC.",
      ],
      answer: 1,
      explain: "Switch menyimpan tabel alamat MAC sehingga frame diteruskan tepat ke port tujuan secara efisien.",
    },
  ],
  troubleshooting: [
    {
      id: "drill-ts-1",
      concept: "troubleshooting",
      q: "Perintah ping dari PC-01 ke PC-04 mengalami Request Timed Out. Urutan cek paling tepat adalah?",
      options: [
        "Cek sambungan fisik/kabel & switch → cek konfigurasi IP → cek firewall/ICMP.",
        "Langsung instal ulang sistem operasi PC-01.",
        "Ganti topologi Star menjadi Bus.",
      ],
      answer: 0,
      explain: "Troubleshooting sistematis selalu dimulai dari lapisan fisik, lalu konfigurasi logis (IP), lalu kebijakan firewall.",
    },
    {
      id: "drill-ts-2",
      concept: "troubleshooting",
      q: "Apakah ping gagal selalu berarti kabel jaringan putus secara fisik?",
      options: [
        "Ya, tidak ada penyebab lain.",
        "Tidak, balasan ICMP bisa diblokir firewall atau alamat IP berada di subnet berbeda.",
        "Ya, khusus pada topologi Star saja.",
      ],
      answer: 1,
      explain: "Koneksi fisik bisa sehat namun ping tetap gagal jika firewall memblokir ICMP Echo Reply atau IP salah.",
    },
    {
      id: "drill-ts-3",
      concept: "troubleshooting",
      q: "Sekolah ingin 30 PC lab mudah diperluas dan mudah dilacak saat ada gangguan. Topologi apa yang disarankan?",
      options: [
        "Topologi Bus karena hanya satu kabel.",
        "Topologi Star karena mudah ditambah port dan gangguan terisolasi per kabel.",
        "Topologi Ring tunggal karena mudah ditambah tanpa memutus jaringan.",
      ],
      answer: 1,
      explain: "Star paling mudah dikembangkan (cukup sambung ke port switch) dan troubleshooting gangguan paling cepat.",
    },
  ],
};

/** Kasus verifikasi output AI (Pert-12: Hallucination, Bias & Verify before cite). */
export interface HallucinationCase {
  id: string;
  judul: string;
  promptSiswa: string;
  outputAi: string;
  jenisMasalah: "Hallucination Teknis" | "Referensi Palsu" | "Pencampuran Konsep";
  temuanKeliru: string;
  faktaBenar: string;
  langkahVerifikasi: string[];
}

export const HALLUCINATION_CASES: HallucinationCase[] = [
  {
    id: "hal-1",
    judul: "Klaim statistik dan sitasi penelitian fiktif",
    promptSiswa: "Berikan data penelitian terbaru tentang keunggulan topologi Bus dibanding Star untuk lab sekolah.",
    outputAi:
      "Menurut penelitian Wijaya & Smith (2025) di Journal of School Networking (hal. 112–119), topologi Bus meningkatkan kecepatan lab sekolah sebesar 64,8% dan kebal terhadap gangguan kabel putus karena memiliki jalur otomatis.",
    jenisMasalah: "Referensi Palsu",
    temuanKeliru:
      "Artikel 'Wijaya & Smith (2025)' dan angka '64,8%' adalah sitasi fiktif, dan klaim Bus 'kebal kabel putus' bertentangan dengan fakta teknis.",
    faktaBenar:
      "Pada topologi Bus, jika backbone putus maka segmen terbelah dan komunikasi lumpuh (single point of failure). Selalu terapkan prinsip Verify before cite: cek DOI, penulis, dan sumber asli.",
    langkahVerifikasi: [
      "Periksa apakah jurnal dan artikel 'Wijaya & Smith (2025)' benar-benar ada di Google Scholar / DOI.",
      "Cocokkan klaim teknis dengan modul Topologi Bus dan hasil simulasi cabut kabel di Sandbox.",
      "Jangan pernah menyalin angka atau sitasi dari AI tanpa membaca sumber primernya.",
    ],
  },
  {
    id: "hal-2",
    judul: "Pencampuran cara kerja Terminator dan Switch",
    promptSiswa: "Jelaskan peran terminator di topologi Star dan cara kerjanya.",
    outputAi:
      "Pada topologi Star, setiap ujung kabel UTP dipasangi terminator untuk menyimpan tabel alamat MAC dan meneruskan paket data secara bergiliran menggunakan token.",
    jenisMasalah: "Pencampuran Konsep",
    temuanKeliru:
      "AI mencampur tiga konsep dari tiga topologi berbeda: terminator (Bus), tabel MAC (Switch pada Star), dan token (Token Ring).",
    faktaBenar:
      "Terminator hanya dipakai di kedua ujung backbone pada Bus klasik untuk menyerap sinyal. Pada Star, penerusan frame berbasis alamat MAC dilakukan oleh Switch pusat.",
    langkahVerifikasi: [
      "Bandingkan dengan tabel di halaman Perbandingan (/perbandingan) dan Glosarium (/glosarium).",
      "Pisahkan peran masing-masing perangkat: Terminator → Bus, Token → Ring, Switch → Star.",
    ],
  },
  {
    id: "hal-3",
    judul: "Konfigurasi teknis keliru pada Ring tunggal",
    promptSiswa: "Jika kabel antara PC-02 dan PC-03 pada Ring tunggal putus, apakah PC-01 masih bisa ping PC-04?",
    outputAi:
      "Ya, pada topologi Ring tunggal data otomatis berbalik arah ke jalur berlawanan sehingga PC-01 tetap dapat melakukan ping ke PC-04 dengan latensi normal.",
    jenisMasalah: "Hallucination Teknis",
    temuanKeliru:
      "AI mengira Ring tunggal memiliki jalur cadangan otomatis, padahal fitur pengalihan arah hanya dimiliki Ring ganda (dual ring).",
    faktaBenar:
      "Pada Ring tunggal, aliran data hanya satu arah. Satu kabel putus membuka cincin dan menghentikan seluruh komunikasi.",
    langkahVerifikasi: [
      "Uji langsung di Sandbox Ring (/sandbox/ring): cabut kabel PC-02 → PC-03 lalu tekan Kirim data (ping).",
      "Amati log jaringan yang menunjukkan Timeout / tidak ada jalur tersedia.",
    ],
  },
];

export interface Glossary {
  term: string;
  cat: string;
  def: string;
  ex: string;
}

export const GLOSSARY: Glossary[] = [
  { term: "Node", cat: "Perangkat", def: "Titik atau perangkat yang terhubung dalam jaringan, misalnya komputer, printer, atau switch.", ex: "Contoh: PC-01 adalah satu node di laboratorium." },
  { term: "Backbone", cat: "Struktur jaringan", def: "Jalur utama yang menghubungkan bagian jaringan. Pada Bus klasik, berupa kabel bersama yang dipakai semua node.", ex: "Contoh: kabel utama pada diagram Bus." },
  { term: "Switch", cat: "Perangkat", def: "Perangkat yang menghubungkan node dalam LAN dan meneruskan frame berdasarkan alamat MAC.", ex: "Contoh: pusat penghubung 24 PC pada Star." },
  { term: "Paket data", cat: "Komunikasi", def: "Unit data berisi informasi dan bagian pengenal, seperti alamat sumber dan tujuan, untuk dikirim melalui jaringan.", ex: "Contoh: pesan dipecah menjadi paket saat dikirim." },
  { term: "Alamat IP", cat: "Komunikasi", def: "Alamat logis antarmuka perangkat dalam jaringan IP, digunakan untuk mengenali sumber dan tujuan paket.", ex: "Contoh: 192.168.1.2 pada PC-01." },
  { term: "Ping", cat: "Pengujian", def: "Perintah uji keterjangkauan yang mengirim ICMP Echo Request dan menunggu balasan dari tujuan.", ex: "Tidak ada balasan bisa berarti gangguan atau ICMP diblokir." },
  { term: "Topologi", cat: "Struktur jaringan", def: "Pola hubungan fisik atau logis antar-node dalam jaringan; memengaruhi jalur data dan dampak gangguan.", ex: "Contoh: Bus, Ring, dan Star." },
];
