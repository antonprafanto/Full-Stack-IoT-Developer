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
ax.text(800, 850, "MISTERI FLOATING PIN & RESISTOR PULL-UP / PULL-DOWN", 
        fontsize=24, fontweight='bold', color='#F8FAFC', ha='center', va='center', fontfamily='Segoe UI')
ax.text(800, 815, "Kaki pin mikrokontroler bertindak seperti antena jika tidak dihubungkan ke status voltase yang pasti", 
        fontsize=13, color='#94A3B8', ha='center', va='center', fontfamily='Segoe UI')

# --- PANEL 1: FLOATING PIN ---
card1 = patches.FancyBboxPatch((50, 60), 460, 720, boxstyle="round,pad=0,rounding_size=18",
                              facecolor='#1E1622', edgecolor='#EF4444', linewidth=2)
ax.add_patch(card1)

badge1 = patches.FancyBboxPatch((70, 715), 420, 42, boxstyle="round,pad=0,rounding_size=10",
                                facecolor='#451A1A', edgecolor='#EF4444', linewidth=1.5)
ax.add_patch(badge1)
ax.text(280, 736, "1. FLOATING PIN (KONDISI MELAYANG)", 
        fontsize=12.5, fontweight='bold', color='#FCA5A5', ha='center', va='center', fontfamily='Segoe UI')

# Circuit 1
# 3.3V Box
ax.add_patch(patches.FancyBboxPatch((210, 630), 140, 45, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#1E293B', edgecolor='#EF4444', linewidth=1.5))
ax.text(280, 652, "VCC (3.3V)", color='#F87171', fontsize=11, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')

# Wire to button
ax.plot([280, 280], [630, 560], color='#EF4444', linewidth=2.5)

# Button open
ax.add_patch(patches.FancyBboxPatch((210, 495), 140, 70, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#0F172A', edgecolor='#64748B', linewidth=1.5))
ax.text(280, 542, "Sakelar Terbuka", color='#94A3B8', fontsize=10, ha='center', va='center', fontfamily='Segoe UI')
ax.plot([230, 260], [515, 532], color='#FCD34D', linewidth=2.5) # Open lever
ax.plot([275, 330], [515, 515], color='#FCD34D', linewidth=2.5)

# Wire to pin
ax.plot([280, 280], [495, 430], color='#38BDF8', linewidth=2.5)

# Pin Box
ax.add_patch(patches.FancyBboxPatch((180, 385), 200, 45, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#1E293B', edgecolor='#38BDF8', linewidth=1.5))
ax.text(280, 407, "Pin Input (GPIO 4)", color='#38BDF8', fontsize=11, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')

# Antenna illustration
ax.plot([280, 280, 330], [385, 330, 330], color='#F43F5E', linewidth=2, linestyle=':')
ax.text(340, 330, "Bertindak seperti ANTENA!", color='#FB7185', fontsize=9.5, fontweight='bold', va='center', fontfamily='Segoe UI')

# Explanations
ax.text(80, 280, "Saat tombol TIDAK ditekan:", fontsize=11, fontweight='bold', color='#E2E8F0', fontfamily='Segoe UI')
ax.text(80, 255, "• Pin terputus total dari tegangan apa pun.", fontsize=10, color='#94A3B8', fontfamily='Segoe UI')
ax.text(80, 230, "• Menyerap gelombang elektromagnetik liar,", fontsize=10, color='#94A3B8', fontfamily='Segoe UI')
ax.text(80, 205, "  sinyal Wi-Fi, dan listrik statis jari.", fontsize=10, color='#94A3B8', fontfamily='Segoe UI')

box_res1 = patches.Rectangle((80, 85), 400, 85, facecolor='#020617', edgecolor='#EF4444', linewidth=1)
ax.add_patch(box_res1)
ax.text(95, 145, "Status Bacaan ESP32:", fontsize=10, fontweight='bold', color='#F87171', fontfamily='Segoe UI')
ax.text(95, 120, "Nilai digital: 0 -> 1 -> 1 -> 0 -> 1 -> 0", fontsize=10, color='#F87171', fontfamily='Consolas')
ax.text(95, 95, "(Lampu indikator berkedip liar tanpa ditekan!)", fontsize=9.5, color='#CBD5E1', fontfamily='Segoe UI')


# --- PANEL 2: PULL-DOWN RESISTOR ---
card2 = patches.FancyBboxPatch((570, 60), 460, 720, boxstyle="round,pad=0,rounding_size=18",
                              facecolor='#1E2235', edgecolor='#3B82F6', linewidth=2)
ax.add_patch(card2)

badge2 = patches.FancyBboxPatch((590, 715), 420, 42, boxstyle="round,pad=0,rounding_size=10",
                                facecolor='#1E3A8A', edgecolor='#3B82F6', linewidth=1.5)
ax.add_patch(badge2)
ax.text(800, 736, "2. RANGKAIAN PULL-DOWN", 
        fontsize=12.5, fontweight='bold', color='#93C5FD', ha='center', va='center', fontfamily='Segoe UI')

# 3.3V Box
ax.add_patch(patches.FancyBboxPatch((730, 630), 140, 40, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#1E293B', edgecolor='#EF4444', linewidth=1.5))
ax.text(800, 650, "VCC (3.3V)", color='#F87171', fontsize=10.5, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')
ax.plot([800, 800], [630, 580], color='#EF4444', linewidth=2)

# Button
ax.add_patch(patches.FancyBboxPatch((730, 540), 140, 40, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#0F172A', edgecolor='#64748B', linewidth=1.5))
ax.text(800, 560, "Tombol Tekan", color='#E2E8F0', fontsize=10, ha='center', va='center', fontfamily='Segoe UI')
ax.plot([800, 800], [540, 470], color='#38BDF8', linewidth=2.5)

# Branch to GPIO
ax.plot([800, 850], [470, 470], color='#38BDF8', linewidth=2.5)
ax.add_patch(patches.Circle((800, 470), 5, facecolor='#38BDF8'))
ax.add_patch(patches.FancyBboxPatch((850, 450), 160, 40, boxstyle="round,pad=0,rounding_size=6",
                                   facecolor='#0F172A', edgecolor='#38BDF8', linewidth=1.5))
ax.text(930, 470, "Pin GPIO 4", color='#38BDF8', fontsize=10.5, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')

# Resistor Pull-Down
ax.plot([800, 800], [470, 420], color='#38BDF8', linewidth=2)
ax.add_patch(patches.FancyBboxPatch((740, 370), 120, 50, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#1E293B', edgecolor='#F59E0B', linewidth=1.5))
ax.text(800, 395, "R = 10 kΩ\n(Pull-Down)", color='#FCD34D', fontsize=9.5, ha='center', va='center', fontfamily='Segoe UI')

# Ground
ax.plot([800, 800], [370, 320], color='#64748B', linewidth=2)
ax.add_patch(patches.FancyBboxPatch((740, 280), 120, 40, boxstyle="round,pad=0,rounding_size=6",
                                   facecolor='#0F172A', edgecolor='#64748B', linewidth=1.2))
ax.text(800, 300, "GND (0V)", color='#94A3B8', fontsize=10, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')

# Explanations
ax.text(595, 240, "Logika Kerja Pull-Down:", fontsize=11, fontweight='bold', color='#E2E8F0', fontfamily='Segoe UI')
ax.text(595, 215, "• Tombol LEPAS: Pin ditarik ke GND -> LOW (0)", fontsize=9.5, color='#94A3B8', fontfamily='Segoe UI')
ax.text(595, 190, "• Tombol TEKAN: Arus 3.3V masuk -> HIGH (1)", fontsize=9.5, color='#94A3B8', fontfamily='Segoe UI')

box_res2 = patches.Rectangle((595, 85), 410, 85, facecolor='#020617', edgecolor='#3B82F6', linewidth=1)
ax.add_patch(box_res2)
ax.text(610, 145, "Karakteristik Pull-Down:", fontsize=10, fontweight='bold', color='#60A5FA', fontfamily='Segoe UI')
ax.text(610, 120, "• Default (Tombol Lepas) = LOW (0)", fontsize=9.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(610, 95, "• Kelemahan: Wajib pasang resistor fisik luar.", fontsize=9.5, color='#CBD5E1', fontfamily='Segoe UI')


# --- PANEL 3: PULL-UP RESISTOR ---
card3 = patches.FancyBboxPatch((1090, 60), 460, 720, boxstyle="round,pad=0,rounding_size=18",
                              facecolor='#0F231D', edgecolor='#10B981', linewidth=2)
ax.add_patch(card3)

badge3 = patches.FancyBboxPatch((1110, 715), 420, 42, boxstyle="round,pad=0,rounding_size=10",
                                facecolor='#064E3B', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(badge3)
ax.text(1320, 736, "3. PULL-UP (STANDAR INDUSTRI IoT)", 
        fontsize=12.5, fontweight='bold', color='#6EE7B7', ha='center', va='center', fontfamily='Segoe UI')

# 3.3V Box
ax.add_patch(patches.FancyBboxPatch((1250, 630), 140, 40, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#1E293B', edgecolor='#EF4444', linewidth=1.5))
ax.text(1320, 650, "VCC (3.3V)", color='#F87171', fontsize=10.5, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')
ax.plot([1320, 1320], [630, 580], color='#EF4444', linewidth=2)

# Resistor Pull-Up
ax.add_patch(patches.FancyBboxPatch((1260, 530), 120, 50, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#1E293B', edgecolor='#F59E0B', linewidth=1.5))
ax.text(1320, 555, "R = 10 kΩ\n(Pull-Up)", color='#FCD34D', fontsize=9.5, ha='center', va='center', fontfamily='Segoe UI')
ax.plot([1320, 1320], [530, 470], color='#38BDF8', linewidth=2.5)

# Branch to GPIO
ax.plot([1320, 1370], [470, 470], color='#38BDF8', linewidth=2.5)
ax.add_patch(patches.Circle((1320, 470), 5, facecolor='#38BDF8'))
ax.add_patch(patches.FancyBboxPatch((1370, 450), 160, 40, boxstyle="round,pad=0,rounding_size=6",
                                   facecolor='#0F172A', edgecolor='#38BDF8', linewidth=1.5))
ax.text(1450, 470, "Pin GPIO 4", color='#38BDF8', fontsize=10.5, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')

# Button below
ax.plot([1320, 1320], [470, 420], color='#38BDF8', linewidth=2)
ax.add_patch(patches.FancyBboxPatch((1250, 370), 140, 50, boxstyle="round,pad=0,rounding_size=8",
                                   facecolor='#0F172A', edgecolor='#64748B', linewidth=1.5))
ax.text(1320, 395, "Tombol Tekan\n(Ke GND)", color='#E2E8F0', fontsize=9.5, ha='center', va='center', fontfamily='Segoe UI')

# Ground
ax.plot([1320, 1320], [370, 320], color='#64748B', linewidth=2)
ax.add_patch(patches.FancyBboxPatch((1260, 280), 120, 40, boxstyle="round,pad=0,rounding_size=6",
                                   facecolor='#0F172A', edgecolor='#64748B', linewidth=1.2))
ax.text(1320, 300, "GND (0V)", color='#94A3B8', fontsize=10, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')

# Explanations
ax.text(1115, 240, "Logika Kerja Pull-Up:", fontsize=11, fontweight='bold', color='#E2E8F0', fontfamily='Segoe UI')
ax.text(1115, 215, "• Tombol LEPAS: Pin ditarik ke 3.3V -> HIGH (1)", fontsize=9.5, color='#94A3B8', fontfamily='Segoe UI')
ax.text(1115, 190, "• Tombol TEKAN: Pin dialirkan ke GND -> LOW (0)", fontsize=9.5, color='#94A3B8', fontfamily='Segoe UI')

box_res3 = patches.Rectangle((1115, 85), 410, 85, facecolor='#020617', edgecolor='#10B981', linewidth=1)
ax.add_patch(box_res3)
ax.text(1130, 145, "FITUR KHUSUS ESP32 (INPUT_PULLUP):", fontsize=10, fontweight='bold', color='#34D399', fontfamily='Segoe UI')
ax.text(1130, 120, "pinMode(4, INPUT_PULLUP);", fontsize=10.5, color='#6EE7B7', fontfamily='Consolas')
ax.text(1130, 95, "ESP32 sudah punya resistor pull-up di dalam chip!", fontsize=9.5, color='#CBD5E1', fontfamily='Segoe UI')

plt.savefig('00-fondasi-dasar/aset/diagram-pullup-pulldown.png', dpi=220, bbox_inches='tight', facecolor='#0B1120')
print('Generated diagram-pullup-pulldown.png successfully!')
