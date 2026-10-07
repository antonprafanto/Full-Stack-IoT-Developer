"""Build polaritas-komponen.svg (versi foto nyata) dari foto komponen di aset/.

Sumber:
- 00-fondasi-dasar/aset/dioda-1n4007-foto.jpg         (1369x2055) -> dioda tengah
- 00-fondasi-dasar/aset/kapasitor-elektrolit-foto.jpg (1624x1284) -> kapasitor biru

Proses per foto: crop -> normalisasi kertas ke putih (kaki emas dioda dipertahankan
lewat masker warna hangat) -> bersihkan elemen tetangga (kapasitor) -> PNG base64
-> sisipkan ke SVG.

Ukuran tonal penting (RGB rata-rata, foto mentah):
- dioda : kertas (194,188,190), kaki (223,222,196), cincin (93,90,85), badan (72,70,69)
- kapasitor: kertas (240,242,242), strip (189,227,251), tanda minus (146,190,227),
  badan biru (33,42,76), kaki pendek (170,171,170)
"""
import base64
import io

import numpy as np
from PIL import Image, ImageFilter

ASET = "00-fondasi-dasar/aset"
OUT = "polaritas-komponen.svg"


def to_b64(im: Image.Image) -> str:
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def force_white(a: np.ndarray, thr: int = 250) -> np.ndarray:
    """Piksel nyaris putih (semua kanal > thr) jadi putih murni (hilangkan tekstur)."""
    a[a.min(axis=2) > thr] = 255.0
    return a


# ---------------- dioda: crop dioda tengah + kaki ----------------
raw = np.asarray(Image.open(f"{ASET}/dioda-1n4007-foto.jpg").convert("RGB").crop((200, 700, 1180, 1120))).astype(np.float32)

# masker kaki emas: hangat (R-B > 12) & terang (mean > 165) & hanya pada baris kaki
# (foto y 875-910 -> crop y 175-222) agar kertas berbayang tak ikut tersamar.
# Bagian kaki yang terblown putih di foto asli diisi lewat closing horizontal.
warm_bright = ((raw.mean(axis=2) > 95) & ((raw[:, :, 0] - raw[:, :, 2]) > 5)) | (raw.mean(axis=2) > 200)
band = np.zeros(warm_bright.shape, dtype=bool)
band[158:222, :] = True
warm_bright &= band


def hclose(mk: np.ndarray, r: int = 12) -> np.ndarray:
    h, w = mk.shape
    pad = np.pad(mk, ((0, 0), (r, r)), constant_values=False)
    dil = np.zeros_like(mk)
    for i in range(2 * r + 1):
        dil |= pad[:, i : i + w]
    pad2 = np.pad(dil, ((0, 0), (r, r)), constant_values=True)
    ero = np.ones_like(mk)
    for i in range(2 * r + 1):
        ero &= pad2[:, i : i + w]
    return ero


m = Image.fromarray((hclose(warm_bright) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
mask = np.asarray(m).astype(np.float32)[..., None] / 255.0

lead_tone = np.clip(raw * 0.88, 0, 242.0)  # kaki -> abu-emas terlihat (bagian terblown ikut redup)
# cutout bersih berbasis siluet: badan dioda adalah proyeksi silinder = bentuk
# stadium (segmen (340,200)-(640,200) crop, jari-jari 120). Semua di dalam siluet
# (badan + teks cetak + kilau + cincin) dipertahankan apa adanya; di luarnya hanya
# kaki emas (masker baris) yang hidup, sisanya putih murni.
h, w = raw.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
dx = np.maximum(np.maximum(340 - xx, xx - 640), 0)
sil = np.sqrt(dx ** 2 + (yy - 200.0) ** 2) < 120.0
dioda = np.full_like(raw, 255.0)
dioda[sil] = raw[sil]                                                      # badan & cincin apa adanya
dioda = dioda * (1 - mask) + lead_tone * mask                              # kaki via masker baris
dioda_im = Image.fromarray(np.clip(dioda, 0, 255).astype(np.uint8))
dioda_b64 = to_b64(dioda_im)
print("dioda crop:", dioda_im.size, "-> base64", len(dioda_b64) // 1024, "KB")

# ---------------- kapasitor: crop kapasitor biru + 2 kaki ----------------
OX, OY = 545, 295
cap_im = Image.open(f"{ASET}/kapasitor-elektrolit-foto.jpg").convert("RGB").crop((OX, OY, 945, 1270))
a = np.clip(np.asarray(cap_im).astype(np.float32) * (255.0 / np.array([240.0, 242.0, 242.0])), 0, 255)
a = force_white(a, 225)  # kertas + bayangan tepi -> putih; kawat (inti <225) & strip tetap

# bersihkan elemen tetangga (koordinat absolut foto)
# 1) massa kapasitor hitam di kiri badan biru (badan biru mulai x=690)
a[: 935 - OY, : 688 - OX] = 255
# 2) massa cokelat kapasitor kanan (badan biru berakhir x=925) untuk seluruh tinggi
a[:, 925 - OX :] = 255
# 3) kaki kapasitor tetangga di kiri kaki panjang: batas diagonal tepat di tengah
#    dua kawat (kawat biru mula-mula x=705, kawat tetangga x=675, sama landai -0.433)
for y in range(935 - OY, a.shape[0]):
    yabs = y + OY
    xbound = int(690 - 0.433 * (yabs - 945)) - OX
    a[y, : max(0, xbound)] = 255
# 4) kaki kedua kapasitor tetangga di kanan kaki pendek (kaki pendek berakhir x~813)
a[935 - OY :, 816 - OX :] = 255

cap_im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
cap_b64 = to_b64(cap_im)
print("kapasitor crop:", cap_im.size, "-> base64", len(cap_b64) // 1024, "KB")

SVG = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <title>Panduan Polaritas Komponen — Dioda 1N4007 &amp; Kapasitor Elektrolit (foto nyata)</title>
  <defs>
    <style>
      text {{
        font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
        fill: #0F172A;
      }}
      .title    {{ font-size: 52px; font-weight: 800; letter-spacing: 1.5px; }}
      .subtitle {{ font-size: 26px; font-weight: 500; fill: #64748B; }}
      .panel    {{ font-size: 30px; font-weight: 700; letter-spacing: 0.5px; }}
      .label    {{ font-size: 30px; font-weight: 700; }}
      .label-pos {{ fill: #DC2626; }}
      .label-neg {{ fill: #2563EB; }}
      .note     {{ font-size: 22px; font-weight: 500; fill: #64748B; }}
      .callout  {{ font-size: 26px; font-weight: 700; }}
      .arrow    {{ stroke-width: 4; fill: none; }}
      .rule     {{ stroke: #0F172A; stroke-width: 3; }}
      .sep      {{ stroke: #E2E8F0; stroke-width: 2; }}
    </style>

    <marker id="arr-dark" markerWidth="20" markerHeight="20" markerUnits="userSpaceOnUse" refX="17" refY="10" orient="auto">
      <path d="M2,2 L18,10 L2,18 Z" fill="#0F172A"/>
    </marker>
    <marker id="arr-pos" markerWidth="20" markerHeight="20" markerUnits="userSpaceOnUse" refX="17" refY="10" orient="auto">
      <path d="M2,2 L18,10 L2,18 Z" fill="#DC2626"/>
    </marker>
    <marker id="arr-neg" markerWidth="20" markerHeight="20" markerUnits="userSpaceOnUse" refX="17" refY="10" orient="auto">
      <path d="M2,2 L18,10 L2,18 Z" fill="#2563EB"/>
    </marker>
  </defs>

  <!-- background -->
  <rect x="0" y="0" width="1920" height="1080" fill="#FFFFFF"/>

  <!-- header -->
  <text class="title" x="960" y="96" text-anchor="middle">PANDUAN POLARITAS KOMPONEN</text>
  <text class="subtitle" x="960" y="142" text-anchor="middle">Dioda Penyearah 1N4007 &amp; Kapasitor Elektrolit</text>
  <line class="rule" x1="660" y1="172" x2="1260" y2="172"/>

  <!-- vertical divider -->
  <line class="sep" x1="960" y1="250" x2="960" y2="1010"/>

  <!-- ============================= DIODA 1N4007 ============================= -->
  <text class="panel" x="480" y="302" text-anchor="middle">1 &#183; DIODA PENYEARAH (1N4007)</text>

  <!-- foto dioda 1N4007 (dioda tengah, cincin perak di ujung kanan) -->
  <image x="130" y="420" width="700" height="300" href="data:image/png;base64,{dioda_b64}"/>

  <!-- anoda (ujung kiri polos) -->
  <line class="arrow" x1="252" y1="742" x2="300" y2="650" stroke="#DC2626" marker-end="url(#arr-pos)"/>
  <text class="label label-pos" x="230" y="792" text-anchor="middle">Anoda (+)</text>
  <text class="note" x="230" y="830" text-anchor="middle">Sisi polos tanpa cincin</text>

  <!-- katoda (cincin perak/putih di ujung kanan) -->
  <line class="arrow" x1="652" y1="742" x2="628" y2="650" stroke="#2563EB" marker-end="url(#arr-neg)"/>
  <text class="label label-neg" x="645" y="792" text-anchor="middle">Katoda (-) / Garis Cincin</text>
  <text class="note" x="645" y="830" text-anchor="middle">Cincin putih/perak penanda katoda</text>

  <!-- ========================= KAPASITOR ELEKTROLIT ========================= -->
  <text class="panel" x="1440" y="302" text-anchor="middle">2 &#183; KAPASITOR ELEKTROLIT</text>

  <!-- foto kapasitor elektrolit (strip putih bertanda minus + kaki panjang/pendek) -->
  <image x="1200" y="310" width="270.8" height="660" href="data:image/png;base64,{cap_b64}"/>

  <!-- callout strip putih -->
  <line class="arrow" x1="1532" y1="478" x2="1434" y2="478" stroke="#0F172A" marker-end="url(#arr-dark)"/>
  <text class="callout" x="1546" y="470">Strip Putih (-)</text>
  <text class="note" x="1546" y="504">Penanda kutub negatif</text>

  <!-- anoda (kaki panjang) -->
  <line class="arrow" x1="1188" y1="942" x2="1214" y2="952" stroke="#DC2626" marker-end="url(#arr-pos)"/>
  <text class="label label-pos" x="1170" y="950" text-anchor="end">Anoda (+)</text>
  <text class="note" x="1170" y="986" text-anchor="end">Kaki panjang</text>

  <!-- katoda (kaki pendek, di bawah strip) -->
  <line class="arrow" x1="1382" y1="902" x2="1382" y2="862" stroke="#2563EB" marker-end="url(#arr-neg)"/>
  <text class="label label-neg" x="1382" y="950" text-anchor="middle">Katoda (-)</text>
  <text class="note" x="1382" y="986" text-anchor="middle">Kaki pendek</text>
</svg>
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(SVG)
print("ditulis:", OUT, len(SVG) // 1024, "KB")
