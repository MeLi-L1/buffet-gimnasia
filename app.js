(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const money = n => new Intl.NumberFormat("es-AR", {style:"currency", currency:"ARS", maximumFractionDigits:0}).format(Number(n)||0);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const today = new Date().toLocaleDateString("en-CA");
  $("#today").textContent = new Date().toLocaleDateString("es-AR", {day:"numeric", month:"long"});
  $('input[name="date"]').value = today;
  let db = null;
  let data = {tasks:[], posts:[], shopping:[], movements:[]};
  let localMode = true;
  const localKey = "buffet-gimnasia-2026-v1";
  let toastTimer;

  function toast(message) {
    const el=$("#toast"); el.textContent=message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
  }
  function saveLocal() { localStorage.setItem(localKey, JSON.stringify(data)); }
  function id() { return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random())); }
  function dateLabel(d) { if(!d) return ""; const x=new Date(d+"T12:00:00"); return x.toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit"}); }
  function sortNewest(a,b) { return String(b.created_at||"").localeCompare(String(a.created_at||"")); }
  function render() {
    const open=data.tasks.filter(x=>!x.done), done=data.tasks.filter(x=>x.done);
    const shoppingOpen=data.shopping.filter(x=>!x.done);
    $("#pending-count").textContent=open.length; $("#done-count").textContent=done.length;
    $("#shopping-count").textContent=shoppingOpen.length;
    $("#home-tasks").innerHTML=open.slice(0,4).map(t=>`<div class="compact-item"><span>○</span><div><strong>${esc(t.title)}</strong><small>${esc(t.person||"Sin responsable")}</small></div></div>`).join("") || '<p class="empty">¡No hay tareas pendientes!</p>';

    const filter=$("#task-filter").value;
    const visible=data.tasks.filter(t=>filter==="all"||(filter==="open"&&!t.done)||(filter==="done"&&t.done)).sort((a,b)=>Number(a.done)-Number(b.done));
    $("#task-summary").textContent=`${done.length} terminada${done.length===1?"":"s"} · ${open.length} pendiente${open.length===1?"":"s"}`;
    $("#task-list").innerHTML=visible.length?visible.map(t=>`<article class="list-item ${t.done?"is-done":""}">
      <button class="check ${t.done?"checked":""}" data-action="task-toggle" data-id="${esc(t.id)}" aria-label="Cambiar estado">${t.done?"✓":""}</button>
      <div class="item-main"><strong>${esc(t.title)}</strong><div class="item-meta">${t.person?`<span>👤 ${esc(t.person)}</span>`:""}</div></div>
      <button class="delete" data-action="task-delete" data-id="${esc(t.id)}" aria-label="Eliminar tarea">×</button>
    </article>`).join(""):'<div class="empty-state">No hay tareas en esta categoría.</div>';

    $("#post-list").innerHTML=data.posts.length?data.posts.slice().sort(sortNewest).map(p=>`<article class="post-card"><div class="post-avatar">${esc((p.person||"?").trim().charAt(0).toUpperCase())}</div><div class="post-content"><div class="post-top"><strong>${esc(p.person)}</strong><time>${new Date(p.created_at).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</time><button class="delete" data-action="post-delete" data-id="${esc(p.id)}" aria-label="Eliminar mensaje">×</button></div><p>${esc(p.message).replace(/\n/g,"<br>")}</p></div></article>`).join(""):'<div class="empty-state">Todavía no hay mensajes. ¡Inicien la conversación!</div>';

    $("#shopping-summary").textContent=`${shoppingOpen.length} pendiente${shoppingOpen.length===1?"":"s"} · ${data.shopping.length-shoppingOpen.length} conseguido${data.shopping.length-shoppingOpen.length===1?"":"s"}`;
    $("#shopping-list").innerHTML=data.shopping.length?data.shopping.slice().sort((a,b)=>Number(a.done)-Number(b.done)).map(p=>`<article class="list-item ${p.done?"is-done":""}"><button class="check ${p.done?"checked":""}" data-action="shopping-toggle" data-id="${esc(p.id)}" aria-label="Cambiar estado">${p.done?"✓":""}</button><div class="item-main"><strong>${esc(p.title)}</strong><div class="item-meta">${p.quantity?`<span>📦 ${esc(p.quantity)}</span>`:""}${p.person?`<span>👤 ${esc(p.person)}</span>`:""}</div></div><button class="delete" data-action="shopping-delete" data-id="${esc(p.id)}" aria-label="Eliminar producto">×</button></article>`).join(""):'<div class="empty-state">La lista está vacía por ahora.</div>';

    const records=data.movements.slice().sort(sortNewest);
    // Los registros antiguos de compras/gastos se conservan dentro de la lista directa.
    const direct=records.filter(m=>["direct","expense","personal","income","reimbursement"].includes(m.type));
    const consignment=records.filter(m=>m.type==="consignment");
    const renderRecord=m=>`<article class="movement-item">
      <div class="movement-icon ${m.type==="consignment"?"consignment":"personal"}">${m.type==="consignment"?"📦":"🛍️"}</div>
      <div class="item-main"><strong>${esc(m.title)}</strong>
        <div class="item-meta">${m.quantity?`<span>📌 ${esc(m.quantity)}</span>`:""}${m.person?`<span>· ${m.type==="consignment"?"Retiró":"Pagó"}: ${esc(m.person)}</span>`:""}${m.date?`<span>· ${dateLabel(m.date)}</span>`:""}</div>
        ${m.notes?`<small class="movement-notes">${esc(m.notes)}</small>`:""}
      </div>
      ${m.type!=="consignment"&&Number(m.amount)>0?`<strong class="amount personal">${money(m.amount)}</strong>`:""}
      <button class="delete" data-action="movement-delete" data-id="${esc(m.id)}" aria-label="Eliminar registro">×</button>
    </article>`;
    $("#direct-list").innerHTML=direct.length?direct.map(renderRecord).join(""):'<div class="empty-state">Todavía no hay compras o gastos registrados.</div>';
    $("#consignment-list").innerHTML=consignment.length?consignment.map(renderRecord).join(""):'<div class="empty-state">Todavía no hay mercadería a consignación registrada.</div>';
    $("#home-direct-count").textContent=direct.length;
    $("#home-consignment-count").textContent=consignment.length;
  }

  async function refresh() {
    if(!db) return;
    try {
      const {data:rows,error}=await db.from("buffet_items").select("*").order("created_at",{ascending:false});
      if(error) throw error;
      data={tasks:[],posts:[],shopping:[],movements:[]};
      rows.forEach(r=>{if(data[r.kind]) data[r.kind].push({...r.payload,id:r.id,created_at:r.created_at});});
      render();
    } catch(e) { console.error(e); toast("No se pudo actualizar. Revisá la conexión."); }
  }
  async function insert(kind,payload) {
  const record = {
    id: id(),
    kind,
    payload,
    created_at: new Date().toISOString()
  };

  if (db) {
    const {error} = await db.from("buffet_items").insert({
      id: record.id,
      kind,
      payload
    });

    if (error) {
      console.error(error);
      toast("No se pudo guardar. Revisá la configuración.");
      return false;
    }

    await refresh();

  } else {
    data[kind].push({
      ...payload,
      id: record.id,
      created_at: record.created_at
    });

    saveLocal();
    render();
  }

  return true;
}
  async function update(kind,itemId,patch) {
    if(db) {
      const current=data[kind].find(x=>x.id===itemId); if(!current)return;
      const {error}=await db.from("buffet_items").update({payload:{...current,...patch,id:undefined,created_at:undefined}}).eq("id",itemId);
      if(error){console.error(error);toast("No se pudo actualizar.");return;}
      await refresh();
    } else { const item=data[kind].find(x=>x.id===itemId); if(item){Object.assign(item,patch);saveLocal();render();} }
  }
  async function remove(kind,itemId) {
    if(!confirm("¿Querés eliminar este elemento?"))return;
    if(db) { const {error}=await db.from("buffet_items").delete().eq("id",itemId); if(error){console.error(error);toast("No se pudo eliminar.");return;} await refresh(); }
    else { data[kind]=data[kind].filter(x=>x.id!==itemId);saveLocal();render(); }
  }

  document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>showTab(btn.dataset.tab)));
  document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showTab(btn.dataset.go)));
  function showTab(name) {
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
    document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===`panel-${name}`));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  $("#task-filter").addEventListener("change",render);
  $("#task-form").addEventListener("submit", async e => {
  e.preventDefault();

  // Guardamos una referencia al formulario antes del await.
  const form = e.currentTarget;

  const f = new FormData(form);

  if (await insert("tasks", {
    title: f.get("title").trim(),
    person: f.get("person").trim(),
    done: false
  })) {
    form.reset();
    toast("Tarea agregada 💗");
  }
});
  $("#post-form").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);if(await insert("posts",{person:f.get("person").trim(),message:f.get("message").trim()})){e.currentTarget.reset();toast("Mensaje publicado 💬");}});
  $("#shopping-form").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);if(await insert("shopping",{title:f.get("title").trim(),quantity:f.get("quantity").trim(),person:f.get("person").trim(),done:false})){e.currentTarget.reset();toast("Producto agregado 🛒");}});
  function updateMovementFields() {
    const consignment=$("#movement-type").value==="consignment";
    $("#movement-amount-field").hidden=consignment;
    $("#movement-quantity-field").hidden=!consignment;
    $("#movement-amount-field input").required=!consignment;
    $("#movement-quantity-field input").required=consignment;
    $("#movement-hint").textContent=consignment
      ?"Anotá el producto, cuántos bultos retiraron y quién se encargó. No hace falta cargar el importe."
      :"Anotá qué se compró, cuánto costó y quién lo pagó.";
  }
  $("#movement-type").addEventListener("change",updateMovementFields);
  $("#movement-form").addEventListener("submit",async e=>{
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const type=f.get("type");
    const record={type,title:f.get("title").trim(),person:f.get("person").trim(),date:f.get("date"),notes:f.get("notes").trim()};
    if(type==="consignment") {
      record.quantity=f.get("quantity").trim();
      if(!record.quantity){toast("Ingresá la cantidad retirada.");return;}
    } else {
      record.amount=Number(f.get("amount"));
      if(!Number.isFinite(record.amount)||record.amount<=0){toast("Ingresá un importe válido.");return;}
    }
    if(await insert("movements",record)){
      e.currentTarget.reset();
      $('input[name="date"]').value=today;
      updateMovementFields();
      toast("Registro guardado 💗");
    }
  });
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-action]");if(!b)return;
    const {action,id:itemId}=b.dataset;
    if(action==="task-toggle"){const x=data.tasks.find(x=>x.id===itemId);if(x)update("tasks",itemId,{done:!x.done});}
    if(action==="task-delete")remove("tasks",itemId);
    if(action==="post-delete")remove("posts",itemId);
    if(action==="shopping-toggle"){const x=data.shopping.find(x=>x.id===itemId);if(x)update("shopping",itemId,{done:!x.done});}
    if(action==="shopping-delete")remove("shopping",itemId);
    if(action==="movement-delete")remove("movements",itemId);
  });

  function init() {
    const cfg=window.APP_CONFIG||{};
    if(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase) {
      db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
      localMode=false;
      $("#connection").classList.add("online");$("#connection span").textContent="Datos compartidos";
      refresh();
      db.channel("buffet-live").on("postgres_changes",{event:"*",schema:"public",table:"buffet_items"},refresh).subscribe();
    } else {
      try {
  const saved = localStorage.getItem(localKey);

  if (saved) {
    data = JSON.parse(saved);

    ["tasks", "posts", "shopping", "movements"].forEach(kind => {
      data[kind] = (data[kind] || []).map(item =>
        item.payload
          ? {...item.payload, id:item.id, created_at:item.created_at}
          : item
      );
    });
  }
} catch(e) {
  console.warn(e);
}
      $("#connection span").textContent="Modo de prueba · solo este dispositivo";
      render();
    }
  }
  updateMovementFields();
  init();
})();