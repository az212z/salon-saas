# 📱 دليل تفعيل واتساب بزنس API — سالوني

## الخطوة 1: إنشاء حساب Meta Business

1. روح لـ [Meta Business Suite](https://business.facebook.com/)
2. سجل دخول بفيسبوك أو أنشئ حساب جديد
3. أنشئ "مركز أعمال" (Business Manager)
4. أضف صفحة فيسبوك للمنصة

## الخطوة 2: تفعيل واتساب بزنس

1. روح لـ [Meta for Developers](https://developers.facebook.com/)
2. أنشئ تطبيق جديد → نوع Business
3. أضف منتج "WhatsApp" من Dashboard
4. أنشئ حساب واتساب بزنس من داخل التطبيق

## الخطوة 3: الحصول على مفاتيح API

من صفحة التطبيق → WhatsApp → API Setup:

```
WHATSAPP_BUSINESS_TOKEN     = رمز الوصول الدائم (Access Token)
WHATSAPP_PHONE_NUMBER_ID    = معرّف رقم الهاتف
WHATSAPP_BUSINESS_ACCOUNT_ID = معرّف حساب الأعمال
```

### رمز الوصول الدائم:
1. من Business Settings → System Users
2. أنشئ System User
3. أعطه صلاحية `whatsapp_business_messaging`
4. أنشئ رمز وصول (Generate Token)

## الخطوة 4: إنشاء قوالب الرسائل

من WhatsApp Manager → Message Templates:

| القالب | النوع | المحتوى |
|--------|-------|---------|
| `booking_confirmation` | UTILITY | تأكيد حجز مع بيانات الحجز |
| `booking_reminder_24h` | UTILITY | تذكير قبل 24 ساعة |
| `booking_reminder_2h` | UTILITY | تذكير قبل ساعتين |
| `booking_thankyou` | MARKETING | شكر بعد الحجز + طلب تقييم |
| `missed_you` | MARKETING | رسالة "اشتقنالك" |
| `birthday_greeting` | MARKETING | تهنئة عيد ميلاد + كود خصم |

### مثال قالب تأكيد الحجز:
```
Name: booking_confirmation
Category: UTILITY
Language: Arabic
Body:
تأكيد حجزك في {{1}}

رقم الحجز: {{2}}
الخدمة: {{3}}
التاريخ: {{4}}
الوقت: {{5}}

نستقبلك بإذن الله! 🌟
```

## الخطوة 5: إعداد Webhook

1. من WhatsApp → Configuration → Webhook
2. أضف URL: `https://saloni.sa/api/webhooks/whatsapp`
3. ضع Verify Token في `.env`:
   ```
   WHATSAPP_VERIFY_TOKEN=saloni-whatsapp-verify-2026
   ```
4. اشترك في الأحداث: `messages`, `message_status`

## الخطوة 6: إضافة المتغيرات في .env

```env
WHATSAPP_BUSINESS_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=saloni-whatsapp-verify-2026
```

## ⚠️ ملاحظات مهمة

- **رسائل التسويق** (MARKETING) تحتاج موافقة العميل (opt-in)
- **رسائل الخدمة** (UTILITY) ما تحتاج موافقة مسبقة
- **الحد الأقصى**: ~5 رسائل/ثانية (Rate Limiting)
- **التكلفة**: حسب المنطقة — السعودية تقريباً $0.005/رسالة
- **رقم الاختبار**: يمكنك إرسال حتى 5 أرقام بدون دفع أثناء التطوير

## 🧪 اختبار محلي

استخدم رقم الاختبار اللي يعطيك Meta:
```bash
# Test send
curl -X POST http://localhost:3000/api/whatsapp/templates \
  -H "Content-Type: application/json" \
  -d '{"action": "test", "phone": "966501234567"}'
```