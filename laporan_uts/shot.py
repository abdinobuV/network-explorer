from playwright.sync_api import sync_playwright
import os, json
out = r"D:\semester 3\TIK DALAM PENDIDIKAN\uts\laporan_uts\gambar"
os.makedirs(out, exist_ok=True)
demo_user = {"name": "Siswa Navigator", "email": "navigator@example.com", "kelas": "XI"}
demo_users = [{**demo_user, "pass": "password123"}]
with sync_playwright() as p:
    b = p.chromium.launch(channel="msedge", headless=True)
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    ctx.add_init_script(
        "localStorage.setItem('misi-users', '%s'); localStorage.setItem('misi-user', '%s');"
        % (json.dumps(demo_users).replace("'", "\\'"), json.dumps(demo_user).replace("'", "\\'"))
    )
    pg = ctx.new_page()
    jobs = [
        ("01-pembuka", "https://network-explorer-xi.vercel.app/"),
        ("02-beranda", "https://network-explorer-xi.vercel.app/beranda"),
        ("03-misi", "https://network-explorer-xi.vercel.app/misi"),
        ("04-materi-star", "https://network-explorer-xi.vercel.app/materi/star"),
        ("05-praktik-star", "https://network-explorer-xi.vercel.app/praktik/star"),
        ("06-sandbox", "https://network-explorer-xi.vercel.app/sandbox"),
        ("07-kuis", "https://network-explorer-xi.vercel.app/kuis"),
        ("08-progres", "https://network-explorer-xi.vercel.app/progres"),
        ("10-perbandingan", "https://network-explorer-xi.vercel.app/perbandingan"),
    ]
    for name, url in jobs:
        pg.goto(url, wait_until="networkidle", timeout=45000)
        pg.wait_for_timeout(2500)
        pg.screenshot(path=os.path.join(out, name + ".png"))
        print("shot", name, pg.url)
    # hasil with query
    pg.goto("https://network-explorer-xi.vercel.app/kuis/hasil?score=8&total=10", wait_until="networkidle", timeout=45000)
    pg.wait_for_timeout(2500)
    pg.screenshot(path=os.path.join(out, "09-hasil.png"))
    print("shot 09-hasil", pg.url)
    b.close()
print("done")
