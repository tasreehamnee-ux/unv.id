/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  FolderPlus, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Printer,
  QrCode,
  Building,
  Trash2
} from 'lucide-react';
import { OfficialLetter, LetterCategory } from '../types';
import { SYSTEM_CURRENT_DATE, getLetterExpiryStatus } from '../data/mockData';
import { generateBarcodeSvg, generateQrCodeDataUrl } from './StudentPortal';
import { OfficialKutHeader, getOfficialPrintHeaderHtml, KutLogoSvg } from './KutLogo';

// 📊 مولد الباركود المخصص لصحّة صدور الوثائق لجامعة الكوت
const BarcodePattern = ({ code }: { code: string }) => {
  const widths = [2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 3, 1, 2, 1, 4, 2];
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-[1.5px] bg-white p-2 rounded-lg border border-slate-200 select-none overflow-hidden h-12 w-full max-w-[200px]">
        {widths.map((w, idx) => (
          <span 
            key={idx} 
            style={{ width: `${w}px` }} 
            className="h-8 bg-slate-900 shrink-0" 
          />
        ))}
        <span className="w-2 bg-transparent h-8 shrink-0" />
        {widths.reverse().map((w, idx) => (
          <span 
            key={`rev-${idx}`} 
            style={{ width: `${w}px` }} 
            className="h-8 bg-slate-900 shrink-0" 
          />
        ))}
      </div>
      <span className="text-[9px] font-mono tracking-[4px] mt-1 text-slate-700 font-extrabold uppercase">{code}</span>
    </div>
  );
};

// 🗺️ مولد الـ QR Code التفاعلي للحقيبة الأكاديمية
const QRCodeMock = ({ code }: { code: string }) => {
  return (
    <div className="w-20 h-20 border-2 border-slate-900 p-1 bg-white relative flex flex-wrap items-center justify-center shrink-0 rounded-xl shadow-xs select-none">
      {/* ركائز الـ QR الأساسية */}
      <span className="absolute top-1 left-1 w-5 h-5 border-2 border-slate-900 bg-white flex items-center justify-center rounded-xs"><span className="w-2.5 h-2.5 bg-slate-950 rounded-6xs" /></span>
      <span className="absolute top-1 right-1 w-5 h-5 border-2 border-slate-900 bg-white flex items-center justify-center rounded-xs"><span className="w-2.5 h-2.5 bg-slate-950 rounded-6xs" /></span>
      <span className="absolute bottom-1 left-1 w-5 h-5 border-2 border-slate-900 bg-white flex items-center justify-center rounded-xs"><span className="w-2.5 h-2.5 bg-slate-950 rounded-6xs" /></span>
      
      {/* خلايا مصفوفية عشوائية ذكية */}
      <div className="grid grid-cols-4 gap-1 w-10 h-10 opacity-90 mt-1">
        <span className="w-2 h-2 bg-slate-900 rounded-7xs" />
        <span className="w-2 h-2 bg-transparent" />
        <span className="w-2 h-2 bg-slate-900 rounded-7xs" />
        <span className="w-2 h-2 bg-slate-900 rounded-7xs" />
        <span className="w-2 h-2 bg-transparent" />
        <span className="w-2 h-2 bg-slate-900 rounded-7xs" />
        <span className="w-2 h-2 bg-transparent" />
        <span className="w-2 h-2 bg-slate-900 rounded-7xs" />
        <span className="w-2 h-2 bg-slate-900 rounded-7xs" />
        <span className="w-2 h-2 bg-slate-900 rounded-7xs" />
        <span className="w-2 h-2 bg-transparent" />
        <span className="w-2 h-2 bg-slate-900 rounded-7xs" />
      </div>
      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-slate-950 rounded-7xs" />
    </div>
  );
};

interface LettersArchiveProps {
  letters: OfficialLetter[];
  onAddLetter: (newLetter: OfficialLetter) => void;
  onDeleteLetter?: (letterId: string) => void;
  onClearAllLetters?: () => void;
  setActiveTab: (tab: string) => void;
  universityName?: string;
  universityEmail?: string;
}

export default function LettersArchive({ 
  letters, 
  onAddLetter,
  onDeleteLetter,
  onClearAllLetters,
  setActiveTab,
  universityName = 'جامعة الكوت الأهلية',
  universityEmail = 'info@alkut.edu.iq'
}: LettersArchiveProps) {
  
  // حالات الفلترة والبحث للأرشيف المركزي
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // 🛡️ حالات وقنوات صحة الصدور للوثائق المعتمدة بين كافة الكليات والأقسام لجامعة الكوت
  const [activeSubTab, setActiveSubTab] = useState<'archive' | 'authenticity'>('archive');

  // سجل شهادات ووثائق صحة الصدور المعتمدة
  const [certs, setCerts] = useState<{ id: string; studentName: string; college: string; docNumber: string; gradYear: string; dateIssued: string; certCode: string; status: 'verified' | 'pending' }[]>(() => {
    const saved = localStorage.getItem('AL_KUT_CERTS');
    return saved ? JSON.parse(saved) : [
      {
        id: 'cert-1',
        studentName: 'مرتضى صلاح جبار',
        college: 'كلية القانون - فرع القانون العام',
        docNumber: 'ق/ت/2026/102',
        gradYear: '2025/2026',
        dateIssued: '2026-05-18',
        certCode: 'UKU-LAW-2026-A9',
        status: 'verified'
      },
      {
        id: 'cert-2',
        studentName: 'زهراء عبد الأمير خضير',
        college: 'كلية تقنيات التحليلات المرضية',
        docNumber: 'ت/ط/2026/405',
        gradYear: '2024/2025',
        dateIssued: '2026-06-05',
        certCode: 'UKU-MED-2026-C3',
        status: 'verified'
      },
      {
        id: 'cert-3',
        studentName: 'سجاد حسين وادي السعيدي',
        college: 'كلية الهندسة - قسم تكنولوجيا المعلومات',
        docNumber: 'هـ/ش/2026/19',
        gradYear: '2025/2026',
        dateIssued: '2026-06-12',
        certCode: 'UKU-ENG-2026-X1',
        status: 'verified'
      }
    ];
  });

  // حفظ صحة الصدور فورياً بالتكامل مع التخزين المحلي
  React.useEffect(() => {
    localStorage.setItem('AL_KUT_CERTS', JSON.stringify(certs));
  }, [certs]);

  // نموذج تشغيل صحة صدور جديدة مبسطة للعميل
  const [newCertStudent, setNewCertStudent] = useState('');
  const [newCertCollege, setNewCertCollege] = useState('كلية القانون');
  const [newCertDocNo, setNewCertDocNo] = useState('');
  const [newCertGradYear, setNewCertGradYear] = useState('2025/2026');

  // خانة البحث الرقمي والباركود للتحقق بنمط الرادار
  const [searchCertCode, setSearchCertCode] = useState('');
  const [scannedCert, setScannedCert] = useState<any>(null);
  const [hasSearchedCert, setHasSearchedCert] = useState(false);

  // حالات كتاب الأرشيف الإداري الجديد
  const [formNumber, setFormNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSource, setFormSource] = useState('وزارة التعليم العالي والبحث العلمي');
  const [formDestination, setFormDestination] = useState('رئاسة الجامعة الأهلية / مركز التسجيل');
  const [formIssued, setFormIssued] = useState('2026-05-10');
  const [formExpiry, setFormExpiry] = useState('2026-12-31'); // تاريخ انتهاء الصلاحية للقرار
  const [formCategory, setFormCategory] = useState<LetterCategory>('ministry_directive');
  const [formSummary, setFormSummary] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // معالجة حفظ الكتاب الرسمي
  const handleSaveLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber || !formTitle || !formExpiry) {
      alert('الرجاء تعبئة الحقول الأساسية: الرقم الإداري، موضوع الكتاب وتحديد تاريخ انتهاء الصلاحية!');
      return;
    }

    const generatedId = `LET-2026-000${letters.length + 1}`;
    
    // حساب حالة الصلاحية ديناميكياً بناءً على تاريخ الصلاحية المدخل نسبةً لتاريخ النظام السيرفر الحالي
    const targetStatus = getLetterExpiryStatus(formExpiry);

    const newLetter: OfficialLetter = {
      id: generatedId,
      letterNumber: formNumber,
      title: formTitle,
      source: formSource,
      destination: formDestination,
      dateIssued: formIssued,
      dateReceived: SYSTEM_CURRENT_DATE,
      expiryDate: formExpiry,
      category: formCategory,
      summary: formSummary,
      attachedFileName: formFileName || `letter_attachment_${generatedId.toLowerCase()}.pdf`,
      archivedBy: 'سمير عبيد الصرخي - رئيس الأرشيف المركزي',
      status: targetStatus
    };

    onAddLetter(newLetter);
    setFormNumber('');
    setFormTitle('');
    setFormSummary('');
    setFormFileName('');
    setShowAddForm(false);
    setSuccessMsg('✔ تم إيداع الكتاب الرسمي في الأرشيف المركزي بنظام تتبع الصلاحيات!');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // تصفية وقنبلة البحث للكتب المؤرشفة
  const filteredLetters = letters.filter(letter => {
    // حساب حالة تجديد الصلاحية في نفس اللحظة للتأكيد
    const currentStatus = getLetterExpiryStatus(letter.expiryDate);

    const matchesSearch = letter.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          letter.letterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          letter.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          letter.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || letter.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 text-right">

      {/* 🛡️ شريط التبويبات الرئيسي لجامعة الكوت - الأرشيف وصحة الصدور */}
      <div className="flex border-b border-slate-200 bg-slate-900 text-white rounded-xl overflow-hidden p-1 shadow-sm gap-1 mb-4 select-none">
        <button
          type="button"
          onClick={() => setActiveSubTab('archive')}
          className={`flex-1 py-3 px-4 font-bold text-xs md:text-sm text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'archive'
              ? 'bg-[#1e293b] border border-slate-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-white hover:bg-slate-850'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>الأرشيف المركزي للكتب والتعميمات</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('authenticity')}
          className={`flex-1 py-3 px-4 font-bold text-xs md:text-sm text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'authenticity'
              ? 'bg-emerald-650 text-white shadow-xs'
              : 'text-slate-700 hover:text-white hover:bg-slate-850'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>بوابة صحة الصدور والتحقق من الوثائق 🛡️</span>
        </button>
      </div>

      {activeSubTab === 'archive' ? (
        <>
          {/* مقدمة الرأس لمكتب وأرشيف القيود */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">الأرشيف المركزي والكتب والتعميمات الرسمية</h2>
          <p className="text-slate-700 text-xs md:text-sm mt-1">تداول وأرشفة الأوامر الإدارية والوزارية وتثبيت فترات نفاذ القوانين</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onClearAllLetters && letters.length > 0 && (
            <button
              type="button"
              onClick={onClearAllLetters}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs md:text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              title="حذف وتفريغ كافة الكتب من قاعدة البيانات"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>تفريغ الأرشيف ({letters.length})</span>
            </button>
          )}
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-univ-blue hover:bg-slate-800 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            {showAddForm ? <Clock className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
            <span>{showAddForm ? 'معاينة القائمة' : 'أرشفة وثيقة رسمية جديدة'}</span>
          </button>
        </div>
      </div>

      {/* نجاح الإرسال */}
      {successMsg && (
        <div className="bg-emerald-100 border border-emerald-250 text-emerald-800 font-bold p-3 rounded-xl text-center text-xs animate-bounce shadow-xs">
          {successMsg}
        </div>
      )}

      {/* استمارة ومطبعة الكتب الرسمية المؤرشفة (New Official Letter Input Form) */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md animate-fade-in space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-univ-blue">
            <FolderPlus className="w-5 h-5 text-univ-blue" />
            <h3 className="font-bold text-slate-800 text-base">بوابة تسجيل وثيقة إدارية أو أمر وزاري جديد</h3>
          </div>

          <form onSubmit={handleSaveLetter} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* رقم الكتاب الإداري */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">رقم وتاريخ الصادر الإداري المستمر *</label>
                <input 
                  type="text" 
                  placeholder="مثال: م ت / ق ت / 9032"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-3 rounded-lg outline-hidden text-slate-800 font-mono text-center font-bold"
                  required
                />
              </div>

              {/* موضوع الوثيقة */}
              <div className="space-y-1.5 text-xs md:col-span-2">
                <label className="font-bold text-slate-700 block">موضوع الكتاب الرسمي / الغرض الإداري *</label>
                <input 
                  type="text" 
                  placeholder="مثال: تعليمات منح تمديد تسجيل خفجي الصلاحية في الأقسام الطبية"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-3 rounded-lg outline-hidden text-slate-800 font-bold"
                  required
                />
              </div>

              {/* الجهة الصادرة */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">الجهة الصادرة (المصدر للكتاب):</label>
                <input 
                  type="text" 
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-2.5 rounded-lg outline-hidden text-slate-800"
                />
              </div>

              {/* الجهة الموجه إليها */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">الجهة الوارد إليها / الموجه لها المباشرة:</label>
                <input 
                  type="text" 
                  value={formDestination}
                  onChange={(e) => setFormDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-2.5 rounded-lg outline-hidden text-slate-800"
                />
              </div>

              {/* تصنيف الكتاب */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">تصنيف وقانونية المستند:</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as LetterCategory)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-bold cursor-pointer"
                >
                  <option value="ministry_directive">كتاب وزاري سيادي (وزارة التعليم العالي)</option>
                  <option value="administrative_order">أمر إداري جامعي (رئاسة الجامعة)</option>
                  <option value="internal_circular">تعميم وقرار داخلي للأقسام</option>
                  <option value="student_excuse">عذر طبي أو إجازة معلّقة لطالب</option>
                  <option value="graduation_order">أمر تخرج والمنح الدراسية</option>
                </select>
              </div>

              {/* تاريخ الصدور وحب الصلاحية لانتهاء (REQUIRED METADATA CALENDARS) */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">تاريخ الصدور الرسمي للوثيقة:</label>
                <input 
                  type="date" 
                  value={formIssued}
                  onChange={(e) => setFormIssued(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800"
                />
              </div>

              {/* تاريخ انتهاء الصلاحية (Critically important feature - Expiration Limit) */}
              <div className="space-y-1.5 text-xs bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                <label className="font-bold text-red-800 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>تاريخ انتهاء الصلاحية/العمل بالقرار *</span>
                </label>
                <input 
                  type="date" 
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="w-full bg-white border border-red-200 p-2 rounded-lg text-red-900 font-bold"
                  required
                />
              </div>

              {/* اسم المرفق الرقمي للتخزين المحاكي */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">اسم الملف الرقمي المرفق (PDF):</label>
                <input 
                  type="text" 
                  placeholder="مثال: scholarship_directive_order.pdf"
                  value={formFileName}
                  onChange={(e) => setFormFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-2.5 rounded-lg outline-hidden text-slate-800 font-mono"
                />
              </div>

            </div>

            {/* الحاشية والملخص والنص البريدي */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">خلاصة نص المستند والتعليمات الملزمة (Summary):</label>
              <textarea 
                rows={3}
                placeholder="المضمون الهام للكتاب: تقرر فتح باب نقل الطلاب السحابي، ووجوب تحديث دورة التدقيق قبل تاریخ..."
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-3 rounded-lg outline-hidden text-slate-800 leading-relaxed"
                required
              ></textarea>
            </div>

            <div className="flex gap-4 justify-end pt-2">
              <button 
                type="submit" 
                className="bg-univ-blue hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                إيداع وأرشفة المستند إلكترونياً
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء الأمر
              </button>
            </div>

          </form>
        </div>
      )}

      {/* فلاتر البحث في الأرشيف المركزي */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3">
        
        {/* شريط البحث الموجه */}
        <div className="relative flex-grow">
          <Search className="absolute right-3 top-3 w-4 h-4 text-slate-700" />
          <input 
            type="text" 
            placeholder="ابحث برقم المعاملة، عنوان القرار، المضمون، أو دائرة الصادر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue pr-10 pl-4 py-2.5 rounded-xl text-xs outline-hidden text-slate-800"
          />
        </div>

        {/* فرز تصنيف المستند */}
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 font-bold cursor-pointer"
        >
          <option value="all">كل تصانيف الأرشيف</option>
          <option value="ministry_directive">كتاب وزاري حكومي</option>
          <option value="administrative_order">أمر إداري رئاسي</option>
          <option value="internal_circular">تعميمات الأقسام</option>
          <option value="student_excuse">أعذار الطلبة المرضية</option>
          <option value="graduation_order">أوامر التخرج</option>
        </select>

        {/* فرز صلاحية القرار (فكرة هامة لمراقبة الصلاحيات) */}
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 font-bold cursor-pointer"
        >
          <option value="all">كل حالات سريان الصلاحية</option>
          <option value="active">نشط وساري المفعول</option>
          <option value="expiring_soon">ينتهي قريباً جداً (⏳)</option>
          <option value="expired">منتهي الصلاحية وملغي (🔴)</option>
        </select>

      </div>

      {/* شبكة بصرية للكتب المؤرشفة والقرارات الملحومة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredLetters.map((letItem) => {
          // حساب صلاحية الكتاب بشكل فوري ميمو لتحديث الحالات تلقائياً
          const currentStatus = getLetterExpiryStatus(letItem.expiryDate);
          
          return (
            <div 
              key={letItem.id}
              className={`p-5 bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between gap-4 relative overflow-hidden ${
                currentStatus === 'expired' ? 'border-red-200 shadow-red-50/50' :
                currentStatus === 'expiring_soon' ? 'border-amber-200 shadow-amber-50/50' : 'border-slate-100'
              }`}
            >
              {/* هيد بطاقة المستند */}
              <div>
                
                {/* وسم فحص الصلاحية الرأسي ليكون واضحاً جداً */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      letItem.category === 'ministry_directive' ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' :
                      letItem.category === 'administrative_order' ? 'bg-sky-50 text-sky-800 border border-sky-100' :
                      'bg-slate-50 text-slate-700 border border-slate-100'
                    }`}>
                      {letItem.category === 'ministry_directive' ? 'كتاب وزاري' :
                       letItem.category === 'administrative_order' ? 'أمر إداري' :
                       letItem.category === 'internal_circular' ? 'تعميم أقسام' : 'معاملة رسمية'}
                    </span>
                    {onDeleteLetter && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف الوثيقة: "${letItem.title}" من الأرشيف نهائياً؟`)) {
                            onDeleteLetter(letItem.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف هذه الوثيقة من الأرشيف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                    currentStatus === 'expired' ? 'bg-red-100 text-red-800' :
                    currentStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentStatus === 'expired' ? <ShieldAlert className="w-3.5 h-3.5 text-red-700" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    <span>
                      {currentStatus === 'expired' ? 'منتهي/ملغي' :
                       currentStatus === 'expiring_soon' ? 'ينتهي قريباً!' : 'سار وصالح قانونياً'}
                    </span>
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-right">
                  <div className="font-mono text-slate-700 text-[10px] md:text-xs">
                    كود الحفظ: {letItem.id} • إداري: <span className="font-bold text-slate-750">{letItem.letterNumber}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1 hover:text-univ-blue transition-colors cursor-pointer" title={letItem.title}>
                    {letItem.title}
                  </h4>
                </div>

                {/* نص الخلاصة المودع */}
                <p className="text-slate-700 text-xs mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-3">
                  {letItem.summary}
                </p>

              </div>

              {/* الفوتر وتوضيح الصادر والوارد مع تدوين تاريخ الانتهاء */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 Text-xs">
                
                <div className="flex justify-between items-center text-[11px] text-slate-700">
                  <span>صادر عن: <span className="font-bold text-slate-700">{letItem.source}</span></span>
                  <span>موجه إلى: <span className="font-bold text-slate-705 truncate max-w-[150px] inline-block align-bottom">{letItem.destination}</span></span>
                </div>

                {/* تاريخ انتهاء الصلاحية والملف المرفق */}
                <div className="flex justify-between items-center bg-slate-50/50 p-1.5 rounded-lg text-[10px] font-mono text-slate-700">
                  <div className="flex items-center gap-1 font-bold text-red-800">
                    <Calendar className="w-3.5 h-3.5 text-red-650" />
                    <span>تاريخ انتهاء الصلاحية: {letItem.expiryDate || 'مفتوح للعمل'}</span>
                  </div>
                  {letItem.attachedFileName && (
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert(`محاكاة تحميل الملف الرقمي المؤرشف: \n${letItem.attachedFileName} \nالملف محفوظ بنجاح بالسحابة في الأرشيف المركزي.`); }}
                      className="text-indigo-600 hover:underline font-bold flex items-center gap-1 uppercase"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{letItem.attachedFileName}</span>
                    </a>
                  )}
                </div>

              </div>

            </div>
          );
        })}

        {filteredLetters.length === 0 && (
          <div className="md:col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <AlertTriangle className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">لا يوجد كتب موافقة لشريط الفلترة الحالي</h3>
            <p className="text-slate-700 text-xs mt-1">يرجى تسجيل كتب رسمية جديدة أو تغيير معيار تصفية الصلاحيات.</p>
          </div>
        )}
      </div>
        </>
      ) : (
        /* 🛡️ بوابة ومنظومة صحة الصدور المعتمدة للشبكة الداخلية لجامعة الكوت */
        <div className="space-y-6 animate-fade-in text-right">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-2">
            <h3 className="font-extrabold text-slate-850 text-sm md:text-base flex items-center gap-1.5 text-emerald-800">
              <CheckCircle className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span>منظومة صيانة ومصادقة صحة صدور الوثائق الإلكترونية المشتركة</span>
            </h3>
            <p className="text-[11px] md:text-xs text-slate-700 leading-relaxed">
              تتيح هذه المنظومة للأقسام العلمية والكليات والعمادات توليد أكواد تحقق فريدة (Certification Verification Keys) لوثائق الطلبة والخريجين، بالإضافة لخاصية الاستعلام اللحظي والرقابة من الكليات الأخرى لمنع التزوير وضمان حوكمة البيانات.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. قسم الفحص والتحقق من صحة صدور وثيقة */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-indigo-850">
                <ShieldAlert className="w-4 h-4 text-indigo-650" />
                <h4 className="font-bold text-xs md:text-sm text-slate-800">الاستعلام الفوري وحل صحة صدور وثيقة صهراء</h4>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-505 text-[11px] leading-relaxed">
                  أدخل الرمز التعريفي الفريد المطبوع على وثيقة الطالب (مثال: <span className="font-mono text-indigo-700 font-bold bg-indigo-50 p-0.5 rounded px-1">UKU-LAW-2026-A9</span>) للتحقق من صدوره الرسمي من عمادة {universityName}.
                </p>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="أدخل رمز التحقق (e.g. UKU-LAW-2026-A9)..."
                    value={searchCertCode}
                    onChange={(e) => setSearchCertCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-205/95 p-3 rounded-xl text-slate-850 font-mono font-bold uppercase text-center focus:bg-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setHasSearchedCert(true);
                      const found = certs.find(c => c.certCode.trim().toUpperCase() === searchCertCode.trim().toUpperCase());
                      setScannedCert(found || null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    تدقيق الوثيقة 🔍
                  </button>
                </div>

                {hasSearchedCert && (
                  <div className="p-4 rounded-xl border border-slate-100 animate-fade-in text-right space-y-4">
                    {scannedCert ? (
                      <div className="space-y-4 bg-emerald-50/50 border-emerald-250 border p-5 rounded-2xl animate-fade-in text-right relative overflow-hidden">
                        
                        {/* ترويسة جامعة الكوت الرسمية */}
                        <OfficialKutHeader 
                          subTitleAr="كلية الكوت الجامعة" 
                          subTitleEn="Kut University College" 
                          officeAr="مكتب العميد / صحة الصدور والشهادات" 
                          officeEn="Dean Office / Authentication" 
                        />

                        {/* الخلفية المائية الخفيفة */}
                        <div className="absolute -bottom-6 -left-6 opacity-[0.03] text-emerald-950 pointer-events-none select-none">
                          <Building className="w-40 h-40" />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-emerald-200 pb-3 gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <span>✔ وثيقة صحيحة وموثقة رسمياً</span>
                            </span>
                            <span className="font-mono text-xs text-emerald-700 bg-white border border-emerald-150 px-2 py-0.5 rounded-md font-bold">المعرف الموحد: {scannedCert.certCode}</span>
                          </div>
                          <span className="text-[10px] text-slate-700 font-bold">{universityName}</span>
                        </div>

                        {/* المحتوى الرئيسي مجزأ بجانب الباركود و الـ QR Code */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                          <div className="md:col-span-8 grid grid-cols-2 gap-3 text-xs text-slate-700">
                            <div>
                              <span className="text-slate-700 block text-right">اسم الطالب الثلاثي واللقب:</span> 
                              <strong className="text-slate-900 font-extrabold block text-right mt-0.5 text-sm">{scannedCert.studentName}</strong>
                            </div>
                            <div>
                              <span className="text-slate-700 block text-right">الكلية أو القسم المانح:</span> 
                              <strong className="text-slate-900 block text-right mt-0.5">{scannedCert.college}</strong>
                            </div>
                            <div className="mt-1">
                              <span className="text-slate-700 block text-right">رقم وتاريخ وثيقة الصدور العلمية:</span> 
                              <strong className="text-slate-900 font-mono block text-right mt-0.5">{scannedCert.docNumber}</strong>
                            </div>
                            <div className="mt-1">
                              <span className="text-slate-700 block text-right">العام الدراسي وحالة التخرج:</span> 
                              <strong className="text-slate-900 font-mono block text-right mt-0.5">{scannedCert.gradYear}</strong>
                            </div>
                          </div>

                          {/* الباركود والـ QR Code المدعوم مسبقًا */}
                          <div className="md:col-span-4 bg-white p-3 rounded-xl border border-emerald-100 flex flex-col items-center justify-center gap-2 shadow-3xs">
                            <div className="flex justify-center items-center gap-2">
                              <QRCodeMock code={scannedCert.certCode} />
                            </div>
                            <div className="w-full border-t border-slate-100 my-1"></div>
                            <BarcodePattern code={scannedCert.certCode} />
                          </div>
                        </div>

                        <div className="border-t border-emerald-200/80 pt-3 text-[10.5px] text-slate-555 font-sans flex flex-col sm:flex-row justify-between items-center text-right gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-700">جهة البث والاعتماد:</span>
                            <span className="text-slate-800 font-bold">{universityName} ({universityEmail})</span>
                          </div>
                          <div>
                            <span className="text-slate-700 ml-1">تاريخ المصادقة الفعلي بالمنظومة:</span> 
                            <strong className="text-emerald-800 font-bold bg-emerald-100/50 px-1.5 py-0.5 rounded">{scannedCert.dateIssued}</strong>
                          </div>
                        </div>

                        {/* زر الطباعة المخصصة لخطاب صحة الصدور الرسمي مع الرموز و الإيميل */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={async () => {
                              const printWin = window.open('', '_blank_' + Date.now());
                              if (!printWin) return;
                              const barcodeSvg = generateBarcodeSvg(scannedCert.certCode);
                              const certQrText = [
                                `🎓 جامعة الكوت الأهلية - صحة صدور وثيقة التخرج`,
                                `👤 اسم الطالب: ${scannedCert.studentName}`,
                                `🏛️ الكلية / القسم: ${scannedCert.college}`,
                                `📄 رقم الوثيقة: ${scannedCert.docNumber}`,
                                `📅 سنة التخرج: ${scannedCert.gradYear}`,
                                `🔐 رقم الكود المعتمد: ${scannedCert.certCode}`,
                                `✅ مصادق عليه رسمياً من منظومة الأتمتة الموحدة`
                              ].join('\n');
                              const qrDataUrl = await generateQrCodeDataUrl(certQrText, 350);
                              printWin.document.open();
                              printWin.document.write(`
                                <!DOCTYPE html>
                                <html dir="rtl" lang="ar">
                                  <head>
                                    <title>وثيقة صحة الصدور الرسمية - ${scannedCert.studentName}</title>
                                    <meta charset="utf-8">
                                    <style>
                                      * { box-sizing: border-box; margin: 0; padding: 0; }
                                      body { 
                                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                        direction: rtl; 
                                        background: #f8fafc; 
                                        padding: 25px; 
                                        color: #0f172a; 
                                        -webkit-print-color-adjust: exact; 
                                        print-color-adjust: exact; 
                                      }
                                      @page { size: A4 portrait; margin: 12mm; }
                                      @media print {
                                        .no-print { display: none !important; }
                                        body { background: #fff; padding: 0; margin: 0; }
                                        .cert-card { border: 2px solid #059669 !important; box-shadow: none !important; }
                                      }
                                      .cert-card {
                                        background: #ffffff;
                                        max-width: 820px;
                                        margin: 0 auto;
                                        padding: 35px;
                                        border-radius: 24px;
                                        border: 2px solid #059669;
                                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                                      }
                                      .header {
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        border-bottom: 2px solid #e2e8f0;
                                        padding-bottom: 18px;
                                        margin-bottom: 22px;
                                      }
                                      .univ-title { font-size: 22px; font-weight: 900; color: #0f172a; }
                                      .univ-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
                                      .badge {
                                        background: #d1fae5;
                                        color: #065f46;
                                        font-weight: 800;
                                        font-size: 12px;
                                        padding: 6px 14px;
                                        border-radius: 9999px;
                                        display: inline-block;
                                      }
                                      .code-label { font-size: 11px; color: #64748b; font-family: monospace; margin-top: 6px; }
                                      .cert-heading {
                                        font-size: 17px;
                                        font-weight: 900;
                                        color: #065f46;
                                        border-right: 4px solid #059669;
                                        padding-right: 10px;
                                        margin-bottom: 12px;
                                      }
                                      .cert-desc { font-size: 13.5px; line-height: 1.8; color: #334155; margin-bottom: 20px; }
                                      .grid-info {
                                        display: grid;
                                        grid-template-columns: 1fr 1fr;
                                        gap: 14px;
                                        background: #f8fafc;
                                        border: 1px solid #e2e8f0;
                                        border-radius: 16px;
                                        padding: 20px;
                                        margin-bottom: 24px;
                                      }
                                      .info-item span { display: block; font-size: 12px; color: #64748b; margin-bottom: 4px; }
                                      .info-item strong { font-size: 14px; color: #0f172a; }
                                      .security-section {
                                        display: grid;
                                        grid-template-columns: 1fr 1fr;
                                        gap: 20px;
                                        align-items: center;
                                        border-top: 1px solid #e2e8f0;
                                        padding-top: 20px;
                                        margin-bottom: 20px;
                                      }
                                      .sec-box { text-align: center; }
                                      .sec-box p { font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 8px; }
                                      .footer {
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        border-top: 1px solid #cbd5e1;
                                        padding-top: 15px;
                                        font-size: 12px;
                                        color: #64748b;
                                      }
                                      .btn-container {
                                        display: flex;
                                        justify-content: center;
                                        gap: 12px;
                                        margin-top: 25px;
                                      }
                                      .btn-print {
                                        background: #059669;
                                        color: white;
                                        font-weight: bold;
                                        padding: 12px 30px;
                                        border-radius: 12px;
                                        border: none;
                                        cursor: pointer;
                                        font-size: 14px;
                                        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                                      }
                                      .btn-close {
                                        background: #475569;
                                        color: white;
                                        font-weight: bold;
                                        padding: 12px 30px;
                                        border-radius: 12px;
                                        border: none;
                                        cursor: pointer;
                                        font-size: 14px;
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="cert-card">
                                      ${getOfficialPrintHeaderHtml("كلية الكوت الجامعة", "Kut University College", "مكتب العميد / صحة الصدور والشهادات", "Dean Office / Authentication")}
                                      
                                      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 12px; margin-bottom: 20px;">
                                        <div class="badge" style="background: #d1fae5; color: #065f46; font-weight: 800; font-size: 12px; padding: 5px 12px; border-radius: 9999px;">وثيقة معتمدة ومصادق عليها رسمياً ✔</div>
                                        <div class="code-label" style="font-size: 12px; color: #334155; font-family: monospace; font-weight: bold;">رقم الكود المعتمد: <strong style="color: #065f46;">${scannedCert.certCode}</strong></div>
                                      </div>

                                      <div class="cert-heading">بيان وتفاصيل صحة الصدور التوليدي</div>
                                      <p class="cert-desc">
                                        بناءً على الصلاحيات المخولة لعمادة القبول والتسجيل بـ <strong>${universityName}</strong>، وبعد فحص سجلات الخريجين في منظومة الأتمتة الموحدة، نؤكد صحة صدور الوثيقة وتطابق البيانات علمياً وإدارياً كما هي مدونة أدناه:
                                      </p>

                                      <div class="grid-info">
                                        <div class="info-item"><span>اسم الطالب المعتمد:</span> <strong>${scannedCert.studentName}</strong></div>
                                        <div class="info-item"><span>الكلية / القسم الأكاديمي:</span> <strong>${scannedCert.college}</strong></div>
                                        <div class="info-item"><span>رقم وتاريخ وثيقة التخرج:</span> <strong style="font-family: monospace;">${scannedCert.docNumber}</strong></div>
                                        <div class="info-item"><span>العام الدراسي للمعدل والتقدير:</span> <strong style="font-family: monospace;">${scannedCert.gradYear}</strong></div>
                                      </div>

                                      <div class="security-section" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:25px; background:#f8fafc; border:2px dashed #059669; border-radius:20px; margin:20px 0;">
                                        <p style="font-size:14px; font-weight:900; color:#065f46; margin-bottom:10px;">رمز التحقق والاستجابة السريعة (QR Code)</p>
                                        <img src="${qrDataUrl}" width="165" height="165" alt="QR Code" style="display:block; margin:0 auto; border:3px solid #0f172a; border-radius:12px; background:#fff; padding:5px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" />
                                        <p style="font-size:11px; color:#065f46; margin-top:8px; font-weight:800;">امسح بالكاميرا للتحقق الرقمي المعتمد من صحة الصدور</p>
                                        <p style="font-family:monospace; font-size:11px; color:#64748b; margin-top:4px;">${scannedCert.certCode}</p>
                                      </div>

                                      <div class="footer">
                                        <span>تاريخ الطباعة الفنية والمطابقة: ${new Date().toLocaleDateString('ar-IQ')}</span>
                                        <strong style="color: #0f172a;">عمادة القبول والتسجيل الإلكتروني</strong>
                                      </div>
                                    </div>

                                    <div class="btn-container no-print">
                                      <button onclick="window.print()" class="btn-print">
                                        طباعة وثيقة صحة الصدور الرسمية 🖨️
                                      </button>
                                      <button onclick="window.close()" class="btn-close">
                                        إغلاق النافذة ✖
                                      </button>
                                    </div>
                                  </body>
                                </html>
                              `);
                              printWin.document.close();
                            }}
                            className="bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold py-2 px-4 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-3xs active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة شهادة وثيقة الصدور الرسمية 🖨️</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center text-rose-800 space-y-1">
                        <p className="font-black">❌ تنبيه: هذا الرمز غير مسجل أو منتهي الصلاحية!</p>
                        <p className="text-[10px]">الرمز غير مطابق للبيانات المحفوظة في قاعدة بيانات {universityName} للوثائق والصدور.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. قسم توليد وبث وثيقة صحة صدور جديدة */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-emerald-850">
                <Plus className="w-4 h-4 text-emerald-650" />
                <h4 className="font-bold text-xs md:text-sm text-slate-800 font-sans">توليد صحة صدور رقمية جديدة للطلبة والخريجين</h4>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCertStudent || !newCertDocNo) {
                    alert('يرجى تعبئة اسم الطالب ورقم الوثيقة التوليدية للتحقق!');
                    return;
                  }

                  // صيانة الكود التعريفي
                  const initials = newCertCollege.includes('قانون') ? 'LAW' : newCertCollege.includes('تحليلات') ? 'MED' : 'GEN';
                  const code = `UKU-${initials}-2026-` + Math.random().toString(36).substring(2, 6).toUpperCase();

                  const newC = {
                    id: `cert-${Date.now()}`,
                    studentName: newCertStudent,
                    college: newCertCollege,
                    docNumber: newCertDocNo,
                    gradYear: newCertGradYear,
                    dateIssued: new Date().toISOString().split('T')[0],
                    certCode: code,
                    status: 'verified' as const
                  };

                  setCerts(prev => [newC, ...prev]);
                  setNewCertStudent('');
                  setNewCertDocNo('');
                  alert(`🎉 تم بنجاح رصد وثيقة الطالب وتوليد كود صحة الصدور الموثق: \n[ ${code} ]\nتم تسجيل البيانات للبحث الفوري بين الأقسام!`);
                }}
                className="space-y-3.5 text-xs text-right"
              >
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-right">اسم الطالب الثلاثي واللقب:</label>
                  <input 
                    type="text"
                    placeholder="مثال: حسين علي جبار..."
                    value={newCertStudent}
                    onChange={(e) => setNewCertStudent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-lg text-slate-850 font-bold outline-hidden text-right"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-right">الكلية/القسم المصدر للوثيقة:</label>
                    <select 
                      value={newCertCollege}
                      onChange={(e) => setNewCertCollege(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-bold cursor-pointer text-right mb-1"
                    >
                      <option value="كلية القانون">كلية القانون</option>
                      <option value="كلية الزراعة">كلية الزراعة</option>
                      <option value="كلية التمريض">كلية التمريض</option>
                      <option value="كلية الهندسة وأقسامها">كلية الهندسة وأقسامها</option>
                      <option value="كلية تقنيات التحليلات المرضية">كلية تقنيات التحليلات المرضية</option>
                      <option value="كلية الإدارة والاقتصاد للأعمال">كلية الإدارة والاقتصاد</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-right font-sans">رقم الوثيقة وتاريخ الصادر العلمي:</label>
                    <input 
                      type="text"
                      placeholder="مثال: ق/خ/1025"
                      value={newCertDocNo}
                      onChange={(e) => setNewCertDocNo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-lg text-slate-850 font-bold outline-hidden text-right"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-right">العام الدراسي:</label>
                  <select 
                    value={newCertGradYear}
                    onChange={(e) => setNewCertGradYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-bold cursor-pointer text-right"
                  >
                    <option value="2025/2026">2025/2026 (العام الحالي)</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2023/2024">2023/2024</option>
                    <option value="2022/2023">2022/2023</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-100" />
                  <span>توليد وتعميم الرمز وبث صحة الصدور 🚀</span>
                </button>
              </form>
            </div>

          </div>

          {/* سجل الأرشيف وصحة الصدور المسكنة */}
          <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <span className="font-extrabold text-slate-800 text-xs md:text-sm">سجل وثائق صحة الصدور المصادق عليها رسمياً بكود التحقق:</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">موثق ببلدية الجامعة: {certs.length} وثائق</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certs.map((cert) => (
                <div key={cert.id} className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl hover:bg-slate-50 transition-all text-xs flex flex-col justify-between gap-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bg-emerald-600 text-[9px] font-bold text-white p-1 px-3 rounded-br-2xl">
                    ✓ معتمد
                  </div>

                  <div className="space-y-1 text-right mt-2">
                    <p className="text-[10px] text-slate-700">الطالب وصاحب الوثيقة:</p>
                    <p className="font-black text-slate-900 text-[11.5px]">{cert.studentName}</p>
                    <p className="text-slate-800 font-medium">{cert.college}</p>
                  </div>

                  <div className="border-t border-slate-200/60 pt-2 space-y-1 text-[11px] text-slate-700">
                    <div className="flex justify-between">
                      <span>رقم الوثيقة:</span>
                      <span className="font-mono text-slate-800 font-bold">{cert.docNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>سنة التخرج:</span>
                      <span className="font-mono text-indigo-700 font-semibold">{cert.gradYear}</span>
                    </div>
                    
                    <div className="bg-white p-2 rounded-lg border border-slate-150 mt-2 text-center text-slate-800 font-mono font-bold flex justify-between items-center text-[11px]">
                      <span className="text-[9px] text-indigo-650 font-sans">كود صحة الصدور:</span>
                      <span className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-900 font-black">{cert.certCode}</span>
                    </div>
                  </div>

                  {/* الرموز المضافة: الباركود ومربع التحقق */}
                  <div className="bg-white p-2 rounded-xl border border-slate-150 flex items-center justify-between gap-2 mt-1">
                    <div className="flex flex-col gap-0.5 text-right w-full">
                      <span className="text-[8px] text-slate-700 block font-sans">الترميز التوليدي:</span>
                      <span className="font-mono text-[9px] font-bold text-slate-700">{cert.certCode}</span>
                    </div>
                    <div className="shrink-0 flex items-center justify-center p-1 bg-slate-50 border border-slate-200 rounded-md">
                      <QrCode className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-700 text-right border-t border-slate-100 pt-1.5 flex justify-between items-center font-mono">
                    <span>بث المصادقة: {cert.dateIssued}</span>
                    <button
                      onClick={() => {
                        // تفعيل الفحص التلقائي الفوري لمطابقتها للطباعة الفورية
                        setSearchCertCode(cert.certCode);
                        setHasSearchedCert(true);
                        setScannedCert(cert);
                        // نقله لأعلى الصفحة للتفاعل الفوري
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <span>تفاصيل وطبع 🖨️</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
