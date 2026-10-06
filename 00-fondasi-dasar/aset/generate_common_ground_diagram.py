import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig = plt.figure(figsize=(16, 9), dpi=220)
fig.patch.set_facecolor('#0B1120')
ax = fig.add_axes([0, 0, 1, 1])
ax.set_facecolor('#0B1120')
ax.set_xlim(0, 1600)
ax.set_ylim(0, 900)
ax.axis('off')

# Title & Header
ax.text(800, 850, "PRINSIP MUTLAK COMMON GROUND (GND BERSAMA)", 
        fontsize=24, fontweight='bold', color='#F8FAFC', ha='center', va='center', fontfamily='Segoe UI')
ax.text(800, 815, "Tegangan listrik adalah beda potensial relatif: Semua komponen & catu daya wajib berbagi titik acuan 0V yang sama!", 
        fontsize=13, color='#94A3B8', ha='center', va='center', fontfamily='Segoe UI')

# --- LEFT CARD: TANPA COMMON GROUND ---
card_left = patches.FancyBboxPatch((60, 70), 700, 700, boxstyle="round,pad=0,rounding_size=20",
                                   facecolor='#1E1622', edgecolor='#EF4444', linewidth=2.5)
ax.add_patch(card_left)

# Badge Left
badge_l = patches.FancyBboxPatch((90, 715), 640, 45, boxstyle="round,pad=0,rounding_size=10",
                                facecolor='#451A1A', edgecolor='#EF4444', linewidth=1.5)
ax.add_patch(badge_l)
ax.text(410, 737, "CARA SALAH: TANPA COMMON GROUND (DATA RUSAK & LIAR)", 
        fontsize=13.5, fontweight='bold', color='#FCA5A5', ha='center', va='center', fontfamily='Segoe UI')

# Left - Sensor Block
sensor_l = patches.FancyBboxPatch((100, 490), 220, 180, boxstyle="round,pad=0,rounding_size=12",
                                  facecolor='#1E293B', edgecolor='#475569', linewidth=2)
ax.add_patch(sensor_l)
ax.text(210, 640, "SENSOR EKSTERNAL", fontsize=13, fontweight='bold', color='#38BDF8', ha='center', fontfamily='Segoe UI')
ax.text(210, 615, "(Ditenagai Baterai 9V Luar)", fontsize=10, color='#94A3B8', ha='center', fontfamily='Segoe UI')
ax.text(120, 560, "• VCC (9V): Catu Daya Luar", fontsize=10, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(120, 530, "• Sinyal Data: Out Pin", fontsize=10, color='#FCD34D', fontfamily='Segoe UI')
ax.text(120, 505, "• GND Sensor: Negatif Baterai", fontsize=10, color='#94A3B8', fontfamily='Segoe UI')

# Left - ESP32 Block
esp_l = patches.FancyBboxPatch((500, 490), 220, 180, boxstyle="round,pad=0,rounding_size=12",
                               facecolor='#1E293B', edgecolor='#475569', linewidth=2)
ax.add_patch(esp_l)
ax.text(610, 640, "BOARD ESP32", fontsize=13, fontweight='bold', color='#38BDF8', ha='center', fontfamily='Segoe UI')
ax.text(610, 615, "(Ditenagai USB Laptop 5V)", fontsize=10, color='#94A3B8', ha='center', fontfamily='Segoe UI')
ax.text(520, 560, "• Pin ADC / GPIO 34", fontsize=10, color='#FCD34D', fontfamily='Segoe UI')
ax.text(520, 530, "• Pin GND ESP32 (0V USB)", fontsize=10, color='#94A3B8', fontfamily='Segoe UI')
ax.text(520, 505, "• Chip ADC Silikon ESP32", fontsize=10, color='#CBD5E1', fontfamily='Segoe UI')

# Left Wires
# Signal wire
ax.plot([320, 500], [560, 560], color='#F59E0B', linewidth=3)
ax.text(410, 580, "Kabel Sinyal Tersambung", color='#FCD34D', fontsize=11, fontweight='bold', ha='center', fontfamily='Segoe UI')

# GND wire disconnected
ax.plot([210, 210, 310], [490, 420, 420], color='#EF4444', linewidth=3, linestyle='--')
ax.plot([510, 610, 610], [420, 420, 490], color='#EF4444', linewidth=3, linestyle='--')
# Big X mark pill
badge_x = patches.FancyBboxPatch((320, 400), 180, 40, boxstyle="round,pad=0,rounding_size=8",
                                 facecolor='#451A1A', edgecolor='#EF4444', linewidth=1.5)
ax.add_patch(badge_x)
ax.text(410, 420, "TERPUTUS!", color='#FCA5A5', fontsize=12, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')
ax.text(410, 375, "(Tidak Ada Jalur GND Bersama)", color='#F87171', fontsize=10.5, ha='center', fontfamily='Segoe UI')

# Left Result Box
res_box_l = patches.FancyBboxPatch((100, 100), 620, 240, boxstyle="round,pad=0,rounding_size=14",
                                  facecolor='#0F172A', edgecolor='#EF4444', linewidth=1.5)
ax.add_patch(res_box_l)
ax.text(410, 305, "AKIBAT FATAL PADA SISTEM:", fontsize=13, fontweight='bold', color='#EF4444', ha='center', fontfamily='Segoe UI')
ax.text(120, 270, "1. ESP32 mengukur voltase sensor terhadap GND miliknya sendiri.", fontsize=11, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(120, 240, "2. Karena kedua GND tidak terhubung, tidak ada titik referensi 0V yang sama.", fontsize=11, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(120, 210, "3. Muatan statis mengambang di udara, membuat tegangan referensi melayang acak.", fontsize=11, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(120, 165, "Output Serial Monitor Liar:", fontsize=11, fontweight='bold', color='#F87171', fontfamily='Segoe UI')

# Code simulation display
code_box_l = patches.Rectangle((120, 115), 580, 40, facecolor='#020617', edgecolor='#334155', linewidth=1)
ax.add_patch(code_box_l)
ax.text(135, 133, "ADC Read:  0 -> 4095 -> 124 -> 3810 -> 0 -> 2190  (Acak seperti ada hantu!)", 
        fontsize=10.5, color='#F87171', fontfamily='Consolas')


# --- RIGHT CARD: DENGAN COMMON GROUND ---
card_right = patches.FancyBboxPatch((840, 70), 700, 700, boxstyle="round,pad=0,rounding_size=20",
                                    facecolor='#0F231D', edgecolor='#10B981', linewidth=2.5)
ax.add_patch(card_right)

# Badge Right
badge_r = patches.FancyBboxPatch((870, 715), 640, 45, boxstyle="round,pad=0,rounding_size=10",
                                 facecolor='#064E3B', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(badge_r)
ax.text(1190, 737, "CARA BENAR: DENGAN COMMON GROUND (DATA STABIL & AKURAT)", 
        fontsize=13.5, fontweight='bold', color='#6EE7B7', ha='center', va='center', fontfamily='Segoe UI')

# Right - Sensor Block
sensor_r = patches.FancyBboxPatch((880, 490), 220, 180, boxstyle="round,pad=0,rounding_size=12",
                                   facecolor='#1E293B', edgecolor='#475569', linewidth=2)
ax.add_patch(sensor_r)
ax.text(990, 640, "SENSOR EKSTERNAL", fontsize=13, fontweight='bold', color='#38BDF8', ha='center', fontfamily='Segoe UI')
ax.text(990, 615, "(Ditenagai Baterai 9V Luar)", fontsize=10, color='#94A3B8', ha='center', fontfamily='Segoe UI')
ax.text(900, 560, "• VCC (9V): Catu Daya Luar", fontsize=10, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(900, 530, "• Sinyal Data: Out Pin", fontsize=10, color='#FCD34D', fontfamily='Segoe UI')
ax.text(900, 505, "• GND Sensor: Titik 0V", fontsize=10, color='#34D399', fontfamily='Segoe UI')

# Right - ESP32 Block
esp_r = patches.FancyBboxPatch((1280, 490), 220, 180, boxstyle="round,pad=0,rounding_size=12",
                                facecolor='#1E293B', edgecolor='#475569', linewidth=2)
ax.add_patch(esp_r)
ax.text(1390, 640, "BOARD ESP32", fontsize=13, fontweight='bold', color='#38BDF8', ha='center', fontfamily='Segoe UI')
ax.text(1390, 615, "(Ditenagai USB Laptop 5V)", fontsize=10, color='#94A3B8', ha='center', fontfamily='Segoe UI')
ax.text(1300, 560, "• Pin ADC / GPIO 34", fontsize=10, color='#FCD34D', fontfamily='Segoe UI')
ax.text(1300, 530, "• Pin GND ESP32: Titik 0V", fontsize=10, color='#34D399', fontfamily='Segoe UI')
ax.text(1300, 505, "• Chip ADC Silikon ESP32", fontsize=10, color='#CBD5E1', fontfamily='Segoe UI')

# Right Wires
# Signal wire
ax.plot([1100, 1280], [560, 560], color='#F59E0B', linewidth=3)
ax.text(1190, 580, "Kabel Sinyal Tersambung", color='#FCD34D', fontsize=11, fontweight='bold', ha='center', fontfamily='Segoe UI')

# GND wire CONNECTED!
ax.plot([990, 990, 1390, 1390], [490, 420, 420, 490], color='#10B981', linewidth=4)
# Pill on wire
pill_ok = patches.FancyBboxPatch((960, 400), 460, 40, boxstyle="round,pad=0,rounding_size=8",
                                 facecolor='#064E3B', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(pill_ok)
ax.text(1190, 420, "KABEL JUMPER GND BERSAMA (COMMON GROUND)", color='#A7F3D0', fontsize=11.5, fontweight='bold', ha='center', va='center', fontfamily='Segoe UI')
ax.text(1190, 375, "Semua kutub negatif menyatu ke titik acuan 0 Volt yang sama!", color='#6EE7B7', fontsize=10.5, ha='center', fontfamily='Segoe UI')

# Right Result Box
res_box_r = patches.FancyBboxPatch((880, 100), 620, 240, boxstyle="round,pad=0,rounding_size=14",
                                   facecolor='#0F172A', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(res_box_r)
ax.text(1190, 305, "MANFAAT & HASIL PADA SISTEM:", fontsize=13, fontweight='bold', color='#34D399', ha='center', fontfamily='Segoe UI')
ax.text(900, 270, "1. Kedua perangkat memiliki lantai dasar potensial listrik 0V yang seragam.", fontsize=11, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(900, 240, "2. Perbedaan tegangan sinyal dapat diukur dengan presisi tinggi oleh ADC.", fontsize=11, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(900, 210, "3. Kebisingan listrik (noise) lenyap, komunikasi sensor bekerja 100% andal.", fontsize=11, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(900, 165, "Output Serial Monitor Normal:", fontsize=11, fontweight='bold', color='#34D399', fontfamily='Segoe UI')

# Code simulation display
code_box_r = patches.Rectangle((900, 115), 580, 40, facecolor='#020617', edgecolor='#334155', linewidth=1)
ax.add_patch(code_box_r)
ax.text(915, 133, "ADC Read:  2048 -> 2050 -> 2049 -> 2051 -> 2048  (Sangat tenang & stabil!)", 
        fontsize=10.5, color='#34D399', fontfamily='Consolas')

plt.savefig('00-fondasi-dasar/aset/diagram-common-ground.png', dpi=220, bbox_inches='tight', facecolor='#0B1120')
print('Generated diagram-common-ground.png successfully!')
