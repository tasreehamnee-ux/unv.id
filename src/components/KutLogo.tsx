import React from 'react';

/**
 * شعار جامعة الكوت الرسمي عالي الدقة (SVG Vector)
 */
export const KutLogoSvg = ({ size = 90, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 400 400" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <path id="topTextArc" d="M 70 200 A 130 130 0 0 1 330 200" fill="none" />
      <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#028497" />
        <stop offset="100%" stopColor="#006677" />
      </linearGradient>
      <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#008ba3" />
        <stop offset="100%" stopColor="#005e6f" />
      </linearGradient>
    </defs>

    {/* الخلفية الدائرية البيضاء */}
    <circle cx="200" cy="200" r="190" fill="#ffffff" stroke="#007788" strokeWidth="8" />

    {/* الحلقة الدائرية الخارجية مع نمط المعينات الزخرفية العنابية */}
    <circle cx="200" cy="200" r="172" fill="none" stroke="#007788" strokeWidth="3" />
    <circle cx="200" cy="200" r="150" fill="none" stroke="#007788" strokeWidth="2" strokeDasharray="3 4" />

    {/* زخارف معينات على الإطار الخارجي */}
    {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((angle, idx) => {
      const rad = (angle * Math.PI) / 180;
      const x = 200 + 161 * Math.cos(rad);
      const y = 200 + 161 * Math.sin(rad);
      return (
        <rect
          key={idx}
          x={x - 4}
          y={y - 4}
          width="8"
          height="8"
          fill="#781834"
          transform={`rotate(${angle + 45}, ${x}, ${y})`}
        />
      );
    })}

    {/* النص العلوي المنحني UNIVERSITY OF KUT */}
    <text fill="#68132b" fontSize="24" fontWeight="900" letterSpacing="5" fontFamily="'Segoe UI', Tahoma, sans-serif">
      <textPath href="#topTextArc" startOffset="50%" textAnchor="middle">
        UNIVERSITY OF KUT
      </textPath>
    </text>

    {/* أيقونة الكتاب المفتوح مع الآية الكريمة */}
    <g transform="translate(0, -10)">
      {/* صفحات الكتاب باللون التركوازي/السماوي */}
      {/* الجناح الأيمن للكتاب */}
      <path 
        d="M 200 178 C 235 155 270 145 305 162 L 285 105 C 255 90 225 102 200 120 Z" 
        fill="#007d91" 
      />
      <path 
        d="M 200 168 C 235 145 265 138 295 152 L 280 112 C 252 100 225 110 200 126 Z" 
        fill="#ffffff" 
      />
      <path 
        d="M 200 156 C 230 138 258 132 282 142 L 272 118 C 248 110 224 118 200 132 Z" 
        fill="#008ba3" 
      />

      {/* الجناح الأيسر للكتاب */}
      <path 
        d="M 200 178 C 165 155 130 145 95 162 L 115 105 C 145 90 175 102 200 120 Z" 
        fill="#007d91" 
      />
      <path 
        d="M 200 168 C 165 145 135 138 105 152 L 120 112 C 148 100 175 110 200 126 Z" 
        fill="#ffffff" 
      />
      <path 
        d="M 200 156 C 170 138 142 132 118 142 L 128 118 C 152 110 176 118 200 132 Z" 
        fill="#008ba3" 
      />

      {/* الخط المركزي للكتاب */}
      <line x1="200" y1="120" x2="200" y2="185" stroke="#005d6d" strokeWidth="3" />

      {/* عبارة: وقل رب زدني علماً بالخط العنابي في المنتصف */}
      <text x="200" y="112" textAnchor="middle" fill="#751532" fontSize="22" fontWeight="bold" fontFamily="'Amiri', 'Cairo', serif">
        وَقُل رَّبِّ
      </text>
      <text x="200" y="134" textAnchor="middle" fill="#751532" fontSize="20" fontWeight="bold" fontFamily="'Amiri', 'Cairo', serif">
        زِدْنِي عِلْمًا
      </text>

      {/* تاريخ التأسيس 2012 - 1433 */}
      <text x="200" y="202" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="900" letterSpacing="1" fontFamily="sans-serif">
        2012 - 1433
      </text>
    </g>

    {/* شريط جامعة الكوت الأوسط */}
    <g transform="translate(0, 10)">
      <rect x="52" y="195" width="296" height="48" fill="url(#tealGrad)" />
      <line x1="52" y1="195" x2="348" y2="195" stroke="#004e5a" strokeWidth="2" />
      <line x1="52" y1="243" x2="348" y2="243" stroke="#ffffff" strokeWidth="2" />
      
      {/* نص جامعة الكوت بالعنابي الغامق البارز */}
      <text 
        x="200" 
        y="230" 
        textAnchor="middle" 
        fill="#660d26" 
        fontSize="34" 
        fontWeight="900" 
        fontFamily="'Cairo', 'Almarai', 'Amiri', Tahoma, sans-serif"
        letterSpacing="2"
      >
        جامعة الكوت
      </text>
    </g>

    {/* سدة الكوت - القناطر والأقواس مع مياه النهر */}
    <g transform="translate(0, 10)">
      <path d="M 54 245 Q 200 248 346 245 L 332 320 Q 200 355 68 320 Z" fill="url(#bridgeGrad)" />
      
      {/* أقواس سدة الكوت باللون الأبيض */}
      {/* قوس 1 */}
      <path d="M 85 320 L 85 278 Q 102 260 120 278 L 120 325 Z" fill="#ffffff" />
      {/* قوس 2 */}
      <path d="M 138 328 L 138 274 Q 160 252 182 274 L 182 334 Z" fill="#ffffff" />
      {/* قوس 3 - المنتصف */}
      <path d="M 200 338 L 200 272 Q 218 252 236 274 L 236 338 Z" fill="#ffffff" />
      {/* قوس 4 */}
      <path d="M 254 332 L 254 274 Q 276 254 298 274 L 298 326 Z" fill="#ffffff" />
      {/* قوس 5 */}
      <path d="M 314 322 L 314 278 Q 326 262 338 278 L 338 316 Z" fill="#ffffff" />

      {/* خطوط مياه النهر تحت السدة */}
      <path d="M 100 335 Q 200 360 300 335" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M 120 345 Q 200 368 280 345" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.4" />
    </g>
  </svg>
);

/**
 * كود SVG مفرغ كنص مستقل ليتم حقنه في نوافذ الطباعة (Print Windows) مباشرة بدون روابط خارجية
 */
export const KUT_LOGO_SVG_RAW = `
<svg width="85" height="85" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="topTextArcPrint" d="M 70 200 A 130 130 0 0 1 330 200" fill="none" />
    <linearGradient id="tealGradPrint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#028497" />
      <stop offset="100%" stop-color="#006677" />
    </linearGradient>
    <linearGradient id="bridgeGradPrint" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#008ba3" />
      <stop offset="100%" stop-color="#005e6f" />
    </linearGradient>
  </defs>
  <circle cx="200" cy="200" r="190" fill="#ffffff" stroke="#007788" stroke-width="8" />
  <circle cx="200" cy="200" r="172" fill="none" stroke="#007788" stroke-width="3" />
  <circle cx="200" cy="200" r="150" fill="none" stroke="#007788" stroke-width="2" stroke-dasharray="3 4" />
  <text fill="#68132b" font-size="24" font-weight="900" letter-spacing="5" font-family="'Segoe UI', Tahoma, sans-serif">
    <textPath href="#topTextArcPrint" startOffset="50%" text-anchor="middle">UNIVERSITY OF KUT</textPath>
  </text>
  <g transform="translate(0, -10)">
    <path d="M 200 178 C 235 155 270 145 305 162 L 285 105 C 255 90 225 102 200 120 Z" fill="#007d91" />
    <path d="M 200 168 C 235 145 265 138 295 152 L 280 112 C 252 100 225 110 200 126 Z" fill="#ffffff" />
    <path d="M 200 156 C 230 138 258 132 282 142 L 272 118 C 248 110 224 118 200 132 Z" fill="#008ba3" />
    <path d="M 200 178 C 165 155 130 145 95 162 L 115 105 C 145 90 175 102 200 120 Z" fill="#007d91" />
    <path d="M 200 168 C 165 145 135 138 105 152 L 120 112 C 148 100 175 110 200 126 Z" fill="#ffffff" />
    <path d="M 200 156 C 170 138 142 132 118 142 L 128 118 C 152 110 176 118 200 132 Z" fill="#008ba3" />
    <line x1="200" y1="120" x2="200" y2="185" stroke="#005d6d" stroke-width="3" />
    <text x="200" y="112" text-anchor="middle" fill="#751532" font-size="22" font-weight="bold" font-family="'Cairo', serif">وَقُل رَّبِّ</text>
    <text x="200" y="134" text-anchor="middle" fill="#751532" font-size="20" font-weight="bold" font-family="'Cairo', serif">زِدْنِي عِلْمًا</text>
    <text x="200" y="202" text-anchor="middle" fill="#1e293b" font-size="16" font-weight="900" font-family="sans-serif">2012 - 1433</text>
  </g>
  <g transform="translate(0, 10)">
    <rect x="52" y="195" width="296" height="48" fill="url(#tealGradPrint)" />
    <line x1="52" y1="195" x2="348" y2="195" stroke="#004e5a" stroke-width="2" />
    <line x1="52" y1="243" x2="348" y2="243" stroke="#ffffff" stroke-width="2" />
    <text x="200" y="230" text-anchor="middle" fill="#660d26" font-size="34" font-weight="900" font-family="'Cairo', Tahoma, sans-serif" letter-spacing="2">جامعة الكوت</text>
  </g>
  <g transform="translate(0, 10)">
    <path d="M 54 245 Q 200 248 346 245 L 332 320 Q 200 355 68 320 Z" fill="url(#bridgeGradPrint)" />
    <path d="M 85 320 L 85 278 Q 102 260 120 278 L 120 325 Z" fill="#ffffff" />
    <path d="M 138 328 L 138 274 Q 160 252 182 274 L 182 334 Z" fill="#ffffff" />
    <path d="M 200 338 L 200 272 Q 218 252 236 274 L 236 338 Z" fill="#ffffff" />
    <path d="M 254 332 L 254 274 Q 276 254 298 274 L 298 326 Z" fill="#ffffff" />
    <path d="M 314 322 L 314 278 Q 326 262 338 278 L 338 316 Z" fill="#ffffff" />
  </g>
</svg>
`;

/**
 * مكون الترويسة الرسمية لجامعة الكوت (بالخلفية البترولية الزرقاء والمطابقة لترويسة مكتب العميد الرسمية)
 */
export const OfficialKutHeader = ({ 
  subTitleAr = "كلية الكوت الجامعة",
  subTitleEn = "Kut University College",
  officeAr = "مكتب العميد",
  officeEn = "Dean Office",
  showBismi = true
}: {
  subTitleAr?: string;
  subTitleEn?: string;
  officeAr?: string;
  officeEn?: string;
  showBismi?: boolean;
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-[#073c44] via-[#0c5963] to-[#073c44] text-white rounded-2xl p-4 md:p-5 shadow-lg border-b-4 border-amber-500/80 select-none overflow-hidden relative">
      {/* الزخرفة الهندسية الشفافة في الخلفية */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between gap-2 md:gap-4">
        {/* الجزء الأيمن - باللغة العربية */}
        <div className="text-right flex-1 space-y-0.5">
          <h3 className="font-extrabold text-xs md:text-sm text-slate-100 tracking-wide">جمهورية العراق</h3>
          <h2 className="font-black text-sm md:text-base text-amber-300 tracking-tight">{subTitleAr}</h2>
          <span className="font-bold text-[11px] md:text-xs text-emerald-200 block">{officeAr}</span>
        </div>

        {/* المنتصف - البسملة والشعار الرسمي في دائرة مذهبة وفضية */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2 space-y-1">
          {showBismi && (
            <span className="text-[11px] md:text-xs font-bold text-amber-200/90 font-serif tracking-widest">
              بسمه تعالى
            </span>
          )}
          <div className="p-1 bg-white/95 rounded-full shadow-md border-2 border-amber-400/80 flex items-center justify-center">
            <KutLogoSvg size={68} className="drop-shadow-xs" />
          </div>
        </div>

        {/* الجزء الأيسر - باللغة الإنجليزية */}
        <div className="text-left flex-1 space-y-0.5" style={{ direction: 'ltr' }}>
          <h3 className="font-extrabold text-xs md:text-sm text-slate-100 tracking-wide">Republic of Iraq</h3>
          <h2 className="font-black text-sm md:text-base text-amber-300 tracking-tight">{subTitleEn}</h2>
          <span className="font-bold text-[11px] md:text-xs text-emerald-200 block">{officeEn}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * دالة توليد كود HTML للترويسة الرسمية المدمجة في نوافذ الطباعة (Print Windows)
 */
export const getOfficialPrintHeaderHtml = (subAr = "كلية الكوت الجامعة", subEn = "Kut University College", officeAr = "مكتب العميد", officeEn = "Dean Office") => {
  return `
    <div style="background: linear-gradient(135deg, #073c44 0%, #0c5963 50%, #073c44 100%); color: #ffffff; padding: 18px 24px; border-radius: 16px; margin-bottom: 24px; border-bottom: 4px solid #f59e0b; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table style="width: 100%; border-collapse: collapse; border: none;">
        <tr>
          <!-- اليمين بالعربي -->
          <td style="width: 38%; text-align: right; vertical-align: middle; border: none; padding: 0;">
            <div style="font-size: 13px; font-weight: 800; color: #f1f5f9; margin-bottom: 3px;">جمهورية العراق</div>
            <div style="font-size: 16px; font-weight: 900; color: #fcd34d; margin-bottom: 3px; letter-spacing: -0.3px;">${subAr}</div>
            <div style="font-size: 13px; font-weight: 700; color: #a7f3d0;">${officeAr}</div>
          </td>

          <!-- المنتصف: البسملة والشعار -->
          <td style="width: 24%; text-align: center; vertical-align: middle; border: none; padding: 0 10px;">
            <div style="font-size: 12px; font-weight: bold; color: #fef08a; margin-bottom: 6px; letter-spacing: 2px;">بسمه تعالى</div>
            <div style="display: inline-block; background: #ffffff; padding: 4px; border-radius: 50%; border: 2px solid #f59e0b; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
              ${KUT_LOGO_SVG_RAW}
            </div>
          </td>

          <!-- اليسار بالإنجليزي -->
          <td style="width: 38%; text-align: left; vertical-align: middle; direction: ltr; border: none; padding: 0;">
            <div style="font-size: 13px; font-weight: 800; color: #f1f5f9; margin-bottom: 3px;">Republic of Iraq</div>
            <div style="font-size: 16px; font-weight: 900; color: #fcd34d; margin-bottom: 3px; letter-spacing: -0.3px;">${subEn}</div>
            <div style="font-size: 13px; font-weight: 700; color: #a7f3d0;">${officeEn}</div>
          </td>
        </tr>
      </table>
    </div>
  `;
};
