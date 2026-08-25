/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Search, 
  Plus, 
  Receipt, 
  Calculator, 
  Check, 
  FileText, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  Printer,
  Building,
  Trash2
} from 'lucide-react';
import { Student, Payment, Department, PaymentCategory, PaymentMethod } from '../types';
import { calculateStudentFees, SYSTEM_CURRENT_DATE } from '../data/mockData';
import { OfficialKutHeader, getOfficialPrintHeaderHtml, KutLogoSvg, KutHeaderConfig } from './KutLogo';

interface FinancePortalProps {
  students: Student[];
  payments: Payment[];
  departments: Department[];
  onAddPayment: (newPayment: Payment) => void;
  onDeletePayment?: (paymentId: string) => void;
  onClearAllPayments?: () => void;
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
  universityName?: string;
  subText?: string;
  noteText?: string;
  headerConfig?: KutHeaderConfig;
  currentRole?: string;
}

export default function FinancePortal({ 
  students, 
  payments, 
  departments, 
  onAddPayment, 
  onDeletePayment,
  onClearAllPayments,
  selectedStudentId, 
  onSelectStudent, 
  setActiveTab, 
  universityName = 'الجامعة الأهلية العراقية', 
  subText = 'شعبة الإيرادات والحسابات العامة', 
  noteText = 'ملاحظة: يرجى الاحتفاظ بهذا الوصل كونه مستنداً رسمياً للمراجعة والبريد الموحد للطلاب المبتدئين في كليتنا.',
  headerConfig,
  currentRole
}: FinancePortalProps) {
  
  // حالات الفلترة والتحصيل المالي
  const [searchTerm, setSearchTerm] = useState('');
  const [payMethodFilter, setPayMethodFilter] = useState('all');
  const [payCategoryFilter, setPayCategoryFilter] = useState('all');

  // حالات تسجيل دفع جديد
  const [payStudentId, setPayStudentId] = useState(selectedStudentId || students[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(500000);
  const [payReceiptNum, setPayReceiptNum] = useState('');
  const [payCategory, setPayCategory] = useState<PaymentCategory>('tuition');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedPrintReceipt, setSelectedPrintReceipt] = useState<Payment | null>(null);

  // إعداد بيانات كشف الحساب للطالب المختار
  const currentSelectedStudent = students.find(s => s.id === payStudentId);
  const studentFeeStats = currentSelectedStudent ? calculateStudentFees(currentSelectedStudent, payments) : null;

  // معالجة ترحيل السند المالي
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStudentId || !payAmount || !payReceiptNum) {
      alert('يرجى اختيار طالب، والقيمة المدفوعة وصيغة رقم الوصل المالي!');
      return;
    }

    const studentObj = students.find(s => s.id === payStudentId);
    if (!studentObj) return;

    const deptObj = departments.find(d => d.id === studentObj.departmentId);

    const generatedPayId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPayment: Payment = {
      id: generatedPayId,
      studentId: payStudentId,
      studentName: studentObj.name,
      departmentName: deptObj?.name || studentObj.departmentId,
      amount: Number(payAmount),
      date: SYSTEM_CURRENT_DATE,
      receiptNumber: `REC-2026-${payReceiptNum}`,
      category: payCategory,
      method: payMethod,
      loggedBy: 'أركان ضياء البياتي - قسم الحسابات',
      notes: payNotes
    };

    onAddPayment(newPayment);
    setPayReceiptNum('');
    setPayNotes('');
    setSuccessMsg('✔ تم ترحيل الوصل المالي بنجاح وإصدار رتبة التحصيل المحدثة!');
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // المجموع العام للمستحصلات والذمم
  const totalTuitionExpected = students.reduce((sum, s) => sum + s.totalTuitionFee, 0);
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = Math.max(0, totalTuitionExpected - totalReceived);

  // تصفية كشف السندات العامة لتسهيل المراجعة
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = payMethodFilter === 'all' || payment.method === payMethodFilter;
    const matchesCategory = payCategoryFilter === 'all' || payment.category === payCategoryFilter;
    
    return matchesSearch && matchesMethod && matchesCategory;
  });

  return (
    <div className="space-y-6 text-right">

      {/* لمحة إحصائية مالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-slate-700 text-xs font-bold block mb-1">إجمالي استحقاقات الكليات السنوية:</span>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {totalTuitionExpected.toLocaleString()} <span className="text-xs font-sans font-medium text-slate-700">د.ع</span>
          </div>
          <p className="text-[10px] text-slate-700 mt-1">المبلغ الإجمالي على أساس كشوفات التسجيل الجارية</p>
        </div>

        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100/60 shadow-xs">
          <span className="text-emerald-800 text-xs font-bold block mb-1">إجمالي المقبوض والمسدد (الخزينة):</span>
          <div className="text-2xl font-black text-emerald-800 font-mono">
            {totalReceived.toLocaleString()} <span className="text-xs font-sans font-medium text-emerald-600">د.ع</span>
          </div>
          <div className="text-[10px] text-emerald-600/80 font-medium mt-1">تحديث آني للمقبوضات من البوابة</div>
        </div>

        <div className="bg-red-50 p-5 rounded-2xl border border-red-100/60 shadow-xs">
          <span className="text-red-800 text-xs font-bold block mb-1">الذمم والديون المتبقية للجامعة:</span>
          <div className="text-2xl font-black text-red-800 font-mono">
            {totalOutstanding.toLocaleString()} <span className="text-xs font-sans font-medium text-red-650">د.ع</span>
          </div>
          <p className="text-[10px] text-red-600/80 font-medium mt-1">مستحقة على الطلبة كأقساط تكميلية للعام</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* القسم الأيمن: تسجيل وقبض دفع مالية جديدة (Quick Payment Register) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-slate-800 text-base">تسجيل وتحصيل دفعة نقدية جديدة للاستقطاع</h3>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            
            {/* 1. اختيار الطالب المعني */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">اختر الطالب لترسيب الدفعة المالية:</label>
              <select 
                value={payStudentId}
                onChange={(e) => {
                  setPayStudentId(e.target.value);
                  onSelectStudent(e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800"
              >
                <option value="">-- حدد اسم الطالب المراجع --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>

            {/* معاينة سريعة لكشف حساب الطالب المختار لتفادي الاستيفاء الزائد */}
            {currentSelectedStudent && studentFeeStats && (
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs space-y-2">
                <div className="font-bold text-amber-900">الموقف الذمي الحالي لـ {currentSelectedStudent.name}:</div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-white p-1 rounded-sm border border-amber-100/50">
                    <span className="text-slate-700 block text-[9px]">القسط السنوي:</span>
                    <span className="font-bold text-slate-800 font-mono">{studentFeeStats.total.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-1 rounded-sm border border-amber-100/50">
                    <span className="text-emerald-600 block text-[9px]">المقبوض مسبقاً:</span>
                    <span className="font-bold text-emerald-700 font-mono">{studentFeeStats.paid.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-1 rounded-sm border border-amber-100/50">
                    <span className="text-red-650 block text-[9px]">المتبقي بذمته:</span>
                    <span className="font-bold text-red-700 font-mono">{studentFeeStats.remaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. قيمة المبلغ بالدينار العراقي */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">المبلغ المراد تحصيله ودببه (بالدينار العراقي):</label>
              <input 
                type="number" 
                step={25000}
                min={5000}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-univ-emerald focus:bg-white p-2.5 rounded-lg outline-hidden text-slate-800 font-mono font-bold"
                required
              />
            </div>

            {/* 3. رقم الإيصال الورقي وتصنيف المعاملة */}
            <div className="grid grid-cols-2 gap-3.5">
              
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700 block">رقم الوصل المالي الورقي:</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:border-univ-emerald focus-within:bg-white">
                  <span className="bg-slate-200 px-2 text-slate-700 font-mono py-2 py-2.5 text-[11px]">REC-2026-</span>
                  <input 
                    type="text" 
                    placeholder="9450"
                    value={payReceiptNum}
                    onChange={(e) => setPayReceiptNum(e.target.value)}
                    className="w-full p-2 outline-hidden text-slate-800 font-mono font-bold text-center"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700 block">بند التحصيل والرسوم:</label>
                <select 
                  value={payCategory}
                  onChange={(e) => setPayCategory(e.target.value as PaymentCategory)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-bold"
                >
                  <option value="tuition">قسط دراسي سنوي</option>
                  <option value="registration_fee">أجور وتأمينات التسجيل</option>
                  <option value="exam_fee">أجور الامتحانات البديلة</option>
                  <option value="fine">غرامة تأخيرية / فقدان وثائق</option>
                  <option value="housing">أجور السكن الجامعي للأقسام</option>
                </select>
              </div>

            </div>

            {/* 4. طريقة القبض الفعلي */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">طريقة وقنوات الاستلام المالي:</label>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                {[
                  { id: 'cash', label: 'نقدي (شعبة الصندوق)' },
                  { id: 'bank_transfer', label: 'حوالة مصرف الرافدين' },
                  { id: 'e-wallet', label: 'محفظة إلكترونية (زين كاش)' },
                  { id: 'visa_master', label: 'بطاقة فيزا / ماستر كارد' }
                ].map(item => (
                  <label 
                    key={item.id} 
                    className={`p-2.5 border rounded-lg cursor-pointer flex items-center justify-center gap-1.5 select-none transition-all ${
                      payMethod === item.id 
                        ? 'border-univ-emerald bg-emerald-50 text-emerald-800 font-bold' 
                        : 'border-slate-150 bg-slate-50 text-slate-650 hover:bg-slate-100'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payMethod" 
                      checked={payMethod === item.id} 
                      onChange={() => setPayMethod(item.id as PaymentMethod)}
                      className="hidden"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ملاحظات الوصل ودليل التسوية */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block font-normal text-slate-700">ملاحظات توضيحية إضافية:</label>
              <input 
                type="text" 
                placeholder="مثال: دفعة مؤقتة لتنظيم الأوراق الموقوفة..."
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-univ-emerald focus:bg-white p-2 rounded-lg outline-hidden text-slate-800"
              />
            </div>

            {/* رسائل تأكيد النجاح الدبلي */}
            {successMsg && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-250 text-xs font-bold animate-pulse text-center">
                {successMsg}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-univ-emerald hover:bg-emerald-700 text-white font-bold text-xs p-3.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-100" />
              <span>ترحيل السند والحسابات واستخراج الوصل الإلكتروني</span>
            </button>

          </form>
        </div>

        {/* القسم الأيسر: جدول وتدقيق الدفعات المالية العامة للجامعة */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-500" />
                <span>شريطة السجلات المالية والوصيلات المرجعية العامة</span>
              </h3>
              <p className="text-slate-700 text-xs mt-1">تتبع الحركات المالية لجميع الكليات والأقسام المسجلة</p>
            </div>
            
            <div className="flex items-center gap-2">
              {currentRole === 'admin' && onClearAllPayments && filteredPayments.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAllPayments}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs p-2 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="مسح وتفريغ كافة السجلات والوصولات المالية"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ السجلات المالية ({filteredPayments.length})</span>
                </button>
              )}
              <span className="text-xs bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full font-bold">
                تظهر {filteredPayments.length} حركة تسجيل مالي
              </span>
            </div>
          </div>

          {/* فلاتر الحركات المباشرة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* بحث باسم الطالب أو رقم الوصل */}
            <div className="relative">
              <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-700" />
              <input 
                type="text" 
                placeholder="بحث باسم الطالب أو رقم الوصل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-univ-emerald focus:bg-white pr-8 pl-3 py-1.5 rounded-lg text-xs outline-hidden text-slate-800"
              />
            </div>

            {/* فلترة القنوات */}
            <select 
              value={payMethodFilter}
              onChange={(e) => setPayMethodFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">كل قنوات الاستلام</option>
              <option value="cash">نقدي (المصرف)</option>
              <option value="bank_transfer">حوالة مصرف الرافدين</option>
              <option value="e-wallet">زين كاش</option>
              <option value="visa_master">بطاقة الدفع المباشر</option>
            </select>

            {/* فلترة البند المالي */}
            <select 
              value={payCategoryFilter}
              onChange={(e) => setPayCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">كل بنود الإيرادات</option>
              <option value="tuition">قسط دراسي سنوي</option>
              <option value="registration_fee">أجور وتأمينات التسجيل</option>
              <option value="exam_fee">أجور الامتحانات</option>
              <option value="fine">غرامات وتأخير مالي</option>
              <option value="housing">أقسام داخلية وسكن</option>
            </select>

          </div>

          {/* جدول الإيصالات والحركات المالي */}
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold">
                  <th className="p-3">رقم الوصل</th>
                  <th className="p-3">الطالب المعني</th>
                  <th className="p-3">الكلية الأكاديمية</th>
                  <th className="p-3 text-center">بند المقبوض</th>
                  <th className="p-3 text-center">الوسيلة</th>
                  <th className="p-3 text-left">المبلغ بالدينار</th>
                  <th className="p-3 text-center">الإجراء والطباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{pay.receiptNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{pay.studentName}</div>
                      <div className="text-[10px] text-slate-700 font-mono mt-0.5">{pay.studentId}</div>
                    </td>
                    <td className="p-3 text-slate-800 font-semibold">{pay.departmentName}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-sm font-bold text-[9px] ${
                        pay.category === 'tuition' ? 'bg-amber-100 text-amber-900' :
                        pay.category === 'registration_fee' ? 'bg-sky-100 text-sky-900' :
                        'bg-slate-150 text-slate-800'
                      }`}>
                        {pay.category === 'tuition' ? 'قسط دراسي' :
                         pay.category === 'registration_fee' ? 'رسوم تسجيل' : 'أجور وخدمات'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800">
                      {pay.method === 'cash' ? 'نقدي' :
                       pay.method === 'bank_transfer' ? 'مصرفي' :
                       pay.method === 'e-wallet' ? 'زين كاش' : 'بطاقة ذكية'}
                    </td>
                    <td className="p-3 text-left font-mono font-black text-emerald-700 text-sm">
                      {pay.amount.toLocaleString()} د.ع
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          type="button"
                          onClick={() => setSelectedPrintReceipt(pay)}
                          className="p-1 px-2.5 text-indigo-950 bg-indigo-50 hover:bg-indigo-900 hover:text-white border border-indigo-200 hover:border-indigo-900 rounded-lg font-black text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="تحميل وطبع الوصل المالي للقبول"
                        >
                          <Printer className="w-3.5 h-3.5 shrink-0" />
                          <span>طباعة</span>
                        </button>
                        {currentRole === 'admin' && onDeletePayment && (
                          <button
                            type="button"
                            onClick={() => onDeletePayment(pay.id)}
                            className="p-1 px-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                            title="حذف هذا السند والوصل نهائياً (خاص بالأدمن)"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>حذف</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-700">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <span>لا يوجد أي إيصالات مالية في الجدول تطابق الفلاتر المحددة حالياً.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-[11px] text-slate-700 leading-relaxed font-bold">
            <span className="text-amber-700">📌 تنبيه الحسابات:</span>
            <span>كافة المعاملات المالية تتبع الدليل المحاسبي وموثقة بالتوثيق الضريبي لوزارة التعليم العالي والبحث العلمي العراقية.</span>
          </div>

        </div>

      </div>

      {/* نافذة الوصل المالي للقبول والطباعة الرسمية */}
      {selectedPrintReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-in pdf-style-container p-6 space-y-5 text-right printable-receipt">
            
            {/* هيد الترويسة الأكاديمية الرسمية لجامعة الكوت */}
            <OfficialKutHeader 
              {...headerConfig}
              collegeAr={headerConfig?.collegeAr || "كلية الكوت الجامعة"}
              collegeEn={headerConfig?.collegeEn || "Kut University College"}
              officeAr={headerConfig?.officeAr || "مكتب العميد / القسم المالي"} 
              officeEn={headerConfig?.officeEn || "Dean Office / Finance Department"} 
            />
            
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-bold">وصل قبض وقبض أجور دراسية رسمي: <strong className="font-mono text-emerald-800 text-sm">#{selectedPrintReceipt.receiptNumber}</strong></span>
              <span className="text-[11px] text-slate-500 font-mono">تاريخ الإيصال: {selectedPrintReceipt.date}</span>
            </div>

            {/* تفاصيل السند المالي المطبوع */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-50">
                <div>
                  <span className="text-slate-700 font-bold block">إسم الطالب الثلاثي:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedPrintReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-700 font-bold block">الرقم الجامعي للطلبة:</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{selectedPrintReceipt.studentId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-50">
                <div>
                  <span className="text-slate-700 font-bold block">الكلية الأكاديمية:</span>
                  <span className="font-bold text-slate-800">{selectedPrintReceipt.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-700 font-bold block">فئة ووجه المقبوض الزمني:</span>
                  <span className="font-bold text-slate-800">
                    {selectedPrintReceipt.category === 'tuition' ? 'قسط دراسي معتمد' :
                     selectedPrintReceipt.category === 'registration_fee' ? 'رسوم وخدمات التسجيل' : 'أخرى'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl text-center space-y-1">
                <span className="text-amber-800 font-bold block text-xs">المبلغ المستلم المقبوض كاملاً:</span>
                <span className="text-slate-900 font-black font-mono text-xl md:text-2xl">
                  {selectedPrintReceipt.amount.toLocaleString()} دينار عراقي
                </span>
                <p className="text-[10px] text-slate-700">فقط مليون وخمسمائة ألف دينار عراقي لا غير.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 text-[11px] text-slate-700">
                <div>
                  <span className="block">طريقة السداد: <span className="font-bold text-slate-700">
                    {selectedPrintReceipt.method === 'cash' ? 'نقدي' :
                     selectedPrintReceipt.method === 'bank_transfer' ? 'مصرفي' :
                     selectedPrintReceipt.method === 'e-wallet' ? 'زين كاش' : 'بطاقة ذكية'}
                  </span></span>
                  <span className="block mt-0.5">مسؤول نظام التدقيق: <span className="font-bold text-slate-700">{selectedPrintReceipt.loggedBy || 'أركان ضياء البياتي - قسم الحسابات'}</span></span>
                </div>
                <div className="text-left flex flex-col items-end gap-1">
                  <span className="text-[9px] text-slate-350 block uppercase">ختم الحسابات المركزي</span>
                  <div className="w-14 h-14 border-4 border-emerald-600/30 text-emerald-600/40 font-bold rounded-full flex items-center justify-center text-[10px] transform rotate-12 select-none pointer-events-none">
                    مـقـبـوض
                  </div>
                </div>
              </div>

              {noteText && (
                <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-700 leading-relaxed text-right font-sans">
                  {noteText}
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-3 border-t border-slate-100 pt-4 no-print col-span-2">
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
                              body { font-family: 'system-ui', sans-serif; direction: rtl; padding: 20px; background-color: white; color: black; -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4 portrait; margin: 15mm; }
                              .no-print { display: none !important; }
                            </style>
                          </head>
                          <body onload="window.focus(); window.print(); setTimeout(function(){ window.close(); }, 500);">
                            <div class="w-full max-w-4xl mx-auto p-8 border-2 border-slate-400 rounded-2xl shadow-sm" style="font-size: 1.15rem; min-height: 50vh;">
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
                onClick={() => setSelectedPrintReceipt(null)}
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
