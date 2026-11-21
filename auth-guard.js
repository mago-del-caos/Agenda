// Ag Lucem — guardia de sesión para las páginas internas.
// Verifica el token contra la API; sin sesión válida, regresa al login.
// Inyecta una pastilla de sesión (usuario, panel si es admin, salir).
(function () {
  var API = "https://aglucem-api.adrian-camelot32.workers.dev";
  var token = localStorage.getItem("aglucem_token");

  function alLogin() {
    localStorage.removeItem("aglucem_token");
    localStorage.removeItem("aglucem_user");
    window.location.replace("/Agenda/index.html");
  }

  if (!token) { alLogin(); return; }

  function pastilla(user) {
    if (document.getElementById("aglucem-sesion")) return;
    var div = document.createElement("div");
    div.id = "aglucem-sesion";
    div.style.cssText = "position:fixed;top:10px;right:10px;z-index:9999;display:flex;gap:6px;align-items:center;" +
      "background:rgba(3,42,96,.92);color:#fff;border-radius:999px;padding:5px 6px 5px 12px;" +
      "font-family:sans-serif;font-size:.8rem;box-shadow:0 4px 14px rgba(0,0,0,.25)";
    if (user.foto) {
      var img = document.createElement("img");
      img.src = user.foto;
      img.alt = "";
      img.style.cssText = "width:24px;height:24px;border-radius:50%;object-fit:cover;border:2px solid #FFD100";
      div.appendChild(img);
    }
    var nombre = document.createElement("span");
    nombre.textContent = (user.foto ? "" : "👤 ") + (user.nombre || user.usuario);
    div.appendChild(nombre);
    if (user.rol === "admin") {
      var a = document.createElement("a");
      a.href = "/Agenda/admin.html";
      a.textContent = "Panel";
      a.style.cssText = "background:#FFD100;color:#032A60;border-radius:999px;padding:4px 10px;text-decoration:none;font-weight:bold";
      div.appendChild(a);
    }
    var b = document.createElement("button");
    b.textContent = "Salir";
    b.style.cssText = "background:#00A8FF;color:#fff;border:none;border-radius:999px;padding:4px 10px;cursor:pointer;font-weight:bold";
    b.onclick = function () {
      fetch(API + "/auth/logout", { method: "POST", headers: { Authorization: "Bearer " + token } })
        .finally(alLogin);
    };
    div.appendChild(b);
    document.body.appendChild(div);
  }

  // Verificación rápida con caché de la sesión en curso
  var cache = sessionStorage.getItem("aglucem_me");
  if (cache) {
    try { pastilla(JSON.parse(cache)); } catch (e) { /* sigue a verificar */ }
  }

  fetch(API + "/auth/me", { headers: { Authorization: "Bearer " + token } })
    .then(function (r) { if (!r.ok) throw new Error("401"); return r.json(); })
    .then(function (user) {
      sessionStorage.setItem("aglucem_me", JSON.stringify(user));
      localStorage.setItem("aglucem_user", JSON.stringify(user));
      if (document.body) pastilla(user);
      else document.addEventListener("DOMContentLoaded", function () { pastilla(user); });
    })
    .catch(alLogin);
})();
