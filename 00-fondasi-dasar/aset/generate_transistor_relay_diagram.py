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
ax.text(800, 850, "PENGENDALIAN BEBAN DAYA TINGGI: TRANSISTOR & RELAY", 
        fontsize=24, fontweight='bold', color='#F8FAFC', ha='center', va='center', fontfamily='Segoe UI')
ax.text(800, 815, "Pin GPIO ESP32 hanya mampu memasok 12 mA: Membutuhkan sakelar isolasi untuk mengendalikan pompa, motor & lampu!", 
        fontsize=13, color='#94A3B8', ha='center', va='center', fontfamily='Segoe UI')

# --- LEFT CARD: CARA SALAH (LANGSUNG KE GPIO) ---
card_left = patches.FancyBboxPatch((60, 60), 650, 720, boxstyle="round,pad=0,rounding_size=20",
                                   facecolor='#1E1622', edgecolor='#EF4444', linewidth=2.5)
ax.add_patch(card_left)

badge_l = patches.FancyBboxPatch((80, 715), 610, 42, boxstyle="round,pad=0,rounding_size=10",
                                facecolor='#451A1A', edgecolor='#EF4444', linewidth=1.5)
ax.add_patch(badge_l)
ax.text(385, 736, "CARA SALAH: BEBAN BESAR LANGSUNG KE PIN GPIO", 
        fontsize=13, fontweight='bold', color='#FCA5A5', ha='center', va='center', fontfamily='Segoe UI')

# Circuit
# ESP32 Box
ax.add_patch(patches.FancyBboxPatch((130, 520), 220, 150, boxstyle="round,pad=0,rounding_size=12",
                                   facecolor='#0F172A', edgecolor='#EF4444', linewidth=2))
ax.text(240, 635, "PIN GPIO ESP32", fontsize=13, fontweight='bold', color='#F87171', ha='center', fontfamily='Segoe UI')
ax.text(240, 605, "Batas Maksimal Fisik:", fontsize=10.5, color='#CBD5E1', ha='center', fontfamily='Segoe UI')
ax.text(240, 575, "Hanya 12 mA (0.012 A)!", fontsize=12, fontweight='bold', color='#EF4444', ha='center', fontfamily='Segoe UI')
ax.text(240, 540, "3.3 Volt Sinyal Logika", fontsize=10, color='#94A3B8', ha='center', fontfamily='Segoe UI')

# Direct wire dangerous
ax.plot([350, 480], [595, 595], color='#EF4444', linewidth=4)
ax.text(415, 615, "ARUS SEDOTAN\nEKSTREM!", color='#F87171', fontsize=9.5, fontweight='bold', ha='center', fontfamily='Segoe UI')

# Load Box
ax.add_patch(patches.FancyBboxPatch((480, 520), 200, 150, boxstyle="round,pad=0,rounding_size=12",
                                   facecolor='#1E293B', edgecolor='#F59E0B', linewidth=2))
ax.text(580, 635, "POMPA AIR / MOTOR", fontsize=11.5, fontweight='bold', color='#FCD34D', ha='center', fontfamily='Segoe UI')
ax.text(580, 605, "Kebutuhan Arus Nyata:", fontsize=10, color='#CBD5E1', ha='center', fontfamily='Segoe UI')
ax.text(580, 575, "500 mA - 2000 mA!", fontsize=12, fontweight='bold', color='#F59E0B', ha='center', fontfamily='Segoe UI')
ax.text(580, 540, "Tegangan 12 Volt DC", fontsize=10, color='#94A3B8', ha='center', fontfamily='Segoe UI')

# Danger Badge in between
box_danger = patches.FancyBboxPatch((100, 320), 570, 150, boxstyle="round,pad=0,rounding_size=12",
                                    facecolor='#020617', edgecolor='#EF4444', linewidth=1.8)
ax.add_patch(box_danger)
ax.text(385, 435, "AKIBAT FATAL PADA CHIP MIKROKONTROLER:", 
        fontsize=11.5, fontweight='bold', color='#EF4444', ha='center', fontfamily='Segoe UI')
ax.text(125, 395, "• Kawat tembaga mikroskopis di dalam silikon meleleh.", fontsize=10.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(125, 365, "• ESP32 mengalami panas berlebih (overheat) dan mati total.", fontsize=10.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(125, 335, "• Port USB laptop bisa mengalami lonjakan arus mendadak.", fontsize=10.5, color='#E2E8F0', fontfamily='Segoe UI')

# Warning note
ax.text(385, 180, "ATURAN MUTLAK:\nJangan pernah menghubungkan motor, pompa,\natau relay langsung ke pin GPIO tanpa sakelar perantara!", 
        fontsize=11.5, fontweight='bold', color='#FCA5A5', ha='center', va='center', fontfamily='Segoe UI')


# --- RIGHT CARD: CARA BENAR (TRANSISTOR & RELAY) ---
card_right = patches.FancyBboxPatch((750, 60), 790, 720, boxstyle="round,pad=0,rounding_size=20",
                                     facecolor='#0F231D', edgecolor='#10B981', linewidth=2.5)
ax.add_patch(card_right)

badge_r = patches.FancyBboxPatch((770, 715), 750, 42, boxstyle="round,pad=0,rounding_size=10",
                                 facecolor='#064E3B', edgecolor='#10B981', linewidth=1.5)
ax.add_patch(badge_r)
ax.text(1145, 736, "CARA BENAR: MENGGUNAKAN SAKELAR ISOLASI DAYA", 
        fontsize=13.5, fontweight='bold', color='#6EE7B7', ha='center', va='center', fontfamily='Segoe UI')

# Subcard 1: Transistor MOSFET (DC Load)
card_mosfet = patches.FancyBboxPatch((780, 420), 730, 270, boxstyle="round,pad=0,rounding_size=14",
                                     facecolor='#1E293B', edgecolor='#38BDF8', linewidth=1.8)
ax.add_patch(card_mosfet)

ax.text(805, 660, "1. TRANSISTOR BJT / MOSFET (Untuk Beban Arus Searah DC)", 
        fontsize=12.5, fontweight='bold', color='#38BDF8', fontfamily='Segoe UI')
ax.text(805, 625, "• Cara Kerja: Sakelar elektronik solid-state super cepat tanpa bagian bergerak.", fontsize=10.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(805, 595, "• Alur Sinyal: ESP32 hanya mengirim sinyal kontrol kecil (Gate/Base < 1 mA).", fontsize=10.5, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(805, 565, "• Sumber Tenaga: Beban mengambil listrik 12V langsung dari adaptor/aki eksternal.", fontsize=10.5, color='#CBD5E1', fontfamily='Segoe UI')

box_mosfet_use = patches.FancyBboxPatch((805, 440), 680, 100, boxstyle="round,pad=0,rounding_size=8",
                                        facecolor='#020617', edgecolor='#38BDF8', linewidth=1)
ax.add_patch(box_mosfet_use)
ax.text(820, 510, "Contoh Penggunaan Utama di IoT:", fontsize=10, fontweight='bold', color='#38BDF8', fontfamily='Segoe UI')
ax.text(820, 480, "• Mengatur kecepatan putaran motor DC kipas angin lewat sinyal PWM.", fontsize=9.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(820, 455, "• Mengontrol tingkat kecerahan lampu LED strip 12V ruangan.", fontsize=9.5, color='#E2E8F0', fontfamily='Segoe UI')


# Subcard 2: Modul Relay Optocoupler (AC 220V Load)
card_relay = patches.FancyBboxPatch((780, 90), 730, 310, boxstyle="round,pad=0,rounding_size=14",
                                    facecolor='#1E293B', edgecolor='#10B981', linewidth=1.8)
ax.add_patch(card_relay)

ax.text(805, 365, "2. MODUL RELAY DENGAN OPTOCOUPLER (Untuk Beban Listrik AC 220V PLN)", 
        fontsize=12.5, fontweight='bold', color='#34D399', fontfamily='Segoe UI')
ax.text(805, 330, "• Cara Kerja: Sakelar mekanik yang diaktifkan oleh kumparan elektromagnetik.", fontsize=10.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(805, 300, "• Isolasi Cahaya (Optocoupler): ESP32 menyalakan LED inframerah mungil di dalam chip.", fontsize=10.5, color='#CBD5E1', fontfamily='Segoe UI')
ax.text(805, 270, "• 100% AMAN: Sama sekali tidak ada kontak tembaga antara 220V PLN dan ESP32!", fontsize=10.5, fontweight='bold', color='#6EE7B7', fontfamily='Segoe UI')

box_relay_use = patches.FancyBboxPatch((805, 115), 680, 130, boxstyle="round,pad=0,rounding_size=8",
                                       facecolor='#020617', edgecolor='#10B981', linewidth=1)
ax.add_patch(box_relay_use)
ax.text(820, 215, "Contoh Penggunaan Utama di IoT (Smart Home):", fontsize=10, fontweight='bold', color='#34D399', fontfamily='Segoe UI')
ax.text(820, 185, "• Menyalakan/mematikan lampu kamar mandi atau lampu taman 220V dari HP.", fontsize=9.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(820, 160, "• Menyalakan pompa air sumur, dispenser, atau pemanas air rumah tangga.", fontsize=9.5, color='#E2E8F0', fontfamily='Segoe UI')
ax.text(820, 135, "• Terdengar bunyi 'KLIK' mekanis khas saat relay berganti status ON/OFF.", fontsize=9.5, color='#94A3B8', fontfamily='Segoe UI')

plt.savefig('00-fondasi-dasar/aset/diagram-transistor-relay.png', dpi=220, bbox_inches='tight', facecolor='#0B1120')
print('Generated diagram-transistor-relay.png successfully!')
