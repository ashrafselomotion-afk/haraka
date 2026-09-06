// Preview pages: each renders the real template's main sheet as HTML so it can be
// screenshotted for the store. The same sample data feeds the generated files.

export const SAMPLE = {
  business: { en: 'Noor Digital Studio FZ-LLC', ar: 'نور ديجيتال ستوديو ش.م.ح', trn: '100 3456 7890 0003', address: 'Office 1204, Dubai Silicon Oasis, Dubai' },
  client: { en: 'Al Wadi Trading LLC', ar: 'شركة الوادي للتجارة ذ.م.م', trn: '100 9876 5432 0003', address: 'Al Quoz Industrial 3, Dubai' },
  invoice: { no: 'INV-2026-0042', date: '06 Sep 2026', due: '20 Sep 2026' },
  lines: [
    { en: 'Brand identity design', ar: 'تصميم هوية بصرية', qty: 1, rate: 8500 },
    { en: 'Website build, 6 pages', ar: 'بناء موقع، 6 صفحات', qty: 1, rate: 14000 },
    { en: 'Hosting and maintenance, 12 months', ar: 'استضافة وصيانة، 12 شهراً', qty: 12, rate: 350 }
  ]
};

const nf = new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });
const m = (n) => nf.format(n);

const base = (title, body, extra = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<style>
@font-face{font-family:"Geist";font-weight:100 900;src:url("../assets/fonts/geist-latin-wght-normal.woff2") format("woff2")}
@font-face{font-family:"Geist Mono";font-weight:100 900;src:url("../assets/fonts/geist-mono-latin-wght-normal.woff2") format("woff2")}
@font-face{font-family:"IBM Plex Sans Arabic";font-weight:400;src:url("../assets/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2") format("woff2")}
@font-face{font-family:"IBM Plex Sans Arabic";font-weight:600;src:url("../assets/fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2") format("woff2")}
:root{--ink:#15181c;--muted:#667080;--line:#dfe3de;--soft:#f1f3ef;--acc:#0b7a5b;--acc-soft:#e4f3ec;--warn:#9a5b00;--warn-soft:#fbf1df}
*{box-sizing:border-box}body{margin:0;background:#e9ece7;font-family:Geist,system-ui,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
.ar{font-family:"IBM Plex Sans Arabic",Geist,sans-serif;direction:rtl}
.sheet{width:1280px;height:800px;overflow:hidden;position:relative;background:#e9ece7}
.paper{position:absolute;background:#fff;box-shadow:0 20px 60px -20px rgba(21,24,28,.35),0 1px 2px rgba(0,0,0,.06);border:1px solid #d8dcd6}
.mono{font-family:"Geist Mono",monospace;font-variant-numeric:tabular-nums}
.tabs{position:absolute;left:0;right:0;bottom:0;height:34px;background:#f4f5f2;border-top:1px solid var(--line);display:flex;align-items:stretch;padding-left:16px;font-size:12px}
.tabs span{padding:0 14px;display:flex;align-items:center;color:var(--muted);border-right:1px solid var(--line)}
.tabs span.on{background:#fff;color:var(--ink);font-weight:600;border-top:2px solid var(--acc);margin-top:-1px}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(21,24,28,.045) 1px,transparent 1px),linear-gradient(to bottom,rgba(21,24,28,.045) 1px,transparent 1px);background-size:96px 24px}
table{border-collapse:collapse;width:100%}
th{font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);text-align:left;padding:0 0 8px;border-bottom:1px solid var(--ink)}
td{padding:9px 0;border-bottom:1px solid var(--line);font-size:13px;vertical-align:top}
.r{text-align:right}.ar th,.ar td{text-align:right}.ar .r{text-align:left}
${extra}
</style></head><body>${body}</body></html>`;

/* Invoice & Quotation Kit: bilingual tax invoice on A4 */
export function previewInvoice() {
  const S = SAMPLE;
  const sub = S.lines.reduce((a, l) => a + l.qty * l.rate, 0);
  const rows = S.lines.map(l => `<tr><td><div>${l.en}</div><div class="ar" style="color:var(--muted);font-size:12px">${l.ar}</div></td><td class="r mono">${l.qty}</td><td class="r mono">${m(l.rate)}</td><td class="r mono">5%</td><td class="r mono">${m(l.qty*l.rate*0.05)}</td><td class="r mono">${m(l.qty*l.rate)}</td></tr>`).join('');
  return base('Invoice preview', `
<div class="sheet"><div class="grid"></div>
<div class="paper" style="left:180px;top:36px;width:920px;padding:44px 52px 0">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div><div style="font-size:26px;font-weight:700;letter-spacing:-.02em">TAX INVOICE</div><div class="ar" style="font-size:17px;font-weight:600;color:var(--muted);text-align:left">فاتورة ضريبية</div></div>
    <div style="text-align:right;font-size:12.5px;line-height:1.6"><div style="color:var(--muted)">Invoice No. <span class="ar">رقم الفاتورة</span></div><div class="mono" style="font-weight:600;font-size:14px">${S.invoice.no}</div><div style="color:var(--muted);margin-top:6px">Date <span class="ar">التاريخ</span> <bdi class="mono" style="color:var(--ink);font-weight:600">${S.invoice.date}</bdi></div><div style="color:var(--muted)">Due <span class="ar">الاستحقاق</span> <bdi class="mono" style="color:var(--ink);font-weight:600">${S.invoice.due}</bdi></div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:30px;padding-top:20px;border-top:1px solid var(--line);font-size:12.5px;line-height:1.6">
    <div><div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">From <span class="ar" style="letter-spacing:0">من</span></div><div style="font-weight:600;font-size:14px;margin-top:4px">${S.business.en}</div><div class="ar" style="text-align:left;color:var(--muted)">${S.business.ar}</div><div style="color:var(--muted)">${S.business.address}</div><div>TRN <span class="mono">${S.business.trn}</span></div></div>
    <div><div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Bill to <span class="ar" style="letter-spacing:0">إلى</span></div><div style="font-weight:600;font-size:14px;margin-top:4px">${S.client.en}</div><div class="ar" style="text-align:left;color:var(--muted)">${S.client.ar}</div><div style="color:var(--muted)">${S.client.address}</div><div>TRN <span class="mono">${S.client.trn}</span></div></div>
  </div>
  <table style="margin-top:28px"><thead><tr><th>Description <span class="ar" style="letter-spacing:0">الوصف</span></th><th class="r">Qty</th><th class="r">Rate (AED)</th><th class="r">VAT</th><th class="r">VAT amt</th><th class="r">Amount (AED)</th></tr></thead><tbody>${rows}</tbody></table>
  <div style="display:flex;justify-content:flex-end;margin-top:16px"><div style="width:320px;font-size:13px">
    <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:var(--muted)">Subtotal <span class="ar">المجموع الفرعي</span></span><span class="mono">${m(sub)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:var(--muted)">VAT 5% <span class="ar">ضريبة القيمة المضافة</span></span><span class="mono">${m(sub*0.05)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:12px 0 0;margin-top:6px;border-top:1.5px solid var(--ink);font-weight:700;font-size:15px"><span>Total due (AED) <span class="ar" style="font-weight:600">الإجمالي المستحق</span></span><span class="mono">${m(sub*1.05)}</span></div>
  </div></div>
</div>
<div class="tabs"><span>Settings</span><span class="on">Tax Invoice</span><span>Simplified Invoice</span><span>Quotation</span><span>Credit Note</span><span>Clients</span><span>Register</span></div>
</div>`);
}

/* Bookkeeping & VAT Tracker: quarterly VAT return summary */
export function previewVat() {
  const boxes = [
    ['1a', 'Standard rated supplies, Abu Dhabi', 62400, 3120],
    ['1b', 'Standard rated supplies, Dubai', 318900, 15945],
    ['1c', 'Standard rated supplies, Sharjah', 41200, 2060],
    ['1d', 'Standard rated supplies, Ajman', 0, 0],
    ['1e', 'Standard rated supplies, Umm Al Quwain', 0, 0],
    ['1f', 'Standard rated supplies, Ras Al Khaimah', 12800, 640],
    ['1g', 'Standard rated supplies, Fujairah', 0, 0],
    ['3', 'Supplies subject to reverse charge', 18500, 925],
    ['4', 'Zero rated supplies', 27000, 0],
    ['5', 'Exempt supplies', 0, 0],
    ['9', 'Standard rated expenses', 146300, 7315],
    ['10', 'Supplies subject to reverse charge (recoverable)', 18500, 925]
  ];
  const out = boxes.filter(b => !['9','10'].includes(b[0])).reduce((a, b) => a + b[3], 0);
  const inp = 7315 + 925;
  const rows = boxes.map(b => `<tr><td class="mono" style="color:var(--muted);width:48px">${b[0]}</td><td>${b[1]}</td><td class="r mono">${m(b[2])}</td><td class="r mono">${m(b[3])}</td></tr>`).join('');
  return base('VAT preview', `
<div class="sheet"><div class="grid"></div>
<div class="paper" style="left:64px;top:40px;width:760px;padding:34px 40px 30px">
  <div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:20px;font-weight:700;letter-spacing:-.02em">VAT Return Summary <span class="ar" style="font-size:15px;color:var(--muted);font-weight:600">ملخص الإقرار الضريبي</span></div><div class="mono" style="font-size:12.5px;color:var(--muted)">Q3 2026 · 01 Jul to 30 Sep</div></div>
  <table style="margin-top:22px"><thead><tr><th>Box</th><th>Description</th><th class="r">Amount (AED)</th><th class="r">VAT (AED)</th></tr></thead><tbody>${rows}</tbody></table>
  <div style="display:flex;justify-content:flex-end;margin-top:14px"><div style="width:340px;font-size:13px">
    <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:var(--muted)">Total output VAT due</span><span class="mono">${m(out)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:var(--muted)">Total recoverable input VAT</span><span class="mono">${m(inp)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:12px 0 0;margin-top:6px;border-top:1.5px solid var(--ink);font-weight:700;font-size:15px"><span>Net VAT payable</span><span class="mono" style="color:var(--acc)">${m(out-inp)}</span></div>
  </div></div>
</div>
<div class="paper" style="left:860px;top:40px;width:356px;padding:24px 26px">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">This quarter</div>
  <div style="margin-top:14px;display:grid;gap:14px">
    <div><div style="font-size:12px;color:var(--muted)">Revenue</div><div class="mono" style="font-size:24px;font-weight:600;letter-spacing:-.02em">AED ${nf0.format(480800)}</div></div>
    <div><div style="font-size:12px;color:var(--muted)">Expenses</div><div class="mono" style="font-size:24px;font-weight:600;letter-spacing:-.02em">AED ${nf0.format(146300)}</div></div>
    <div><div style="font-size:12px;color:var(--muted)">Net VAT payable</div><div class="mono" style="font-size:24px;font-weight:600;letter-spacing:-.02em;color:var(--acc)">AED ${nf0.format(out-inp)}</div></div>
  </div>
  <div style="margin-top:22px;padding:12px 14px;border-radius:10px;background:var(--acc-soft);color:var(--acc);font-size:12.5px;font-weight:600">Return due 28 Oct 2026</div>
  <div style="margin-top:10px;padding:12px 14px;border-radius:10px;background:var(--warn-soft);color:var(--warn);font-size:12.5px;font-weight:600">Threshold watch: 12-month taxable turnover AED 1.71M</div>
</div>
<div class="tabs"><span>Dashboard</span><span>Income</span><span>Expenses</span><span class="on">VAT Return</span><span>Accounts</span><span>Suppliers</span></div>
</div>`);
}

/* Corporate Tax Estimator */
export function previewCt() {
  const rev = 2140000, cos = 690000, ovh = 810000, adj = 22000;
  const acct = rev - cos - ovh, taxable = acct + adj, band = 375000, above = Math.max(0, taxable - band), tax = above * 0.09;
  const row = (k, v, b) => `<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px${b?';font-weight:700':''}"><span style="color:${b?'var(--ink)':'var(--muted)'}">${k}</span><span class="mono">${v}</span></div>`;
  return base('CT preview', `
<div class="sheet"><div class="grid"></div>
<div class="paper" style="left:96px;top:44px;width:520px;padding:32px 36px 28px">
  <div style="font-size:20px;font-weight:700;letter-spacing:-.02em">Estimate <span class="ar" style="font-size:15px;color:var(--muted);font-weight:600">التقدير</span></div>
  <div class="mono" style="font-size:12px;color:var(--muted);margin-top:4px">FY 01 Jan 2026 to 31 Dec 2026</div>
  <div style="margin-top:18px">
    ${row('Revenue', m(rev))}${row('Cost of sales', '(' + m(cos) + ')')}${row('Overheads', '(' + m(ovh) + ')')}${row('Accounting profit', m(acct), true)}
    ${row('Non-deductible adjustments', m(adj))}${row('Taxable income', m(taxable), true)}
    ${row('0% band (first AED 375,000)', m(band))}${row('Taxable at 9%', m(above))}
  </div>
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:18px"><span style="font-weight:700;font-size:15px">Corporate tax payable</span><span class="mono" style="font-size:28px;font-weight:600;letter-spacing:-.02em;color:var(--acc)">AED ${m(tax)}</span></div>
</div>
<div class="paper" style="left:656px;top:44px;width:520px;padding:32px 36px 28px">
  <div style="font-size:20px;font-weight:700;letter-spacing:-.02em">Small Business Relief check</div>
  <div style="margin-top:18px">
    ${row('Revenue this period', m(rev))}${row('Relief revenue limit', m(3000000))}${row('Prior periods above limit', 'No')}${row('Qualifying Free Zone Person', 'No')}
  </div>
  <div style="margin-top:20px;padding:16px 18px;border-radius:12px;background:var(--acc-soft);color:var(--acc)"><div style="font-weight:700;font-size:15px">Eligible. If elected, tax payable is AED 0.00</div><div style="font-size:12.5px;margin-top:4px;opacity:.85">Election is made in the return. Losses and interest cannot be carried forward from a relief period.</div></div>
  <div style="margin-top:18px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Deadlines</div>
  <div style="margin-top:8px">${row('Financial year end', '31 Dec 2026')}${row('Return and payment due', '30 Sep 2027', true)}</div>
</div>
<div class="tabs"><span>Inputs</span><span>Adjustments</span><span class="on">Estimate</span><span>Relief Check</span><span>Deadlines</span></div>
</div>`);
}

/* Freelancer Cash-flow Planner */
export function previewCashflow() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const inc = [24000,31500,18000,42000,27500,22000,15500,19000,38000,33000,29500,41000];
  const out = [16800,17200,16900,18400,17100,16800,17600,16900,17300,18800,17000,19400];
  let bal = 31000; const bals = inc.map((v, i) => (bal += v - out[i]));
  const th = months.map(mm => `<th class="r" style="padding-right:6px">${mm}</th>`).join('');
  const tr = (label, arr, bold, color) => `<tr><td style="${bold?'font-weight:700':''}">${label}</td>${arr.map(v => `<td class="r mono" style="padding-right:6px;font-size:12.5px;${bold?'font-weight:600':''}${color?';color:'+color:''}">${nf0.format(v)}</td>`).join('')}</tr>`;
  const max = Math.max(...inc), W = 1100, H = 150;
  const bars = inc.map((v, i) => `<rect x="${i*(W/12)+10}" y="${H - v/max*H}" width="${W/12-20}" height="${v/max*H}" rx="4" fill="${i===6?'#9a5b00':'#0b7a5b'}" opacity=".9"/>`).join('');
  return base('Cash-flow preview', `
<div class="sheet"><div class="grid"></div>
<div class="paper" style="left:40px;top:40px;width:1200px;padding:30px 40px 28px">
  <div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:20px;font-weight:700;letter-spacing:-.02em">Cash-flow 2026 <span class="ar" style="font-size:15px;color:var(--muted);font-weight:600">التدفق النقدي</span></div><div style="font-size:12.5px;color:var(--muted)">Runway at current burn: <b class="mono" style="color:var(--ink)">7.4 months</b> · Day rate: <b class="mono" style="color:var(--ink)">AED 1,850</b></div></div>
  <svg viewBox="0 0 ${W} ${H}" width="1120" height="150" style="margin-top:18px;display:block">${bars}</svg>
  <table style="margin-top:8px"><thead><tr><th>AED</th>${th}</tr></thead><tbody>
    ${tr('Income, confirmed + expected', inc)}${tr('Costs incl. licence, visa, insurance', out)}${tr('Closing balance', bals, true, null)}
    ${tr('VAT reserve (5% of income)', inc.map(v=>v*0.05), false, '#667080')}${tr('Corporate tax reserve', inc.map(()=>0), false, '#667080')}
  </tbody></table>
</div>
<div class="tabs"><span>Rates</span><span>Costs</span><span class="on">Cash-flow</span><span>Scenarios</span><span>Reserves</span></div>
</div>`);
}

/* Contracts & Proposals Kit: bilingual service agreement page */
export function previewContract() {
  const clause = (n, en, ar) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;padding:12px 0;border-bottom:1px solid var(--line)"><div style="font-size:12.5px;line-height:1.6"><b>${n}. ${en[0]}</b><div style="color:#3a4149;margin-top:2px">${en[1]}</div></div><div class="ar" style="font-size:13px;line-height:1.8"><b>${n}. ${ar[0]}</b><div style="color:#3a4149;margin-top:2px">${ar[1]}</div></div></div>`;
  return base('Contract preview', `
<div class="sheet"><div class="grid"></div>
<div class="paper" style="left:180px;top:36px;width:920px;padding:44px 52px 0">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:end">
    <div><div style="font-size:24px;font-weight:700;letter-spacing:-.02em">Service Agreement</div><div style="font-size:12.5px;color:var(--muted);margin-top:4px">Between <b style="color:var(--ink)">${SAMPLE.business.en}</b> and <b style="color:var(--ink)">${SAMPLE.client.en}</b></div></div>
    <div class="ar"><div style="font-size:22px;font-weight:600">اتفاقية خدمات</div><div style="font-size:13px;color:var(--muted);margin-top:4px">بين <b style="color:var(--ink)">${SAMPLE.business.ar}</b> و<b style="color:var(--ink)">${SAMPLE.client.ar}</b></div></div>
  </div>
  <div style="margin-top:22px;border-top:1.5px solid var(--ink)">
    ${clause(1, ['Scope of services', 'The Provider will deliver the services described in Schedule A. Work outside Schedule A requires a signed Change Order.'], ['نطاق الخدمات', 'يقدم مزود الخدمة الخدمات الموصوفة في الملحق (أ). أي عمل خارج الملحق (أ) يتطلب أمر تغيير موقعاً.'])}
    ${clause(2, ['Fees and payment', 'A deposit of <mark style="background:#fff3bf">40%</mark> is due on signature. Milestone payments are due within <mark style="background:#fff3bf">14 days</mark> of invoice. Fees exclude VAT.'], ['الأتعاب والدفع', 'تُستحق دفعة مقدمة بنسبة <mark style="background:#fff3bf">40%</mark> عند التوقيع. تُسدد دفعات المراحل خلال <mark style="background:#fff3bf">14 يوماً</mark> من تاريخ الفاتورة. الأتعاب لا تشمل ضريبة القيمة المضافة.'])}
    ${clause(3, ['Late payment', 'Overdue amounts accrue a late fee of <mark style="background:#fff3bf">1.5%</mark> per month. The Provider may pause work after 10 days overdue.'], ['التأخر في السداد', 'تُحتسب على المبالغ المتأخرة غرامة تأخير بنسبة <mark style="background:#fff3bf">1.5%</mark> شهرياً. يجوز لمزود الخدمة إيقاف العمل بعد 10 أيام من التأخر.'])}
    ${clause(4, ['Intellectual property', 'Ownership of final deliverables transfers to the Client on receipt of full payment. The Provider retains the right to show the work in its portfolio.'], ['الملكية الفكرية', 'تنتقل ملكية المخرجات النهائية إلى العميل عند استلام كامل المبلغ. يحتفظ مزود الخدمة بحق عرض العمل ضمن أعماله السابقة.'])}
    ${clause(5, ['Governing law', 'This Agreement is governed by the laws of the United Arab Emirates. Disputes are referred to the courts of <mark style="background:#fff3bf">Dubai</mark>.'], ['القانون الواجب التطبيق', 'تخضع هذه الاتفاقية لقوانين دولة الإمارات العربية المتحدة. تُحال النزاعات إلى محاكم <mark style="background:#fff3bf">دبي</mark>.'])}
  </div>
</div>
<div class="tabs"><span class="on">Service Agreement</span><span>Proposal</span><span>Payment Terms</span><span>Change Order</span><span>NDA</span><span>Reminders</span></div>
</div>`);
}

export const PREVIEWS = {
  'invoice-kit': previewInvoice,
  'vat-tracker': previewVat,
  'ct-estimator': previewCt,
  'cashflow-planner': previewCashflow,
  'contracts-kit': previewContract
};

/* Open Graph cards, 1200x630 */
export function ogCard({ lang, title, sub, brand, brandAr, price }) {
  const ar = lang === 'ar';
  return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:"Geist";font-weight:100 900;src:url("../assets/fonts/geist-latin-wght-normal.woff2") format("woff2")}
@font-face{font-family:"IBM Plex Sans Arabic";font-weight:700;src:url("../assets/fonts/ibm-plex-sans-arabic-arabic-700-normal.woff2") format("woff2")}
@font-face{font-family:"IBM Plex Sans Arabic";font-weight:500;src:url("../assets/fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2") format("woff2")}
body{margin:0;width:1200px;height:630px;background:#0f1214;color:#eceeea;font-family:${ar ? '"IBM Plex Sans Arabic",' : ''}Geist,system-ui,sans-serif;position:relative;overflow:hidden}
.card{position:absolute;inset:0;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
.logo{display:flex;align-items:center;gap:14px;font-weight:700;font-size:30px}
.mark{width:40px;height:40px;border-radius:11px;background:#2fd39f;position:relative}
.mark::before,.mark::after{content:"";position:absolute;inset-inline-start:9px;height:5px;border-radius:3px;background:#0b1a14}
.mark::before{top:13px;width:22px}.mark::after{top:23px;width:14px}
h1{margin:0;font-size:${ar ? 64 : 72}px;line-height:1.1;letter-spacing:${ar ? 0 : '-.03em'};font-weight:${ar ? 700 : 600};max-width:960px}
p{margin:18px 0 0;font-size:28px;color:#8f98a0;max-width:900px;font-weight:500}
.price{position:absolute;top:64px;inset-inline-end:80px;background:#2fd39f;color:#0b1a14;font-weight:700;font-size:28px;padding:12px 22px;border-radius:999px}
.bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:#2fd39f}
</style></head><body><div class="card"><div class="logo"><span class="mark"></span>${ar ? brandAr : brand}</div><div><h1>${title}</h1><p>${sub}</p></div></div>${price ? `<div class="price">${price}</div>` : ''}<div class="bar"></div></body></html>`;
}
