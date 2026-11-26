# -*- coding: utf-8 -*-
"""Pembangun Dokumen Akademik UAS TIK dalam Pendidikan (Format Makalah & Modul).

Menghasilkan dua berkas DOCX berbahasa Indonesia akademik baku tanpa em-dash:
1. Makalah_Laporan_Proyek_UAS_Network_Explorer_Kelompok3.docx
2. Modul_Penggunaan_Multimedia_UAS_Network_Explorer_Kelompok3.docx
"""

import os
import zipfile
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)
IMG = os.path.join(BASE, "gambar")
LOGO = os.path.join(ROOT, "laporan_uts", "gambar", "logo-unimed.png")

FONT = "Times New Roman"
HEADER_FILL = "D9E2F3"
SUBHEADER_FILL = "EDF2F8"
TEXT_WIDTH_CM = 14.0  # A4 (21.0) - kiri (4.0) - kanan (3.0)


def add_page_number_footer(section):
    """Menambahkan nomor halaman terpusat pada footer (kecuali halaman sampul)."""
    section.different_first_page_header_footer = True
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)

    r1 = p.add_run()
    r1.font.name = FONT
    r1.font.size = Pt(11)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    r1._r.append(fld_begin)

    r2 = p.add_run()
    r2.font.name = FONT
    r2.font.size = Pt(11)
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    r2._r.append(instr)

    r3 = p.add_run()
    r3.font.name = FONT
    r3.font.size = Pt(11)
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    r3._r.append(fld_end)


def new_doc():
    """Membuat dokumen A4 dengan margin akademik standar 4-3-3-3 cm."""
    doc = Document()
    for s in doc.sections:
        s.page_width = Cm(21.0)
        s.page_height = Cm(29.7)
        s.top_margin = Cm(3.0)
        s.bottom_margin = Cm(3.0)
        s.left_margin = Cm(4.0)
        s.right_margin = Cm(3.0)
        add_page_number_footer(s)

    st = doc.styles["Normal"]
    st.font.name = FONT
    st.font.size = Pt(12)
    st.font.color.rgb = RGBColor(0, 0, 0)
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


def set_cell_margins(cell, top=80, bottom=80, left=110, right=110):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement("w:tcMar")
    for side, val in (("top", top), ("bottom", bottom), ("left", left), ("right", right)):
        node = OxmlElement(f"w:{side}")
        node.set(qn("w:w"), str(val))
        node.set(qn("w:type"), "dxa")
        tcMar.append(node)
    tcPr.append(tcMar)


def add_run_styled(p, text, bold=False, italic=False, size=12):
    r = p.add_run(text)
    r.font.name = FONT
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor(0, 0, 0)
    r.bold = bold
    r.italic = italic
    return r


def para(doc, text, bold=False, italic=False, align="justify", size=12, space_after=6, indent=False, keep_with_next=False):
    p = doc.add_paragraph()
    p.alignment = {
        "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
        "center": WD_ALIGN_PARAGRAPH.CENTER,
        "left": WD_ALIGN_PARAGRAPH.LEFT,
        "right": WD_ALIGN_PARAGRAPH.RIGHT,
    }[align]
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = keep_with_next
    if indent:
        p.paragraph_format.first_line_indent = Cm(1.25)
    add_run_styled(p, text, bold=bold, italic=italic, size=size)
    return p


def body(doc, text):
    """Paragraf isi makalah standar dengan indentasi baris pertama 1,25 cm."""
    return para(doc, text, align="justify", size=12, space_after=6, indent=True)


def chapter_title(doc, bab_label, title, page_break=True):
    """Judul BAB makalah (terpusat, kapital, tebal)."""
    if page_break:
        doc.add_page_break()
    if bab_label:
        p1 = para(doc, bab_label.upper(), bold=True, align="center", size=13, space_after=2, keep_with_next=True)
        p1.paragraph_format.space_before = Pt(0)
    p2 = para(doc, title.upper(), bold=True, align="center", size=13, space_after=12, keep_with_next=True)
    p2.paragraph_format.space_before = Pt(0)
    return p2


def subheading(doc, num, title):
    """Subbab bernomor seperti 1.1 Latar Belakang Masalah."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.keep_with_next = True
    add_run_styled(p, f"{num}  {title}", bold=True, size=12)
    return p


def subsubheading(doc, label, title):
    """Sub-subbab seperti 4.1.1 atau A."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.keep_with_next = True
    add_run_styled(p, f"{label}  {title}", bold=True, italic=False, size=12)
    return p


def numbered(doc, n, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(1.0)
    p.paragraph_format.first_line_indent = Cm(-0.55)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(4)
    add_run_styled(p, f"{n}.  ", bold=False, size=12)
    if bold_prefix:
        add_run_styled(p, bold_prefix, bold=True, size=12)
    add_run_styled(p, text, bold=False, size=12)
    return p


def bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(1.0)
    p.paragraph_format.first_line_indent = Cm(-0.45)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(4)
    add_run_styled(p, "-  ", bold=True, size=12)
    if bold_prefix:
        add_run_styled(p, bold_prefix, bold=True, size=12)
    add_run_styled(p, text, bold=False, size=12)
    return p


def reference_entry(doc, text):
    """Paragraf daftar pustaka dengan indentasi gantung (hanging indent) 1,25 cm."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Cm(1.25)
    p.paragraph_format.first_line_indent = Cm(-1.25)
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(6)
    add_run_styled(p, text, size=12)
    return p


def make_table(doc, headers, rows, widths=None, caption=None, header_color=HEADER_FILL):
    if caption:
        pc = para(doc, caption, bold=True, align="left", size=11, space_after=4, keep_with_next=True)
        pc.paragraph_format.space_before = Pt(6)

    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False

    # Header row repeats across page breaks
    trPr = t.rows[0]._tr.get_or_add_trPr()
    tblHeader = OxmlElement("w:tblHeader")
    trPr.append(tblHeader)

    for j, h in enumerate(headers):
        c = t.cell(0, j)
        c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        set_cell_margins(c)
        c.text = ""
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(0)
        add_run_styled(p, h, bold=True, size=10.5)
        if header_color:
            shade(c, header_color)

    for i, row in enumerate(rows, start=1):
        trPr_row = t.rows[i]._tr.get_or_add_trPr()
        cantSplit = OxmlElement("w:cantSplit")
        trPr_row.append(cantSplit)
        for j, val in enumerate(row):
            c = t.cell(i, j)
            c.vertical_alignment = WD_ALIGN_VERTICAL.TOP
            set_cell_margins(c)
            c.text = ""
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_after = Pt(0)
            add_run_styled(p, val, size=10.0)

    if widths:
        for j, w in enumerate(widths):
            for i in range(len(rows) + 1):
                t.cell(i, j).width = Cm(w)

    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(4)
    sp.paragraph_format.line_spacing = 1.0
    return t


def add_image(doc, filename, caption, width_cm=13.2):
    path = os.path.join(IMG, filename)
    if os.path.exists(path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        p.add_run().add_picture(path, width=Cm(width_cm))
        c = doc.add_paragraph()
        c.alignment = WD_ALIGN_PARAGRAPH.CENTER
        c.paragraph_format.line_spacing = 1.15
        c.paragraph_format.space_after = Pt(10)
        add_run_styled(c, caption, italic=True, size=10.5)
    else:
        para(doc, f"[Gambar {filename} tidak ditemukan]", italic=True, align="center", size=10.5)


def add_cover(doc, doc_type, main_title, sub_title, purpose_line):
    para(doc, doc_type.upper(), bold=True, align="center", size=14, space_after=4)
    para(doc, main_title.upper(), bold=True, align="center", size=13, space_after=4)
    para(doc, sub_title.upper(), bold=True, align="center", size=12, space_after=10)
    para(doc, purpose_line, italic=True, align="center", size=11.5, space_after=14)

    para(doc, "Dosen Pengampu:", bold=True, align="center", size=12, space_after=2)
    para(doc, "Reni Rahmadani, S.Kom., M.Kom.", align="center", size=12, space_after=2)
    para(doc, "Prof. Dr. Sahat Siagian, M.Pd.", align="center", size=12, space_after=14)

    if os.path.exists(LOGO):
        lp = doc.add_paragraph()
        lp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        lp.paragraph_format.space_after = Pt(14)
        lp.add_run().add_picture(LOGO, width=Cm(4.2))

    para(doc, "Disusun Oleh:", bold=True, align="center", size=12, space_after=2)
    para(doc, "Kelompok 3", bold=True, align="center", size=12, space_after=6)

    t = doc.add_table(rows=4, cols=3)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Tanpa garis tabel agar serasi dengan tata letak halaman sampul UTS
    tblPr = t._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for side in ("top", "left", "bottom", "right", "insideH", "insideV"):
        b = OxmlElement(f"w:{side}")
        b.set(qn("w:val"), "none")
        borders.append(b)
    tblPr.append(borders)

    cover_rows = [
        ("Malvin Andrew Depari", ":", "5253151010"),
        ("Abdi Raihan Wibowo", ":", "5253151026"),
        ("Citra Olivia Lestari", ":", "5253151011"),
        ("Pniel Jhonspandi Nababan", ":", "5253151013"),
    ]
    col_w = [6.4, 0.8, 3.8]
    for i, (a, b, c_val) in enumerate(cover_rows):
        for j, v in enumerate((a, b, c_val)):
            cell = t.cell(i, j)
            cell.width = Cm(col_w[j])
            set_cell_margins(cell, top=45, bottom=45, left=60, right=60)
            cell.text = ""
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j == 1 else WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.25
            p.paragraph_format.space_after = Pt(0)
            add_run_styled(p, v, bold=False, size=12)

    para(doc, "", size=10, space_after=14)
    para(doc, "PROGRAM STUDI PENDIDIKAN TEKNOLOGI INFORMATIKA DAN KOMPUTER", bold=True, align="center", size=12, space_after=2)
    para(doc, "FAKULTAS TEKNIK", bold=True, align="center", size=12, space_after=2)
    para(doc, "UNIVERSITAS NEGERI MEDAN", bold=True, align="center", size=12, space_after=2)
    para(doc, "2026", bold=True, align="center", size=12, space_after=0)


def add_toc_list(doc, title, items):
    chapter_title(doc, None, title, page_break=True)
    for label, indent_level in items:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.35
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.left_indent = Cm(0.8 * indent_level)
        add_run_styled(p, label, bold=(indent_level == 0), size=11.5)


def assert_no_em_dash(filepath):
    """Memastikan berkas DOCX hasil generasi 100 persen bebas dari karakter em-dash."""
    em = "\u2014"
    en = "\u2013"
    with zipfile.ZipFile(filepath, "r") as zf:
        for name in zf.namelist():
            if name.endswith(".xml"):
                raw = zf.read(name).decode("utf-8", errors="ignore")
                if em in raw:
                    raise AssertionError(f"Ditemukan karakter em-dash (U+2014) pada {filepath} ({name})")
                if en in raw:
                    raise AssertionError(f"Ditemukan karakter en-dash (U+2013) pada {filepath} ({name})")


# =============================================================================
# 1. MAKALAH LAPORAN PROYEK UAS
# =============================================================================
def build_makalah_laporan():
    doc = new_doc()
    add_cover(
        doc,
        "MAKALAH LAPORAN PROYEK UJIAN AKHIR SEMESTER (UAS)",
        "PENGEMBANGAN MULTIMEDIA PEMBELAJARAN INTERAKTIF NETWORK EXPLORER",
        "INTEGRASI LEARNING ANALYTICS, GENERATIVE AI BERTANGGUNG JAWAB, KONTROL AKSES PERAN, DAN LEADERBOARD BERORIENTASI PRIVASI",
        "Disusun untuk Memenuhi Tugas Ujian Akhir Semester Mata Kuliah Teknologi Informasi dan Komunikasi dalam Pendidikan",
    )

    # KATA PENGANTAR
    chapter_title(doc, None, "KATA PENGANTAR", page_break=True)
    body(doc, "Puji dan syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa atas rahmat dan karunia-Nya sehingga makalah laporan proyek Ujian Akhir Semester (UAS) berjudul Pengembangan Multimedia Pembelajaran Interaktif Network Explorer: Integrasi Learning Analytics, Generative AI Bertanggung Jawab, Kontrol Akses Peran, dan Leaderboard Berorientasi Privasi ini dapat diselesaikan dengan baik dan tepat waktu.")
    body(doc, "Makalah ini disusun sebagai bentuk pertanggungjawaban akademik atas pengembangan lanjutan purwarupa multimedia pembelajaran interaktif Network Explorer pada mata pelajaran Informatika SMA Kelas XI materi Topologi Jaringan Bus, Ring, dan Star. Pada tahap UAS, sistem yang sebelumnya dibangun pada Ujian Tengah Semester (UTS) diperluas secara menyeluruh dengan penerapan prinsip Learning Analytics empat tingkat, Asisten Belajar berbasis Generative AI yang kritis dan transparan, alur navigasi belajar terarah lima tahap, kontrol akses berbasis peran (Role-Based Access Control) antara peserta didik dan pendidik, serta fitur papan peringkat siswa (Leaderboard) yang menjunjung tinggi privasi data.")
    body(doc, "Penulis menyampaikan ucapan terima kasih yang sebesar-besarnya kepada Ibu Reni Rahmadani, S.Kom., M.Kom. dan Bapak Prof. Dr. Sahat Siagian, M.Pd. selaku dosen pengampu mata kuliah Teknologi Informasi dan Komunikasi dalam Pendidikan atas bimbingan, arahan konseptual, serta kerangka evaluasi yang telah diberikan selama proses perkuliahan berlangsung. Ucapan terima kasih juga disampaikan kepada seluruh anggota Kelompok 3 atas kerja sama dan kontribusi aktif dalam perancangan, pemrograman, pengujian, serta penyusunan dokumentasi proyek ini.")
    body(doc, "Penulis menyadari bahwa makalah dan aplikasi yang dikembangkan masih memiliki ruang penyempurnaan. Oleh karena itu, kritik dan saran yang bersifat konstruktif sangat diharapkan demi peningkatan mutu karya pada pengembangan berikutnya. Semoga makalah ini dapat memberikan manfaat bagi pengembangan media pembelajaran digital yang bermakna, etis, dan berorientasi pada proses belajar peserta didik.")
    para(doc, "", size=10, space_after=6)
    para(doc, "Medan, 2026", align="right", size=12, space_after=2)
    para(doc, "Penyusun,", align="right", size=12, space_after=24)
    para(doc, "Kelompok 3", bold=True, align="right", size=12, space_after=0)

    # ABSTRAK
    chapter_title(doc, None, "ABSTRAK", page_break=True)
    para(doc, "Pembelajaran materi Topologi Jaringan pada mata pelajaran Informatika SMA Kelas XI umumnya masih bertumpu pada penyampaian konsep secara statis dan penilaian yang hanya menitikberatkan pada skor akhir. Kondisi tersebut menyulitkan peserta didik dalam memahami mekanisme transmisi data dan dampak kegagalan titik tunggal (single point of failure), sekaligus membatasi pendidik dalam menelusuri sumber miskonsepsi peserta didik secara objektif. Penelitian pengembangan proyek ini bertujuan untuk meningkatkan purwarupa multimedia interaktif berbasis web Network Explorer: Misi Topologi dengan mengintegrasikan sistem perekaman delapan data pembelajaran relevan, Dashboard Learning Analytics empat tingkat (Descriptive, Diagnostic, Predictive etis tanpa pelabelan negatif, dan Prescriptive), Asisten Belajar berbasis Generative AI yang bertanggung jawab, navigasi belajar terarah lima tahap, kontrol akses berbasis peran (siswa dan guru), serta papan peringkat siswa berorientasi privasi. Sistem dibangun menggunakan arsitektur Next.js 16, React 19, TypeScript, Tailwind CSS v4, pustaka interaksi drag-and-drop, serta layanan autentikasi dan basis data Firebase dengan dukungan mode demo luring. Hasil pengujian otomatis menunjukkan tingkat keberhasilan sebesar 100 persen yang mencakup nol galat pada analisis statis ESLint dan TypeScript, 59 dari 59 pengujian unit Vitest lulus, 29 rute produksi terbangun tanpa kendala, serta 14 dari 14 skenario pengujian end-to-end Playwright berjalan valid pada peramban Chromium. Dengan demikian, aplikasi Network Explorer mampu menghadirkan ekosistem pembelajaran berbasis bukti proses yang mencapai tingkatan Redefinition pada kerangka SAMR.", align="justify", size=12, space_after=8, indent=False)
    p_kw = doc.add_paragraph()
    p_kw.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_kw.paragraph_format.line_spacing = 1.5
    add_run_styled(p_kw, "Kata Kunci: ", bold=True, italic=True, size=12)
    add_run_styled(p_kw, "multimedia pembelajaran interaktif, Learning Analytics, Generative AI bertanggung jawab, kontrol akses berbasis peran, papan peringkat privasi, topologi jaringan.", italic=True, size=12)

    # DAFTAR ISI
    add_toc_list(doc, "DAFTAR ISI", [
        ("KATA PENGANTAR", 0),
        ("ABSTRAK", 0),
        ("DAFTAR ISI", 0),
        ("DAFTAR TABEL", 0),
        ("DAFTAR GAMBAR", 0),
        ("BAB I PENDAHULUAN", 0),
        ("1.1 Latar Belakang Masalah", 1),
        ("1.2 Rumusan Masalah", 1),
        ("1.3 Tujuan Pengembangan", 1),
        ("1.4 Manfaat Pengembangan", 1),
        ("1.5 Ruang Lingkup dan Batasan Sistem", 1),
        ("BAB II KAJIAN TEORI DAN LANDASAN KONSEPTUAL", 0),
        ("2.1 Multimedia Pembelajaran Interaktif", 1),
        ("2.2 Kerangka TPACK dan Model SAMR", 1),
        ("2.3 Learning Analytics dalam Pendidikan", 1),
        ("2.4 Kecerdasan Buatan Generatif yang Bertanggung Jawab dalam Pendidikan", 1),
        ("2.5 Kontrol Akses Berbasis Peran dan Gamifikasi Berorientasi Privasi", 1),
        ("BAB III METODOLOGI DAN PERANCANGAN SISTEM", 0),
        ("3.1 Identitas Proyek dan Arsitektur Teknologi", 1),
        ("3.2 Penentuan Delapan Data Pembelajaran Relevan", 1),
        ("3.3 Perancangan Alur Navigasi Terarah Lima Tahap", 1),
        ("3.4 Perancangan Keamanan Basis Data dan Kontrol Akses Peran", 1),
        ("3.5 Perancangan Strategi Pengujian Perangkat Lunak", 1),
        ("BAB IV IMPLEMENTASI DAN PEMBAHASAN", 0),
        ("4.1 Transformasi Purwarupa UTS ke Versi UAS dan Alur Belajar Terarah", 1),
        ("4.2 Implementasi Materi Interaktif, Praktik Pemasangan Kabel, dan Sandbox", 1),
        ("4.3 Implementasi Evaluasi Bertingkat dan Latihan Adaptif", 1),
        ("4.4 Implementasi Dashboard Learning Analytics Empat Tingkat", 1),
        ("4.5 Implementasi Asisten Belajar AI yang Bertanggung Jawab", 1),
        ("4.6 Implementasi Dashboard Pemantauan Khusus Guru", 1),
        ("4.7 Implementasi Leaderboard Siswa Berorientasi Privasi dan Anti-Farming", 1),
        ("4.8 Implementasi Sertifikat Kompetensi Berbasis Proses dan Rapor Cetak", 1),
        ("4.9 Analisis Hasil Pengujian, Ketercapaian TPACK/SAMR, dan Pembagian Tugas", 1),
        ("BAB V PENUTUP", 0),
        ("5.1 Kesimpulan", 1),
        ("5.2 Saran", 1),
        ("DAFTAR PUSTAKA", 0),
    ])

    # DAFTAR TABEL
    add_toc_list(doc, "DAFTAR TABEL", [
        ("Tabel 3.1 Identitas Proyek dan Spesifikasi Arsitektur Network Explorer Versi UAS", 0),
        ("Tabel 3.2 Pemetaan Delapan Data Pembelajaran (Learning Data) Relevan pada Sistem", 0),
        ("Tabel 3.3 Matriks Kontrol Akses Berbasis Peran (RBAC) antara Siswa dan Guru", 0),
        ("Tabel 4.1 Hasil Pengujian Kualitas dan Verifikasi Otomatis Sistem", 0),
        ("Tabel 4.2 Pemetaan Ketercapaian Kerangka TPACK dan Model SAMR", 0),
        ("Tabel 4.3 Pembagian Tugas dan Kontribusi Anggota Kelompok 3", 0),
    ])

    # DAFTAR GAMBAR
    add_toc_list(doc, "DAFTAR GAMBAR", [
        ("Gambar 4.1 Halaman Beranda Network Explorer Versi UAS", 0),
        ("Gambar 4.2 Halaman Peta Misi dengan Alur Belajar Terarah Lima Tahap dan Rekomendasi Adaptif", 0),
        ("Gambar 4.3 Halaman Materi Topologi Star dengan Media Interaktif dan Cek Pemahaman Tertulis", 0),
        ("Gambar 4.4 Lembar Praktik Pemasangan Kabel dengan Validasi Aturan Otomatis", 0),
        ("Gambar 4.5 Meja Kerja Sandbox Interaktif untuk Simulasi Ping dan Uji Cabut Kabel", 0),
        ("Gambar 4.6 Halaman Kuis dengan Pilihan Mode Pre-Test, Kuis Akhir, dan Latihan Adaptif", 0),
        ("Gambar 4.7 Halaman Hasil Kuis Akhir dengan Prescriptive Analytics Personal", 0),
        ("Gambar 4.8 Dashboard Learning Analytics Khusus Peserta Didik (Data Pribadi)", 0),
        ("Gambar 4.9 Dashboard Learning Analytics Khusus Pendidik (Tinjauan Kelas)", 0),
        ("Gambar 4.10 Halaman Asisten Belajar AI dengan Gerbang Pemikiran Awal, TCCO, dan Verifikasi", 0),
        ("Gambar 4.11 Dashboard Pemantauan Murid Khusus Guru pada Rute /guru", 0),
        ("Gambar 4.12 Halaman Leaderboard Siswa dengan Podium, Mode Anonim, dan Isolasi Privasi", 0),
        ("Gambar 4.13 Halaman Sertifikat Kompetensi Digital Berbasis Proses dan Rapor Cetak", 0),
    ])

    # =========================================================================
    # BAB I PENDAHULUAN
    # =========================================================================
    chapter_title(doc, "BAB I", "PENDAHULUAN", page_break=True)

    subheading(doc, "1.1", "Latar Belakang Masalah")
    body(doc, "Transformasi digital dalam pendidikan menuntut pergeseran paradigma dari sekadar penyampaian konten secara satu arah menuju penciptaan lingkungan belajar berbasis data, interaktif, dan berpusat pada peserta didik. Pada mata pelajaran Informatika jenjang Sekolah Menengah Atas (SMA) Kelas XI, topik Topologi Jaringan Komputer (Bus, Ring, dan Star) merupakan fondasi penting dalam memahami arsitektur komunikasi data. Meskipun demikian, praktik pembelajaran di kelas sering kali masih bertumpu pada ilustrasi statis yang kurang mampu menggambarkan perilaku paket data secara dinamis, khususnya ketika terjadi gangguan putus kabel atau kegagalan titik tunggal (single point of failure).")
    body(doc, "Pada tahap Ujian Tengah Semester (UTS), Kelompok 3 telah mengembangkan purwarupa awal aplikasi web interaktif bernama Network Explorer: Misi Topologi yang menyediakan tiga bab materi topologi, lembar praktik pemasangan kabel berbasis seret dan lepas (drag-and-drop), simulasi ping pada Sandbox, kuis studi kasus, serta rapor cetak. Meskipun purwarupa awal tersebut telah memfasilitasi pembelajaran aktif, evaluasi terhadap kebutuhan pembelajaran modern memperlihatkan beberapa keterbatasan mendasar. Pertama, sistem belum merekam jejak belajar digital (digital traces) secara terstruktur sehingga kesulitan belajar peserta didik tidak dapat dianalisis secara diagnostik. Kedua, peserta didik belum memperoleh rekomendasi latihan adaptif yang disesuaikan dengan kelemahan konseptual masing-masing. Ketiga, belum tersedia pendampingan kecerdasan buatan generatif yang membimbing pemikiran kritis tanpa memicu ketergantungan. Keempat, alur navigasi antarhalaman masih memerlukan penataan urutan yang lebih eksplisit, serta belum terdapat pemisahan hak akses antara peran peserta didik dan pendidik maupun fitur motivasi belajar yang tetap menjaga privasi data.")
    body(doc, "Berdasarkan tantangan tersebut dan selaras dengan capaian pembelajaran mata kuliah Teknologi Informasi dan Komunikasi dalam Pendidikan (khususnya materi Pertemuan 12 mengenai Artificial Intelligence dan Generative AI dalam Pendidikan serta Pertemuan 13 mengenai Learning Analytics), pengembangan tahap Ujian Akhir Semester (UAS) dilakukan secara komprehensif. Pengembangan ini mengintegrasikan perekaman delapan data pembelajaran bermakna, Dashboard Learning Analytics empat tingkat, Asisten Belajar AI yang bertanggung jawab, pemandu alur belajar lima tahap, pemisahan pengalaman kerja antara guru dan siswa berbasis Role-Based Access Control (RBAC), serta papan peringkat siswa (Leaderboard) yang dilengkapi Mode Anonim dan isolasi keamanan basis data.")

    subheading(doc, "1.2", "Rumusan Masalah")
    body(doc, "Berdasarkan uraian latar belakang di atas, rumusan masalah dalam proyek pengembangan ini ditetapkan sebagai berikut:")
    numbered(doc, 1, "Data pembelajaran (Learning Data) apa saja yang relevan untuk direkam pada aplikasi Network Explorer agar terhindar dari metrik semu (vanity metrics) dan mampu mendukung pengambilan keputusan pedagogis?")
    numbered(doc, 2, "Bagaimana merancang dan mengintegrasikan Dashboard Learning Analytics empat tingkat (Descriptive, Diagnostic, Predictive etis tanpa pelabelan negatif, dan Prescriptive) ke dalam purwarupa multimedia interaktif?")
    numbered(doc, 3, "Bagaimana mengintegrasikan Asisten Belajar berbasis Generative AI yang mendorong pemikiran kritis, penguasaan teknik prompt, verifikasi keluaran, serta transparansi akademik peserta didik?")
    numbered(doc, 4, "Bagaimana menata alur navigasi belajar yang terarah sekaligus menerapkan kontrol akses berbasis peran (siswa dan guru) sehingga pendidik dapat memantau seluruh murid secara efektif tanpa mencampuradukkan tampilan tugas siswa?")
    numbered(doc, 5, "Bagaimana membangun fitur papan peringkat siswa (Leaderboard) yang meningkatkan motivasi belajar sehat tanpa melanggar privasi data pribadi peserta didik?")

    subheading(doc, "1.3", "Tujuan Pengembangan")
    body(doc, "Sejalan dengan rumusan masalah yang telah dirumuskan, tujuan pengembangan proyek ini meliputi:")
    numbered(doc, 1, "Menetapkan dan mengintegrasikan perekaman delapan jenis data pembelajaran bermakna yang mencakup aktivitas, keterampilan praktik, hasil asesmen bertingkat, refleksi tertulis, dan literasi AI.")
    numbered(doc, 2, "Membangun Dashboard Learning Analytics empat tingkat dengan visualisasi yang tepat guna untuk mendukung pemantauan mandiri peserta didik dan evaluasi kelas oleh pendidik.")
    numbered(doc, 3, "Menghadirkan Asisten Belajar AI yang dilengkapi gerbang pemikiran awal, pembangun prompt TCCO, daftar periksa verifikasi Ask AI, Then Think, laboratorium deteksi halusinasi, serta generator pernyataan transparansi 5W+C.")
    numbered(doc, 4, "Menyusun alur navigasi belajar lima langkah yang jelas pada Peta Misi serta menerapkan arsitektur RBAC dengan Dashboard Pemantauan Khusus Guru dan aturan keamanan Cloud Firestore.")
    numbered(doc, 5, "Mengimplementasikan Leaderboard Siswa yang menerapkan mekanisme anti-farming, Mode Anonim, pengecualian akun guru, dan isolasi koleksi basis data terpisah.")

    subheading(doc, "1.4", "Manfaat Pengembangan")
    body(doc, "Pengembangan multimedia pembelajaran interaktif Network Explorer versi UAS diharapkan memberikan manfaat secara teoretis maupun praktis sebagai berikut:")
    numbered(doc, 1, "Manfaat Teoretis: Memberikan kontribusi nyata mengenai model integrasi terpadu antara teori pembelajaran multimedia, Learning Analytics, Generative AI bertanggung jawab, serta tata kelola privasi data pada aplikasi pendidikan berbasis web.", bold_prefix="Manfaat Teoretis. ")
    numbered(doc, 2, "Manfaat bagi Peserta Didik: Membantu peserta didik memahami karakteristik topologi Bus, Ring, dan Star secara visual dan eksperimental, mengetahui letak kelemahan konsep secara objektif, memperoleh latihan adaptif, berlatih menggunakan AI secara etis, serta termotivasi secara sehat melalui papan peringkat.", bold_prefix="Manfaat bagi Peserta Didik. ")
    numbered(doc, 3, "Manfaat bagi Pendidik: Menyediakan dasbor pemantauan kelas terpusat untuk melihat siapa saja peserta didik yang aktif, sedang mengerjakan, atau telah tuntas, menganalisis butir soal tersulit, memberikan catatan evaluasi personal, serta mencetak rapor kelas maupun mengunduh data CSV.", bold_prefix="Manfaat bagi Pendidik. ")

    subheading(doc, "1.5", "Ruang Lingkup dan Batasan Sistem")
    body(doc, "Pengembangan sistem dibatasi pada ruang lingkup materi Informatika SMA Kelas XI pokok bahasan Topologi Jaringan Bus, Ring, Star, dan diagnostik paket ping. Aplikasi dibangun sebagai aplikasi web responsif berbasis Next.js yang dapat dijalankan dalam dua mode operasi, yaitu mode cloud menggunakan layanan Firebase Authentication dan Cloud Firestore untuk penggunaan nyata lintas perangkat, serta mode demo luring menggunakan penyimpanan lokal peramban (localStorage) untuk mendukung keperluan demonstrasi kelas tanpa ketergantungan penuh pada koneksi jaringan.")

    # =========================================================================
    # BAB II KAJIAN TEORI DAN LANDASAN KONSEPTUAL
    # =========================================================================
    chapter_title(doc, "BAB II", "KAJIAN TEORI DAN LANDASAN KONSEPTUAL", page_break=True)

    subheading(doc, "2.1", "Multimedia Pembelajaran Interaktif")
    body(doc, "Multimedia pembelajaran interaktif merupakan integrasi terpadu antara teks, grafis animasi, audio narasi, video, dan elemen simulasi yang memungkinkan peserta didik mengendalikan jalannya eksplorasi belajar secara aktif. Menurut Cognitive Theory of Multimedia Learning yang dikemukakan oleh Mayer (2021), manusia memproses informasi melalui dua saluran kognitif yang terpisah, yaitu saluran visual dan saluran auditorial, dengan kapasitas memori kerja yang terbatas. Oleh sebab itu, perancangan multimedia yang efektif harus menerapkan prinsip koherensi, sinyal visual yang jelas, segmentasi materi ke dalam tahapan kecil, serta keterlibatan aktif peserta didik dalam membangun representasi mental.")
    body(doc, "Sejalan dengan temuan Mawarni dan Muhtadi (2017), pengembangan media ajar digital interaktif mampu meningkatkan keterlibatan belajar apabila dirancang dengan navigasi yang runtut, umpan balik langsung, serta keseimbangan antara paparan konseptual dan latihan praktik. Pada konteks pembelajaran jaringan komputer, penerapan simulasi interaktif menjadi krusial karena konsep aliran paket dan dampak pemutusan kabel jauh lebih mudah dipahami melalui eksperimen visual dibandingkan hafalan definisi semata.")

    subheading(doc, "2.2", "Kerangka TPACK dan Model SAMR")
    body(doc, "Keberhasilan integrasi teknologi dalam pendidikan tidak ditentukan semata-mata oleh kecanggihan perangkat, melainkan oleh keselarasan antara penguasaan materi (Content Knowledge), strategi pembelajaran (Pedagogical Knowledge), dan pemanfaatan teknologi (Technological Knowledge) sebagaimana dirumuskan dalam kerangka Technological Pedagogical Content Knowledge atau TPACK oleh Mishra dan Koehler (2006). Pada sistem Network Explorer, ketiga ranah tersebut beririsan secara seimbang melalui penyajian konsep topologi jaringan yang akurat, pendekatan inkuiri terbimbing dan penilaian berbasis proses, serta teknologi simulasi web, analitik pembelajaran, dan kecerdasan buatan pedagogis.")
    body(doc, "Untuk mengukur tingkat transformasi teknologi pembelajaran, digunakan model SAMR (Substitution, Augmentation, Modification, Redefinition) yang dikembangkan oleh Puentedura (2014). Integrasi Learning Analytics yang menghasilkan jalur latihan adaptif personal sesuai kelemahan setiap siswa, simulasi gangguan kabel secara langsung, serta pendampingan audit kritis keluaran AI membawa aplikasi melampaui sekadar penggantian buku cetak (Substitution) menuju tingkat tertinggi, yaitu Redefinition, yakni penciptaan aktivitas belajar baru yang sebelumnya tidak mungkin dilakukan tanpa teknologi digital.")

    subheading(doc, "2.3", "Learning Analytics dalam Pendidikan")
    body(doc, "Long dan Siemens (2011) mendefinisikan Learning Analytics sebagai pengukuran, pengumpulan, analisis, dan pelaporan data mengenai peserta didik beserta konteks belajarnya untuk tujuan memahami dan mengoptimalkan proses pembelajaran serta lingkungan tempat pembelajaran itu berlangsung. Menurut materi perkuliahan Pertemuan 13 (Rahmadani, 2026b), penerapan Learning Analytics yang bermakna harus menghindari jebakan vanity metrics, yaitu metrik permukaan seperti sekadar jumlah klik acak yang tidak memberikan dasar keputusan pedagogis.")
    body(doc, "Sebaliknya, data pembelajaran yang dikumpulkan harus melalui alur pemaknaan yang runtut dari Data menuju Informasi, dilanjutkan ke Interpretasi, dan bermuara pada Keputusan pedagogis. Secara konseptual, analisis data pembelajaran terbagi ke dalam empat tingkatan yang saling melengkapi:")
    numbered(doc, 1, "Descriptive Analytics: Menjawab pertanyaan mengenai apa yang telah terjadi dalam proses belajar melalui ringkasan ketuntasan, waktu belajar, dan perkembangan nilai, termasuk membedakan secara tegas antara persentase penyelesaian (Progress) dan tingkat penguasaan konsep (Mastery).", bold_prefix="Descriptive Analytics. ")
    numbered(doc, 2, "Diagnostic Analytics: Menjawab pertanyaan mengapa suatu pola kesulitan terjadi dengan menelaah akurasi per konsep, kesalahan pemasangan kabel yang berulang, serta analisis butir soal untuk mengidentifikasi soal tersulit (Most Difficult Question).", bold_prefix="Diagnostic Analytics. ")
    numbered(doc, 3, "Predictive Analytics yang Etis: Memberikan sinyal peringatan dini atas potensi hambatan belajar dengan tetap mematuhi prinsip non-pelabelan (non-labeling). Hasil analisis tidak pernah diposisikan sebagai vonis mutlak terhadap kemampuan peserta didik, melainkan selalu disertai pertimbangan konteks alternatif seperti kendala perangkat atau pembelajaran dari sumber luar agar keputusan akhir tetap berada pada pertimbangan profesional pendidik.", bold_prefix="Predictive Analytics yang Etis. ")
    numbered(doc, 4, "Prescriptive Analytics: Menjawab pertanyaan mengenai langkah tindak lanjut yang paling tepat melalui rekomendasi belajar personal dan latihan adaptif yang terarah pada kelemahan spesifik masing-masing peserta didik.", bold_prefix="Prescriptive Analytics. ")
    body(doc, "Selain aspek teknis, Siemens (2013) dan Rahmadani (2026b) menegaskan bahwa data pembelajaran adalah data pengguna yang wajib dilindungi melalui lima pilar etika, yaitu Privasi (Privacy), Keamanan (Security), Transparansi (Transparency), Kontrol Akses (Access Control), dan Penggunaan Bertanggung Jawab (Responsible Use).")

    subheading(doc, "2.4", "Kecerdasan Buatan Generatif yang Bertanggung Jawab dalam Pendidikan")
    body(doc, "Pemanfaatan Generative AI dalam pendidikan membuka peluang besar untuk personalisasi bimbingan belajar, namun sekaligus memunculkan risiko ketergantungan kognitif, penurunan kemampuan berpikir mandiri, plagiarisme, dan penyebaran informasi keliru akibat fenomena halusinasi AI. Berdasarkan kerangka pedagogis Pertemuan 12 (Rahmadani, 2026a), pemanfaatan AI di ruang belajar harus ditempatkan sebagai mitra kolaborasi manusia dan AI (Human-AI Collaboration), bukan pengganti proses berpikir peserta didik.")
    body(doc, "Untuk mewujudkan pemanfaatan AI yang bertanggung jawab, terdapat empat mekanisme pedagogis utama yang diterapkan dalam sistem ini. Pertama, gerbang pemikiran awal yang mewajibkan peserta didik menuliskan pemahaman awalnya sebelum berkonsultasi dengan AI. Kedua, pelatihan penyusunan prompt terstruktur menggunakan kerangka TCCO (Task, Context, Constraint, Output) serta penyempurnaan bertahap (Iterative Prompting). Ketiga, budaya verifikasi kritis melalui siklus Ask AI, Then Think (Ask, Check, Compare, Improve, Explain) dan latihan mengenali kesalahan fakta maupun sitasi palsu pada laboratorium deteksi halusinasi. Keempat, pergeseran penilaian dari sekadar produk akhir menuju asesmen berbasis proses yang dilengkapi pernyataan transparansi penggunaan AI menggunakan kaidah 5W+C (What, Why, How, Verify, Contribution).")

    subheading(doc, "2.5", "Kontrol Akses Berbasis Peran dan Gamifikasi Berorientasi Privasi")
    body(doc, "Dalam sistem informasi pendidikan multi-pengguna, penerapan Role-Based Access Control (RBAC) merupakan standar keamanan fundamental untuk menjamin prinsip hak akses minimum (least privilege). Setiap peran memperoleh hak baca, hak tulis, dan antarmuka kerja yang sesuai dengan fungsinya. Peserta didik hanya diperkenankan membaca dan memperbarui data belajar miliknya sendiri tanpa dapat melihat email, riwayat kesalahan, atau refleksi pribadi teman sekelasnya. Sebaliknya, pendidik memerlukan akses terotorisasi untuk memantau perkembangan seluruh kelas, meninjau analitik agregat, serta mencatat umpan balik pedagogis tanpa harus diperlakukan sebagai peserta yang mengerjakan tugas siswa.")
    body(doc, "Di sisi lain, unsur gamifikasi seperti perolehan poin pengalaman (XP), tingkat kemahiran, dan papan peringkat (Leaderboard) dapat meningkatkan keterlibatan belajar apabila dirancang secara sehat. Guna mencegah tekanan sosial berlebihan dan pelanggaran privasi, papan peringkat pendidikan perlu memisahkan data ringkasan peringkat dari data profil sensitif, menyediakan opsi Mode Anonim agar siswa bebas menyembunyikan nama aslinya, mengecualikan akun pendidik dari kompetisi, serta menerapkan aturan anti-farming sehingga perolehan poin benar-benar mencerminkan capaian belajar autentik.")

    # =========================================================================
    # BAB III METODOLOGI DAN PERANCANGAN SISTEM
    # =========================================================================
    chapter_title(doc, "BAB III", "METODOLOGI DAN PERANCANGAN SISTEM", page_break=True)

    subheading(doc, "3.1", "Identitas Proyek dan Arsitektur Teknologi")
    body(doc, "Pengembangan Network Explorer versi UAS dilaksanakan menggunakan pendekatan rekayasa perangkat lunak iteratif yang memadukan perancangan instruksional, implementasi modular, dan pengujian otomatis berkelanjutan. Identitas proyek beserta spesifikasi arsitektur teknologi yang digunakan dirangkum pada Tabel 3.1.")

    make_table(
        doc,
        ["Komponen", "Keterangan dan Spesifikasi"],
        [
            ["Nama Aplikasi", "Network Explorer: Misi Topologi (Versi UAS)"],
            ["Mata Pelajaran dan Materi", "Informatika SMA Kelas XI, Topologi Jaringan Bus, Ring, Star, dan Diagnostik Ping"],
            ["Basis Pengembangan", "Lanjutan purwarupa UTS dengan penambahan Learning Analytics, Asisten AI, RBAC Guru/Siswa, Navigasi Terarah, dan Leaderboard"],
            ["Kerangka Kerja Frontend", "Next.js 16.3.8 (App Router, Turbopack), React 19.2.8, TypeScript (mode strict), Tailwind CSS v4"],
            ["Interaksi dan Visualisasi", "Pustaka @dnd-kit untuk papan pemasangan kabel dan meja kerja Sandbox, grafik SVG native (Donut, Line, Bar Chart)"],
            ["Layanan Backend dan Cloud", "Firebase Authentication, Cloud Firestore dengan Firestore Security Rules, serta Mode Demo Luring (localStorage)"],
            ["Layanan Asisten AI", "Endpoint /api/ai-tutor dengan Mesin Pedagogis Lokal terkurasi dan dukungan integrasi penyedia LLM opsional"],
            ["Kerangka Pengujian", "ESLint (React Compiler rules), TypeScript Compiler, Vitest 5.1.0 (unit test), dan Playwright 1.65.0 (E2E Chromium)"],
            ["Tautan Aplikasi Produksi", "https://network-explorer-xi.vercel.app/"],
            ["Kredensial Evaluasi Demo", "Siswa: navigator@example.com / password123; Guru: guru@example.com / guru12345; Kode Daftar Guru: GURU-UNIMED-2026"],
        ],
        widths=[4.4, 9.6],
        caption="Tabel 3.1 Identitas Proyek dan Spesifikasi Arsitektur Network Explorer Versi UAS",
    )

    subheading(doc, "3.2", "Penentuan Delapan Data Pembelajaran Relevan")
    body(doc, "Ketentuan proyek UAS mensyaratkan setiap kelompok menentukan minimal lima data pembelajaran yang relevan dengan purwarupa. Kelompok 3 merancang dan mengintegrasikan delapan jenis Learning Data yang masing-masing memiliki fungsi pedagogis terukur serta terhindar dari metrik permukaan. Pemetaan kedelapan data pembelajaran tersebut disajikan pada Tabel 3.2.")

    make_table(
        doc,
        ["No", "Data Pembelajaran", "Kategori", "Lokasi Perekaman", "Kegunaan Pedagogis"],
        [
            ["1", "Frekuensi login dan waktu sesi terakhir", "Data Aktivitas", "auth-session.ts dan analytics-store.ts", "Memantau konsistensi keterlibatan dan mendeteksi jeda akses belajar."],
            ["2", "Akses materi, eksplorasi media (diagram, narasi, video), dan durasi belajar (Time on Task)", "Data Aktivitas", "Halaman /materi/[topo]", "Mengetahui keterpenuhan prasyarat belajar sebelum siswa memasuki praktik dan kuis."],
            ["3", "Akurasi praktik pemasangan kabel (sambungan benar, sambungan ditolak, dan durasi terbaik)", "Data Keterampilan", "Halaman /praktik/[topo]", "Mendeteksi miskonsepsi aturan fisik tiap topologi, misalnya kesalahan urutan cincin Ring."],
            ["4", "Eksperimen Sandbox (jumlah uji ping, ping gagal, dan uji cabut kabel)", "Data Eksplorasi", "Halaman /sandbox/[topo]", "Mengukur apakah siswa benar-benar menguji dampak kegagalan titik tunggal."],
            ["5", "Riwayat evaluasi lengkap (Pre-Test, Post-Test, Latihan Adaptif), skor, durasi, dan jawaban per butir", "Data Asesmen", "Halaman /kuis", "Menghitung peningkatan skor (Pre ke Post Gain) dan mengidentifikasi butir soal tersulit."],
            ["6", "Refleksi tertulis Cek Pemahaman dan kesimpulan mandiri Studio AI", "Data Proses", "Halaman /materi/[topo] dan /asisten", "Menilai kualitas pemahaman dengan bahasa sendiri sebagai bukti asesmen proses."],
            ["7", "Jejak interaksi AI (fungsi dipilih, skor prompt TCCO, iterasi, verifikasi 5 langkah, Lab Halusinasi, dan 5W+C)", "Data Literasi AI", "Halaman /asisten", "Memastikan pemanfaatan AI berlangsung kritis, terverifikasi, dan transparan."],
            ["8", "Kronologi jejak digital (Digital Traces), ketuntasan 10 tahap, dan perolehan XP autentik", "Data Progres", "progress-store.ts dan analytics-store.ts", "Membandingkan Progress dengan Mastery serta mendasari pemeringkatan anti-farming."],
        ],
        widths=[0.8, 3.3, 2.0, 2.9, 5.0],
        caption="Tabel 3.2 Pemetaan Delapan Data Pembelajaran (Learning Data) Relevan pada Sistem",
    )

    body(doc, "Seluruh data direkam secara otomatis melalui modul src/lib/analytics-store.ts dan src/lib/progress-store.ts yang terhubung dengan React Context pada src/lib/store.tsx. Pada mode demo, data tersimpan terisolasi per akun di localStorage, sedangkan pada mode cloud data disinkronkan secara otomatis ke Cloud Firestore tanpa menghambat antarmuka pengguna.")

    subheading(doc, "3.3", "Perancangan Alur Navigasi Terarah Lima Tahap")
    body(doc, "Untuk mengatasi kebingungan pengguna mengenai urutan aktivitas yang harus dikerjakan terlebih dahulu hingga tahap akhir, sistem merancang mesin penentu langkah otomatis pada modul src/lib/learning-path.ts dan komponen penunjuk perjalanan src/components/journey-stepper.tsx. Alur belajar pada halaman Peta Misi (/misi) dibagi menjadi lima tahap berurutan yang selalu menandai langkah aktif saat ini:")
    numbered(doc, 1, "Tahap 1 (Pre-Test Diagnostik): Mengukur pengetahuan awal peserta didik sebelum mempelajari materi.", bold_prefix="Tahap 1. ")
    numbered(doc, 2, "Tahap 2 (Pelajari Materi Interaktif): Membaca tiga bab topologi (Bus, Ring, Star), mencoba diagram animasi, audio narasi, video, serta mengisi Cek Pemahaman tertulis.", bold_prefix="Tahap 2. ")
    numbered(doc, 3, "Tahap 3 (Praktik Pemasangan Kabel): Merakit kabel jaringan secara langsung dengan validasi aturan fisik per topologi.", bold_prefix="Tahap 3. ")
    numbered(doc, 4, "Tahap 4 (Simulasi Meja Kerja Sandbox): Mengirim paket ping dan menguji pemutusan kabel untuk mengamati isolasi gangguan.", bold_prefix="Tahap 4. ")
    numbered(doc, 5, "Tahap 5 (Kuis Akhir, Latihan Adaptif, dan Sertifikat): Menyelesaikan 10 studi kasus evaluasi, mengerjakan latihan adaptif apabila masih ada konsep lemah, serta mencetak Sertifikat Kompetensi Digital.", bold_prefix="Tahap 5. ")

    subheading(doc, "3.4", "Perancangan Keamanan Basis Data dan Kontrol Akses Peran")
    body(doc, "Penerapan RBAC memisahkan secara tegas pengalaman dan kewenangan antara peran siswa dan peran guru, baik pada lapisan antarmuka (src/components/chrome.tsx dan penjaga rute RequireRole) maupun pada lapisan keamanan server basis data (firestore.rules). Matriks hak akses antara kedua peran dirangkum pada Tabel 3.3.")

    make_table(
        doc,
        ["Aspek / Fitur", "Hak Akses Siswa (role: siswa)", "Hak Akses Guru (role: guru)"],
        [
            ["Halaman Beranda Kerja", "Peta Misi (/misi) sebagai panduan belajar 5 tahap", "Dashboard Pemantauan Murid (/guru) sebagai ruang kerja utama"],
            ["Dashboard Pemantauan (/guru)", "Diblokir penuh (menampilkan peringatan akses khusus pendidik)", "Akses penuh melihat daftar murid, progres, skor, detail, catatan guru, ekspor CSV, dan cetak rapor kelas"],
            ["Dashboard Analitik (/analitik)", "Hanya menampilkan Analitik Pribadi miliknya sendiri", "Langsung menampilkan Tinjauan Analitik Kelas tanpa data tugas pribadi"],
            ["Asisten AI (/asisten)", "7 fungsi belajar siswa, Gerbang Langkah 0, TCCO, Lab Halusinasi, 5W+C", "Langsung diarahkan ke Mode Draft Guru (studi kasus dan rubrik awal)"],
            ["Leaderboard (/leaderboard)", "Melihat peringkat kelas, kartu posisi sendiri, dan toggle Mode Anonim", "Melihat peringkat kelas untuk pemantauan; akun guru tidak ikut berkompetisi"],
            ["Aturan Firestore users/{uid}", "Hanya baca/tulis dokumen milik uid sendiri; dilarang mengubah field role menjadi guru", "Boleh membaca seluruh dokumen users/{uid} melalui fungsi verifikasi isGuru()"],
            ["Aturan Firestore leaderboard/{uid}", "Boleh membaca ringkasan peringkat; hanya boleh menulis dokumen uid sendiri", "Boleh membaca ringkasan peringkat seluruh siswa tanpa menulis skor kompetisi"],
        ],
        widths=[3.6, 5.2, 5.2],
        caption="Tabel 3.3 Matriks Kontrol Akses Berbasis Peran (RBAC) antara Siswa dan Guru",
    )

    body(doc, "Pemisahan koleksi leaderboard/{uid} dari koleksi users/{uid} merupakan keputusan arsitektur privasi yang krusial. Dengan pemisahan tersebut, peserta didik dapat melihat papan peringkat kelas secara langsung tanpa pernah memperoleh izin baca terhadap dokumen profil pribadi teman sekelasnya di users/{uid} yang memuat alamat email, daftar kesalahan jawaban kuis, maupun refleksi tertulis.")

    subheading(doc, "3.5", "Perancangan Strategi Pengujian Perangkat Lunak")
    body(doc, "Guna menjamin keandalan fungsional dan mutu kode sebelum diterapkan, strategi pengujian dirancang secara berlapis meliputi empat tahapan: (1) pemeriksaan aturan pemrograman dan kesesuaian React Compiler menggunakan ESLint; (2) pemeriksaan keamanan tipe data statis menggunakan TypeScript Compiler (tsc --noEmit); (3) pengujian unit otomatis menggunakan Vitest untuk menguji logika model topologi, progres XP, analitik empat tingkat, pemandu jalur belajar, manajemen sesi peran, daftar murid guru, mesin AI, serta pemeringkatan dan anonimitas leaderboard; dan (4) pengujian antarmuka menyeluruh (end-to-end) menggunakan Playwright pada peramban Chromium yang mensimulasikan alur tamu, siswa, dan guru secara nyata.")

    # =========================================================================
    # BAB IV IMPLEMENTASI DAN PEMBAHASAN
    # =========================================================================
    chapter_title(doc, "BAB IV", "IMPLEMENTASI DAN PEMBAHASAN", page_break=True)

    subheading(doc, "4.1", "Transformasi Purwarupa UTS ke Versi UAS dan Alur Belajar Terarah")
    body(doc, "Halaman beranda aplikasi (/beranda) dirancang ulang agar segera memperkenalkan nilai tambah utama versi UAS, yaitu alur belajar terstruktur, simulasi jaringan interaktif, Learning Analytics, Asisten Belajar AI, dan pemantauan kelas bagi pendidik. Setelah peserta didik masuk menggunakan akun siswa, sistem langsung menampilkan Peta Misi (/misi) yang memuat bilah langkah belajar 1 hingga 5, kartu penunjuk Langkah Berikutnya yang direkomendasikan secara dinamis, serta spanduk Rekomendasi Adaptif yang bersumber dari hasil analisis Learning Analytics.")

    add_image(doc, "01-beranda.png", "Gambar 4.1 Halaman Beranda Network Explorer Versi UAS")
    add_image(doc, "02-misi-adaptif.png", "Gambar 4.2 Halaman Peta Misi dengan Alur Belajar Terarah Lima Tahap dan Rekomendasi Adaptif")

    subheading(doc, "4.2", "Implementasi Materi Interaktif, Praktik Pemasangan Kabel, dan Sandbox")
    body(doc, "Setiap modul topologi (Bus, Ring, dan Star) disusun dalam tiga tahapan terintegrasi. Pada halaman materi (/materi/[topo]), peserta didik dapat berpindah di antara tiga tab multimedia, yakni Diagram Animasi, Narasi Audio berbasis Web Speech API, serta Video Ringkasan, lalu menuliskan pemahaman mandiri pada kotak Cek Pemahaman sebelum memeriksa kunci jawaban. Selanjutnya, halaman praktik (/praktik/[topo]) menyediakan papan perakitan kabel berbasis drag-and-drop dengan alternatif kontrol papan ketik yang menerapkan aturan validasi berbeda per topologi dan mencatat jumlah sambungan benar maupun ditolak secara otomatis.")
    body(doc, "Pada tahap eksplorasi eksperimental, halaman Sandbox (/sandbox/[topo]) ditingkatkan menjadi meja kerja interaktif yang memungkinkan peserta didik mencabut satu atau lebih kabel ke dalam Baki Kabel Lepas, menyambungkannya kembali dengan menyeret ujung kabel ke port perangkat, lalu menjalankan pengiriman paket ping untuk mengamati secara visual perbedaan ketahanan antara topologi Bus, Ring, dan Star terhadap gangguan titik tunggal.")

    add_image(doc, "03-materi-star.png", "Gambar 4.3 Halaman Materi Topologi Star dengan Media Interaktif dan Cek Pemahaman Tertulis")
    add_image(doc, "04-praktik-star.png", "Gambar 4.4 Lembar Praktik Pemasangan Kabel dengan Validasi Aturan Otomatis")
    add_image(doc, "05-sandbox-star.png", "Gambar 4.5 Meja Kerja Sandbox Interaktif untuk Simulasi Ping dan Uji Cabut Kabel")

    subheading(doc, "4.3", "Implementasi Evaluasi Bertingkat dan Latihan Adaptif")
    body(doc, "Halaman evaluasi (/kuis) menyediakan tiga mode asesmen yang saling terhubung dengan mesin analitik, yaitu Pre-Test Diagnostik untuk memetakan kemampuan awal, Kuis Akhir (Post-Test) berupa 10 soal studi kasus terapan dengan pembahasan teknis instan, serta Latihan Adaptif yang secara otomatis menyusun 3 soal latihan terfokus pada konsep terlemah peserta didik. Pada halaman hasil kuis (/kuis/hasil), sistem menyajikan perbandingan perkembangan skor serta tombol rekomendasi langsung menuju materi terkait atau sesi Latihan Adaptif.")

    add_image(doc, "06-kuis-modes.png", "Gambar 4.6 Halaman Kuis dengan Pilihan Mode Pre-Test, Kuis Akhir, dan Latihan Adaptif")
    add_image(doc, "07-kuis-hasil-adaptif.png", "Gambar 4.7 Halaman Hasil Kuis Akhir dengan Prescriptive Analytics Personal")

    subheading(doc, "4.4", "Implementasi Dashboard Learning Analytics Empat Tingkat")
    body(doc, "Halaman Dashboard Learning Analytics (/analitik) mengimplementasikan empat tingkatan analitik beserta lima jenis visualisasi SVG native yang dipilih sesuai pertanyaan analitiknya. Pada tingkat Descriptive Analytics, dua grafik donat menyandingkan Progress Penyelesaian dengan Indeks Penguasaan (Mastery) guna menegaskan bahwa penyelesaian seluruh tahapan belum tentu sebanding dengan penguasaan konsep, disertai grafik garis (Line Chart) tren skor Pre-Test hingga Post-Test. Pada tingkat Diagnostic Analytics, grafik batang (Bar Chart) akurasi per konsep, tabel analisis 10 butir soal yang menyorot soal tersulit, serta kartu alur Data menuju Keputusan membantu pengguna menemukan akar miskonsepsi.")
    body(doc, "Pada tingkat Predictive Analytics, indikator dini ditampilkan secara etis disertai catatan tegas bahwa sinyal tersebut bukanlah label kemampuan peserta didik dan selalu membutuhkan konfirmasi kontekstual. Pada tingkat Prescriptive Analytics, sistem menghasilkan daftar rekomendasi tindakan prioritas yang tertaut langsung ke modul, Sandbox, maupun Latihan Adaptif. Selaras dengan kebijakan kontrol akses peran, akun siswa hanya menampilkan Analitik Pribadi dilengkapi kontrol privasi (jeda pencatatan, ekspor JSON, dan hapus jejak), sedangkan akun guru langsung menampilkan Tinjauan Analitik Kelas yang terfokus pada pemantauan agregat.")

    add_image(doc, "08-analitik-siswa.png", "Gambar 4.8 Dashboard Learning Analytics Khusus Peserta Didik (Data Pribadi)")
    add_image(doc, "09-analitik-guru.png", "Gambar 4.9 Dashboard Learning Analytics Khusus Pendidik (Tinjauan Kelas)")

    subheading(doc, "4.5", "Implementasi Asisten Belajar AI yang Bertanggung Jawab")
    body(doc, "Halaman Asisten Belajar AI (/asisten) mewujudkan prinsip pemanfaatan Generative AI secara bertanggung jawab sesuai materi Pertemuan 12. Bagi peserta didik, sistem menyajikan tujuh peran bimbingan (Explain, Example, Practice, Feedback, Brainstorm, Compare, dan Reflect) yang terhubung otomatis dengan topik terlemah hasil analitik. Sebelum mengajukan pertanyaan, siswa wajib mengisi Langkah 0 berupa pemikiran awal mandiri sebagai gerbang anti-ketergantungan. Pembangun prompt TCCO menilai kelengkapan empat unsur prompt (Task, Context, Constraint, Output) secara langsung dan menyediakan tombol Iterative Prompting.")
    body(doc, "Setiap keluaran AI dilengkapi peringatan verifikasi sumber primer, daftar periksa lima langkah Ask AI, Then Think, kotak simpulan mandiri dengan bahasa sendiri, tab Lab Deteksi Halusinasi yang memuat tiga skenario kesalahan fakta atau sitasi palsu, serta tab Pernyataan Transparansi 5W+C yang otomatis terintegrasi ke Rapor Proses. Sementara itu, ketika diakses oleh akun guru, antarmuka otomatis terbuka pada Mode Draft Guru untuk membantu penyusunan draf studi kasus dan rubrik awal dengan penegasan bahwa keputusan pedagogis akhir sepenuhnya berada di tangan pendidik.")

    add_image(doc, "10-asisten-ai.png", "Gambar 4.10 Halaman Asisten Belajar AI dengan Gerbang Pemikiran Awal, TCCO, dan Verifikasi")

    subheading(doc, "4.6", "Implementasi Dashboard Pemantauan Khusus Guru")
    body(doc, "Sebagai penyempurnaan atas masukan mengenai perlunya ruang kerja pendidik yang berbeda dari halaman pengerjaan tugas siswa, sistem menyediakan Dashboard Pemantauan Murid pada rute /guru yang dilindungi oleh komponen RequireRole. Akun siswa yang mencoba mengakses alamat ini akan diblokir secara otomatis dan diarahkan kembali ke Peta Misi. Melalui halaman /guru, pendidik dapat melihat ringkasan KPI kelas (total murid terdaftar, murid aktif, murid tuntas sertifikasi, dan rata-rata skor kuis), menyaring daftar murid berdasarkan status (Semua, Tuntas, Sedang Mengerjakan, atau Belum Mulai), mencari nama murid, serta memeriksa rincian progres 10 tahap, skor kuis, dan aktivitas setiap murid.")
    body(doc, "Selain pemantauan pasif, pendidik dapat menuliskan dan menyimpan Catatan Evaluasi Guru per murid, mengekspor rekapitulasi kelas ke dalam berkas CSV untuk pengolahan nilai lanjutan, serta mencetak Rapor Rekap Kelas dalam format PDF siap arsip. Seluruh bilah navigasi untuk akun guru juga disesuaikan secara khusus (Dashboard Guru, Analitik Kelas, Leaderboard, Draft AI Guru, dan Pratinjau Materi) sehingga guru tidak lagi melihat tampilan pengumpulan tugas seperti pada akun siswa.")

    add_image(doc, "13-dashboard-guru.png", "Gambar 4.11 Dashboard Pemantauan Murid Khusus Guru pada Rute /guru")

    subheading(doc, "4.7", "Implementasi Leaderboard Siswa Berorientasi Privasi dan Anti-Farming")
    body(doc, "Halaman Leaderboard Siswa (/leaderboard) dirancang untuk menghadirkan motivasi belajar yang sehat dan transparan. Tata letak halaman menampilkan Podium 3 Besar untuk peringkat teratas, kartu Posisimu Saat Ini khusus bagi siswa yang memperlihatkan peringkat aktual serta selisih XP menuju satu tingkat di atasnya, filter berdasarkan tingkat kelas (Semua, X, XI, XII), kolom pencarian nama atau alias, serta tabel peringkat lengkap.")
    body(doc, "Tiga prinsip tata kelola diterapkan secara ketat pada fitur ini. Pertama, isolasi privasi: sinkronisasi cloud hanya mengirim ringkasan publik ke koleksi leaderboard/{uid} tanpa menyertakan email, refleksi tertulis, atau butir jawaban salah, dan siswa dapat mengaktifkan Mode Anonim kapan saja agar namanya tampil sebagai alias terenkode seperti Peserta #XXXX di hadapan pengguna lain. Kedua, prinsip keadilan peran: akun berstatus guru secara otomatis dikecualikan dari daftar peserta peringkat. Ketiga, mekanisme anti-farming: perhitungan peringkat mengacu pada XP autentik dari ketuntasan misi dan kuis dengan aturan penentu seri (tie-breaker) berurutan mulai dari total XP, skor kuis terbaik, jumlah tahap selesai, hingga urutan alfabetis nama.")

    add_image(doc, "14-leaderboard-siswa.png", "Gambar 4.12 Halaman Leaderboard Siswa dengan Podium, Mode Anonim, dan Isolasi Privasi")

    subheading(doc, "4.8", "Implementasi Sertifikat Kompetensi Berbasis Proses dan Rapor Cetak")
    body(doc, "Halaman Sertifikat dan Rapor (/cetak) menerapkan asesmen berbasis proses. Sertifikat Kompetensi Digital ber-ID verifikasi unik (format NE-XI-2026-XXXXXX) baru terbuka apabila peserta didik memenuhi lima syarat utuh, yakni menyelesaikan tiga bab materi, tiga lembar praktik kabel, tiga simulasi Sandbox, mencapai nilai kuis minimal 80 persen, serta memiliki minimal satu bukti proses berupa refleksi tertulis Cek Pemahaman atau verifikasi kritis Studio AI. Halaman ini juga dilengkapi lembar Rapor Proses yang merangkum hasil Learning Analytics dan Pernyataan Transparansi AI 5W+C dengan gaya cetak khusus kertas putih hemat tinta.")

    add_image(doc, "11-sertifikat-rapor.png", "Gambar 4.13 Halaman Sertifikat Kompetensi Digital Berbasis Proses dan Rapor Cetak")

    subheading(doc, "4.9", "Analisis Hasil Pengujian, Ketercapaian TPACK/SAMR, dan Pembagian Tugas")
    body(doc, "Seluruh komponen kode, aturan keamanan basis data, hingga antarmuka pengguna telah diverifikasi secara otomatis setelah penambahan fitur terakhir. Rekapitulasi hasil pengujian perangkat lunak disajikan pada Tabel 4.1.")

    make_table(
        doc,
        ["Tahap Verifikasi", "Perangkat / Perintah", "Hasil Pengujian", "Status"],
        [
            ["Analisis Statis Kode", "ESLint (termasuk aturan React Compiler)", "0 galat (error) dan 0 peringatan (warning)", "Lulus 100%"],
            ["Pemeriksaan Tipe Data", "TypeScript Compiler (tsc --noEmit)", "0 galat tipe data pada seluruh modul", "Lulus 100%"],
            ["Pengujian Unit Otomatis", "Vitest 5.1.0 (9 berkas pengujian)", "59 dari 59 kasus uji lulus (termasuk analitik, AI, RBAC, daftar guru, dan leaderboard)", "Lulus 100%"],
            ["Build Produksi Web", "Next.js 16.3.8 Turbopack (next build)", "Kompilasi sukses dan 29 rute produksi terbangun bersih", "Lulus 100%"],
            ["Pengujian End-to-End", "Playwright 1.65.0 (peramban Chromium)", "14 dari 14 skenario pengguna tamu, siswa, dan guru lulus penuh", "Lulus 100%"],
            ["Deploy Keamanan Cloud", "Firebase CLI (firestore:rules)", "Kompilasi dan rilis firestore.rules ke proyek misi-topologi berhasil", "Aktif"],
        ],
        widths=[3.2, 3.6, 5.2, 2.0],
        caption="Tabel 4.1 Hasil Pengujian Kualitas dan Verifikasi Otomatis Sistem",
    )

    body(doc, "Pengujian end-to-end Playwright secara eksplisit memverifikasi invarian keamanan sistem, antara lain bahwa siswa yang membuka /analitik hanya melihat analitik pribadinya dan diblokir dari /guru, siswa yang membuka /leaderboard tidak menerima kebocoran alamat email teman sekelasnya serta dapat mengaktifkan Mode Anonim, dan guru yang masuk melalui akun pendidik langsung diarahkan ke Dashboard Pemantauan Murid, dapat menyimpan catatan evaluasi, serta meninjau analitik kelas. Selanjutnya, pemetaan ketercapaian kerangka TPACK dan model SAMR ditampilkan pada Tabel 4.2.")

    make_table(
        doc,
        ["Kerangka Evaluasi", "Wujud Ketercapaian pada Network Explorer Versi UAS"],
        [
            ["TPACK (Content, Pedagogy, Technology)", "Memadukan konten Topologi Bus, Ring, Star dan diagnostik ping secara akurat, pedagogi inkuiri terbimbing, asesmen Pre-Test/Post-Test, scaffolding adaptif, dan penilaian berbasis proses, serta teknologi simulasi interaktif, Learning Analytics empat tingkat, Asisten AI bertanggung jawab, RBAC, dan Leaderboard privasi."],
            ["SAMR Tingkat Redefinition", "Mencapai tingkat Redefinition karena sistem secara dinamis menghasilkan latihan adaptif personal berbasis jejak data belajar setiap peserta didik, menyediakan eksperimen cabut kabel real-time, memfasilitasi audit kritis halusinasi AI, serta menghadirkan pemantauan kelas berbasis bukti proses bagi pendidik."],
        ],
        widths=[4.2, 9.8],
        caption="Tabel 4.2 Pemetaan Ketercapaian Kerangka TPACK dan Model SAMR",
    )

    body(doc, "Pelaksanaan proyek melibatkan kontribusi terkoordinasi dari seluruh anggota Kelompok 3 sebagaimana dirinci pada Tabel 4.3, disertai pernyataan transparansi penggunaan AI sesuai prinsip integritas akademik.")

    make_table(
        doc,
        ["Anggota Kelompok", "Peran Utama", "Kontribusi Spesifik pada Tahap UAS"],
        [
            ["Malvin Andrew Depari (5253151010)", "Materi, Learning Data, dan Pedagogi", "Menetapkan delapan Learning Data relevan, memvalidasi akurasi materi Topologi Bus, Ring, dan Star, merancang Cek Pemahaman refleksi tertulis, serta menyelaraskan proyek dengan rubrik UAS."],
            ["Abdi Raihan Wibowo (5253151026)", "Desain Visual dan Pengembangan Web", "Mengembangkan arsitektur aplikasi Next.js, Dashboard Learning Analytics empat tingkat, grafik SVG, Asisten Belajar AI, Dashboard Pemantauan Guru (/guru), Leaderboard privasi (/leaderboard), serta aturan keamanan Firestore."],
            ["Citra Olivia Lestari (5253151011)", "Interaksi, Navigasi, dan Modul", "Merancang alur navigasi belajar terarah lima tahap pada Peta Misi, mengembangkan interaksi meja kerja Sandbox cabut kabel, serta menyusun struktur Modul Penggunaan Multimedia."],
            ["Pniel Jhonspandi Nababan (5253151013)", "Asesmen, Pengujian, dan Dokumentasi", "Merancang evaluasi bertingkat (Pre-Test, Post-Test 10 soal, dan Latihan Adaptif 3 soal), memvalidasi 59 unit test dan 14 skenario E2E Playwright, serta menyusun skenario demonstrasi proyek."],
        ],
        widths=[3.5, 3.3, 7.2],
        caption="Tabel 4.3 Pembagian Tugas dan Kontribusi Anggota Kelompok 3",
    )

    para(doc, "Pernyataan Transparansi Penggunaan AI (5W+C): Dalam penyusunan proyek ini, Generative AI dimanfaatkan sebagai alat bantu pemrograman, perancangan struktur dokumentasi, dan verifikasi kualitas pengujian perangkat lunak. Seluruh penetapan desain pedagogis, pemilihan delapan data pembelajaran, validasi kebenaran teknis materi topologi jaringan, eksekusi pengujian otomatis maupun demonstrasi langsung, serta tanggung jawab penuh atas hasil akhir karya diperiksa dan ditetapkan oleh seluruh anggota Kelompok 3.", italic=True, align="justify", size=11.5, space_after=8, indent=True)

    # =========================================================================
    # BAB V PENUTUP
    # =========================================================================
    chapter_title(doc, "BAB V", "PENUTUP", page_break=True)

    subheading(doc, "5.1", "Kesimpulan")
    body(doc, "Berdasarkan seluruh rangkaian perancangan, implementasi, dan pengujian yang telah dilakukan, dapat ditarik lima kesimpulan utama yang menjawab rumusan masalah proyek ini:")
    numbered(doc, 1, "Sistem Network Explorer versi UAS telah berhasil menetapkan dan mengintegrasikan perekaman delapan jenis Learning Data yang bermakna pedagogis, melampaui persyaratan minimal lima data, sekaligus menghindari metrik permukaan (vanity metrics).")
    numbered(doc, 2, "Dashboard Learning Analytics empat tingkat (Descriptive, Diagnostic, Predictive yang etis tanpa pelabelan negatif, dan Prescriptive) telah terintegrasi penuh dengan lima visualisasi SVG native serta alur pemaknaan Data menuju Keputusan untuk mengarahkan latihan adaptif personal.")
    numbered(doc, 3, "Integrasi Asisten Belajar berbasis Generative AI pada rute /asisten telah menerapkan pendekatan pedagogis yang bertanggung jawab melalui Gerbang Pemikiran Awal Langkah 0, kerangka prompt TCCO, daftar periksa verifikasi Ask AI, Then Think, Lab Deteksi Halusinasi, serta pernyataan transparansi 5W+C.")
    numbered(doc, 4, "Penataan alur navigasi lima tahap pada Peta Misi serta penerapan kontrol akses berbasis peran (RBAC) pada antarmuka dan Cloud Firestore telah memisahkan secara tegas ruang kerja peserta didik dan pendidik. Guru kini memperoleh Dashboard Pemantauan Murid (/guru) dan Analitik Kelas secara khusus tanpa bercampur dengan antarmuka tugas siswa.")
    numbered(doc, 5, "Fitur Leaderboard Siswa (/leaderboard) telah berhasil dibangun dengan prinsip motivasi sehat anti-farming, dukungan Mode Anonim, pengecualian akun guru, dan pemisahan koleksi leaderboard/{uid} sehingga privasi data pribadi siswa tetap terlindungi sepenuhnya. Seluruh sistem lolos verifikasi otomatis 100 persen (0 galat lint dan tipe data, 59 unit test, dan 14 pengujian E2E).")

    subheading(doc, "5.2", "Saran")
    body(doc, "Sebagai upaya peningkatan keberlanjutan dan pemanfaatan produk di lingkungan sekolah, beberapa saran yang dapat direkomendasikan antara lain:")
    numbered(doc, 1, "Bagi Pendidik dan Sekolah: Disarankan memanfaatkan kombinasi fitur Pre-Test, Dashboard Pemantauan Guru, dan Rapor Proses PDF untuk menilai perkembangan kompetensi siswa secara holistik, serta selalu mendiskusikan temuan butir soal tersulit di kelas tanpa memberikan label negatif kepada peserta didik.", bold_prefix="Bagi Pendidik dan Sekolah. ")
    numbered(doc, 2, "Bagi Pengembangan Selanjutnya: Sistem dapat diperluas dengan menambahkan cakupan materi jaringan lanjutan seperti Topologi Mesh, Hybrid, dan konfigurasi IP Subnetting, integrasi manajemen multi-kelas dengan kode kelas guru, serta uji coba lapangan skala luas di SMA mitra guna mengukur efektivitas peningkatan hasil belajar secara empiris.", bold_prefix="Bagi Pengembangan Selanjutnya. ")

    # =========================================================================
    # DAFTAR PUSTAKA
    # =========================================================================
    chapter_title(doc, None, "DAFTAR PUSTAKA", page_break=True)
    refs = [
        "Long, P., & Siemens, G. (2011). Penetrating the fog: Analytics in learning and education. EDUCAUSE Review, 46(5), 31-40.",
        "Mawarni, S., & Muhtadi, A. (2017). Pengembangan digital book interaktif mata kuliah pengembangan multimedia pembelajaran interaktif untuk mahasiswa teknologi pendidikan. Jurnal Inovasi Teknologi Pendidikan, 4(1), 84-96.",
        "Mayer, R. E. (2021). Multimedia learning (3rd ed.). Cambridge University Press.",
        "Mishra, P., & Koehler, M. J. (2006). Technological pedagogical content knowledge: A framework for teacher knowledge. Teachers College Record, 108(6), 1017-1054.",
        "Puentedura, R. R. (2014). Learning, technology, and the SAMR model: Goals, processes, and practice. Hippasus.",
        "Rahmadani, R. (2026a). Artificial Intelligence dan Generative AI dalam Pendidikan (Materi Pertemuan 12 Mata Kuliah TIK dalam Pendidikan). Program Studi Pendidikan Teknologi Informatika dan Komputer, Universitas Negeri Medan.",
        "Rahmadani, R. (2026b). Learning Analytics (Materi Pertemuan 13 Mata Kuliah TIK dalam Pendidikan). Program Studi Pendidikan Teknologi Informatika dan Komputer, Universitas Negeri Medan.",
        "Saluky, & Riyanto, O. R. (2025). Multimedia pembelajaran. CV. Zenius Publisher.",
        "Siemens, G. (2013). Learning analytics: The emergence of a discipline. American Behavioral Scientist, 57(10), 1380-1400.",
    ]
    for r in refs:
        reference_entry(doc, r)

    out_path = os.path.join(BASE, "Makalah_Laporan_Proyek_UAS_Network_Explorer_Kelompok3.docx")
    doc.save(out_path)
    assert_no_em_dash(out_path)
    print("saved and verified (0 em-dash):", out_path)
    return out_path


# =============================================================================
# 2. MODUL PENGGUNAAN MULTIMEDIA (FORMAT MAKALAH / MODUL AKADEMIK)
# =============================================================================
def build_modul_penggunaan():
    doc = new_doc()
    add_cover(
        doc,
        "MODUL PENGGUNAAN MULTIMEDIA PEMBELAJARAN INTERAKTIF",
        "PANDUAN OPERASIONAL PESERTA DIDIK DAN PENDIDIK PADA APLIKASI NETWORK EXPLORER",
        "EDISI UJIAN AKHIR SEMESTER: LEARNING ANALYTICS, ASISTEN AI, DASHBOARD GURU, DAN LEADERBOARD PRIVASI",
        "Disusun untuk Memenuhi Tugas Ujian Akhir Semester Mata Kuliah Teknologi Informasi dan Komunikasi dalam Pendidikan",
    )

    # KATA PENGANTAR
    chapter_title(doc, None, "KATA PENGANTAR", page_break=True)
    body(doc, "Puji syukur ke hadirat Tuhan Yang Maha Esa atas limpahan rahmat-Nya sehingga Modul Penggunaan Multimedia Pembelajaran Interaktif Network Explorer: Misi Topologi ini dapat disusun dengan lengkap dan sistematis. Modul ini merupakan dokumen pendamping resmi bagi peserta didik, pendidik, serta evaluator dalam mengoperasikan seluruh fitur aplikasi berbasis web yang dikembangkan oleh Kelompok 3 pada mata kuliah Teknologi Informasi dan Komunikasi dalam Pendidikan.")
    body(doc, "Seiring dengan perluasan fitur aplikasi pada tahap Ujian Akhir Semester (UAS), modul ini menyajikan panduan operasional secara runtut mulai dari persiapan teknis, pemahaman peta navigasi berbasis peran, langkah belajar terarah lima tahap bagi peserta didik, pemanfaatan Dashboard Learning Analytics dan Asisten Belajar AI secara etis, partisipasi pada Leaderboard Siswa dengan Mode Anonim, hingga panduan pemantauan kelas pada Dashboard Khusus Guru serta pengelolaan aturan keamanan Firebase.")
    body(doc, "Penulis mengucapkan terima kasih kepada Ibu Reni Rahmadani, S.Kom., M.Kom. dan Bapak Prof. Dr. Sahat Siagian, M.Pd. selaku dosen pengampu atas arahan selama pengembangan media ini. Besar harapan penulis agar modul ini mampu mempermudah pemanfaatan aplikasi Network Explorer di ruang kelas Informatika SMA Kelas XI secara efektif, aman, dan bermakna.")
    para(doc, "", size=10, space_after=6)
    para(doc, "Medan, 2026", align="right", size=12, space_after=2)
    para(doc, "Penyusun,", align="right", size=12, space_after=24)
    para(doc, "Kelompok 3", bold=True, align="right", size=12, space_after=0)

    # DAFTAR ISI MODUL
    add_toc_list(doc, "DAFTAR ISI", [
        ("KATA PENGANTAR", 0),
        ("DAFTAR ISI", 0),
        ("DAFTAR TABEL", 0),
        ("DAFTAR GAMBAR", 0),
        ("BAB I PENDAHULUAN MODUL", 0),
        ("1.1 Deskripsi Umum dan Tujuan Penyusunan Modul", 1),
        ("1.2 Sasaran Pengguna dan Prasyarat Kompetensi", 1),
        ("1.3 Spesifikasi Teknis, Mode Operasi, dan Kredensial Akses", 1),
        ("BAB II STRUKTUR ANTARMUKA DAN PETA NAVIGASI SISTEM", 0),
        ("2.1 Pemisahan Navigasi Berdasarkan Peran Pengguna", 1),
        ("2.2 Peta Rute dan Fungsi Seluruh Halaman Aplikasi", 1),
        ("2.3 Alur Belajar Terarah Lima Tahap pada Peta Misi", 1),
        ("BAB III PANDUAN OPERASIONAL BAGI PESERTA DIDIK", 0),
        ("3.1 Pendaftaran Akun, Masuk Sistem, dan Pengambilan Pre-Test Diagnostik", 1),
        ("3.2 Eksplorasi Materi Interaktif dan Pengisian Cek Pemahaman", 1),
        ("3.3 Pelaksanaan Praktik Pemasangan Kabel dan Simulasi Sandbox", 1),
        ("3.4 Pengerjaan Kuis Akhir dan Latihan Adaptif Terfokus", 1),
        ("3.5 Pembacaan Dashboard Learning Analytics Pribadi", 1),
        ("3.6 Penggunaan Asisten Belajar AI secara Kritis dan Bertanggung Jawab", 1),
        ("3.7 Penggunaan Leaderboard Siswa dan Pengaktifan Mode Anonim", 1),
        ("3.8 Pencetakan Rapor Proses dan Sertifikat Kompetensi Digital", 1),
        ("BAB IV PANDUAN OPERASIONAL BAGI PENDIDIK (GURU)", 0),
        ("4.1 Pendaftaran Akun Guru dan Masuk ke Ruang Kerja Pendidik", 1),
        ("4.2 Pengoperasian Dashboard Pemantauan Murid (/guru)", 1),
        ("4.3 Interpretasi Dashboard Analitik Kelas (/analitik) secara Etis", 1),
        ("4.4 Pemanfaatan Mode Draft Guru pada Asisten AI dan Pemantauan Leaderboard", 1),
        ("4.5 Pengelolaan Keamanan Basis Data Firestore bagi Administrator", 1),
        ("BAB V TATA KELOLA PRIVASI, AKSESIBILITAS, DAN PEMECAHAN MASALAH", 0),
        ("5.1 Kendali Privasi Data Peserta Didik", 1),
        ("5.2 Dukungan Aksesibilitas Antarmuka", 1),
        ("5.3 Panduan Pemecahan Masalah (Troubleshooting)", 1),
        ("BAB VI PENUTUP", 0),
        ("DAFTAR RUJUKAN", 0),
    ])

    add_toc_list(doc, "DAFTAR TABEL", [
        ("Tabel 1.1 Spesifikasi Teknis Minimum dan Kredensial Akses Network Explorer", 0),
        ("Tabel 2.1 Peta Rute dan Fungsi Halaman pada Aplikasi Network Explorer", 0),
        ("Tabel 5.1 Daftar Kendala Umum dan Langkah Pemecahan Masalah", 0),
    ])

    add_toc_list(doc, "DAFTAR GAMBAR", [
        ("Gambar 2.1 Tampilan Halaman Beranda Network Explorer", 0),
        ("Gambar 2.2 Tampilan Peta Misi dengan Panduan Lima Tahap Belajar Terarah", 0),
        ("Gambar 3.1 Tampilan Halaman Materi Topologi Star dan Cek Pemahaman Tertulis", 0),
        ("Gambar 3.2 Tampilan Lembar Praktik Pemasangan Kabel Topologi Star", 0),
        ("Gambar 3.3 Tampilan Meja Kerja Sandbox Interaktif dengan Baki Kabel Lepas", 0),
        ("Gambar 3.4 Tampilan Pilihan Tiga Mode Evaluasi pada Halaman Kuis", 0),
        ("Gambar 3.5 Tampilan Hasil Kuis Akhir dan Rekomendasi Latihan Adaptif", 0),
        ("Gambar 3.6 Tampilan Dashboard Learning Analytics Pribadi Peserta Didik", 0),
        ("Gambar 3.7 Tampilan Studio Asisten Belajar AI dan Daftar Periksa Verifikasi", 0),
        ("Gambar 3.8 Tampilan Leaderboard Siswa dengan Podium dan Toggle Mode Anonim", 0),
        ("Gambar 3.9 Tampilan Sertifikat Kompetensi Digital dan Rapor Proses Siap Cetak", 0),
        ("Gambar 4.1 Tampilan Dashboard Pemantauan Murid Khusus Guru (/guru)", 0),
        ("Gambar 4.2 Tampilan Dashboard Analitik Kelas Khusus Guru (/analitik)", 0),
        ("Gambar 5.1 Tampilan Halaman Panduan Penggunaan di Dalam Aplikasi (/panduan)", 0),
    ])

    # =========================================================================
    # BAB I PENDAHULUAN MODUL
    # =========================================================================
    chapter_title(doc, "BAB I", "PENDAHULUAN MODUL", page_break=True)

    subheading(doc, "1.1", "Deskripsi Umum dan Tujuan Penyusunan Modul")
    body(doc, "Network Explorer: Misi Topologi adalah aplikasi multimedia pembelajaran interaktif berbasis web yang dirancang untuk mendukung pembelajaran mata pelajaran Informatika SMA Kelas XI pada materi Topologi Jaringan Komputer (Bus, Ring, dan Star) serta diagnostik paket ping. Berbeda dengan bahan ajar digital statis, aplikasi ini memadukan penyajian multimedia interaktif, laboratorium perakitan kabel dan simulasi gangguan, sistem perekaman delapan data pembelajaran, Dashboard Learning Analytics empat tingkat, Asisten Belajar AI yang bertanggung jawab, pemantauan kelas khusus guru, serta papan peringkat siswa berorientasi privasi.")
    body(doc, "Penyusunan modul ini bertujuan menyediakan pedoman operasional yang jelas, terstruktur, dan mudah diikuti agar peserta didik dapat belajar secara mandiri sesuai urutan pedagogis yang tepat, sementara pendidik dapat memantau kemajuan belajar seluruh kelas dan menafsirkan data analitik secara objektif dan etis.")

    subheading(doc, "1.2", "Sasaran Pengguna dan Prasyarat Kompetensi")
    body(doc, "Modul ini ditujukan kepada dua kelompok pengguna utama dengan hak akses yang dibedakan oleh sistem:")
    numbered(doc, 1, "Peserta Didik SMA Kelas XI: Pengguna yang mengikuti rangkaian lima tahap pembelajaran mulai dari Pre-Test Diagnostik hingga perolehan Sertifikat Kompetensi Digital. Prasyarat awal yang dibutuhkan hanyalah kemampuan dasar mengoperasikan peramban web pada komputer, laptop, atau perangkat seluler.", bold_prefix="Peserta Didik. ")
    numbered(doc, 2, "Pendidik (Guru Informatika) dan Evaluator: Pengguna yang memantau keterlibatan murid, meninjau analitik kinerja kelas, memberikan catatan evaluasi individual, mengekspor rekapitulasi nilai, serta menyusun draf studi kasus pembelajaran menggunakan Mode Draft Guru.", bold_prefix="Pendidik dan Evaluator. ")

    subheading(doc, "1.3", "Spesifikasi Teknis, Mode Operasi, dan Kredensial Akses")
    body(doc, "Aplikasi Network Explorer tidak memerlukan instalasi perangkat lunak khusus karena berjalan langsung melalui peramban web modern. Sistem mendukung dua mode operasi, yaitu Mode Cloud (terhubung ke Firebase Authentication dan Cloud Firestore sehingga data tersinkronisasi lintas perangkat secara waktu nyata) serta Mode Demo Luring (menyimpan data sementara pada peramban lokal untuk demonstrasi tanpa ketergantungan jaringan). Ringkasan spesifikasi minimum dan kredensial akses tercantum pada Tabel 1.1.")

    make_table(
        doc,
        ["Komponen", "Spesifikasi dan Informasi Akses"],
        [
            ["Perangkat Keras", "Komputer desktop, laptop, tablet, atau ponsel pintar dengan layar minimal lebar 360 piksel"],
            ["Peramban Web", "Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari versi mutakhir"],
            ["Koneksi Internet", "Diperlukan untuk akses daring, sinkronisasi Firebase, dan pemutaran video; Mode Demo tetap berjalan luring"],
            ["Tautan Produksi Daring", "https://network-explorer-xi.vercel.app/"],
            ["Akun Demo Peserta Didik", "Email: navigator@example.com | Kata sandi: password123"],
            ["Akun Demo Pendidik (Guru)", "Email: guru@example.com | Kata sandi: guru12345"],
            ["Kode Akses Daftar Guru Baru", "GURU-UNIMED-2026 (dimasukkan pada formulir pendaftaran saat memilih peran Guru)"],
        ],
        widths=[4.6, 9.4],
        caption="Tabel 1.1 Spesifikasi Teknis Minimum dan Kredensial Akses Network Explorer",
    )

    # =========================================================================
    # BAB II STRUKTUR ANTARMUKA DAN PETA NAVIGASI SISTEM
    # =========================================================================
    chapter_title(doc, "BAB II", "STRUKTUR ANTARMUKA DAN PETA NAVIGASI SISTEM", page_break=True)

    subheading(doc, "2.1", "Pemisahan Navigasi Berdasarkan Peran Pengguna")
    body(doc, "Untuk menjaga fokus kerja setiap pengguna, bilah navigasi bagian atas aplikasi menyesuaikan menunya secara otomatis berdasarkan peran akun yang sedang masuk. Peserta didik diarahkan pada jalur belajar utama yang berurutan (Peta Misi, Kuis, Progres, Analitik Pribadi, Asisten AI, Leaderboard, Sertifikat dan Rapor, serta Profil). Sebaliknya, pendidik memperoleh bilah navigasi pemantauan yang terpisah (Dashboard Guru, Analitik Kelas, Leaderboard, Draft AI Guru, Pratinjau Materi, dan Profil Guru) sehingga tampilan pendidik berfokus pada supervisi pembelajaran tanpa dibebani tombol pengerjaan tugas siswa.")

    subheading(doc, "2.2", "Peta Rute dan Fungsi Seluruh Halaman Aplikasi")
    body(doc, "Daftar lengkap rute halaman yang tersedia pada aplikasi Network Explorer beserta peran pengguna yang berhak mengaksesnya ditampilkan pada Tabel 2.1.")

    make_table(
        doc,
        ["Menu / Halaman", "Rute URL", "Peran Akses", "Fungsi Operasional Utama"],
        [
            ["Beranda", "/beranda", "Publik", "Pengantar aplikasi, ringkasan keunggulan, dan tautan masuk."],
            ["Masuk dan Daftar", "/auth/login, /auth/signup", "Publik", "Autentikasi akun siswa atau guru (dengan Kode Akses Guru)."],
            ["Peta Misi", "/misi", "Siswa (dan Pratinjau Guru)", "Panduan alur belajar 5 tahap, rekomendasi adaptif, dan daftar 3 bab topologi."],
            ["Materi Interaktif", "/materi/[topo]", "Siswa dan Guru", "Bab topologi Bus, Ring, Star dilengkapi diagram animasi, audio, video, dan Cek Pemahaman."],
            ["Praktik Kabel", "/praktik/[topo]", "Siswa dan Guru", "Papan perakitan kabel drag-and-drop dengan validasi aturan fisik otomatis."],
            ["Meja Kerja Sandbox", "/sandbox/[topo]", "Siswa dan Guru", "Eksperimen pengiriman paket ping, cabut kabel, dan pasang ulang kabel."],
            ["Perbandingan", "/perbandingan", "Siswa dan Guru", "Matriks perbandingan 7 aspek topologi dan studi kasus laboratorium 24 PC."],
            ["Kuis dan Latihan", "/kuis, /kuis/hasil", "Siswa", "Pre-Test Diagnostik, Kuis Akhir 10 studi kasus, dan Latihan Adaptif 3 soal."],
            ["Progres dan Rapor", "/progres, /cetak", "Siswa", "Rekap 10 tahap, perolehan XP, Sertifikat Kompetensi Digital, dan cetak PDF."],
            ["Dashboard Analitik", "/analitik", "Siswa (Pribadi) / Guru (Kelas)", "Learning Analytics 4 tingkat, visualisasi grafik SVG, dan kontrol privasi data."],
            ["Asisten Belajar AI", "/asisten", "Siswa (7 Fungsi) / Guru (Draft)", "Studio prompt TCCO, Gerbang Langkah 0, verifikasi 5 langkah, Lab Halusinasi, dan 5W+C."],
            ["Dashboard Guru", "/guru", "Khusus Guru", "Pemantauan seluruh murid, filter status, catatan evaluasi guru, ekspor CSV, dan cetak rapor kelas."],
            ["Leaderboard Siswa", "/leaderboard", "Siswa dan Guru", "Papan peringkat siswa dengan Podium 3 Besar, Mode Anonim, dan filter kelas."],
            ["Panduan dan Privasi", "/panduan, /privasi, /pengaturan", "Publik / Login", "Panduan bawaan, kebijakan perlindungan data, dan kendali privasi analitik."],
        ],
        widths=[2.7, 3.0, 2.5, 5.8],
        caption="Tabel 2.1 Peta Rute dan Fungsi Halaman pada Aplikasi Network Explorer",
    )

    subheading(doc, "2.3", "Alur Belajar Terarah Lima Tahap pada Peta Misi")
    body(doc, "Halaman Peta Misi (/misi) bertindak sebagai pusat kendali pembelajaran bagi peserta didik. Di bagian atas halaman terdapat indikator langkah 1 sampai 5 beserta kotak Langkah Berikutnya yang otomatis menyesuaikan diri dengan progres terakhir pengguna. Dengan panduan visual ini, peserta didik selalu mengetahui aktivitas mana yang perlu dikerjakan lebih dahulu dan tahapan apa yang menjadi penutup pembelajaran.")

    add_image(doc, "01-beranda.png", "Gambar 2.1 Tampilan Halaman Beranda Network Explorer")
    add_image(doc, "02-misi-adaptif.png", "Gambar 2.2 Tampilan Peta Misi dengan Panduan Lima Tahap Belajar Terarah")

    # =========================================================================
    # BAB III PANDUAN OPERASIONAL BAGI PESERTA DIDIK
    # =========================================================================
    chapter_title(doc, "BAB III", "PANDUAN OPERASIONAL BAGI PESERTA DIDIK", page_break=True)

    subheading(doc, "3.1", "Pendaftaran Akun, Masuk Sistem, dan Pengambilan Pre-Test Diagnostik")
    body(doc, "Langkah awal penggunaan aplikasi oleh peserta didik dilakukan dengan urutan berikut:")
    numbered(doc, 1, "Buka tautan aplikasi https://network-explorer-xi.vercel.app/ melalui peramban web lalu pilih tombol Masuk.")
    numbered(doc, 2, "Untuk pendaftaran akun baru, pilih menu Daftar, pilih peran Siswa, lengkapi nama lengkap, kelas (X, XI, atau XII), alamat email, serta kata sandi. Untuk keperluan evaluasi cepat pada mode demo, gunakan akun navigator@example.com dengan kata sandi password123.")
    numbered(doc, 3, "Setelah berhasil masuk ke Peta Misi (/misi), perhatikan kartu Langkah 1 dan klik tautan menuju Pre-Test Diagnostik (/kuis?mode=pretest). Kerjakan 10 butir soal awal secara mandiri guna merekam skor dasar sebelum mempelajari materi.")

    subheading(doc, "3.2", "Eksplorasi Materi Interaktif dan Pengisian Cek Pemahaman")
    body(doc, "Setelah Pre-Test selesai, peserta didik melanjutkan ke Tahap 2 melalui daftar modul pada Peta Misi dimulai dari Bab 1 Topologi Bus, diikuti Bab 2 Topologi Ring, dan Bab 3 Topologi Star.")
    numbered(doc, 1, "Buka setiap tab media yang tersedia pada halaman materi, meliputi Diagram Animasi untuk mengamati pola transmisi sinyal, Narasi Audio dengan menekan tombol Putar Narasi, serta Video Ringkasan.")
    numbered(doc, 2, "Pada bagian Cek Pemahaman di bagian bawah halaman, tuliskan terlebih dahulu jawaban menggunakan bahasa sendiri berdasarkan pemahaman yang diperoleh, lalu tekan tombol Simpan Refleksi dan Cek Kunci. Catatan refleksi tersebut otomatis tersimpan sebagai salah satu bukti asesmen proses untuk kelulusan sertifikat.")
    add_image(doc, "03-materi-star.png", "Gambar 3.1 Tampilan Halaman Materi Topologi Star dan Cek Pemahaman Tertulis")

    subheading(doc, "3.3", "Pelaksanaan Praktik Pemasangan Kabel dan Simulasi Sandbox")
    body(doc, "Dari akhir halaman materi, peserta didik menekan tombol menuju lembar praktik (/praktik/[topo]) dan dilanjutkan ke meja kerja simulasi (/sandbox/[topo]).")
    numbered(doc, 1, "Pada Lembar Praktik, seret kabel dari palet ke perangkat tujuan sesuai aturan fisik masing-masing topologi (Bus terhubung ke kabel tulang punggung Backbone, Ring terhubung berurutan searah jarum jam ke komputer berikutnya, dan Star terhubung ke Switch pusat). Pengguna papan ketik dapat memakai tombol Tab dan Enter untuk memilih kabel lalu menekan perangkat sasaran.")
    numbered(doc, 2, "Apabila pemasangan tidak sesuai aturan topologi, sistem menolak sambungan dan menampilkan penjelasan teknis pada panel catatan. Jumlah sambungan benar dan ditolak dicatat otomatis untuk diagnosis kesulitan belajar.")
    numbered(doc, 3, "Setelah seluruh kabel terpasang lengkap, buka halaman Sandbox. Uji pengiriman paket ping antarperangkat dalam keadaan normal, kemudian tekan tombol Cabut 1 Kabel untuk memindahkan kabel ke Baki Kabel Lepas dan jalankan ping kembali guna mengamati dampak gangguan pada masing-masing topologi. Kabel yang terlepas dapat ditarik kembali dari baki ke port perangkat untuk memulihkan jaringan.")
    add_image(doc, "04-praktik-star.png", "Gambar 3.2 Tampilan Lembar Praktik Pemasangan Kabel Topologi Star")
    add_image(doc, "05-sandbox-star.png", "Gambar 3.3 Tampilan Meja Kerja Sandbox Interaktif dengan Baki Kabel Lepas")

    subheading(doc, "3.4", "Pengerjaan Kuis Akhir dan Latihan Adaptif Terfokus")
    body(doc, "Setelah menyelesaikan ketiga modul materi, praktik, dan simulasi, peserta didik membuka menu Kuis (/kuis) untuk mengerjakan evaluasi sumatif.")
    numbered(doc, 1, "Pilih tab Kuis Akhir (Post-Test) dan jawab seluruh 10 soal studi kasus topologi jaringan. Setiap jawaban langsung menampilkan umpan balik teknis.")
    numbered(doc, 2, "Pada halaman Hasil Kuis (/kuis/hasil), periksa peningkatan skor dibandingkan Pre-Test serta baca bagian Rekomendasi Belajar Personal. Jika masih ditemukan kelemahan pada konsep tertentu, klik tombol Latihan Adaptif untuk mengerjakan 3 soal latihan khusus yang disesuaikan dengan topik terlemah tersebut.")
    add_image(doc, "06-kuis-modes.png", "Gambar 3.4 Tampilan Pilihan Tiga Mode Evaluasi pada Halaman Kuis")
    add_image(doc, "07-kuis-hasil-adaptif.png", "Gambar 3.5 Tampilan Hasil Kuis Akhir dan Rekomendasi Latihan Adaptif")

    subheading(doc, "3.5", "Pembacaan Dashboard Learning Analytics Pribadi")
    body(doc, "Peserta didik dapat memantau perkembangan belajarnya secara transparan melalui menu Analitik (/analitik). Halaman ini bersifat privat dan hanya menampilkan data milik pengguna yang sedang masuk.")
    numbered(doc, 1, "Bandingkan dua grafik donat pada bagian Descriptive Analytics, yaitu Progress Penyelesaian dan Indeks Penguasaan (Mastery). Apabila persentase penguasaan masih lebih rendah daripada penyelesaian, ikuti rekomendasi perbaikan pada bagian Prescriptive Analytics.")
    numbered(doc, 2, "Amati grafik garis perkembangan nilai kuis, grafik batang akurasi per topik (Bus, Ring, Star, Diagnostik), serta tabel analisis butir soal untuk mengetahui bagian materi yang perlu diulas kembali.")
    numbered(doc, 3, "Tinjau tabel Jejak Digital pada bagian bawah halaman untuk memeriksa kronologi aktivitas yang tercatat, serta gunakan tombol kendali privasi apabila ingin menjeda pencatatan atau mengekspor salinan data JSON.")
    add_image(doc, "08-analitik-siswa.png", "Gambar 3.6 Tampilan Dashboard Learning Analytics Pribadi Peserta Didik")

    subheading(doc, "3.6", "Penggunaan Asisten Belajar AI secara Kritis dan Bertanggung Jawab")
    body(doc, "Apabila peserta didik memerlukan penjelasan tambahan atau latihan pemecahan kasus, menu Asisten AI (/asisten) menyediakan ruang konsultasi terstruktur dengan prosedur penggunaan sebagai berikut:")
    numbered(doc, 1, "Pilih satu dari tujuh fungsi bimbingan (Explain, Example, Practice, Feedback, Brainstorm, Compare, atau Reflect) dan pilih topik fokus yang diinginkan.")
    numbered(doc, 2, "Isi kolom Langkah 0 dengan menuliskan pemahaman atau dugaan awal sendiri sebelum mengajukan pertanyaan kepada AI.")
    numbered(doc, 3, "Gunakan Pembangun Prompt TCCO dan tombol Iterative Prompting untuk menyempurnakan susunan prompt hingga memenuhi 4 dari 4 unsur (Task, Context, Constraint, Output), lalu tekan tombol Tanya Asisten AI.")
    numbered(doc, 4, "Setelah jawaban AI muncul, lakukan verifikasi kritis dengan mencentang 5 langkah Ask AI, Then Think dan membandingkan isinya dengan materi modul atau uji Sandbox. Tuliskan kesimpulan dengan bahasa sendiri lalu simpan sebagai bukti proses.")
    numbered(doc, 5, "Eksplorasi tab Lab Deteksi Halusinasi untuk berlatih menemukan kekeliruan fakta AI, serta tab Pernyataan Transparansi 5W+C untuk mencatat pernyataan integritas akademik yang akan dicetak pada rapor.")
    add_image(doc, "10-asisten-ai.png", "Gambar 3.7 Tampilan Studio Asisten Belajar AI dan Daftar Periksa Verifikasi")

    subheading(doc, "3.7", "Penggunaan Leaderboard Siswa dan Pengaktifan Mode Anonim")
    body(doc, "Menu Leaderboard (/leaderboard) memungkinkan peserta didik melihat posisinya di antara teman sekelas secara sehat dan aman.")
    numbered(doc, 1, "Periksa Podium 3 Besar di bagian atas halaman serta kartu Posisimu Saat Ini untuk mengetahui peringkat aktual dan selisih XP yang dibutuhkan agar naik ke peringkat di atasnya.")
    numbered(doc, 2, "Gunakan tombol filter kelas (Semua, X, XI, XII) atau kolom pencarian untuk menyaring tampilan peringkat.")
    numbered(doc, 3, "Apabila peserta didik ingin menjaga kerahasiaan identitas di papan peringkat, aktifkan sakelar Mode Anonim pada kartu posisi. Nama asli akan langsung digantikan oleh alias berkode (misalnya Peserta #XXXX) pada tampilan pengguna lain, sementara pemilik akun tetap dapat mengenali barisnya sendiri melalui penanda Kamu.")
    add_image(doc, "14-leaderboard-siswa.png", "Gambar 3.8 Tampilan Leaderboard Siswa dengan Podium dan Toggle Mode Anonim")

    subheading(doc, "3.8", "Pencetakan Rapor Proses dan Sertifikat Kompetensi Digital")
    body(doc, "Pada tahap penutup, peserta didik membuka menu Sertifikat dan Rapor (/cetak). Apabila kelima prasyarat kelulusan telah terpenuhi (3 bab materi, 3 praktik kabel, 3 simulasi Sandbox, nilai kuis minimal 80 persen, serta minimal 1 bukti proses refleksi atau verifikasi AI), Sertifikat Kompetensi Digital ber-ID unik otomatis tampil di atas Rapor Proses. Tekan tombol Cetak Rapor dan Sertifikat lalu pilih simpan sebagai PDF melalui dialog cetak peramban.")
    add_image(doc, "11-sertifikat-rapor.png", "Gambar 3.9 Tampilan Sertifikat Kompetensi Digital dan Rapor Proses Siap Cetak")

    # =========================================================================
    # BAB IV PANDUAN OPERASIONAL BAGI PENDIDIK (GURU)
    # =========================================================================
    chapter_title(doc, "BAB IV", "PANDUAN OPERASIONAL BAGI PENDIDIK (GURU)", page_break=True)

    subheading(doc, "4.1", "Pendaftaran Akun Guru dan Masuk ke Ruang Kerja Pendidik")
    body(doc, "Untuk menjaga keamanan data seluruh peserta didik, pendaftaran akun dengan peran Guru dilindungi oleh Kode Akses Guru.")
    numbered(doc, 1, "Buka halaman Daftar (/auth/signup), pilih peran Guru / Pendidik, lalu masukkan nama lengkap, alamat email, kata sandi, serta Kode Akses Guru (GURU-UNIMED-2026 atau kode khusus yang ditetapkan administrator sekolah pada variabel lingkungan NEXT_PUBLIC_TEACHER_ACCESS_CODE).")
    numbered(doc, 2, "Pada mode demo evaluasi, pendidik dapat langsung masuk menggunakan akun guru@example.com dengan kata sandi guru12345.")
    numbered(doc, 3, "Setelah berhasil masuk, sistem secara otomatis mengarahkan pendidik ke Dashboard Pemantauan Murid (/guru) dengan bilah navigasi khusus guru.")

    subheading(doc, "4.2", "Pengoperasian Dashboard Pemantauan Murid (/guru)")
    body(doc, "Dashboard Pemantauan Murid merupakan pusat kerja utama pendidik untuk mengawasi keterlibatan dan ketuntasan belajar kelas secara menyeluruh.")
    numbered(doc, 1, "Amati empat kartu indikator utama di bagian atas halaman yang merangkum jumlah murid terdaftar, jumlah murid yang sudah mulai belajar, jumlah murid yang telah tuntas bersertifikat, serta rata-rata nilai kuis kelas.")
    numbered(doc, 2, "Gunakan tombol penyaring status (Semua, Tuntas, Sedang Mengerjakan, atau Belum Mulai) serta kotak pencarian nama untuk menemukan peserta didik tertentu dengan cepat.")
    numbered(doc, 3, "Klik salah satu baris nama murid pada tabel daftar siswa untuk membuka panel rincian di sisi kanan yang memuat progres 10 tahap, riwayat skor kuis, akurasi praktik kabel, serta bukti refleksi proses.")
    numbered(doc, 4, "Tuliskan umpan balik pembinaan pada kolom Catatan Evaluasi Guru lalu tekan Simpan Catatan. Untuk kebutuhan pelaporan nilai sekolah, gunakan tombol Ekspor CSV atau Cetak Rapor Kelas.")
    add_image(doc, "13-dashboard-guru.png", "Gambar 4.1 Tampilan Dashboard Pemantauan Murid Khusus Guru (/guru)")

    subheading(doc, "4.3", "Interpretasi Dashboard Analitik Kelas (/analitik) secara Etis")
    body(doc, "Saat pendidik membuka menu Analitik Kelas (/analitik), sistem langsung menyajikan tampilan agregat kelas tanpa mencampurnya dengan tampilan tugas siswa.")
    numbered(doc, 1, "Gunakan analisis butir soal dan distribusi akurasi per topik untuk mengidentifikasi konsep yang paling banyak menimbulkan miskonsepsi di kelas (misalnya tabrakan sinyal pada topologi Bus atau urutan cincin pada topologi Ring).")
    numbered(doc, 2, "Terapkan prinsip Non-Labeling saat membaca indikator peringatan dini. Jadikan indikator tersebut sebagai dasar diskusi remedial dan konfirmasi faktor kontekstual (seperti kendala perangkat, kehadiran, atau belajar dari sumber cetak), bukan sebagai pelabelan negatif terhadap kemampuan peserta didik.")
    add_image(doc, "09-analitik-guru.png", "Gambar 4.2 Tampilan Dashboard Analitik Kelas Khusus Guru (/analitik)")

    subheading(doc, "4.4", "Pemanfaatan Mode Draft Guru pada Asisten AI dan Pemantauan Leaderboard")
    body(doc, "Pendidik juga memperoleh dua fitur pendukung tambahan pada bilah navigasi:")
    numbered(doc, 1, "Draft AI Guru (/asisten): Terbuka langsung pada Mode Draft Guru untuk membantu menyusun rancangan studi kasus jaringan kontekstual atau draf rubrik penilaian proses. Pendidik wajib melakukan peninjauan akurasi dan pertimbangan pedagogis (pedagogical judgment) sebelum menggunakan draf tersebut di kelas.", bold_prefix="Draft AI Guru. ")
    numbered(doc, 2, "Pemantauan Leaderboard (/leaderboard): Memungkinkan guru melihat dinamika partisipasi dan capaian siswa per kelas secara objektif tanpa akun guru ikut tercatat sebagai peserta peringkat.", bold_prefix="Pemantauan Leaderboard. ")

    subheading(doc, "4.5", "Pengelolaan Keamanan Basis Data Firestore bagi Administrator")
    body(doc, "Apabila sekolah mengoperasikan aplikasi pada mode cloud menggunakan proyek Firebase sendiri, administrator perlu memastikan berkas firestore.rules telah dipublikasikan agar kebijakan privasi berjalan pada tingkat server basis data. Publikasi dapat dilakukan melalui dua metode:")
    numbered(doc, 1, "Melalui Firebase Console: Buka proyek Firebase, pilih menu Build lalu Firestore Database, buka tab Rules, tempel isi berkas firestore.rules dari repositori proyek, lalu tekan tombol Publish.", bold_prefix="Melalui Firebase Console. ")
    numbered(doc, 2, "Melalui Terminal Firebase CLI: Jalankan perintah npx firebase-tools login (jika belum masuk), diikuti perintah npm run deploy:rules pada direktori proyek hingga muncul pesan Deploy complete.", bold_prefix="Melalui Terminal Firebase CLI. ")

    # =========================================================================
    # BAB V TATA KELOLA PRIVASI, AKSESIBILITAS, DAN PEMECAHAN MASALAH
    # =========================================================================
    chapter_title(doc, "BAB V", "TATA KELOLA PRIVASI, AKSESIBILITAS, DAN PEMECAHAN MASALAH", page_break=True)

    subheading(doc, "5.1", "Kendali Privasi Data Peserta Didik")
    body(doc, "Sistem menjamin kedaulatan peserta didik atas data pembelajarannya melalui empat fitur kendali yang dapat diakses pada halaman Analitik (/analitik), Pengaturan (/pengaturan), dan Leaderboard (/leaderboard):")
    bullet(doc, "Peserta didik dapat menonaktifkan sementara perekaman jejak analitik baru kapan saja melalui sakelar izin pencatatan.", bold_prefix="Jeda Pencatatan Analitik: ")
    bullet(doc, "Seluruh data pembelajaran pribadi dapat diunduh dalam format JSON yang terbuka untuk keperluan dokumentasi atau portofolio mandiri.", bold_prefix="Ekspor Data JSON: ")
    bullet(doc, "Peserta didik berhak menghapus seluruh catatan jejak analitik lokalnya dengan konfirmasi keamanan.", bold_prefix="Penghapusan Jejak Digital: ")
    bullet(doc, "Nama asli peserta didik dapat disembunyikan menjadi alias berkode pada papan peringkat kelas, sementara alamat email dan refleksi tertulis tidak pernah dibagikan kepada siswa lain.", bold_prefix="Mode Anonim dan Isolasi Data: ")

    subheading(doc, "5.2", "Dukungan Aksesibilitas Antarmuka")
    body(doc, "Seluruh halaman aplikasi dirancang memperhatikan aksesibilitas beragam perangkat dan kebutuhan pengguna, antara lain dukungan navigasi penuh menggunakan papan ketik (Tab, Enter, dan Escape), alternatif klik pada papan perakitan kabel bagi pengguna yang kesulitan melakukan gerakan seret, label formulir yang terhubung secara semantik, tombol kendali suara narasi, tata letak cetak monokrom hemat tinta, serta kepatuhan terhadap preferensi pengurangan animasi (Reduce Motion) sistem operasi.")

    subheading(doc, "5.3", "Panduan Pemecahan Masalah (Troubleshooting)")
    body(doc, "Apabila pengguna mengalami kendala teknis saat mengoperasikan aplikasi, rujukan solusi cepat disajikan pada Tabel 5.1, dan panduan ringkas juga selalu tersedia secara langsung di dalam aplikasi pada halaman /panduan.")

    make_table(
        doc,
        ["Kendala yang Ditemui", "Kemungkinan Penyebab", "Langkah Penyelesaian"],
        [
            ["Akun siswa tidak dapat membuka halaman /guru", "Kebijakan RBAC memang membatasi rute /guru khusus untuk akun berstatus Guru.", "Masuk menggunakan akun guru (guru@example.com pada mode demo atau akun guru terdaftar)."],
            ["Gagal mendaftar sebagai akun Guru", "Kode Akses Guru belum diisi atau tidak sesuai dengan konfigurasi sistem.", "Masukkan Kode Akses Guru yang sah (bawaan: GURU-UNIMED-2026) atau konfirmasi ke administrator."],
            ["Siswa lama belum tampil di Leaderboard Cloud", "Akun terdaftar sebelum koleksi leaderboard/{uid} diaktifkan atau aturan Firestore belum dirilis.", "Pastikan firestore.rules sudah dipublikasikan, lalu minta siswa login dan membuka aplikasi atau menyelesaikan satu aktivitas."],
            ["Sertifikat Kompetensi belum terbuka pada halaman /cetak", "Salah satu dari 5 syarat kelulusan proses belum terpenuhi.", "Periksa daftar periksa syarat pada bagian atas halaman /cetak (pastikan 3 materi, 3 praktik, 3 simulasi, kuis minimal 80%, dan minimal 1 refleksi/verifikasi AI selesai)."],
            ["Koneksi internet terputus saat demonstrasi di kelas", "Jaringan lokal sekolah tidak stabil atau luring.", "Gunakan Mode Demo Luring (NEXT_PUBLIC_DEMO_MODE=1); seluruh simulasi, analitik, dan Mesin Pedagogis Lokal AI tetap berfungsi normal."],
            ["Tampilan cetak rapor terlihat gelap atau boros tinta", "Pengaturan latar belakang grafis peramban aktif atau halaman belum selesai dimuat.", "Gunakan tombol Cetak Rapor bawaan aplikasi yang otomatis menerapkan mode cetak kertas putih bersih."],
        ],
        widths=[3.6, 4.4, 6.0],
        caption="Tabel 5.1 Daftar Kendala Umum dan Langkah Pemecahan Masalah",
    )

    add_image(doc, "12-panduan-uas.png", "Gambar 5.1 Tampilan Halaman Panduan Penggunaan di Dalam Aplikasi (/panduan)")

    # =========================================================================
    # BAB VI PENUTUP
    # =========================================================================
    chapter_title(doc, "BAB VI", "PENUTUP", page_break=True)
    body(doc, "Modul penggunaan ini disusun untuk memastikan seluruh kemampuan multimedia pembelajaran interaktif Network Explorer versi UAS dapat dimanfaatkan secara optimal oleh peserta didik maupun pendidik. Dengan mengikuti alur belajar lima tahap secara runtut, memanfaatkan Dashboard Learning Analytics sebagai cermin proses belajar, menerapkan prinsip verifikasi kritis pada Asisten Belajar AI, serta menjaga etika privasi pada pemantauan kelas dan Leaderboard, proses pembelajaran Topologi Jaringan diharapkan berlangsung lebih mendalam, adil, dan bermakna.")

    # DAFTAR RUJUKAN
    chapter_title(doc, None, "DAFTAR RUJUKAN", page_break=True)
    refs = [
        "Mawarni, S., & Muhtadi, A. (2017). Pengembangan digital book interaktif mata kuliah pengembangan multimedia pembelajaran interaktif untuk mahasiswa teknologi pendidikan. Jurnal Inovasi Teknologi Pendidikan, 4(1), 84-96.",
        "Mayer, R. E. (2021). Multimedia learning (3rd ed.). Cambridge University Press.",
        "Rahmadani, R. (2026a). Artificial Intelligence dan Generative AI dalam Pendidikan (Materi Pertemuan 12). Program Studi Pendidikan Teknologi Informatika dan Komputer, Universitas Negeri Medan.",
        "Rahmadani, R. (2026b). Learning Analytics (Materi Pertemuan 13). Program Studi Pendidikan Teknologi Informatika dan Komputer, Universitas Negeri Medan.",
        "Tim Pengembang Network Explorer Kelompok 3. (2026). Dokumentasi Arsitektur dan Panduan Demonstrasi Network Explorer Versi UAS. Universitas Negeri Medan.",
    ]
    for r in refs:
        reference_entry(doc, r)

    out_path = os.path.join(BASE, "Modul_Penggunaan_Multimedia_UAS_Network_Explorer_Kelompok3.docx")
    doc.save(out_path)
    assert_no_em_dash(out_path)
    print("saved and verified (0 em-dash):", out_path)
    return out_path


if __name__ == "__main__":
    build_makalah_laporan()
    build_modul_penggunaan()
