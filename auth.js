/* Sessão compartilhada por login.html e index.html: configuração do Supabase, cookie de sessão e redirecionamentos. */
(function () {
  "use strict";
  var SB = "https://sfaxcrkbvmafpkgydzxu.supabase.co";
  var SBK = "sb_publishable_FxF-gC3o4iioQwJQ73Fy9g_JyS43Awf";
  var LOGIN = "login.html", HOME = "./"; /* "./" abre o index.html sem mostrar o nome na barra de endereço */
  var COOKIE = "gestao_sessao";
  /* 0 = o cookie some quando o navegador fecha. Para "manter conectado", use o número de dias (ex.: 7). */
  var REMEMBER_DAYS = 0;
  var OLD_KEY = "sb-sfaxcrkbvmafpkgydzxu-auth-token"; /* chave antiga do localStorage, apagada por segurança */
  var mem = null;

  function dir() { return location.pathname.replace(/[^/]*$/, "") || "/"; }
  function getCookie() {
    var m = document.cookie.split("; ");
    for (var i = 0; i < m.length; i++) if (m[i].indexOf(COOKIE + "=") === 0) return m[i].slice(COOKIE.length + 1);
    return null;
  }
  function setCookie(v, maxAge) {
    document.cookie = COOKIE + "=" + v + "; path=" + dir() + "; SameSite=Strict" + (location.protocol === "https:" ? "; Secure" : "") +
      (maxAge != null ? "; max-age=" + maxAge : REMEMBER_DAYS ? "; max-age=" + REMEMBER_DAYS * 86400 : "");
  }
  function valid(s) { return !!s && typeof s.access_token === "string" && typeof s.refresh_token === "string" && !!s.user && !!s.user.id; }

  function read() {
    var raw = getCookie(), s = null;
    try { if (raw) s = JSON.parse(decodeURIComponent(raw)); } catch (e) { s = null; }
    if (!valid(s)) { try { s = JSON.parse(sessionStorage.getItem(COOKIE) || "null"); } catch (e) { s = null; } }
    if (!valid(s)) s = mem;
    return valid(s) ? s : null;
  }
  /* guarda só o necessário (cookies têm limite de ~4 KB) e devolve a sessão guardada */
  function save(s) {
    var prev = read();
    var slim = {
      access_token: s.access_token,
      refresh_token: s.refresh_token,
      expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (s.expires_in || 3600),
      user: { id: (s.user && s.user.id) || (prev && prev.user && prev.user.id) },
    };
    mem = slim;
    var enc = encodeURIComponent(JSON.stringify(slim));
    if (enc.length < 3800) setCookie(enc);
    if (getCookie() !== enc) { try { sessionStorage.setItem(COOKIE, JSON.stringify(slim)); } catch (e) {} } /* cookies bloqueados: vale só nesta aba */
    return slim;
  }
  function clear() {
    mem = null;
    setCookie("", 0);
    try { sessionStorage.removeItem(COOKIE); } catch (e) {}
    try { localStorage.removeItem(OLD_KEY); } catch (e) {}
  }

  function authReq(path, body, token, extra) {
    return fetch(SB + "/auth/v1/" + path, Object.assign({
      method: "POST",
      headers: { apikey: SBK, Authorization: "Bearer " + (token || SBK), "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    }, extra || {})).then(function (r) {
      return r.text().then(function (t) {
        var j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) {}
        if (!r.ok) { var er = new Error(j.error_description || j.msg || j.message || "HTTP " + r.status); er.status = r.status; throw er; }
        return j;
      });
    });
  }
  function signIn(user, pass) { return authReq("token?grant_type=password", { email: String(user).toLowerCase().trim() + "@gestao.app", password: pass }); }
  function logout(token) { if (token) authReq("logout", {}, token, { keepalive: true }).catch(function () {}); }
  function profile(s) {
    return fetch(SB + "/rest/v1/usuario?id=eq." + encodeURIComponent(s.user.id) + "&select=id,nome,usuario,funcao", {
      cache: "no-store", headers: { apikey: SBK, Authorization: "Bearer " + s.access_token },
    }).then(function (r) {
      if (!r.ok) { var er = new Error("HTTP " + r.status); er.status = r.status; throw er; }
      return r.json();
    }).then(function (rows) { return (rows && rows[0]) || null; });
  }

  function toLogin(aviso) { location.replace(LOGIN + (aviso ? "?aviso=" + encodeURIComponent(aviso) : "")); }
  function toHome() { location.replace(HOME); }

  window.Auth = { SB: SB, SBK: SBK, read: read, save: save, clear: clear, authReq: authReq, signIn: signIn, logout: logout, profile: profile, toLogin: toLogin, toHome: toHome };

  /* guarda de página: o sistema exige sessão, e quem já entrou pula o login */
  var page = document.documentElement.getAttribute("data-page");
  if (page === "app" && !read()) toLogin();
  else if (page === "login" && read()) toHome();
  else if (page === "app" && /\/index\.html$/.test(location.pathname)) {
    /* endereço digitado com index.html: mostra só a pasta (a página é a mesma) */
    try { history.replaceState(null, "", location.pathname.replace(/index\.html$/, "") + location.search + location.hash); } catch (e) {}
  }
})();
