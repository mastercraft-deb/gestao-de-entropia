/* Página de login: valida usuário e senha, grava o cookie de sessão (auth.js) e abre o sistema. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var err = $("#lErr"), go = $("#lGo");
  var AVISOS = { expirada: "Sua sessão expirou — entre de novo.", expirado: "Seu acesso temporário terminou." };

  var aviso = new URLSearchParams(location.search).get("aviso");
  if (AVISOS[aviso]) err.textContent = AVISOS[aviso];

  function busy(on) {
    go.disabled = on;
    go.setAttribute("aria-busy", on ? "true" : "false");
    go.textContent = on ? "Entrando…" : "Entrar";
  }

  function doLogin() {
    if (go.disabled) return;
    var u = $("#lUser").value, p = $("#lPass").value;
    err.textContent = "";
    if (!u.trim() || !p) { err.textContent = "Usuário ou senha incorretos"; return; }
    busy(true);
    Auth.signIn(u, p).then(function (s) {
      return Auth.profile(s).then(function (pr) {
        if (!pr) { Auth.logout(s.access_token); err.textContent = "Este usuário ainda não tem perfil. Fale com o administrador."; busy(false); return; }
        if (Auth.expired(pr)) { Auth.logout(s.access_token); err.textContent = "Este acesso temporário expirou."; busy(false); return; }
        Auth.save(s);
        try { sessionStorage.setItem("gestao_hello", String(pr.nome).split(" ")[0]); } catch (e) {}
        Auth.toHome();
      });
    }, function (e) {
      throw { bad: !!(e && e.status && e.status < 500) };
    }).catch(function (e) {
      err.textContent = e && e.bad ? "Usuário ou senha incorretos" : "Sem conexão — tente de novo.";
      busy(false);
    });
  }

  $("#formLogin").addEventListener("submit", function (e) { e.preventDefault(); doLogin(); });
  go.addEventListener("click", doLogin);
  ["#lUser", "#lPass"].forEach(function (id) {
    $(id).addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); doLogin(); } });
  });
  document.querySelectorAll(".x-eye[data-pw]").forEach(function (b) {
    b.addEventListener("click", function () {
      var inp = document.getElementById(b.dataset.pw), show = inp.type === "password";
      inp.type = show ? "text" : "password";
      b.setAttribute("aria-pressed", show ? "true" : "false");
      b.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
    });
  });
  $("#lUser").focus();
})();
