# -*- coding: utf-8 -*-
"""Writes /voucher.html — the travel voucher page (B2C and B2B).
Opened by the secret link voucher.html?ref=MR-…&k=… that the admin sends after payment.
Data comes from the Supabase function get_voucher(ref, key); nothing is shown without the key.
Design: Moviy Travel colours with an Uzbek girih-star border and a suzani rosette."""
import json, os

LABELS = {
 "en": dict(conf_title='Booking confirmation', client='Client', contacts_c='Contacts', payment='Payment', total='Tour price', paidl='Paid', bal='Balance to pay', due='by', part='DEPOSIT PAID', req='Moviy Travel — company details', inn='Tax ID (INN)', bank='Bank', acc='Account', mfo='Bank code (MFO)', lic='Tourism licence', addr='Address', confirmed_txt='Your booking is confirmed. This document is your booking confirmation; after full payment it becomes your travel voucher.', ppl='Payments received', title="Travel voucher", no="Voucher no.", issued="Issued", tour="Tour", dates="Dates", dur="{d} days / {n} nights", pax="Travellers", lead="Lead traveller", hotel="Hotels", room="Room", guide="Guide language", route="Route", prog="Programme", day="Day", inc="Included", contacts="24/7 assistance", note="Please show this voucher (printed or on your phone) together with your passport. Changes and cancellations follow our terms.", paid="PAID", dl="Download PDF", print="Print", wait="Loading the voucher…", bad="Voucher not found. Please check the link or write to us.", agency="Agency", svc="Booked services", conf="conf.", verify="Scan to check this voucher", night="night", nights="nights", end="departure"),
 "uz": dict(conf_title="Bron tasdig'i", client='Mijoz', contacts_c='Aloqa', payment="To'lov", total='Tur narxi', paidl="To'langan", bal="To'lanishi kerak", due='muddati', part="30% TO'LANGAN", req='Moviy Travel — rekvizitlar', inn='INN (STIR)', bank='Bank', acc='Hisob raqami', mfo='MFO', lic='Turizm litsenziyasi', addr='Manzil', confirmed_txt="Broningiz tasdiqlandi. Bu hujjat — bron tasdig'i; to'liq to'lovdan keyin sayohat vaucheriga aylanadi.", ppl="Qabul qilingan to'lovlar", title="Sayohat vaucheri", no="Vaucher raqami", issued="Berilgan sana", tour="Tur", dates="Sanalar", dur="{d} kun / {n} kecha", pax="Sayohatchilar", lead="Asosiy sayohatchi", hotel="Mehmonxonalar", room="Xona", guide="Gid tili", route="Yo'nalish", prog="Dastur", day="Kun", inc="Narxga kiradi", contacts="24/7 yordam", note="Iltimos, bu vaucherni (qog'ozda yoki telefonda) pasportingiz bilan birga ko'rsating. O'zgartirish va bekor qilish shartlarimiz bo'yicha.", paid="TO'LANGAN", dl="PDF yuklab olish", print="Chop etish", wait="Vaucher yuklanmoqda…", bad="Vaucher topilmadi. Havolani tekshiring yoki bizga yozing.", agency="Agentlik", svc="Bron qilingan xizmatlar", conf="tasdiq", verify="Vaucherni tekshirish uchun skanerlang", night="kecha", nights="kecha", end="jo'nab ketish"),
 "ru": dict(conf_title='Подтверждение бронирования', client='Клиент', contacts_c='Контакты', payment='Оплата', total='Стоимость тура', paidl='Оплачено', bal='К оплате', due='до', part='ПРЕДОПЛАТА', req='Moviy Travel — реквизиты', inn='ИНН', bank='Банк', acc='Расчётный счёт', mfo='МФО', lic='Туристическая лицензия', addr='Адрес', confirmed_txt='Ваше бронирование подтверждено. Этот документ — подтверждение брони; после полной оплаты он становится ваучером.', ppl='Полученные платежи', title="Туристический ваучер", no="Номер ваучера", issued="Выдан", tour="Тур", dates="Даты", dur="{d} дн. / {n} ноч.", pax="Туристы", lead="Главный турист", hotel="Отели", room="Номер", guide="Язык гида", route="Маршрут", prog="Программа", day="День", inc="Включено", contacts="Помощь 24/7", note="Покажите ваучер (распечатанный или на телефоне) вместе с паспортом. Изменения и отмена — по нашим условиям.", paid="ОПЛАЧЕНО", dl="Скачать PDF", print="Печать", wait="Загружаем ваучер…", bad="Ваучер не найден. Проверьте ссылку или напишите нам.", agency="Агентство", svc="Забронированные услуги", conf="подтв.", verify="Отсканируйте для проверки", night="ночь", nights="ноч.", end="отъезд"),
 "tr": dict(conf_title='Rezervasyon onayı', client='Müşteri', contacts_c='İletişim', payment='Ödeme', total='Tur fiyatı', paidl='Ödenen', bal='Kalan ödeme', due='son tarih', part='ÖN ÖDEME', req='Moviy Travel — şirket bilgileri', inn='Vergi no (INN)', bank='Banka', acc='Hesap', mfo='Banka kodu (MFO)', lic='Turizm lisansı', addr='Adres', confirmed_txt="Rezervasyonunuz onaylandı. Bu belge rezervasyon onayınızdır; tam ödemeden sonra seyahat voucher'ı olur.", ppl='Alınan ödemeler', title="Seyahat voucher'ı", no="Voucher no.", issued="Düzenlenme", tour="Tur", dates="Tarihler", dur="{d} gün / {n} gece", pax="Gezginler", lead="Ana gezgin", hotel="Oteller", room="Oda", guide="Rehber dili", route="Rota", prog="Program", day="Gün", inc="Dahil", contacts="7/24 destek", note="Lütfen bu voucher'ı (basılı veya telefonda) pasaportunuzla birlikte gösterin. Değişiklik ve iptal şartlarımıza göre yapılır.", paid="ÖDENDİ", dl="PDF indir", print="Yazdır", wait="Voucher yükleniyor…", bad="Voucher bulunamadı. Bağlantıyı kontrol edin veya bize yazın.", agency="Acente", svc="Rezerve hizmetler", conf="onay", verify="Doğrulamak için tarayın", night="gece", nights="gece", end="ayrılış"),
 "ar": dict(conf_title='تأكيد الحجز', client='العميل', contacts_c='التواصل', payment='الدفع', total='سعر الرحلة', paidl='المدفوع', bal='المتبقي', due='حتى', part='دفعة مقدمة', req='Moviy Travel — بيانات الشركة', inn='الرقم الضريبي', bank='البنك', acc='الحساب', mfo='رمز البنك', lic='رخصة السياحة', addr='العنوان', confirmed_txt='تم تأكيد حجزك. هذه الوثيقة تأكيد للحجز، وبعد السداد الكامل تصبح قسيمة السفر.', ppl='الدفعات المستلمة', title="قسيمة السفر", no="رقم القسيمة", issued="تاريخ الإصدار", tour="الرحلة", dates="التواريخ", dur="{d} أيام / {n} ليالٍ", pax="المسافرون", lead="المسافر الرئيسي", hotel="الفنادق", room="الغرفة", guide="لغة المرشد", route="المسار", prog="البرنامج", day="اليوم", inc="يشمل", contacts="مساعدة على مدار الساعة", note="يرجى إظهار هذه القسيمة (مطبوعة أو على الهاتف) مع جواز السفر. التعديل والإلغاء وفق شروطنا.", paid="مدفوع", dl="تنزيل PDF", print="طباعة", wait="جارٍ تحميل القسيمة…", bad="لم يتم العثور على القسيمة. تحقق من الرابط أو راسلنا.", agency="الوكالة", svc="الخدمات المحجوزة", conf="تأكيد", verify="امسح للتحقق", night="ليلة", nights="ليالٍ", end="المغادرة"),
 "de": dict(conf_title='Buchungsbestätigung', client='Kunde', contacts_c='Kontakt', payment='Zahlung', total='Reisepreis', paidl='Bezahlt', bal='Offener Betrag', due='bis', part='ANGEZAHLT', req='Moviy Travel — Firmendaten', inn='Steuernr. (INN)', bank='Bank', acc='Konto', mfo='Bankcode (MFO)', lic='Tourismuslizenz', addr='Adresse', confirmed_txt='Ihre Buchung ist bestätigt. Dieses Dokument ist Ihre Buchungsbestätigung; nach vollständiger Zahlung wird es Ihr Reisevoucher.', ppl='Erhaltene Zahlungen', title="Reisevoucher", no="Voucher-Nr.", issued="Ausgestellt", tour="Reise", dates="Termine", dur="{d} Tage / {n} Nächte", pax="Reisende", lead="Hauptreisender", hotel="Hotels", room="Zimmer", guide="Sprache des Guides", route="Route", prog="Programm", day="Tag", inc="Inklusive", contacts="Hilfe rund um die Uhr", note="Bitte zeigen Sie diesen Voucher (gedruckt oder auf dem Handy) zusammen mit Ihrem Pass. Änderungen und Stornierungen gemäß unseren Bedingungen.", paid="BEZAHLT", dl="PDF herunterladen", print="Drucken", wait="Voucher wird geladen…", bad="Voucher nicht gefunden. Bitte Link prüfen oder uns schreiben.", agency="Agentur", svc="Gebuchte Leistungen", conf="Best.", verify="Zum Prüfen scannen", night="Nacht", nights="Nächte", end="Abreise"),
 "sv": dict(conf_title='Bokningsbekräftelse', client='Kund', contacts_c='Kontakt', payment='Betalning', total='Resans pris', paidl='Betalt', bal='Att betala', due='senast', part='HANDPENNING BETALD', req='Moviy Travel — företagsuppgifter', inn='Org.nr (INN)', bank='Bank', acc='Konto', mfo='Bankkod (MFO)', lic='Turismlicens', addr='Adress', confirmed_txt='Din bokning är bekräftad. Detta dokument är din bokningsbekräftelse; efter full betalning blir det din resevoucher.', ppl='Mottagna betalningar', title="Resevoucher", no="Vouchernr", issued="Utfärdad", tour="Resa", dates="Datum", dur="{d} dagar / {n} nätter", pax="Resenärer", lead="Huvudresenär", hotel="Hotell", room="Rum", guide="Guidens språk", route="Rutt", prog="Program", day="Dag", inc="Ingår", contacts="Hjälp dygnet runt", note="Visa denna voucher (utskriven eller i mobilen) tillsammans med ditt pass. Ändringar och avbokning enligt våra villkor.", paid="BETALD", dl="Ladda ner PDF", print="Skriv ut", wait="Laddar voucher…", bad="Vouchern hittades inte. Kontrollera länken eller skriv till oss.", agency="Byrå", svc="Bokade tjänster", conf="bekr.", verify="Skanna för att kontrollera", night="natt", nights="nätter", end="avresa"),
 "zh": dict(conf_title='预订确认书', client='客户', contacts_c='联系方式', payment='付款', total='团费', paidl='已付', bal='待付', due='截止', part='已付定金', req='Moviy Travel 公司信息', inn='税号 (INN)', bank='银行', acc='账号', mfo='银行代码 (MFO)', lic='旅游许可证', addr='地址', confirmed_txt='您的预订已确认。本文件为预订确认书，付清全款后即为旅行凭证。', ppl='已收款项', title="旅行凭证", no="凭证编号", issued="签发日期", tour="线路", dates="日期", dur="{d}天{n}晚", pax="游客", lead="主要联系人", hotel="酒店", room="房型", guide="导游语言", route="路线", prog="行程", day="第几天", inc="费用包含", contacts="24小时协助", note="请携带本凭证（打印或手机均可）及护照出示。变更和取消按我们的条款办理。", paid="已付款", dl="下载 PDF", print="打印", wait="正在加载凭证…", bad="未找到凭证。请检查链接或联系我们。", agency="旅行社", svc="已预订服务", conf="确认号", verify="扫码验证", night="晚", nights="晚", end="离开"),
 "hi": dict(conf_title='बुकिंग पुष्टि', client='ग्राहक', contacts_c='संपर्क', payment='भुगतान', total='टूर कीमत', paidl='भुगतान किया', bal='बकाया', due='तक', part='अग्रिम भुगतान', req='Moviy Travel — कंपनी विवरण', inn='कर संख्या (INN)', bank='बैंक', acc='खाता', mfo='बैंक कोड (MFO)', lic='पर्यटन लाइसेंस', addr='पता', confirmed_txt='आपकी बुकिंग पक्की है। यह दस्तावेज़ बुकिंग पुष्टि है; पूरा भुगतान होने पर यह यात्रा वाउचर बन जाता है।', ppl='प्राप्त भुगतान', title="यात्रा वाउचर", no="वाउचर संख्या", issued="जारी", tour="टूर", dates="तारीख़ें", dur="{d} दिन / {n} रातें", pax="यात्री", lead="मुख्य यात्री", hotel="होटल", room="कमरा", guide="गाइड की भाषा", route="मार्ग", prog="कार्यक्रम", day="दिन", inc="शामिल", contacts="24/7 सहायता", note="कृपया यह वाउचर (प्रिंट या फ़ोन पर) अपने पासपोर्ट के साथ दिखाएँ। बदलाव और रद्दीकरण हमारी शर्तों के अनुसार।", paid="भुगतान हुआ", dl="PDF डाउनलोड", print="प्रिंट", wait="वाउचर लोड हो रहा है…", bad="वाउचर नहीं मिला। लिंक जाँचें या हमें लिखें।", agency="एजेंसी", svc="बुक की गई सेवाएँ", conf="पुष्टि", verify="जाँचने के लिए स्कैन करें", night="रात", nights="रातें", end="प्रस्थान"),
 "ko": dict(conf_title='예약 확인서', client='고객', contacts_c='연락처', payment='결제', total='여행 요금', paidl='결제 완료', bal='잔금', due='까지', part='예약금 결제', req='Moviy Travel 회사 정보', inn='사업자번호 (INN)', bank='은행', acc='계좌', mfo='은행 코드 (MFO)', lic='관광 허가', addr='주소', confirmed_txt='예약이 확정되었습니다. 이 문서는 예약 확인서이며, 완납 후 여행 바우처가 됩니다.', ppl='받은 결제', title="여행 바우처", no="바우처 번호", issued="발행일", tour="투어", dates="일정", dur="{d}일 / {n}박", pax="여행자", lead="대표 여행자", hotel="호텔", room="객실", guide="가이드 언어", route="경로", prog="일정표", day="일차", inc="포함 사항", contacts="24시간 지원", note="이 바우처(인쇄본 또는 휴대폰)를 여권과 함께 제시해 주세요. 변경 및 취소는 당사 약관에 따릅니다.", paid="결제 완료", dl="PDF 다운로드", print="인쇄", wait="바우처를 불러오는 중…", bad="바우처를 찾을 수 없습니다. 링크를 확인하거나 문의해 주세요.", agency="여행사", svc="예약된 서비스", conf="확인", verify="스캔하여 확인", night="박", nights="박", end="출발"),
}

CSS = r"""
:root{--navy:#12355b;--navy2:#0d2744;--gold:#f3b443;--sky:#2fa4c7;--terra:#c8553d;--ink:#0f2238;--muted:#5b6b7f;--paper:#fffaf0}
*{box-sizing:border-box}body{margin:0;background:#e9e4d8;font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans",sans-serif;color:var(--ink)}
.bar{position:sticky;top:0;z-index:5;display:flex;gap:10px;justify-content:center;padding:12px;background:var(--navy2)}
.bar button{font:600 15px/1 inherit;padding:12px 18px;border-radius:10px;border:0;cursor:pointer;background:var(--gold);color:var(--navy2)}
.bar button.ghost{background:transparent;color:#fff;border:1px solid #ffffff55}
.state{max-width:640px;margin:60px auto;text-align:center;color:var(--muted);font-size:17px}
.v{width:210mm;min-height:297mm;margin:20px auto;background:var(--paper);position:relative;padding:15mm 14mm 16mm;box-shadow:0 10px 40px #0002;overflow:hidden}
.v:before{content:"";position:absolute;inset:6mm;border:2.2mm solid transparent;border-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%2312355b'/%3E%3Cpath d='M12 2l2.6 4.4L19 4l-1.4 5 4.4 3-4.4 3L19 20l-4.4-2.4L12 22l-2.6-4.4L5 20l1.4-5L2 12l4.4-3L5 4l4.4 2.4z' fill='%23f3b443'/%3E%3Ccircle cx='12' cy='12' r='2.6' fill='%232fa4c7'/%3E%3C/svg%3E") 8 round;pointer-events:none}
.v:after{content:"";position:absolute;inset:9.2mm;border:.4mm solid var(--gold);pointer-events:none}
.rose{position:absolute;width:62mm;height:62mm;right:-14mm;bottom:-14mm;opacity:.10}
.hd{display:flex;align-items:center;gap:14px;background:var(--navy);color:#fff;border-radius:4mm;padding:6mm 7mm;position:relative}
.hd svg.logo{width:22mm;height:15mm}.brand b{display:block;font-size:22px;letter-spacing:.12em}.brand small{color:#cfdcec;font-size:11.5px}
.hd .ttl{margin-inline-start:auto;text-align:end}.hd .ttl b{display:block;color:var(--gold);font-size:19px;letter-spacing:.06em;text-transform:uppercase}.hd .ttl span{font-size:12.5px;color:#dbe6f2}
.stamp{position:absolute;top:44mm;inset-inline-end:16mm;transform:rotate(-12deg);border:1mm solid var(--terra);color:var(--terra);font:800 17px/1 inherit;letter-spacing:.14em;padding:3mm 5mm;border-radius:2mm;opacity:.85}
h1{font-size:23px;margin:8mm 0 1mm;color:var(--navy)}.sub{color:var(--muted);margin:0 0 5mm;font-size:14px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-bottom:5mm}
.cell{background:#fff;border:.3mm solid #eadfc8;border-radius:2.5mm;padding:3mm}.cell small{display:block;color:var(--muted);font-size:10.5px;text-transform:uppercase;letter-spacing:.05em}.cell b{font-size:14px}
h2{font-size:12.5px;text-transform:uppercase;letter-spacing:.09em;color:var(--sky);margin:5mm 0 2mm;display:flex;align-items:center;gap:6px}
h2:after{content:"";flex:1;height:.4mm;background:linear-gradient(90deg,var(--gold),transparent)}
table{width:100%;border-collapse:collapse;font-size:12.5px}td,th{padding:1.7mm 2mm;text-align:start;vertical-align:top;border-bottom:.25mm solid #eadfc8}th{color:var(--muted);font-weight:600;font-size:11px}
.route{display:flex;flex-wrap:wrap;gap:2mm;align-items:center;font-size:13px}.route span{background:var(--navy);color:#fff;border-radius:20px;padding:1.2mm 3.5mm}.route i{color:var(--gold);font-style:normal}
.inc{columns:2;font-size:12.5px;margin:0;padding-inline-start:5mm}.inc li{margin-bottom:1mm}
.ft{display:flex;gap:6mm;align-items:center;margin-top:6mm;background:#fff;border:.3mm solid #eadfc8;border-radius:3mm;padding:4mm}
.ft .qr{width:28mm;height:28mm;flex:none}.ft .qr svg,.ft .qr img{width:100%;height:100%}.ft p{margin:0 0 1.5mm;font-size:12px}.ft b{color:var(--navy)}
.legal{font-size:10.5px;color:var(--muted);margin-top:4mm;text-align:center}
[dir=rtl] .route i{transform:scaleX(-1);display:inline-block}
.req th{color:var(--ink);font-weight:600;font-size:12px}
@media print{.v{page-break-inside:auto}table,tr{page-break-inside:avoid}}
@media (max-width:820px){.v{width:auto;min-height:0;margin:10px;padding:12mm 9mm}.grid{grid-template-columns:repeat(2,1fr)}.inc{columns:1}.stamp{top:38mm}}
@media print{@page{size:A4;margin:0}body{background:#fff}.bar{display:none}.v{margin:0;box-shadow:none;width:210mm}}
"""

ROSE = ('<svg class="rose" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#12355b" stroke-width="1.6">'
        + "".join(f'<ellipse cx="50" cy="26" rx="9" ry="22" transform="rotate({a} 50 50)"/>' for a in range(0, 360, 30))
        + '<circle cx="50" cy="50" r="12"/><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="46"/></g>'
        '<circle cx="50" cy="50" r="6" fill="#c8553d"/></svg>')

JS = r"""
(function(){
  var C=window.MN_V, P=new URLSearchParams(location.search), ref=P.get("ref")||"", key=P.get("k")||"";
  var lang=(P.get("lang")||"").toLowerCase(), L, box=document.getElementById("v"), st=document.getElementById("st");
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function lab(){L=C.labels[lang]||C.labels.en;document.documentElement.lang=lang||"en";document.documentElement.dir=lang==="ar"?"rtl":"ltr";}
  lab(); st.textContent=L.wait;
  var UZM=["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentyabr","oktyabr","noyabr","dekabr"];
  function d(x,add){if(!x)return"—";var t=new Date(x+"T12:00:00");if(add)t.setDate(t.getDate()+add);if(lang==="uz")return t.getFullYear()+"-yil "+t.getDate()+"-"+UZM[t.getMonth()];try{return t.toLocaleDateString(lang==="zh"?"zh-CN":(lang||"en"),{day:"numeric",month:"long",year:"numeric"});}catch(e){return x;}}
  function load(src){return new Promise(function(ok,no){var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
  if(!ref||key.length<16){st.textContent=L.bad;return;}
  var sb=window.supabase.createClient(window.MN_SB.url,window.MN_SB.anonKey);
  sb.rpc("get_voucher",{p_ref:ref,p_key:key}).then(async function(r){
    var v=r.data; if(r.error||!v){st.textContent=L.bad;return;}
    if(!lang) lang=(v.kind==="b2c"&&C.labels[v.lang])?v.lang:"en"; lab();
    try{await load("assets/data/l10n/"+(C.labels[lang]?lang:"en")+".js");}catch(e){}
    var T=(window.MN_TOURS||{})[v.tour_id]||null, M=window.MN_L||{}, name=function(g,id){var x=(M[g]||{})[id];return x?(Array.isArray(x)?x[0]:x):id;};
    var days=T?T.days.length:null, nights=T?T.days.filter(function(x){return x.sleep;}).length:null;
    var title=(M.tours&&M.tours[v.tour_id]&&M.tours[v.tour_id][0])||v.tour_title||"";
    var det=v.details||{}, cfg=v.config||{}, full=v.kind==="b2b"||!v.total||(+v.paid||0)>=(+v.total||0)-0.5, DT=full?L.title:L.conf_title;
    var trav=(v.travellers||[]).map(function(t,i){return'<tr><td>'+(i+1)+'</td><td><b>'+esc(((t.last||"")+" "+(t.first||"")).trim()||t.name||"")+'</b></td><td>'+esc(t.nationality||t.citizenship||v.citizenship||"")+'</td><td>'+esc(t.passport||"")+'</td></tr>';}).join("");
    var cells=[[full?L.no:"№",v.ref],[L.dates,d(v.start_date)+(days?" — "+d(v.start_date,days-1):"")],[L.tour,days?L.dur.replace("{d}",days).replace("{n}",nights):""],[L.pax,v.pax]];
    if(v.kind==="b2b") cells.push([L.agency,v.agency]); else cells.push([L.lead,v.lead]);
    cells.push([L.hotel,name("hotels",det.hotel||cfg.hotel||(T&&T.hotel))]); if(det.room) cells.push([L.room,{twin_share:"Twin (shared)",twin:"Twin",single:"Single"}[det.room]||det.room]);
    cells.push([L.guide,det.guide_lang||cfg.guide||"English"]); var iss=v.issued?new Date(v.issued):new Date(); cells.push([L.issued,d(iss.getFullYear()+"-"+String(iss.getMonth()+1).padStart(2,"0")+"-"+String(iss.getDate()).padStart(2,"0"))]);
    var route="",prog="";
    if(T){var seq=[];T.days.forEach(function(x){if(x.sleep){var l=seq[seq.length-1];if(l&&l.c===x.sleep)l.n++;else seq.push({c:x.sleep,n:1});}});
      route='<div class="route">'+seq.map(function(s){return'<span>'+esc(name("cities",s.c))+' · '+s.n+' '+(s.n>1?L.nights:L.night)+'</span>';}).join('<i>→</i>')+'</div>';
      prog='<table><thead><tr><th>'+L.day+'</th><th>'+L.dates+'</th><th>'+L.route+'</th><th>'+L.prog+'</th></tr></thead><tbody>'+T.days.map(function(x,i){
        var mv=(x.move||[]).map(function(m){return name("cities",m[0])+" → "+name("cities",m[1]);}).join(", ");
        return'<tr><td><b>'+(i+1)+'</b></td><td>'+esc(d(v.start_date,i))+'</td><td>'+esc(mv||name("cities",x.sleep||(x.stops[0]||{}).city||""))+(x.sleep?'':' · '+L.end)+'</td><td>'+esc(x.stops.map(function(s){return name("sights",s.id);}).join(" · "))+'</td></tr>';}).join("")+'</tbody></table>';}
    var inc=T?'<h2>'+L.inc+'</h2><ul class="inc">'+T.inc.map(function(k){return'<li>'+esc(name("items",k))+'</li>';}).join("")+'</ul>':"";
    var svc=(v.services||[]).length?'<h2>'+L.svc+'</h2><table><tbody>'+v.services.map(function(s){return'<tr><td><b>'+esc(s.title)+'</b><br><small>'+esc([s.city,s.from?d(s.from)+(s.to?" — "+d(s.to):""):""].filter(Boolean).join(" · "))+'</small></td><td>'+esc(s.conf?L.conf+" "+s.conf:"")+'</td><td>'+esc(s.contact||"")+'</td></tr>';}).join("")+'</tbody></table>':"";

    var mny=function(n){return"$"+Number(n||0).toLocaleString("en-US",{maximumFractionDigits:2});};
    var client=v.kind==="b2c"?'<h2>'+L.client+'</h2><table><tbody><tr><th style="width:34%">'+esc(L.lead)+'</th><td><b>'+esc(v.lead)+'</b>'+(v.citizenship?' · '+esc(v.citizenship):'')+'</td></tr><tr><th>'+esc(L.contacts_c)+'</th><td>'+esc([v.email,v.phone].filter(Boolean).join(" · "))+'</td></tr></tbody></table>':'';
    var payb="";
    if(v.kind==="b2c"&&v.total){var bal=Math.max(0,(+v.total)-(+v.paid||0));
      payb='<h2>'+L.payment+'</h2><table><tbody><tr><th style="width:34%">'+esc(L.total)+'</th><td><b>'+mny(v.total)+'</b></td></tr><tr><th>'+esc(L.paidl)+'</th><td><b>'+mny(v.paid)+'</b>'+((v.payments||[]).length?' <small>('+v.payments.map(function(p){return d(p.on)+" — "+mny(p.amount);}).join("; ")+')</small>':'')+'</td></tr>'+
        (bal>0?'<tr><th>'+esc(L.bal)+'</th><td><b style="color:var(--terra)">'+mny(bal)+'</b>'+(v.balance_due?' — '+esc(L.due)+' '+esc(d(v.balance_due)):'')+'</td></tr>':'')+'</tbody></table>'+(full?'':'<p class="sub" style="margin:2mm 0 0">'+esc(L.confirmed_txt)+'</p>');}
    var R=C.req, reqb='<h2>'+L.req+'</h2><table class="req"><tbody><tr><th style="width:34%">'+esc(R.company)+'</th><td>'+esc(L.addr)+': '+esc(R.address)+'</td></tr><tr><th>'+esc(L.inn)+': '+esc(R.inn)+'</th><td>'+esc(L.bank)+': '+esc(R.bank)+' · '+esc(L.mfo)+': '+esc(R.mfo)+'</td></tr><tr><th>'+esc(L.acc)+'</th><td>'+esc(R.account)+'</td></tr><tr><th>'+esc(L.lic)+'</th><td>№ '+esc(R.license)+' ('+esc(R.license_reg)+')</td></tr></tbody></table>';
    var url=location.origin+location.pathname+"?ref="+encodeURIComponent(ref)+"&k="+encodeURIComponent(key);
    var qr=""; try{var q=qrcode(0,"M");q.addData(url);q.make();qr=q.createSvgTag({cellSize:3,margin:0});}catch(e){}
    box.innerHTML=C.rose+'<header class="hd">'+C.logo+'<div class="brand"><b>MOVIY NOMAD</b><small>MOVIY TRAVEL XK · '+esc(C.licence)+'</small></div><div class="ttl"><b>'+esc(DT)+'</b><span>'+esc(v.ref)+'</span></div></header>'+
      '<div class="stamp">'+esc(full?L.paid:L.part)+'</div><h1>'+esc(title)+'</h1><p class="sub">'+esc(d(v.start_date))+(days?' — '+esc(d(v.start_date,days-1)):'')+'</p>'+
      '<div class="grid">'+cells.filter(function(c){return c[1];}).map(function(c){return'<div class="cell"><small>'+esc(c[0])+'</small><b>'+esc(c[1])+'</b></div>';}).join("")+'</div>'+
      client+payb+(route?'<h2>'+L.route+'</h2>'+route:'')+(trav?'<h2>'+L.pax+'</h2><table><tbody>'+trav+'</tbody></table>':'')+svc+(prog?'<h2>'+L.prog+'</h2>'+prog:'')+inc+reqb+
      '<div class="ft"><div class="qr" title="'+esc(L.verify)+'">'+qr+'</div><div><p><b>'+esc(L.contacts)+':</b> WhatsApp '+esc(C.phone)+' · Telegram @'+esc(C.telegram)+'</p><p>'+esc(L.note)+'</p><p><small>'+esc(L.verify)+'</small></p></div></div>'+
      '<p class="legal">'+esc(C.company)+'</p>';
    st.hidden=true; box.hidden=false; document.getElementById("bar").hidden=false;
    document.getElementById("b-dl").textContent=L.dl; document.getElementById("b-pr").textContent=L.print; document.title=DT+" "+v.ref+" — Moviy Nomad";
  });
  document.getElementById("b-pr").onclick=function(){window.print();};
  document.getElementById("b-dl").onclick=async function(){
    var b=this; b.disabled=true;
    try{var cv=await html2canvas(box,{scale:2,backgroundColor:"#fffaf0",useCORS:true});
      var pdf=new window.jspdf.jsPDF({unit:"mm",format:"a4"}), W=210, H=cv.height*W/cv.width, img=cv.toDataURL("image/jpeg",0.92), y=0;
      while(y<H-0.5){if(y>0)pdf.addPage();pdf.addImage(img,"JPEG",0,-y,W,H);y+=297;}
      pdf.save("Moviy-Nomad-voucher-"+ref+".pdf");}catch(e){window.print();}
    b.disabled=false;};
})();
"""


def write(root, cfg, logo):
    company = f'MOVIY TRAVEL XK · {cfg["address"]} · {cfg["phone"]} · Licence № {cfg["license"]} ({cfg["license_reg"]})'
    data = {"labels": LABELS, "logo": logo.replace('<svg ', '<svg class="logo" ', 1), "rose": ROSE,
            "licence": "Licence № " + cfg["license"], "req": {k: cfg[k] for k in ("company","address","inn","bank","mfo","account","license","license_reg")}, "phone": cfg["phone"], "telegram": cfg["telegram"], "company": company}
    html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Voucher — Moviy Nomad</title><style>{CSS}</style></head>
<body><div class="bar" id="bar" hidden><button id="b-dl">Download PDF</button><button class="ghost" id="b-pr">Print</button></div>
<p class="state" id="st">…</p><article class="v" id="v" hidden></article>
<script>window.MN_V={json.dumps(data, ensure_ascii=False)};</script>
<script src="assets/vendor/supabase.js"></script><script src="assets/js/sb-config.js"></script>
<script src="assets/data/tours.js"></script><script src="assets/vendor/qrcode.js"></script>
<script src="assets/vendor/html2canvas.min.js"></script><script src="assets/vendor/jspdf.umd.min.js"></script>
<script>{JS}</script></body></html>"""
    open(os.path.join(root, "voucher.html"), "w", encoding="utf-8").write(html)
