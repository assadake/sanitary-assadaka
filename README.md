# شركة الصداقة الراقية · مواد صحية وسيراميك

متجر إلكتروني عربي (RTL) وإنجليزي (LTR) لمواد البناء والمواد الصحية والسيراميك، مستوحى من صفحة [الصداقة للمواد الصحية والسيراميك](https://www.facebook.com/AssadakaARAQIA/). صفحة الشركة تذكر علامات **IDEAL** و**TURKUAZ** و**CeraStyle**. الأسعار والتوفر والضمان غير مثبتة في الكتالوج الابتدائي؛ يعرض الموقع «السعر عند الاستفسار» إلى أن تحدّثها الشركة في قاعدة البيانات.

## التقنية

| الطبقة | التقنية |
| --- | --- |
| الواجهة | React 19 + TypeScript + Tailwind CSS 4 + Vite 7 |
| الخادم/API | Express + Node.js |
| قاعدة البيانات | PostgreSQL عبر Neon |
| الاستضافة | Render Web Service (`render.yaml`) |
| الصور | Pexels CDN |

## النشر على Render وNeon

الموقع وخادم الـ API يعملان في خدمة Render واحدة. يحتاج الخادم إلى المتغير السري `DATABASE_URL` الذي يحتوي على رابط اتصال Neon، ويفضل الرابط المجمع (*pooled connection string*) مع `sslmode=require`.

1. أنشئ قاعدة PostgreSQL على [Neon](https://neon.tech) وانسخ رابط الاتصال.
2. افتح خدمة الموقع في [Render](https://dashboard.render.com)، ثم **Environment** وأضف متغيراً اسمه `DATABASE_URL` والصق الرابط كقيمة سرية.
3. أعد النشر. ينشئ الخادم الجداول تلقائياً (`products`, `orders`, `app_settings`) ويهيّئ الكتالوج الابتدائي عند الحاجة.
4. افحص `https://YOUR-SERVICE.onrender.com/api/health`؛ يجب أن يعيد `{"status":"ok"}`.

### ترحيل نسخة الموقع القديمة

إذا كانت قاعدة Neon تحتوي على منتجات القالب القديم ذات المعرّفات `TL-####`، فسيستبدلها الخادم مرة واحدة بمنتجات الصداقة النموذجية عند تشغيل النسخة الجديدة. لا يحذف الخادم سجلات `orders` القديمة. راجع المنتجات والطلبات الموجودة في Neon قبل النشر إذا كنت قد أدخلت بيانات فعلية، وخذ نسخة احتياطية عند الحاجة. بعد الترحيل، تعديلات قاعدة البيانات لا تستبدلها عمليات النشر اللاحقة.

> الأصناف الموجودة في `src/data/catalog.ts` **أمثلة أولية وليست تأكيداً للتوفر أو الموديل أو السعر**. حدّثها في Neon قبل التسويق الفعلي. بيانات المخزون والضمان كذلك عند الاستفسار ما لم تُدخَل قيم مؤكدة.

## الكتالوج والطلبات في Neon

لا يوجد حالياً لوحة إدارة. المنتجات تُقرأ من جدول PostgreSQL وتُدار من **Neon → SQL Editor**. مثال تعديل سعر مؤكد، أو جعله عند الاستفسار:

```sql
-- تعديل سعر بعد تأكيده (القيمة بالدينار الليبي)
UPDATE products
SET data = jsonb_set(data, '{price}', '1250'::jsonb), updated_at = NOW()
WHERE id = 'AS-1001';

-- إرجاع السعر إلى «عند الاستفسار»
UPDATE products
SET data = jsonb_set(data, '{price}', 'null'::jsonb), updated_at = NOW()
WHERE id = 'AS-1001';

-- إخفاء صنف مؤقتاً دون حذفه
UPDATE products SET active = FALSE, updated_at = NOW() WHERE id = 'AS-1001';

-- عرض آخر الاستفسارات (بيانات العملاء خاصة)
SELECT order_no, customer->>'name' AS customer, customer->>'phone' AS phone,
       subtotal, collection_mode, status, created_at
FROM orders ORDER BY created_at DESC LIMIT 50;
```

لإضافة صنف جديد، أضف صفاً في `products` مع `id` فريد و`data` بصيغة JSON مشابهة للمنتجات الموجودة. الحقول الثنائية مثل `name`, `desc`, `origin`, `mat` تحتاج مفاتيح `ar` و`en`. استخدم `price: null` و`stock: null` حتى تتأكد من السعر والمخزون. تأكد أن `cat` يطابق أحد أقسام `CATEGORIES` في `src/data/catalog.ts`.

عند إرسال استفسار من السلة، يتحقق الخادم من الصنف والكمية ويعيد حساب السعر المعلن من قاعدة البيانات، ثم يحفظ الطلب في `orders` ويفتح صفحة ماسنجر للشركة. المنتجات بلا سعر تُسجّل كسعر مطلوب؛ والإجمالي المبدئي لا يتضمن قيمة لها. حالة `new` تعني أن العميل أرسل الاستفسار عبر الموقع، وليست تأكيداً لعملية شراء أو رسالة أُرسلت في ماسنجر.

## التطوير المحلي

```bash
npm ci
npm run dev         # الواجهة فقط؛ تستخدم بيانات الكتالوج الاحتياطية
npm run build       # dist/index.html
npm start           # API + الواجهة المبنية، يتطلب DATABASE_URL
npm run typecheck
```

## الملفات الرئيسية

| الغرض | الملف |
| --- | --- |
| المنتجات والأقسام وأفكار الحمامات | `src/data/catalog.ts` |
| النصوص العربية والإنجليزية ورابط صفحة الشركة | `src/i18n.ts` |
| جلب المنتجات وحالة السلة | `src/store.tsx` |
| API، جداول Neon وترحيل الكتالوج الأولي | `server/index.ts` |
| إعداد Render | `render.yaml` |
| بيانات عنوان الموقع وSEO | `index.html` |
