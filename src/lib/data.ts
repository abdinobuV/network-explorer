export type TopoKey = "bus" | "ring" | "star";

export interface TopoInfo {
  key: TopoKey;
  level: string;
  title: string;
  desc: string;
  long: string;
  cara: string[];
  kelebihan: string[];
  kekurangan: string[];
  cek: { q: string; a: string };
}

export const TOPOLOGI: Record<TopoKey, TopoInfo> = {
  bus: {
    key: "bus",
    level: "Level 1 • Studi Topologi Dasar",
    title: "Topologi Bus",
    desc: "Semua komputer terhubung ke satu kabel utama (backbone). Data dikirim sepanjang jalur, dan setiap PC memeriksa apakah paket itu untuknya.",
    long: "Semua komputer terhubung ke satu kabel utama (backbone). Data dikirim sepanjang jalur, dan setiap PC memeriksa apakah paket itu untuknya.",
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
  },
  ring: {
    key: "ring",
    level: "Level 2 • Studi Topologi Dasar",
    title: "Topologi Ring",
    desc: "Komputer tersambung membentuk lingkaran tertutup. Data berjalan satu arah dari satu PC ke PC berikutnya hingga sampai di tujuan.",
    long: "Komputer tersambung membentuk lingkaran tertutup. Data berjalan satu arah dari satu PC ke PC berikutnya hingga sampai di tujuan.",
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
  },
  star: {
    key: "star",
    level: "Level 3 • Studi Topologi Dasar",
    title: "Topologi Star",
    desc: "Semua PC terhubung ke satu Switch pusat. Switch meneruskan data langsung ke PC tujuan, sehingga setiap PC punya kabel sendiri.",
    long: "Semua PC terhubung ke satu Switch pusat. Switch meneruskan data langsung ke PC tujuan, sehingga setiap PC punya kabel sendiri.",
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
  },
};

export interface QuizQ {
  id: number;
  tag: string;
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
