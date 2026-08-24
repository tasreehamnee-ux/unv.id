/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  FileCheck, 
  Calendar, 
  Tag, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  Smartphone,
  CreditCard,
  UserCheck,
  Building,
  ArrowRight,
  BookmarkCheck,
  X,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { Student, Department, Payment, RequiredDocument } from '../types';
import { calculateStudentFees, SYSTEM_CURRENT_DATE } from '../data/mockData';

// 📊 مولد الباركود المخصص للتحقق من تفاصيل قيد الطالب وصحة الصدور
const BarcodePattern = ({ code }: { code: string }) => {
  const widths = [2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 4, 2];
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-[1.5px] bg-white p-1 rounded-md border border-slate-200 select-none overflow-hidden h-8 w-full max-w-[150px]">
        {widths.map((w, idx) => (
          <span 
            key={idx} 
            style={{ width: `${w}px` }} 
            className="h-6 bg-slate-900 shrink-0" 
          />
        ))}
        {widths.reverse().map((w, idx) => (
          <span 
            key={`rev-${idx}`} 
            style={{ width: `${w}px` }} 
            className="h-6 bg-slate-900 shrink-0" 
          />
        ))}
      </div>
      <span className="text-[8px] font-mono tracking-[1.5px] mt-0.5 text-slate-700 font-bold uppercase">{code}</span>
    </div>
  );
};

// 🗺️ مولد الـ QR Code للتحقق الفوري من صحة الصدور والمطابقة الإلكترونية
const QRCodeMock = ({ code }: { code: string }) => {
  return (
    <div className="w-14 h-14 border border-slate-900 p-0.5 bg-white relative flex flex-wrap items-center justify-center shrink-0 rounded-lg shadow-3xs select-none">
      {/* ركائز الـ QR الأساسية */}
      <span className="absolute top-0.5 left-0.5 w-3.5 h-3.5 border border-slate-900 bg-white flex items-center justify-center rounded-xs"><span className="w-1.5 h-1.5 bg-slate-950 rounded-6xs" /></span>
      <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 border border-slate-900 bg-white flex items-center justify-center rounded-xs"><span className="w-1.5 h-1.5 bg-slate-950 rounded-6xs" /></span>
      <span className="absolute bottom-0.5 left-0.5 w-3.5 h-3.5 border border-slate-900 bg-white flex items-center justify-center rounded-xs"><span className="w-1.5 h-1.5 bg-slate-950 rounded-6xs" /></span>
      
      {/* خلايا مصفوفية عشوائية */}
      <div className="grid grid-cols-3 gap-0.5 w-6 h-6 opacity-85 mt-0.5">
        <span className="w-1.5 h-1.5 bg-slate-900 rounded-7xs" />
        <span className="w-1.5 h-1.5 bg-transparent" />
        <span className="w-1.5 h-1.5 bg-slate-900 rounded-7xs" />
        <span className="w-1.5 h-1.5 bg-transparent" />
        <span className="w-1.5 h-1.5 bg-slate-900 rounded-7xs" />
        <span className="w-1.5 h-1.5 bg-slate-900 rounded-7xs" />
      </div>
      <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-slate-950 rounded-7xs" />
    </div>
  );
};

// مولد الكود الفريد بناءً على معرف الطالب وتاريخ قبوله
const getStudentVerificationCode = (studentId: string, regDate: string) => {
  const cleanId = studentId.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  const cleanDate = regDate ? regDate.replace(/[^0-9]/g, '') : '20260613';
  return `VAL-KUT-${cleanId}-${cleanDate}`;
};

interface StudentPortalProps {
  students: Student[];
  departments: Department[];
  payments: Payment[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  universityName?: string;
  subText?: string;
  noteText?: string;
}

export default function StudentPortal({ 
  students, 
  departments, 
  payments, 
  selectedStudentId,
  onSelectStudent,
  setActiveTab,
  universityName = 'الجامعة الأهلية العراقية',
  subText = 'شعبة الإيرادات والحسابات العامة',
  noteText = 'ملاحظة: يرجى الاحتفاظ بهذا الوصل كونه مستنداً رسمياً للمراجعة والبريد الموحد للطلاب المبتدئين في كليتنا.'
}: StudentPortalProps) {
  
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);

  // البحث عن الطالب النشط أو تحديد الطالب الأول كافتراضي لتلافي عرض صفحة فارغة
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  
  if (!currentStudent) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <User className="w-16 h-16 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">لا يوجد بيانات طلاب</h3>
        <p className="text-slate-700 text-xs mt-1">يرجى إضافة أو تسجيل طلاب في قسم التسجيل أولاً.</p>
      </div>
    );
  }

  const studentDept = departments.find(d => d.id === currentStudent.departmentId);
  const financialSummary = calculateStudentFees(currentStudent, payments);
  const studentPayments = payments.filter(p => p.studentId === currentStudent.id);

  // حساب النسبة المئوية للمدفوعات
  const paidPercentage = financialSummary.total > 0 
    ? Math.round((financialSummary.paid / financialSummary.total) * 100) 
    : 0;

  // دالة لحساب وتصنيف صلاحية مستمسكات الطالب
  const getDocExpiryStats = (doc: RequiredDocument) => {
    if (!doc.provided || !doc.expiryDate) return { label: 'صالحة ودائمة', status: 'valid', color: 'text-slate-700 bg-slate-50' };
    
    const curr = new Date(SYSTEM_CURRENT_DATE);
    const exp = new Date(doc.expiryDate);
    const diffTime = exp.getTime() - curr.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        label: `منتهية الصلاحية منذ ${Math.abs(diffDays)} يوم!`, 
        status: 'expired', 
        color: 'text-red-700 bg-red-50 border border-red-100',
        critical: true
      };
    } else if (diffDays <= 30) {
      return { 
        label: `تنتهي قريباً (متبقي ${diffDays} يوم)`, 
        status: 'warning', 
        color: 'text-amber-800 bg-amber-50 border border-amber-100',
        critical: true
      };
    }
    return { 
      label: `صالحة حتى تاريخ ${doc.expiryDate}`, 
      status: 'valid', 
      color: 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
    };
  };

  return (
    <div className="space-y-6">
      
      {/* مشغل اختيار الطالب السريع لتسهيل الفحص والتجربة */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-700 font-bold">
          <span>تصفح ملف الطالب النشط:</span>
          <select 
            value={currentStudent.id}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-800 cursor-pointer font-bold"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
            ))}
          </select>
        </div>
        <button 
          onClick={() => setActiveTab('students')}
          className="text-xs text-univ-emerald hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <span>العودة لمركز التسجيل العام</span>
          <span className="direction-ltr">➔</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* العمود الجانبي الأيمن: هوية وطاقة الطالب المعرفية */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          
          {/* بطاقة الطالب الأكاديمية */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-univ-emerald" />
            
            <div className="w-20 h-20 bg-emerald-50 text-univ-emerald rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
              <User className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 text-lg leading-snug">{currentStudent.name}</h3>
              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-full inline-block">
                ID: {currentStudent.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-right">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-700 block text-[10px] mb-0.5">الكلية الأكاديمية:</span>
                <span className="font-bold text-slate-800 block truncate">{studentDept?.name}</span>
                <span className="text-slate-700 text-[9px] block truncate">{studentDept?.college}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-700 block text-[10px] mb-0.5">نوع وجبة الدراسة:</span>
                <span className="font-bold text-amber-800 block text-center">
                  {currentStudent.shift === 'morning' ? 'صباحي' : 'مسائي'}
                </span>
                <span className="text-slate-700 text-[9px] block text-center">المرحلة {currentStudent.stage}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs text-right">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-405" />
                  <span>المشرف الأكاديمي:</span>
                </span>
                <span className="font-bold text-slate-800">{currentStudent.academicAdvisor || 'لم يحدد بعد'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-405" />
                  <span>رقم الهاتف الخلوي:</span>
                </span>
                <span className="font-bold text-slate-800 font-mono text-left">{currentStudent.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-405" />
                  <span>تاريخ القبول الأولي:</span>
                </span>
                <span className="font-bold text-slate-800 font-mono">{currentStudent.registrationDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-405" />
                  <span>الرقم الموحد المعتمد:</span>
                </span>
                <span className="font-bold text-slate-800 font-mono">{currentStudent.nationalId}</span>
              </div>
            </div>

            {/* ملاحظات الطالب الإدارية */}
            {currentStudent.notes && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 text-right leading-relaxed">
                <span className="font-bold block mb-1">✍️ ملحوظة كادر التسجيل المالي:</span>
                <p className="text-slate-700">{currentStudent.notes}</p>
              </div>
            )}

            {/* 🔐 كود التحقق ومربع الصلاحية وصحة صدور الوثائق */}
            <div className="mt-4 pt-4 border-t border-slate-100 text-right space-y-3">
              <span className="font-extrabold text-slate-800 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>رمز التحقق وصحة الصدور 🔐</span>
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full">✔ مصدق إلكترونياً</span>
              </span>

              <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                <div className="space-y-1 block w-2/3">
                  <span className="text-[9px] text-slate-700 block font-sans">الترميز التعريفي الفريد (Verification QR):</span>
                  <span className="font-mono text-[9px] font-bold text-slate-800 break-all select-all block bg-white border border-slate-200 p-1 rounded-md text-center">
                    {getStudentVerificationCode(currentStudent.id, currentStudent.registrationDate)}
                  </span>
                </div>
                <div className="w-1/3 shrink-0 flex justify-center">
                  <QRCodeMock code={getStudentVerificationCode(currentStudent.id, currentStudent.registrationDate)} />
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  const valCode = getStudentVerificationCode(currentStudent.id, currentStudent.registrationDate);
                  const printWin = window.open('', '_blank_' + Date.now());
                  if (!printWin) return;
                  printWin.document.open();
                      printWin.document.write(`
                    <html>
                      <head>
                        <title>وثيقة صحة صدور القيد الدراسي - ${currentStudent.name}</title>
                        <meta charset="utf-8">
                        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@4.0.0/dist/tailwind.min.css" rel="stylesheet">
                        <style>
                          body { font-family: 'system-ui', sans-serif; direction: rtl; }
                          @media print {
                            .no-print { display: none !important; }
                            body { background: #fff; padding: 0; margin: 0; }
                          }
                        </style>
                      </head>
                      <body class="p-8 max-w-2xl mx-auto bg-slate-50">
                        <div class="bg-white p-8 rounded-3xl border-2 border-emerald-600 shadow-md space-y-6">
                          <div class="flex justify-between items-center pb-4 border-b-2 border-slate-200">
                            <div class="text-right space-y-1">
                              <h1 class="text-xl font-black text-slate-800">${universityName}</h1>
                              <p class="text-xs text-slate-700">${subText}</p>
                            </div>
                            <div class="text-left space-y-1">
                              <div class="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full">صحة صدور معتمدة وإلكترونية</div>
                              <p class="text-[10px] text-slate-700 font-mono mt-0.5">رمز الصدور: ${valCode}</p>
                            </div>
                          </div>

                          <div class="space-y-4 my-6 text-sm">
                            <h2 class="text-md font-extrabold text-emerald-800 border-r-4 border-emerald-600 pr-2">شهادة إثبات قيد وصحة صدور الطالب</h2>
                            <p class="leading-relaxed text-slate-700 font-bold">
                              تؤيد عمادة القبول والتسجيل لـ <span class="font-bold">${universityName}</span> بأن الطالب المذكورة بياناته أدناه مسجل ومقيد رسمياً في سجلاتنا للعام الدراسي الحالي:
                            </p>

                            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                              <div><span class="text-slate-700 block text-xs">إسم الطالب الثلاثي:</span> <strong class="text-slate-900">${currentStudent.name}</strong></div>
                              <div><span class="text-slate-700 block text-xs">الكلية والفرع الدراسي:</span> <strong class="text-slate-900">${studentDept?.name || 'غير محدد'}</strong></div>
                              <div class="mt-2"><span class="text-slate-700 block text-xs">الرقم الموحد المعتمد:</span> <strong class="text-slate-900 font-mono">${currentStudent.nationalId || 'بدون'}</strong></div>
                              <div class="mt-2"><span class="text-slate-700 block text-xs">تاريخ المباشرة المعتمد:</span> <strong class="text-slate-900 font-mono">${currentStudent.registrationDate}</strong></div>
                              <div class="mt-2"><span class="text-slate-700 block text-xs">المرحلة الدراسية والوجبة:</span> <strong class="text-slate-900">المرحلة ${currentStudent.stage} - ${currentStudent.shift === 'morning' ? 'صباحي' : 'مسائي'}</strong></div>
                              <div class="mt-2"><span class="text-slate-700 block text-xs">رقم الموبايل:</span> <strong class="text-slate-900 font-mono">${currentStudent.phone}</strong></div>
                            </div>
                          </div>

                          <div class="grid grid-cols-2 gap-4 items-center border-t border-slate-150 pt-3">
                            <div class="text-center py-2">
                              <p class="text-xs text-slate-700 font-bold block mb-1">الترميز التوليدي وصحة الصدور</p>
                              <div class="inline-block">
                                <div class="flex items-center justify-center gap-[1.5px] bg-white p-2 rounded-lg border border-slate-200 select-none overflow-hidden h-10 w-44">
                                  ${[2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1].map((w) => `<span style="width: ${w}px;" class="h-6 bg-slate-900 shrink-0"></span>`).join('')}
                                </div>
                                <span class="text-[9px] font-mono tracking-[2px] mt-1 text-slate-700 font-extrabold uppercase">${valCode}</span>
                              </div>
                            </div>

                            <div class="flex justify-center items-center">
                              <div class="text-center">
                                <p class="text-[11px] text-slate-700 font-bold block mb-1">رمز التحقق السريع (QR Code)</p>
                                <div class="w-16 h-16 border-2 border-slate-900 p-1 bg-white relative flex flex-wrap items-center justify-center shrink-0 rounded-xl shadow-xs mx-auto">
                                  <span class="absolute top-0.5 left-0.5 w-4 h-4 border border-slate-900 bg-white"><span class="w-1.5 h-1.5 bg-slate-950 block m-auto mt-0.5 animate-pulse"></span></span>
                                  <span class="absolute top-0.5 right-0.5 w-4 h-4 border border-slate-900 bg-white"><span class="w-1.5 h-1.5 bg-slate-950 block m-auto mt-0.5 animate-pulse"></span></span>
                                  <span class="absolute bottom-0.5 left-0.5 w-4 h-4 border border-slate-900 bg-white"><span class="w-1.5 h-1.5 bg-slate-950 block m-auto mt-0.5 animate-pulse"></span></span>
                                  <div class="grid grid-cols-3 gap-0.5 w-6 h-6 mt-1 opacity-80">
                                    <span class="w-1 h-1 bg-slate-900"></span><span class="w-1 h-1 bg-transparent"></span><span class="w-1 h-1 bg-slate-900"></span>
                                    <span class="w-1 h-1 bg-slate-900"></span><span class="w-1 h-1 bg-slate-900"></span><span class="w-1 h-1 bg-transparent"></span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="border-t border-slate-250 pt-4 flex justify-between items-center text-xs text-slate-700">
                            <span>تاريخ طباعة هذه البطاقة التلقائية: ${new Date().toLocaleDateString('ar-IQ')}</span>
                            <span class="font-bold">عمادة القبول والتسجيل الإلكترونية</span>
                          </div>
                        </div>

                        <div class="mt-6 flex justify-center gap-3 no-print">
                          <button onclick="window.print()" class="bg-emerald-600 hover:bg-emerald-750 text-white font-bold p-3 px-8 rounded-xl cursor-pointer text-sm shadow-md">
                            طباعة وثيقة التحقق وصحة الصدور 🖨️
                          </button>
                          <button onclick="window.close()" class="bg-slate-700 hover:bg-slate-800 text-white font-bold p-3 px-8 rounded-xl cursor-pointer text-sm shadow-md">
                            إغلاق ✖
                          </button>
                        </div>
                      </body>
                    </html>
                  `);
                  printWin.document.close();
                }}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-amber-400 hover:text-amber-300 transition-colors font-bold text-[11px] p-2.5 rounded-xl cursor-pointer shadow-3xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة بطاقة صحة الصدور والتحقق الرسمي 🖨️</span>
              </button>
            </div>
            
          </div>

          {/* طاقة تتبع الأقساط والنسب والمبيعات المضافة */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-5 text-right">
            <div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <span>الميزان والموقف المالي للطلب</span>
              </h4>
              <p className="text-slate-700 text-[11px] mt-0.5">القسط السنوي وتفاصيل الدفع والتحصيل للعام الدراسي الحالي</p>
            </div>

            <div className="flex items-center gap-4 py-2 border-b border-slate-50">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                {/* دائرة سريعة للنسبة المئوية */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="#d97706" strokeWidth="6" fill="transparent" 
                    strokeDasharray={175} 
                    strokeDashoffset={175 - (175 * paidPercentage) / 100} 
                  />
                </svg>
                <span className="font-mono font-extrabold text-sm text-amber-800">{paidPercentage}%</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-700 uppercase font-bold">نسبة تسديد الأجور</span>
                <h5 className="text-xs text-slate-550 leading-relaxed font-bold">
                  تم سداد {financialSummary.paid.toLocaleString()} د.ع من إجمالي القسط المالي السنوي.
                </h5>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-slate-800">
                <span>القسط الدراسي الواجب السنوي:</span>
                <span className="font-bold text-slate-900 font-mono text-base">{financialSummary.total.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600">
                <span>المبالغ المدفوعة والمقبوضة:</span>
                <span className="font-bold font-mono text-base">+{financialSummary.paid.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-red-600">
                <span className="font-bold">المتبقي المطلوب سداده (الذمة المالية):</span>
                <span className="font-extrabold font-mono text-base">{financialSummary.remaining.toLocaleString()} د.ع</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setActiveTab('finance')}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs p-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-center block"
              >
                تسجيل وصل مالي أو جزء جديد للطلب
              </button>
            </div>
          </div>

        </div>

        {/* العمود الأيسر: الأرشفة وتواريخ الصلاحية وحصاد الوصولات */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-6 text-right">
          
          {/* صندوق المستندات وتاريخ انتهاء الصلاحية من الطالب */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-univ-emerald" />
                <span>أرشيف أوراق الطلب ومطابقة الصلاحيات الطبية والهوية الوطنية</span>
              </h4>
              <p className="text-slate-700 text-xs mt-1">تحديد المستندات الأصلية المودعة ومعاينة التنبيهات الخاصة بانتهاء فاعليتها</p>
            </div>

            {/* قائمة مستندات الطالب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStudent.documents.map((doc) => {
                const expiryStats = getDocExpiryStats(doc);
                return (
                  <div 
                    key={doc.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-2.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${doc.provided ? 'bg-emerald-100 text-emerald-700' : 'bg-red-150 text-red-650'}`}>
                          {doc.provided ? <FileCheck className="w-4 h-4" /> : <X className="w-4 h-4 text-red-500" />}
                        </div>
                        <span className="font-bold text-xs text-slate-800 leading-normal">{doc.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-xs shrink-0 ${
                        doc.provided ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {doc.provided ? 'مـودع' : 'نــاقص'}
                      </span>
                    </div>

                    {/* تاريخ انتهاء الصلاحية (العرض والتفتيش) */}
                    {doc.provided && doc.expiryDate && (
                      <div className={`p-2 rounded-lg text-[11px] ${expiryStats.color} flex justify-between items-center mt-1`}>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-medium">{expiryStats.label}</span>
                        </div>
                        <span className="font-semibold font-mono">{doc.expiryDate}</span>
                      </div>
                    )}
                    {doc.provided && !doc.expiryDate && (
                      <div className="text-[10px] text-slate-700 italic block mt-1">
                        * مستند مستدام لا تنتهي فاعليته إدارياً.
                      </div>
                    )}
                    {!doc.provided && (
                      <div className="text-[11px] bg-red-150/20 text-red-700 font-bold p-2 rounded-lg block mt-1">
                        يرجى تسليم المستند في أسرع وقت ممكن لاستيفاء شروط القبول.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* أرشيف الوصولات المالية الخاصة بهذا الطالب */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  <span>أرشيف الإيصالات المالية والتحصيل المعتمد</span>
                </h4>
                <p className="text-slate-700 text-xs mt-1">قائمة الإيصالات الصادرة والمنقولة إلكترونياً باسم الطالب</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg font-bold">
                لديه {studentPayments.length} أوصال
              </span>
            </div>

            <div className="space-y-3.5 max-h-[290px] overflow-y-auto">
              {studentPayments.map((pay) => (
                <div 
                  key={pay.id} 
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-100/50 transition-colors cursor-pointer"
                  onClick={() => setActiveReceipt(pay)}
                  title="انقر لمعاينة وطباعة الوصل المالي"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-sm">
                        {pay.category === 'tuition' ? 'قسط دراسي سنوي' : 'رسوم التسجيل الأولي'}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-800">{pay.receiptNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      بواسطة الموظف: {pay.loggedBy} • طريقة الدفع: {pay.method}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left shrink-0 self-end sm:self-center">
                    <div className="space-y-0.5 text-right">
                      <span className="text-[10px] text-slate-700 block font-bold">المبلغ المقبوض:</span>
                      <span className="text-emerald-700 font-extrabold text-sm md:text-md font-mono">
                        {pay.amount.toLocaleString()} د.ع
                      </span>
                    </div>
                    <button 
                      className="p-2 bg-white text-slate-800 hover:text-slate-800 rounded-lg border border-slate-200 shadow-xs cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReceipt(pay);
                      }}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {studentPayments.length === 0 && (
                <div className="text-center py-10 text-slate-700 text-xs">
                  <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <span>لا يوجد أي دفعات أو إيصالات مالية مسجلة بعد لهذا الطالب.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* نافذة الوصل الورقي الرسمي (Receipt Ticket Card Popup - Interactive and printable) */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-in pdf-style-container p-6 space-y-5 text-right printable-receipt">
            
            {/* هيد الترويسة الأكاديمية */}
            <div className="border-b-2 border-dashed border-slate-200 pb-4 text-center space-y-1">
              <div className="text-slate-800 font-extrabold text-lg flex items-center justify-center gap-2">
                <Building className="w-5 h-5 text-amber-700" />
                <span>{universityName} - {subText}</span>
              </div>
              <p className="text-slate-700 text-xs">وصل قبض وقبض أجور دراسية رسمي رقم: <span className="font-mono font-bold text-slate-800">{activeReceipt.receiptNumber}</span></p>
              <div className="text-[11px] text-slate-700 font-mono mt-1">تاريخ المعاملة: {activeReceipt.date}</div>
            </div>

            {/* تفاصيل السند المالي المطبوع */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-50">
                <div>
                  <span className="text-slate-700 font-bold block">إسم الطالب الثلاثي:</span>
                  <span className="font-bold text-slate-800 text-sm">{activeReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-700 font-bold block">الرقم الجامعي للطلبة:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{activeReceipt.studentId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-50">
                <div>
                  <span className="text-slate-700 font-bold block">الكلية الأكاديمية:</span>
                  <span className="font-bold text-slate-800">{activeReceipt.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-700 font-bold block">فئة ووجه المقبوض الزمني:</span>
                  <span className="font-bold text-slate-800">
                    {activeReceipt.category === 'tuition' ? 'قسط دراسي معتمد' :
                     activeReceipt.category === 'registration_fee' ? 'رسوم وخدمات التسجيل' : 'أخرى'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl text-center space-y-1">
                <span className="text-amber-800 font-bold block text-xs">المبلغ المستلم المقبوض كاملاً:</span>
                <span className="text-slate-900 font-black font-mono text-xl md:text-2xl">
                  {activeReceipt.amount.toLocaleString()} دينار عراقي
                </span>
                <p className="text-[10px] text-slate-700">فقط مليون وخمسمائة ألف دينار عراقي لا غير.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 text-[11px] text-slate-700">
                <div>
                  <span className="block">طريقة السداد: <span className="font-bold text-slate-700">{activeReceipt.method}</span></span>
                  <span className="block mt-0.5">مسؤول نظام التدقيق: <span className="font-bold text-slate-700">{activeReceipt.loggedBy}</span></span>
                </div>
                <div className="text-left flex flex-col items-end gap-1">
                  <span className="text-[9px] text-slate-350 block uppercase">ختم الحسابات المركزي</span>
                  <div className="w-14 h-14 border-4 border-emerald-600/30 text-emerald-600/40 font-bold rounded-full flex items-center justify-center text-[10px] transform rotate-12 select-none pointer-events-none">
                    مـقـبـوض
                  </div>
                </div>
              </div>

              {/* 🔒 الترميز التوليدي وصحة صدور الوصل المالي */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center justify-between gap-3 mt-2">
                <div className="flex flex-col gap-0.5 text-right w-1/2">
                  <span className="text-[9px] text-slate-700 block font-sans">معرف صحة الصدور الإلكتروني:</span>
                  <span className="font-mono text-[9px] font-bold text-emerald-800 break-all select-all block bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {getStudentVerificationCode(activeReceipt.studentId, activeReceipt.date)}
                  </span>
                </div>
                <div className="w-1/2 flex items-center justify-end gap-2 shrink-0">
                  <BarcodePattern code={getStudentVerificationCode(activeReceipt.studentId, activeReceipt.date).substring(4, 15)} />
                  <QRCodeMock code={getStudentVerificationCode(activeReceipt.studentId, activeReceipt.date)} />
                </div>
              </div>

              {noteText && (
                <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-700 leading-relaxed text-right font-sans">
                  {noteText}
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-3 border-t border-slate-100 pt-4 no-print">
              <button 
                onClick={() => {
                  window.focus();
                  try {
                    window.print();
                  } catch (e) {
                    console.error("Standard print blocked", e);
                  }
                  
                  // فتح نافذة طباعة مخصصة ومستقلة لضمان التفوق البرمجي الكامل في البيئات المحصورة
                  const printable = document.querySelector('.printable-receipt');
                  if (printable) {
                    const cloned = printable.cloneNode(true) as HTMLElement;
                    // إزالة أزرار الإجراءات من النسخة المطبوعة
                    const actions = cloned.querySelector('.no-print');
                    if (actions) actions.remove();

                    const printWin = window.open('', '_blank_' + Date.now());
                    if (printWin) {
                      printWin.document.open();
                      printWin.document.write(`
                        <html>
                          <head>
                            <title>إيصال المقبوضات المالي - ${universityName}</title>
                            <meta charset="utf-8">
                            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@4.0.0/dist/tailwind.min.css" rel="stylesheet">
                            <style>
                              body { font-family: 'Inter', sans-serif; direction: rtl; padding: 40px; background-color: white; color: black; }
                              .no-print { display: none !important; }
                            </style>
                          </head>
                          <body onload="window.focus(); window.print(); setTimeout(function(){ window.close(); }, 500);">
                            <div class="max-w-xl mx-auto p-4 border border-slate-350 rounded-3xl">
                              ${cloned.innerHTML}
                            </div>
                          </body>
                        </html>
                      `);
                      printWin.document.close();
                    }
                  }
                }}
                className="flex-1 bg-univ-emerald hover:bg-emerald-700 text-white font-bold text-xs p-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الإيصال المالي</span>
              </button>
              <button 
                onClick={() => setActiveReceipt(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs p-3 rounded-xl transition-all text-center cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
