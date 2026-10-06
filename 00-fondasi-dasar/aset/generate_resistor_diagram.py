import matplotlib.pyplot as plt
import matplotlib.patches as patches

plt.rcParams['font.sans-serif'] = ['Segoe UI', 'Arial', 'DejaVu Sans']
plt.rcParams['font.family'] = 'sans-serif'

fig, ax = plt.subplots(figsize=(16, 9.2), dpi=220)

# Colors
BG_COLOR = "#0B1120"
CARD_BG = "#1E293B"
CARD_BORDER = "#334155"
TEXT_WHITE = "#F8FAFC"
TEXT_MUTED = "#94A3B8"

fig.patch.set_facecolor(BG_COLOR)
ax.set_facecolor(BG_COLOR)

ax.set_xlim(0, 16)
ax.set_ylim(0, 9.4)
ax.axis("off")

# Header
plt.text(8.0, 8.85, "ANATOMI & CARA MEMBACA GELANG WARNA RESISTOR", 
         fontsize=18, fontweight="bold", color="#38BDF8", ha="center", va="center")
plt.text(8.0, 8.48, "Panduan Menghitung Nilai Hambatan Resistor 4-Gelang Tanpa Rumit untuk Proyek IoT", 
         fontsize=11.5, color=TEXT_MUTED, ha="center", va="center")

# Main Container Card
main_card = patches.FancyBboxPatch((0.8, 0.55), 14.4, 7.60, boxstyle="round,pad=0.1,rounding_size=0.2",
                                  facecolor=CARD_BG, edgecolor=CARD_BORDER, linewidth=1.8, zorder=1)
ax.add_patch(main_card)

# Non-Polar Badge
ax.add_patch(patches.FancyBboxPatch((1.2, 7.45), 2.7, 0.42, boxstyle="round,pad=0.03,rounding_size=0.1",
                                    facecolor="#059669", edgecolor="none", zorder=3))
plt.text(2.55, 7.66, "KOMPONEN NON-POLAR (Bebas Bolak-Balik)", fontsize=9.2, fontweight="bold", color="#FFFFFF", ha="center", va="center", zorder=4)

# ----------------- DRAWING RESISTOR BODY -----------------
center_y = 5.25
center_x = 8.0

# Wire Leads
ax.plot([1.6, 14.4], [center_y, center_y], color="#94A3B8", lw=8, zorder=2)

# Resistor Body (Generous width to space bands comfortably)
# Main center cylinder
ax.add_patch(patches.FancyBboxPatch((center_x - 4.2, center_y - 0.75), 8.4, 1.5,
                                    boxstyle="round,pad=0.08,rounding_size=0.35",
                                    facecolor="#E2D9C8", edgecolor="#B8A995", lw=2.5, zorder=3))
# Left lobe
ax.add_patch(patches.FancyBboxPatch((center_x - 4.5, center_y - 0.92), 1.4, 1.84,
                                    boxstyle="round,pad=0.08,rounding_size=0.45",
                                    facecolor="#E2D9C8", edgecolor="#B8A995", lw=2.5, zorder=3))
# Right lobe
ax.add_patch(patches.FancyBboxPatch((center_x + 3.1, center_y - 0.92), 1.4, 1.84,
                                    boxstyle="round,pad=0.08,rounding_size=0.45",
                                    facecolor="#E2D9C8", edgecolor="#B8A995", lw=2.5, zorder=3))

# 4 COLOR BANDS (Spaced across 7 units)
band_w = 0.55
band_h = 1.70
b1_x = center_x - 3.0  # Band 1: Merah
b2_x = center_x - 1.1  # Band 2: Merah
b3_x = center_x + 0.8  # Band 3: Cokelat
b4_x = center_x + 3.0  # Band 4: Emas

# Band 1: Merah (2)
ax.add_patch(patches.Rectangle((b1_x - band_w/2, center_y - band_h/2), band_w, band_h, facecolor="#DC2626", edgecolor="#991B1B", lw=1.2, zorder=4))
# Band 2: Merah (2)
ax.add_patch(patches.Rectangle((b2_x - band_w/2, center_y - band_h/2), band_w, band_h, facecolor="#DC2626", edgecolor="#991B1B", lw=1.2, zorder=4))
# Band 3: Cokelat (x10)
ax.add_patch(patches.Rectangle((b3_x - band_w/2, center_y - band_h/2), band_w, band_h, facecolor="#78350F", edgecolor="#451A03", lw=1.2, zorder=4))
# Band 4: Emas (5%)
ax.add_patch(patches.Rectangle((b4_x - band_w/2, center_y - band_h/2), band_w, band_h, facecolor="#F59E0B", edgecolor="#B45309", lw=1.2, zorder=4))

# ----------------- CALLOUT ARROWS & LABELS -----------------
# Band 1 Callout
plt.text(b1_x, center_y + 1.85, "GELANG 1\nAngka Ke-1\n(Merah = 2)", fontsize=10.5, fontweight="bold", color="#FCA5A5", ha="center", va="center", zorder=5)
ax.annotate("", xy=(b1_x, center_y + 0.98), xytext=(b1_x, center_y + 1.35),
            arrowprops=dict(arrowstyle="->", color="#DC2626", lw=2), zorder=5)

# Band 2 Callout
plt.text(b2_x, center_y + 1.85, "GELANG 2\nAngka Ke-2\n(Merah = 2)", fontsize=10.5, fontweight="bold", color="#FCA5A5", ha="center", va="center", zorder=5)
ax.annotate("", xy=(b2_x, center_y + 0.98), xytext=(b2_x, center_y + 1.35),
            arrowprops=dict(arrowstyle="->", color="#DC2626", lw=2), zorder=5)

# Band 3 Callout
plt.text(b3_x, center_y + 1.85, "GELANG 3\nPengali Jumlah Nol\n(Cokelat = ×10)", fontsize=10.5, fontweight="bold", color="#FDE68A", ha="center", va="center", zorder=5)
ax.annotate("", xy=(b3_x, center_y + 0.98), xytext=(b3_x, center_y + 1.35),
            arrowprops=dict(arrowstyle="->", color="#D97706", lw=2), zorder=5)

# Band 4 Callout
plt.text(b4_x, center_y + 1.85, "GELANG 4\nToleransi Presisi\n(Emas = ±5%)", fontsize=10.5, fontweight="bold", color="#FCD34D", ha="center", va="center", zorder=5)
ax.annotate("", xy=(b4_x, center_y + 0.98), xytext=(b4_x, center_y + 1.35),
            arrowprops=dict(arrowstyle="->", color="#F59E0B", lw=2), zorder=5)

# ----------------- CALCULATION RESULT BADGE -----------------
calc_box = patches.FancyBboxPatch((1.6, 3.40), 12.8, 0.75, boxstyle="round,pad=0.05,rounding_size=0.15",
                                 facecolor="#0F172A", edgecolor="#38BDF8", lw=2, zorder=3)
ax.add_patch(calc_box)

calc_text = "RUMUS:  [ Gelang 1 & 2 ]  ×  Pengali  =  [ 2 ][ 2 ]  ×  10  =  220 Ω (Toleransi ±5%)"
plt.text(8.0, 3.78, calc_text, fontsize=13, fontweight="bold", color="#38BDF8", ha="center", va="center", zorder=5)

# ----------------- 3 ESSENTIAL IOT RESISTORS (BOTTOM) -----------------
mini_w = 4.35
mini_h = 2.05
mini_y = 0.90
m_xs = [1.2, 5.82, 10.45]

# Mini 1: 220 Ohm
ax.add_patch(patches.FancyBboxPatch((m_xs[0], mini_y), mini_w, mini_h, boxstyle="round,pad=0.05,rounding_size=0.12",
                                    facecolor="#0F172A", edgecolor="#334155", lw=1.4, zorder=2))
plt.text(m_xs[0] + 0.25, mini_y + mini_h - 0.35, "1. Resistor 220 Ω", fontsize=11.5, fontweight="bold", color="#EF4444", ha="left", va="center", zorder=3)
plt.text(m_xs[0] + 0.25, mini_y + mini_h - 0.70, "Warna: Merah – Merah – Cokelat", fontsize=9.5, fontweight="bold", color="#F8FAFC", ha="left", va="center", zorder=3)
desc_m1 = "Fungsi: Pengaman Lampu LED.\nMencegah lampu terbakar saat\ndialiri tegangan 3.3V dari pin ESP32."
plt.text(m_xs[0] + 0.25, mini_y + 0.55, desc_m1, fontsize=9.2, color="#CBD5E1", ha="left", va="center", linespacing=1.3, zorder=3)

# Mini 2: 1k Ohm
ax.add_patch(patches.FancyBboxPatch((m_xs[1], mini_y), mini_w, mini_h, boxstyle="round,pad=0.05,rounding_size=0.12",
                                    facecolor="#0F172A", edgecolor="#334155", lw=1.4, zorder=2))
plt.text(m_xs[1] + 0.25, mini_y + mini_h - 0.35, "2. Resistor 1 kΩ (1.000 Ω)", fontsize=11.5, fontweight="bold", color="#38BDF8", ha="left", va="center", zorder=3)
plt.text(m_xs[1] + 0.25, mini_y + mini_h - 0.70, "Warna: Cokelat – Hitam – Merah", fontsize=9.5, fontweight="bold", color="#F8FAFC", ha="left", va="center", zorder=3)
desc_m2 = "Fungsi: Driver & Pembagi Tegangan.\nMembagi voltase sensor analog dan\nmengamankan kaki basis transistor."
plt.text(m_xs[1] + 0.25, mini_y + 0.55, desc_m2, fontsize=9.2, color="#CBD5E1", ha="left", va="center", linespacing=1.3, zorder=3)

# Mini 3: 10k Ohm
ax.add_patch(patches.FancyBboxPatch((m_xs[2], mini_y), mini_w, mini_h, boxstyle="round,pad=0.05,rounding_size=0.12",
                                    facecolor="#0F172A", edgecolor="#334155", lw=1.4, zorder=2))
plt.text(m_xs[2] + 0.25, mini_y + mini_h - 0.35, "3. Resistor 10 kΩ (10.000 Ω)", fontsize=11.5, fontweight="bold", color="#F59E0B", ha="left", va="center", zorder=3)
plt.text(m_xs[2] + 0.25, mini_y + mini_h - 0.70, "Warna: Cokelat – Hitam – Oranye", fontsize=9.5, fontweight="bold", color="#F8FAFC", ha="left", va="center", zorder=3)
desc_m3 = "Fungsi: Pull-Up / Pull-Down.\nMencegah sinyal mengambang (floating)\npada tombol tekan dan sensor LDR."
plt.text(m_xs[2] + 0.25, mini_y + 0.55, desc_m3, fontsize=9.2, color="#CBD5E1", ha="left", va="center", linespacing=1.3, zorder=3)

# Save image
out_path = r"c:\Users\anton\vibecoding\Fullstack_IOT_2026\00-fondasi-dasar\aset\diagram-anatomi-resistor.png"
plt.savefig(out_path, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor(), edgecolor="none")
plt.close()
print("SUCCESS: Saved to", out_path)
