import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig = plt.figure(figsize=(16, 9), dpi=220)
fig.patch.set_facecolor('#0B1120')
ax = fig.add_axes([0, 0, 1, 1])
ax.set_facecolor('#0B1120')
ax.set_xlim(0, 1600)
ax.set_ylim(0, 900)
ax.axis('off')

# Header
ax.text(800, 850, "RANGKAIAN PEMBAGI TEGANGAN (VOLTAGE DIVIDER)", 
        fontsize=24, fontweight='bold', color='#F8FAFC', ha='center', va='center', fontfamily='Segoe UI')
ax.text(800, 815, "Jembatan pengubah perubahan hambatan fisik (Ohm) menjadi sinyal tegangan (Volt) yang bisa dibaca ADC ESP32", 
        fontsize=13, color='#94A3B8', ha='center', va='center', fontfamily='Segoe UI')

# --- LEFT CARD: SKEMA SIRKUIT & RUMUS ---
card_left = patches.FancyBboxPatch((60, 60), 680, 720, boxstyle="round,pad=0,rounding_size=20",
                                   facecolor='#1E2235', edgecolor='#38BDF8', linewidth=2)
ax.add_patch(card_left)

badge_l = patches.FancyBboxPatch((80, 715), 640, 42, boxstyle="round,pad=0,rounding_size=10",
                                facecolor='#0C4A6E', edgecolor='#38BDF8', linewidth=1.5)
ax.add_patch(badge_l)
ax.text(400, 736, "SKEMA SIRKUIT DASAR & RUMUS MATEMATIS", 
        fontsize=13.5, fontweight='bold', color='#BAE6FD', ha='center', va='center', fontfamily='Segoe UI')

# Circuit layout
# Vin (3.3V)
ax.add_patch(patches.FancyBboxPatch((320, 630), 160, 45, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#1E293B', edgecolor='#EF4444', linewidth=1.5))
ax.text(400, 652, "Vin = 3.3V", color='#F87171', fontsize=12, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')
ax.plot([400, 400], [630, 570], color='#EF4444', linewidth=2.5)

# R1 - Sensor LDR
ax.add_patch(patches.FancyBboxPatch((310, 500), 180, 70, boxstyle="round,pad=0,rounding_size=10",
                                   facecolor='#0F172A', edgecolor='#F59E0B', linewidth=2))
ax.text(400, 545, "R1 (Sensor LDR)", color='#FCD34D', fontsize=11.5, fontweight='bold', ha='center', fontfamily='Segoe UI')
ax.text(400, 520, "Hambatan Berubah-ubah", color='#CBD5E1', fontsize=9.5, ha='center', fontfamily='Segoe UI')
ax.plot([400, 400], [500, 420], color='#38BDF8', linewidth=2.5)

# Vout Tap Point
ax.add_patch(patches.Circle((400, 420), 6, facecolor='#38BDF8'))
ax.plot([400, 550], [420, 420], color='#F59E0B', linewidth=3)
ax.add_patch(patches.FancyBboxPatch((550, 395), 160, 50, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#020617', edgecolor='#F59E0B', linewidth=1.8))
ax.text(630, 427, "Vout ke Pin ADC", color='#FCD34D', fontsize=10.5, fontweight='bold', ha='center', fontfamily='Segoe UI')
ax.text(630, 408, "(GPIO 34)", color='#BAE6FD', fontsize=9.5, ha='center', fontfamily='Segoe UI')

# R2 - Fixed Resistor
ax.plot([400, 400], [420, 370], color='#38BDF8', linewidth=2.5)
ax.add_patch(patches.FancyBboxPatch((310, 300), 180, 70, boxstyle="round,pad=0,rounding_size=10",
                                   facecolor='#0F172A', edgecolor='#3B82F6', linewidth=2))
ax.text(400, 345, "R2 (Resistor Tetap)", color='#93C5FD', fontsize=11.5, fontweight='bold', ha='center', fontfamily='Segoe UI')
ax.text(400, 320, "Nilai Stabil: 10 kΩ", color='#CBD5E1', fontsize=9.5, ha='center', fontfamily='Segoe UI')

# GND
ax.plot([400, 400], [300, 240], color='#64748B', linewidth=2.5)
ax.add_patch(patches.FancyBboxPatch((320, 195), 160, 45, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#1E293B', edgecolor='#64748B', linewidth=1.5))
ax.text(400, 217, "GND (0V)", color='#94A3B8', fontsize=12, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')

# Formula Box
box_formula = patches.FancyBboxPatch((80, 80), 640, 95, boxstyle="round,pad=0,rounding_size=10",
                                     facecolor='#020617', edgecolor='#38BDF8', linewidth=1.5)
ax.add_patch(box_formula)
ax.text(400, 142, "RUMUS PEMBAGI TEGANGAN:", fontsize=11, fontweight='bold', color='#38BDF8', ha='center', fontfamily='Segoe UI')
ax.text(400, 110, "Vout = Vin × [ R2 / (R1 + R2) ]", fontsize=14, fontweight='bold', color='#F8FAFC', ha='center', fontfamily='Segoe UI')


# --- RIGHT CARD: SIMULASI KONDISI TERANG VS GELAP ---
card_right = patches.FancyBboxPatch((780, 60), 760, 720, boxstyle="round,pad=0,rounding_size=20",
                                    facecolor='#0F172A', edgecolor='#10B981', linewidth=2)
ax.add_patch(card_right)

badge_r = patches.FancyBboxPatch((800, 715), 720, 42, boxstyle="round,pad=0,rounding_size=10",
                                 facecolor='#064E3B', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(badge_r)
ax.text(1160, 736, "SIMULASI KERJA DINAMIS: TERANG vs GELAP", 
        fontsize=13.5, fontweight='bold', color='#6EE7B7', ha='center', va='center', fontfamily='Segoe UI')

# Condition 1: TERANG BENDERANG
card_bright = patches.FancyBboxPatch((810, 435), 700, 260, boxstyle="round,pad=0,rounding_size=14",
                                     facecolor='#1E293B', edgecolor='#F59E0B', linewidth=1.8)
ax.add_patch(card_bright)

ax.text(835, 665, "KONDISI 1: RUANGAN TERANG BENDERANG (Disinari Cahaya)", 
        fontsize=12.5, fontweight='bold', color='#FCD34D', fontfamily='Segoe UI')
ax.text(835, 630, "• Hambatan LDR (R1) jatuh drastis: R1 ≈ 500 Ω (0.5 kΩ)", fontsize=11, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(835, 600, "• Nilai R2 tetap: 10.000 Ω (10 kΩ)", fontsize=11, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(835, 565, "• Perhitungan Voltase:", fontsize=11, fontweight='bold', color='#BAE6FD', fontfamily='Segoe UI')
ax.text(855, 535, "Vout = 3.3V × [ 10.000 / (500 + 10.000) ] = 3.3V × 0.952 ≈ 3.14 Volt", 
        fontsize=11.5, color='#F8FAFC', fontfamily='Consolas')

badge_out_bright = patches.FancyBboxPatch((835, 455), 650, 48, boxstyle="round,pad=0,rounding_size=8",
                                          facecolor='#020617', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(badge_out_bright)
ax.text(1160, 479, "BACAAN ADC ESP32: ~3900 / 4095  (Tinggi mendekati 3.3V!)", 
        color='#34D399', fontsize=11.5, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')


# Condition 2: GELAP GULITA
card_dark = patches.FancyBboxPatch((810, 150), 700, 260, boxstyle="round,pad=0,rounding_size=14",
                                   facecolor='#1E293B', edgecolor='#64748B', linewidth=1.8)
ax.add_patch(card_dark)

ax.text(835, 380, "KONDISI 2: RUANGAN GELAP GULITA (Ditutup Jari / Malam Hari)", 
        fontsize=12.5, fontweight='bold', color='#94A3B8', fontfamily='Segoe UI')
ax.text(835, 345, "• Hambatan LDR (R1) melonjak sangat tinggi: R1 ≈ 100.000 Ω (100 kΩ)", fontsize=11, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(835, 315, "• Nilai R2 tetap: 10.000 Ω (10 kΩ)", fontsize=11, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(835, 280, "• Perhitungan Voltase:", fontsize=11, fontweight='bold', color='#BAE6FD', fontfamily='Segoe UI')
ax.text(855, 250, "Vout = 3.3V × [ 10.000 / (100.000 + 10.000) ] = 3.3V × 0.091 ≈ 0.30 Volt", 
        fontsize=11.5, color='#F8FAFC', fontfamily='Consolas')

badge_out_dark = patches.FancyBboxPatch((835, 170), 650, 48, boxstyle="round,pad=0,rounding_size=8",
                                        facecolor='#020617', edgecolor='#EF4444', linewidth=1.5)
ax.add_patch(badge_out_dark)
ax.text(1160, 194, "BACAAN ADC ESP32: ~370 / 4095  (Rendah mendekati 0V GND!)", 
        color='#F87171', fontsize=11.5, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')

# Bottom takeaway
ax.text(1160, 95, "Kesimpulan: ADC ESP32 bisa mengukur perubahan intensitas cahaya karena pembagi tegangan!", 
        fontsize=11, color='#94A3B8', ha='center', fontfamily='Segoe UI')

plt.savefig('00-fondasi-dasar/aset/diagram-voltage-divider.png', dpi=220, bbox_inches='tight', facecolor='#0B1120')
print('Generated diagram-voltage-divider.png successfully!')
