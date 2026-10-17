# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: interaction.browser.spec.ts >> M03 popup anchor tracks pan zoom and resize within two CSS pixels
- Location: tests/interaction.browser.spec.ts:50:1

# Error details

```
Error: jsHandle.evaluate: TypeError: Cannot read properties of undefined (reading '0')
    at eval (eval at evaluate (:303:30), <anonymous>:2:32)
    at UtilityScript.evaluate (<anonymous>:305:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: 🚧
        - generic [ref=e8]:
          - generic [ref=e9]:
            - heading "LaporJalan" [level=1] [ref=e10]
            - generic [ref=e11]: Demo
          - paragraph [ref=e12]: Peta kondisi jalan
      - button "Lapor" [ref=e13] [cursor=pointer]:
        - img [ref=e14]
        - generic [ref=e17]: Lapor
    - generic [ref=e18]:
      - button "Peta 3D" [ref=e19] [cursor=pointer]:
        - img [ref=e20]
        - generic [ref=e22]: Peta 3D
      - button "Daftar (2)" [ref=e23] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e25]: Daftar (2)
      - button "CCTV (4)" [ref=e26] [cursor=pointer]:
        - img [ref=e27]
        - generic [ref=e30]: CCTV (4)
    - generic [ref=e32]:
      - img [ref=e33]
      - textbox "Cari jalan atau laporan..." [ref=e36]
    - generic [ref=e38]:
      - generic [ref=e39]: "Kamera Pengawas Lalu Lintas & Galian:"
      - generic [ref=e40]:
        - button "1 • CCTV Bundaran HI DEMO 1 • CCTV Bundaran HI Contoh Bundaran HI • Sisi Hotel Indonesia • Simpang C09 Media statis • Belum diverifikasi" [ref=e41] [cursor=pointer]:
          - generic [ref=e42]:
            - img "1 • CCTV Bundaran HI" [ref=e43]
            - generic [ref=e44]: DEMO
          - generic [ref=e45]:
            - generic [ref=e46]:
              - generic [ref=e47]: 1 • CCTV Bundaran HI
              - generic [ref=e48]: Contoh
            - paragraph [ref=e49]: Bundaran HI • Sisi Hotel Indonesia • Simpang C09
            - generic [ref=e50]:
              - generic [ref=e51]: Media statis
              - generic [ref=e52]: •
              - generic [ref=e53]: Belum diverifikasi
        - button "6B • CCTV Tosari Dukuh Atas DEMO 6B • CCTV Tosari Dukuh Atas Contoh Jl. Jenderal Sudirman • Halte Tosari 1 Media statis • Belum diverifikasi" [ref=e54] [cursor=pointer]:
          - generic [ref=e55]:
            - img "6B • CCTV Tosari Dukuh Atas" [ref=e56]
            - generic [ref=e57]: DEMO
          - generic [ref=e58]:
            - generic [ref=e59]:
              - generic [ref=e60]: 6B • CCTV Tosari Dukuh Atas
              - generic [ref=e61]: Contoh
            - paragraph [ref=e62]: Jl. Jenderal Sudirman • Halte Tosari 1
            - generic [ref=e63]:
              - generic [ref=e64]: Media statis
              - generic [ref=e65]: •
              - generic [ref=e66]: Belum diverifikasi
        - button "4C • CCTV Simpang Semanggi DEMO 4C • CCTV Simpang Semanggi Contoh Plaza Semanggi • Sudirman Loop B Media statis • Belum diverifikasi" [ref=e67] [cursor=pointer]:
          - generic [ref=e68]:
            - img "4C • CCTV Simpang Semanggi" [ref=e69]
            - generic [ref=e70]: DEMO
          - generic [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]: 4C • CCTV Simpang Semanggi
              - generic [ref=e74]: Contoh
            - paragraph [ref=e75]: Plaza Semanggi • Sudirman Loop B
            - generic [ref=e76]:
              - generic [ref=e77]: Media statis
              - generic [ref=e78]: •
              - generic [ref=e79]: Belum diverifikasi
        - button "9D • CCTV Rasuna Said Kuningan DEMO 9D • CCTV Rasuna Said Kuningan Contoh HR Rasuna Said • Depan Menara Kadin Media statis • Belum diverifikasi" [ref=e80] [cursor=pointer]:
          - generic [ref=e81]:
            - img "9D • CCTV Rasuna Said Kuningan" [ref=e82]
            - generic [ref=e83]: DEMO
          - generic [ref=e84]:
            - generic [ref=e85]:
              - generic [ref=e86]: 9D • CCTV Rasuna Said Kuningan
              - generic [ref=e87]: Contoh
            - paragraph [ref=e88]: HR Rasuna Said • Depan Menara Kadin
            - generic [ref=e89]:
              - generic [ref=e90]: Media statis
              - generic [ref=e91]: •
              - generic [ref=e92]: Belum diverifikasi
  - generic [ref=e93]:
    - generic [ref=e94]:
      - generic [ref=e95]:
        - generic:
          - region "Map" [ref=e96]
          - button "Map marker" [ref=e97] [cursor=pointer]: CCTV hi-01
          - button "Map marker" [ref=e98] [cursor=pointer]: CCTV sudirman-6b
          - button "Map marker" [ref=e99] [cursor=pointer]: CCTV semanggi-4c
          - button "Map marker" [ref=e100] [cursor=pointer]: CCTV kuningan-9d
          - button "Map marker" [pressed] [ref=e101] [cursor=pointer]: LUBANG
          - button "Map marker" [ref=e102] [cursor=pointer]: LUBANG
        - group [ref=e103]:
          - generic "Toggle attribution" [ref=e104] [cursor=pointer]
          - link "MapLibre" [ref=e106] [cursor=pointer]:
            - /url: https://maplibre.org/
        - region "Pratinjau CCTV" [ref=e109]:
          - generic [ref=e110]:
            - generic [ref=e111]:
              - heading "1 • CCTV Bundaran HI" [level=4] [ref=e112]
              - paragraph [ref=e113]: Bundaran HI • Sisi Hotel Indonesia • Simpang C09
            - button "Tutup CCTV" [active] [ref=e114] [cursor=pointer]:
              - img [ref=e115]
          - generic [ref=e118]:
            - img "Gambar contoh untuk 1 • CCTV Bundaran HI" [ref=e119]
            - generic [ref=e120]: Gambar contoh
          - paragraph [ref=e121]: Media statis - sumber dan waktu belum diverifikasi.
          - generic [ref=e122]:
            - button "Salin lokasi contoh" [ref=e123] [cursor=pointer]:
              - img [ref=e124]
              - text: Salin lokasi contoh
            - button "Layar Penuh" [ref=e127] [cursor=pointer]:
              - img [ref=e128]
              - text: Layar Penuh
      - generic [ref=e133]:
        - button "3D" [pressed] [ref=e134] [cursor=pointer]:
          - generic [ref=e135]: 3D
        - button "Reset Sudut Pandang" [ref=e136] [cursor=pointer]:
          - img [ref=e137]
      - generic [ref=e140]:
        - button "Perbesar peta" [ref=e141] [cursor=pointer]: +
        - button "Perkecil peta" [ref=e142] [cursor=pointer]: −
    - button "Lapor jalan" [ref=e143] [cursor=pointer]:
      - img [ref=e144]
      - generic [ref=e147]: Lapor jalan
```