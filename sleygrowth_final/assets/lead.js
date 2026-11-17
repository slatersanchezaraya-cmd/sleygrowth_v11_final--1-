/* Envio de prospectos desde el asistente. Mismos destinos que el formulario de contacto
   (Supabase, hoja de calculo y dashboard interno). Las claves anon son publicas por diseno. */
(function () {
  var SUPABASE_URL = 'https://pemyfgptwyiabdksveuq.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbXlmZ3B0d3lpYWJka3N2ZXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTY5MjAsImV4cCI6MjA5NzE5MjkyMH0.nIVOT8LKcvJVRZ2rke8NXqnWuV7hHMuW8U3S_eFYzWo';
  var GAS_URL = 'https://script.google.com/macros/s/AKfycbyg2NzszXg6lrFHA6EF9v0bqdgPZ5sj3_HvhCpjO-euQhYmyjtQ-hsQWjpS4nePIzLS/exec';
  var DASH_URL = 'https://clwxxvjchrjjxudtdnei.supabase.co';
  var DASH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd3h4dmpjaHJqanh1ZHRkbmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNzM0NDEsImV4cCI6MjA5ODc0OTQ0MX0.fae9cQ3VnhcRirWI1kVNududv-wVrPnVO3FTi2d9Gmc';

  window.SGLead = {
    send: function (d) {
      var payload = { nombre: d.nombre, empresa: d.empresa, email: d.email, telefono: d.telefono, servicio: d.servicio, presupuesto: d.presupuesto, mensaje: d.mensaje, origen: 'chat', url_origen: location.href, user_agent: navigator.userAgent };
      return Promise.allSettled([
        fetch(SUPABASE_URL + '/rest/v1/contactos', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY, Prefer: 'return=minimal' }, body: JSON.stringify(payload) }),
        fetch(GAS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }),
        fetch(DASH_URL + '/rest/v1/rpc/prospect_intake', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: DASH_KEY, Authorization: 'Bearer ' + DASH_KEY }, body: JSON.stringify({ p_name: d.nombre, p_company: d.empresa, p_email: d.email, p_phone: d.telefono, p_service: d.servicio, p_message: d.mensaje, p_budget: d.presupuesto, p_origin: 'chat web (' + location.href + ')' }) })
      ]).then(function (r) {
        var ok = (r[0].status === 'fulfilled' && r[0].value.ok) || r[1].status === 'fulfilled' || (r[2].status === 'fulfilled' && r[2].value.ok);
        return { ok: ok };
      });
    }
  };
})();
