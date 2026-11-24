import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang, Text } from "./products";

/** Every UI string as [Arabic, English]. Arabic is the default. */
const DICT = {
  "nav.home": ["الرئيسية", "Home"],
  "nav.shop": ["المتجر", "Shop"],
  "nav.business": ["للشركات", "For business"],
  "nav.blog": ["المدونة", "Blog"],
  "title.blog": ["المدونة | إن قو", "Blog | INGO"],
  "blog.brand": ["إن قو", "INGO"],
  "blog.eyebrow": ["مدونة إن قو", "INGO blog"],
  "blog.title": ["كل شي|عن القهوة", "All about|coffee"],
  "blog.sub": ["وصفات تحضير، ونصائح لحفظ القهوة، وشرح بسيط لعالم القهوة المختصة.", "Brew recipes, storage tips and simple guides to specialty coffee."],
  "blog.min": ["{x} دقائق قراءة", "{x} min read"],
  "blog.read": ["اقرأ المقال", "Read the article"],
  "blog.back": ["كل المقالات", "All articles"],
  "blog.products": ["قهوة تناسب هذا المقال", "Coffees for this article"],
  "blog.more": ["مقالات ثانية", "More articles"],
  "nav.cart": ["السلة", "Cart"],
  "nav.menu": ["القائمة", "Menu"],
  "lang.label": ["اللغة: العربية", "Language: English"],
  "lang.menu": ["اختر اللغة", "Choose language"],
  "nav.skip": ["تخطَّ إلى المحتوى", "Skip to content"],
  "motion.pause": ["إيقاف الحركة", "Pause motion"],
  "motion.play": ["تشغيل الحركة", "Play motion"],
  "brand.tagline": ["إن قو - معك في كل مكـــان", "INGO — with you everywhere"],
  "brand.sub": ["قهوة مختصة سعودية", "Saudi specialty coffee"],

  "choose.q": ["أنت فرد أو منشأة؟", "Are you an individual or a business?"],
  "choose.ind.title": ["أنا فرد", "I'm an individual"],
  "choose.ind.cta": ["تسوّق القهوة", "Shop coffee"],
  "choose.biz.title": ["عندي منشأة", "I have a business"],
  "choose.biz.cta": ["شوف عرض الماكينة", "See the offer"],

  "why.eyebrow": ["ليش إن قو؟", "Why INGO?"],
  "why.title": ["القهوة المختصة،|بدون تعقيـــد", "Specialty coffee,|minus the fuss"],
  "why.1.t": ["سريعة", "Fast"],
  "why.1.b": ["منتجات سريعة التحضير ومكائن خدمة ذاتية تجهّز قهوتك في ثوانٍ.", "Instant products and self-service machines that make your coffee in seconds."],
  "why.2.t": ["مختصة", "Specialty"],
  "why.2.b": ["حبوب قهوة مختصة بثلاثة أحجام.", "Specialty coffee beans in three sizes."],
  "why.3.t": ["صناعة سعودية", "Saudi made"],
  "why.3.b": ["علامة سعودية، صُنعت في المملكة.", "A Saudi brand, made in the Kingdom."],
  "why.4.t": ["في كل مكان", "Everywhere"],
  "why.4.b": ["في البيت، وفي الدوام، ومن البقالة اللي جنبك.", "At home, at work, or from the baqala down the street."],

  "about.eyebrow": ["عن إن قو", "About INGO"],
  "about.title": ["علامة قهوة|سعوديـــة", "A Saudi|coffee brand"],
  "about.p1": ["إن قو علامة قهوة سعودية. نبيع حبوب القهوة المختصة والمنتجات سريعة التحضير للأفراد، ونوفّر ماكينات مشروبات للبقالات والميني ماركت والسوبرماركت والمطاعم والكافتيريات.", "INGO is a Saudi coffee brand. We sell specialty beans and instant products to individuals, and supply beverage machines to baqalas, mini markets, supermarkets, restaurants and cafeterias."],

  "foot.about": ["إن قو علامة قهوة سعودية: حبوب مختصة، ومنتجات سريعة التحضير، ومكائن خدمة ذاتية للمتاجر.", "INGO is a Saudi coffee brand selling specialty beans, instant products and self-service machines for stores."],
  "foot.explore": ["استكشف", "Explore"],
  "foot.contact": ["تواصل معنا", "Contact"],
  "foot.rights": ["© 2026 إن قو. جميع الحقوق محفوظة.", "© 2026 INGO. All rights reserved."],

  "shop.eyebrow": ["متجر إن قو", "INGO store"],
  "shop.title": ["قهوتك،|توصلك لين بـــابك", "Your coffee,|delivered"],
  "shop.all": ["الكل", "All"],
  "shop.beans": ["حبوب القهوة", "Coffee beans"],
  "shop.instant": ["المنتجات السريعة", "Instant products"],
  "shop.add": ["أضف للسلة", "Add to cart"],
  "shop.added": ["تمت الإضافة إلى السلة", "Added to cart"],
  "shop.view": ["عرض السلة", "View cart"],
  "shop.vat": ["شامل الضريبة", "incl. VAT"],
  "shop.size": ["الحجم", "Size"],
  "shop.filter": ["تصفية المنتجات", "Filter products"],

  "cart.title": ["سلة المشتريـــات", "Your cart"],
  "cart.empty": ["سلتك فاضية", "Your cart is empty"],
  "cart.emptyCta": ["ابدأ التسوق", "Start shopping"],
  "cart.subtotal": ["المجموع الفرعي", "Subtotal"],
  "cart.shipping": ["الشحن", "Shipping"],
  "cart.free": ["مجاني", "Free"],
  "cart.total": ["الإجمالي", "Total"],
  "cart.toFree": ["باقي {x} للشحن المجاني", "{x} away from free shipping"],
  "cart.gotFree": ["طلبك مؤهل للشحن المجاني", "Your order ships free"],
  "cart.checkout": ["إتمام الطلب", "Checkout"],
  "cart.remove": ["حذف", "Remove"],
  "cart.less": ["إنقاص الكمية", "Decrease quantity"],
  "cart.more": ["زيادة الكمية", "Increase quantity"],

  "ship.time": ["التوصيل خلال 2–5 أيام عمل", "Delivery in 2–5 working days"],
  "pay.accepted": ["طرق الدفع المتاحة", "We accept"],
  "co.name": ["الاسم الكامل", "Full name"],
  "co.phone": ["رقم الجوال", "Mobile number"],
  "co.city": ["المدينة", "City"],
  "co.address": ["العنوان / الحي", "Address / district"],
  "co.notes": ["ملاحظات (اختياري)", "Notes (optional)"],

  "biz.eyebrow": ["إن قو للأعمال", "INGO for business"],
  "biz.title": ["ماكينة إن قو|في متجـــرك", "An INGO machine|in your store"],
  "biz.sub": ["خذ ماكينة إن قو مجاناً بعقد إعارة 6 أو 12 شهراً. تبقى الماكينة ملكاً لإن قو والصيانة مجانية، وتشتري المواد من إن قو على قدر استهلاكك بدون حد أدنى. وإذا تبغى تملكها، سعرها 2,500 ⃁ شامل الضريبة مع ضمان سنتين. التوصيل والتركيب مجاني في الرياض وجدة والدمام والمدينة المنورة.", "Get an INGO machine free on a 6- or 12-month loan. The machine stays INGO's property, maintenance is free, and you buy supplies from INGO as you use them, with no minimum. If you'd rather own it, it costs ⃁ 2,500 including VAT and comes with a 2-year warranty. Delivery and installation are free in Riyadh, Jeddah, Dammam and Madinah."],
  "biz.brochure": ["عرض الكتيب", "View brochure"],
  "biz.brochureSub": ["كل تفاصيل الماكينة في صفحة واحدة", "Everything about the machine on one page"],
  "biz.drinks": ["نكهات", "flavours"],
  "biz.badge.time": ["أقل من 30 ثانية", "< 30s"],
  "biz.badge.drinks": ["أكثر من 10", "10+"],
  "biz.machineAlt": ["ماكينة قهوة إن قو بالخدمة الذاتية", "INGO self-service coffee machine"],

  "biz.feat.title": ["ماكينة تشتغل|لصالح متجـــرك", "A machine that works|for your store"],
  "biz.f1.t": ["جودة ثابتة", "Consistent quality"],
  "biz.f1.b": ["نفس الطعم في كل كوب", "The same taste in every cup"],
  "biz.f2.t": ["مجانية بعقد إعارة", "Free on loan"],
  "biz.f2.b": ["ماكينة من إن قو بدون ما تدفع قيمتها", "An INGO machine you don't pay for"],
  "biz.f3.t": ["سهولة التشغيل", "Easy to operate"],
  "biz.f3.b": ["لوحة تشغيل بسيطة", "A simple control panel"],
  "biz.f4.t": ["تصميم مدمج", "Compact design"],
  "biz.f4.b": ["حجمها صغير ويناسب أغلب المساحات", "Small enough for most spaces"],

  "biz.why": ["لماذا|إن قـــو؟", "Why|INGO?"],
  "biz.w1.t": ["سرعة التحضير", "Fast brewing"],
  "biz.w1.b": ["مدة تحضير الكوب الواحد", "To make one cup"],
  "biz.w2.t": ["تشكيلة نكهات", "Flavour choice"],
  "biz.w2.b": ["تختار منها مشروبي الماكينة", "Pick the machine's two drinks from them"],
  "biz.w3.t": ["استهلاك منخفض", "Low consumption"],
  "biz.w3.b": ["تستهلك ماء وكهرباء قليلة، وصديقة للبيئة", "Uses little water and power, and is eco-friendly"],
  "biz.w4.t": ["صيانة سهلة", "Easy maintenance"],
  "biz.w4.b": ["توفّر عليك الوقت والتكلفة", "Saves you time and money"],

  "biz.places": ["تناسب|محلات كثيـــرة", "Made for|all kinds of stores"],
  "biz.p1": ["البقالات والتموينات والميني ماركت", "Baqalas, groceries & mini markets"],
  "biz.p2": ["السوبرماركت", "Supermarkets"],
  "biz.p3": ["المطاعم والكافتيريات", "Restaurants & cafeterias"],
  "biz.p4": ["محطات الوقود والأكشاك", "Fuel stations & kiosks"],
  "biz.cta": ["سجّل اهتمامك", "Register your interest"],
  "biz.how": ["كيف|تشتغـــل؟", "How|it works"],
  "biz.st1.t": ["سجّل", "Register"], "biz.st1.b": ["عبّئ النموذج ببيانات منشأتك وموقعها والمشروبات اللي تتوقع يطلبها عملاؤك.", "Fill in the form with your business, its location and the drinks you expect customers to order."],
  "biz.st2.t": ["زيارة الموقع", "Site visit"], "biz.st2.b": ["يتواصل معك فريق إن قو ليراجع الموقع (المساحة والكهرباء وحركة العملاء) ويتفق معك على التفاصيل.", "The INGO team contacts you to check the location (space, power and customer flow) and agree the details."],
  "biz.st3.t": ["التركيب", "Installation"], "biz.st3.b": ["نوصل الماكينة ونركّبها مجاناً في الرياض وجدة والدمام والمدينة المنورة، وفي باقي المدن نتفق معك على التفاصيل.", "We deliver and install the machine free in Riyadh, Jeddah, Dammam and Madinah; for other cities we agree the details with you."],
  "biz.st4.t": ["ابدأ التقديم", "Start serving"], "biz.st4.b": ["تقدّم المشروبات لعملائك وتطلب المواد حسب استهلاكك بدون حد أدنى، والصيانة مجانية بعقد الإعارة.", "You serve drinks and order supplies as you use them, with no minimum; maintenance is free on the loan contract."],
  "biz.ben": ["وش|تستفيـــد؟", "What|you get"],
  "biz.ben1": ["ماكينة مجانية بعقد إعارة 6 أو 12 شهراً", "A free machine on a 6- or 12-month loan"],
  "biz.ben2": ["صيانة مجانية ضمن عقد الإعارة", "Free maintenance under the loan contract"],
  "biz.ben3": ["تشتري المواد من إن قو على قدر استهلاكك، بدون حد أدنى", "Buy supplies from INGO as you use them, with no minimum"],
  "biz.ben4": ["توصيل وتركيب مجاني في الرياض وجدة والدمام والمدينة المنورة", "Free delivery and installation in Riyadh, Jeddah, Dammam and Madinah"],
  "biz.ben5": ["تبغى تملكها؟ سعرها 2,500 ⃁ شامل الضريبة مع ضمان سنتين", "Want to own it? It costs ⃁ 2,500 incl. VAT, with a 2-year warranty"],
  "biz.ben6": ["مشروبين تختارهم من أكثر من 10 نكهات", "Two drinks, picked from 10+ flavours"],
  "biz.direct": ["تفضّل التواصل مباشرة؟", "Prefer to talk directly?"],
  "biz.formT": ["نموذج|التسجيـــل", "Registration|form"],
  "biz.formB": ["يستغرق دقائق. الحقول المعلّمة بـ * مطلوبة، وبعد الإرسال يتواصل معك فريق إن قو لمناقشة مناسبة موقعك.", "Takes a few minutes. Fields marked * are required; after you send it, the INGO team will contact you to discuss your location."],
  "biz.g1": ["بيانات المنشأة", "Company information"],
  "biz.g2": ["الشخص المسؤول", "Contact person"],
  "biz.g3": ["تفاصيل المتجر", "Store details"],
  "biz.g4": ["الموقع", "Location"],
  "biz.company": ["اسم المنشأة / المتجر", "Company / store name"],
  "biz.cr": ["رقم السجل التجاري", "Commercial registration (CR) no."],
  "biz.vat": ["الرقم الضريبي", "VAT number"],
  "biz.type": ["نوع النشاط", "Business type"],
  "biz.t.grocery": ["بقالة / تموينات", "Baqala / grocery"],
  "biz.t.mini": ["ميني ماركت", "Mini market"],
  "biz.t.kiosk": ["كشك", "Kiosk"],
  "biz.t.super": ["سوبرماركت", "Supermarket"],
  "biz.t.fuel": ["محطة وقود", "Fuel station"],
  "biz.t.office": ["مكتب / شركة", "Office / company"],
  "biz.t.other": ["أخرى", "Other"],
  "biz.t.restaurant": ["مطعم", "Restaurant"],
  "biz.t.cafeteria": ["كافتيريا", "Cafeteria"],
  "biz.cups": ["كم كوب تتوقع يومياً؟", "Expected cups per day"],
  "biz.cupsUnsure": ["غير متأكد", "Not sure yet"],
  "biz.start": ["متى تبغى تبدأ؟", "When would you like to start?"],
  "biz.start.now": ["في أقرب وقت", "As soon as possible"],
  "biz.start.month": ["خلال شهر", "Within a month"],
  "biz.start.later": ["خلال 1–3 أشهر", "In 1–3 months"],
  "biz.start.unsure": ["لم أحدد بعد", "Not decided yet"],
  "biz.arr": ["الخيار المفضّل", "Preferred option"],
  "biz.arr.loan": ["إعارة مجانية 12 شهراً", "Free loan, 12 months"],
  "biz.arr.loan6": ["إعارة مجانية 6 أشهر", "Free loan, 6 months"],
  "biz.arr.buy": ["شراء الماكينة (2,500 ⃁ شامل الضريبة)", "Buy it (⃁ 2,500 incl. VAT)"],
  "biz.arr.unsure": ["غير متأكد", "Not sure yet"],
  "biz.bev": ["المشروبات المطلوبة", "Preferred drinks"],
  "biz.bev.unsure": ["غير متأكد", "Not sure yet"],
  "optional": ["اختياري", "optional"],
  "biz.contact": ["الاسم الكامل", "Full name"],
  "biz.role": ["المسمى الوظيفي", "Job title"],
  "biz.phone": ["رقم الجوال", "Mobile number"],
  "biz.email": ["البريد الإلكتروني", "Email"],
  "biz.branches": ["عدد الفروع", "Number of branches"],
  "biz.traffic": ["عدد العملاء يومياً (تقريباً)", "Daily customers (approx.)"],
  "biz.space": ["المساحة المتاحة للماكينة", "Space available for the machine"],
  "biz.power": ["يوجد فيش كهرباء قريب؟", "Power outlet nearby?"],
  "biz.yes": ["نعم", "Yes"], "biz.no": ["لا", "No"], "biz.unsure": ["غير متأكد", "Not sure"],
  "biz.hours": ["ساعات العمل", "Opening hours"],
  "biz.h24": ["24 ساعة", "24 hours"], "biz.hday": ["نهاري", "Daytime"], "biz.hlate": ["لين آخر الليل", "Until late"],
  "biz.city": ["المدينة", "City"],
  "biz.district": ["الحي", "District"],
  "biz.maps": ["رابط الموقع على قوقل ماب", "Google Maps link"],
  "biz.notes": ["أي معلومات إضافية؟", "Anything else we should know?"],
  "biz.agree": ["أقر بصحة المعلومات وأوافق على تواصل فريق إن قو معي.", "I confirm the information is correct and agree to be contacted by INGO."],
  "biz.submit": ["إرسال التسجيل", "Submit registration"],
  "biz.doneT": ["تم استلام تسجيلك", "Registration received"],
  "biz.doneB": ["شكراً لك. سيراجع فريق إن قو بياناتك ويتواصل معك على رقم الجوال اللي أرسلته لمناقشة مناسبة الموقع والخطوات التالية.", "Thank you. The INGO team will review your details and contact you on the mobile number you gave to discuss your location and the next steps."],
  "biz.again": ["تسجيل متجر آخر", "Register another store"],

  "biz.faq": ["أسئلة|شائعـــة", "Common|questions"],
  "biz.q1": ["من يملك الماكينة؟", "Who owns the machine?"],
  "biz.a1": ["بعقد الإعارة المجانية تبقى الماكينة ملكاً لإن قو. وإذا اخترت الشراء، تصير الماكينة ملكك.", "On the free-loan contract the machine stays INGO's property. If you choose to buy it, the machine is yours."],
  "biz.q2": ["هل لازم أشتري الماكينة؟", "Do I have to buy the machine?"],
  "biz.a2": ["لا. تقدر تاخذها مجاناً بعقد إعارة 6 أو 12 شهراً، أو تشتريها بـ 2,500 ⃁ شامل الضريبة مع ضمان سنتين.", "No. You can have it free on a 6- or 12-month loan, or buy it for ⃁ 2,500 including VAT, with a 2-year warranty."],
  "biz.q3": ["كيف يتم شراء المواد؟", "How do supplies work?"],
  "biz.a3": ["بعقد الإعارة تشتري مواد الماكينة من إن قو مباشرة حسب استهلاكك. وإذا اشتريت الماكينة، تقدر تشتري المواد من أي مكان.", "On the loan contract you buy the machine's supplies directly from INGO as you use them. If you buy the machine, you can buy supplies anywhere."],
  "biz.q4": ["هل فيه حد أدنى للشراء؟", "Is there a minimum purchase?"],
  "biz.a4": ["لا، ما فيه حد أدنى للشراء. تطلب المواد حسب استهلاكك الفعلي.", "No, there's no minimum purchase. You order supplies based on your actual usage."],
  "biz.q5": ["وش يصير إذا تغيّر الاستهلاك؟", "What if my consumption changes?"],
  "biz.a5": ["ما فيه حد أدنى، فتطلب على قدر حاجتك سواء زاد الاستهلاك أو قلّ.", "There's no minimum, so you order what you need as your usage goes up or down."],
  "biz.q6": ["أي أنواع المنشآت تناسبها الماكينة؟", "Which businesses is it suited to?"],
  "biz.a6": ["البقالات والميني ماركت والسوبرماركت والأكشاك ومتاجر محطات الوقود والمطاعم والكافتيريات، وغيرها من المواقع المناسبة.", "Baqalas, mini markets, supermarkets, kiosks, fuel-station stores, restaurants, cafeterias and other suitable locations."],
  "biz.q7": ["وش يصير بعد ما أرسل النموذج؟", "What happens after I submit the form?"],
  "biz.a7": ["يراجع فريق إن قو بياناتك ويتواصل معك لمناقشة مناسبة الموقع وتفاصيل الاتفاق والخطوات التالية.", "The INGO team reviews your details and contacts you to discuss the location's suitability, the arrangement and next steps."],
  "biz.q8": ["كيف يتم التركيب والصيانة؟", "How do installation and maintenance work?"],
  "biz.a8": ["التوصيل والتركيب مجاني في الرياض وجدة والدمام والمدينة المنورة، وفي باقي المدن نتفق معك على التفاصيل. الصيانة مجانية بعقد الإعارة، وإذا اشتريت الماكينة عليها ضمان سنتين.", "Delivery and installation are free in Riyadh, Jeddah, Dammam and Madinah; for other cities we agree the details with you. Maintenance is free on the loan contract, and a bought machine has a 2-year warranty."],
  "biz.q9": ["كم مساحة تحتاج، وهل تحتاج كهرباء؟", "How much space and power does it need?"],
  "biz.a9": ["تصميمها مدمج وحجمها صغير يناسب أغلب المساحات، وتحتاج مكاناً قريباً من فيش كهرباء. النموذج يسألك عن المساحة والكهرباء المتوفرة.", "It has a compact design that fits most spaces and needs a spot near a power outlet. The form asks about your available space and power."],
  "biz.q10": ["وش المشروبات وكم ياخذ الكوب؟", "Which drinks, and how fast?"],
  "biz.a10": ["الماكينة تقدّم مشروبين، تختارهم من أكثر من 10 نكهات، وكل كوب يجهز في أقل من 30 ثانية.", "The machine serves two drinks, which you pick from 10+ flavours, and each cup is ready in under 30 seconds."],
  "biz.q11": ["مو متأكد وش يناسب منشأتي؟", "Not sure what suits my business?"],
  "biz.a11": ["اختر «غير متأكد» في النموذج، ويناقش معك فريق إن قو المشروبات والموقع المناسبين لنشاطك.", "Choose \"Not sure\" in the form, and the INGO team will talk through the right drinks and spot for your business."],
  "biz.q12": ["عندي أكثر من فرع، هل أقدر أسجّل؟", "I have more than one branch. Can I register?"],
  "biz.a12": ["نعم. اذكر عدد الفروع في النموذج، ويناقش معك فريق إن قو كل موقع على حدة.", "Yes. Enter the number of branches in the form, and the INGO team will discuss each location with you."],
  "biz.q13": ["هل توصلون لمدينتي؟", "Do you deliver to my city?"],
  "biz.a13": ["نعم، نوصل لجميع مناطق المملكة. التوصيل والتركيب مجاني في الرياض وجدة والدمام والمدينة المنورة، وباقي المدن نتفق عليها معك.", "Yes, we deliver across Saudi Arabia. Delivery and installation are free in Riyadh, Jeddah, Dammam and Madinah; other cities are agreed with you."],
  "biz.q14": ["وش الفرق بين الإعارة والشراء؟", "What's the difference between loan and purchase?"],
  "biz.a14": ["الإعارة: الماكينة مجانية لمدة 6 أو 12 شهراً وتبقى ملكاً لإن قو، والصيانة مجانية، وتشتري المواد من إن قو بدون حد أدنى. الشراء: تدفع 2,500 ⃁ شامل الضريبة، وتصير الماكينة ملكك مع ضمان سنتين، وتشتري المواد من أي مكان.", "Loan: the machine is free for 6 or 12 months and stays INGO's, maintenance is free, and you buy supplies from INGO with no minimum. Purchase: you pay ⃁ 2,500 incl. VAT, the machine is yours with a 2-year warranty, and you can buy supplies anywhere."],
  "biz.q15": ["كم مدة عقد الإعارة؟", "How long is the loan contract?"],
  "biz.a15": ["عقد الإعارة لمدة 6 أشهر أو 12 شهراً، وتختار المدة المناسبة لك في النموذج.", "The loan contract runs for 6 or 12 months; you choose the length that suits you in the form."],
  "biz.q16": ["إذا اشتريت الماكينة، لازم أشتري المواد منكم؟", "If I buy the machine, must I buy supplies from you?"],
  "biz.a16": ["لا. إذا اشتريت الماكينة تقدر تشتري المواد من أي مكان، وعليها ضمان سنتين.", "No. If you buy the machine you can buy supplies anywhere, and it has a 2-year warranty."],

  "store.sort": ["الترتيب", "Sort"],
  "store.sort.default": ["المقترح", "Featured"],
  "store.sort.low": ["السعر: من الأقل", "Price: low to high"],
  "store.sort.high": ["السعر: من الأعلى", "Price: high to low"],
  "store.quick": ["إضافة سريعة", "Quick add"],
  "store.details": ["التفاصيل", "Details"],
  "store.set.title": ["تسوّق|التشكيلـــة", "Shop|the set"],
  "store.set.sub": ["اضغط على أي كيس لتشوف تفاصيله، أو أضف الثلاثة مرة وحدة.", "Tap a bag to see it, or add all three at once."],
  "store.set.addAll": ["أضف الثلاثة للسلة", "Add all three to cart"],
  "store.set.added": ["تمت إضافة التشكيلة للسلة", "The set was added to your cart"],
  "store.set.total": ["المجموع", "Total"],
  "store.set.open": ["عرض {x}", "Show {x}"],
  "pd.use": ["الاستخدام", "Best for"],
  "pd.notes": ["النكهات", "Tasting notes"],
  "pd.sizes": ["الأحجام", "Sizes"],
  "rc.storyTitle": ["عن|هذه القهوة", "About|this coffee"],
  "rc.title": ["طريقة التحضير", "How to brew it"],
  "rc.sub": ["وصفات مقترحة تبدأ منها، وعدّل الطحنة على ذوقك.", "Suggested recipes to start from. Adjust the grind to your taste."],
  "rc.hot": ["V60 حار", "Hot V60"],
  "rc.iced": ["V60 بارد", "Iced V60"],
  "rc.espresso": ["إسبريسو", "Espresso"],
  "rc.temp": ["حرارة الماء", "Water temp"],
  "rc.dose": ["القهوة", "Coffee"],
  "rc.water": ["الماء الحار", "Hot water"],
  "rc.yield": ["في الكوب", "In the cup"],
  "rc.ice": ["الثلج", "Ice"],
  "rc.time": ["الوقت", "Time"],
  "rc.g": ["{x} جم", "{x}g"],
  "rc.ml": ["{x} مل", "{x} ml"],
  "rc.sec": ["{x} ث", "{x}s"],
  "rc.ratio": ["النسبة", "Ratio"],
  "rc.grind": ["الطحنة", "Grind"],
  "rc.pours": ["جدول الصب", "Pour schedule"],
  "rc.bloom": ["صبة التشريب: بلّل القهوة كلها واتركها تنتفخ", "Bloom: wet all the coffee and let it rise"],
  "rc.pourTo": ["صب بهدوء بحركة دائرية حتى يوصل الميزان إلى", "Pour slowly in circles until the scale reads"],
  "rc.iceNote": ["حط {x} جم ثلج في الإبريق قبل ما تبدأ، والقهوة تنزل عليه مباشرة.", "Put {x}g of ice in the jug before you start; the coffee drips straight onto it."],
  "rc.espNote": ["{x} جم قهوة مطحونة تعطي {y} جم إسبريسو في الكوب. استخدم ميزان تحت الكوب.", "{x}g of ground coffee gives {y}g of espresso in the cup. Use a scale under the cup."],
  "rc.tip": ["نصيحة", "Tip"],
  "rc.note": ["الأرقام نقطة بداية: إذا طلع الكوب حامض نعّم الطحنة، وإذا طلع مر خشّنها.", "These numbers are a starting point: grind finer if the cup is sour, coarser if it is bitter."],
  "cof.eyebrow": ["من محمصتنا", "From our roastery"],
  "cof.title": ["تعرّف على|قهوتنا", "Meet|our coffees"],
  "cof.sub": ["كل قهوة ومن وين جات، وطريقة معالجتها، ودرجة تحميصها، مثل ما هي مكتوبة على الكيس.", "Where each coffee comes from, how it was processed and how dark we roast it, as printed on the bag."],
  "cof.origin": ["المنشأ", "Origin"],
  "cof.process": ["المعالجة", "Process"],
  "cof.variety": ["السلالة", "Variety"],
  "cof.body": ["القوام", "Body"],
  "cof.roast": ["درجة التحميص", "Roast level"],
  "cof.brew": ["تنفع لـ", "Brew with"],
  "cof.filter": ["تقطير", "Filter"],
  "cof.espresso": ["إسبريسو", "Espresso"],
  "cof.from": ["يبدأ من {x}", "From {x}"],
  "cof.cta": ["اختر الحجم", "Choose a size"],
  "pd.back": ["العودة للمتجر", "Back to shop"],
  "pd.details": ["تفاصيل الكيس", "Bag details"],
  "pd.zoomHint": ["اختر تفصيلاً للتكبير", "Pick a detail to zoom in"],
  "pd.overview": ["الكيس كامل", "Whole bag"],
  "pd.zipper.t": ["سحّاب قابل لإعادة الإغلاق", "Resealable zipper"],
  "pd.zipper.b": ["سحّاب بشريط سحب أعلى الكيس، تقدر تقفله من جديد بعد كل استخدام.", "A pull-tab zipper runs across the top, so you can reseal the bag after each use."],
  "pd.valve.t": ["صمام مدمج", "Built-in valve"],
  "pd.valve.b": ["صمام مدمج في الكيس.", "A valve built into the bag."],
  "pd.finish.t": ["تشطيب مطفي", "Full matte finish"],
  "pd.finish.b": ["كيس بتشطيب مطفي كامل وزوايا دائرية.", "A full matte bag with rounded corners."],
  "pd.weight.t": ["الوزن الصافي", "Net weight"],
  "pd.weight.b": ["الوزن مطبوع أسفل الكيس: {x}.", "The weight is printed at the bottom of the bag: {x}."],
  "pd.size": ["اختر الحجم", "Choose a size"],
  "pd.qty": ["الكمية", "Quantity"],
  "pd.less": ["إنقاص الكمية", "Decrease quantity"],
  "pd.more": ["زيادة الكمية", "Increase quantity"],
  "pd.add": ["أضف للسلة", "Add to cart"],
  "pd.spec": ["المواصـــفات", "Specifications"],
  "pd.type": ["النوع", "Type"],
  "pd.pack": ["التغليف", "Packaging"],
  "pd.packBag": ["كيس مطفي بسحّاب قابل لإعادة الإغلاق وصمام", "Matte bag with a resealable zipper and a valve"],
  "pd.price": ["السعر", "Price"],
  "pd.related": ["ممكن|يعجبك كمـــان", "You may|also like"],
  "pd.notFound": ["ما لقينا هذا المنتج.", "We couldn't find this product."],
  "cartp.title": ["سلة|المشتريـــات", "Your|cart"],
  "cartp.continue": ["أكمل التسوق", "Continue shopping"],
  "cartp.summary": ["ملخص الطلب", "Order summary"],
  "cartp.vat": ["الأسعار شاملة الضريبة", "Prices include VAT"],
  "cart.page": ["عرض السلة كاملة", "View full cart"],

  "title.home": ["إن قو | قهوة مختصة معك في كل مكان", "INGO | Specialty coffee, with you everywhere"],
  "title.shop": ["المتجر | إن قو", "Shop | INGO"],
  "title.business": ["للشركات | إن قو", "For business | INGO"],
  "title.cart": ["السلة | إن قو", "Cart | INGO"],
  "title.notFound": ["الصفحة غير موجودة | إن قو", "Page not found | INGO"],
  "nf.title": ["الصفحة|غير موجـــودة", "Page|not found"],
  "nf.body": ["الرابط اللي فتحته غير موجود أو تغيّر.", "The link you opened doesn't exist or has changed."],
  "nf.home": ["العودة للرئيسية", "Back to home"],

  "title.checkout": ["إتمام الطلب | إن قو", "Checkout | INGO"],
  "ck.title": ["إتمام|الطلـــب", "Check|out"],
  "ck.step1": ["بيانات التوصيل", "Delivery details"],
  "ck.step2": ["الدفع", "Payment"],
  "ck.next": ["متابعة للدفع", "Continue to payment"],
  "ck.edit": ["تعديل", "Edit"],
  "ck.email": ["البريد الإلكتروني", "Email"],
  "ck.card": ["بطاقة مدى أو فيزا أو ماستركارد", "mada, Visa or Mastercard"],
  "ck.card.number": ["رقم البطاقة", "Card number"],
  "ck.card.name": ["الاسم على البطاقة", "Name on card"],
  "ck.card.nameHint": ["بالإنجليزي، كما هو مكتوب على البطاقة", "As printed on the card"],
  "ck.card.exp": ["تاريخ الانتهاء", "Expiry date"],
  "ck.card.cvc": ["رمز الأمان (CVV)", "Security code (CVV)"],
  "ck.err.number": ["رقم البطاقة غير صحيح", "This card number isn't valid"],
  "ck.err.name": ["اكتب الاسم الأول والأخير بالإنجليزي", "Enter a first and last name in English letters"],
  "ck.err.exp": ["تاريخ الانتهاء غير صحيح أو منتهي", "This expiry date isn't valid or has passed"],
  "ck.err.cvc": ["رمز الأمان من 3 أو 4 أرقام", "The security code is 3 or 4 digits"],
  "ck.pay": ["ادفع {x}", "Pay {x}"],
  "ck.paying": ["جاري الدفع…", "Processing…"],
  "ck.secure": ["بيانات بطاقتك تنتقل مشفّرة مباشرة إلى بوابة الدفع، وما نحفظها عندنا.", "Your card details go encrypted straight to the payment gateway. We don't store them."],
  "ck.sa": ["العنوان المختصر (العنوان الوطني)", "Short address (National Address)"],
  "ck.sa.format": ["4 حروف إنجليزية ثم 4 أرقام، مثل RRRD2929", "4 letters then 4 digits, like RRRD2929"],
  "ck.sa.hint": ["4 حروف و4 أرقام، مثل RRRD2929. تلقاه في تطبيق «سبل» أو في «توكلنا» تحت العنوان الوطني.", "4 letters and 4 digits, like RRRD2929. Find it in the SPL app or in Tawakkalna under National Address."],
  "ck.sa.find": ["ابحث", "Find"],
  "ck.sa.found": ["لقينا عنوانك، تأكد منه تحت", "Address found. Please check it below"],
  "ck.sa.notFound": ["ما لقينا هذا العنوان المختصر، اكتب العنوان بنفسك", "We couldn't find that short address. Please type your address"],
  "ck.loc": ["حدّد موقعي على الخريطة", "Pin my location"],
  "ck.loc.again": ["حدّد موقعي مرة ثانية", "Pin my location again"],
  "ck.loc.done": ["تم تحديد الموقع، شوفه على خرائط Google", "Location pinned. View it on Google Maps"],
  "ck.loc.fail": ["ما قدرنا نحدد موقعك. تأكد إنك سمحت للمتصفح بالموقع", "Couldn't get your location. Check that the browser may use it"],
  "ck.3ds": ["ممكن يطلب منك البنك رمز تحقق بعد الضغط على ادفع.", "Your bank may ask for a verification code after you tap Pay."],
  "ck.apple.hint": ["ادفع ببصمة الوجه أو الإصبع من جهاز Apple.", "Pay with Face ID or Touch ID on your Apple device."],
  "ck.apple.off": ["Apple Pay يشتغل في متصفح Safari على أجهزة Apple المفعّل فيها Apple Pay.", "Apple Pay works in Safari on Apple devices that have Apple Pay set up."],
  "ck.off": ["الدفع الإلكتروني غير مفعّل بعد في المتجر، فما نقدر نستقبل الطلبات أونلاين حالياً.", "Online payment isn't switched on for this store yet, so orders can't be paid online right now."],
  "ck.failed": ["ما تم الدفع", "Payment didn't go through"],
  "ck.cancelled": ["تم إلغاء الدفع", "Payment cancelled"],
  "res.paidT": ["تم الدفع واستلمنا طلبك", "Payment received, order placed"],
  "res.paidB": ["شكراً لك. يوصلك طلبك خلال 2–5 أيام عمل، وبيتواصل معك فريقنا لتأكيد التوصيل.", "Thank you. Your order arrives in 2–5 working days, and our team will contact you to confirm delivery."],
  "res.ref": ["رقم الطلب", "Order number"],
  "res.pay": ["رقم العملية", "Payment reference"],
  "res.failB": ["تقدر تحاول مرة ثانية أو تختار طريقة دفع ثانية. سلتك محفوظة.", "You can try again or choose another payment method. Your cart is saved."],
  "res.retry": ["حاول مرة ثانية", "Try again"],
  "res.pendingT": ["الدفع قيد المعالجة", "Payment is processing"],
  "res.pendingB": ["ما وصلنا تأكيد الدفع للحين. إذا انخصم المبلغ، تواصل معنا وأعطنا رقم العملية.", "We haven't received payment confirmation yet. If you were charged, contact us with the payment reference."],
  "bnpl.tabby": ["تابي", "Tabby"],
  "bnpl.tamara": ["تمارا", "Tamara"],
  "bnpl.split4": ["4 دفعات بدون فوائد", "4 interest-free payments"],
  "bnpl.note": ["أو 4 دفعات بقيمة {x} بدون فوائد مع", "Or 4 interest-free payments of {x} with"],
  "bnpl.title": ["قسّمها على 4 دفعات مع {x}", "Split it into 4 payments with {x}"],
  "bnpl.body": ["تكمل الدفع في صفحة {x}، وتوافق {x} على الطلب حسب شروطها.", "You'll finish on {x}'s page, and {x} approves the order under its own terms."],
  "bnpl.continue": ["متابعة مع {x}", "Continue with {x}"],
  "bnpl.off": ["الدفع بالتقسيط مع {x} غير مفعّل بعد في المتجر.", "Paying in instalments with {x} isn't switched on for this store yet."],
  "res.cancelledB": ["ما تم الدفع لأنك ألغيت العملية. سلتك محفوظة وتقدر تكمل متى ما تبي.", "The payment was cancelled. Your cart is saved, so you can finish whenever you like."],
  "roast.title": ["من المحمصة|إلى كوبـــك", "From the roaster|to your cup"],
  "roast.1.t": ["نختار البن الأخضر", "We pick the green coffee"],
  "roast.1.b": ["نختار حبوب البن قبل التحميص، ونتأكد من جودتها بأنفسنا.", "We choose the beans before roasting and check their quality ourselves."],
  "roast.2.t": ["نحمّص ونغلّف", "We roast and pack"],
  "roast.2.b": ["التحميص والتغليف يصير في محمصة إن قو.", "Roasting and packing both happen at the INGO roastery."],
  "roast.3.t": ["في متاجرنا وفروعنا", "In our stores and branches"],
  "roast.3.b": ["تلقى قهوتنا في متاجر إن قو وفروعها.", "You'll find our coffee in INGO's stores and branches."],
  "about.roast": ["نحمّص قهوتنا بأنفسنا في محمصة إن قو، عشان كل كيس وكل كوب يطلع بنفس الجودة.", "We roast our coffee ourselves at INGO's roastery, so every bag and every cup comes out the same."],
  "home.hint": ["اختر واحد، وينقلك للصفحة الخاصة فيه.", "Pick one and you will go straight to its page."],
  "home.ind.sub": ["قهوة لبيتك وشغلك", "Coffee for home and work"],
  "home.biz.sub": ["ماكينة قهوة لمتجرك", "A coffee machine for your store"],
  "roast.eyebrow": ["من محمصتنا", "From our roastery"],
  "roast.4.t": ["جرّبها واحكم", "Try it and decide"],
  "roast.4.b": ["جرّب قهوتنا بنفسك، والحكم لك.", "Taste it yourself and make up your own mind."],
  "shop.offers": ["عروض ومميزات المتجر", "Store offers and highlights"],
  "foot.vat": ["الرقم الضريبي", "VAT no."],
  "foot.cr": ["السجل التجاري", "CR no."],
  "foot.whatsapp": ["واتساب", "WhatsApp"],
  "biz.drinks.eyebrow": ["ماكينة 2 مشروب من إن قو", "The INGO 2-drink machine"],
  "biz.drinks.title": ["اختر مشروبين|لماكينتك", "Pick two drinks|for your machine"],
  "biz.drinks.sub": ["أكثر من 10 نكهات، منها هذي. اختر اثنين:", "More than 10 flavours, including these. Pick two:"],
  "biz.drinks.count": ["اخترت {x} من 2", "{x} of 2 picked"],
  "biz.drinks.full": ["اخترت مشروبين. لتغيير واحد، ألغِ اختياره أول.", "You have picked two. To swap one, untick it first."],
  "biz.drinks.empty": ["اختر مشروب", "Pick a drink"],
  "biz.drinks.cta": ["سجّل بهذين المشروبين", "Register with these two drinks"],
  "biz.drink.screen": ["على الماكينة", "On the machine"],
  "flv.3in1": ["قهوة 3 في 1", "3-in-1 coffee"],
  "flv.karak": ["شاي كرك بالهيل", "Karak tea with cardamom"],
  "flv.karakLow": ["شاي كرك قليل السكر", "Low-sugar karak tea"],
  "flv.espresso": ["إسبريسو فوري", "Instant espresso"],
  "flv.choc": ["شوكولاتة", "Hot chocolate"],
  "flv.hazelnut": ["كابتشينو بالبندق", "Hazelnut cappuccino"],
  "flv.vanilla": ["كابتشينو بالفانيليا", "Vanilla cappuccino"],
  "form.required": ["يرجى تعبئة الحقول المطلوبة", "Please fill in the required fields"],
  "form.error": ["تعذّر الإرسال، حاول مرة ثانية", "Couldn't send. Please try again."],
} as const satisfies Record<string, readonly [string, string]>;

export type DictKey = keyof typeof DICT;

/** Invisible separator (U+2063) between the Black and Light parts of a headline. */
export const SPLIT = "⁣";

/** Saudi Riyal sign (U+20C1); rendered by the "Saudi Riyal" font. Always shown to the left of the amount. */
export const RIYAL = "⃁";

/** Languages offered in the header menu. To add one later: add its code to `Lang`, a column to DICT, and an entry here. */
export const LANGUAGES: { code: Lang; name: string; dir: "rtl" | "ltr" }[] = [
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "en", name: "English", dir: "ltr" },
];

interface I18n {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (key: DictKey, vars?: Record<string, string>) => string;
  L: (text: Text) => string;
  money: (n: number) => string;
  /** size label for display: 250g → 250 جم in Arabic; raw values stay for data */
  sz: (w: string) => string;
  /** correctly pluralised count, e.g. ar: منتج واحد / منتجان / 3 منتجات / 11 منتجاً */
  count: (n: number, unit: "product" | "piece") => string;
  /** a bare number in the page's digits (Arabic-Indic in Arabic) */
  num: (n: number) => string;
  /** form range labels: "100-300" → 100–300, "< 1 m²" → أقل من 1 م², "600+" → أكثر من 600 */
  range: (v: string) => string;
  toggle: () => void;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<I18n | null>(null);

function readLang(): Lang {
  try {
    return localStorage.getItem("ingo-lang") === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try { localStorage.setItem("ingo-lang", lang); } catch { /* private mode */ }
  }, [lang, dir]);

  const toggle = useCallback(() => setLang((l) => (l === "ar" ? "en" : "ar")), []);

  const value = useMemo<I18n>(() => {
    const i = lang === "ar" ? 0 : 1;
    const nf = new Intl.NumberFormat(lang === "ar" ? "ar-SA-u-nu-latn" : "en-US"); // 123 digits in both languages
    return {
      lang, dir, toggle, setLang,
      t: (key, vars) => {
        // "|" marks the Black/Light split for <Display>; elsewhere it reads as a plain space
        let s = DICT[key][i].replace("|", ` ${SPLIT}`);
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
        return s;
      },
      L: (text) => text[lang],
      sz: (w) => {
        if (lang === "en") return w === "10×" ? "10 pcs" : w;
        const m = /^(\d+)(g|kg)$/.exec(w);
        if (m) return `${nf.format(Number(m[1]))} ${m[2] === "g" ? "جم" : "كجم"}`;
        return w === "10×" ? "10 قطع" : w;
      },
      count: (n, unit) => {
        if (lang === "en") return `${n} ${unit}${n === 1 ? "" : "s"}`;
        const f = unit === "product"
          ? { zero: "لا منتجات", one: "منتج واحد", two: "منتجان", few: "منتجات", many: "منتجاً", other: "منتج" }
          : { zero: "لا قطع", one: "قطعة واحدة", two: "قطعتان", few: "قطع", many: "قطعة", other: "قطعة" };
        const cat = new Intl.PluralRules("ar").select(n) as keyof typeof f;
        return cat === "zero" || cat === "one" || cat === "two" ? f[cat] : `${nf.format(n)} ${f[cat]}`;
      },
      money: (n) => (lang === "ar" ? `${nf.format(n)} ${RIYAL}` : `${RIYAL} ${nf.format(n)}`),
      num: (n) => nf.format(n),
      range: (v) => {
        const unit = / ?m²/.test(v) ? (lang === "ar" ? " م²" : " m²") : "";
        const core = v.replace(/ ?m²/g, "").trim();
        const d = (x: string) => nf.format(Number(x));
        let m;
        if ((m = /^< ?(\d+)$/.exec(core))) return lang === "ar" ? `أقل من ${d(m[1])}${unit}` : `Under ${m[1]}${unit}`;
        if ((m = /^(\d+)\+$/.exec(core))) return lang === "ar" ? `أكثر من ${d(m[1])}${unit}` : `${m[1]}+${unit}`;
        if ((m = /^(\d+)-(\d+)$/.exec(core))) return `${d(m[1])}–${d(m[2])}${unit}`;
        return v;
      },
    };
  }, [lang, dir, toggle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
