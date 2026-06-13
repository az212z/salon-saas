# دليل تفعيل Moyasar للمدفوعات — سالوني

## الخطوة 1: إنشاء حساب Moyasar

1. روح لـ [Moyasar](https://moyasar.com/)
2. سجل حساب جديد (شركة/فرد)
3. فعّل الحساب بالهوية ووثائق الشركة

## الخطوة 2: الحصول على مفاتيح API

من Dashboard → API Keys:

```
MOYASAR_PUBLIC_KEY  = pk_test_xxxxx (للعرض في المتصفح)
MOYASAR_SECRET_KEY  = sk_test_xxxxx (للسيرفر فقط!)
```

⚠️ **مهم**: استخدم `pk_live_` و `sk_live_` للإنتاج

## الخطوة 3: تفعيل طرق الدفع

من Dashboard → Settings → Payment Methods:
- ✅ بطاقات الائتمان (Visa/Mastercard)
- ✅ مدى (mada) عبر نموذج البطاقات
- Apple Pay لا تفعل إلا بعد إعداد Apple merchant validation
- STC Pay اختياري لاحقا إذا كان مفعل في حساب Moyasar

## الخطوة 4: إضافة المتغيرات في .env

```env
MOYASAR_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
MOYASAR_SECRET_KEY=sk_test_xxxxxxxxxxxxx
MOYASAR_PAYMENT_METHODS=creditcard
```

## الخطوة 5: إعداد callback

1. اجعل callback في نموذج Moyasar هو: `https://salon-saas-platform.vercel.app/api/payments/callback`
2. بعد الرجوع من Moyasar، الخادم يجلب الدفع بالـ `id` ويتحقق من `status` و`amount` و`currency`.
3. لا يعتبر الحجز مؤكدا من مجرد رجوع المتصفح.

## 💰 التسعير

| الطريقة | الرسوم |
|---------|--------|
| بطاقات ائتمان | 2.5% + 0.50 SAR |
| مدى | 1.0% + 0.25 SAR |
| Apple Pay | حسب حساب Moyasar وإعداد Apple merchant |
| STC Pay | حسب التفعيل في Moyasar |

## 🧪 اختبار

استخدم بطاقات الاختبار:
- ناجح: `4111 1111 1111 1111` (Visa)
- مرفوض: `4000 0000 0000 0002`
- مدى: `4464 0000 0000 0004`

## 🔄 سير الدفع

1. **حجز عادي**: يدفع كامل المبلغ أو عربون
2. **اشتراك الصالون**: خصم شهري/سنوي تلقائي
3. **بطاقة هدية**: شراء البطاقة عبر الموقع
4. **شحن المحفظة**: إضافة رصيد لحساب العميل
