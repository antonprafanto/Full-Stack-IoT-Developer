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
ANODE_RED = "#EF4444"
CATHODE_BLUE = "#38BDF8"

fig.patch.set_facecolor(BG_COLOR)
ax.set_facecolor(BG_COLOR)

ax.set_xlim(0, 16)
ax.set_ylim(0, 9.4)
ax.axis("off")

# Title & Subtitle
plt.text(8.0, 8.88, "PANDUAN MENENTUKAN POLARITAS KOMPONEN (+ vs -)", 
         fontsize=18, fontweight="bold", color="#38BDF8", ha="center", va="center")
plt.text(8.0, 8.52, "Cara Mengetahui Kaki Positif (Anoda) dan Negatif (Katoda) pada 3 Komponen Utama IoT", 
         fontsize=11.5, color=TEXT_MUTED, ha="center", va="center")

# Layout: 3 Cards side by side
card_w = 4.7
card_h = 7.7
card_y = 0.50
xs = [0.8, 5.8, 10.8]

# ==========================================
# CARD 1: LAMPU LED
# ==========================================
x1 = xs[0]
c1 = patches.FancyBboxPatch((x1, card_y), card_w, card_h, boxstyle="round,pad=0.1,rounding_size=0.2",
                           facecolor=CARD_BG, edgecolor=CARD_BORDER, linewidth=1.6, zorder=1)
ax.add_patch(c1)

# Badge & Title
ax.add_patch(patches.FancyBboxPatch((x1 + 0.3, card_y + card_h - 0.70), 1.3, 0.38, 
                                    boxstyle="round,pad=0.02,rounding_size=0.08", facecolor="#DC2626", edgecolor="none", zorder=2))
plt.text(x1 + 0.95, card_y + card_h - 0.51, "POLAR", fontsize=9.5, fontweight="bold", color="#FFF", ha="center", va="center", zorder=3)
plt.text(x1 + 1.80, card_y + card_h - 0.51, "Lampu LED", fontsize=14, fontweight="bold", color=TEXT_WHITE, ha="left", va="center", zorder=3)

center_x1 = x1 + card_w / 2
dome_base_y = card_y + 5.1

# LED Dome (Red glowing)
dome = patches.FancyBboxPatch((center_x1 - 0.65, dome_base_y), 1.3, 1.35, boxstyle="round,pad=0.08,rounding_size=0.6",
                             facecolor="#EF4444", edgecolor="#F87171", linewidth=2.5, alpha=0.9, zorder=3)
ax.add_patch(dome)
# Base rim with flat edge on right
ax.add_patch(patches.Rectangle((center_x1 - 0.72, dome_base_y - 0.15), 1.25, 0.18, facecolor="#DC2626", edgecolor="#F87171", lw=1.5, zorder=4))
# Flat edge callout
plt.text(center_x1 + 0.65, dome_base_y - 0.06, "◄ Sisi Pipih / Rata\n   (Tanda Katoda)", fontsize=8.5, fontweight="bold", color="#FCA5A5", ha="left", va="center", zorder=5)

# LED Legs (Separated widely)
leg_anode_x = center_x1 - 0.45
leg_cathode_x = center_x1 + 0.45
anode_tip_y = dome_base_y - 2.10
cathode_tip_y = dome_base_y - 1.45

# Anode leg (Long)
ax.plot([leg_anode_x, leg_anode_x], [dome_base_y - 0.15, anode_tip_y], color="#CBD5E1", lw=4.5, zorder=2)
# Cathode leg (Short)
ax.plot([leg_cathode_x, leg_cathode_x], [dome_base_y - 0.15, cathode_tip_y], color="#CBD5E1", lw=4.5, zorder=2)

# Pin Labels (Placed outside each leg to prevent any overlap!)
plt.text(leg_anode_x - 0.20, anode_tip_y + 0.4, "ANODA (+)\nKaki Panjang", fontsize=10.5, fontweight="bold", color=ANODE_RED, ha="right", va="center", linespacing=1.2, zorder=5)
ax.annotate("", xy=(leg_anode_x, anode_tip_y + 0.4), xytext=(leg_anode_x - 0.15, anode_tip_y + 0.4),
            arrowprops=dict(arrowstyle="->", color=ANODE_RED, lw=1.6), zorder=5)

plt.text(leg_cathode_x + 0.20, cathode_tip_y + 0.4, "KATODA (-)\nKaki Pendek", fontsize=10.5, fontweight="bold", color=CATHODE_BLUE, ha="left", va="center", linespacing=1.2, zorder=5)
ax.annotate("", xy=(leg_cathode_x, cathode_tip_y + 0.4), xytext=(leg_cathode_x + 0.15, cathode_tip_y + 0.4),
            arrowprops=dict(arrowstyle="->", color=CATHODE_BLUE, lw=1.6), zorder=5)

# Explanations
desc_led = (
    "• ANODA (+): Kaki lebih panjang. Di dalam\n"
    "  kubah, pelat logamnya berukuran kecil ramping.\n"
    "• KATODA (-): Kaki lebih pendek. Pada bibir\n"
    "  kubah terdapat sisi pipih/rata, dan pelat\n"
    "  di dalamnya lebih lebar menyerupai bendera.\n"
    "• Arah Arus: Hanya mengalir dari Anoda ke Katoda."
)
plt.text(x1 + 0.35, card_y + 0.95, desc_led, fontsize=9.2, color="#CBD5E1", ha="left", va="center", linespacing=1.35, zorder=3)

# ==========================================
# CARD 2: DIODA 1N4007
# ==========================================
x2 = xs[1]
c2 = patches.FancyBboxPatch((x2, card_y), card_w, card_h, boxstyle="round,pad=0.1,rounding_size=0.2",
                           facecolor=CARD_BG, edgecolor=CARD_BORDER, linewidth=1.6, zorder=1)
ax.add_patch(c2)

# Badge & Title
ax.add_patch(patches.FancyBboxPatch((x2 + 0.3, card_y + card_h - 0.70), 1.3, 0.38, 
                                    boxstyle="round,pad=0.02,rounding_size=0.08", facecolor="#475569", edgecolor="none", zorder=2))
plt.text(x2 + 0.95, card_y + card_h - 0.51, "POLAR", fontsize=9.5, fontweight="bold", color="#FFF", ha="center", va="center", zorder=3)
plt.text(x2 + 1.80, card_y + card_h - 0.51, "Dioda 1N4007", fontsize=14, fontweight="bold", color=TEXT_WHITE, ha="left", va="center", zorder=3)

center_x2 = x2 + card_w / 2
diode_y = card_y + 4.8

# Wire Leads
ax.plot([center_x2 - 1.85, center_x2 + 1.85], [diode_y, diode_y], color="#CBD5E1", lw=4.5, zorder=2)
# Diode Body (Black Cylinder)
body_w, body_h = 2.1, 1.05
ax.add_patch(patches.FancyBboxPatch((center_x2 - 1.05, diode_y - 0.525), body_w, body_h,
                                    boxstyle="round,pad=0.04,rounding_size=0.15",
                                    facecolor="#0F172A", edgecolor="#64748B", lw=2, zorder=3))
plt.text(center_x2 - 0.25, diode_y, "1N4007", fontsize=9, fontweight="bold", color="#94A3B8", ha="center", va="center", zorder=4)

# Silver Cathode Ring on the Right
ax.add_patch(patches.Rectangle((center_x2 + 0.45, diode_y - 0.525), 0.38, body_h,
                               facecolor="#E2E8F0", edgecolor="#CBD5E1", zorder=4))
# Pointer to silver ring
plt.text(center_x2 + 0.64, diode_y + 1.05, "Cincin Perak / Putih\n(Tanda Katoda)", fontsize=8.5, fontweight="bold", color="#38BDF8", ha="center", va="center", zorder=5)
ax.annotate("", xy=(center_x2 + 0.64, diode_y + 0.60), xytext=(center_x2 + 0.64, diode_y + 0.85),
            arrowprops=dict(arrowstyle="->", color="#38BDF8", lw=1.8), zorder=5)

# Pin Labels
plt.text(center_x2 - 1.4, diode_y - 0.95, "ANODA (+)", fontsize=11, fontweight="bold", color=ANODE_RED, ha="center", va="center", zorder=5)
plt.text(center_x2 - 1.4, diode_y - 1.20, "Badan Hitam", fontsize=9, color="#FCA5A5", ha="center", va="center", zorder=5)

plt.text(center_x2 + 1.4, diode_y - 0.95, "KATODA (-)", fontsize=11, fontweight="bold", color=CATHODE_BLUE, ha="center", va="center", zorder=5)
plt.text(center_x2 + 1.4, diode_y - 1.20, "Sisi Cincin Perak", fontsize=9, color="#BAE6FD", ha="center", va="center", zorder=5)

# Explanations
desc_diode = (
    "• KATODA (-): Ujung tubuh yang memiliki\n"
    "  garis cincin melingkar berwarna perak/putih.\n"
    "• ANODA (+): Ujung tubuh berwarna hitam polos\n"
    "  tanpa garis cincin.\n"
    "• Fungsi: Katup pengaman arus satu arah\n"
    "  (mencegah aliran balik yang merusak ESP32)."
)
plt.text(x2 + 0.35, card_y + 0.95, desc_diode, fontsize=9.2, color="#CBD5E1", ha="left", va="center", linespacing=1.35, zorder=3)

# ==========================================
# CARD 3: KAPASITOR ELEKTROLIT
# ==========================================
x3 = xs[2]
c3 = patches.FancyBboxPatch((x3, card_y), card_w, card_h, boxstyle="round,pad=0.1,rounding_size=0.2",
                           facecolor=CARD_BG, edgecolor=CARD_BORDER, linewidth=1.6, zorder=1)
ax.add_patch(c3)

# Badge & Title
ax.add_patch(patches.FancyBboxPatch((x3 + 0.3, card_y + card_h - 0.70), 1.3, 0.38, 
                                    boxstyle="round,pad=0.02,rounding_size=0.08", facecolor="#2563EB", edgecolor="none", zorder=2))
plt.text(x3 + 0.95, card_y + card_h - 0.51, "POLAR", fontsize=9.5, fontweight="bold", color="#FFF", ha="center", va="center", zorder=3)
plt.text(x3 + 1.80, card_y + card_h - 0.51, "Kapasitor Elektrolit", fontsize=14, fontweight="bold", color=TEXT_WHITE, ha="left", va="center", zorder=3)

center_x3 = x3 + card_w / 2
cap_y = card_y + 5.1

# Can Body
can_w, can_h = 1.4, 1.8
ax.add_patch(patches.FancyBboxPatch((center_x3 - 0.70, cap_y - 0.90), can_w, can_h,
                                    boxstyle="round,pad=0.05,rounding_size=0.15",
                                    facecolor="#1E3A8A", edgecolor="#3B82F6", lw=2.2, zorder=3))

# Stripe on the Right side (Minus stripe)
ax.add_patch(patches.Rectangle((center_x3 + 0.15, cap_y - 0.90), 0.45, can_h,
                               facecolor="#CBD5E1", edgecolor="none", zorder=4))
# Minus signs on stripe
plt.text(center_x3 + 0.37, cap_y + 0.45, "-", fontsize=20, fontweight="bold", color="#0F172A", ha="center", va="center", zorder=5)
plt.text(center_x3 + 0.37, cap_y, "-", fontsize=20, fontweight="bold", color="#0F172A", ha="center", va="center", zorder=5)
plt.text(center_x3 + 0.37, cap_y - 0.45, "-", fontsize=20, fontweight="bold", color="#0F172A", ha="center", va="center", zorder=5)

plt.text(center_x3 - 0.28, cap_y, "100µF\n16V", fontsize=9, fontweight="bold", color="#93C5FD", ha="center", va="center", zorder=5)

# Legs (Anode long, Cathode short)
cap_anode_x = center_x3 - 0.45
cap_cathode_x = center_x3 + 0.45
cap_anode_tip_y = cap_y - 2.30
cap_cathode_tip_y = cap_y - 1.65

ax.plot([cap_anode_x, cap_anode_x], [cap_y - 0.90, cap_anode_tip_y], color="#CBD5E1", lw=4.5, zorder=2)
ax.plot([cap_cathode_x, cap_cathode_x], [cap_y - 0.90, cap_cathode_tip_y], color="#CBD5E1", lw=4.5, zorder=2)

# Pin Labels (Placed outside each leg to prevent any overlap!)
plt.text(cap_anode_x - 0.20, cap_anode_tip_y + 0.4, "ANODA (+)\nKaki Panjang", fontsize=10.5, fontweight="bold", color=ANODE_RED, ha="right", va="center", linespacing=1.2, zorder=5)
ax.annotate("", xy=(cap_anode_x, cap_anode_tip_y + 0.4), xytext=(cap_anode_x - 0.15, cap_anode_tip_y + 0.4),
            arrowprops=dict(arrowstyle="->", color=ANODE_RED, lw=1.6), zorder=5)

plt.text(cap_cathode_x + 0.20, cap_cathode_tip_y + 0.4, "KATODA (-)\nKaki Pendek", fontsize=10.5, fontweight="bold", color=CATHODE_BLUE, ha="left", va="center", linespacing=1.2, zorder=5)
ax.annotate("", xy=(cap_cathode_x, cap_cathode_tip_y + 0.4), xytext=(cap_cathode_x + 0.15, cap_cathode_tip_y + 0.4),
            arrowprops=dict(arrowstyle="->", color=CATHODE_BLUE, lw=1.6), zorder=5)

# Pointer to stripe
plt.text(center_x3 + 1.25, cap_y + 0.35, "◄ Strip Minus (-)\n   Abu-abu Terang", fontsize=8.5, fontweight="bold", color="#38BDF8", ha="left", va="center", zorder=5)

# Explanations
desc_cap = (
    "• KATODA (-): Kaki lebih pendek, dan di sisi\n"
    "  tabung terdapat strip vertikal bertanda minus (-).\n"
    "• ANODA (+): Kaki lebih panjang pada sisi polos.\n"
    "• BAHAYA: Jangan pasang terbalik! Kapasitor\n"
    "  dapat meletus jika dipasang terbalik pada\n"
    "  rangkaian daya tinggi."
)
plt.text(x3 + 0.35, card_y + 0.95, desc_cap, fontsize=9.2, color="#CBD5E1", ha="left", va="center", linespacing=1.35, zorder=3)

# Save
out_path = r"c:\Users\anton\vibecoding\Fullstack_IOT_2026\00-fondasi-dasar\aset\panduan-polaritas-komponen.png"
plt.savefig(out_path, dpi=220, bbox_inches="tight", facecolor=fig.get_facecolor(), edgecolor="none")
plt.close()
print("SUCCESS: Saved to", out_path)
