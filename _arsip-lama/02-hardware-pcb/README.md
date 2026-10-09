# 🛠️ 02 - Desain Perangkat Keras & Layout PCB (KiCad)

Folder ini berisi file skematik, library komponen, layout PCB 4-Layer, dan file produksi pabrik (**Fase 2 & Fase 3**):

## 📂 Struktur Direktori:
- `schematics/` : File skematik KiCad (PSU Buck MP2315, LDO AP2112K, Level Shifter, TVS Diode).
- `pcb-layout/` : File layout PCB 4-Layer (Signal - GND Plane - Power Plane - Signal).
- `manufacturing/` : File ekspor produksi (Gerber RS-274X, Drill, BOM, CPL Pick & Place).
- `nano-power-circuits/` : Skematik Power-Gating TPL5110 (Standby 35 nA untuk baterai 10 tahun).

---

## 🎯 Target Pembelajaran:
1. Mampu membaca dan merancang skematik modular di KiCad 8.x.
2. Menguasai prinsip integritas sinyal (*Controlled Impedance $50\Omega$* dan *Ground Return Path*).
3. Menerapkan standar *Design for Manufacturing (DFM)* dengan *Fiducial Marks* dan *Test Points*.
