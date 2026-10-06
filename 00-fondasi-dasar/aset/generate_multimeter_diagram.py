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
ax.text(800, 850, "PANDUAN 3 FUNGSI UTAMA MULTIMETER DIGITAL UNTUK IoT", 
        fontsize=24, fontweight='bold', color='#F8FAFC', ha='center', va='center', fontfamily='Segoe UI')
ax.text(800, 815, "Alat diagnostik wajib: Menguji keakuratan voltase, mengecek kabel jumper putus, dan mengukur nilai resistor", 
        fontsize=13, color='#94A3B8', ha='center', va='center', fontfamily='Segoe UI')

# --- LEFT CARD: ANATOMI & COLOKAN PROBE ---
card_left = patches.FancyBboxPatch((60, 60), 550, 720, boxstyle="round,pad=0,rounding_size=20",
                                   facecolor='#1E2235', edgecolor='#38BDF8', linewidth=2)
ax.add_patch(card_left)

badge_l = patches.FancyBboxPatch((80, 715), 510, 42, boxstyle="round,pad=0,rounding_size=10",
                                facecolor='#0C4A6E', edgecolor='#38BDF8', linewidth=1.5)
ax.add_patch(badge_l)
ax.text(335, 736, "ATURAN COLOKAN JARUM (PROBE)", 
        fontsize=13, fontweight='bold', color='#BAE6FD', ha='center', va='center', fontfamily='Segoe UI')

# Multimeter Body Illustration
body_mm = patches.FancyBboxPatch((160, 270), 350, 420, boxstyle="round,pad=0,rounding_size=24",
                                facecolor='#0F172A', edgecolor='#F59E0B', linewidth=3)
ax.add_patch(body_mm)

# LCD Screen
lcd_box = patches.FancyBboxPatch((190, 560), 290, 95, boxstyle="round,pad=0,rounding_size=10",
                                 facecolor='#84CC16', edgecolor='#4D7C0F', linewidth=2)
ax.add_patch(lcd_box)
ax.text(335, 618, "3.30 V", fontsize=30, fontweight='bold', color='#14532D', ha='center', va='center', fontfamily='Consolas')
ax.text(450, 580, "DC", fontsize=11, fontweight='bold', color='#14532D', ha='center', fontfamily='Segoe UI')

# Rotary Dial
ax.add_patch(patches.Circle((335, 450), 70, facecolor='#1E293B', edgecolor='#64748B', linewidth=2))
ax.add_patch(patches.Circle((335, 450), 25, facecolor='#0F172A', edgecolor='#38BDF8', linewidth=1.5))
ax.plot([335, 335], [450, 510], color='#FCD34D', linewidth=3.5) # Pointer knob

# Labels around dial
ax.text(335, 525, "DCV (Tegangan DC)", fontsize=9, color='#38BDF8', fontweight='bold', ha='center', fontfamily='Segoe UI')
ax.text(240, 450, "ACV", fontsize=9, color='#94A3B8', ha='center', fontfamily='Segoe UI')
ax.text(430, 450, "Ohm (Ω)", fontsize=9, color='#38BDF8', fontweight='bold', ha='center', fontfamily='Segoe UI')
ax.text(335, 370, "Kontinuitas Buzzer", fontsize=9, color='#34D399', fontweight='bold', ha='center', fontfamily='Segoe UI')

# Ports
# COM Port
ax.add_patch(patches.Circle((280, 310), 16, facecolor='#020617', edgecolor='#475569', linewidth=2))
ax.text(280, 275, "COM (GND)", fontsize=9, fontweight='bold', color='#94A3B8', ha='center', fontfamily='Segoe UI')
# V/Ohm Port
ax.add_patch(patches.Circle((390, 310), 16, facecolor='#020617', edgecolor='#EF4444', linewidth=2))
ax.text(390, 275, "V / Ω / mA", fontsize=9, fontweight='bold', color='#F87171', ha='center', fontfamily='Segoe UI')

# Probe wire leads
ax.plot([280, 280, 230], [294, 210, 150], color='#475569', linewidth=3)
ax.text(210, 130, "Kabel Hitam:\nColok ke COM", color='#CBD5E1', fontsize=10, fontweight='bold', ha='center', fontfamily='Segoe UI')

ax.plot([390, 390, 440], [294, 210, 150], color='#EF4444', linewidth=3)
ax.text(460, 130, "Kabel Merah:\nColok ke V / Ω", color='#FCA5A5', fontsize=10, fontweight='bold', ha='center', fontfamily='Segoe UI')

# Note bottom left
ax.text(335, 80, "Tip: 95% pekerjaan IoT hanya memakai 2 lubang ini!", 
        fontsize=10.5, color='#38BDF8', ha='center', fontfamily='Segoe UI')


# --- RIGHT CARD: 3 MODE UTAMA IoT ---
card_right = patches.FancyBboxPatch((640, 60), 900, 720, boxstyle="round,pad=0,rounding_size=20",
                                     facecolor='#0F172A', edgecolor='#10B981', linewidth=2)
ax.add_patch(card_right)

badge_r = patches.FancyBboxPatch((660, 715), 860, 42, boxstyle="round,pad=0,rounding_size=10",
                                 facecolor='#064E3B', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(badge_r)
ax.text(1090, 736, "3 MODE PENGUKURAN PALING SERING DIGUNAKAN DI PROYEK IoT", 
        fontsize=13, fontweight='bold', color='#6EE7B7', ha='center', va='center', fontfamily='Segoe UI')

# 1. Mode DC Voltage
sub1 = patches.FancyBboxPatch((670, 500), 840, 195, boxstyle="round,pad=0,rounding_size=12",
                              facecolor='#1E293B', edgecolor='#38BDF8', linewidth=1.5)
ax.add_patch(sub1)
ax.text(695, 665, "1. MODE TEGANGAN SEARAH (DCV / SIMBOL V DENGAN GARIS LURUS)", 
        fontsize=12, fontweight='bold', color='#38BDF8', fontfamily='Segoe UI')
ax.text(695, 635, "• Cara Mengukur: Putar selektor ke 20V DC. Tempelkan probe merah ke (+) dan hitam ke GND (-).", fontsize=10.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(695, 605, "• Kapan Digunakan: Memastikan output pin 3V3 ESP32 benar-benar mengeluarkan 3.3V stabil,", fontsize=10.5, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(695, 580, "  atau menguji apakah baterai lithium 3.7V / aki 12V masih terisi penuh.", fontsize=10.5, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(695, 545, "• Contoh Hasil Layar:  3.31 V (Normal Sempurna)  |  2.10 V (Baterai Drop / Korslet)", fontsize=10.5, color='#BAE6FD', fontfamily='Segoe UI')


# 2. Mode Kontinuitas (Buzzer)
sub2 = patches.FancyBboxPatch((670, 290), 840, 195, boxstyle="round,pad=0,rounding_size=12",
                              facecolor='#1E293B', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(sub2)
ax.text(695, 455, "2. MODE KONTINUITAS / BUZZER (SIMBOL GELOMBANG SUARA & DIODA)", 
        fontsize=12, fontweight='bold', color='#34D399', fontfamily='Segoe UI')
ax.text(695, 425, "• Cara Mengukur: Sentuhkan ujung probe merah dan hitam pada kedua ujung kabel / jalur.", fontsize=10.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(695, 395, "• Kapan Digunakan: Memeriksa apakah kabel jumper putus di dalam, atau melacak jalur breadboard.", fontsize=10.5, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(695, 355, "• Jika Berbunyi 'BEEEEEP!'  -->  Jalur tersambung utuh & arus bisa lewat normal.", fontsize=10.5, color='#6EE7B7', fontfamily='Segoe UI')
ax.text(695, 325, "• Jika Sunyi (Hening)        -->  Kabel putus di dalam! Segera buang ke tempat sampah.", fontsize=10.5, color='#FCA5A5', fontfamily='Segoe UI')


# 3. Mode Hambatan (Ohm)
sub3 = patches.FancyBboxPatch((670, 80), 840, 195, boxstyle="round,pad=0,rounding_size=12",
                              facecolor='#1E293B', edgecolor='#F59E0B', linewidth=1.5)
ax.add_patch(sub3)
ax.text(695, 245, "3. MODE HAMBATAN RESISTOR (OHM / SIMBOL Ω)", 
        fontsize=12, fontweight='bold', color='#FCD34D', fontfamily='Segoe UI')
ax.text(695, 215, "• Cara Mengukur: Putar selektor ke 20k Ω. Tempelkan probe pada kedua kaki resistor.", fontsize=10.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(695, 185, "• Bebas Bolak-Balik: Resistor adalah komponen non-polar, tidak ada kutub positif/negatif.", fontsize=10.5, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(695, 155, "• Kapan Digunakan: Membaca nilai pasti resistor tanpa harus pusing menebak gelang warna.", fontsize=10.5, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(695, 120, "• Contoh Hasil Layar:  0.22 kΩ (220 Ω)  |  0.99 kΩ (1 kΩ)  |  9.98 kΩ (10 kΩ)", fontsize=10.5, color='#FDE68A', fontfamily='Segoe UI')

plt.savefig('00-fondasi-dasar/aset/diagram-multimeter-digital.png', dpi=220, bbox_inches='tight', facecolor='#0B1120')
print('Generated diagram-multimeter-digital.png successfully!')
