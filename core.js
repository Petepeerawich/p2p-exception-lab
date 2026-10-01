export const clone = x => structuredClone(x);
const final = c => ['approved','rejected'].includes(c.status);
const ref = x => String(x).trim().toUpperCase().replace(/\s+/g,' ');
export function cents(value) {
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(String(value))) throw Error('Use a positive price with at most two decimal places.');
  const [whole, part=''] = String(value).split('.');
  const n = BigInt(whole)*100n + BigInt(part.padEnd(2,'0'));
  if (n <= 0n) throw Error('Price must be positive.');
  return n;
}
function qty(value, zero=false) {
  const n = Number(value);
  if (String(value).trim()==='' || !Number.isSafeInteger(n) || n < (zero?0:1) || n>1000000) throw Error('Use a whole quantity between 1 and 1,000,000.');
  return n;
}
function note(text) {
  if(typeof text !== 'string' || !text.trim() || text.length>1000) throw Error('Please enter a note of 1 to 1,000 characters.');
  return text.trim();
}
export function check(data,id) {
  const i=data.invoices.find(x=>x.id===id);
  if(!i) throw Error('Unknown invoice.');
  const findings=[];
  const flag=(code,message,evidence=[id,i.po_id])=>findings.push({code,message,evidence});
  let price, quantity, amount=null;
  try { price=cents(i.unit_price); quantity=qty(i.quantity); const total=price*BigInt(quantity); amount=`${total/100n}.${String(total%100n).padStart(2,'0')}`; }
  catch { flag('INVALID_DATA','Invoice quantity and price must be positive valid numbers.',[id]); return {match:false,findings,amount}; }
  const before=data.invoices.slice(0,data.invoices.indexOf(i));
  const duplicates=before.filter(x=>x.supplier_id===i.supplier_id && ref(x.supplier_reference)===ref(i.supplier_reference));
  if(duplicates.length) flag('DUPLICATE_INVOICE','An earlier invoice has the same supplier reference.',[id,...duplicates.map(x=>x.id)]);
  const po=data.purchase_orders.find(x=>x.id===i.po_id);
  if(!po) flag('MISSING_PO','The referenced purchase order is missing.');
  else {
    if(i.supplier_id!==po.supplier_id) flag('SUPPLIER_MISMATCH','Supplier differs from the purchase order.');
    if(i.currency!==po.currency) flag('CURRENCY_MISMATCH','Currencies differ. No conversion is assumed.');
    if(i.material_id!==po.material_id) flag('MATERIAL_MISMATCH','Material differs from the purchase order.');
    if(i.currency===po.currency && i.material_id===po.material_id) {
      const ordered=cents(po.unit_price), diff=price>ordered?price-ordered:ordered-price;
      if(diff*10000n>ordered*cents(data.policy.price_tolerance_percent)) flag('PRICE_MISMATCH',`Unit price ${i.unit_price} exceeds the permitted deviation from ${po.unit_price}.`,[id,po.id,data.policy.id]);
    }
    if(quantity>po.quantity) flag('QUANTITY_MISMATCH',`Invoiced ${quantity} units, ordered ${po.quantity}.`);
    const receipts=data.goods_receipts.filter(x=>x.po_id===po.id && x.material_id===i.material_id);
    if(i.material_id===po.material_id) {
      if(!receipts.length) flag('MISSING_RECEIPT','No goods receipt is available.');
      else { const received=receipts.reduce((s,x)=>s+x.quantity,0); if(quantity>received) flag('RECEIPT_SHORTFALL',`Invoiced ${quantity} units, received ${received}.`,[id,po.id,...receipts.map(x=>x.id)]); }
    }
  }
  return {match:!findings.length,findings,amount};
}
export class Demo {
  constructor(seed, actions=[]) {
    this.original=clone(seed); this.data=clone(seed); this.cases={}; this.actions=[]; this.events=[];
    for(const i of seed.invoices) { const result=check(this.data,i.id); this.cases[i.id]={status:result.match?'ready_for_review':'needs_review',result,dirty:false}; }
    if(!Array.isArray(actions) || actions.length>2000) throw Error('Invalid saved history.');
    for(const action of actions) this.apply(action);
  }
  dispatch(type,id,payload={}) { this.apply({type,id,payload,at:new Date().toISOString()}); }
  apply(action) {
    const {type,id,payload,at}=clone(action), c=this.cases[id];
    if(!c || !payload || typeof at!=='string' || !Number.isFinite(Date.parse(at))) throw Error('Invalid saved action.');
    if(final(c)) throw Error('This case has a final decision. Reset the demo to start again.');
    const i=this.data.invoices.find(x=>x.id===id);
    let detail;
    if(type==='correct') {
      const reason=note(payload.note), evidence=note(payload.evidence);
      const quantity=qty(payload.quantity), price=cents(payload.price);
      const receiptQty=qty(payload.receiptQty??0,true);
      const po=this.data.purchase_orders.find(x=>x.id===i.po_id);
      const affected=receiptQty?this.data.invoices.filter(x=>x.po_id===i.po_id):[i];
      if(receiptQty) {
        if(!po || po.material_id!==i.material_id) throw Error('A matching order and material are required to add a receipt.');
        if(affected.some(x=>final(this.cases[x.id]))) throw Error('A related case has a final decision. Receipt changes are locked.');
        const total=this.data.goods_receipts.filter(x=>x.po_id===po.id && x.material_id===po.material_id).reduce((s,x)=>s+x.quantity,0);
        if(total+receiptQty>po.quantity) throw Error('Total received quantity cannot exceed the order in this demo.');
      }
      const normalized=`${price/100n}.${String(price%100n).padStart(2,'0')}`;
      if(quantity===i.quantity && normalized===i.unit_price && !receiptQty) throw Error('Change a field before saving a correction.');
      const before=clone(i); i.quantity=quantity; i.unit_price=normalized;
      let receipt=null;
      if(receiptQty) { receipt={id:`GR-DEMO-${this.actions.length+1}`,po_id:i.po_id,material_id:i.material_id,quantity:receiptQty,evidence}; this.data.goods_receipts.push(receipt); }
      for(const row of affected) { this.cases[row.id].dirty=true; this.cases[row.id].status='needs_recheck'; }
      detail={before,after:clone(i),receipt,note:reason,evidence,affected:affected.map(x=>x.id)};
    } else if(type==='recheck') {
      const previous=clone(c.result); c.result=check(this.data,id); c.dirty=false;
      c.status=c.result.match?'ready_for_review':'needs_review'; detail={previous,current:clone(c.result)};
    } else if(type==='review') {
      const reason=note(payload.note);
      if(!['hold','approve','reject'].includes(payload.decision)) throw Error('Unknown decision.');
      if(payload.decision==='approve' && (c.dirty || !c.result.match || !check(this.data,id).match)) throw Error('Resolve all exceptions and recheck before approval.');
      const previous=c.status; c.status={hold:'on_hold',approve:'approved',reject:'rejected'}[payload.decision];
      detail={note:reason,previous,status:c.status};
    } else if(type==='investigate') {
      const context={invoice:clone(i),purchase_order:clone(this.data.purchase_orders.find(x=>x.id===i.po_id)||null),goods_receipts:clone(this.data.goods_receipts.filter(x=>x.po_id===i.po_id))};
      const graph=this.graph(), edges=graph.edges.filter(e=>e.source===id||e.target===id||e.relation==='receives_against'&&e.target===i.po_id);
      const ids=new Set([id,...edges.flatMap(e=>[e.source,e.target])]);
      detail={context,graph:{nodes:graph.nodes.filter(n=>ids.has(n.id)),edges},policy:clone(this.data.policy),mode:'scripted',tools:['get_invoice_context','check_invoice','query_evidence_graph','get_matching_policy'],findings:check(this.data,id).findings};
    } else throw Error('Unknown action.');
    this.actions.push(clone(action)); this.events.push({type,id,at,detail});
  }
  graph() {
    const nodes=[],edges=[];
    for(const [key,type] of [['suppliers','Supplier'],['purchase_orders','Purchase order'],['goods_receipts','Goods receipt'],['invoices','Invoice']])
      for(const row of this.data[key]) nodes.push({...clone(row),type});
    nodes.push({...clone(this.data.policy),type:'Policy'});
    const edge=(source,relation,target)=> { if(!nodes.some(x=>x.id===target))nodes.push({id:target,type:'Missing record'}); edges.push({source,relation,target}); };
    this.data.purchase_orders.forEach(x=>edge(x.id,'ordered_from',x.supplier_id));
    this.data.goods_receipts.forEach(x=>edge(x.id,'receives_against',x.po_id));
    this.data.invoices.forEach(x=>{ edge(x.id,'billed_by',x.supplier_id); edge(x.id,'references',x.po_id); edge(x.id,'governed_by',this.data.policy.id); for(const f of check(this.data,x.id).findings) if(f.code==='DUPLICATE_INVOICE') f.evidence.slice(1).forEach(id=>edge(x.id,'duplicates_reference',id)); });
    return {nodes,edges};
  }
}
