"""Ambil tangkapan layar aplikasi Network Explorer untuk laporan UTS.

Jalankan aplikasi lebih dulu (mode demo), misalnya:

    npm run dev -- --port 3212

lalu:

    python laporan_uts/shot.py

Environment:
    SHOT_BASE_URL  alamat dasar aplikasi (bawaan http://localhost:3212)
"""

import json
import os

from playwright.sync_api import sync_playwright

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "gambar")
os.makedirs(OUT, exist_ok=True)

URL = os.environ.get("SHOT_BASE_URL", "http://localhost:3212")

# Sesi demo pada format terbaru (src/lib/auth-session.ts).
SESSION = {
    "uid": "demo-navigator",
    "name": "Siswa Navigator",
    "email": "navigator@example.com",
    "kelas": "XI",
    "photoURL": None,
    "provider": "demo",
}

JOBS = [
    ("01-pembuka", "/"),
    ("02-beranda", "/beranda"),
    ("03-misi", "/misi"),
    ("04-materi-star", "/materi/star"),
    ("05-praktik-star", "/praktik/star"),
    ("06-sandbox", "/sandbox/star"),
    ("07-kuis", "/kuis"),
    ("08-progres", "/progres"),
    ("09-hasil", "/kuis/hasil?score=8&total=10"),
    ("10-perbandingan", "/perbandingan"),
]


def jalankan() -> None:
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
        except Exception:
            browser = p.chromium.launch(channel="msedge", headless=True)

        ctx = browser.new_context(viewport={"width": 1440, "height": 960})
        ctx.add_init_script(
            "window.localStorage.setItem('misi-session', %s);"
            % json.dumps(json.dumps(SESSION))
        )
        page = ctx.new_page()

        for name, route in JOBS:
            page.goto(URL + route, wait_until="networkidle", timeout=60000)
            page.wait_for_timeout(1800)
            page.screenshot(path=os.path.join(OUT, name + ".png"), full_page=True)
            print("shot", name, page.url)

        browser.close()
    print("done ->", OUT)


if __name__ == "__main__":
    jalankan()
