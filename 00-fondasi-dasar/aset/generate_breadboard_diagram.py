import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Enable high-quality system font on Windows
plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

# 16:9 widescreen canvas
fig, ax = plt.subplots(figsize=(16, 9), dpi=220)

# Color Palette (Dark Mode Engineering Theme)
BG_COLOR = "#0B1120"        # Canvas Deep Slate 950
BOARD_BG = "#F8FAFC"        # Breadboard Body Crisp Slate 50
BOARD_BORDER = "#94A3B8"    # Outer Bevel Border
COPPER_BG = "#FEF3C7"       # Amber 100 internal clip plate
COPPER_LINE = "#D97706"     # Amber 600 conductor busbar
HOLE_COLOR = "#1E293B"      # Deep pin contact hole
HOLE_RIM = "#64748B"        # Metal spring rim
POS_RED = "#EF4444"         # Power Rail Red (+)
NEG_BLUE = "#3B82F6"        # Power Rail Blue (-)
TEXT_MUTED = "#94A3B8"
CARD_BG = "#1E293B"         # Info Card Background
CARD_BORDER = "#334155"

fig.patch.set_facecolor(BG_COLOR)
ax.set_facecolor(BG_COLOR)

# Coordinates system
ax.set_xlim(-0.5, 15.5)
ax.set_ylim(-0.2, 9.2)
ax.axis("off")

# Header Title & Subtitle
plt.text(7.5, 8.80, "PETA ANATOMI & ALUR KONDUKTOR BREADBOARD", 
         fontsize=18, fontweight="bold", color="#38BDF8", ha="center", va="center")
plt.text(7.5, 8.42, "Panduan Arah Aliran Arus Listrik: Jalur Daya Horizontal vs Jalur Komponen Vertikal", 
         fontsize=11.5, color=TEXT_MUTED, ha="center", va="center")

# 1. Main Breadboard Body (Properly sized to encompass all rails)
bb_x, bb_y, bb_w, bb_h = 0.5, 0.40, 8.8, 7.60
board = patches.FancyBboxPatch(
    (bb_x, bb_y), bb_w, bb_h,
    boxstyle="round,pad=0.15,rounding_size=0.30",
    facecolor=BOARD_BG, edgecolor=BOARD_BORDER, linewidth=2.5,
    zorder=1
)
ax.add_patch(board)

# Columns setup
COLS = 12
col_x_start = 1.35
col_spacing = 0.64
col_xs = [col_x_start + i * col_spacing for i in range(COLS)]

# ----------------- TOP POWER RAILS -----------------
top_rail_box = patches.FancyBboxPatch(
    (0.8, 6.75), 8.2, 1.05,
    boxstyle="round,pad=0.06,rounding_size=0.12",
    facecolor="#F1F5F9", edgecolor="#E2E8F0", linewidth=1.2, linestyle="--",
    zorder=2
)
ax.add_patch(top_rail_box)

# Red Rail (+) Top
y_top_pos = 7.45
ax.plot([1.1, 8.7], [y_top_pos, y_top_pos], color=POS_RED, linewidth=3.5, zorder=3, alpha=0.9)
plt.text(0.95, y_top_pos, "+", fontsize=16, fontweight="bold", color=POS_RED, ha="center", va="center", zorder=4)
plt.text(8.85, y_top_pos, "+", fontsize=16, fontweight="bold", color=POS_RED, ha="center", va="center", zorder=4)

# Blue Rail (-) Top
y_top_neg = 7.05
ax.plot([1.1, 8.7], [y_top_neg, y_top_neg], color=NEG_BLUE, linewidth=3.5, zorder=3, alpha=0.9)
plt.text(0.95, y_top_neg, "-", fontsize=20, fontweight="bold", color=NEG_BLUE, ha="center", va="center", zorder=4)
plt.text(8.85, y_top_neg, "-", fontsize=20, fontweight="bold", color=NEG_BLUE, ha="center", va="center", zorder=4)

# Top power rail holes
for cx in col_xs:
    ax.add_patch(patches.Circle((cx, y_top_pos), 0.08, facecolor=HOLE_COLOR, edgecolor=HOLE_RIM, linewidth=1.2, zorder=5))
    ax.add_patch(patches.Circle((cx, y_top_neg), 0.08, facecolor=HOLE_COLOR, edgecolor=HOLE_RIM, linewidth=1.2, zorder=5))

# ----------------- TERMINAL STRIPS (MIDDLE) -----------------
# Column Numbers (1 to 12)
for i, cx in enumerate(col_xs):
    plt.text(cx, 6.42, str(i + 1), fontsize=9.5, fontweight="bold", color="#64748B", ha="center", va="center", zorder=4)

# Row Labels A - E
row_y_ae = [5.95, 5.50, 5.05, 4.60, 4.15]
row_letters_ae = ["A", "B", "C", "D", "E"]
for ry, rlabel in zip(row_y_ae, row_letters_ae):
    plt.text(0.95, ry, rlabel, fontsize=10.5, fontweight="bold", color="#64748B", ha="center", va="center", zorder=4)

# Upper Terminal Strips (Rows A - E)
for cx in col_xs:
    clip = patches.FancyBboxPatch(
        (cx - 0.17, 4.00), 0.34, 2.10,
        boxstyle="round,pad=0.04,rounding_size=0.12",
        facecolor=COPPER_BG, edgecolor=COPPER_LINE, linewidth=1.6,
        zorder=2
    )
    ax.add_patch(clip)
    ax.plot([cx, cx], [4.15, 5.95], color=COPPER_LINE, linewidth=3.2, zorder=3, alpha=0.85)
    for ry in row_y_ae:
        ax.add_patch(patches.Circle((cx, ry), 0.08, facecolor=HOLE_COLOR, edgecolor=HOLE_RIM, linewidth=1.2, zorder=5))

# Center Ravine / Parit Pemisah
ravine = patches.Rectangle(
    (0.8, 3.52), 8.2, 0.36,
    facecolor="#E2E8F0", edgecolor="#CBD5E1", linewidth=1.2,
    zorder=2
)
ax.add_patch(ravine)
plt.text(4.9, 3.70, "<-- PARIT TENGAH: ISOLASI TOTAL / TERPUTUS (TEMPAT DUDUK IC) -->", 
         fontsize=8.5, fontweight="bold", color="#475569", ha="center", va="center", zorder=4)

# Lower Terminal Strips (Rows F - J)
row_y_fj = [3.10, 2.65, 2.20, 1.75, 1.30]
row_letters_fj = ["F", "G", "H", "I", "J"]
for ry, rlabel in zip(row_y_fj, row_letters_fj):
    plt.text(0.95, ry, rlabel, fontsize=10.5, fontweight="bold", color="#64748B", ha="center", va="center", zorder=4)

for cx in col_xs:
    clip = patches.FancyBboxPatch(
        (cx - 0.17, 1.15), 0.34, 2.10,
        boxstyle="round,pad=0.04,rounding_size=0.12",
        facecolor=COPPER_BG, edgecolor=COPPER_LINE, linewidth=1.6,
        zorder=2
    )
    ax.add_patch(clip)
    ax.plot([cx, cx], [1.30, 3.10], color=COPPER_LINE, linewidth=3.2, zorder=3, alpha=0.85)
    for ry in row_y_fj:
        ax.add_patch(patches.Circle((cx, ry), 0.08, facecolor=HOLE_COLOR, edgecolor=HOLE_RIM, linewidth=1.2, zorder=5))

# ----------------- BOTTOM POWER RAILS -----------------
bot_rail_box = patches.FancyBboxPatch(
    (0.8, 0.48), 8.2, 0.58,
    boxstyle="round,pad=0.06,rounding_size=0.12",
    facecolor="#F1F5F9", edgecolor="#E2E8F0", linewidth=1.2, linestyle="--",
    zorder=2
)
ax.add_patch(bot_rail_box)

y_bot_pos = 0.90
ax.plot([1.1, 8.7], [y_bot_pos, y_bot_pos], color=POS_RED, linewidth=3.5, zorder=3, alpha=0.9)
plt.text(0.95, y_bot_pos, "+", fontsize=16, fontweight="bold", color=POS_RED, ha="center", va="center", zorder=4)
plt.text(8.85, y_bot_pos, "+", fontsize=16, fontweight="bold", color=POS_RED, ha="center", va="center", zorder=4)

y_bot_neg = 0.60
ax.plot([1.1, 8.7], [y_bot_neg, y_bot_neg], color=NEG_BLUE, linewidth=3.5, zorder=3, alpha=0.9)
plt.text(0.95, y_bot_neg, "-", fontsize=20, fontweight="bold", color=NEG_BLUE, ha="center", va="center", zorder=4)
plt.text(8.85, y_bot_neg, "-", fontsize=20, fontweight="bold", color=NEG_BLUE, ha="center", va="center", zorder=4)

for cx in col_xs:
    ax.add_patch(patches.Circle((cx, y_bot_pos), 0.08, facecolor=HOLE_COLOR, edgecolor=HOLE_RIM, linewidth=1.2, zorder=5))
    ax.add_patch(patches.Circle((cx, y_bot_neg), 0.08, facecolor=HOLE_COLOR, edgecolor=HOLE_RIM, linewidth=1.2, zorder=5))

# ----------------- SIDE INFO PANELS (RIGHT) -----------------
side_x = 9.85
card_w = 5.15

# Card 1: Power Rails
c1 = patches.FancyBboxPatch(
    (side_x, 5.85), card_w, 2.05,
    boxstyle="round,pad=0.1,rounding_size=0.18",
    facecolor=CARD_BG, edgecolor=CARD_BORDER, linewidth=1.6, zorder=2
)
ax.add_patch(c1)
ax.add_patch(patches.FancyBboxPatch((side_x + 0.25, 7.35), 1.60, 0.35, boxstyle="round,pad=0.03,rounding_size=0.08", facecolor="#2563EB", edgecolor="none", zorder=3))
plt.text(side_x + 1.05, 7.52, "HORIZONTAL", fontsize=9.5, fontweight="bold", color="#FFFFFF", ha="center", va="center", zorder=4)
plt.text(side_x + 2.05, 7.52, "Jalur Daya (Power Rails)", fontsize=12, fontweight="bold", color="#F8FAFC", ha="left", va="center", zorder=4)

desc_1 = (
    "• Tersambung mendatar dari Kiri ke Kanan.\n"
    "• Garis Merah (+): Sumber daya positif (3.3V / 5V).\n"
    "• Garis Biru (-): Ground / Titik Netral (GND 0V).\n"
    "• Fungsi: Menyediakan rel listrik bersama agar modul\n"
    "  dan sensor tidak berebut pin fisik mikrokontroler."
)
plt.text(side_x + 0.25, 6.55, desc_1, fontsize=9.8, color="#CBD5E1", ha="left", va="center", linespacing=1.38, zorder=4)

# Card 2: Terminal Strips
c2 = patches.FancyBboxPatch(
    (side_x, 3.45), card_w, 2.15,
    boxstyle="round,pad=0.1,rounding_size=0.18",
    facecolor=CARD_BG, edgecolor=CARD_BORDER, linewidth=1.6, zorder=2
)
ax.add_patch(c2)
ax.add_patch(patches.FancyBboxPatch((side_x + 0.25, 5.05), 1.45, 0.35, boxstyle="round,pad=0.03,rounding_size=0.08", facecolor="#D97706", edgecolor="none", zorder=3))
plt.text(side_x + 0.98, 5.22, "VERTIKAL", fontsize=9.5, fontweight="bold", color="#FFFFFF", ha="center", va="center", zorder=4)
plt.text(side_x + 1.90, 5.22, "Jalur Komponen (A-J)", fontsize=12, fontweight="bold", color="#F8FAFC", ha="left", va="center", zorder=4)

desc_2 = (
    "• Tersambung tegak lurus per 5 lubang:\n"
    "   - Kolom 1A s/d 1E satu pelat tembaga yang sama.\n"
    "   - Kolom 1F s/d 1J satu pelat tembaga terpisah.\n"
    "• Antar Kolom (1, 2, 3...) TERISOLASI penuh!\n"
    "• Komponen wajib menyeberang / menjembatani\n"
    "  dua kolom berbeda agar listrik mengalir normal."
)
plt.text(side_x + 0.25, 4.22, desc_2, fontsize=9.8, color="#CBD5E1", ha="left", va="center", linespacing=1.38, zorder=4)

# Card 3: Parit Tengah & Aturan Anti-Korslet
c3 = patches.FancyBboxPatch(
    (side_x, 0.90), card_w, 2.30,
    boxstyle="round,pad=0.1,rounding_size=0.18",
    facecolor=CARD_BG, edgecolor="#EF4444", linewidth=1.8, zorder=2
)
ax.add_patch(c3)
ax.add_patch(patches.FancyBboxPatch((side_x + 0.25, 2.65), 1.65, 0.35, boxstyle="round,pad=0.03,rounding_size=0.08", facecolor="#DC2626", edgecolor="none", zorder=3))
plt.text(side_x + 1.08, 2.82, "PERINGATAN", fontsize=9.5, fontweight="bold", color="#FFFFFF", ha="center", va="center", zorder=4)
plt.text(side_x + 2.10, 2.82, "Aturan Emas Anti-Korslet", fontsize=12, fontweight="bold", color="#FCA5A5", ha="left", va="center", zorder=4)

desc_3 = (
    "[SALAH] Menancapkan 2 kaki dari 1 komponen\n"
    "  pada kolom vertikal yang sama (Arus Korslet bypass!).\n"
    "[BENAR] Kaki komponen wajib MENJEMBATANI dua\n"
    "  kolom berbeda (misal 5A ke 8A) atau melompati parit.\n"
    "• Parit Tengah dibuat pas dengan lebar standar chip IC\n"
    "  agar kaki sisi kiri dan kanannya tidak bersentuhan."
)
plt.text(side_x + 0.25, 1.75, desc_3, fontsize=9.6, color="#CBD5E1", ha="left", va="center", linespacing=1.35, zorder=4)

# Connection Arrows from Info Cards to Breadboard Targets
# Arrow 1: Pointing to Top Power Rail
ax.annotate("", xy=(8.4, 7.25), xytext=(side_x - 0.15, 7.25),
            arrowprops=dict(arrowstyle="->", color="#38BDF8", lw=2.2, mutation_scale=16), zorder=6)

# Arrow 2: Pointing to Column Strip (Col 11)
ax.annotate("", xy=(7.9, 5.05), xytext=(side_x - 0.15, 5.05),
            arrowprops=dict(arrowstyle="->", color="#F59E0B", lw=2.2, mutation_scale=16), zorder=6)

# Arrow 3: Pointing to Center Ravine
ax.annotate("", xy=(8.2, 3.70), xytext=(side_x - 0.15, 2.50),
            arrowprops=dict(arrowstyle="->", color="#EF4444", lw=2.2, mutation_scale=16), zorder=6)

# Save image
out_path = r"c:\Users\anton\vibecoding\Fullstack_IOT_2026\00-fondasi-dasar\aset\breadboard-jalur-internal.png"
plt.savefig(out_path, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor(), edgecolor="none")
plt.close()
print("SUCCESS: Diagram saved to", out_path)
