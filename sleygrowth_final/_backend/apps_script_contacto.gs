/* ═══════════════════════════════════════════════════════════════
   SLEY GROWTH — Google Apps Script: recibe formulario contacto
   y lo agrega como fila en Google Sheets.

   CÓMO DEPLOYAR:
   1. Creá un Google Sheet nuevo (o usá uno existente).
      En la primera fila poné estos encabezados, en este orden:
      Fecha | Nombre | Empresa | Email | Telefono | Servicio | Presupuesto | Mensaje | Origen | URL

   2. En el Sheet: Extensiones → Apps Script.
   3. Borrá el código de ejemplo y pegá TODO este archivo.
   4. Guardá (Ctrl+S), nombrá el proyecto algo como "Sley Contacto".
   5. Implementar → Nueva implementación.
      - Tipo: "Aplicación web"
      - Ejecutar como: Yo (tu cuenta)
      - Quién tiene acceso: "Cualquier usuario" (Anyone)
   6. Click "Implementar". Te va a pedir autorizar permisos (aceptá).
   7. Copiá la URL que te da (termina en /exec).
   8. Pegala en assets/config.js → GAS_URL: "PEGAR_AQUI"
   ═══════════════════════════════════════════════════════════════ */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      new Date(),
      data.nombre || '',
      data.empresa || '',
      data.email || '',
      data.telefono || '',
      data.servicio || '',
      data.presupuesto || '',
      data.mensaje || '',
      data.origen || '',
      data.url_origen || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
