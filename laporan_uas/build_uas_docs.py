# -*- coding: utf-8 -*-
"""Membangun dua berkas pengumpulan UAS TIK dalam Pendidikan (DOCX) Kelompok 3:
1. Dokumen_Proyek_UAS_Network_Explorer_Kelompok3.docx
2. Modul_Penggunaan_Multimedia_UAS_Network_Explorer_Kelompok3.docx
"""

import os
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
IMG = os.path.join(BASE, "gambar")
LOGO = os.path.join(ROOT, "laporan_uts", "gambar", "logo-unimed.png")

FONT = "Times New Roman"
PEACH = "F4B183"
PEACH_LIGHT = "F8CBAD"
YELLOW = "FFD966"
BLUE = "B5C7E8"
GREEN = "C6E0B4"


def new_doc():
    doc = Document()
    for s in doc.sections:
        s.page_width = Cm(21.0)
        s.page_height = Cm(29.7)
        s.top_margin = Cm(2.54)
        s.bottom_margin = Cm(2.54)
        s.left_margin = Cm(2.54)
        s.right_margin = Cm(2.54)
    st = doc.styles["Normal"]
    st.font.name = FONT
    st.font.size = Pt(12)
    st.element.rPr.rFonts.set(qn("w:eastAsia"), FONT)
    st.paragraph_format.line_spacing = 1.5
    st.paragraph_format.space_after = Pt(6)
    st.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    return doc


def shade(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), color)
    tcPr.append(shd)


def para(doc, text, bold=False, italic=False, align="justify", size=12, space_after=6):
    p = doc.add_paragraph()
    p.alignment = {
        "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
        "center": WD_ALIGN_PARAGRAPH.CENTER,
        "left": WD_ALIGN_PARAGRAPH.LEFT,
    }[align]
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(space_after)
    r = p.add_run(text)
    r.font.name = FONT
    r.font.size = Pt(size)
    r.bold = bold
    r.italic = italic
    return p


def heading(doc, code, title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.5
    r = p.add_run(f"{code}.  {title}")
    r.font.name = FONT
    r.font.size = Pt(12)
    r.bold = True
    return p


def subheading(doc, num, title):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.5
    r = p.add_run(f"{num}.  {title}")
    r.font.name = FONT
    r.font.size = Pt(12)
    r.bold = True
    return p


def bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(3)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.clear()
    if bold_prefix:
        r1 = p.add_run(bold_prefix)
        r1.font.name = FONT
        r1.font.size = Pt(12)
        r1.bold = True
    r2 = p.add_run(text)
    r2.font.name = FONT
    r2.font.size = Pt(12)
    return p


def numbered(doc, n, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Cm(0.75)
    p.paragraph_format.first_line_indent = Cm(-0.5)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(3)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r0 = p.add_run(f"{n}.  ")
    r0.font.name = FONT
    r0.font.size = Pt(12)
    if bold_prefix:
        r1 = p.add_run(bold_prefix)
        r1.font.name = FONT
        r1.font.size = Pt(12)
        r1.bold = True
    r2 = p.add_run(text)
    r2.font.name = FONT
    r2.font.size = Pt(12)
    return p


def make_table(doc, headers, rows, widths=None, header_color=PEACH):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(headers):
        c = t.cell(0, j)
        c.text = ""
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.font.name = FONT
        r.font.size = Pt(11)
        r.bold = True
        if header_color:
            shade(c, header_color)
    for i, row in enumerate(rows, start=1):
        for j, val in enumerate(row):
            c = t.cell(i, j)
            c.text = ""
            p = c.paragraphs[0]
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(val)
            r.font.name = FONT
            r.font.size = Pt(10.5)
    if widths:
        for j, w in enumerate(widths):
            for i in range(len(rows) + 1):
                t.cell(i, j).width = Cm(w)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return t


def add_image(doc, filename, caption, width_cm=14.5):
    path = os.path.join(IMG, filename)
    if os.path.exists(path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(path, width=Cm(width_cm))
        c = doc.add_paragraph()
        c.alignment = WD_ALIGN_PARAGRAPH.CENTER
        c.paragraph_format.space_after = Pt(8)
        r = c.add_run(caption)
        r.font.name = FONT
        r.font.size = Pt(10.5)
        r.italic = True
    else:
        para(doc, f"[Gambar {filename} belum tersedia]", italic=True, align="center")


def add_cover(doc, main_title, sub_title):
    para(doc, "UJIAN AKHIR SEMESTER (UAS)", bold=True, align="center", size=14)
    para(doc, main_title, bold=True, align="center", size=13)
    para(doc, sub_title, bold=True, align="center", size=12)
    para(doc, "Disusun Guna Memenuhi Tugas Akhir Mata Kuliah TIK dalam Pendidikan", italic=True, align="center")
    para(doc, "", size=10)
    para(doc, "Dosen Pengampu:", bold=True, align="center", space_after=2)
    para(doc, "Reni Rahmadani, S.Kom., M.Kom.", align="center", space_after=2)
    para(doc, "Prof. Dr. Sahat Siagian, M.Pd.", align="center")
    para(doc, "", size=8)
    if os.path.exists(LOGO):
        lp = doc.add_paragraph()
        lp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        lp.add_run().add_picture(LOGO, width=Cm(4.2))
    para(doc, "", size=8)
    para(doc, "Disusun Oleh:", bold=True, align="center", space_after=2)
    para(doc, "Kelompok 3", bold=True, align="center")

    t = doc.add_table(rows=5, cols=3)
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    cover_rows = [
        ("Nama", ":", "NIM"),
        ("Anggota 1 (Ketua)", ":", "525XXXXX01"),
        ("Anggota 2", ":", "525XXXXX02"),
        ("Anggota 3", ":", "525XXXXX03"),
        ("Anggota 4", ":", "525XXXXX04"),
    ]
    for i, (a, b, c) in enumerate(cover_rows):
        for j, v in enumerate((a, b, c)):
            cell = t.cell(i, j)
            cell.text = ""
            r = cell.paragraphs[0].add_run(v)
            r.font.name = FONT
            r.font.size = Pt(11.5)
            if i == 0:
                r.bold = True
    doc.add_paragraph()
    para(doc, "PROGRAM STUDI PENDIDIKAN TEKNOLOGI INFORMATIKA DAN KOMPUTER", bold=True, align="center", space_after=2)
    para(doc, "FAKULTAS TEKNIK", bold=True, align="center", space_after=2)
    para(doc, "UNIVERSITAS NEGERI MEDAN", bold=True, align="center", space_after=2)
    para(doc, "2026", bold=True, align="center")
    doc.add_page_break()


# =============================================================================
# 1. DOKUMEN PROYEK UAS
# =============================================================================
def build_dokumen_proyek():
    doc = new_doc()
    add_cover(
        doc,
        "DOKUMEN PROYEK PENGEMBANGAN MULTIMEDIA INTERAKTIF",
        "INTEGRASI LEARNING ANALYTICS, DASHBOARD, DAN GENERATIVE AI PADA NETWORK EXPLORER",
    )

    para(doc, "NETWORK EXPLORER: MISI TOPOLOGI BERBASIS LEARNING ANALYTICS & RESPONSIBLE AI", bold=True, align="center")

    # A. Identitas Proyek
    heading(doc, "A", "Identitas Proyek")
    make_table(
        doc,
        ["Komponen", "Keterangan"],
        [
            ["Nama proyek", "Network Explorer: Misi Topologi (Versi UAS — Learning Analytics & Responsible AI)"],
            ["Mata pelajaran & materi", "Informatika SMA Kelas XI — Topologi Jaringan Bus, Ring, Star & Diagnostik Ping"],
            ["Pengembangan dari UTS", "Menambahkan perekaman 8 Learning Data, Dashboard Learning Analytics 4-tingkat, Latihan Adaptif, Asisten Belajar AI (Pert-12), dan Sertifikat Kompetensi Berbasis Proses"],
            ["Teknologi", "Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, @dnd-kit, Firebase Auth & Firestore, SVG Charts, Vitest, Playwright"],
            ["Tautan aplikasi", "https://network-explorer-xi.vercel.app/"],
            ["Akun demo evaluasi", "navigator@example.com / password123 (Mode demo berjalan offline tanpa server)"],
        ],
        widths=[4.6, 11.3],
        header_color=PEACH,
    )

    # B. Ringkasan Peningkatan dari UTS ke UAS
    heading(doc, "B", "Latar Belakang & Peningkatan dari Prototype UTS ke UAS")
    para(doc, "Pada tahap UTS, Kelompok 3 telah membangun prototype multimedia interaktif Network Explorer yang memuat tiga bab materi topologi (Bus, Ring, Star), papan pemasangan kabel berbasis drag-and-drop dengan aturan validasi berbeda per topologi, Sandbox simulasi ping dan uji cabut kabel, kuis 10 studi kasus, serta rapor cetak.")
    para(doc, "Untuk memenuhi tantangan UAS mata kuliah TIK dalam Pendidikan (menerapkan materi Pertemuan 12: AI & Generative AI dalam Pendidikan serta Pertemuan 13: Learning Analytics), prototype UTS dikembangkan lebih jauh agar tidak sekadar menyajikan materi dan nilai akhir, tetapi merekam jejak belajar digital (digital traces), menganalisis pola kesulitan secara diagnostik, memberi peringatan dini secara etis tanpa pelabelan negatif, menghasilkan rekomendasi latihan adaptif personal, serta menyediakan pendampingan AI yang kritis dan transparan.")

    # C. Penentuan Learning Data (Minimal 5 -> Kami Menerapkan 8)
    heading(doc, "C", "Penentuan Learning Data yang Dicatat (8 Data Pembelajaran Relevan)")
    para(doc, "Sesuai ketentuan UAS (minimal 5 data pembelajaran relevan) dan prinsip menghindari vanity metrics (angka mentah seperti jumlah klik acak yang tidak membantu keputusan), sistem Network Explorer mencatat 8 jenis Learning Data bermakna berikut:")
    make_table(
        doc,
        ["No", "Learning Data", "Kategori", "Lokasi Perekaman", "Makna & Kegunaan Pedagogis"],
        [
            ["1", "Frekuensi login & waktu sesi terakhir", "Data Aktivitas", "auth-session.ts → analytics-store.ts", "Memantau keteraturan belajar dan mendeteksi potensi jeda akses > 7 hari."],
            ["2", "Akses materi, eksplorasi media (diagram/narasi/video) & Time on Task", "Data Aktivitas", "/materi/[topo]", "Mengetahui apakah siswa benar-benar mempelajari prasyarat sebelum praktik/kuis."],
            ["3", "Akurasi praktik kabel (sambungan benar vs ditolak & durasi)", "Data Aktivitas & Keterampilan", "/praktik/[topo] (CableBoard)", "Mendeteksi miskonsepsi aturan fisik topologi (mis. salah urutan cincin Ring)."],
            ["4", "Eksperimen Sandbox (jumlah ping, ping gagal, & uji cabut kabel)", "Data Aktivitas", "/sandbox/[topo]", "Mengukur apakah siswa benar-benar menguji dampak single point of failure."],
            ["5", "Riwayat evaluasi lengkap (Pre-Test, Post-Test, Latihan Adaptif), skor, durasi, & jawaban per butir soal", "Data Assessment", "/kuis (10 soal + drill adaptif)", "Menghitung tren skor (Pre→Post Gain), analisis 10 butir soal, dan soal tersulit."],
            ["6", "Refleksi tertulis Cek Pemahaman & Studio AI", "Data Interaction & Proses", "/materi/[topo] & /asisten", "Mengukur kualitas pemahaman dengan bahasa sendiri (assessment berbasis proses)."],
            ["7", "Jejak penggunaan AI (fungsi, skor prompt TCCO, iterasi, verifikasi Ask AI Then Think, 5W+C, Lab Hallucination)", "Data Interaction & Literasi AI", "/asisten", "Menjamin kolaborasi Human–AI yang kritis, terverifikasi, dan transparan."],
            ["8", "Kronologi Digital Traces & Progress Tahap (10 tahap)", "Data Progress & Jejak", "progress-store.ts & analytics-store.ts", "Membandingkan Progress vs Mastery dan menyajikan rekam jejak belajar."],
        ],
        widths=[0.9, 3.3, 2.3, 3.4, 6.0],
        header_color=PEACH_LIGHT,
    )

    # D. Integrasi Data pada Prototype
    heading(doc, "D", "Integrasi Learning Data dengan Prototype & Kendali Privasi")
    para(doc, "Seluruh data pembelajaran direkam otomatis tanpa mengganggu pengalaman belajar siswa melalui modul src/lib/analytics-store.ts yang terhubung ke hook useLearningAnalytics() pada src/lib/store.tsx. Data disimpan lokal per pengguna (localStorage) agar berjalan mulus dalam mode demo offline, dan otomatis disinkronkan ke Firestore (koleksi users/{uid}) saat mode Firebase aktif.")
    para(doc, "Sesuai prinsip Data Pembelajaran adalah Data Pengguna (Pert-13 Slide 26: Privacy, Security, Transparency, Access Control, Responsible Use), setiap siswa dapat meninjau seluruh jejak datanya, menjeda pencatatan kapan saja, mengekspor data dalam format JSON, atau menghapus seluruh jejak analitik melalui halaman /analitik maupun /pengaturan. Kebijakan lengkap juga didokumentasikan pada halaman /privasi.")

    # E. Dashboard Learning Analytics & 4 Tingkat Analytics
    heading(doc, "E", "Dashboard Learning Analytics (4 Tingkat Analytics & 5 Visualisasi)")
    para(doc, "Dashboard Learning Analytics tersedia pada rute /analitik dengan dua perspektif utama: Analitik Pribadi (Siswa) untuk pemantauan mandiri dan Tinjauan Kelas (Mode Guru) yang mensimulasikan analisis kelas 32 siswa. Visualisasi dipilih langsung sesuai pertanyaan analitik (Pert-13 Slide 20–21):")
    bullet(doc, "Menjawab 'Apa yang terjadi?' melalui perbandingan Donut Chart Progress Penyelesaian vs Indeks Penguasaan (Mastery) untuk menegaskan prinsip bahwa progress 100% belum tentu berarti memahami 100%, dilengkapi Line Chart perubahan skor Pre-Test → Post-Test, akurasi praktik kabel, dan waktu belajar.", bold_prefix="1. Descriptive Analytics: ")
    bullet(doc, "Menjawab 'Mengapa terjadi?' melalui Bar Chart akurasi per konsep (Bus, Ring, Star, Diagnostik), Tabel Analisis 10 Butir Soal yang menandai Most Difficult Question, serta 4 kartu alur Data → Informasi → Interpretasi → Keputusan yang terbentuk otomatis dari data siswa.", bold_prefix="2. Diagnostic Analytics: ")
    bullet(doc, "Menjawab 'Apa yang mungkin terjadi?' melalui indikator dini (skor < 60%, tren skor menurun, tolakan kabel berulang, kesenjangan Progress vs Mastery). Setiap indikator disertai prinsip Etika Non-Labeling yang menegaskan bahwa hasil prediksi bukan kepastian, bukan label siswa, serta mencantumkan kemungkinan konteks alternatif (kendala perangkat, belajar dari buku/sumber lain) agar keputusan tetap pada professional judgment guru.", bold_prefix="3. Predictive Analytics (Etis & Non-Labeling): ")
    bullet(doc, "Menjawab 'Apa yang sebaiknya dilakukan?' melalui rekomendasi adaptif terprioritas (Learning Data → Analytics → AI → Recommendation → Personalized Learning) yang langsung menautkan siswa ke modul lemah, Sandbox, atau Latihan Adaptif 3 soal khusus konsep lemah (/kuis?mode=adaptive&focus=...).", bold_prefix="4. Prescriptive Analytics & Recommendation: ")

    add_image(doc, "08-analitik-siswa.png", "Gambar 1. Dashboard Learning Analytics Mode Siswa: Descriptive (Progress vs Mastery), Line Chart, Bar Chart, Diagnostic Pipeline, Predictive Etis, dan Prescriptive Recommendation.")
    add_image(doc, "09-analitik-guru.png", "Gambar 2. Dashboard Learning Analytics Mode Tinjauan Guru (Simulasi 32 Siswa): KPI Kelas, Analisis Butir Soal #5, dan Indikasi Kontekstual Tanpa Label Negatif.")

    # F. Integrasi Generative AI yang Bertanggung Jawab (Pert-12)
    heading(doc, "F", "Integrasi Asisten Belajar AI yang Bertanggung Jawab (Pertemuan 12)")
    para(doc, "Untuk melengkapi ekosistem Learning Analytics dengan Generative AI secara pedagogis, halaman /asisten menyediakan Studio Prompt & Asisten Belajar AI yang terhubung dengan topik terlemah siswa dari Learning Analytics. Fitur kunci yang diterapkan meliputi:")
    numbered(doc, 1, "Tujuh fungsi AI untuk peserta didik (Explain, Example, Practice, Feedback, Brainstorm, Compare, Reflect) ditambah Mode Draft Guru untuk menyusun studi kasus dan rubrik awal dengan penegasan pedagogical judgment.", bold_prefix="Peran AI Terarah: ")
    numbered(doc, 2, "Sebelum mengirim prompt, siswa diminta mengisi 'Langkah 0: Apa yang sudah kamu pikirkan sendiri sebelum bertanya ke AI?' untuk mencegah ketergantungan dan menjaga kebiasaan recall mandiri.", bold_prefix="Gerbang Anti-Ketergantungan: ")
    numbered(doc, 3, "Evaluasi langsung 4 unsur prompt (Task, Context, Constraint, Output) disertai Builder TCCO dan chip Iterative Prompting untuk melatih penyempurnaan prompt secara bertahap.", bold_prefix="Struktur Prompt TCCO & Iterasi: ")
    numbered(doc, 4, "Setiap respons AI disertai peringatan 'Output AI bukan otomatis benar (Verify before cite)', tautan sumber primer modul/Sandbox, checklist 5 langkah (Ask, Check, Compare, Improve, Explain), serta 3 kasus interaktif pada tab Lab Deteksi Hallucination.", bold_prefix="Verifikasi Output & Deteksi Hallucination: ")
    numbered(doc, 5, "Siswa dapat menyusun kesimpulan mandiri dan Pernyataan Transparansi AI (What, Why, How, Verify, Contribution) yang otomatis tercetak pada Rapor Proses dan menjadi salah satu syarat Sertifikat Kompetensi Digital di /cetak.", bold_prefix="Assessment Berbasis Proses & Transparansi 5W+C: ")

    add_image(doc, "10-asisten-ai.png", "Gambar 3. Halaman Asisten Belajar AI: Gerbang Pemikiran Awal, Skor TCCO, Respons Terarah, dan Checklist Ask AI, Then Think.")

    # G. Tampilan Fitur Terintegrasi & Sertifikat Kompetensi
    heading(doc, "G", "Integrasi End-to-End & Sertifikat Kompetensi Berbasis Proses")
    para(doc, "Rekomendasi dari Learning Analytics tidak berhenti di halaman /analitik, melainkan hadir langsung di Peta Misi (/misi), halaman Hasil Kuis (/kuis/hasil), dan halaman Sertifikat & Rapor (/cetak). Penilaian bergeser dari sekadar nilai akhir (product) menuju bukti proses (process) yang memadukan ketuntasan materi, praktik kabel, simulasi, kuis ≥ 80%, serta refleksi/verifikasi mandiri untuk membuka Sertifikat Kompetensi Digital ber-ID verifikasi unik (NE-XI-2026-XXXXXX).")

    add_image(doc, "02-misi-adaptif.png", "Gambar 4. Peta Misi dengan banner Rekomendasi Adaptif Personalized Learning.")
    add_image(doc, "07-kuis-hasil-adaptif.png", "Gambar 5. Hasil Kuis Akhir dengan Prescriptive Analytics personal dan tombol langsung ke Latihan Adaptif.")
    add_image(doc, "11-sertifikat-rapor.png", "Gambar 6. Halaman /cetak menampilkan Sertifikat Kompetensi Digital Terverifikasi, Ringkasan Learning Analytics, Bukti Proses, dan Pernyataan Transparansi AI.")

    # H. Analisis TPACK, SAMR & Pengujian Kualitas
    heading(doc, "H", "Kerangka TPACK, Posisi SAMR (Redefinition), dan Hasil Pengujian")
    make_table(
        doc,
        ["Kerangka", "Penerapan pada Network Explorer Versi UAS"],
        [
            ["TPACK", "Memadukan Content (Topologi Bus, Ring, Star & Diagnostik Ping), Pedagogy (Guided Inquiry, Pre/Post Assessment, Adaptive Scaffolding, Penilaian Proses), dan Technology (Simulasi Web, Learning Analytics 4-Tingkat, dan Asisten AI Pedagogis)."],
            ["SAMR — Redefinition", "Mencapai level Redefinition sesuai Pert-12 Slide 29: sistem pembelajaran menghasilkan rekomendasi dan latihan adaptif yang berbeda berdasarkan data kebutuhan nyata masing-masing peserta didik, disertai simulasi gangguan real-time dan audit kritis output AI."],
            ["Pengujian Otomatis", "Seluruh verifikasi lulus 100%: ESLint (0 error/warning), TypeScript strict (0 error), 50/50 unit test Vitest (termasuk analytics.test.ts & ai-tutor.test.ts), production build Next.js 16 sukses (27 rute + API route), dan 12/12 uji end-to-end Playwright pada browser Chromium."],
        ],
        widths=[4.0, 11.9],
        header_color=YELLOW,
    )

    # I. Pembagian Tugas & Pernyataan Transparansi AI Kelompok
    heading(doc, "I", "Pembagian Pekerjaan & Pernyataan Transparansi Penggunaan AI")
    make_table(
        doc,
        ["Anggota", "Peran Utama UAS", "Kontribusi Spesifik"],
        [
            ["Anggota 1 (Ketua)", "Perancangan Learning Data & Integrasi", "Menetapkan 8 Learning Data relevan, arsitektur pipeline Data→Keputusan, serta validasi kesesuaian materi Pert-12, Pert-13, dan rubrik UAS."],
            ["Anggota 2", "Dashboard & Visualisasi Data", "Merancang antarmuka Dashboard /analitik, grafik SVG (Line, Bar, Donut), Mode Guru 32 siswa, dan tata letak cetak Sertifikat Kompetensi."],
            ["Anggota 3", "Asisten AI & Latihan Adaptif", "Mengimplementasikan Studio Prompt TCCO, 7 fungsi AI siswa, Mode Guru, Lab Deteksi Hallucination, mode Pre-Test & Latihan Adaptif."],
            ["Anggota 4", "Dokumentasi, Pengujian & Demo", "Menyusun Modul Penggunaan Multimedia, skenario demonstrasi, menjalankan 50 unit test + 12 uji E2E Playwright, dan kontrol privasi."],
        ],
        widths=[3.0, 4.4, 8.5],
        header_color=BLUE,
    )
    para(doc, "Pernyataan Penggunaan AI (5W+C): Generative AI digunakan oleh kelompok sebagai alat bantu pengembangan kode, penataan struktur dokumen, dan pemeriksaan kualitas pengujian. Seluruh desain pedagogis, pemilihan 8 Learning Data, verifikasi akurasi materi topologi jaringan, pengujian fungsional (unit & E2E), serta tanggung jawab akhir produk diperiksa dan disusun kembali oleh seluruh anggota Kelompok 3.", italic=True)

    # J. Daftar Sumber
    heading(doc, "J", "Daftar Sumber")
    para(doc, "Rahmadani, R. (2026). Artificial Intelligence & Generative AI dalam Pendidikan (Materi Pertemuan 12). Program Studi PTIK, Universitas Negeri Medan.")
    para(doc, "Rahmadani, R. (2026). Learning Analytics (Materi Pertemuan 13). Program Studi PTIK, Universitas Negeri Medan.")
    para(doc, "Mayer, R. E. (2021). Multimedia learning (3rd ed.). Cambridge University Press.")
    para(doc, "Mawarni, S., & Muhtadi, A. (2017). Pengembangan digital book interaktif mata kuliah pengembangan multimedia pembelajaran interaktif untuk mahasiswa teknologi pendidikan. Jurnal Inovasi Teknologi Pendidikan, 4(1), 84–96.")

    out_path = os.path.join(BASE, "Dokumen_Proyek_UAS_Network_Explorer_Kelompok3.docx")
    doc.save(out_path)
    print("saved:", out_path)


# =============================================================================
# 2. MODUL PENGGUNAAN MULTIMEDIA (UAS)
# =============================================================================
def build_modul_penggunaan():
    doc = new_doc()
    add_cover(
        doc,
        "MODUL PENGGUNAAN MULTIMEDIA INTERAKTIF",
        "PANDUAN LENGKAP PESERTA DIDIK DAN GURU — NETWORK EXPLORER (VERSI UAS)",
    )

    para(doc, "MODUL PENGGUNAAN NETWORK EXPLORER: MISI TOPOLOGI", bold=True, align="center")

    # 1. Gambaran Umum & Kebutuhan Sistem
    heading(doc, "1", "Gambaran Umum & Persiapan Akses")
    para(doc, "Network Explorer: Misi Topologi adalah aplikasi pembelajaran berbasis web untuk mata pelajaran Informatika SMA Kelas XI materi Topologi Jaringan (Bus, Ring, dan Star). Versi UAS telah dilengkapi dengan sistem perekaman Learning Data otomatis, Dashboard Learning Analytics 4-tingkat, Latihan Adaptif, Asisten Belajar AI yang bertanggung jawab, serta Sertifikat Kompetensi Digital.")
    make_table(
        doc,
        ["Kebutuhan", "Spesifikasi Minimum"],
        [
            ["Perangkat", "Laptop, komputer desktop, tablet, atau ponsel pintar"],
            ["Peramban (Browser)", "Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari versi terbaru"],
            ["Koneksi Internet", "Diperlukan saat mengakses tautan online atau memutar video YouTube; mode demo lokal tetap berjalan tanpa server backend"],
            ["Tautan Aplikasi", "https://network-explorer-xi.vercel.app/ (atau http://localhost:3000 pada server lokal)"],
            ["Akun Demo Siap Pakai", "Email: navigator@example.com  |  Kata sandi: password123"],
        ],
        widths=[4.4, 11.5],
        header_color=GREEN,
    )
    add_image(doc, "01-beranda.png", "Gambar 1. Halaman Beranda Network Explorer: ringkasan fitur pembelajaran, Learning Analytics, dan Asisten AI.")

    # 2. Peta Navigasi Aplikasi
    heading(doc, "2", "Struktur Menu & Navigasi Aplikasi")
    make_table(
        doc,
        ["Menu", "Rute", "Fungsi Utama"],
        [
            ["Peta Misi", "/misi", "Daftar 3 modul topologi (Bus, Ring, Star), status tahap, dan banner Rekomendasi Adaptif."],
            ["Materi & Praktik", "/materi/[topo], /praktik/[topo]", "Bab interaktif (diagram, narasi TTS, video, Cek Pemahaman tertulis) dan papan pasang kabel drag-and-drop."],
            ["Sandbox", "/sandbox/[topo]", "Simulasi kirim paket ping dan uji cabut kabel untuk melihat dampak gangguan."],
            ["Perbandingan", "/perbandingan", "Tabel perbandingan 7 aspek antar topologi dan studi kasus lab 24 PC."],
            ["Kuis Akhir", "/kuis", "Tiga mode evaluasi: Pre-Test Diagnostik, Kuis Akhir (10 studi kasus), dan Latihan Adaptif (3 soal terfokus)."],
            ["Analitik", "/analitik", "Dashboard Learning Analytics 4-tingkat (Mode Siswa & Mode Tinjauan Guru) serta kontrol privasi data."],
            ["Asisten AI", "/asisten", "Studio Prompt TCCO, 7 fungsi AI siswa, Mode Draft Guru, Lab Deteksi Hallucination, & Transparansi 5W+C."],
            ["Sertifikat & Rapor", "/cetak", "Cek kelayakan 5 syarat sertifikasi, Sertifikat Kompetensi Digital ber-ID unik, dan Rapor Proses siap cetak PDF."],
            ["Panduan & Pengaturan", "/panduan, /pengaturan", "Petunjuk belajar di dalam aplikasi, pengaturan suara/jalur, dan kontrol privasi Learning Analytics."],
        ],
        widths=[3.2, 4.0, 8.7],
        header_color=PEACH_LIGHT,
    )

    # 3. Panduan Langkah demi Langkah untuk Peserta Didik
    heading(doc, "3", "Panduan Penggunaan untuk Peserta Didik")
    subheading(doc, "3.1", "Masuk Akun & Mengambil Pre-Test Diagnostik")
    numbered(doc, 1, "Buka aplikasi lalu klik 'Masuk ke akun' (gunakan akun demo navigator@example.com / password123 atau daftar akun siswa baru).")
    numbered(doc, 2, "Sebelum membaca materi, buka menu Kuis Akhir lalu pilih tab 'Pre-Test Diagnostik' untuk mengukur pemahaman awal. Skor awal ini akan dibandingkan otomatis dengan Post-Test di Dashboard Analitik.")

    subheading(doc, "3.2", "Membaca Materi & Mengisi Cek Pemahaman (Bukti Proses)")
    numbered(doc, 1, "Dari Peta Misi (/misi), buka Bab 1 (Bus), lanjutkan ke Bab 2 (Ring) dan Bab 3 (Star).")
    numbered(doc, 2, "Eksplorasi ketiga tab media: Diagram Animasi, Narasi Audio (klik 'Putar narasi'), dan Video Ringkasan.")
    numbered(doc, 3, "Pada bagian Cek Pemahaman, tuliskan terlebih dahulu jawaban dengan bahasamu sendiri sebelum menekan 'Simpan refleksi & cek kunci'. Tulisanmu tersimpan sebagai bukti proses untuk sertifikat.")
    add_image(doc, "03-materi-star.png", "Gambar 2. Halaman Materi Star dengan tab Diagram/Narasi/Video dan kotak Cek Pemahaman tertulis.")

    subheading(doc, "3.3", "Memasang Kabel di Lembar Praktik & Uji Gangguan di Sandbox")
    numbered(doc, 1, "Klik 'Lanjut ke lembar praktik' untuk membuka papan pemasangan kabel.")
    numbered(doc, 2, "Seret kabel dari palet ke perangkat sasaran sesuai aturan topologi (Bus → Backbone, Ring → PC berikutnya searah jarum jam, Star → Switch). Untuk pengguna keyboard, tekan Tab/Enter untuk memilih kabel lalu tekan perangkat tujuan.")
    numbered(doc, 3, "Jika sambungan ditolak, baca alasan teknis pada log. Setelah seluruh kabel tersambung, klik 'Buka simulasi' untuk mengirim paket ping dan mencoba mencabut satu kabel guna mengamati perbedaannya.")
    add_image(doc, "04-praktik-star.png", "Gambar 3. Lembar Praktik pemasangan kabel dengan validasi aturan otomatis dan perekaman akurasi.")
    add_image(doc, "05-sandbox-star.png", "Gambar 4. Sandbox simulasi pengiriman paket ping dan pengujian cabut kabel.")

    subheading(doc, "3.4", "Mengerjakan Kuis Akhir & Latihan Adaptif")
    numbered(doc, 1, "Buka menu Kuis Akhir dan jawab 10 soal studi kasus. Setiap pilihan langsung menampilkan pembahasan teknis.")
    numbered(doc, 2, "Pada halaman Hasil Kuis (/kuis/hasil), perhatikan kotak Rekomendasi Belajar Personal. Jika masih ada konsep yang keliru, klik tombol 'Latihan Adaptif' untuk mengerjakan 3 soal khusus pada konsep tersebut.")
    add_image(doc, "06-kuis-modes.png", "Gambar 5. Halaman Kuis dengan pilihan mode Kuis Akhir (Post-Test), Pre-Test Diagnostik, dan Latihan Adaptif.")

    subheading(doc, "3.5", "Membaca Dashboard Learning Analytics (/analitik)")
    numbered(doc, 1, "Buka menu Analitik untuk memantau proses belajarmu secara objektif.")
    numbered(doc, 2, "Bandingkan dua grafik donat: Progress Penyelesaian vs Indeks Penguasaan (Mastery). Jika Mastery masih lebih rendah dari Progress, ikuti rekomendasi di bagian Prescriptive Analytics.")
    numbered(doc, 3, "Gunakan Line Chart untuk melihat tren kenaikan nilai, Bar Chart & Tabel Analisis Butir Soal untuk menemukan konsep tersulit, serta Tabel Jejak Digital untuk melihat kronologi aktivitas.")

    subheading(doc, "3.6", "Menggunakan Asisten Belajar AI Secara Bertanggung Jawab (/asisten)")
    numbered(doc, 1, "Pilih salah satu dari 7 fungsi belajar (Explain, Example, Practice, Feedback, Brainstorm, Compare, atau Reflect) dan topik fokus.")
    numbered(doc, 2, "Isi Langkah 0 (pemikiran awalmu sendiri) sebelum bertanya agar kemampuan analisis mandiri tetap terlatih.")
    numbered(doc, 3, "Gunakan Builder Prompt TCCO dan chip Iterative Prompting agar skor kelengkapan prompt mencapai 4/4 unsur.")
    numbered(doc, 4, "Setelah AI menjawab, lakukan verifikasi dengan mencentang 5 langkah Ask AI, Then Think dan membandingkan hasilnya dengan modul/Sandbox. Tulis kesimpulan dengan bahasamu sendiri lalu simpan sebagai bukti proses.")
    numbered(doc, 5, "Buka tab '2. Lab Deteksi Hallucination' untuk berlatih menemukan kesalahan fakta/sitasi palsu AI, dan tab '3. Pernyataan Transparansi 5W+C' untuk menyusun pernyataan integritas akademik.")

    subheading(doc, "3.7", "Mencetak Sertifikat Kompetensi & Rapor Proses (/cetak)")
    para(doc, "Buka menu 'Sertifikat & rapor'. Jika 5 syarat kelulusan terpenuhi (3 materi, 3 praktik, 3 simulasi, kuis ≥ 80%, dan minimal 1 bukti proses), Sertifikat Kompetensi Digital ber-ID unik otomatis terbuka di atas Rapor Belajar. Klik 'Cetak rapor & sertifikat' lalu pilih 'Save as PDF' (tampilan otomatis berubah ke kertas putih hemat tinta).")

    # 4. Panduan untuk Guru / Pendidik
    heading(doc, "4", "Panduan Penggunaan untuk Guru / Pendidik")
    numbered(doc, 1, "Buka menu Analitik lalu pilih tab 'Tinjauan Kelas (Mode Guru)' untuk melihat simulasi ringkasan kelas (jumlah siswa, ketuntasan, rata-rata skor, dan Most Difficult Question).", bold_prefix="Pemantauan Kelas: ")
    numbered(doc, 2, "Gunakan analisis butir soal (mis. Soal #5 Collision Bus) sebagai dasar diskusi ulang di kelas — bukan untuk memberi label negatif kepada siswa. Konfirmasikan selalu faktor kontekstual (kendala perangkat, sakit, atau belajar dari sumber lain).", bold_prefix="Interpretasi Kontekstual: ")
    numbered(doc, 3, "Buka Asisten AI lalu pilih kartu 'Draft Guru' untuk membantu brainstorming studi kasus lokal atau draft rubrik penilaian proses. Guru tetap melakukan pemeriksaan akurasi dan pedagogical judgment sebelum dipakai di kelas.", bold_prefix="Draft Bahan Ajar: ")
    numbered(doc, 4, "Kumpulkan Rapor Proses PDF (/cetak) dari siswa untuk menilai bukan hanya skor akhir, tetapi juga perkembangan Pre→Post, akurasi praktik, refleksi mandiri, dan transparansi penggunaan AI.", bold_prefix="Penilaian Berbasis Proses: ")

    # 5. Privasi, Aksesibilitas & Troubleshooting
    heading(doc, "5", "Privasi Data, Aksesibilitas, dan Pemecahan Masalah")
    bullet(doc, "Siswa dapat menjeda pencatatan analitik, mengekspor data dalam format JSON, atau menghapus seluruh jejak data melalui halaman /analitik dan /pengaturan.", bold_prefix="Kendali Privasi: ")
    bullet(doc, "Seluruh halaman mendukung navigasi keyboard (Tab/Enter/Escape), label formulir terhubung, alternatif klik pada papan kabel, tombol matikan suara, serta dukungan Reduce Motion.", bold_prefix="Aksesibilitas: ")
    bullet(doc, "Bila jaringan internet tidak tersedia saat presentasi, pastikan mode demo aktif; seluruh simulasi, Dashboard Learning Analytics, dan Mesin Pedagogis Lokal pada Asisten AI tetap berjalan normal.", bold_prefix="Mode Offline / Demo: ")

    add_image(doc, "12-panduan-uas.png", "Gambar 6. Halaman Panduan Belajar & Penggunaan di dalam aplikasi (/panduan).")

    out_path = os.path.join(BASE, "Modul_Penggunaan_Multimedia_UAS_Network_Explorer_Kelompok3.docx")
    doc.save(out_path)
    print("saved:", out_path)


if __name__ == "__main__":
    build_dokumen_proyek()
    build_modul_penggunaan()
