# -*- coding: utf-8 -*-
"""Ambil tangkapan layar aplikasi Network Explorer versi UAS (Learning Analytics & AI).

Jalankan server produksi (mode demo) di port 3214:
    set NEXT_PUBLIC_DEMO_MODE=1
    npx next start -p 3214

lalu jalankan:
    python laporan_uas/shot_uas.py
"""

import json
import os
import time

from playwright.sync_api import sync_playwright

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "gambar")
os.makedirs(OUT, exist_ok=True)

URL = os.environ.get("SHOT_BASE_URL", "http://127.0.0.1:3214")
NOW = int(time.time() * 1000)
DAY = 86_400_000

SESSION = {
    "uid": "demo-navigator",
    "name": "Siswa Navigator",
    "email": "navigator@example.com",
    "kelas": "XI",
    "role": "siswa",
    "photoURL": None,
    "provider": "demo",
}

TEACHER_SESSION = {
    "uid": "demo-guru",
    "name": "Ibu Reni (Guru Informatika)",
    "email": "guru@example.com",
    "kelas": "Guru",
    "role": "guru",
    "photoURL": None,
    "provider": "demo",
}

PROGRESS = {
    "activity": [
        {"key": "materi-bus", "label": "Materi Topologi Bus", "topo": "bus", "xp": 50, "at": NOW - 4 * DAY},
        {"key": "praktik-bus", "label": "Praktik Topologi Bus", "topo": "bus", "xp": 100, "at": NOW - 4 * DAY + 600_000},
        {"key": "simulasi-bus", "label": "Simulasi Topologi Bus", "topo": "bus", "xp": 50, "at": NOW - 3 * DAY},
        {"key": "materi-ring", "label": "Materi Topologi Ring", "topo": "ring", "xp": 50, "at": NOW - 3 * DAY + 300_000},
        {"key": "praktik-ring", "label": "Praktik Topologi Ring", "topo": "ring", "xp": 100, "at": NOW - 2 * DAY},
        {"key": "simulasi-ring", "label": "Simulasi Topologi Ring", "topo": "ring", "xp": 50, "at": NOW - 2 * DAY + 600_000},
        {"key": "materi-star", "label": "Materi Topologi Star", "topo": "star", "xp": 50, "at": NOW - DAY},
        {"key": "praktik-star", "label": "Praktik Topologi Star", "topo": "star", "xp": 100, "at": NOW - DAY + 500_000},
        {"key": "simulasi-star", "label": "Simulasi Topologi Star", "topo": "star", "xp": 50, "at": NOW - DAY + 900_000},
        {"key": "kuis-akhir", "label": "Kuis akhir — nilai 8/10", "xp": 80, "at": NOW - 3_600_000},
    ],
    "done": {
        "materi-bus": True,
        "praktik-bus": True,
        "simulasi-bus": True,
        "materi-ring": True,
        "praktik-ring": True,
        "simulasi-ring": True,
        "materi-star": True,
        "praktik-star": True,
        "simulasi-star": True,
    },
    "quizBest": 8,
    "quizAttempts": 3,
}

ANALYTICS = {
    "loginCount": 6,
    "lastLoginAt": NOW - 1_800_000,
    "trackingConsent": True,
    "materi": {
        "bus": {"views": 3, "timeSec": 420, "diagramOpened": True, "narasiOpened": True, "videoOpened": True, "cekAnswered": True, "lastAt": NOW - 3 * DAY},
        "ring": {"views": 2, "timeSec": 195, "diagramOpened": True, "narasiOpened": False, "videoOpened": False, "cekAnswered": False, "lastAt": NOW - 2 * DAY},
        "star": {"views": 3, "timeSec": 390, "diagramOpened": True, "narasiOpened": True, "videoOpened": True, "cekAnswered": True, "lastAt": NOW - DAY},
    },
    "praktik": {
        "bus": {"attempts": 1, "correctConnections": 5, "rejectedConnections": 1, "completions": 1, "bestDurationSec": 95, "lastAt": NOW - 3 * DAY},
        "ring": {"attempts": 2, "correctConnections": 5, "rejectedConnections": 4, "completions": 1, "bestDurationSec": 142, "lastAt": NOW - 2 * DAY},
        "star": {"attempts": 1, "correctConnections": 5, "rejectedConnections": 0, "completions": 1, "bestDurationSec": 78, "lastAt": NOW - DAY},
    },
    "simulasi": {
        "bus": {"pingRuns": 4, "faultTests": 2, "failedPings": 1, "lastAt": NOW - 3 * DAY},
        "ring": {"pingRuns": 3, "faultTests": 1, "failedPings": 1, "lastAt": NOW - 2 * DAY},
        "star": {"pingRuns": 5, "faultTests": 3, "failedPings": 1, "lastAt": NOW - DAY},
    },
    "quizHistory": [
        {
            "id": "pre-1",
            "at": NOW - 4 * DAY,
            "kind": "pretest",
            "score": 5,
            "total": 10,
            "durationSec": 210,
            "answers": {"1": 1, "2": 0, "3": 1, "4": 1, "5": 0, "6": 0, "7": 1, "8": 0, "9": 0, "10": 0},
        },
        {
            "id": "post-1",
            "at": NOW - 2 * DAY,
            "kind": "posttest",
            "score": 7,
            "total": 10,
            "durationSec": 240,
            "answers": {"1": 1, "2": 0, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 0, "9": 1, "10": 0},
        },
        {
            "id": "post-2",
            "at": NOW - 3_600_000,
            "kind": "posttest",
            "score": 8,
            "total": 10,
            "durationSec": 195,
            "answers": {"1": 1, "2": 0, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 0, "9": 1, "10": 1},
        },
    ],
    "reflections": [
        {
            "id": "ref-1",
            "at": NOW - DAY,
            "context": "Cek Pemahaman Topologi Star",
            "topo": "star",
            "text": "Jika kabel PC-03 putus pada topologi Star, PC lainnya tetap saling berkomunikasi melalui Switch karena setiap PC memiliki tautan tersendiri.",
            "source": "cek-pemahaman",
        },
        {
            "id": "ref-2",
            "at": NOW - 7_200_000,
            "context": "Studio AI (compare) · Ring",
            "topo": "ring",
            "text": "Setelah membandingkan penjelasan AI dengan uji cabut kabel di Sandbox, saya menyimpulkan Ring tunggal terhenti saat satu ruas putus, sedangkan Star mengisolasi gangguan per kabel.",
            "source": "ai-studio",
        },
    ],
    "aiSessions": [
        {
            "id": "ai-1",
            "at": NOW - 7_200_000,
            "fn": "compare",
            "promptElementsCount": 4,
            "iterations": 2,
            "verifiedSteps": 5,
            "what": "Asisten Belajar AI Network Explorer",
            "why": "membandingkan dampak kabel putus pada Ring tunggal vs Star",
            "how": "menggunakan prompt TCCO (4/4 unsur) dan 2 kali iterasi",
            "verify": "membandingkan hasil dengan modul resmi dan uji Sandbox",
            "contribution": "seluruh analisis, praktik kabel, dan jawaban kuis disusun mandiri",
            "statement": "Asisten Belajar AI Network Explorer digunakan untuk membandingkan dampak gangguan kabel pada Ring tunggal dan Star melalui prompt TCCO dan 2 kali iterasi. Seluruh hasil telah diverifikasi dengan modul resmi serta uji cabut kabel di Sandbox, dan kesimpulan akhir disusun mandiri oleh siswa.",
        }
    ],
    "hallucinationSolved": ["hal-1", "hal-2", "hal-3"],
    "traces": [
        {"id": "t5", "at": NOW - 3_600_000, "category": "assessment", "action": "Kuis akhir selesai", "detail": "Skor 8/10 (80%) dalam 195 dtk — naik +30 poin dari Pre-Test"},
        {"id": "t4", "at": NOW - 7_200_000, "category": "ai", "action": "Transparansi AI tercatat (compare)", "detail": "4/4 unsur prompt · 5/5 langkah verifikasi"},
        {"id": "t3", "at": NOW - DAY, "category": "aktivitas", "action": "Praktik kabel STAR selesai", "detail": "Selesai dalam 78 detik (5/5 benar, 0 tolakan)", "topo": "star"},
        {"id": "t2", "at": NOW - 2 * DAY, "category": "aktivitas", "action": "Praktik kabel RING selesai", "detail": "Selesai dalam 142 detik (4 tolakan urutan cincin)", "topo": "ring"},
        {"id": "t1", "at": NOW - 4 * DAY, "category": "assessment", "action": "Pre-Test diagnostik selesai", "detail": "Skor awal 5/10 (50%) dalam 210 dtk"},
    ],
}

QUIZ_LAST = {
    "score": 8,
    "total": 10,
    "answers": {"1": 1, "2": 0, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 0, "9": 1, "10": 1},
    "gained": 80,
    "kind": "posttest",
    "durationSec": 195,
}


def jalankan() -> None:
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
        except Exception:
            browser = p.chromium.launch(channel="msedge", headless=True)

        ctx = browser.new_context(viewport={"width": 1440, "height": 960})
        init_js = (
            f"window.localStorage.setItem('misi-session', {json.dumps(json.dumps(SESSION))});"
            f"window.localStorage.setItem('misi-prog-demo-navigator', {json.dumps(json.dumps(PROGRESS))});"
            f"window.localStorage.setItem('misi-analytics-demo-navigator', {json.dumps(json.dumps(ANALYTICS))});"
            f"window.localStorage.setItem('misi-quiz-last', {json.dumps(json.dumps(QUIZ_LAST))});"
        )
        ctx.add_init_script(init_js)
        page = ctx.new_page()

        static_jobs = [
            ("01-beranda", "/beranda"),
            ("02-misi-adaptif", "/misi"),
            ("03-materi-star", "/materi/star"),
            ("04-praktik-star", "/praktik/star"),
            ("06-kuis-modes", "/kuis"),
            ("07-kuis-hasil-adaptif", "/kuis/hasil?score=8&total=10&mode=posttest"),
            ("08-analitik-siswa", "/analitik"),
            ("11-sertifikat-rapor", "/cetak"),
            ("12-panduan-uas", "/panduan"),
            ("14-leaderboard-siswa", "/leaderboard"),
        ]

        for name, route in static_jobs:
            page.goto(URL + route, wait_until="load", timeout=60000)
            page.wait_for_selector("h1", timeout=30000)
            page.wait_for_timeout(1400)
            page.evaluate("window.scrollTo(0, 0)")
            page.wait_for_timeout(300)
            page.screenshot(path=os.path.join(OUT, f"{name}.png"), full_page=True)
            print("shot", name)

        # 05: Sandbox Star interaktif (cabut 1 kabel agar Baki Kabel Lepas terlihat nyata)
        page.goto(URL + "/sandbox/star", wait_until="load", timeout=60000)
        page.wait_for_selector("h1", timeout=30000)
        page.get_by_role("button", name="Cabut 1 kabel").click()
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(OUT, "05-sandbox-star.png"), full_page=True)
        print("shot 05-sandbox-star")

        # 10: Asisten AI dengan respons & checklist Ask AI, Then Think
        page.goto(URL + "/asisten", wait_until="load", timeout=60000)
        page.wait_for_selector("h1", timeout=30000)
        page.get_by_label("Langkah 0", exact=False).fill(
            "Menurut saya pada topologi Ring tunggal jika satu kabel putus aliran berhenti, sedangkan di Star hanya satu PC yang terisolasi."
        )
        page.get_by_role("button", name="Tanya Asisten AI").click()
        page.wait_for_selector("text=Checklist Verifikasi: Ask AI, Then Think", timeout=20000)
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(700)
        page.screenshot(path=os.path.join(OUT, "10-asisten-ai.png"), full_page=True)
        print("shot 10-asisten-ai")

        ctx.close()

        # Konteks Guru (RBAC role="guru") untuk Dashboard Pemantauan & Analitik Kelas
        gctx = browser.new_context(viewport={"width": 1440, "height": 960})
        gctx.add_init_script(
            f"window.localStorage.setItem('misi-session', {json.dumps(json.dumps(TEACHER_SESSION))});"
            f"window.localStorage.setItem('misi-prog-demo-navigator', {json.dumps(json.dumps(PROGRESS))});"
            f"window.localStorage.setItem('misi-analytics-demo-navigator', {json.dumps(json.dumps(ANALYTICS))});"
        )
        gpage = gctx.new_page()

        # 09: Analitik Kelas Khusus Guru
        gpage.goto(URL + "/analitik", wait_until="load", timeout=60000)
        gpage.wait_for_selector("h1", timeout=30000)
        gpage.wait_for_timeout(1400)
        gpage.evaluate("window.scrollTo(0, 0)")
        gpage.wait_for_timeout(300)
        gpage.screenshot(path=os.path.join(OUT, "09-analitik-guru.png"), full_page=True)
        print("shot 09-analitik-guru")

        # 13: Dashboard Pemantauan Murid (/guru) lewat alur masuk guru resmi
        gpage.goto(URL + "/auth/login", wait_until="load", timeout=60000)
        gpage.get_by_label("Email", exact=True).fill("guru@example.com")
        gpage.locator("#password").fill("guru12345")
        gpage.get_by_role("button", name="Masuk", exact=True).click()
        gpage.wait_for_url("**/guru", timeout=30000)
        gpage.wait_for_selector("text=Alya Putri Rahma", timeout=30000)
        gpage.wait_for_timeout(1200)
        gpage.evaluate("window.scrollTo(0, 0)")
        gpage.wait_for_timeout(300)
        gpage.screenshot(path=os.path.join(OUT, "13-dashboard-guru.png"), full_page=True)
        print("shot 13-dashboard-guru")

        gctx.close()
        browser.close()
    print("done ->", OUT)


if __name__ == "__main__":
    jalankan()
