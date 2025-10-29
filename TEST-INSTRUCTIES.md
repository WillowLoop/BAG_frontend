# ExcelFlow MVP - Test Instructies

## ✅ App is Live op: http://localhost:5173

## 🎯 Complete Test Flow

### Test 1: Happy Path (Success Flow)
1. Open http://localhost:5173 in je browser
2. Sleep een Excel bestand (.xlsx of .xls) naar de upload zone
3. Wacht terwijl de progress bar van 0-100% gaat (~10-15 sec)
4. Klik "Download Resultaat" wanneer compleet
5. Klik "Nieuwe Analyse" om opnieuw te beginnen

### Test 2: Drag-and-Drop Functionaliteit
1. Sleep een bestand OVER de upload zone (niet loslaten)
   → Zone moet blauw worden met schaal effect
2. Sleep het bestand BUITEN de zone
   → Zone moet terugkeren naar normale staat
3. Laat het bestand los IN de zone
   → Upload moet starten

### Test 3: Validatie Errors (Verwacht: Rode Toast Notifications)
1. **Test 1:** Upload een niet-Excel bestand (bijv. .txt, .pdf, .jpg)
   → Moet tonen: "Dit bestandstype wordt niet ondersteund..."
   
2. **Test 2:** Als je een bestand > 10MB hebt, probeer die te uploaden
   → Moet tonen: "Bestand te groot ([XX] MB). Het maximum is 10 MB."

### Test 4: Responsive Design
1. Open Developer Tools (F12)
2. Klik op "Toggle Device Toolbar" (Ctrl+Shift+M / Cmd+Shift+M)
3. Test verschillende schermgroottes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
4. Alles moet goed leesbaar zijn, geen horizontal scroll

### Test 5: Keyboard Navigation (Accessibility)
1. Gebruik alleen je keyboard (geen muis):
2. Druk TAB om door elementen te navigeren
3. Focus indicators moeten zichtbaar zijn (blauwe ring)
4. ENTER moet knoppen activeren
5. Upload → TAB → TAB → ENTER op "Bestand kiezen"

### Test 6: Multiple Uploads
1. Complete een upload flow
2. Klik "Nieuwe Analyse"
3. Upload een ander bestand
4. Herhaal 3-4 keer
→ Moet elke keer werken zonder errors

### Test 7: Browser Compatibility
Test in meerdere browsers:
- Chrome/Edge ✓
- Firefox ✓
- Safari ✓

Alles moet identiek werken.

## 🎨 Wat te Verwachten

### Landing Page
- Gradient achtergrond (blauw → wit → paars)
- "ExcelFlow" titel met gradient text
- Upload zone met dashed border
- 3 feature cards (Fast, Secure, Easy)
- Header met logo bovenaan
- Footer met copyright onderaan

### Upload State
- "Bestand kiezen" button
- Drag-and-drop zone met hover effects
- File preview (naam + grootte) na selectie

### Processing State
- Progress bar (blauw, 0-100%)
- Percentage label (bijv. "45%")
- Status messages in Nederlands
- Pulserende dots als indicator
- Info message onderaan

### Complete State
- Groene checkmark icon
- "Analyse Compleet!" message
- "Download Resultaat" button (gradient)
- "Nieuwe Analyse" button
- Kan meerdere keren downloaden

## 🐛 Troubleshooting

### Dev Server draait niet?
```bash
cd /Users/cheersrijneau/Developer/newproject/excelflow
npm run dev
```
Open dan http://localhost:5173

### Port 5173 al in gebruik?
```bash
pkill -f "vite"
npm run dev
```

### Wil je de tests runnen?
```bash
npm test
```
Moet tonen: 64 tests passing

### Wil je de production build testen?
```bash
npm run build
npm run preview
```
Open dan http://localhost:4173

## 📝 Test Bestand Nodig?

Als je geen Excel bestand bij de hand hebt:
1. Open Excel of Google Sheets
2. Maak een simpel spreadsheet met wat data
3. Save as .xlsx
4. Gebruik dat bestand voor testing

OF gebruik een test .txt bestand om de validatie te testen!

## ✨ Verwachte User Experience

- **Smooth animaties** - geen jank
- **Fast response** - UI reageert < 100ms
- **Clear feedback** - altijd duidelijk wat er gebeurt
- **Error recovery** - elke error heeft "Probeer opnieuw" optie
- **Dutch language** - alle text in Nederlands
- **No console errors** - open DevTools, geen rode errors

## 🎯 Success Criteria

Je test is succesvol als:
✅ Je een bestand kunt uploaden zonder errors
✅ Progress updates smooth verlopen
✅ Download werkt en bestand heeft juiste naam
✅ Validation errors tonen duidelijke messages
✅ App werkt op mobile, tablet en desktop
✅ Keyboard navigation werkt
✅ "Nieuwe Analyse" reset correct naar begin

## 💡 Extra: Advanced Testing

### Test MSW Mocks
Open DevTools Console, je moet zien:
```
[MSW] Mocking enabled
```

Tijdens upload/processing zie je MSW intercepts.

### Test Error States
De MSW mocks simuleren altijd success. Om errors te testen:
1. Open DevTools → Network tab
2. Schakel "Offline" mode aan
3. Probeer een bestand te uploaden
→ Moet netwerk error tonen met retry optie

### Performance Check
1. Open DevTools → Lighthouse
2. Run audit (Performance, Accessibility, Best Practices)
3. Verwacht: Alle scores > 90

---

**Veel plezier met testen!** 🚀

Problemen? Check de browser console (F12) voor error messages.
