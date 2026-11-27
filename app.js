(function () {
  var KEY = "gestao-ig-v2";
  var STATUS = [
    ["Demanda", "#E5A800"],
    ["Em produção", "#2563EB"],
    ["Aprovação", "#DB2777"],
    ["Alteração", "#E5532D"],
    ["Aprovado", "var(--fill-system-green)"],
    ["Postado", "#7C3AED"],
    ["Standby", "#8E8E93"],
  ];
  var BRAND = {
    cp: { short: "Português", color: "#175440", c2: "#C1002A", hdBg: "#175440", hdInk: "#FFFFFF", on: "#FFFFFF", lb: "#175440", tone: "Editorial, sóbrio",
      pal: ["#175440", "#00674F", "#14153D", "#202252", "#C1002A", "#F91931", "#2A8784", "#00A09B", "#DC8089", "#FFBD42"] },
    fl: { short: "Lusófona", color: "#203568", c2: "#54BD82", hdBg: "#203568", hdInk: "#FFFFFF", on: "#FFFFFF", lb: "transparent", tone: "Institucional",
      pal: ["#203568", "#54BD82", "#00A651", "#FFF200", "#585B5D"] },
    pa: { short: "Paraíso", color: "#0034DC", c2: "#EAB312", hdBg: "#FEE9E4", hdInk: "#01338F", on: "#FFFFFF", lb: "#FEE9E4", tone: "Caloroso, vibrante",
      pal: ["#0034DC", "#01338F", "#EAB312", "#F2CD03", "#009BDC", "#FEE9E4", "#E8389A", "#E16633", "#3B3B3B"] },
  };
  var AUTO = ["#7C3AED", "#D97706", "#0891B2", "#BE185D", "#4D7C0F", "#9A3412", "#475569"];
  var TRASH = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.8 6.5v4.5M9.2 6.5v4.5"/></svg>';
  var DEL_HTML = TRASH + "<span>Excluir</span>";
  var TIPOS = ["Vídeo", "Carrossel", "Designer", "Motion Designer", "Externa"];
  var KINDS = ["Reunião", "Externa", "Evento fotos/vídeos"];
  var MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  var DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  var ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z"/></svg>';

  function $(s) { return document.querySelector(s); }
  /* tons precalculados em JS (sem color-mix no CSS): cor misturada ao fundo claro #F5F5F7 */
  var CV = { "var(--chart-muted)": "#B4B4B6", "var(--chart-1)": "#B1BCD2", "var(--chart-2)": "#607868", "var(--fill-system-green)": "#00A665", "var(--fill-system-orange)": "#FF4D00" };
  function hex6(c) {
    c = CV[c] || String(c || "").trim();
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c); if (!m) return "#B4B4B6";
    var x = m[1]; if (x.length === 3) x = x[0] + x[0] + x[1] + x[1] + x[2] + x[2];
    return "#" + x;
  }
  function rgbOf(c) { var x = hex6(c); return [parseInt(x.substr(1, 2), 16), parseInt(x.substr(3, 2), 16), parseInt(x.substr(5, 2), 16)]; }
  function mixBg(c, p) {
    var a = rgbOf(c), bg = [245, 245, 247], o = "#";
    for (var i = 0; i < 3; i++) { var v = Math.round(a[i] * p / 100 + bg[i] * (1 - p / 100)); o += (v < 16 ? "0" : "") + v.toString(16); }
    return o;
  }
  function tv(n, c) { return "--" + n + ":" + c + [7, 10, 12, 18, 26].map(function (p) { return ";--" + n + p + ":" + mixBg(c, p); }).join(""); }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function ymd(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }
  function todayISO() { var t = new Date(); return ymd(t.getFullYear(), t.getMonth(), t.getDate()); }
  function fmt(iso) { if (!iso) return "—"; var p = iso.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function fmtTs(ts) { var d = new Date(ts); return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  var CAPT = "Captado", CAPT_C = "#0F766E";
  function isExt(t) { return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().indexOf("externa") > -1; }
  function isCapt(d) { return d.status === CAPT; }
  function isExtD(d) { return d.type === "Externa" || isExt(d.title); }
  function stNames(title, type) { var l = STATUS.map(function (s) { return s[0]; }); if (isExt(title) || type === "Externa") l.splice(l.length - 1, 0, CAPT); return l; }
  function stColor(s) { if (s === CAPT) return CAPT_C; for (var i = 0; i < STATUS.length; i++) if (STATUS[i][0] === s) return STATUS[i][1]; return "var(--chart-muted)"; }
  function cli(id) {
    var c = S.clients.find(function (x) { return x.id === id; });
    if (!c) return { id: "", name: "Sem cliente", short: "Sem cliente", color: "#8E8E93" };
    var b = BRAND[c.id];
    return { id: c.id, name: c.name, short: b ? b.short : c.name, color: b ? b.color : c.color || AUTO[0] };
  }
  function initials(n) { var w = String(n).trim().split(/\s+/).filter(function (x) { return x.length > 2 || /^[A-ZÀ-Ý]/.test(x); }); if (!w.length) w = [String(n)]; return esc(((w[0] || "")[0] || "?") + (w.length > 1 ? w[w.length - 1][0] : (w[0][1] || ""))).toUpperCase(); }
  function logo(c, cls) {
    var b = BRAND[c.id];
    if (b) return '<span class="x-logo ' + (cls || "") + '" data-logo="' + c.id + '" style="--lb:' + b.lb + '"></span>';
    return '<span class="x-av ' + (cls || "") + '" style="' + tv("cc", c.color) + '" aria-hidden="true">' + (c.id ? initials(c.name) : "?") + "</span>";
  }
  function cchip(c) { return '<span class="x-cchip x-cct" style="' + tv("cc", c.color) + '">' + logo(c) + "<span>" + esc(c.name) + "</span></span>"; }
  /* os logos vêm da pasta imagens/ (via as <img> do cabeçalho) e são clonados onde forem usados */
  function hydrate(root) {
    (root || document).querySelectorAll("[data-logo]").forEach(function (el) {
      if (el.firstChild) return;
      var src = document.getElementById("logo-" + el.dataset.logo); if (!src) return;
      var i = src.cloneNode(false); i.removeAttribute("id"); i.alt = ""; el.appendChild(i);
    });
  }
  /* só toca no DOM quando o HTML mudou */
  function setHTML(el, h) { if (el._h === h) return false; el.innerHTML = h; el._h = h; return true; }
  function badge(text, color) { return '<span class="x-badge" style="' + tv("bc", color) + '">' + esc(text) + "</span>"; }
  function opts(list, sel, all) { return (all ? '<option value="">' + all + "</option>" : "") + list.map(function (v) { return '<option value="' + esc(v) + '"' + (v === sel ? " selected" : "") + ">" + esc(v) + "</option>"; }).join(""); }

  function defaults() {
    return { clients: [{ id: "cp", name: "Colégio Português", color: BRAND.cp.color }, { id: "fl", name: "Faculdade Lusófona", color: BRAND.fl.color }, { id: "pa", name: "Colégio Paraíso", color: BRAND.pa.color }], demands: [], events: [] };
  }
  function valid(d) { return d && Array.isArray(d.clients) && Array.isArray(d.demands) && Array.isArray(d.events); }
  var OLD_DEM = "Demanda aprovação";
  function clean(d) {
    d.demands = d.demands.filter(function (x) { return x && !x.example; });
    d.events = d.events.filter(function (x) { return x && !x.example; });
    defaults().clients.forEach(function (c) { if (!d.clients.some(function (x) { return x.id === c.id; })) d.clients.push(c); });
    d.demands.forEach(function (x) { if (x.status === OLD_DEM) x.status = "Demanda"; if (!Array.isArray(x.media)) x.media = []; x.media = x.media.filter(function (m) { return m && (m.src || m.url); }); });
    return d;
  }
  var S = defaults(), loaded = false, loadFailed = false;
  var toastT;
  function toast(t) {
    var el = $("#toast"); el.textContent = t; el.classList.add("is-on");
    try { if (el.showPopover && !el.matches(":popover-open")) el.showPopover(); } catch (e) {}
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.classList.remove("is-on"); try { if (el.hidePopover) el.hidePopover(); } catch (e) {} }, 7000);
  }
  $("#toast").addEventListener("click", function () { clearTimeout(toastT); this.classList.remove("is-on"); try { if (this.hidePopover) this.hidePopover(); } catch (e) {} });
  /* ---------- banco online (Supabase via fetch) ---------- */
  var SB = Auth.SB, SBK = Auth.SBK;
  var PUB = SB + "/storage/v1/object/public/midia/";
  var PERM = "Você não tem permissão para isso";

  /* ---------- sessão (cookie gerenciado por auth.js, compartilhado com login.html) ---------- */
  var SESSION = null, refreshT = null, refreshing = null;
  var readStored = Auth.read, authReq = Auth.authReq;
  function saveSession(s) {
    SESSION = s ? Auth.save(s) : (Auth.clear(), null);
    clearTimeout(refreshT);
    if (SESSION) refreshT = setTimeout(function () { refreshSession().catch(function () {}); }, Math.max(5000, SESSION.expires_at * 1000 - Date.now() - 60000));
  }
  function refreshSession() {
    if (!SESSION || !SESSION.refresh_token) return Promise.reject(new Error("sem sessão"));
    if (refreshing) return refreshing;
    var st = readStored();
    if (st && st.refresh_token !== SESSION.refresh_token && st.expires_at > SESSION.expires_at && st.expires_at * 1000 - Date.now() > 60000) { saveSession(st); return Promise.resolve(st); }
    refreshing = authReq("token?grant_type=refresh_token", { refresh_token: SESSION.refresh_token }).then(function (s) {
      refreshing = null; saveSession(s); return s;
    }, function (e) {
      refreshing = null;
      if (e.status >= 400 && e.status < 500) sessionLost();
      throw e;
    });
    return refreshing;
  }
  function fresh() {
    if (!SESSION || SESSION.expires_at * 1000 - Date.now() > 60000) return Promise.resolve();
    return refreshSession().then(function () {}, function () {});
  }
  var sb = {
    auth: {
      signOut: function () {
        var t = SESSION && SESSION.access_token;
        saveSession(null);
        Auth.logout(t);
        return Promise.resolve({ error: null });
      },
    },
    rpc: function (fn, args) {
      return req(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args || {}) })
        .then(function (r) { return r.text(); })
        .then(function (t) { var d = t; try { d = t ? JSON.parse(t) : null; } catch (e) {} return { data: d, error: null }; }, function (e) { return { data: null, error: e }; });
    },
  };
  function hdr(extra) { return Object.assign({ apikey: SBK, Authorization: "Bearer " + (SESSION ? SESSION.access_token : SBK) }, extra || {}); }
  function errOf(r) {
    return r.text().then(function (t) {
      var j = {}; try { j = t ? JSON.parse(t) : {}; } catch (e) {}
      var e = new Error(j.message || j.error || j.msg || "HTTP " + r.status);
      e.status = +j.statusCode || r.status; e.code = j.code || "";
      return e;
    });
  }
  function isPerm(e) { return !!e && (e.status === 401 || e.status === 403 || e.code === "42501" || /row-level security|permission denied|not allowed|unauthorized/i.test(e.message || "")); }
  function rpcMsg(e) {
    if (!e) return "Não deu certo — tente de novo.";
    if (!e.status) return "Sem conexão — tente de novo.";
    var m = e.message || "";
    if (!m || /^HTTP \d+|row-level security|permission denied|JWT|unauthorized/i.test(m)) return isPerm(e) ? PERM : "Não deu certo — tente de novo.";
    return m;
  }
  /* toda leitura e gravação passa por aqui, com o token da sessão  */
  function req(url, opt, retried) {
    opt = opt || {};
    return fresh().then(function () {
      return fetch(url, Object.assign({}, opt, { headers: hdr(opt.headers) })).then(function (r) {
        if (r.ok) return r;
        if (r.status === 401 && SESSION && !retried)
          return refreshSession().then(function () { return req(url, opt, true); }, function () { return errOf(r).then(function (e) { throw e; }); });
        return errOf(r).then(function (e) { throw e; });
      });
    });
  }

  /* ---------- funções ---------- */
  var ME = null, ROLE = "";
  var ROLE_L = { adm: "Adm", marketing: "Marketing", comum: "Comum", temporario: "Temporário" };
  /* quem pode criar/comentar: logado e não temporário (o temporário só visualiza) */
  function active() { return !!ME && ROLE !== "temporario"; }
  function staff() { return !!ME && (ROLE === "adm" || ROLE === "marketing"); }
  function canEditDem(d) { return !!ME && !!d && (staff() || (ROLE === "comum" && !!d.autorId && d.autorId === ME.id)); }
  function canNoteDel(n) { return !!ME && !!n && (staff() || (!!n.authorId && n.authorId === ME.id)); }
  var SERVER_IDS = {};
  function encPath(p) { return String(p).split("/").map(encodeURIComponent).join("/"); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function okRes(r) { if (!r.ok) throw new Error("HTTP " + r.status); return r; }
  function listOf(kind) { return kind === "demand" ? S.demands : kind === "event" ? S.events : S.clients; }

  function setSync(s) {
    var el = $("#sync");
    el.dataset.s = s;
    el.textContent = { loading: "Carregando…", saving: "Salvando…", ok: "Salvo ✓", err: "Sem conexão — tentando de novo" }[s] || "";
  }

  /* fila de gravação: a última operação por id vence; nada sai da fila sem confirmação do servidor */
  var OPS = {}, flushing = false, retryT = null, waiters = [];
  function pendingIds() { return Object.keys(OPS).filter(function (id) { return !OPS[id].done; }); }
  function queue(id, o) { o.ts = Date.now(); o.done = false; OPS[id] = o; flush(); }
  function put(kind, obj) { queue(obj.id, { op: "up", kind: kind, data: clone(obj) }); }
  function remove(kind, id) { queue(id, { op: "del", kind: kind }); }
  function rmFile(path) { if (path) queue("file:" + path, { op: "rmfile", path: path }); }
  function mediaPath(m) {
    if (m.path) return m.path;
    var s = String(m.src || "");
    return s.indexOf(PUB) === 0 ? decodeURIComponent(s.slice(PUB.length)) : "";
  }
  function latestRow(id) {
    return req(SB + "/rest/v1/items?id=eq." + encodeURIComponent(id) + "&select=data", { cache: "no-store" })
      .then(function (r) { return r.json(); }).then(function (rows) { return (rows && rows[0]) || null; });
  }
  function send(id, o) {
    if (o.op === "up")
      /* demandas: as observações e o autor vêm sempre da cópia mais nova do banco, para não perder um comentário feito ao mesmo tempo */
      return (o.kind === "demand" ? latestRow(id) : Promise.resolve(null)).then(function (row) {
        var data = o.data;
        if (row && row.data && typeof row.data === "object") {
          data = clone(o.data);
          data.notes = Array.isArray(row.data.notes) ? row.data.notes : [];
          if (row.data.autorId) { data.autorId = row.data.autorId; data.autorNome = row.data.autorNome; }
        }
        return req(SB + "/rest/v1/items", {
          method: "POST",
          headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify([{ id: id, kind: o.kind, data: data, updated_at: new Date().toISOString() }]),
        });
      });
    if (o.op === "del")
      return req(SB + "/rest/v1/items?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: { Prefer: "return=representation" } })
        .then(function (r) { return r.json().catch(function () { return []; }); })
        .then(function (rows) { if (Array.isArray(rows) && !rows.length && SERVER_IDS[id]) { var e = new Error(PERM); e.status = 403; throw e; } });
    return req(SB + "/storage/v1/object/midia/" + encPath(o.path), { method: "DELETE" }).then(function () {}, function (e) { if (e.status && e.status < 500) return; throw e; });
  }
  function flush() {
    if (flushing) return;
    var ids = pendingIds();
    if (!ids.length) {
      clearTimeout(retryT); retryT = null;
      if (loaded) setSync("ok");
      waiters.splice(0).forEach(function (f) { f(); });
      return;
    }
    flushing = true; setSync("saving");
    var id = ids[0], o = OPS[id];
    send(id, o).then(function () {
      o.done = true; o.doneAt = Date.now();
      if (o.op === "rmfile" && OPS[id] === o) delete OPS[id];
      flushing = false; flush();
    }, function (e) {
      flushing = false;
      if (e && e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429) {
        /* recusado pelo banco: não adianta tentar de novo; volta a mostrar o que está salvo */
        if (OPS[id] === o) delete OPS[id];
        toast(isPerm(e) ? PERM : "Não foi possível salvar: " + rpcMsg(e));
        sync(true); flush();
        return;
      }
      setSync("err");
      clearTimeout(retryT); retryT = setTimeout(function () { retryT = null; flush(); }, 10000);
    });
  }
  function whenSaved() { return new Promise(function (r) { if (!pendingIds().length) r(); else waiters.push(r); }); }
  window.addEventListener("online", flush);
  window.addEventListener("beforeunload", function (e) { if (pendingIds().length) { e.preventDefault(); e.returnValue = ""; } });

  /* leitura: reconstrói S a partir das linhas, mantendo por cima as gravações locais mais novas */
  var CORDER = ["cp", "fl", "pa"];
  function apply(rows, startedAt) {
    var d = { clients: defaults().clients, demands: [], events: [] };
    var L = { demand: d.demands, event: d.events, client: d.clients };
    var fix = [];
    (rows || []).forEach(function (r) {
      var list = L[r.kind];
      if (!list || !r.data || typeof r.data !== "object") return;
      var o = r.data; o.id = r.id;
      if (r.kind === "demand" && o.status === OLD_DEM) { o.status = "Demanda"; fix.push(o.id); }
      var k = list.findIndex(function (x) { return x.id === o.id; });
      if (k > -1) list[k] = o; else list.push(o);
    });
    Object.keys(OPS).forEach(function (id) {
      var o = OPS[id];
      if (!o.kind) return;
      if (o.done && o.doneAt < startedAt) { delete OPS[id]; return; }
      ["demand", "event", "client"].forEach(function (k) { var i = L[k].findIndex(function (x) { return x.id === id; }); if (i > -1) L[k].splice(i, 1); });
      if (o.op === "up") { var c = clone(o.data); c.id = id; L[o.kind].push(c); }
    });
    d.clients.sort(function (a, b) {
      var ia = CORDER.indexOf(a.id), ib = CORDER.indexOf(b.id);
      ia = ia < 0 ? 9 : ia; ib = ib < 0 ? 9 : ib;
      return ia - ib || (a.created || 0) - (b.created || 0);
    });
    S = clean(d);
    fix.forEach(function (id) {
      if (!staff() || (OPS[id] && !OPS[id].done)) return;
      var dm = S.demands.find(function (x) { return x.id === id; });
      if (dm) put("demand", dm);
    });
    if (fc && !S.clients.some(function (x) { return x.id === fc; })) fc = "";
    refresh();
  }
  function refresh() { fillClientSelects(); applyTheme(); renderChips(); renderAll(); }
  function busy() { return !!document.querySelector("dialog[open]"); }
  var syncing = false, deferred = null, lastSig = "", POLL = 45000;
  function rowsSig(rows) { return (rows || []).map(function (r) { return r.id + "@" + r.updated_at; }).sort().join(","); }
  /* sondagem leve (só id e updated_at); a lista completa só é baixada quando algo mudou */
  function sync(force) {
    /* sem login não há leitura: os dados só são baixados depois que a pessoa entra */
    if (!ME || syncing) return Promise.resolve();
    syncing = true;
    var startedAt = Date.now();
    var pre = loaded && force !== true
      ? req(SB + "/rest/v1/items?select=id,updated_at", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (rows) {
          if (rowsSig(rows) !== lastSig) return true;
          SERVER_IDS = {}; (rows || []).forEach(function (r) { SERVER_IDS[r.id] = 1; });
          return false;
        })
      : Promise.resolve(true);
    return pre
      .then(function (go) { return go ? req(SB + "/rest/v1/items?select=id,kind,data,updated_at", { cache: "no-store" }).then(function (r) { return r.json(); }) : null; })
      .then(function (rows) {
        syncing = false;
        if (!rows) { if (!pendingIds().length && !flushing) setSync("ok"); return; }
        lastSig = rowsSig(rows);
        SERVER_IDS = {};
        (rows || []).forEach(function (r) { SERVER_IDS[r.id] = 1; });
        var first = !loaded;
        loaded = true; loadFailed = false;
        if (busy() && !first) deferred = { rows: rows, startedAt: startedAt };
        else { deferred = null; apply(rows, startedAt); }
        if (!pendingIds().length && !flushing) setSync("ok");
        if (first) migrate();
      }, function () {
        syncing = false;
        if (!loaded) {
          loadFailed = true; setSync("err"); renderAll();
          setTimeout(sync, 10000);
        }
      });
  }
  function applyDeferred() { if (deferred && !busy()) { var d = deferred; deferred = null; apply(d.rows, d.startedAt); } }
  document.querySelectorAll("dialog").forEach(function (dl) { dl.addEventListener("close", function () { setTimeout(applyDeferred, 0); }); });
  /* a cada 45 s, só com a aba visível */
  setInterval(function () { if (loaded && !document.hidden) sync(); }, POLL);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && loaded) { sync(); flush(); } });
  window.addEventListener("focus", function () { if (loaded) { sync(); flush(); } });

  /* envio de arquivos para o Storage */
  var lastStamp = 0;
  function stamp() { var t = Date.now(); if (t <= lastStamp) t = lastStamp + 1; lastStamp = t; return t; }
  function safeName(n, ext) {
    n = String(n || "arquivo");
    var m = n.match(/\.([a-z0-9]{1,5})$/i), base = m ? n.slice(0, -m[0].length) : n;
    ext = ext || (m ? m[1].toLowerCase() : "bin");
    base = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[-.]+|[-.]+$/g, "").slice(0, 60) || "arquivo";
    return base + "." + ext;
  }
  function extFor(type) { return { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp", "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" }[type] || (String(type).split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "bin"; }
  function upload(path, blob, type, prog) {
    if (!SESSION) { var ne = new Error(PERM); ne.status = 401; return Promise.reject(ne); }
    return fresh().then(function () { return new Promise(function (res, rej) {
      var x = new XMLHttpRequest();
      x.open("POST", SB + "/storage/v1/object/midia/" + encPath(path));
      x.setRequestHeader("apikey", SBK);
      x.setRequestHeader("Authorization", "Bearer " + (SESSION ? SESSION.access_token : SBK));
      x.setRequestHeader("Content-Type", type || "application/octet-stream");
      x.setRequestHeader("x-upsert", "true");
      if (prog && x.upload) x.upload.onprogress = function (e) { if (e.lengthComputable) prog(e.loaded, e.total); };
      x.onload = function () {
        if (x.status >= 200 && x.status < 300) { res(PUB + encPath(path)); return; }
        var j = {}; try { j = JSON.parse(x.responseText || "{}"); } catch (e) {}
        var er = new Error(j.message || j.error || "HTTP " + x.status); er.status = +j.statusCode || x.status; rej(er);
      };
      x.onerror = x.ontimeout = x.onabort = function () { rej(new Error("rede")); };
      x.send(blob);
    }); });
  }
  function dataToBlob(s) {
    var i = s.indexOf(","), meta = s.slice(5, i), type = meta.split(";")[0] || "application/octet-stream";
    var raw = meta.indexOf(";base64") > -1 ? atob(s.slice(i + 1)) : decodeURIComponent(s.slice(i + 1));
    var u = new Uint8Array(raw.length);
    for (var j = 0; j < raw.length; j++) u[j] = raw.charCodeAt(j);
    return { blob: new Blob([u], { type: type }), type: type };
  }

  /* importa um backup (ou os dados antigos deste navegador): sobe mídia embutida e grava cada item */
  function upsertLocal(kind, o) {
    var L = listOf(kind), i = L.findIndex(function (x) { return x.id === o.id; });
    if (i > -1) L[i] = o; else L.push(o);
    put(kind, o);
  }
  function ingest(d) {
    d = clean(d);
    var fails = 0, chain = Promise.resolve();
    d.clients.forEach(function (c) { if (!BRAND[c.id]) { if (!c.created) c.created = Date.now(); upsertLocal("client", c); } });
    d.events.forEach(function (e) { if (!e.id) e.id = uid(); upsertLocal("event", e); });
    d.demands.forEach(function (dm) {
      if (!dm.id) dm.id = uid();
      chain = chain.then(function () {
        var media = dm.media || [];
        return media.reduce(function (p, m) {
          return p.then(function () {
            var s = String(m.src || ""), r;
            if (s.slice(0, 5) !== "data:") return;
            try { r = dataToBlob(s); } catch (e) { m.src = ""; fails++; return; }
            var ext = extFor(r.type), nm = m.name || (m.kind === "video" ? "video" : "foto");
            var path = dm.id + "/" + stamp() + "-" + safeName(nm, /\.[a-z0-9]{1,5}$/i.test(nm) ? "" : ext);
            if (m.kind === "image" && /^video\//.test(r.type)) m.kind = "video";
            return upload(path, r.blob, r.type).then(function (url) { m.src = url; m.path = path; }, function () { m.src = ""; fails++; });
          });
        }, Promise.resolve()).then(function () {
          dm.media = media.filter(function (m) { return m && (m.src || m.url); });
          upsertLocal("demand", dm);
        });
      });
    });
    return chain.then(function () { refresh(); return fails; });
  }
  var migrating = false;
  function migrate() {
    var raw = null, done = null;
    if (!staff() || !loaded) return;
    try { raw = localStorage.getItem(KEY); done = localStorage.getItem(KEY + "-migrated"); } catch (e) { return; }
    if (!raw || done || migrating) return;
    var d; try { d = JSON.parse(raw); } catch (e) { return; }
    if (!valid(d) || !(d.demands.length || d.events.length)) return;
    migrating = true;
    say("Enviando dados antigos deste aparelho…");
    ingest(d).then(function (fails) {
      return whenSaved().then(function () {
        migrating = false;
        if (!fails) { try { localStorage.setItem(KEY + "-migrated", "1"); } catch (e) {} toast("Dados antigos enviados para o banco online."); }
        else toast(fails + " arquivo(s) antigo(s) não foram enviados — tentaremos de novo na próxima abertura.");
      });
    });
  }
  var msgT;
  function say(t) { var m = $("#msg"); m.textContent = t; clearTimeout(msgT); msgT = setTimeout(function () { m.textContent = ""; }, 4000); }

  /* confirm dialog (native confirm() may be blocked in embedded views) */
  var confFn = null;
  $("#confYes").innerHTML = DEL_HTML;
  $("#dDel").innerHTML = DEL_HTML;
  $("#eDel").innerHTML = DEL_HTML;
  function ask(text, fn, yes) { $("#confYes").innerHTML = yes ? esc(yes) : DEL_HTML; $("#confT").textContent = text; confFn = fn; $("#mConf").returnValue = ""; $("#mConf").showModal(); }
  function confDone(ok) {
    var f = confFn; confFn = null;
    $("#mConf").returnValue = ok ? "yes" : "no";
    if ($("#mConf").open) $("#mConf").close();
    if (ok && f) f();
  }
  $("#confNo").addEventListener("click", function () { confDone(false); });
  $("#confYes").addEventListener("click", function () { confDone(true); });
  $("#mConf").addEventListener("close", function () { confFn = null; });
  function delDem(id) {
    if (!canEditDem(S.demands.find(function (x) { return x.id === id; }))) { toast(PERM); return; }
    ask("Excluir esta demanda?", function () {
      var dm = S.demands.find(function (x) { return x.id === id; });
      S.demands = S.demands.filter(function (x) { return x.id !== id; });
      remove("demand", id);
      if (dm && dm.media) dm.media.forEach(function (m) { if (m.kind !== "link") rmFile(mediaPath(m)); });
      if ($("#mDem").open) $("#mDem").close(); renderAll(); say("Demanda excluída.");
    });
  }
  function delEv(id) {
    if (!staff()) { toast(PERM); return; }
    ask("Excluir este compromisso?", function () {
      S.events = S.events.filter(function (x) { return x.id !== id; });
      remove("event", id); if ($("#mEv").open) $("#mEv").close(); renderAll(); say("Compromisso excluído.");
    });
  }

  /* tabs */
  document.querySelectorAll(".x-tab").forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll(".x-tab").forEach(function (o) {
        var on = o === t; o.setAttribute("aria-selected", on); $("#" + o.getAttribute("aria-controls")).hidden = !on;
      });
      /* só a aba visível é desenhada; a outra é atualizada quando abre */
      if (t.id === "tab-cal" && calDirty) renderCal();
      if (t.id === "tab-dem" && bDirty) renderBoard();
      if (t.id === "tab-usr" && ME && ROLE === "adm") { if (!usrLoaded) renderUsers(); loadUsers(); }
    });
  });

  /* client filter chips + palette */
  var fc = "";
  function renderChips() {
    if (setHTML($("#cliChips"), '<button class="x-chip x-chip--all" type="button" data-c="" aria-pressed="' + (fc === "") + '">Todos</button>' +
      S.clients.map(function (x) {
        var c = cli(x.id);
        return '<button class="x-chip x-cct" type="button" data-c="' + c.id + '" style="' + tv("cc", c.color) + '" aria-pressed="' + (fc === c.id) + '" aria-label="' + esc(c.name) + '">' + logo(c) + "<span>" + esc(c.short) + "</span></button>";
      }).join(""))) hydrate($("#cliChips"));
  }
  $("#cliChips").addEventListener("click", function (e) {
    var b = e.target.closest(".x-chip"); if (!b) return;
    fc = b.dataset.c; resetN(); applyTheme(); renderChips(); renderAll();
  });
  function applyTheme() {
    var app = $("#app"), c = fc ? cli(fc) : null, b = c && BRAND[c.id], v;
    if (!c) v = null;
    else if (b) v = { brand: b.color, on: b.on, hd: b.hdBg, ink: b.hdInk, c2: b.c2 };
    else v = { brand: c.color, on: "#FFFFFF", hd: c.color, ink: "#FFFFFF", c2: "transparent" };
    ["--brand", "--brand-on", "--hd-bg", "--hd-ink", "--brand-2"].forEach(function (k, i) {
      if (v) app.style.setProperty(k, [v.brand, v.on, v.hd, v.ink, v.c2][i]); else app.style.removeProperty(k);
    });
    if (v) app.style.setProperty("--hd-tint", "rgba(" + rgbOf(v.ink).join(", ") + ", 0.14)"); else app.style.removeProperty("--hd-tint");
    $("#hLogos").hidden = !!c;
    $("#hClient").hidden = !c;
    if (setHTML($("#hClient"), c ? logo(c) : "")) hydrate($("#hClient"));
    $("#hSub").textContent = c ? c.name + (b ? " · " + b.tone : "") : "Todos os clientes";
    setHTML($("#hSw"), b ? b.pal.map(function (p) { return '<i style="--c:' + p + '"></i>'; }).join("") : "");
  }

  /* clients */
  function fillClientSelects() {
    document.querySelectorAll(".x-cli").forEach(function (s) {
      var v = s.value;
      s.innerHTML = '<option value="">Selecione…</option>' + S.clients.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + "</option>"; }).join("");
      s.value = v;
    });
  }

  /* filters */
  $("#fTipo").innerHTML = opts(TIPOS, "", "Todos os tipos");
  $("#fStatus").innerHTML = opts(stNames("externa"), "", "Todos os status");
  /* filtros e busca valem para todas as demandas; a lista filtrada é que é paginada */
  function resetBoard() { resetN(); renderBoard(); }
  ["#fTipo", "#fStatus"].forEach(function (id) { $(id).addEventListener("change", resetBoard); });
  var qT = null;
  $("#fBusca").addEventListener("input", function () { clearTimeout(qT); qT = setTimeout(function () { autoQ = true; resetBoard(); }, 150); });
  $("#bFilt").addEventListener("click", function () {
    var open = $("#fPanel").classList.toggle("is-open"); this.setAttribute("aria-expanded", open);
  });

  /* ---------- lista: 5 cartões, mais 5 ao rolar; só os cartões perto da tela ficam no DOM ---------- */
  /* nenhuma seção abre sozinha: OPEN[k] = quantos cartões a seção aberta mostra; nada é lembrado entre recargas */
  var OPEN = {}, STEP = 5, bDirty = false, moreBusy = {}, autoQ = false;
  function mk(h) { var t = document.createElement("template"); t.innerHTML = h; return t.content.firstElementChild; }
  function mkIO(cb, margin) {
    if (!("IntersectionObserver" in window)) return null;
    /* root: document mantém a margem mesmo dentro de um iframe isolado */
    try { return new IntersectionObserver(cb, { root: document, rootMargin: margin }); } catch (e) { return new IntersectionObserver(cb, { rootMargin: margin }); }
  }
  /* o que o cartão mostra: se nada disso mudou, o cartão não é redesenhado */
  function sig(d) {
    var c = cli(d.clientId), M = d.media || [];
    return [d.title, d.clientId, c.name, c.color, d.type, d.status, d.start, d.post, d.autorId, d.autorNome, M.length,
      M.slice(0, 3).map(function (m) { return m.kind + (m.src || m.url || ""); }).join(" "), (d.notes || []).length, capOf(d.desc) ? 1 : 0, canEditDem(d) ? 1 : 0].join("|");
  }
  function cardEl(d) { var el = mk(card(d)); el.dataset.k = "c:" + d.id; el.dataset.sig = sig(d); hydrate(el); if (winIO) winIO.observe(el); return el; }
  function dropEl(el) {
    if (winIO) { winIO.unobserve(el); if (el.querySelectorAll) el.querySelectorAll(".x-card, .x-spc").forEach(function (c) { winIO.unobserve(c); }); }
    el.remove();
  }
  var winIO = mkIO(function (es) {
    es.forEach(function (e) {
      var el = e.target, box = el.parentNode;
      if (!box || !el.isConnected) return;
      if (el.classList.contains("x-spc")) {
        if (!e.isIntersecting) return;
        winIO.unobserve(el);
        var d = S.demands.find(function (x) { return "c:" + x.id === el.dataset.k; });
        if (d) box.replaceChild(cardEl(d), el); else el.remove();
      } else if (!e.isIntersecting && e.boundingClientRect.height > 0 && !el.contains(document.activeElement)) {
        /* longe da tela: vira um espaçador da mesma altura, para a rolagem não pular */
        var s = document.createElement("div");
        s.className = "x-spc"; s.setAttribute("aria-hidden", "true");
        s.dataset.k = el.dataset.k; s.dataset.sig = el.dataset.sig; s.style.height = Math.min(e.boundingClientRect.height, 3900) + "px";
        winIO.unobserve(el); box.replaceChild(s, el); winIO.observe(s);
      }
    });
  }, "600px 0px");
  /* "mais 5" de cada seção aberta: ao rolar até o fim dela, ou pelo botão */
  var scrollTick = 0, scrollRaf = 0;
  function loadMore(mo) {
    var k = mo.dataset.more;
    if (!OPEN[k] || moreBusy[k] || $("#p-dem").hidden || mo.hidden) return;
    moreBusy[k] = true;
    var b = mo.firstElementChild; if (b) b.textContent = "Carregando…";
    setTimeout(function () { if (OPEN[k]) OPEN[k] += STEP; renderBoard(); }, 0);
  }
  var moreIO = mkIO(function (es) {
    es.forEach(function (e) {
      var mo = e.target; mo._vis = e.isIntersecting;
      /* só carrega mais depois de rolar para baixo: abrir a seção mostra só 5 */
      if (e.isIntersecting && scrolledDown(mo)) loadMore(mo);
    });
  }, "300px 0px");
  function scrolledDown(mo) { return window.scrollY > (mo._y || 0) + 24; }
  window.addEventListener("scroll", function () {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(function () {
      scrollRaf = 0; scrollTick++;
      $("#board").querySelectorAll(".x-more[data-more]").forEach(function (mo) { if (window.scrollY < (mo._y || 0)) mo._y = window.scrollY; if (mo._vis && scrolledDown(mo)) loadMore(mo); });
    });
  }, { passive: true });
  if (!moreIO) STEP = 1e9;
  function resetN() { Object.keys(OPEN).forEach(function (k) { OPEN[k] = STEP; }); }
  var gSeq = 0;
  function closeBody(el) {
    var hd = el.firstElementChild, body = el.lastElementChild, box = body.querySelector(".x-list"), mo = body.lastElementChild;
    hd.setAttribute("aria-expanded", "false");
    if (body.hidden && !box.firstChild) return;
    body.hidden = true;
    var xs = body.querySelector(":scope > .x-xsum"); if (xs) xs.remove();
    [].slice.call(box.children).forEach(function (c) { dropEl(c); });
    mo.hidden = true; mo._vis = false; if (moreIO) moreIO.unobserve(mo);
  }
  $("#board").addEventListener("click", function (e) {
    var mb = e.target.closest("[data-morebtn]");
    if (mb) { e.stopImmediatePropagation(); loadMore(mb.parentNode); return; }
    var hd = e.target.closest(".x-ghd"); if (!hd) return;
    e.stopImmediatePropagation();
    var k = hd.dataset.gk;
    if (OPEN[k]) delete OPEN[k]; else OPEN[k] = STEP;
    renderBoard();
    if (!OPEN[k]) moreBusy[k] = false;
  }, true);
  function boardPlan(list, fs) {
    var exts = list.filter(function (d) { return isExtD(d) && (!fs || d.status === fs); });
    var norm = list.filter(function (d) { return !isExtD(d); });
    var showExt = !fs || exts.length || fs === CAPT, G = [];
    STATUS.filter(function (s) { return !fs || s[0] === fs; }).forEach(function (s) {
      if (s[0] === "Standby" && !fs) G.push(extPlan(exts));
      var items = norm.filter(function (d) { return d.status === s[0] || (s[0] === "Demanda" && isCapt(d)); }).sort(function (a, b) { return (a.post || "9").localeCompare(b.post || "9"); });
      G.push({ k: s[0], n: items.length, sum: badge(s[0], s[1]) + '<span class="x-n" aria-label="' + items.length + ' demandas">' + items.length + "</span>", xs: "",
        items: items.length ? items.map(function (d) { return { k: "c:" + d.id, d: d }; }) : [{ k: "e", h: '<p class="x-empty">Nenhuma demanda neste status.</p>' }] });
    });
    if (fs && showExt) { if (fs === CAPT) G.unshift(extPlan(exts)); else G.push(extPlan(exts)); }
    return G;
  }
  /* os primeiros N cartões de uma seção aberta, na mesma ordem de sempre */
  function takeG(g, N) {
    var it = [], c = 0, stop = false;
    for (var j = 0; j < g.items.length; j++) {
      var u = g.items[j];
      if (u.d) { if (c >= N) { stop = true; break; } c++; }
      it.push(u);
    }
    if (stop) while (it.length && !it[it.length - 1].d) it.pop();
    return { items: it, more: stop, left: g.n - c };
  }
  function syncKids(box, units) {
    var have = {}, ref = box.firstElementChild;
    [].forEach.call(box.children, function (el) { have[el.dataset.k] = el; });
    units.forEach(function (u) {
      var el = have[u.k]; delete have[u.k];
      if (u.d) {
        var sg = sig(u.d);
        if (el && el.dataset.sig !== sg) {
          if (el.classList.contains("x-spc")) el.dataset.sig = sg;
          else { var nel = cardEl(u.d); if (ref === el) ref = nel; if (winIO) winIO.unobserve(el); box.replaceChild(nel, el); el = nel; }
        }
        if (!el) el = cardEl(u.d);
      } else {
        if (el && el._h !== u.h) { if (ref === el) ref = el.nextElementSibling; dropEl(el); el = null; }
        if (!el) { el = mk(u.h); el.dataset.k = u.k; el._h = u.h; }
      }
      if (el === ref) ref = ref.nextElementSibling; else box.insertBefore(el, ref);
    });
    Object.keys(have).forEach(function (k) { dropEl(have[k]); });
  }
  function renderBoard() {
    var ft = $("#fTipo").value, fs = $("#fStatus").value, q = $("#fBusca").value.trim().toLowerCase();
    var nf = (ft ? 1 : 0) + (fs ? 1 : 0) + (q ? 1 : 0);
    $("#bFilt").textContent = nf ? "Filtros (" + nf + ")" : "Filtros";
    if ($("#p-dem").hidden) { bDirty = true; return; }
    bDirty = false;
    var B = $("#board");
    function blank(h) { [].slice.call(B.children).forEach(function (el) { if (el.dataset.st) closeBody(el); dropEl(el); }); B.innerHTML = h; }
    if (!loaded) { blank('<div class="x-blank" role="status"><p>' + (loadFailed ? "Sem conexão — tentando de novo…" : "Carregando…") + "</p></div>"); return; }
    if (!S.demands.length) {
      blank(active() ? '<div class="x-blank"><p>Nenhuma demanda ainda — clique em <b>+ Nova demanda</b>.</p><button class="x-cta" type="button" data-new>+ Nova demanda</button></div>' : '<div class="x-blank"><p>Nenhuma demanda ainda.</p></div>');
      return;
    }
    var list = S.demands.filter(function (d) {
      return (!fc || d.clientId === fc) && (!ft || d.type === ft) && (!q || (d.title + " " + (d.desc || "")).toLowerCase().indexOf(q) > -1);
    });
    if (!list.length) { blank('<div class="x-blank"><p>Nenhuma demanda com esses filtros.</p></div>'); return; }
    var G = boardPlan(list, fs);
    /* busca digitada: abre as seções com resultados, cada uma com só 5 cartões */
    if (autoQ) { autoQ = false; if (q) G.forEach(function (g) { if (g.n && !OPEN[g.k]) OPEN[g.k] = STEP; }); }
    [].slice.call(B.children).forEach(function (el) { if (!el.dataset.st) el.remove(); });
    var have = {}, ref = B.firstElementChild;
    [].forEach.call(B.children, function (el) { have[el.dataset.st] = el; });
    G.forEach(function (g) {
      var el = have[g.k]; delete have[g.k];
      if (!el) {
        var id = "gb" + ++gSeq;
        el = mk('<div class="x-group' + (g.k === "__ext" ? " x-ext" : "") + '" data-st="' + esc(g.k) + '"><button class="x-ghd" type="button" aria-expanded="false" aria-controls="' + id + '" data-gk="' + esc(g.k) + '"></button>' +
          '<div class="x-gbody" id="' + id + '" hidden><div class="x-list"></div><div class="x-more" data-more="' + esc(g.k) + '" hidden><button class="x-btn" type="button" data-morebtn></button></div></div></div>');
      }
      var hd = el.firstElementChild;
      if (hd._h !== g.sum) { hd.innerHTML = g.sum; hd._h = g.sum; }
      if (!OPEN[g.k]) closeBody(el);
      else {
        var body = el.lastElementChild, box = body.firstElementChild.classList.contains("x-list") ? body.firstElementChild : body.querySelector(".x-list"), mo = body.lastElementChild;
        hd.setAttribute("aria-expanded", "true"); body.hidden = false;
        var xs = body.querySelector(":scope > .x-xsum");
        if (xs && xs._h !== g.xs) { xs.remove(); xs = null; }
        if (!xs && g.xs) { xs = mk(g.xs); xs._h = g.xs; hydrate(xs); body.insertBefore(xs, box); }
        var T = takeG(g, OPEN[g.k]);
        syncKids(box, T.items);
        moreBusy[g.k] = false;
        mo.hidden = !T.more;
        mo.firstElementChild.textContent = "Mostrar mais " + Math.min(STEP, T.left) + " (" + T.left + " restantes)";
        if (moreIO) { moreIO.unobserve(mo); mo._vis = false; if (T.more) { mo._y = window.scrollY; moreIO.observe(mo); } }
      }
      if (el === ref) ref = ref.nextElementSibling; else B.insertBefore(el, ref);
    });
    Object.keys(have).forEach(function (k) { closeBody(have[k]); dropEl(have[k]); });
  }
  function card(d) {
    var c = cli(d.clientId), ex = isExtD(d), done = ex && isCapt(d), ed = canEditDem(d);
    var xb = ex && ed ? (done
      ? '<button class="x-capt" type="button" data-capt="' + d.id + '" aria-pressed="true" aria-label="' + esc(d.title) + ' captada. Toque para desfazer">✓ Captado</button>'
      : '<button class="x-capt" type="button" data-capt="' + d.id + '" aria-pressed="false" aria-label="Marcar ' + esc(d.title) + ' como Captado">Captado</button>') : "";
    return '<article class="x-card' + (ex ? " x-xc" + (done ? " x-xc--done" : "") : "") + '" data-id="' + d.id + '" style="' + tv("cc", c.color) + '" tabindex="0" aria-label="' + esc(d.title) + '">' +
      '<span class="x-thumb">' + logo(c) + "</span>" +
      '<div><h4>' + esc(d.title) + "</h4>" +
      '<div class="x-meta">' + cchip(c) + (d.type ? "<span>" + esc(d.type) + "</span>" : "") +
      (d.start ? "<span>Início: " + fmt(d.start) + "</span>" : "") + "<span>Postagem: " + fmt(d.post) + "</span>" +
      (d.media && d.media.length ? '<span class="x-obs" title="' + d.media.length + ' arquivos">' + MEDIA_ICON + d.media.length + "</span>" : "") +
      (d.notes && d.notes.length ? '<span class="x-obs" title="' + d.notes.length + ' OBS">' + ICON + d.notes.length + "</span>" : "") +
      (d.autorNome ? "<span>Criado por " + esc(d.autorNome) + "</span>" : "") + "</div>" + cardMedia(d) + "</div>" +
      '<div class="x-cact">' + xb + (ed ? '<select class="x-in x-move" aria-label="Mover status">' + opts(stNames(d.title, d.type), d.status) + "</select>" : badge(d.status, stColor(d.status))) +
      (capOf(d.desc) ? '<button class="x-btn" type="button" data-cap="' + d.id + '" aria-label="Copiar legenda de ' + esc(d.title) + '">Copiar legenda</button>' : "") +
      (ed && d.status !== "Postado" && !ex ? '<button class="x-btn x-post" type="button" data-post="' + d.id + '" aria-label="Marcar ' + esc(d.title) + ' como Postado">Postado ✓</button>' : "") +
      (ed ? '<button class="x-del" type="button" data-del="' + d.id + '">' + DEL_HTML + "</button>" : "") + "</div></article>";
  }
  function dDate(d) { return d.post || d.start || ""; }
  function extPlan(list) {
    var pend = list.filter(function (d) { return !isCapt(d); }).sort(function (a, b) { return (dDate(a) || "9").localeCompare(dDate(b) || "9"); });
    var capt = list.filter(isCapt).sort(function (a, b) { return dDate(b).localeCompare(dDate(a)); });
    var n = capt.length, tot = list.length, lbl = n + (n === 1 ? " captada" : " captadas") + " de " + tot;
    var sum = "";
    if (n) {
      var pc = {}, pm = {};
      capt.forEach(function (d) { pc[d.clientId] = (pc[d.clientId] || 0) + 1; var m = dDate(d).slice(0, 7); pm[m] = (pm[m] || 0) + 1; });
      var cIds = S.clients.map(function (c) { return c.id; }).filter(function (id) { return BRAND[id] && (!fc || id === fc); });
      Object.keys(pc).forEach(function (id) { if (cIds.indexOf(id) < 0) cIds.push(id); });
      var cl = cIds.map(function (id) { var c = cli(id); return '<li><span class="x-cchip x-cct" style="' + tv("cc", c.color) + '">' + logo(c) + "<span>" + esc(c.name) + "</span></span><b>" + (pc[id] || 0) + "</b></li>"; }).join("");
      var ml = Object.keys(pm).sort(function (a, b) { return !a ? 1 : !b ? -1 : b.localeCompare(a); }).map(function (m) {
        var t = m ? MESES[+m.slice(5, 7) - 1] + " " + m.slice(0, 4) : "Sem data";
        return "<li><span>" + t + "</span><b>" + pm[m] + "</b></li>";
      }).join("");
      sum = '<div class="x-xsum"><h5>Captadas por cliente</h5><ul class="x-xrow">' + cl + '</ul><h5>Captadas por mês</h5><ul class="x-xrow">' + ml + "</ul></div>";
    }
    var items = [];
    function cu(d) { items.push({ k: "c:" + d.id, d: d }); }
    if (tot) {
      if (pend.length) { items.push({ k: "s:p", h: '<p class="x-xsub">A captar (' + pend.length + ")</p>" }); pend.forEach(cu); }
      if (n) { items.push({ k: "s:c", h: '<p class="x-xsub">Captadas (' + n + ")</p>" }); capt.forEach(cu); }
    } else items.push({ k: "e", h: '<p class="x-empty">Nenhuma externa ainda.</p>' });
    return { k: "__ext", n: tot, sum: badge("Externas", "#2563EB") + '<span class="x-n x-hd" aria-label="Externas: ' + lbl + '"><b>' + n + "</b>&nbsp;" + (n === 1 ? "captada" : "captadas") + " de " + tot + "</span>", xs: sum, items: items };
  }
  function miniCard(d) {
    var c = cli(d.clientId);
    return '<article class="x-card x-card--mini" data-id="' + d.id + '" style="' + tv("cc", c.color) + '" tabindex="0" aria-label="' + esc(d.title) + ', abrir para editar">' +
      '<span class="x-thumb">' + logo(c) + "</span>" +
      '<div><h4>' + esc(d.title) + '</h4><div class="x-meta"><span class="x-cchip x-cct" style="' + tv("cc", c.color) + '">' + esc(c.short) + "</span>" + (d.type ? "<span>" + esc(d.type) + "</span>" : "") + "<span>" + fmt(dDate(d)) + "</span></div></div></article>";
  }
  $("#board").addEventListener("click", function (e) {
    if (e.target.closest("[data-new]")) { openDem(null); return; }
    var lbb = e.target.closest("[data-lb]");
    if (lbb) {
      var dm = S.demands.find(function (x) { return x.id === lbb.dataset.lb; });
      if (dm && dm.media && dm.media.length) openLb(dm.media, +lbb.dataset.i || 0, dm.title);
      return;
    }
    var cpb = e.target.closest("[data-cap]");
    if (cpb) {
      var cd = S.demands.find(function (x) { return x.id === cpb.dataset.cap; });
      if (cd) copyCap(cd.desc, function () { openDem(cd.id); selectCap(); });
      return;
    }
    var cb = e.target.closest("[data-capt]");
    if (cb) {
      var xd = S.demands.find(function (x) { return x.id === cb.dataset.capt; });
      if (!xd) return;
      if (!canEditDem(xd)) { toast(PERM); return; }
      if (isCapt(xd)) {
        ask("Desfazer captação de “" + xd.title + "”? Volta para Demanda.", function () { xd.status = "Demanda"; put("demand", xd); renderAll(); say("Externa voltou para Demanda."); }, "Voltar para Demanda");
      } else { xd.status = CAPT; put("demand", xd); renderAll(); say("Externa captada ✓"); }
      return;
    }
    var del = e.target.closest("[data-del]"); if (del) { delDem(del.dataset.del); return; }
    var pb = e.target.closest("[data-post]");
    if (pb) {
      var pd = S.demands.find(function (x) { return x.id === pb.dataset.post; });
      if (pd && !canEditDem(pd)) { toast(PERM); return; }
      if (pd) { pd.status = "Postado"; put("demand", pd); renderAll(); say("Status atualizado: Postado"); }
      return;
    }
    if (e.target.closest(".x-move")) return;
    var c = e.target.closest(".x-card"); if (c) openDem(c.dataset.id);
  });
  $("#board").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.classList.contains("x-card")) openDem(e.target.dataset.id);
  });
  $("#board").addEventListener("change", function (e) {
    if (!e.target.classList.contains("x-move")) return;
    var d = S.demands.find(function (x) { return x.id === e.target.closest(".x-card").dataset.id; });
    if (d && !canEditDem(d)) { toast(PERM); e.target.value = d.status; return; }
    if (d) { d.status = e.target.value; put("demand", d); renderAll(); say("Status atualizado: " + d.status); }
  });

  /* demand modal */
  var editDem = null, draftNotes = [], draftMedia = [], draftId = "", upN = {};
  function upUI() { var n = upN[draftId]; $("#dSave").textContent = n ? "Enviando…" : "Salvar"; $("#dSave").setAttribute("aria-busy", n ? "true" : "false"); }
  $("#dType").innerHTML = opts(TIPOS, TIPOS[0]);
  function dStOpts(sel) {
    var l = stNames($("#dTitle").value, $("#dType").value);
    if (l.indexOf(sel) < 0) sel = STATUS[0][0];
    $("#dStatus").innerHTML = opts(l, sel);
  }
  dStOpts(STATUS[0][0]);
  $("#dTitle").addEventListener("input", function () { dStOpts($("#dStatus").value); });
  $("#dType").addEventListener("change", function () { dStOpts($("#dStatus").value); });
  var demRO = false, noteBusy = false;
  function renderNotes() {
    $("#dNotes").innerHTML = draftNotes.length ? draftNotes.map(function (n, i) {
      return "<li><span>" + esc(n.text) + "</span><small>" + esc(n.author || "Anônimo") + " · " + fmtTs(n.ts) + "</small>" +
        (canNoteDel(n) ? '<button type="button" data-i="' + i + '" aria-label="Remover observação">×</button>' : "") + "</li>";
    }).join("") : '<li><small>Nenhuma observação ainda.</small></li>';
  }
  $("#dNotes").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-i]"); if (!b) return;
    var n = draftNotes[+b.dataset.i];
    if (!canNoteDel(n)) { toast(PERM); return; }
    var d = editDem;
    if (!d) { draftNotes.splice(+b.dataset.i, 1); renderNotes(); return; }
    b.disabled = true;
    sb.rpc("del_obs", { p_item: d.id, p_ts: String(n.ts) }).then(function (res) {
      if (res.error) { b.disabled = false; toast(rpcMsg(res.error)); return; }
      d.notes = (d.notes || []).filter(function (x) { return x.ts !== n.ts; });
      var k = draftNotes.indexOf(n); if (k > -1) draftNotes.splice(k, 1);
      if (editDem === d) renderNotes();
      renderBoard(); say("Observação removida.");
    });
  });
  function addNote() {
    if (!active()) { toast(PERM); return; }
    if (noteBusy || detBusy) return;
    var t = $("#nText").value.trim();
    if (!t) { $("#nText").focus(); return; }
    var d = editDem;
    if (!d) {
      draftNotes.push({ author: ME.nome, authorId: ME.id, text: t, ts: new Date().toISOString() });
      $("#nText").value = ""; renderNotes(); return;
    }
    /* demanda já salva: grava só a observação, direto no banco */
    noteBusy = true; $("#nAdd").disabled = true; $("#nAdd").textContent = "Enviando…";
    (OPS[d.id] && !OPS[d.id].done ? whenSaved() : Promise.resolve())
      .then(function () { return sb.rpc("add_obs", { p_item: d.id, p_texto: t }); })
      .then(function (res) {
        if (res.error) { toast(rpcMsg(res.error)); return; }
        var n = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!n || typeof n !== "object" || !n.ts) n = { author: ME.nome, authorId: ME.id, text: t, ts: new Date().toISOString() };
        d.notes = (d.notes || []).concat([n]);
        if (editDem === d && $("#mDem").open) {
          draftNotes.push(n);
          if ($("#nText").value.trim() === t) $("#nText").value = "";
          renderNotes();
        }
        renderBoard(); say("Observação adicionada.");
      })
      .then(function () { noteBusy = false; $("#nAdd").disabled = false; $("#nAdd").textContent = "Adicionar"; });
  }
  $("#nAdd").addEventListener("click", addNote);
  $("#nText").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addNote(); } });

  function openDem(id) {
    var d = id ? S.demands.find(function (x) { return x.id === id; }) : null;
    if (!d && !active()) return;
    editDem = d;
    draftId = d ? d.id : uid();
    var ro = demRO = !!d && !canEditDem(d);
    upUI();
    fillClientSelects();
    $("#mDemT").textContent = d ? (ro ? "Demanda" : "Editar demanda") : "Nova demanda";
    $("#dBy").hidden = !(d && d.autorNome);
    $("#dBy").textContent = d && d.autorNome ? "Criado por " + d.autorNome : "";
    $("#dRo").hidden = !ro;
    $("#dRo").textContent = active() ? "Somente leitura — você pode adicionar observações." : "Acesso temporário — somente leitura.";
    ["#dTitle", "#dClient", "#dType", "#dDesc", "#dStatus", "#dStart", "#dPost"].forEach(function (s) { $(s).disabled = ro; });
    ["#dFixT", "#dFixD", "#aiGen", "#mAiNote", "#mTools", "#mDrop", "#mLinkRow", "#dSave"].forEach(function (s) { var el = $(s); if (el) el.hidden = ro; });
    $("#nRow").hidden = $("#nFix").hidden = !active();
    $("#dCancel").textContent = ro ? "Fechar" : "Cancelar";
    $("#dTitle").value = d ? d.title : "";
    $("#dClient").value = d ? d.clientId : fc;
    $("#dType").value = d ? d.type : TIPOS[0];
    dStOpts(d ? d.status : STATUS[0][0]);
    $("#dStart").value = d ? d.start : "";
    $("#dPost").value = d ? d.post : "";
    $("#nText").value = "";
    $("#dErr").textContent = "";
    $("#mLink").value = ""; mediaNote("");
    $("#dDel").hidden = !d || ro;
    closeFix($("#mDem"));
    aiReset();
    dHint();
    fillDet(null, !!d); detUI(!!d);
    $("#mDem").showModal();
    if (d) loadDet(d);
  }
  /* detalhes (descrição, observações, arquivos) só são buscados e desenhados quando a demanda abre */
  var detSeq = 0, detBusy = false;
  function fillDet(d, loading) {
    $("#dDesc").value = d ? d.desc || "" : "";
    draftNotes = d ? clone(d.notes || []) : [];
    if (loading) $("#dNotes").innerHTML = ""; else renderNotes();
    draftMedia = d && d.media ? d.media.slice() : [];
    renderMedia(); aiUI();
  }
  function detUI(on) {
    detBusy = on; $("#dLoad").hidden = !on;
    $("#dDesc").disabled = on || demRO; $("#dSave").disabled = on; $("#nAdd").disabled = on || noteBusy;
  }
  function fullRow(id) {
    return Promise.race([
      req(SB + "/rest/v1/items?id=eq." + encodeURIComponent(id) + "&select=id,kind,data,updated_at", { cache: "no-store" })
        .then(function (r) { return r.json(); }).then(function (rows) { return (rows && rows[0]) || null; }),
      new Promise(function (res, rej) { setTimeout(function () { rej(new Error("tempo")); }, 8000); }),
    ]);
  }
  function loadDet(d) {
    var seq = ++detSeq;
    function here() { return seq === detSeq && editDem === d && $("#mDem").open; }
    fullRow(d.id).then(function (row) {
      var o = row && row.data;
      if (!here() || !o || typeof o !== "object" || (OPS[d.id] && !OPS[d.id].done)) return;
      var before = sig(d);
      ["desc", "notes", "media", "autorId", "autorNome"].forEach(function (k) { if (k in o) d[k] = o[k]; });
      d.media = (Array.isArray(d.media) ? d.media : []).filter(function (m) { return m && (m.src || m.url); });
      $("#dBy").hidden = !d.autorNome; $("#dBy").textContent = d.autorNome ? "Criado por " + d.autorNome : "";
      if (sig(d) !== before) renderBoard();
    }, function () {}).then(function () { if (here()) { fillDet(d); detUI(false); } });
  }
  $("#bNewDem").addEventListener("click", function () { openDem(null); });
  $("#dSave").addEventListener("click", function () { saveDem(); });
  $("#dTitle").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); saveDem(); } });
  function saveDem(force) {
    if (detBusy) return;
    if (!active() || demRO || (editDem && !canEditDem(editDem))) { if ($("#mDem").open && !demRO) toast(PERM); return; }
    var title = $("#dTitle").value.trim(), cid = $("#dClient").value;
    if (!title || !cid) { $("#dErr").textContent = "Preencha o título e o cliente."; return; }
    if (upN[draftId]) { $("#dErr").textContent = "Aguarde o envio dos arquivos terminar."; return; }
    var np = $("#dPost").value;
    if (force !== true && np && $("#dStatus").value !== "Standby" && $("#dStatus").value !== CAPT && (!editDem || wkStart(editDem.post) !== wkStart(np))) {
      var wn = weekCount(np, draftId);
      if (wn >= WEEK_MAX) { weekFull(wn, "#dPost", function () { saveDem(true); }); return; }
    }
    var data = { title: title, clientId: cid, type: $("#dType").value, desc: $("#dDesc").value.trim(), status: $("#dStatus").value, start: $("#dStart").value, post: $("#dPost").value, notes: draftNotes, media: draftMedia.slice() };
    var obj = editDem && S.demands.indexOf(editDem) > -1 ? editDem : S.demands.find(function (x) { return x.id === draftId; });
    if (obj) Object.assign(obj, data); else { obj = Object.assign({ id: draftId, autorId: ME.id, autorNome: ME.nome }, data); S.demands.push(obj); }
    put("demand", obj); $("#mDem").close(); renderAll(); say(editDem ? "Demanda atualizada." : "Demanda criada.");
  }
  $("#dDel").addEventListener("click", function () { if (editDem) delDem(editDem.id); });

  /* arquivos do conteúdo */
  var MEDIA_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="5.8" cy="6.3" r="1.1"/><path d="M2.5 12l3.8-3.6 2.4 2.2 2-1.8 2.8 2.7"/></svg>';
  var LINK_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2.2-2.2a2.6 2.6 0 0 0-3.7-3.7l-.9.9M9.2 6.8a2.6 2.6 0 0 0-3.7 0L3.3 9a2.6 2.6 0 0 0 3.7 3.7l.9-.9"/></svg>';
  var PLAY = '<span class="x-play" aria-hidden="true"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.2v9.6L13 8z"/></svg></span>';
  var X_ICON = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  var BIG = 50 * 1024 * 1024;
  function sa(s) { s = String(s || ""); return s.slice(0, 5) === "data:" ? s : esc(s); }
  function linkInfo(u) {
    var h = "", m;
    try { h = new URL(u).hostname.replace(/^www\./, ""); } catch (e) {}
    if ((m = u.match(/(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/)))
      return { type: "iframe", embed: "https://www.youtube.com/embed/" + m[1], thumb: "https://img.youtube.com/vi/" + m[1] + "/hqdefault.jpg", label: "YouTube" };
    if ((m = u.match(/vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/)?(\d+)/)))
      return { type: "iframe", embed: "https://player.vimeo.com/video/" + m[1], label: "Vimeo" };
    if ((m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || u.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/)))
      return { type: "iframe", embed: "https://drive.google.com/file/d/" + m[1] + "/preview", cls: "is-full", label: "Google Drive" };
    if ((m = u.match(/instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/)))
      return { type: "iframe", embed: "https://www.instagram.com/" + m[1] + "/" + m[2] + "/embed", cls: "is-tall", label: "Instagram" };
    var direct = u, label = /drive\.google|docs\.google/.test(h) ? "Google Drive" : /dropbox/.test(h) ? "Dropbox" : /instagram/.test(h) ? "Instagram" : h || "Link";
    if (/dropbox\.com$/.test(h)) direct = /[?&]dl=\d/.test(u) ? u.replace(/([?&])dl=\d/, "$1raw=1") : /[?&]raw=1/.test(u) ? u : u + (u.indexOf("?") > -1 ? "&" : "?") + "raw=1";
    var path = direct.split(/[?#]/)[0];
    if (/\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(path)) return { type: "image", embed: direct, thumb: direct, label: label };
    if (/\.(mp4|webm|mov|m4v|ogv)$/i.test(path)) return { type: "video", embed: direct, label: label };
    return { type: "none", label: label };
  }
  function tileInner(m) {
    if (m.kind === "image") return '<img src="' + sa(m.src) + '" alt="" loading="lazy" decoding="async" />';
    if (m.kind === "video") return '<video src="' + sa(m.src) + '" muted playsinline preload="metadata"></video>' + PLAY;
    var L = linkInfo(m.url);
    if (L.thumb) return '<img src="' + esc(L.thumb) + '" alt="" loading="lazy" decoding="async" />' + (L.type === "iframe" ? PLAY : "");
    if (L.type === "video") return '<video src="' + esc(L.embed) + '" muted playsinline preload="metadata"></video>' + PLAY;
    return LINK_ICON + '<span class="x-tl">' + esc(L.label) + "</span>";
  }
  function mLabel(m, i) {
    if (m.kind === "link") return "Link " + linkInfo(m.url).label;
    return (m.kind === "video" ? "Vídeo " : "Foto ") + (i + 1);
  }
  function cardMedia(d) {
    var M = d.media || [];
    if (!M.length) return "";
    var h = M.slice(0, 3).map(function (m, i) {
      return '<button type="button" data-lb="' + d.id + '" data-i="' + i + '" aria-label="Ver ' + esc(mLabel(m, i)) + '">' + tileInner(m) + "</button>";
    }).join("");
    if (M.length > 3) h += '<button type="button" class="x-plus" data-lb="' + d.id + '" data-i="3" aria-label="Ver mais ' + (M.length - 3) + ' arquivos">+' + (M.length - 3) + "</button>";
    return '<div class="x-cmed">' + h + "</div>";
  }
  function renderMedia() {
    $("#dGal").innerHTML = draftMedia.map(function (m, i) {
      return '<li><button class="x-tile" type="button" data-open="' + i + '" aria-label="Ver ' + esc(mLabel(m, i)) + '">' + tileInner(m) + "</button>" +
        (demRO || !active() ? "" : '<button class="x-rm" type="button" data-rm="' + i + '" aria-label="Remover ' + esc(mLabel(m, i)) + '">' + X_ICON + "</button>") + "</li>";
    }).join("");
  }
  function mediaNote(t, warn) { var n = $("#mNote"); n.textContent = t; n.classList.toggle("is-warn", !!warn); }
  $("#dGal").addEventListener("click", function (e) {
    var rm = e.target.closest("[data-rm]");
    if (rm && (demRO || !active())) return;
    if (rm) { draftMedia.splice(+rm.dataset.rm, 1); renderMedia(); mediaNote("Arquivo removido. Salve para confirmar."); return; }
    var op = e.target.closest("[data-open]");
    if (op) openLb(draftMedia, +op.dataset.open, $("#dTitle").value.trim());
  });
  /* fotos: reduzidas a 1600px JPEG 0.8; se não der para ler, sobe o original */
  function shrink(f) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight, s = Math.min(1, 1600 / Math.max(w, h, 1));
        var c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
        var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        try { c.toBlob(function (b) { res(b ? { blob: b, type: "image/jpeg", ext: "jpg" } : { blob: f, type: f.type }); }, "image/jpeg", 0.8); }
        catch (e) { res({ blob: f, type: f.type }); }
      };
      im.onerror = function () { URL.revokeObjectURL(u); res({ blob: f, type: f.type }); };
      im.src = u;
    });
  }
  function addFiles(files) {
    if (detBusy) return;
    if (!active() || demRO) { if (files && files.length) toast(PERM); return; }
    var permHit = false;
    var arr = [].slice.call(files || []).filter(function (f) { return /^(image|video)\//.test(f.type); });
    if (!arr.length) { if (files && files.length) mediaNote("Só fotos e vídeos são aceitos.", true); return; }
    var big = arr.filter(function (f) { return f.type.indexOf("video/") === 0 && f.size > BIG; });
    arr = arr.filter(function (f) { return big.indexOf(f) < 0; });
    var BIGMSG = "Vídeo acima de 50 MB não pode ser enviado: cole o link do Drive";
    if (big.length) toast(BIGMSG);
    if (!arr.length) { mediaNote(BIGMSG, true); return; }
    var did = draftId, loadedB = arr.map(function () { return 0; }), totalB = arr.map(function (f) { return f.size || 1; });
    upN[did] = (upN[did] || 0) + 1; upUI();
    function here() { return draftId === did && $("#mDem").open; }
    function pct() {
      if (!here()) return;
      var l = loadedB.reduce(function (a, b) { return a + b; }, 0), t = totalB.reduce(function (a, b) { return a + b; }, 0);
      mediaNote("Enviando " + arr.length + (arr.length > 1 ? " arquivos… " : " arquivo… ") + Math.min(99, Math.round((l / t) * 100)) + "%");
    }
    pct();
    Promise.all(arr.map(function (f, i) {
      var isImg = f.type.indexOf("image/") === 0;
      return (isImg ? shrink(f) : Promise.resolve({ blob: f, type: f.type })).then(function (r) {
        totalB[i] = r.blob.size || 1; pct();
        var path = did + "/" + stamp() + "-" + safeName(f.name, r.ext);
        return upload(path, r.blob, r.type, function (l, t) { loadedB[i] = l; totalB[i] = t || totalB[i]; pct(); }).then(function (url) {
          loadedB[i] = totalB[i];
          return { id: uid(), kind: isImg ? "image" : "video", src: url, path: path, name: f.name, size: r.blob.size };
        });
      }).catch(function (e) { if (isPerm(e)) permHit = true; return { fail: f.name }; });
    })).then(function (items) {
      upN[did]--; if (!upN[did]) delete upN[did];
      upUI();
      var ok = items.filter(function (x) { return !x.fail; }), bad = items.filter(function (x) { return x.fail; });
      if (bad.length) toast(permHit ? PERM : "Falha ao enviar " + bad.map(function (b) { return b.fail; }).join(", ") + " — verifique a conexão e tente de novo");
      if (!here()) return;
      ok.forEach(function (x) { draftMedia.push(x); });
      renderMedia();
      if (bad.length) mediaNote("Falha ao enviar " + bad.length + (bad.length > 1 ? " arquivos." : " arquivo.") + (ok.length ? " " + ok.length + " enviado(s). Salve para confirmar." : ""), true);
      else if (big.length) mediaNote(BIGMSG, true);
      else mediaNote(ok.length + (ok.length > 1 ? " arquivos enviados." : " arquivo enviado.") + " Salve para confirmar.");
    });
  }
  $("#mAddFiles").addEventListener("click", function () { $("#mFiles").click(); });
  $("#mFiles").addEventListener("change", function () { addFiles(this.files); this.value = ""; });
  var drop = $("#mDrop");
  ["dragenter", "dragover"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove("is-over"); }); });
  drop.addEventListener("drop", function (e) { e.preventDefault(); addFiles(e.dataTransfer && e.dataTransfer.files); });
  $("#mDem").addEventListener("dragover", function (e) { e.preventDefault(); });
  $("#mDem").addEventListener("drop", function (e) { if (!drop.contains(e.target)) { e.preventDefault(); addFiles(e.dataTransfer && e.dataTransfer.files); } });
  function addLink() {
    if (!active() || demRO || detBusy) return;
    var u = $("#mLink").value.trim();
    if (!u) { $("#mLink").focus(); return; }
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try { new URL(u); } catch (e) { mediaNote("Link inválido.", true); return; }
    draftMedia.push({ id: uid(), kind: "link", url: u });
    $("#mLink").value = ""; renderMedia();
    mediaNote("Link adicionado (" + linkInfo(u).label + "). Salve para confirmar.");
  }
  $("#mLinkAdd").addEventListener("click", addLink);
  $("#mLink").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addLink(); } });

  /* lightbox */
  var LB = { list: [], i: 0, title: "" };
  function openLb(list, i, title) {
    LB.list = list; LB.i = Math.max(0, Math.min(i, list.length - 1)); LB.title = title || "";
    lbRender(); $("#mLb").showModal(); $("#lbClose").focus();
  }
  function lbRender() {
    var m = LB.list[LB.i], n = LB.list.length, h, open = "";
    if (!m) return;
    if (m.kind === "image") h = '<img src="' + sa(m.src) + '" alt="' + esc(mLabel(m, LB.i)) + '" />';
    else if (m.kind === "video") h = '<video src="' + sa(m.src) + '" controls playsinline preload="metadata"></video>';
    else {
      var L = linkInfo(m.url); open = m.url;
      if (L.type === "iframe") h = '<iframe class="' + (L.cls || "") + '" src="' + esc(L.embed) + '" title="' + esc(L.label) + '" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>';
      else if (L.type === "image") h = '<img src="' + esc(L.embed) + '" alt="Imagem do link" />';
      else if (L.type === "video") h = '<video src="' + esc(L.embed) + '" controls playsinline preload="metadata"></video>';
      else h = '<div class="x-lbnone"><p>Sem pré-visualização para este link (' + esc(L.label) + ').</p><a class="x-cta" href="' + esc(m.url) + '" target="_blank" rel="noopener">Abrir link</a></div>';
    }
    $("#lbStage").innerHTML = h;
    $("#lbCount").textContent = (n > 1 ? LB.i + 1 + " / " + n + " · " : "") + (LB.title || mLabel(m, LB.i));
    $("#lbOpen").hidden = !open;
    if (open) $("#lbOpen").href = open; else $("#lbOpen").removeAttribute("href");
    $("#lbPrev").hidden = $("#lbNext").hidden = n < 2;
  }
  function lbGo(k) { var n = LB.list.length; if (n < 2) return; LB.i = (LB.i + k + n) % n; lbRender(); }
  $("#lbPrev").addEventListener("click", function () { lbGo(-1); });
  $("#lbNext").addEventListener("click", function () { lbGo(1); });
  $("#lbClose").addEventListener("click", function () { $("#mLb").close(); });
  $("#mLb").addEventListener("close", function () { $("#lbStage").innerHTML = ""; });
  $("#mLb").addEventListener("keydown", function (e) {
    if (e.target.tagName === "VIDEO") return;
    if (e.key === "ArrowLeft") { e.preventDefault(); lbGo(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); lbGo(1); }
  });
  $("#lbStage").addEventListener("click", function (e) { if (e.target === this) $("#mLb").close(); });
  var tx = null, ty = 0;
  $("#lbStage").addEventListener("touchstart", function (e) { if (e.touches.length !== 1) { tx = null; return; } tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  $("#lbStage").addEventListener("touchend", function (e) {
    if (tx == null) return;
    var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty; tx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) lbGo(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* calendar */
  var cur = new Date(); cur.setDate(1);
  var selDate = todayISO();
  function evs() { return S.events.filter(function (e) { return !fc || e.clientId === fc; }); }
  function dems() { return S.demands.filter(function (d) { return !fc || d.clientId === fc; }); }
  function byTime(a, b) { return (a.date + (a.start || "")).localeCompare(b.date + (b.start || "")); }
  var calDirty = true;
  function renderCal() {
    if ($("#p-cal").hidden) { calDirty = true; return; }
    calDirty = false;
    var y = cur.getFullYear(), m = cur.getMonth(), today = todayISO(), E = evs(), D = dems();
    $("#calTitle").textContent = MESES[m] + " " + y;
    var first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    var h = DIAS.map(function (d) { return '<div class="x-dow">' + d + "</div>"; }).join("");
    for (var i = 0; i < first; i++) h += '<div class="x-day is-out" aria-hidden="true"></div>';
    var wkc = {};
    for (var d = 1; d <= days; d++) {
      var iso = ymd(y, m, d), mk = "", n = 0, wk = wkStart(iso);
      if (!(wk in wkc)) wkc[wk] = weekCount(iso, "");
      var full = wkc[wk] >= WEEK_MAX;
      E.filter(function (e) { return e.date === iso; }).sort(byTime).forEach(function (e) {
        n++; mk += '<span class="x-mk is-event" data-ev="' + e.id + '" style="' + tv("cc", cli(e.clientId).color) + '" title="' + esc(e.kind + ": " + e.title) + '"><b>' + esc(e.start || "") + "</b> " + esc(e.title) + "</span>";
      });
      D.forEach(function (x) {
        var c = cli(x.clientId).color;
        if (x.start === iso) { n++; mk += '<span class="x-mk" data-dem="' + x.id + '" style="' + tv("cc", c) + '" title="Início: ' + esc(x.title) + '"><b>Início</b> ' + esc(x.title) + "</span>"; }
        if (x.post === iso) { n++; mk += '<span class="x-mk" data-dem="' + x.id + '" style="' + tv("cc", c) + '" title="Postagem: ' + esc(x.title) + '"><b>Postagem</b> ' + esc(x.title) + "</span>"; }
      });
      h += '<div class="x-day' + (iso === today ? " is-today" : "") + (iso === selDate ? " is-sel" : "") + (full ? " is-full" : "") + '" data-date="' + iso + '" role="button" tabindex="0" aria-pressed="' + (iso === selDate) + '" aria-label="' + d + " de " + MESES[m] + (n ? ", " + n + " itens" : "") + (full ? ", semana cheia" : "") + '"><span class="x-dn">' + d + '</span><span class="x-mks">' + mk + "</span></div>";
    }
    var tail = (7 - ((first + days) % 7)) % 7;
    for (var j = 0; j < tail; j++) h += '<div class="x-day is-out" aria-hidden="true"></div>';
    setHTML($("#cal"), h);
    if (setHTML($("#legend"), S.clients.filter(function (x) { return !fc || x.id === fc; }).map(function (x) { return cchip(cli(x.id)); }).join("") +
      '<span class="x-meta">● compromisso &nbsp; ○ início/postagem</span>' +
      '<span class="x-meta"><span class="x-fullkey" aria-hidden="true"></span>semana cheia (' + WEEK_MAX + '+ trabalhos)</span>')) hydrate($("#legend"));
    renderDay(); renderUpcoming();
  }
  function evItem(e) {
    var c = cli(e.clientId), p = e.date.split("-");
    var time = e.start ? e.start + (e.end ? "–" + e.end : "") : "";
    return '<li data-ev="' + e.id + '" tabindex="0"><div class="x-date" style="' + tv("cc", c.color) + '"><b>' + p[2] + "</b><small>" + MESES[+p[1] - 1].slice(0, 3) + " " + p[0] + "</small></div><div><h4>" + esc(e.title) + '</h4><div class="x-meta">' +
      badge(e.kind, c.color) + (e.clientId ? cchip(c) : "") + (time ? "<span>" + time + "</span>" : "") + (e.place ? "<span>" + esc(e.place) + "</span>" : "") + "</div></div>" +
      (staff() ? '<button class="x-del" type="button" data-delev="' + e.id + '">' + DEL_HTML + "</button>" : "") + "</li>";
  }
  function demItem(x, what) {
    var c = cli(x.clientId), p = selDate.split("-");
    return '<li data-dem="' + x.id + '" tabindex="0"><div class="x-date" style="' + tv("cc", c.color) + '"><b>' + p[2] + "</b><small>" + what + "</small></div><div><h4>" + esc(x.title) + '</h4><div class="x-meta">' +
      badge(x.status, stColor(x.status)) + cchip(c) + (x.type ? "<span>" + esc(x.type) + "</span>" : "") + "</div></div></li>";
  }
  function renderDay() {
    var p = selDate.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    $("#dayTitle").textContent = DIAS[dt.getDay()] + ", " + (+p[2]) + " de " + MESES[+p[1] - 1];
    setHint($("#dayHint"), loaded ? weekCount(selDate, "") : 0);
    var h = evs().filter(function (e) { return e.date === selDate; }).sort(byTime).map(evItem).join("");
    dems().forEach(function (x) {
      if (x.start === selDate) h += demItem(x, "Início");
      if (x.post === selDate) h += demItem(x, "Postagem");
    });
    if (setHTML($("#dayList"), !loaded ? '<li class="x-none"><p class="x-empty">' + (loadFailed ? "Sem conexão — tentando de novo…" : "Carregando…") + "</p></li>" : h || '<li class="x-none"><p class="x-empty">Nada marcado neste dia.</p></li>')) hydrate($("#dayList"));
  }
  function renderUpcoming() {
    var t = todayISO();
    var list = evs().filter(function (e) { return e.date >= t; }).sort(byTime).slice(0, 12);
    if (setHTML($("#upcoming"), !loaded ? '<li class="x-none"><p class="x-empty">Carregando…</p></li>' : list.length ? list.map(evItem).join("") : '<li class="x-none"><p class="x-empty">Nenhum compromisso agendado.</p></li>')) hydrate($("#upcoming"));
  }
  function pickDay(iso) { selDate = iso; renderCal(); }
  $("#cal").addEventListener("click", function (e) {
    var ev = e.target.closest("[data-ev]"), dm = e.target.closest("[data-dem]"), day = e.target.closest(".x-day[data-date]");
    if (ev && getComputedStyle(ev).pointerEvents !== "none") openEv(ev.dataset.ev);
    else if (dm && getComputedStyle(dm).pointerEvents !== "none") openDem(dm.dataset.dem);
    else if (day) pickDay(day.dataset.date);
  });
  $("#cal").addEventListener("keydown", function (e) {
    var day = e.target.closest(".x-day[data-date]");
    if (day && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pickDay(day.dataset.date); }
  });
  ["#dayList", "#upcoming"].forEach(function (id) {
    $(id).addEventListener("click", function (e) {
      var del = e.target.closest("[data-delev]"); if (del) { delEv(del.dataset.delev); return; }
      var li = e.target.closest("li[data-ev]"), dm = e.target.closest("li[data-dem]");
      if (li) openEv(li.dataset.ev); else if (dm) openDem(dm.dataset.dem);
    });
    $(id).addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.target.tagName !== "LI") return;
      if (e.target.dataset.ev) openEv(e.target.dataset.ev); else if (e.target.dataset.dem) openDem(e.target.dataset.dem);
    });
  });
  function moveMonth(k) { cur.setMonth(cur.getMonth() + k); selDate = ymd(cur.getFullYear(), cur.getMonth(), 1); renderCal(); }
  $("#bPrev").addEventListener("click", function () { moveMonth(-1); });
  $("#bNext").addEventListener("click", function () { moveMonth(1); });
  $("#bToday").addEventListener("click", function () { cur = new Date(); cur.setDate(1); selDate = todayISO(); renderCal(); });

  /* event modal */
  var editEv = null;
  $("#eKind").innerHTML = opts(KINDS, KINDS[0]);
  function openEv(id, date) {
    var e = id ? S.events.find(function (x) { return x.id === id; }) : null;
    var ro = !staff();
    if (!e && ro) return;
    editEv = e;
    fillClientSelects();
    $("#mEvT").textContent = e ? (ro ? "Compromisso" : "Editar compromisso") : "Novo compromisso";
    ["#eKind", "#eClient", "#eTitle", "#eDate", "#eStart", "#eEnd", "#ePlace", "#eObs"].forEach(function (s) { $(s).disabled = ro; });
    ["#eFixT", "#eFixO", "#eSave"].forEach(function (s) { $(s).hidden = ro; });
    $("#eCancel").textContent = ro ? "Fechar" : "Cancelar";
    $("#eKind").value = e ? e.kind : KINDS[0];
    $("#eTitle").value = e ? e.title : "";
    $("#eClient").value = e ? e.clientId || "" : fc;
    $("#eDate").value = e ? e.date : date || todayISO();
    $("#eStart").value = e ? e.start : "";
    $("#eEnd").value = e ? e.end : "";
    $("#ePlace").value = e ? e.place : "";
    $("#eObs").value = e ? e.obs : "";
    $("#eErr").textContent = "";
    $("#eDel").hidden = !e || ro;
    closeFix($("#mEv"));
    eHint();
    $("#mEv").showModal();
  }
  $("#bNewEv").addEventListener("click", function () { openEv(null, selDate); });
  $("#bNewDay").addEventListener("click", function () { openEv(null, selDate); });
  $("#eSave").addEventListener("click", function () { saveEv(); });
  ["#eTitle", "#ePlace"].forEach(function (id) {
    $(id).addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); saveEv(); } });
  });
  function saveEv(force) {
    if (!staff()) { if (ME) toast(PERM); return; }
    var title = $("#eTitle").value.trim(), date = $("#eDate").value, cid = $("#eClient").value;
    if (!title || !date) { $("#eErr").textContent = "Preencha o título e a data."; return; }
    if (force !== true && !isMeeting($("#eKind").value) && (!editEv || wkStart(editEv.date) !== wkStart(date))) {
      var wn = weekCount(date, editEv ? editEv.id : "");
      if (wn >= WEEK_MAX) { weekFull(wn, "#eDate", function () { saveEv(true); }); return; }
    }
    var data = { kind: $("#eKind").value, title: title, clientId: cid, date: date, start: $("#eStart").value, end: $("#eEnd").value, place: $("#ePlace").value.trim(), obs: $("#eObs").value.trim() };
    var obj = editEv && S.events.indexOf(editEv) > -1 ? editEv : editEv && S.events.find(function (x) { return x.id === editEv.id; });
    if (obj) Object.assign(obj, data); else { obj = Object.assign({ id: editEv ? editEv.id : uid() }, data); S.events.push(obj); }
    selDate = date; cur = new Date(+date.slice(0, 4), +date.slice(5, 7) - 1, 1);
    put("event", obj); $("#mEv").close(); renderAll(); say(editEv ? "Compromisso atualizado." : "Compromisso criado.");
  }
  $("#eDel").addEventListener("click", function () { if (editEv) delEv(editEv.id); });
  document.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });

  /* backup */
  $("#bExport").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "gestao-instagram-backup-" + todayISO() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    say("Backup exportado.");
  });
  $("#bImport").addEventListener("click", function () { if (!staff()) { toast(PERM); return; } say("Selecione o arquivo .json do backup…"); $("#fileIn").click(); });
  $("#fileIn").addEventListener("change", function () {
    var f = this.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        if (!Array.isArray(d.clients) || !Array.isArray(d.demands) || !Array.isArray(d.events)) throw 0;
      } catch (e) { say("Arquivo inválido."); return; }
      say("Importando backup e enviando arquivos…");
      ingest(d).then(function (fails) {
        say("Backup importado.");
        if (fails) toast(fails + " arquivo(s) do backup não puderam ser enviados — verifique a conexão e importe de novo.");
        else toast("Backup importado e salvo online.");
      });
    };
    r.readAsText(f); this.value = "";
  });

  /* ---------- assistente: limite semanal ---------- */
  var WEEK_MAX = 3;
  function wkStart(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
    var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return ymd(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function isMeeting(kind) { return /^reuni|meeting/i.test(String(kind || "")); }
  /* trabalhos da semana (seg–dom): demandas fora de Standby pela data de postagem + compromissos que não são reunião */
  function weekCount(iso, selfId) {
    var w = wkStart(iso), n = 0;
    if (!w) return 0;
    S.demands.forEach(function (d) { if (d.id !== selfId && d.status !== "Standby" && d.status !== CAPT && wkStart(d.post) === w) n++; });
    S.events.forEach(function (e) { if (e.id !== selfId && !isMeeting(e.kind) && wkStart(e.date) === w) n++; });
    return n;
  }
  function setHint(el, n) { el.hidden = n < WEEK_MAX; el.textContent = n >= WEEK_MAX ? "Semana cheia (" + n + " trabalhos)" : ""; }
  function dHint() { setHint($("#dPostHint"), weekCount($("#dPost").value, draftId)); }
  function eHint() { setHint($("#eDateHint"), weekCount($("#eDate").value, editEv ? editEv.id : "")); }
  ["input", "change"].forEach(function (t) { $("#dPost").addEventListener(t, dHint); $("#eDate").addEventListener(t, eHint); });
  var fullFn = null, fullFocus = null;
  function weekFull(n, focusSel, fn) {
    $("#fullTxt").textContent = "O marketing já tem muitas demandas nesta semana (" + n + " trabalhos) e não será possível pedir mais trabalhos para esta semana. Entre em contato com o marketing pelo WhatsApp (11) 95728-0596 para ver se é possível encaixar.";
    var ws = wkStart(focusSel && $(focusSel) ? $(focusSel).value : ""), range = "";
    if (ws) {
      var wp = ws.split("-"), a = new Date(+wp[0], +wp[1] - 1, +wp[2]), b = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 6);
      var dm = function (x) { return String(x.getDate()).padStart(2, "0") + "/" + String(x.getMonth() + 1).padStart(2, "0"); };
      range = dm(a) + " a " + dm(b);
    }
    var tEl = $(focusSel === "#eDate" ? "#eTitle" : "#dTitle"), tt = tEl ? tEl.value.trim() : "";
    var msg = "Olá! Quero pedir um trabalho para a semana " + (range ? "de " + range : "") + ", mas ela já está cheia no sistema. Dá para encaixar?" + (tt ? " Trabalho: " + tt : "");
    msg = msg.replace("semana ,", "semana,");
    $("#fullWa").href = "https://wa.me/5511957280596?text=" + encodeURIComponent(msg);
    fullFn = fn; fullFocus = focusSel;
    $("#mFull").showModal(); $("#fullPick").focus();
  }
  $("#fullPick").addEventListener("click", function () {
    var f = fullFocus; $("#mFull").close();
    setTimeout(function () { var el = f && $(f); if (el) { el.focus(); try { if (el.showPicker) el.showPicker(); } catch (e) {} } }, 0);
  });
  $("#fullSave").addEventListener("click", function () { if (!staff()) return; var f = fullFn; fullFn = null; $("#mFull").close(); if (f) f(); });
  $("#mFull").addEventListener("close", function () { fullFn = null; });

  /* ---------- assistente: avisos de prazo ---------- */
  function addDays(iso, k) { var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2] + k); return ymd(d.getFullYear(), d.getMonth(), d.getDate()); }
  function dayLabel(iso) { var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]); return DIAS[d.getDay()].toLowerCase() + " " + p[2] + "/" + p[1]; }
  function renderAvisos() {
    var L = $("#avList"), N = $("#avN");
    if (!loaded && !avOpen) { N.textContent = "…"; N.setAttribute("aria-label", "carregando"); return; }
    if (!loaded) { N.textContent = ""; setHTML(L, '<p class="x-empty">' + (loadFailed ? "Sem conexão — tentando de novo…" : "Carregando…") + "</p>"); return; }
    var t = todayISO(), lim = addDays(t, 3);
    var all = S.demands.filter(function (d) {
      return (!fc || d.clientId === fc) && d.post && d.status !== "Postado" && d.status !== "Standby" && d.status !== CAPT && d.post <= lim;
    }).sort(function (a, b) { return a.post.localeCompare(b.post); });
    N.textContent = all.length; N.setAttribute("aria-label", all.length + " avisos");
    /* fechado: só a contagem; a lista só existe no DOM enquanto o quadro está aberto */
    if (!avOpen) { if (L.firstChild) { L.innerHTML = ""; L._h = ""; } return; }
    if (!all.length) { setHTML(L, '<p class="x-empty">Nenhum prazo próximo ✓</p>'); return; }
    function line(d, late) {
      var c = cli(d.clientId);
      return '<button class="x-alert' + (late ? " is-late" : "") + '" type="button" data-dem="' + d.id + '" style="' + tv("cc", c.color) + '"><span><b>' + esc(d.title) + '</b><span class="x-meta"><span class="x-cchip x-cct" style="' + tv("cc", c.color) + '">' + esc(c.short) + "</span>" + (d.type ? "<span>" + esc(d.type) + "</span>" : "") + "</span></span><time datetime=\"" + d.post + '">' + dayLabel(d.post) + "</time></button>";
    }
    var G = [
      ["Atrasadas", "is-late", all.filter(function (d) { return d.post < t; }), true],
      ["Postar hoje", "", all.filter(function (d) { return d.post === t; }), false],
      ["Próximos 3 dias", "", all.filter(function (d) { return d.post > t; }), false],
    ];
    /* só os primeiros avShow avisos vão para o DOM; "Mostrar mais" acrescenta 5 */
    var budget = avShow;
    var html = G.filter(function (g) { return g[2].length; }).map(function (g) {
      if (budget <= 0) return "";
      var part = g[2].slice(0, budget); budget -= part.length;
      return '<p class="x-agh ' + g[1] + '">' + g[0] + " (" + g[2].length + ")</p>" + part.map(function (d) { return line(d, g[3]); }).join("");
    }).join("");
    var left = all.length - Math.min(avShow, all.length);
    if (left > 0) html += '<div class="x-more"><button class="x-btn" type="button" data-avmore>Mostrar mais ' + Math.min(AV_STEP, left) + " (" + left + " restantes)</button></div>";
    setHTML(L, html);
  }
  $("#avList").addEventListener("click", function (e) {
    if (e.target.closest("[data-avmore]")) {
      avShow += AV_STEP; renderAvisos();
      var nb = this.querySelector("[data-avmore]") || this.querySelector(".x-alert:last-of-type"); if (nb) nb.focus();
      return;
    }
    var b = e.target.closest("[data-dem]"); if (b) openDem(b.dataset.dem);
  });
  /* o quadro de avisos abre aberto, com os primeiros 5 */
  var AV_STEP = 5, avShow = AV_STEP, avOpen = true;
  $("#avHd").addEventListener("click", function () {
    avOpen = !avOpen; this.setAttribute("aria-expanded", avOpen ? "true" : "false");
    avShow = AV_STEP;
    $("#avList").hidden = !avOpen; renderAvisos();
  });

  /* ---------- assistente: correção de texto (LanguageTool) ---------- */
  var LT = "https://api.languagetool.org/v2/check";
  function closeFix(root) { root.querySelectorAll(".x-fix").forEach(function (b) { if (b._close) b._close(); }); }
  ["#mDem", "#mEv"].forEach(function (id) { $(id).addEventListener("close", function () { closeFix($(id)); }); });
  document.querySelectorAll(".x-fix").forEach(function (box) {
    var field = document.getElementById(box.dataset.fix), btn = box.querySelector(".x-fixbtn"), panel = box.querySelector(".x-fixpanel");
    var isTitle = box.hasAttribute("data-title"), st = { text: "", ms: [] };
    function close() { panel.hidden = true; panel.innerHTML = ""; st.ms = []; }
    box._close = close;
    function setVal(v) { field.value = v; st.text = v; field.dispatchEvent(new Event("input", { bubbles: true })); }
    function stale() { if (field.value === st.text) return false; close(); toast("O texto mudou — toque em Corrigir texto de novo."); return true; }
    function render() {
      if (!st.ms.length) { close(); return; }
      panel.innerHTML = '<div class="x-fixhead"><span>' + st.ms.length + (st.ms.length > 1 ? " sugestões" : " sugestão") + '</span><span class="x-fixacts"><button class="x-btn" type="button" data-all>Aplicar todas</button><button class="x-btn x-sq" type="button" data-x aria-label="Fechar correções">×</button></span></div>' +
        '<ul class="x-fixlist">' + st.ms.map(function (m, i) {
          var bad = st.text.substr(m.offset, m.length);
          return '<li><p><span class="x-fixbad">' + (bad.trim() ? esc(bad) : "␣") + "</span>" + esc(m.message) + '</p><div class="x-fixsug">' +
            (m.reps.length ? m.reps.map(function (v, j) {
              return '<button class="x-fixchip" type="button" data-i="' + i + '" data-j="' + j + '" aria-label="Trocar por ' + esc(v || "nada") + '">' + (v === "" ? "Remover" : v.trim() ? esc(v) : "␣") + "</button>";
            }).join("") : '<span class="x-empty">Sem sugestão automática</span>') + "</div></li>";
        }).join("") + "</ul>";
      panel.hidden = false;
    }
    function applyOne(i, j) {
      if (stale()) return;
      var m = st.ms[i], v = m.reps[j], end = m.offset + m.length, delta = v.length - m.length;
      var t = st.text.slice(0, m.offset) + v + st.text.slice(end);
      st.ms = st.ms.filter(function (x, k) { return k !== i && (x.offset + x.length <= m.offset || x.offset >= end); })
        .map(function (x) { if (x.offset >= end) x.offset += delta; return x; });
      setVal(t);
      if (st.ms.length) render(); else { close(); toast("Texto corrigido ✓"); }
    }
    function applyAll() {
      if (stale()) return;
      var t = st.text, lastStart = Infinity, n = 0;
      st.ms.slice().sort(function (a, b) { return b.offset - a.offset; }).forEach(function (m) {
        if (!m.reps.length || m.offset + m.length > lastStart) return;
        t = t.slice(0, m.offset) + m.reps[0] + t.slice(m.offset + m.length);
        lastStart = m.offset; n++;
      });
      setVal(t); close();
      toast(n ? n + (n > 1 ? " correções aplicadas ✓" : " correção aplicada ✓") : "Nenhuma sugestão para aplicar.");
    }
    panel.addEventListener("click", function (e) {
      var c = e.target.closest("[data-j]");
      if (c) { applyOne(+c.dataset.i, +c.dataset.j); return; }
      if (e.target.closest("[data-all]")) { applyAll(); return; }
      if (e.target.closest("[data-x]")) { close(); btn.focus(); }
    });
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      var text = field.value;
      if (!text.trim()) { toast("Escreva algo antes de corrigir."); field.focus(); return; }
      btn.disabled = true; btn.setAttribute("aria-busy", "true"); btn.textContent = "Verificando…";
      var body = new URLSearchParams(); body.set("text", text); body.set("language", "pt-BR");
      fetch(LT, { method: "POST", body: body })
        .then(okRes).then(function (r) { return r.json(); })
        .then(function (j) {
          st.text = text;
          st.ms = ((j && j.matches) || []).filter(function (m) {
            return m && m.offset >= 0 && m.offset + m.length <= text.length && !(isTitle && m.rule && m.rule.id === "UPPERCASE_SENTENCE_START");
          }).map(function (m) {
            return { offset: m.offset, length: m.length, message: m.message || m.shortMessage || "", reps: (m.replacements || []).slice(0, 3).map(function (r) { return String(r.value == null ? "" : r.value); }) };
          });
          if (!st.ms.length) { close(); toast("Nenhum erro encontrado ✓"); }
          else if (field.value !== text) { close(); toast("O texto mudou — toque em Corrigir texto de novo."); }
          else render();
        })
        .catch(function () { toast("Não consegui verificar agora, tente de novo"); })
        .then(function () { btn.disabled = false; btn.removeAttribute("aria-busy"); btn.textContent = "Corrigir texto ✨"; });
    });
  });

  /* ---------- assistente: roteiro e legenda (IA) ---------- */
  var AI_URL = "https://text.pollinations.ai/openai";
  var AI_SYS = 'Você é social media de instituições de ensino. Escreva em português do Brasil, tom adequado ao cliente. Não invente fatos, preços, promoções, aula grátis, nomes de pessoas, telefones nem endereços. Use apenas o que está no título e na descrição. Responda SOMENTE com JSON válido, sem markdown: {"roteiro": "...", "legenda": "..."}. O roteiro é simples, para vídeo vertical de 30 a 60 segundos, em cenas numeradas, cada uma com o que filmar e o texto na tela ou fala. A legenda tem 2 a 4 frases curtas, uma chamada final leve e 3 a 6 hashtags.';
  var AI_ERR = "A IA não respondeu agora, tente de novo em instantes.";
  var ai = { seq: 0, ctl: null, busy: false, lastText: "" };
  var CAP_RE = /(?:^|\n)[ \t]*LEGENDA[ \t]*:?[ \t]*\n/;
  function capOf(desc) {
    var s = String(desc || ""), m = CAP_RE.exec(s);
    return m ? s.slice(m.index + m[0].length).trim() : "";
  }
  function selectCap() {
    var f = $("#dDesc"), s = f.value, m = CAP_RE.exec(s);
    if (!m) return;
    var a = m.index + m[0].length, b = s.length;
    while (a < b && /\s/.test(s[a])) a++;
    while (b > a && /\s/.test(s[b - 1])) b--;
    f.focus(); try { f.setSelectionRange(a, b); } catch (e) {}
    toast("Legenda selecionada — copie com Ctrl+C (ou toque e segure em Copiar).");
  }
  function copyCap(desc, fallback) {
    var t = capOf(desc);
    if (!t) return;
    var p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject(new Error("sem clipboard"));
    p.then(function () { toast("Legenda copiada ✓"); }).catch(fallback);
  }
  function aiUI() {
    var btn = $("#aiGen");
    $("#aiSt").hidden = !ai.busy;
    btn.disabled = ai.busy || !$("#dTitle").value.trim();
    btn.setAttribute("aria-busy", ai.busy ? "true" : "false");
    btn.innerHTML = ai.busy ? '<span class="x-spin" aria-hidden="true"></span>Gerando…' : ai.lastText ? "Gerar de novo ✨" : "Gerar texto ✨";
    $("#dDesc").placeholder = ai.busy ? "✨ A IA está criando o roteiro…" : "";
    $("#aiCopy").hidden = !capOf($("#dDesc").value);
  }
  function aiStop() {
    ai.seq++;
    if (ai.ctl) { ai.ctl.quiet = true; ai.ctl.abort(); ai.ctl = null; }
    ai.busy = false;
  }
  function aiReset() { aiStop(); ai.lastText = ""; aiUI(); }
  function aiPrompt(title, useDesc) {
    var cid = $("#dClient").value, type = $("#dType").value;
    var c = cid ? cli(cid) : null, b = c ? BRAND[c.id] : null;
    var slides = type === "Carrossel" || type === "Designer";
    var desc = useDesc ? $("#dDesc").value.trim() : "";
    var notes = draftNotes.map(function (n) { return "- " + n.text; }).join("\n");
    return [
      "Cliente: " + (c ? c.name : "não informado") + (b && b.tone ? " (tom: " + b.tone + ")" : ""),
      "Tipo de conteúdo: " + (type || "não informado"),
      "Título: " + title,
      desc ? "Descrição atual:\n" + desc : "",
      notes ? "Observações da equipe:\n" + notes : "",
      "Data de postagem: " + ($("#dPost").value ? fmt($("#dPost").value) : "não definida"),
      slides ? 'Este conteúdo é um ' + type + ': no campo "roteiro", escreva o texto slide a slide (Slide 1, Slide 2…), em vez de cenas de vídeo.' : 'No campo "roteiro", escreva as cenas numeradas do vídeo vertical.'
    ].filter(Boolean).join("\n");
  }
  function aiParse(txt) {
    var s = String(txt || "").trim().replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```\s*$/, "").trim();
    var a = s.indexOf("{"), z = s.lastIndexOf("}");
    try {
      var j = JSON.parse(a > -1 && z > a ? s.slice(a, z + 1) : s);
      var r = j && j.roteiro != null ? String(j.roteiro).trim() : "", l = j && j.legenda != null ? String(j.legenda).trim() : "";
      if (r || l) return { roteiro: r, legenda: l };
    } catch (e) {}
    return { roteiro: s, legenda: "" };
  }
  function aiFormat(p) { return "ROTEIRO\n" + p.roteiro + (p.legenda ? "\n\nLEGENDA\n" + p.legenda : ""); }
  function aiRun() {
    var title = $("#dTitle").value.trim();
    if (!title) return;
    var useDesc = $("#dDesc").value.trim() && $("#dDesc").value !== ai.lastText;
    aiStop();
    var seq = ai.seq, did = draftId, ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 60000);
    ai.ctl = ctl; ai.busy = true; aiUI();
    fetch(AI_URL, { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
      body: JSON.stringify({ model: "openai", messages: [{ role: "system", content: AI_SYS }, { role: "user", content: aiPrompt(title, useDesc) }] }) })
      .then(okRes).then(function (r) { return r.json(); })
      .then(function (j) {
        if (seq !== ai.seq || did !== draftId || !$("#mDem").open) return;
        var txt = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        if (!txt || !String(txt).trim()) throw new Error("vazio");
        var f = $("#dDesc");
        f.value = aiFormat(aiParse(txt)); ai.lastText = f.value;
        f.dispatchEvent(new Event("input", { bubbles: true }));
        say("Roteiro e legenda criados pela IA.");
      })
      .catch(function () { if (!ctl.quiet && seq === ai.seq) toast(AI_ERR); })
      .then(function () { clearTimeout(to); if (seq === ai.seq) { ai.busy = false; ai.ctl = null; aiUI(); } });
  }
  /* o texto só é gerado quando a pessoa clica em "Gerar texto"; digitar o título não dispara a IA */
  $("#dTitle").addEventListener("input", aiUI);
  $("#dDesc").addEventListener("input", aiUI);
  $("#mDem").addEventListener("close", aiStop);
  $("#aiGen").addEventListener("click", function () {
    if (ai.busy || !$("#dTitle").value.trim()) return;
    var d = $("#dDesc").value;
    if (d.trim() && d !== ai.lastText) { $("#mAiConf").showModal(); return; }
    aiRun();
  });
  $("#aiConfNo").addEventListener("click", function () { $("#mAiConf").close(); });
  $("#aiConfYes").addEventListener("click", function () { $("#mAiConf").close(); aiRun(); });
  $("#aiCopy").addEventListener("click", function () { copyCap($("#dDesc").value, selectCap); });

  /* ---------- sessão: entrada e saída (a tela de login é a página login.html) ---------- */
  function unlock() {
    document.body.classList.remove("x-locked");
    document.documentElement.classList.remove("x-onlogin");
    window.scrollTo(0, 0);
  }
  function loadProfile(id) {
    return req(SB + "/rest/v1/usuario?id=eq." + encodeURIComponent(id) + "&select=*", { cache: "no-store" })
      .then(function (r) { return r.json(); }).then(function (rows) { return (rows && rows[0]) || null; });
  }
  function applyRole() {
    var r = ME ? ROLE : "visitante";
    $("#wName").textContent = ME ? ME.nome : "";
    $("#wName").hidden = !ME;
    $("#wRole").textContent = ROLE_L[r] || "";
    $("#bOut").textContent = ME ? "Sair" : "Fazer login";
    $("#bImport").hidden = !staff();
    $("#bNewDem").hidden = !active();
    $("#bExport").hidden = ROLE === "temporario";
    $("#bNewEv").hidden = $("#bNewDay").hidden = !staff();
    $("#fullSave").hidden = !staff();
    var adm = !!ME && ROLE === "adm";
    $("#tab-usr").hidden = !adm;
    if (!adm && !$("#p-usr").hidden) $("#tab-dem").click();
    /* a aba Usuários só é montada (e carregada) quando abre */
    if (adm && !$("#p-usr").hidden) { if (!usrLoaded) renderUsers(); loadUsers(); }
    else { USERS = []; usrLoaded = false; usrErr = false; $("#usrList").innerHTML = ""; }
    refresh();
    migrate();
  }
  /* acesso temporário: mostra o tempo restante e sai sozinho quando acaba */
  var expT = null;
  function leftText(ms) {
    var m = Math.max(0, Math.ceil(ms / 60000)), h = Math.floor(m / 60);
    return h ? h + "h" + (m % 60 ? " " + (m % 60) + "min" : "") : m + " min";
  }
  function expTick() {
    if (!ME || !ME.expira_em) return;
    var ms = Date.parse(ME.expira_em) - Date.now();
    if (ms <= 0) { clearInterval(expT); sb.auth.signOut(); Auth.toLogin("expirado"); return; }
    $("#wRole").textContent = "Temporário · " + leftText(ms);
  }
  function enter(p) {
    ME = p;
    ROLE = ROLE_L[p.funcao] && p.funcao !== "visitante" ? p.funcao : "comum";
    unlock(); applyRole();
    /* baixa os dados já com a sessão do usuário */
    loaded = false; loadFailed = false; lastSig = ""; SERVER_IDS = {};
    setSync("loading"); sync(true);
    clearInterval(expT);
    if (p.expira_em) { expTick(); expT = setInterval(expTick, 30000); }
    var hello = null;
    try { hello = sessionStorage.getItem("gestao_hello"); sessionStorage.removeItem("gestao_hello"); } catch (e) {}
    if (hello) say("Olá, " + hello + "!");
  }
  /* sessão perdida ou expirada: volta para a página de login */
  function sessionLost() { saveSession(null); ME = null; Auth.toLogin("expirada"); }
  $("#bOut").addEventListener("click", function () {
    var go = function () { sb.auth.signOut(); Auth.toLogin(); };
    if (pendingIds().length) { say("Salvando antes de sair…"); whenSaved().then(go); } else go();
  });
  /* saiu em outra aba (cookie apagado): esta aba também volta ao login */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && ME && !readStored()) sessionLost();
  });
  function restore() {
    var s = readStored();
    if (!s) { Auth.toLogin(); return; }
    saveSession(s);
    fresh().then(function () {
      if (!SESSION) return null;
      return loadProfile(SESSION.user && SESSION.user.id);
    }).then(function (pr) {
      if (pr && Auth.expired(pr)) { sb.auth.signOut(); Auth.toLogin("expirado"); }
      else if (pr) enter(pr);
      else if (SESSION) { sb.auth.signOut(); Auth.toLogin(); }
    }, function () { $("#boot").textContent = "Sem conexão — tentando de novo…"; setTimeout(restore, 5000); });
  }

  /* ---------- usuários (só adm) ---------- */
  var USERS = [], usrLoaded = false, usrErr = false, editUsr = null;
  var FUNC_C = { adm: "var(--chart-1)", marketing: "var(--chart-2)", comum: "var(--chart-muted)", temporario: "var(--fill-system-orange)" };
  $("#uDel").innerHTML = DEL_HTML;
  function loadUsers() {
    /* apaga os temporários vencidos antes de listar (se o script do banco ainda não foi rodado, ignora) */
    return sb.rpc("limpar_temporarios").then(function () {
      return req(SB + "/rest/v1/usuario?select=*&order=nome.asc", { cache: "no-store" });
    })
      .then(function (r) { return r.json(); })
      .then(function (rows) { USERS = Array.isArray(rows) ? rows : []; usrLoaded = true; usrErr = false; renderUsers(); }, function () { usrLoaded = true; usrErr = true; renderUsers(); });
  }
  function renderUsers() {
    var L = $("#usrList");
    if (!usrLoaded) { L.innerHTML = '<div class="x-blank" role="status"><p>Carregando…</p></div>'; return; }
    if (usrErr) { L.innerHTML = '<div class="x-blank"><p>Não consegui carregar os usuários.</p><button class="x-btn" type="button" data-ureload>Tentar de novo</button></div>'; return; }
    if (!USERS.length) { L.innerHTML = '<div class="x-blank"><p>Nenhum usuário ainda.</p></div>'; return; }
    L.innerHTML = USERS.map(function (u) {
      var me = ME && u.id === ME.id, tmp = u.funcao === "temporario";
      var left = tmp && u.expira_em ? Date.parse(u.expira_em) - Date.now() : 0;
      var extra = tmp ? "<span>" + (left > 0 ? "expira em " + leftText(left) : "expirado") + "</span>" : "";
      return '<article class="x-card" data-uid="' + esc(u.id) + '"' + (tmp ? ' data-tmp="1"' : "") + ' style="' + tv("cc", FUNC_C[u.funcao] || "var(--chart-muted)") + '" tabindex="0" aria-label="' + (tmp ? "Usuário temporário " : "Editar ") + esc(u.nome) + '">' +
        '<span class="x-thumb"><span class="x-av" style="--cc:#475569" aria-hidden="true">' + initials(u.nome || "?") + "</span></span>" +
        "<div><h4>" + esc(u.nome) + (me ? " (você)" : "") + '</h4><div class="x-meta"><span>' + esc(u.usuario) + "</span>" + badge(ROLE_L[u.funcao] || u.funcao, FUNC_C[u.funcao] || "var(--chart-muted)") + extra + "</div></div>" +
        '<div class="x-cact">' + (tmp ? "" : '<button class="x-btn" type="button" data-uedit>Editar</button>') + (me ? "" : '<button class="x-del" type="button" data-udel>' + DEL_HTML + "</button>") + "</div></article>";
    }).join("");
  }
  /* os prazos dos temporários andam sozinhos na lista */
  setInterval(function () { if (ME && ROLE === "adm" && usrLoaded && !usrErr && !$("#p-usr").hidden && USERS.some(function (u) { return u.funcao === "temporario"; })) renderUsers(); }, 60000);
  $("#usrList").addEventListener("click", function (e) {
    if (e.target.closest("[data-ureload]")) { usrLoaded = false; renderUsers(); loadUsers(); return; }
    var c = e.target.closest("[data-uid]"); if (!c) return;
    if (e.target.closest("[data-udel]")) { delUsr(c.dataset.uid); return; }
    if (c.dataset.tmp) return; /* temporário: só dá para encerrar o acesso */
    openUsr(c.dataset.uid);
  });
  $("#usrList").addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.dataset && e.target.dataset.uid && !e.target.dataset.tmp) openUsr(e.target.dataset.uid); });
  $("#bNewUsr").addEventListener("click", function () { openUsr(null); });
  function openUsr(id) {
    if (!ME || ROLE !== "adm") return;
    var u = id ? USERS.find(function (x) { return x.id === id; }) : null, self = !!u && u.id === ME.id;
    editUsr = u;
    $("#mUsrT").textContent = u ? "Editar usuário" : "Novo usuário";
    $("#uNome").value = u ? u.nome : "";
    $("#uUser").value = u ? u.usuario : "";
    $("#uUser").disabled = !!u;
    $("#uPass").value = ""; $("#uPass").type = "password";
    var eyeU = document.querySelector('.x-eye[data-pw="uPass"]'); eyeU.setAttribute("aria-pressed", "false"); eyeU.setAttribute("aria-label", "Mostrar senha");
    $("#uPass").placeholder = u ? "deixe em branco para manter" : "mínimo 6 caracteres";
    $("#uPassL").textContent = u ? "Nova senha" : "Senha*";
    $("#uFunc").value = u ? u.funcao : "comum";
    $("#uFunc").disabled = self;
    $("#uSelf").hidden = !self;
    $("#uDel").hidden = !u || self;
    $("#uErr").textContent = "";
    $("#mUsr").showModal();
  }
  function usrBusy(on) { $("#uSave").disabled = on; $("#uSave").textContent = on ? "Salvando…" : "Salvar"; }
  function saveUsr() {
    if (!ME || ROLE !== "adm" || $("#uSave").disabled) return;
    var u = editUsr, self = !!u && u.id === ME.id;
    var nome = $("#uNome").value.trim(), user = $("#uUser").value.toLowerCase().trim(), pass = $("#uPass").value, func = $("#uFunc").value;
    var err = !nome ? "Preencha o nome." :
      !u && !/^[a-z0-9._-]{2,}$/.test(user) ? "Usuário: use letras minúsculas, números, ponto, hífen ou sublinhado, sem espaços." :
      !u && pass.length < 6 ? "A senha precisa ter pelo menos 6 caracteres." :
      u && pass && pass.length < 6 ? "A nova senha precisa ter pelo menos 6 caracteres." : "";
    if (err) { $("#uErr").textContent = err; return; }
    $("#uErr").textContent = ""; usrBusy(true);
    var p = u
      ? sb.rpc("admin_atualizar_usuario", { p_id: u.id, p_nome: nome, p_funcao: self ? u.funcao : func, p_senha: pass || null })
      : sb.rpc("admin_criar_usuario", { p_nome: nome, p_usuario: user, p_senha: pass, p_funcao: func });
    p.then(function (res) {
      usrBusy(false);
      if (res.error) { var m = rpcMsg(res.error); $("#uErr").textContent = m; toast(m); return; }
      if (self) { ME.nome = nome; applyRole(); }
      $("#mUsr").close(); say(u ? "Usuário atualizado." : "Usuário criado."); loadUsers();
    });
  }
  $("#uSave").addEventListener("click", saveUsr);
  ["#uNome", "#uUser", "#uPass"].forEach(function (id) {
    $(id).addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); saveUsr(); } });
  });
  $("#uDel").addEventListener("click", function () { if (editUsr) delUsr(editUsr.id); });
  function delUsr(id) {
    var u = USERS.find(function (x) { return x.id === id; });
    if (!u || !ME || ROLE !== "adm") return;
    if (u.id === ME.id) { toast("Você não pode excluir o próprio usuário."); return; }
    ask(u.funcao === "temporario" ? "Encerrar o acesso temporário de " + u.nome + "?" : "Excluir o usuário " + u.nome + "?", function () {
      sb.rpc("admin_excluir_usuario", { p_id: u.id }).then(function (res) {
        if (res.error) { toast(rpcMsg(res.error)); return; }
        if ($("#mUsr").open) $("#mUsr").close();
        say("Usuário excluído."); loadUsers();
      });
    });
  }

  /* ---------- usuário temporário (só adm): só visualiza e some sozinho ---------- */
  var tmpInfo = "";
  function tmpBusy(on) { $("#tSave").disabled = on; $("#tSave").textContent = on ? "Criando…" : "Criar acesso"; }
  function openTmp() {
    if (!ME || ROLE !== "adm") return;
    $("#tUser").value = ""; $("#tHoras").value = "24"; $("#tErr").textContent = "";
    $("#tmpForm").hidden = false; $("#tmpDone").hidden = true;
    $("#tSave").hidden = false; tmpBusy(false); $("#tCancel").textContent = "Cancelar";
    $("#mTmp").showModal(); setTimeout(function () { $("#tUser").focus(); }, 0);
  }
  function saveTmp() {
    if (!ME || ROLE !== "adm" || $("#tSave").disabled) return;
    var user = $("#tUser").value.toLowerCase().trim(), horas = +$("#tHoras").value;
    if (!/^[a-z0-9._-]{3,50}$/.test(user)) { $("#tErr").textContent = "Usuário: de 3 a 50 caracteres — letras minúsculas, números, ponto, hífen ou sublinhado, sem espaços."; return; }
    $("#tErr").textContent = ""; tmpBusy(true);
    sb.rpc("admin_criar_temporario", { p_usuario: user, p_horas: horas }).then(function (res) {
      tmpBusy(false);
      var d = res.data;
      if (res.error || !d || !d.senha) {
        var m = res.error && res.error.status === 404 ? "Falta rodar o script usuario_temporario.sql no Supabase." : rpcMsg(res.error);
        $("#tErr").textContent = m; return;
      }
      var ate = fmtTs(Date.parse(d.expira_em));
      $("#tCredUser").textContent = d.usuario; $("#tCredPass").textContent = d.senha; $("#tCredTo").textContent = ate;
      tmpInfo = "Acesso temporário — Gestão de Conteúdo\nEndereço: " + location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "") + "\nUsuário: " + d.usuario + "\nSenha: " + d.senha + "\nVálido até: " + ate;
      $("#tmpForm").hidden = true; $("#tmpDone").hidden = false; $("#tSave").hidden = true; $("#tCancel").textContent = "Fechar";
      loadUsers();
    });
  }
  $("#bNewTmp").addEventListener("click", openTmp);
  $("#tSave").addEventListener("click", saveTmp);
  $("#tUser").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); saveTmp(); } });
  $("#tCopy").addEventListener("click", function () {
    var p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(tmpInfo) : Promise.reject(new Error("sem clipboard"));
    p.then(function () { toast("Dados copiados ✓"); }, function () { toast("Não consegui copiar — selecione e copie os dados na tela."); });
  });

  function renderAll() { renderBoard(); renderCal(); renderAvisos(); }
  fillClientSelects();
  applyTheme();
  renderChips();
  renderAll();
  restore();
})();