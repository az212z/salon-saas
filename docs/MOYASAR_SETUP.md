# 💳 دليل تفعيل Moyasar للمدفوعات — سالوني

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
- ✅ مدى (Mada)
- ✅ Apple Pay
- ✅ STC Pay (اختياري)

## الخطوة 4: إضافة المتغيرات في .env

```env
MOYASAR_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
MOYASAR_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

## الخطوة 5: إعداد Webhook

1. من Dashboard → Webhooks
2. أضف URL: `https://saloni.sa/api/payments/callback`
3. اختر الأحداث: `payment.paid`, `payment.failed`, `payment.refunded`

## 💰 التسعير

| الطريقة | الرسوم |
|---------|--------|
| بطاقات ائتمان | 2.5% + 0.50 SAR |
| مدى | 1.0% + 0.25 SAR |
| Apple Pay | 2.5% + 0.50 SAR |
| STC Pay | 1.5% + 0.25 SAR |

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