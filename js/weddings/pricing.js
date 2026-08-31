
// ============================================================================
// WINDMILL FARM — WEDDINGS / PRICING
// Shared, editable wedding price lists stored in Supabase.
// ============================================================================

window.WeddingPricing = window.WeddingPricing || {
  tableReady:false,
  loaded:false,
  lists:[],
  activeCode:'',
  seed2026:{"label": "2026 Legacy Prices", "source": "2026 Wedding Brochure", "packages": {"Bespoke": {"price": 0, "includedDay": 0, "includedEvening": 0, "extraDay": 0, "extraEvening": 0, "extraDayChild": 0, "extraEveningChild": 0}, "Evergreen": {"price": 1995, "includedDay": 0, "includedEvening": 60, "extraDay": 0, "extraEvening": 15, "extraDayChild": 0, "extraEveningChild": 9.5}, "Blossom": {"price": 3999, "includedDay": 50, "includedEvening": 80, "extraDay": 49, "extraEvening": 15, "extraDayChild": 17.5, "extraEveningChild": 9.5}, "Willow": {"price": 4495.95, "includedDay": 50, "includedEvening": 80, "extraDay": 68, "extraEvening": 19.99, "extraDayChild": 31.5, "extraEveningChild": 12.5}}, "menus": {"None": 0, "Menu 1": 36, "Menu 2": 47, "Menu 3": 52, "Young Guests": 25}, "drinks": {"None": 0, "Silver": 12, "Gold": 17, "Platinum": 24}, "eveningFood": {"None": 0, "Finger Buffet": 14, "Chicken Platter": 20, "Indian Platter": 18, "Dessert Platter": 18, "Cheese Platter": 18, "Vegetarian Platter": 18, "Mediterranean Platter": 18, "Hog Roast Buffet": 16, "Hog Roast Bap": 14, "Barbecue": 15, "Curry": 11}, "extras": {"Canapés": 10, "Tea / Coffee": 4, "Afternoon Tea": 18, "Fruit Shoot": 2.75, "Hot Rolls": 10, "Breakfast Rolls": 6, "All Day Room Hire": 700, "Civil Ceremony": 200, "Afternoon Room Hire": 200, "Evening Room Hire": 300, "Resident Disco": 400, "Chair Covers & Sash": 4, "Balloon Trios": 18, "Balloon Arch": 240, "Balloon Bubbles": 40, "Top Table Swagging": 100, "Light Curtain": 150, "LOVE Letters / MR & MRS Sign": 180, "Table Centrepieces": 15, "Aisle Decor": 25, "Floral White Hexagon Backdrop": 100, "Aisle Arch": 40, "Wedding Garden Swing": 75, "Order of the Day Clock": 75, "Wedding Hotel Room incl. Breakfast": 95, "Sweet Cart": 60, "Mood Lighting": 12, "Chocolate Fountain": 450, "Wooden Background with Green Swagging": 150, "Bride & Groom Throne Chairs": 130}, "notes": {"Evergreen": "Based on 60 guests including married couple. Not available on Saturdays. Civil ceremony shown in brochure as £400 for this package.", "Blossom": "Based on 50 day guests and 80 evening guests. Civil ceremony can be added for £200.", "Willow": "Based on 50 day guests and 80 evening guests. Civil ceremony included within package."}}
};

WeddingPricing.codeForYear = year => String(year);
WeddingPricing.money = value => '£' + Number(value||0).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});

WeddingPricing.builtinLists=function(){
  const rows=[];
  // Preserve the existing 2027-2029 price structures already in the CRM.
  Object.keys(WEDDING_PRICING||{}).forEach(key=>{
    rows.push({
      code:String(key),
      year:Number(key),
      label:`${key} Prices`,
      active:true,
      legacy:false,
      data:JSON.parse(JSON.stringify(WEDDING_PRICING[key])),
      source:'Existing CRM pricing'
    });
  });
  if(!rows.some(row=>row.year===2026)){
    rows.unshift({
      code:'2026',
      year:2026,
      label:'2026 Legacy Prices',
      active:true,
      legacy:true,
      data:JSON.parse(JSON.stringify(WeddingPricing.seed2026)),
      source:'2026 Wedding Brochure'
    });
  }
  return rows;
};

WeddingPricing.applyToQuoteEngine=function(){
  WeddingPricing.lists.filter(row=>row.active!==false).forEach(row=>{
    const year=Number(row.year||row.code);
    if(Number.isFinite(year)&&row.data){
      WEDDING_PRICING[year]=JSON.parse(JSON.stringify(row.data));
    }
  });
};

WeddingPricing.load=async function(force=false){
  if(WeddingPricing.loaded&&!force)return WeddingPricing.lists;
  const fallback=WeddingPricing.builtinLists();
  try{
    const {data,error}=await supabaseClient
      .from('wedding_price_lists')
      .select('*')
      .order('price_year',{ascending:true});
    if(error)throw error;
    WeddingPricing.tableReady=true;
    WeddingPricing.lists=(data||[]).map(row=>({
      id:row.id,
      code:row.price_code||String(row.price_year),
      year:Number(row.price_year),
      label:row.label||`${row.price_year} Prices`,
      active:row.is_active!==false,
      legacy:!!row.is_legacy,
      source:row.source||'',
      data:row.pricing_data&&typeof row.pricing_data==='object'?row.pricing_data:{}
    }));

    // Always merge in any built-in price years that have not yet been saved
    // to Supabase. This prevents the Pricing Manager / Quote Builder from
    // showing only 2026 after the initial 2026 legacy seed is installed.
    const existingYears=new Set(WeddingPricing.lists.map(row=>Number(row.year)));
    fallback.forEach(row=>{
      if(!existingYears.has(Number(row.year))){
        WeddingPricing.lists.push(row);
      }
    });
    WeddingPricing.lists.sort((a,b)=>Number(a.year)-Number(b.year));
  }catch(error){
    console.warn('Wedding price lists table is not ready; using built-in pricing.',error);
    WeddingPricing.tableReady=false;
    WeddingPricing.lists=fallback;
  }
  WeddingPricing.loaded=true;
  WeddingPricing.applyToQuoteEngine();
  return WeddingPricing.lists;
};

WeddingPricing.availableYears=function(){
  const years=WeddingPricing.lists.filter(row=>row.active!==false).map(row=>Number(row.year)).filter(Number.isFinite);
  return [...new Set(years)].sort((a,b)=>a-b);
};

WeddingPricing.get=function(year){
  return WeddingPricing.lists.find(row=>Number(row.year)===Number(year)) ||
    {year:Number(year),label:`${year} Prices`,data:WEDDING_PRICING[year]||{packages:{},menus:{},drinks:{},eveningFood:{},extras:{}}};
};


WeddingPricing.persistMissingBuiltins=async function(){
  if(!WeddingPricing.tableReady){
    toast('Run the Wedding Pricing SQL first','error');
    return;
  }
  const builtins=WeddingPricing.builtinLists();
  const savedYears=new Set(
    WeddingPricing.lists.filter(row=>row.id).map(row=>Number(row.year))
  );
  const missing=builtins.filter(row=>!savedYears.has(Number(row.year)));
  if(!missing.length){
    toast('All built-in price lists are already saved');
    return;
  }

  const records=missing.map(row=>({
    price_code:String(row.code),
    price_year:Number(row.year),
    label:row.label,
    is_active:row.active!==false,
    is_legacy:!!row.legacy,
    source:row.source||null,
    pricing_data:row.data
  }));

  const {error}=await supabaseClient.from('wedding_price_lists').upsert(records,{onConflict:'price_code'});
  if(error){
    console.error(error);
    toast('Could not save the missing price lists','error');
    return;
  }
  WeddingPricing.loaded=false;
  await WeddingPricing.load(true);
  toast('2027, 2028 and 2029 pricing saved to Supabase');
  WeddingPricing.renderManager();
};

WeddingPricing.openManager=async function(){
  await WeddingPricing.load(true);
  WeddingPricing.activeCode=WeddingPricing.activeCode || WeddingPricing.lists[0]?.code || '';
  WeddingPricing.renderManager();
};

WeddingPricing.renderManager=function(){
  const current=WeddingPricing.lists.find(row=>row.code===WeddingPricing.activeCode)||WeddingPricing.lists[0];
  openModal(`<div class="wp-manager">
    <header class="wp-header">
      <div>
        <p class="wp-eyebrow">WEDDING PRICING</p>
        <h2>Wedding Pricing Manager</h2>
        <p>Create and maintain price lists without changing JavaScript. Existing saved quote versions keep their original totals.</p>
      </div>
      <div class="flex items-center gap-2">
        ${WeddingPricing.tableReady?`<button onclick="WeddingPricing.persistMissingBuiltins()" class="wp-sync-builtins"><i data-lucide="database"></i>Save Built-in Years</button>`:''}
        <button onclick="closeModal()" class="wp-close"><i data-lucide="x"></i></button>
      </div>
    </header>

    <div class="wp-manager-body">
      <aside class="wp-list-panel">
        <div class="wp-list-title"><strong>Price Lists</strong><button onclick="WeddingPricing.openCreateList()"><i data-lucide="plus"></i>New</button></div>
        <div class="wp-list">
          ${WeddingPricing.lists.map(row=>`<button onclick="WeddingPricing.activeCode='${row.code}';WeddingPricing.renderManager()" class="${current?.code===row.code?'active':''}">
            <span><strong>${esc(row.label)}</strong><small>${row.legacy?'Legacy · ':''}${row.active?'Active':'Inactive'}</small></span>
            <em>${row.year}</em>
          </button>`).join('')}
        </div>
        ${WeddingPricing.tableReady?'':`<div class="wp-warning"><strong>Supabase setup required</strong><span>Pricing is usable, but edits will not be shared until the supplied SQL is run.</span></div>`}
      </aside>

      <main class="wp-editor-panel">
        ${current?WeddingPricing.renderEditor(current):'<div class="wp-empty">Create your first price list.</div>'}
      </main>
    </div>
  </div>`);
  WeddingPricing.resizeModal();
  if(window.lucide)lucide.createIcons();
};

WeddingPricing.resizeModal=function(){
  const content=document.getElementById('modal-content');
  const overlay=document.getElementById('modal-overlay');
  if(overlay){overlay.classList.remove('p-4');overlay.classList.add('p-2','lg:p-5');}
  if(content)content.className='bg-white rounded-3xl shadow-2xl w-[96vw] max-w-[1600px] h-[92vh] max-h-[92vh] overflow-hidden';
};

WeddingPricing.renderEditor=function(list){
  const data=list.data||{};
  return `<div class="wp-editor">
    <div class="wp-editor-head">
      <div><p class="wp-eyebrow olive">${list.legacy?'LEGACY PRICE LIST':'PRICE LIST'}</p><h3>${esc(list.label)}</h3><p>${esc(list.source||'Managed in CRM')}</p></div>
      <div class="wp-editor-actions">
        <button onclick="WeddingPricing.duplicate('${list.code}')"><i data-lucide="copy"></i>Duplicate</button>
        <button class="primary" onclick="WeddingPricing.saveCurrent('${list.code}')"><i data-lucide="save"></i>Save Changes</button>
      </div>
    </div>

    <div class="wp-meta-grid">
      <label>Display Name<input id="wp-label" value="${esc(list.label)}"></label>
      <label>Price Year<input id="wp-year" type="number" min="2020" max="2100" value="${list.year}"></label>
      <label>Source<input id="wp-source" value="${esc(list.source||'')}"></label>
      <label class="wp-check"><input id="wp-active" type="checkbox" ${list.active?'checked':''}> Active for new quotes</label>
    </div>

    <section class="wp-section">
      <div class="wp-section-head"><div><h4>Packages</h4><p>Base package price, included guests and additional guest rates.</p></div><button onclick="WeddingPricing.addPackage('${list.code}')">+ Package</button></div>
      <div class="wp-table-wrap"><table class="wp-table">
        <thead><tr><th>Package</th><th>Base</th><th>Day Included</th><th>Evening Included</th><th>Adult Day Extra</th><th>Child Day Extra</th><th>Adult Eve Extra</th><th>Child Eve Extra</th><th></th></tr></thead>
        <tbody>${Object.entries(data.packages||{}).map(([name,p],index)=>`<tr>
          <td><input data-package-name="${index}" value="${esc(name)}"></td>
          <td><input data-package="${index}" data-field="price" type="number" step=".01" value="${Number(p.price||0)}"></td>
          <td><input data-package="${index}" data-field="includedDay" type="number" value="${Number(p.includedDay||0)}"></td>
          <td><input data-package="${index}" data-field="includedEvening" type="number" value="${Number(p.includedEvening||0)}"></td>
          <td><input data-package="${index}" data-field="extraDay" type="number" step=".01" value="${Number(p.extraDay||0)}"></td>
          <td><input data-package="${index}" data-field="extraDayChild" type="number" step=".01" value="${Number(p.extraDayChild||0)}"></td>
          <td><input data-package="${index}" data-field="extraEvening" type="number" step=".01" value="${Number(p.extraEvening||0)}"></td>
          <td><input data-package="${index}" data-field="extraEveningChild" type="number" step=".01" value="${Number(p.extraEveningChild||0)}"></td>
          <td><button onclick="WeddingPricing.removePackage('${list.code}','${encodeURIComponent(name)}')" title="Remove"><i data-lucide="trash-2"></i></button></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </section>

    ${WeddingPricing.renderSimpleCategory('Wedding Breakfast / Menus','menus',data.menus||{},list.code)}
    ${WeddingPricing.renderSimpleCategory('Drinks Packages','drinks',data.drinks||{},list.code)}
    ${WeddingPricing.renderSimpleCategory('Evening Food','eveningFood',data.eveningFood||{},list.code)}
    ${WeddingPricing.renderSimpleCategory('Venue, Décor & Extras','extras',data.extras||{},list.code)}

    <section class="wp-section">
      <div class="wp-section-head"><div><h4>Package Notes</h4><p>Useful restrictions or inclusions that should not be forgotten.</p></div></div>
      <div class="wp-notes-grid">${Object.keys(data.packages||{}).filter(name=>name!=='Bespoke').map(name=>`<label><span>${esc(name)}</span><textarea data-package-note="${encodeURIComponent(name)}" rows="3">${esc(data.notes?.[name]||'')}</textarea></label>`).join('')}</div>
    </section>
  </div>`;
};

WeddingPricing.renderSimpleCategory=function(title,key,items,code){
  return `<section class="wp-section">
    <div class="wp-section-head"><div><h4>${title}</h4><p>Prices are per person unless the item name makes another basis clear.</p></div><button onclick="WeddingPricing.addSimpleItem('${code}','${key}')">+ Item</button></div>
    <div class="wp-simple-grid">
      ${Object.entries(items).map(([name,value],index)=>`<div class="wp-simple-row">
        <input data-simple-name="${key}" data-index="${index}" value="${esc(name)}">
        <div class="wp-money-input"><span>£</span><input data-simple-value="${key}" data-index="${index}" type="number" step=".01" value="${Number(value||0)}"></div>
        <button onclick="WeddingPricing.removeSimpleItem('${code}','${key}','${encodeURIComponent(name)}')"><i data-lucide="trash-2"></i></button>
      </div>`).join('')}
    </div>
  </section>`;
};

WeddingPricing.collectEditor=function(list){
  const next={packages:{},menus:{},drinks:{},eveningFood:{},extras:{},notes:{}};

  const packageNames=[...document.querySelectorAll('[data-package-name]')];
  packageNames.forEach((input,index)=>{
    const name=input.value.trim();
    if(!name)return;
    const packageData={};
    document.querySelectorAll(`[data-package="${index}"]`).forEach(field=>packageData[field.dataset.field]=Number(field.value||0));
    next.packages[name]=packageData;
  });

  ['menus','drinks','eveningFood','extras'].forEach(key=>{
    const names=[...document.querySelectorAll(`[data-simple-name="${key}"]`)];
    names.forEach((input,index)=>{
      const name=input.value.trim();
      const value=document.querySelector(`[data-simple-value="${key}"][data-index="${index}"]`);
      if(name)next[key][name]=Number(value?.value||0);
    });
  });

  document.querySelectorAll('[data-package-note]').forEach(area=>{
    const name=decodeURIComponent(area.dataset.packageNote||'');
    if(name&&area.value.trim())next.notes[name]=area.value.trim();
  });

  return {
    label:document.getElementById('wp-label')?.value.trim()||list.label,
    year:Number(document.getElementById('wp-year')?.value||list.year),
    source:document.getElementById('wp-source')?.value.trim()||'',
    active:!!document.getElementById('wp-active')?.checked,
    data:next
  };
};

WeddingPricing.saveCurrent=async function(code){
  const list=WeddingPricing.lists.find(row=>row.code===code);
  if(!list)return;
  const edited=WeddingPricing.collectEditor(list);
  list.label=edited.label;list.year=edited.year;list.source=edited.source;list.active=edited.active;list.data=edited.data;

  if(!WeddingPricing.tableReady){
    WeddingPricing.applyToQuoteEngine();
    toast('Saved for this browser session. Run the pricing SQL to share changes.','error');
    WeddingPricing.renderManager();
    return;
  }

  const record={
    price_code:list.code,
    price_year:list.year,
    label:list.label,
    is_active:list.active,
    is_legacy:!!list.legacy,
    source:list.source||null,
    pricing_data:list.data
  };
  const query=list.id
    ? supabaseClient.from('wedding_price_lists').update(record).eq('id',list.id)
    : supabaseClient.from('wedding_price_lists').insert(record).select().single();
  const {data,error}=await query;
  if(error){console.error(error);toast('Price list could not be saved','error');return;}
  if(data?.id)list.id=data.id;
  WeddingPricing.applyToQuoteEngine();
  toast('Wedding price list saved');
  WeddingPricing.renderManager();
};

WeddingPricing.openCreateList=function(){
  const suggested=Math.max(2026,...WeddingPricing.lists.map(row=>Number(row.year)||0))+1;
  const source=WeddingPricing.lists.slice().sort((a,b)=>b.year-a.year)[0];
  WeddingPricing.lists.push({
    code:`custom-${Date.now()}`,
    year:suggested,
    label:`${suggested} Prices`,
    active:true,
    legacy:false,
    source:'Created in CRM',
    data:source?JSON.parse(JSON.stringify(source.data)):{packages:{Bespoke:{price:0,includedDay:0,includedEvening:0,extraDay:0,extraEvening:0}},menus:{None:0},drinks:{None:0},eveningFood:{None:0},extras:{},notes:{}}
  });
  WeddingPricing.activeCode=WeddingPricing.lists.at(-1).code;
  WeddingPricing.renderManager();
};

WeddingPricing.duplicate=function(code){
  const source=WeddingPricing.lists.find(row=>row.code===code);
  if(!source)return;
  const year=Number(source.year)+1;
  const row={
    code:`custom-${Date.now()}`,year,label:`${year} Prices`,active:true,legacy:false,
    source:`Duplicated from ${source.label}`,data:JSON.parse(JSON.stringify(source.data))
  };
  WeddingPricing.lists.push(row);WeddingPricing.activeCode=row.code;WeddingPricing.renderManager();
};

WeddingPricing.addPackage=function(code){
  const list=WeddingPricing.lists.find(row=>row.code===code);if(!list)return;
  list.data.packages=list.data.packages||{};
  let name='New Package',n=2;while(list.data.packages[name])name=`New Package ${n++}`;
  list.data.packages[name]={price:0,includedDay:0,includedEvening:0,extraDay:0,extraDayChild:0,extraEvening:0,extraEveningChild:0};
  WeddingPricing.renderManager();
};
WeddingPricing.removePackage=function(code,encoded){
  const list=WeddingPricing.lists.find(row=>row.code===code);if(!list)return;
  const name=decodeURIComponent(encoded);if(name==='Bespoke')return toast('Keep Bespoke as the zero-price custom option','error');
  delete list.data.packages[name];WeddingPricing.renderManager();
};
WeddingPricing.addSimpleItem=function(code,key){
  const list=WeddingPricing.lists.find(row=>row.code===code);if(!list)return;
  list.data[key]=list.data[key]||{};
  let name='New Item',n=2;while(Object.prototype.hasOwnProperty.call(list.data[key],name))name=`New Item ${n++}`;
  list.data[key][name]=0;WeddingPricing.renderManager();
};
WeddingPricing.removeSimpleItem=function(code,key,encoded){
  const list=WeddingPricing.lists.find(row=>row.code===code);if(!list)return;
  delete list.data[key][decodeURIComponent(encoded)];WeddingPricing.renderManager();
};

WeddingPricing.renderWeddingFinancialSummary=function(w){
  const latest=(DB.weddingQuotes||[]).filter(q=>q.weddingId===w.id).sort((a,b)=>b.version-a.version)[0];
  const year=latest?.priceYear || Number(String(w.date||'').slice(0,4)) || 2027;
  const list=WeddingPricing.get(year);
  const paid=Number(w.paid||0),total=Number(w.quotedValue||0),balance=Math.max(0,total-paid);
  return `<div class="wp-wedding-financials">
    <div class="wp-fin-head">
      <div><p class="wp-eyebrow olive">PRICING & FINANCIALS</p><h3>Wedding commercial position</h3></div>
      <button onclick="WeddingPricing.openManager()"><i data-lucide="settings"></i>Manage Price Lists</button>
    </div>
    <div class="wp-fin-grid">
      <article><small>Pricing Version</small><strong>${esc(list?.label||year+' Prices')}</strong><span>${latest?'Based on latest saved quote':'Based on wedding year'}</span></article>
      <article><small>Quoted Value</small><strong>${WeddingPricing.money(total)}</strong><span>${esc(w.package||'Package TBC')}</span></article>
      <article><small>Paid</small><strong>${WeddingPricing.money(paid)}</strong><span>${total?Math.round(paid/total*100):0}% collected</span></article>
      <article class="${balance?'warning':'good'}"><small>Outstanding</small><strong>${WeddingPricing.money(balance)}</strong><span>${balance?'Still to collect':'Fully paid'}</span></article>
    </div>
    <div class="wp-fin-actions"><button onclick="setWeddingTab('quote')" class="primary">Open Quote Builder</button><button onclick="setWeddingTab('payments')">Open Payments</button></div>
  </div>`;
};

// Override the quote builder so the year list comes from Pricing Manager.
const _legacyRenderWeddingQuoteBuilder = window.renderWeddingQuoteBuilder;
window.renderWeddingQuoteBuilder=function(w){
  if(!weddingQuoteTablesReady)return _legacyRenderWeddingQuoteBuilder(w);
  const d=activeQuoteDraft(w);
  const years=WeddingPricing.availableYears();
  if(!years.includes(Number(d.priceYear)))d.priceYear=years.includes(Number(String(w.date||'').slice(0,4)))?Number(String(w.date||'').slice(0,4)):(years[0]||2027);
  const pricing=WEDDING_PRICING[d.priceYear]||WEDDING_PRICING[years[0]];
  const calc=calculateWeddingQuote(d),history=quotesForWedding(w.id);
  return `<div class="space-y-3">
    <div class="wp-quote-banner">
      <div><p class="wp-eyebrow">PRICE CONTROL</p><h3>${esc(WeddingPricing.get(d.priceYear)?.label||d.priceYear+' Prices')}</h3><p>Saved quote versions keep their original totals. Changing a price list only affects new calculations.</p></div>
      <button onclick="WeddingPricing.openManager()"><i data-lucide="settings"></i>Manage Price Lists</button>
    </div>
    <div class="grid xl:grid-cols-[1fr_340px] gap-5"><div class="space-y-4">
      <div class="bg-white border border-olive-100 rounded-xl p-5"><div class="flex justify-between items-start gap-3 mb-4"><div><h3 class="font-bold text-lg">Quote Builder</h3><p class="text-sm text-gray-500">Choose the correct price list for this booking. Do not reprice an existing contract unless intended.</p></div><span class="badge bg-olive-100 text-olive-800">${d.priceYear}</span></div>
      <div class="grid sm:grid-cols-2 gap-3">
        <label class="text-xs font-medium text-gray-600">Price List<select id="quote-year" onchange="updateQuoteField('priceYear',Number(this.value),true)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${years.map(y=>`<option value="${y}" ${Number(d.priceYear)===y?'selected':''}>${esc(WeddingPricing.get(y)?.label||String(y))}</option>`).join('')}</select></label>
        <label class="text-xs font-medium text-gray-600">Package<select id="quote-package" onchange="updateQuoteField('packageName',this.value,true)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${quoteSelectOptions(pricing.packages,d.packageName)}</select></label>
      </div>
      <div class="grid lg:grid-cols-2 gap-3 mt-4">${quoteGuestSplitCard('day',d,calc.pkg)}${quoteGuestSplitCard('evening',d,calc.pkg)}</div></div>
      ${quoteChoiceCard('Wedding Breakfast','menu',pricing.menus,d.menu,d.menuIncluded,'day guests')}
      ${quoteChoiceCard('Drinks Package','drinks',pricing.drinks,d.drinks,d.drinksIncluded,'day guests')}
      ${quoteChoiceCard('Evening Food','eveningFood',pricing.eveningFood,d.eveningFood,d.eveningFoodIncluded,'evening guests')}
      <div class="bg-white border border-olive-100 rounded-xl p-5"><div class="flex justify-between items-center mb-3"><div><h3 class="font-bold">Décor & Extras</h3><p class="text-xs text-gray-500">Standard prices come from the selected price list.</p></div><div class="flex gap-2"><select id="quote-extra-select" class="px-3 py-2 border rounded-lg text-sm"><option value="">Choose extra...</option>${Object.entries(pricing.extras||{}).map(([n,v])=>`<option value="${esc(n)}">${esc(n)} — ${money(v)}</option>`).join('')}</select><button onclick="addQuoteExtra()" class="px-3 py-2 bg-olive-600 text-white rounded-lg text-sm">Add</button></div></div>${renderQuoteEditableLines(d.extras,'extra')}</div>
      <div class="bg-white border border-olive-100 rounded-xl p-5"><div class="flex justify-between items-center mb-3"><div><h3 class="font-bold">Custom Items / Overrides</h3><p class="text-xs text-gray-500">Use for bespoke agreements, manual credits or an agreed historic price.</p></div><button onclick="addCustomQuoteItem()" class="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm">+ Custom Line</button></div>${renderQuoteEditableLines(d.customItems,'custom')}</div>
      <div class="bg-white border border-olive-100 rounded-xl p-5"><div class="grid sm:grid-cols-2 gap-3"><label class="text-xs font-medium text-gray-600">Discount (£)<input type="number" min="0" step="0.01" value="${d.discount}" oninput="updateQuoteField('discount',Number(this.value))" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm"></label><label class="text-xs font-medium text-gray-600">Pricing / Customer Notes<textarea rows="2" oninput="updateQuoteField('notes',this.value)" class="mt-1 w-full px-3 py-2 border rounded-lg text-sm">${esc(d.notes)}</textarea></label></div></div>
    </div><div class="space-y-4"><div class="bg-charcoal-900 text-white rounded-xl p-5 sticky top-32"><p class="text-xs tracking-widest text-olive-300 font-bold">LIVE TOTAL</p><p id="quote-live-total" class="text-3xl font-bold mt-1">${money(calc.total)}</p><div id="quote-summary" class="mt-4 space-y-2 text-sm">${renderQuoteSummary(calc)}</div><div class="border-t border-white/20 mt-4 pt-4 space-y-2"><button onclick="saveWeddingQuote('${w.id}')" class="w-full py-2.5 bg-olive-500 rounded-lg font-semibold">Save New Quote Version</button><button onclick="printWeddingQuote('${w.id}')" class="w-full py-2.5 bg-white/10 rounded-lg font-medium">Print / Save as PDF</button><button onclick="resetWeddingQuoteDraft('${w.id}')" class="w-full py-2 text-xs text-gray-300">Reset to latest saved quote</button></div></div>
      <div class="bg-white border border-olive-100 rounded-xl p-4"><h3 class="font-bold">Quote History</h3><div class="mt-3 space-y-2">${history.length?history.map(q=>`<button onclick="loadQuoteVersion('${w.id}','${q.id}')" class="w-full text-left p-3 rounded-lg bg-cream-50 hover:bg-cream-100"><div class="flex justify-between"><span class="font-medium text-sm">Version ${q.version}</span><strong class="text-sm">${money(q.total)}</strong></div><p class="text-xs text-gray-500 mt-1">${new Date(q.createdAt).toLocaleString('en-GB')} · ${esc(q.packageName)} · ${esc(WeddingPricing.get(q.priceYear)?.label||q.priceYear)}</p></button>`).join(''):'<p class="text-sm text-gray-400">No saved quote versions yet.</p>'}</div></div>
    </div></div>
  </div>`;
};

(function injectWeddingPricingStyles(){
  if(document.getElementById('wedding-pricing-styles'))return;
  const style=document.createElement('style');style.id='wedding-pricing-styles';style.textContent=`
  .wp-eyebrow{font-size:.62rem;font-weight:900;letter-spacing:.17em;color:#d1aa45}.wp-eyebrow.olive{color:#668045}
  .wp-manager{height:100%;display:flex;flex-direction:column;background:#f7f8f5}.wp-header{display:flex;justify-content:space-between;align-items:flex-start;gap:15px;padding:20px 22px;border-bottom:1px solid #e1e6dd;background:#fff}.wp-header h2{font-size:1.45rem;font-weight:850}.wp-header p:last-child{font-size:.65rem;color:#7b8578;margin-top:4px}.wp-sync-builtins{display:flex;align-items:center;gap:5px;padding:8px 10px;border-radius:8px;background:#eef3e8;color:#58723d;font-size:.55rem;font-weight:850}.wp-sync-builtins svg{width:13px;height:13px}.wp-close{width:35px;height:35px;display:grid;place-items:center;border-radius:9px;background:#f1f3ef}.wp-close svg{width:18px}
  .wp-manager-body{display:grid;grid-template-columns:240px minmax(0,1fr);flex:1;min-height:0}.wp-list-panel{padding:13px;border-right:1px solid #e0e6dc;background:#fff;overflow-y:auto}.wp-list-title{display:flex;align-items:center;justify-content:space-between;padding:3px 5px 10px}.wp-list-title strong{font-size:.68rem}.wp-list-title button{display:flex;gap:4px;align-items:center;font-size:.54rem;font-weight:850;color:#5e783e}.wp-list-title svg{width:12px}.wp-list{display:flex;flex-direction:column;gap:5px}.wp-list>button{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:9px;border-radius:10px;text-align:left;background:#f5f7f2;color:#61705c}.wp-list>button.active{background:#5f793f;color:#fff}.wp-list strong{display:block;font-size:.6rem}.wp-list small{display:block;font-size:.46rem;opacity:.7;margin-top:2px}.wp-list em{font-style:normal;font-size:.5rem;font-weight:850}.wp-warning{margin-top:13px;padding:10px;border:1px solid #ecd9a2;border-radius:9px;background:#fff8e6;color:#85641c}.wp-warning strong,.wp-warning span{display:block}.wp-warning strong{font-size:.55rem}.wp-warning span{font-size:.47rem;margin-top:3px}
  .wp-editor-panel{min-width:0;overflow-y:auto;padding:15px 18px 25px}.wp-editor{display:flex;flex-direction:column;gap:13px;max-width:1300px;margin:0 auto}.wp-editor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.wp-editor-head h3{font-size:1.3rem;font-weight:850}.wp-editor-head>div>p:last-child{font-size:.58rem;color:#818b7e}.wp-editor-actions{display:flex;gap:7px}.wp-editor-actions button,.wp-section-head button{display:flex;align-items:center;gap:5px;padding:8px 10px;border-radius:8px;background:#eef3e8;color:#58723d;font-size:.55rem;font-weight:850}.wp-editor-actions button.primary{background:#5f793f;color:#fff}.wp-editor-actions svg{width:13px}
  .wp-meta-grid{display:grid;grid-template-columns:1.3fr .65fr 1.3fr .85fr;gap:8px;padding:12px;border:1px solid #e0e6dc;border-radius:13px;background:#fff}.wp-meta-grid label,.wp-notes-grid label{font-size:.5rem;font-weight:800;color:#6e786a}.wp-meta-grid input,.wp-notes-grid textarea{display:block;width:100%;margin-top:4px;padding:8px;border:1px solid #dce2d7;border-radius:8px;font-size:.6rem}.wp-meta-grid .wp-check{display:flex;align-items:center;gap:7px;padding-top:17px}.wp-meta-grid .wp-check input{width:auto;margin:0}
  .wp-section{padding:14px;border:1px solid #e0e6dc;border-radius:14px;background:#fff}.wp-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}.wp-section-head h4{font-size:.82rem;font-weight:850}.wp-section-head p{font-size:.5rem;color:#899286;margin-top:2px}.wp-table-wrap{overflow-x:auto}.wp-table{width:100%;border-collapse:collapse;font-size:.52rem}.wp-table th{padding:7px;background:#f1f4ee;text-align:left;color:#687365;white-space:nowrap}.wp-table td{padding:5px;border-top:1px solid #edf0eb}.wp-table input{width:100%;min-width:72px;padding:6px;border:1px solid #dfe5da;border-radius:6px;font-size:.53rem}.wp-table td:first-child input{min-width:120px}.wp-table button,.wp-simple-row>button{width:28px;height:28px;display:grid;place-items:center;color:#b14b4b}.wp-table button svg,.wp-simple-row>button svg{width:13px}
  .wp-simple-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.wp-simple-row{display:grid;grid-template-columns:minmax(0,1fr) 120px 28px;gap:6px;align-items:center}.wp-simple-row>input,.wp-money-input{height:34px;border:1px solid #dfe5da;border-radius:7px}.wp-simple-row>input{padding:0 8px;font-size:.55rem}.wp-money-input{display:flex;align-items:center;padding:0 7px}.wp-money-input span{font-size:.55rem;color:#747e71}.wp-money-input input{min-width:0;width:100%;border:0;outline:0;padding-left:4px;font-size:.55rem}.wp-notes-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
  .wp-quote-banner{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:13px 15px;border-radius:13px;background:linear-gradient(135deg,#293b31,#536b42);color:#fff}.wp-quote-banner h3{font-size:.95rem;font-weight:850}.wp-quote-banner p:last-child{font-size:.53rem;color:rgba(255,255,255,.72);margin-top:2px}.wp-quote-banner button{display:flex;align-items:center;gap:5px;padding:8px 10px;border-radius:8px;background:#fff;color:#50693b;font-size:.55rem;font-weight:850}.wp-quote-banner svg{width:13px}
  .wp-wedding-financials{display:flex;flex-direction:column;gap:12px}.wp-fin-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.wp-fin-head h3{font-size:1.05rem;font-weight:850}.wp-fin-head button{display:flex;align-items:center;gap:5px;padding:8px 10px;border-radius:8px;background:#eef3e8;color:#58723d;font-size:.55rem;font-weight:850}.wp-fin-head svg{width:13px}.wp-fin-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.wp-fin-grid article{padding:12px;border:1px solid #e1e6dd;border-radius:11px;background:#fff}.wp-fin-grid article.warning{border-color:#ead8a5;background:#fff9e8}.wp-fin-grid article.good{border-color:#cee3ce;background:#f2f9f2}.wp-fin-grid small,.wp-fin-grid span{display:block;font-size:.48rem;color:#828c7f}.wp-fin-grid strong{display:block;font-size:.78rem;margin:3px 0}.wp-fin-actions{display:flex;gap:7px}.wp-fin-actions button{padding:8px 10px;border-radius:8px;background:#eef1ec;font-size:.56rem;font-weight:850}.wp-fin-actions button.primary{background:#5f793f;color:#fff}
  @media(max-width:1000px){.wp-manager-body{grid-template-columns:1fr}.wp-list-panel{border-right:0;border-bottom:1px solid #e0e6dc;max-height:190px}.wp-meta-grid{grid-template-columns:1fr 1fr}.wp-simple-grid{grid-template-columns:1fr}.wp-fin-grid{grid-template-columns:1fr 1fr}}@media(max-width:620px){.wp-meta-grid,.wp-notes-grid,.wp-fin-grid{grid-template-columns:1fr}.wp-editor-head,.wp-fin-head,.wp-quote-banner{flex-direction:column}}
  `;document.head.appendChild(style);
})();

setTimeout(()=>WeddingPricing.load(),350);
