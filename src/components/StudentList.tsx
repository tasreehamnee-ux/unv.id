/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  UserPlus, 
  Check, 
  X, 
  AlertCircle, 
  Calendar,
  Layers,
  Phone,
  ArrowLeftRight,
  User,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { Student, Department, StudyShift, StudentStatus, RequiredDocument, Payment, PaymentCategory, PaymentMethod } from '../types';
import { SYSTEM_CURRENT_DATE } from '../data/mockData';
import * as XLSX from 'xlsx';

interface StudentListProps {
  students: Student[];
  departments: Department[];
  onAddStudent: (newStudent: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSelectStudent: (id: string) => void;
  setActiveTab: (tab: string) => void;
  currentRole?: string;
  onAddPayment?: (newPayment: Payment) => void;
}

export default function StudentList({ 
  students, 
  departments, 
  onAddStudent, 
  onDeleteStudent,
  onSelectStudent,
  setActiveTab,
  currentRole,
  onAddPayment
}: StudentListProps) {
  
  // حالات التحكم بالفلاتر والمكعبات البصرية
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // حالات مودال إدخال رقم الوصل المالي للطلبة (Student Affairs inline receipt input)
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptModalStudent, setReceiptModalStudent] = useState<Student | null>(null);
  const [receiptAmount, setReceiptAmount] = useState<number>(500000);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptCategory, setReceiptCategory] = useState<PaymentCategory>('tuition');
  const [receiptMethod, setReceiptMethod] = useState<PaymentMethod>('cash');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState('');

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptModalStudent || !receiptAmount || !receiptNumber) {
      alert('يرجى ملء جميع الحقول المطلوبة وقيمة الوصل المالي!');
      return;
    }

    if (onAddPayment) {
      const generatedPayId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
      const newPayment: Payment = {
        id: generatedPayId,
        studentId: receiptModalStudent.id,
        studentName: receiptModalStudent.name,
        departmentName: departments.find(d => d.id === receiptModalStudent.departmentId)?.name || receiptModalStudent.departmentId,
        amount: Number(receiptAmount),
        date: SYSTEM_CURRENT_DATE,
        receiptNumber: `REC-2026-${receiptNumber}`,
        category: receiptCategory,
        method: receiptMethod,
        loggedBy: currentRole === 'admin' ? 'مدير النظام الأول' : 'شعبة التسجيل وقيد الطلاب والقبول',
        notes: receiptNotes
      };

      onAddPayment(newPayment);
      setReceiptSuccessMsg('✓ تم تسجيل وتثبيت رقم الوصل المالي بنجاح في النظام الموحد!');
      
      setTimeout(() => {
        setReceiptSuccessMsg('');
        setShowReceiptModal(false);
        setReceiptModalStudent(null);
      }, 1500);
    }
  };

  // صلاحية الإدارة للأكسيل حصرية لمدير التسجيل ومدير النظام (admin & registration_director)
  const isAuthorized = currentRole === 'admin' || currentRole === 'registration_director';

  const resolveDeptId = (deptString: string) => {
    if (!deptString) return departments[0]?.id || 'software-eng';
    const dStr = String(deptString).trim();
    const found = departments.find(d => 
      d.name.includes(dStr) || 
      dStr.includes(d.name) || 
      d.id.toLowerCase() === dStr.toLowerCase()
    );
    return found ? found.id : (departments[0]?.id || 'software-eng');
  };

  const getFeeForDept = (deptId: string, shift: StudyShift) => {
    const dept = departments.find(d => d.id === deptId);
    if (!dept) return 0;
    return shift === 'morning' ? dept.annualFeeMorning : dept.annualFeeEvening;
  };

  const handleExportToExcel = () => {
    if (filteredStudents.length === 0) {
      alert('⚠️ لا توجد بيانات في القائمة الحالية لتصديرها!');
      return;
    }
    const dataToExport = filteredStudents.map(student => {
      const dept = departments.find(d => d.id === student.departmentId);
      const deliveredDocs = student.documents.filter(d => d.provided).map(d => d.name).join('، ');
      const pendingDocs = student.documents.filter(d => !d.provided).map(d => d.name).join('، ');
      
      return {
        'الكود الجامعي': student.id,
        'الاسم الرباعي واللقب': student.name,
        'رقم الهاتف': student.phone,
        'الرقم الوطني الموحد / الجواز': student.nationalId,
        'القسم العلمي': dept?.name || student.departmentId,
        'الكلية': dept?.college || '',
        'نوع وجبة الدراسة والدوام': student.shift === 'morning' ? 'صباحي' : 'مسائي',
        'المرحلة الدراسية': student.stage,
        'حالة القيد': student.status === 'active' ? 'نشط ومكتمل' : student.status === 'pending_documents' ? 'نقص مستندات' : student.status === 'suspended' ? 'مؤجل / معلق' : 'خريج',
        'سنة القبول': student.enrollmentYear,
        'بريد السيرفر الوزاري': student.email,
        'القسط السنوي الكلي (د.ع)': student.totalTuitionFee,
        'تاريخ التسجيل بالبوابة': student.registrationDate,
        'المستندات المستلمة': deliveredDocs,
        'المستندات المعلقة': pendingDocs,
        'ملاحظات إدارية': student.notes || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل الطلبة');
    XLSX.writeFile(workbook, `سجل_الطلبة_الجامعة_الأهلية_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'الاسم': 'محمد عباس علي الهلالي',
        'السكن': 'بابل',
        'رقم التلفون': '07801234567',
        'الكلية': 'طب الأسنان',
        'المرحلة': 2
      },
      {
        'الاسم': 'زهراء حسين عبد الرضا',
        'السكن': 'بغداد',
        'رقم التلفون': '07709876543',
        'الكلية': 'الصيدلة',
        'المرحلة': 1
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج الاستيراد الخماسي');
    XLSX.writeFile(workbook, 'نموذج_استيراد_الطلاب_الخماسي.xlsx');
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthorized) {
       alert('⚠️ خطأ: هذه الصلاحية حصرية لمدير التسجيل ولمدير النظام فقط!');
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(sheet);

        if (json.length === 0) {
          alert('⚠️ ملف الإكسيل فارغ أو غير متوافق!');
          return;
        }

        const getRowValByPatterns = (row: any, patterns: string[]) => {
          const keys = Object.keys(row);
          // 1. Try exact or lowercase contains
          for (const key of keys) {
            const cleanKey = key.trim().toLowerCase();
            if (patterns.some(p => cleanKey === p || cleanKey.includes(p) || p.includes(cleanKey))) {
              return row[key];
            }
          }
          // 2. Clear out Arabic variations
          const normalizeArabic = (str: string) => {
            return str
              .trim()
              .replace(/[أإآا]/g, 'ا')
              .replace(/ة/g, 'ه')
              .replace(/ى/g, 'ي')
              .replace(/\s+/g, '');
          };
          const normalizedPatterns = patterns.map(p => normalizeArabic(p));
          for (const key of keys) {
            const normKey = normalizeArabic(key);
            if (normalizedPatterns.some(np => normKey.includes(np) || np.includes(normKey))) {
              return row[key];
            }
          }
          return undefined;
        };

        let importCount = 0;
        json.forEach((row) => {
          // Robust column matching with fallbacks for robust importing of all student names in the Excel sheets
          let name = getRowValByPatterns(row, ['الاسم', 'الاسم الكامل', 'اسم الطالب', 'الاسم الرباعي واللقب', 'الاسم الرباعي', 'الاسم الثلاثي', 'اسم', 'name']);
          
          if (!name) {
            // Fallback: look for the first column with non-numeric text string (usually is the name)
            const rowKeys = Object.keys(row);
            for (const k of rowKeys) {
              const valStr = String(row[k] || '').trim();
              if (valStr && isNaN(Number(valStr)) && valStr.length > 3 && !valStr.startsWith('07') && !valStr.startsWith('+964')) {
                name = row[k];
                break;
              }
            }
            if (!name && rowKeys.length > 0) {
              name = row[rowKeys[0]];
            }
          }

          const residence = getRowValByPatterns(row, ['السكن', 'سكن', 'محافظة السكن', 'المحافظة', 'العنوان', 'محافظه', 'residence', 'address']) || 'بابل';
          const phone = getRowValByPatterns(row, ['تلفون', 'الهاتف', 'هاتف', 'رقم الموبايل', 'رقم الهاتف', 'موبايل', 'جوال', 'تليفون', 'phone', 'mobile']) || '07700000000';
          const deptName = getRowValByPatterns(row, ['القسم', 'قسم', 'القسم العلمي', 'التخصص', 'تخصص', 'department', 'dept', 'كلية', 'الكلية']) || '';
          const stageValRaw = getRowValByPatterns(row, ['المرحلة', 'مرحلة', 'المرحلة الدراسية', 'stage', 'grade', 'year']);
          const stageVal = Number(stageValRaw || 1);

          if (name) {
            const resolvedDept = resolveDeptId(deptName);
            const finalShift: StudyShift = 'morning';
            const finalGender: 'male' | 'female' = 'male';
            const finalStage = ([1, 2, 3, 4, 5].includes(stageVal) ? stageVal : 1) as 1 | 2 | 3 | 4 | 5;
            const finalFee = getFeeForDept(resolvedDept, finalShift);
            
            const uniqueIndex = students.length + importCount + 10;
            const finalId = `STU-2026-00${uniqueIndex}`;

            const importedStudent: Student = {
              id: finalId,
              name: String(name).trim(),
              email: `${finalId.toLowerCase()}@ahliya.edu.iq`,
              phone: String(phone).trim(),
              nationalId: String(Math.floor(100000000000 + Math.random() * 900000000000)),
              gender: finalGender,
              dob: '2005-01-01',
              departmentId: resolvedDept,
              enrollmentYear: 2026,
              shift: finalShift,
              stage: finalStage,
              status: 'active',
              registrationDate: SYSTEM_CURRENT_DATE,
              totalTuitionFee: finalFee,
              documents: [
                { id: 'doc-1', name: 'وثيقة الدراسة الإعدادية الأصلية ومصدقة', provided: true, receivedDate: SYSTEM_CURRENT_DATE },
                { id: 'doc-2', name: 'البطاقة الوطنية الموحدة (أو الجنسية)', provided: true, receivedDate: SYSTEM_CURRENT_DATE, expiryDate: '2031-12-31' },
                { id: 'doc-3', name: 'شهادة الفحص الطبي الصادرة من دائرة الصحة', provided: true, receivedDate: SYSTEM_CURRENT_DATE, expiryDate: '2027-04-15' },
                { id: 'doc-4', name: 'صور شخصية بخلفية بيضاء (عدد 6)', provided: true, receivedDate: SYSTEM_CURRENT_DATE },
                { id: 'doc-5', name: 'كفالة ضامنة قانونية', provided: true, receivedDate: SYSTEM_CURRENT_DATE },
              ],
              notes: 'تم الاستيراد والتدقيق عبر ملف Excel الخماسي المعتمد',
              sentToCollege: true,
              sentToCollegeDate: new Date().toISOString(),
              
              // الحقول الإضافية المطلوبة لتعبئة الجدول والتحقق الفوري
              examNumber: 'EXM-' + (102930 + uniqueIndex),
              graduationYear: 2025,
              studentType: 'صباحي',
              attempt: 'الدور الأول',
              attemptsCount: 1,
              languageScore: 82,
              averageWithoutAdditions: 78.4,
              admissionAverage: 79.4,
              branch: 'أحيائي',
              channel: 'القبول المركزي',
              law15: 'غير مشمول',
              residence: String(residence).trim(),
              institute: 'لا يوجد',
              exception: 'لا يوجد',
              registrationCode: 'REG-2026-N-' + (4128 + uniqueIndex),
              receiptNumber: 'REC-2026-' + (9801 + uniqueIndex),
              receiptDate: SYSTEM_CURRENT_DATE,
              completedPayment: 'نعم',
              commencementStatus: 'مباشرة فعالة'
            };

            onAddStudent(importedStudent);
            importCount++;
          }
        });

        alert(`⚡ تم الاستيراد بنجاح! تم قراءة ومعالجة كافة الصفوف والأسماء وتسجيل (${importCount}) طالب بنجاح.`);
        if (e.target) e.target.value = '';
      } catch (err) {
        console.error(err);
        alert('⚠️ فشل في معالجة وقراءة ملف الاكسيل، يرجى التثبت من سلامة الملف أو صيغة البيانات.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // حالات النموذج الجديد لطالب
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');
  const [formDob, setFormDob] = useState('2007-01-01');
  const [formDepartment, setFormDepartment] = useState(departments[0]?.id || 'software-eng');
  const [formShift, setFormShift] = useState<StudyShift>('morning');
  const [formStage, setFormStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [formStatus, setFormStatus] = useState<StudentStatus>('active');
  const [formNotes, setFormNotes] = useState('');

  // إدارة مستندات الطالب عند التسجيل مع تواريخ صلاحيتها
  const [doc1Provided, setDoc1Provided] = useState(true);
  const [doc2Provided, setDoc2Provided] = useState(true);
  const [doc2Expiry, setDoc2Expiry] = useState('2031-12-31'); // البطاقة الوطنية
  const [doc3Provided, setDoc3Provided] = useState(true);
  const [doc3Expiry, setDoc3Expiry] = useState('2026-08-30'); // الفحص الطبي
  const [doc4Provided, setDoc4Provided] = useState(true);
  const [doc5Provided, setDoc5Provided] = useState(true);

  // حساب القسط تلقائياً بناء على القسم والدوام
  const getSelectedDepartmentFee = () => {
    const dept = departments.find(d => d.id === formDepartment);
    if (!dept) return 0;
    return formShift === 'morning' ? dept.annualFeeMorning : dept.annualFeeEvening;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formNationalId) {
      alert('يرجى ملء المربعات الأساسية (الاسم الرباعي، الهاتف، تفاصيل الهوية الوطنية)');
      return;
    }

    // إعداد الوثائق ومستمسكات الصلاحية والانتهاء
    const assignedDocs: RequiredDocument[] = [
      { id: 'doc-1', name: 'وثيقة الدراسة الإعدادية الأصلية ومصدقة', provided: doc1Provided, receivedDate: doc1Provided ? SYSTEM_CURRENT_DATE : undefined },
      { id: 'doc-2', name: 'البطاقة الوطنية الموحدة (أو الجنسية)', provided: doc2Provided, receivedDate: doc2Provided ? SYSTEM_CURRENT_DATE : undefined, expiryDate: doc2Provided ? doc2Expiry : undefined },
      { id: 'doc-3', name: 'شهادة الفحص الطبي الصادرة من دائرة الصحة', provided: doc3Provided, receivedDate: doc3Provided ? SYSTEM_CURRENT_DATE : undefined, expiryDate: doc3Provided ? doc3Expiry : undefined },
      { id: 'doc-4', name: 'صور شخصية بخلفية بيضاء (عدد 6)', provided: doc4Provided, receivedDate: doc4Provided ? SYSTEM_CURRENT_DATE : undefined },
      { id: 'doc-5', name: 'كفالة ضامنة قانونية', provided: doc5Provided, receivedDate: doc5Provided ? SYSTEM_CURRENT_DATE : undefined },
    ];

    const generateId = `STU-2026-00${students.length + 1}`;
    
    const newStudent: Student = {
      id: generateId,
      name: formName,
      email: formEmail || `${generateId.toLowerCase()}@ahliya.edu.iq`,
      phone: formPhone,
      nationalId: formNationalId,
      gender: formGender,
      dob: formDob,
      departmentId: formDepartment,
      enrollmentYear: 2026,
      shift: formShift,
      stage: formStage,
      status: formStatus,
      registrationDate: SYSTEM_CURRENT_DATE,
      totalTuitionFee: getSelectedDepartmentFee(),
      documents: assignedDocs,
      notes: formNotes,
      sentToCollege: true,
      sentToCollegeDate: new Date().toISOString()
    };

    onAddStudent(newStudent);
    
    // إخطار نجاح الإرسال التلقائي لمجلس الكلية
    const matchedDept = departments.find(d => d.id === formDepartment);
    alert(`🎉 تم حفظ الطالب بنجاح!\n📡 تم إرسال وبث الاسم والمعلومات تلقائياً وبشكل فوري إلى عمادة وشؤون الكلية المعنية: ${matchedDept ? matchedDept.name : 'الكلية المستقبلية'}`);
    
    // تصفير النموذج
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormNationalId('');
    setFormNotes('');
    setShowAddForm(false);
  };

  // تصفية الطلاب
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.phone.includes(searchTerm) ||
                          student.nationalId.includes(searchTerm);
    const matchesDept = filterDepartment === 'all' || student.departmentId === filterDepartment;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesShift = filterShift === 'all' || student.shift === filterShift;
    
    return matchesSearch && matchesDept && matchesStatus && matchesShift;
  });

  return (
    <div className="space-y-6">
      
      {/* عنوان القسم ومفتاح العرض */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-indigo-950 font-sans">مركز تسجيل وإدارة شؤون الطلبة 🎓</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">تحديد وتسجيل القيود الجديدة وتثبيت المستندات والوصيلات المالية الموثقة</p>
        </div>
        {(currentRole === 'admin' || currentRole === 'registration_director') && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-univ-emerald hover:bg-emerald-700 text-white font-black text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer font-sans"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'إغلاق نافذة التسجيل' : 'تسجيل طالب جديد ➕'}</span>
          </button>
        )}
      </div>

      {/* نموذج تسجيل طالب جديد */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md animate-fade-in space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-univ-emerald" />
            <h3 className="font-bold text-slate-800 text-base">استمارة قبول وتسجيل الطالب الإلكترونية</h3>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* الاسم الرباعي واللقب */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <span>الاسم الرباعي واللقب للطلب *</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="مثال: أحمد كريم عبد الحسن السهلاني"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-emerald focus:bg-white p-3 rounded-lg outline-hidden text-slate-800"
                  required
                />
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">رقم الهاتف الفعال (للاتصال والتواصل) *</label>
                <input 
                  type="tel" 
                  placeholder="مثال: 0770XXXXXXX"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-emerald focus:bg-white p-3 rounded-lg outline-hidden text-left direction-ltr text-slate-800"
                  required
                />
              </div>

              {/* الرقم الوطني الموحد للجنسية / الجواز */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">الرقم الوطني الموحد للهوية / جواز السفر *</label>
                <input 
                  type="text" 
                  placeholder="مثال: 199923849102"
                  value={formNationalId}
                  onChange={(e) => setFormNationalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-emerald focus:bg-white p-3 rounded-lg outline-hidden text-slate-800"
                  required
                />
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">البريد الإلكتروني للطلب (اختياري)</label>
                <input 
                  type="email" 
                  placeholder="email@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-emerald focus:bg-white p-3 rounded-lg outline-hidden text-slate-800"
                />
              </div>

              {/* تاريخ الميلاد */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">تاريخ الميلاد</label>
                <input 
                  type="date" 
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-hidden text-slate-800"
                />
              </div>

              {/* الجنس */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">الجنس</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex-1 justify-center cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={formGender === 'male'} 
                      onChange={() => setFormGender('male')}
                    />
                    <span>ذكر</span>
                  </label>
                  <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex-1 justify-center cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={formGender === 'female'} 
                      onChange={() => setFormGender('female')}
                    />
                    <span>أنثى</span>
                  </label>
                </div>
              </div>

              {/* اختيار الكلية الأكاديمية */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-univ-emerald" />
                  <span>الكلية الأكاديمية المطلوب التسجيل فيها</span>
                </label>
                <select 
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.college})</option>
                  ))}
                </select>
              </div>

              {/* نوع الدراسة والدوام */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">نوع وجبة الدراسة والدوام</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex-1 justify-center cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="shift" 
                      checked={formShift === 'morning'} 
                      onChange={() => setFormShift('morning')}
                    />
                    <span>صباحي (كامل القسط)</span>
                  </label>
                  <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex-1 justify-center cursor-pointer select-none">
                    <input 
                      type="radio" 
                      name="shift" 
                      checked={formShift === 'evening'} 
                      onChange={() => setFormShift('evening')}
                    />
                    <span>مسائي (قسط الإضافة)</span>
                  </label>
                </div>
              </div>

              {/* المرحلة الدراسية */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">مرحلة القبول والتحشيد</label>
                <select 
                  value={formStage}
                  onChange={(e) => setFormStage(Number(e.target.value) as any)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800"
                >
                  <option value={1}>المرحلة الأولى (جدد)</option>
                  <option value={2}>المرحلة الثانية (ترحيل)</option>
                  <option value={3}>المرحلة الثالثة</option>
                  <option value={4}>المرحلة الرابعة</option>
                  <option value={5}>المرحلة الخامسة (طبي)</option>
                </select>
              </div>

            </div>

            {/* المستندات المودعة وتواريخ انتهاء الصلاحية الهامة (Critically Required Expiration Date Integration) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center justify-between">
                <span>🗂️ تسليم المستمسكات الرسمية وتعيين تواريخ انتهاء الصلاحية:</span>
                <span className="text-xs text-red-600 font-medium">مهم جداً للتدقيق الأرشيفي</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. وثيقة الدراسة الاعدادية */}
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={doc1Provided} 
                      onChange={() => setDoc1Provided(!doc1Provided)}
                    />
                    <span>شهادة وثيقة الدراسة الإعدادية الأصلية</span>
                  </label>
                  {doc1Provided ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">مستلمة</span>
                  ) : (
                    <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded-sm">معلّقة</span>
                  )}
                </div>

                {/* 2. البطاقة الموحدة وتاريخ انتهاء الصلاحية */}
                <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={doc2Provided} 
                        onChange={() => setDoc2Provided(!doc2Provided)}
                      />
                      <span className="font-bold">البطاقة الوطنية الموحدة / الجواز</span>
                    </label>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${doc2Provided ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {doc2Provided ? 'مستلمة' : 'معلقة'}
                    </span>
                  </div>
                  {doc2Provided && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">تاريخ انتهاء صلاحية الهوية الوطنية / الجواز:</label>
                      <input 
                        type="date"
                        value={doc2Expiry}
                        onChange={(e) => setDoc2Expiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-1.5 rounded-sm text-slate-700"
                      />
                    </div>
                  )}
                </div>

                {/* 3. شهادة الفحص الطبي وتاريخ انتهاء الصلاحية */}
                <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={doc3Provided} 
                        onChange={() => setDoc3Provided(!doc3Provided)}
                      />
                      <span className="font-bold">شهادة الفحص الطبي الصلاحي</span>
                    </label>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${doc3Provided ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {doc3Provided ? 'مستلمة' : 'معلقة'}
                    </span>
                  </div>
                  {doc3Provided && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block">تاريخ انتهاء الفحص الطبي (صلاحية ٦ أشهر):</label>
                      <input 
                        type="date"
                        value={doc3Expiry}
                        onChange={(e) => setDoc3Expiry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-1.5 rounded-sm text-slate-700"
                      />
                    </div>
                  )}
                </div>

                {/* 4. كفالة ضامنة وصور شخصية */}
                <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col gap-2 justify-center">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={doc4Provided} 
                        onChange={() => setDoc4Provided(!doc4Provided)}
                      />
                      <span>الصور الشخصية (عدد 6) بخلفية بيضاء</span>
                    </label>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${doc4Provided ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {doc4Provided ? 'مستلمة' : 'معلقة'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={doc5Provided} 
                        onChange={() => setDoc5Provided(!doc5Provided)}
                      />
                      <span>الكفالة الضامنة القانونية المصدقة</span>
                    </label>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${doc5Provided ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {doc5Provided ? 'مستلمة' : 'معلقة'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* ملاحظات والتسعيرة والتأكيد */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
              <div className="md:col-span-8 space-y-1 text-xs">
                <label className="font-bold text-slate-700">ملاحظات المسجل الإدارية عن الطالب</label>
                <textarea 
                  rows={2}
                  placeholder="مثال: تم تدقيق المعدل والوثائق بحضور كفيله القانوني..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-univ-emerald p-2 rounded-lg outline-hidden text-slate-800"
                ></textarea>
              </div>

              <div className="md:col-span-4 text-center space-y-2">
                <div className="text-slate-500 text-xs font-bold font-sans">القسط السنوي المحسوب للطالب:</div>
                <div className="text-lg md:text-xl font-extrabold text-slate-900 font-mono">
                  {getSelectedDepartmentFee().toLocaleString()} <span className="text-xs font-sans font-medium text-slate-500">د.ع</span>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-univ-emerald hover:bg-emerald-700 text-white font-bold text-xs p-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  إتمام تسجيل الطالب والترحيل
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* لوحة فلترة وقائمة الطلبة الحاليين */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* شريط البحث وتطبيق الفلاتر */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* مربع البحث */}
            <div className="relative flex-grow">
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ابحث بالاسم الرباعي، الرقم الجامعي STU، رقم الهوية أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-univ-emerald pr-10 pl-4 py-2.5 rounded-xl text-xs outline-hidden text-slate-800"
              />
            </div>

            {/* الفلترة حسب الكلية */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select 
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="outline-hidden text-slate-700 cursor-pointer font-bold"
              >
                <option value="all">جميع الكليات</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* الفلترة حسب الدوام */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <ArrowLeftRight className="w-4 h-4 text-slate-400 shrink-0" />
              <select 
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="outline-hidden text-slate-700 cursor-pointer font-bold"
              >
                <option value="all">جميع أنواع الدراسة</option>
                <option value="morning">صباحي</option>
                <option value="evening">مسائي</option>
              </select>
            </div>

            {/* الفلترة حسب حالة الملف */}
            <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="outline-hidden text-slate-700 cursor-pointer font-bold"
              >
                <option value="all">كل حالات التسجيل</option>
                <option value="active">نشط ومكتمل</option>
                <option value="pending_documents">نقص مستندات وصلاحيات</option>
                <option value="suspended">مؤجل / معلق</option>
                <option value="graduated">خريج</option>
              </select>
            </div>

          </div>
        </div>

        {/* لوحة تبادل البيانات المركزي بالصيغ الرسمية (Excel) */}
        {isAuthorized && (
          <div className="mx-5 my-4 p-4.5 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-3.5 animate-fade-in text-right">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-650 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs text-slate-800">تحليل وتبادل بيانات الطلبة الرسمية (Excel ⇄ System)</h4>
                  <p className="text-[10px] text-slate-500 font-medium">مخصص لمدير التسجيل العام ومدير النظام لتصدير كشوفات التدقيق واستيراد الطلبة القدامى جماعياً</p>
                </div>
              </div>
              <div className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md font-bold uppercase shrink-0">
                الصلاحية الحالية المعتمدة: {currentRole === 'admin' ? 'مدير النظام 🛡️' : 'مدير التسجيل الفعال 🎓'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* تصدير */}
              <button
                onClick={handleExportToExcel}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-2.5 rounded-lg transition-all shadow-3xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير القائمة لملف Excel ({filteredStudents.length} طالب)</span>
              </button>

              {/* استيراد */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => document.getElementById('excel-import-file-input')?.click()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs p-2.5 rounded-lg transition-all shadow-3xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>استيراد طلبة قدامى من ملف Excel</span>
                </button>
                <input
                  id="excel-import-file-input"
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </div>

              {/* تحميل النموذج الاسترشادي */}
              <button
                onClick={handleDownloadTemplate}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs p-2.5 rounded-lg transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>تحميل قالب Excel للطلبة القدماء</span>
              </button>
            </div>
          </div>
        )}

        {/* عرض جدول الطلاب التفاعلي */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white mx-5 mb-5 text-right">
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold whitespace-nowrap">
                <th className="p-3 text-center border-b border-slate-200">ت</th>
                <th className="p-3 text-right border-b border-slate-200">اسم الطالب</th>
                <th className="p-3 text-center border-b border-slate-200">الرقم الامتحاني</th>
                <th className="p-3 text-center border-b border-slate-200">تاريخ الميلاد</th>
                <th className="p-3 text-center border-b border-slate-200">الجنس</th>
                <th className="p-3 text-center border-b border-slate-200">سنة التخرج</th>
                <th className="p-3 text-center border-b border-slate-200">نوع الطالب</th>
                <th className="p-3 text-center border-b border-slate-200">الدور</th>
                <th className="p-3 text-center border-b border-slate-200">محاولات</th>
                <th className="p-3 text-center border-b border-slate-200">درجة اللغة</th>
                <th className="p-3 text-center border-b border-slate-200">المعدل بدون اضافات</th>
                <th className="p-3 text-center border-b border-slate-200">معدل القبول</th>
                <th className="p-3 text-center border-b border-slate-200">رقم الهوية/الجواز</th>
                <th className="p-3 text-center border-b border-slate-200">الفرع</th>
                <th className="p-3 text-center border-b border-slate-200">القناة</th>
                <th className="p-3 text-center border-b border-slate-200">قانون 15</th>
                <th className="p-3 text-center border-b border-slate-200">محافظة السكن</th>
                <th className="p-3 text-center border-b border-slate-200">المعهد</th>
                <th className="p-3 text-center border-b border-slate-200">الاستثناء</th>
                <th className="p-3 text-center border-b border-slate-200">كود التسجيل</th>
                <th className="p-3 text-center border-b border-slate-200">رقم الوصل</th>
                <th className="p-3 text-center border-b border-slate-200">تاريخ الوصل</th>
                <th className="p-3 text-center border-b border-slate-200">تاريخ التسجيل</th>
                <th className="p-3 text-center border-b border-slate-200">اكمل عملية الدفع</th>
                <th className="p-3 text-center border-b border-slate-200">حالة المباشرة</th>
                <th className="p-3 text-left border-b border-slate-200">الاجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, index) => {
                const dept = departments.find(d => d.id === student.departmentId);
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                    {/* 1. ت */}
                    <td className="p-3 text-center text-slate-400 font-bold border-b border-slate-100">{index + 1}</td>
                    
                    {/* 2. اسم الطالب */}
                    <td className="p-3 border-b border-slate-100">
                      <div className="font-bold text-slate-800">{student.name}</div>
                      <div className="text-slate-400 text-[10px] md:text-xs mt-0.5 max-w-[200px] overflow-hidden truncate font-sans text-right">
                        {dept?.name || student.departmentId} ({student.phone})
                      </div>
                    </td>
                    
                    {/* 3. الرقم الامتحاني */}
                    <td className="p-3 text-center font-mono font-bold text-slate-700 border-b border-slate-100">
                      {student.examNumber || ('EXM-' + (210495 + index))}
                    </td>
                    
                    {/* 4. تاريخ الميلاد */}
                    <td className="p-3 text-center font-mono text-slate-600 border-b border-slate-100">
                      {student.dob || '2005-06-15'}
                    </td>
                    
                    {/* 5. الجنس */}
                    <td className="p-3 text-center border-b border-slate-100">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.gender === 'female' ? 'bg-pink-50 text-pink-700 border border-pink-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {student.gender === 'female' ? 'أنثى' : 'ذكر'}
                      </span>
                    </td>
                    
                    {/* 6. سنة التخرج */}
                    <td className="p-3 text-center font-mono text-slate-600 border-b border-slate-100">
                      {student.graduationYear || 2025}
                    </td>
                    
                    {/* 7. نوع الطالب */}
                    <td className="p-3 text-center border-b border-slate-100">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md font-bold text-[10px]">
                        {student.studentType || (student.shift === 'morning' ? 'صباحي' : 'مسائي')}
                      </span>
                    </td>
                    
                    {/* 8. الدور */}
                    <td className="p-3 text-center text-slate-700 font-semibold border-b border-slate-100">
                      {student.attempt || 'الدور الأول'}
                    </td>
                    
                    {/* 9. محاولات */}
                    <td className="p-3 text-center font-mono text-slate-600 border-b border-slate-100">
                      {student.attemptsCount || 1}
                    </td>
                    
                    {/* 10. درجة اللغة */}
                    <td className="p-3 text-center font-mono font-bold text-purple-700 border-b border-slate-100">
                      {student.languageScore || 85}
                    </td>
                    
                    {/* 11. المعدل بدون اضافات */}
                    <td className="p-3 text-center font-mono font-bold text-amber-700 border-b border-slate-100">
                      {student.averageWithoutAdditions || 79.5}
                    </td>
                    
                    {/* 12. معدل القبول */}
                    <td className="p-3 text-center font-mono font-extrabold text-emerald-800 bg-emerald-50/40 px-2 py-1 rounded-lg border border-emerald-100 border-dashed border-b border-slate-100">
                      {student.admissionAverage || 80.5}
                    </td>
                    
                    {/* 13. رقم الهوية/الجواز */}
                    <td className="p-3 text-center font-mono text-slate-705 font-medium border-b border-slate-100">
                      {student.nationalId}
                    </td>
                    
                    {/* 14. الفرع */}
                    <td className="p-3 text-center text-slate-600 border-b border-slate-100">
                      {student.branch || 'أحيائي'}
                    </td>
                    
                    {/* 15. القناة */}
                    <td className="p-3 text-center border-b border-slate-100">
                      <span className="bg-purple-100 text-purple-900 border border-purple-150 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {student.channel || 'القبول المركزي'}
                      </span>
                    </td>
                    
                    {/* 16. قانون 15 */}
                    <td className="p-3 text-center text-slate-600 border-b border-slate-100">
                      {student.law15 || 'غير مشمول'}
                    </td>
                    
                    {/* 17. محافظة السكن */}
                    <td className="p-3 text-center text-indigo-900 font-bold border-b border-slate-100">
                      {student.residence || 'بابل'}
                    </td>
                    
                    {/* 18. المعهد */}
                    <td className="p-3 text-center text-slate-600 border-b border-slate-100">
                      {student.institute || 'لا يوجد'}
                    </td>
                    
                    {/* 19. الاستثناء */}
                    <td className="p-3 text-center text-indigo-700 font-medium border-b border-slate-100">
                      {student.exception || 'لا يوجد'}
                    </td>
                    
                    {/* 20. كود التسجيل */}
                    <td className="p-3 text-center font-mono text-slate-500 text-[11px] border-b border-slate-100">
                      {student.registrationCode || ('REG-2026-N-' + (4128 + index))}
                    </td>
                    
                    {/* 21. رقم الوصل */}
                    <td className="p-3 text-center font-mono font-bold text-amber-800 border-b border-slate-100">
                      {student.receiptNumber || ('REC-2026-' + (9801 + index))}
                    </td>
                    
                    {/* 22. تاريخ الوصل */}
                    <td className="p-3 text-center font-mono text-slate-600 border-b border-slate-100">
                      {student.receiptDate || student.registrationDate || '2026-01-20'}
                    </td>
                    
                    {/* 23. تاريخ التسجيل */}
                    <td className="p-3 text-center font-mono text-slate-600 border-b border-slate-100">
                      {student.registrationDate}
                    </td>
                    
                    {/* 24. اكمل عملية الدفع */}
                    <td className="p-3 text-center border-b border-slate-100">
                      <span className={`px-2.5 py-0.5 rounded-md font-black text-[10px] ${
                        (!student.completedPayment || student.completedPayment === 'نعم') 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' 
                          : 'bg-red-50 text-red-800 border border-red-150'
                      }`}>
                        {student.completedPayment || 'نعم'}
                      </span>
                    </td>
                    
                    {/* 25. حالة المباشرة */}
                    <td className="p-3 text-center border-b border-slate-100">
                      <span className={`px-2.5 py-0.5 rounded-md font-black text-[10px] ${
                        (!student.commencementStatus || student.commencementStatus === 'مباشرة فعالة' || student.commencementStatus === 'نعم') 
                          ? 'bg-amber-50 text-amber-800 border border-amber-150' 
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-150'
                      }`}>
                        {student.commencementStatus || 'مباشرة فعالة'}
                      </span>
                    </td>
                    
                    {/* 26. الاجراءات */}
                    <td className="p-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button 
                          onClick={() => {
                            onSelectStudent(student.id);
                            setActiveTab('portal');
                          }}
                          className="bg-univ-blue/10 hover:bg-univ-blue hover:text-white text-slate-700 transition-all font-bold text-[10px] px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <User className="w-3 h-3" />
                          <span>عرض</span>
                        </button>

                        {(currentRole === 'admin' || currentRole === 'registration_director') && onAddPayment && (
                          <button 
                            onClick={() => {
                              setReceiptModalStudent(student);
                              setReceiptAmount(500000);
                              setReceiptNumber('');
                              setReceiptCategory('tuition');
                              setReceiptMethod('cash');
                              setReceiptNotes('');
                              setShowReceiptModal(true);
                            }}
                            className="bg-indigo-900/10 hover:bg-indigo-900 hover:text-white text-indigo-905 border border-indigo-900/10 transition-all font-black text-[10px] px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                            title="إدخال وتسجيل قيد وإيصال مالي للطالب"
                          >
                            <span>وصل</span>
                          </button>
                        )}
                        <button 
                          id="delete-btn"
                          onClick={() => {
                            if (window.confirm(`⚠️ تنبيه مهم جداً: هل أنت متأكد من شطب وقيد ملف الطالب التالي وكافة وصولاته الحسابية والمالية من السيرفر بشكل نهائي؟

تفاصيل الطالب المرخص والمطالب بمراجعته:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• الاسم الكامل: ${student.name}
• القسم العلمي: ${dept?.name || student.departmentId || 'غير محدد'}
• الرقم الامتحاني: ${student.examNumber || ('EXM-' + (210495 + index))}
• كود التسجيل الموحد: ${student.registrationCode || ('REG-2026-N-' + (4128 + index))}
• الهاتف المحمول: ${student.phone || 'غير متوفر'}
• رقم جواز السفر/الهوية الوطنية: ${student.nationalId || 'غير متوفر'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

اضغط (موافق) لإتمام الإلغاء وشطب البيانات، أو اضغط (إلغاء) للتراجع.`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="bg-red-55/10 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 transition-all font-bold text-[10px] px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                          title="حذف الطالب وإلغاء القبول"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={26} className="text-center py-12 text-slate-400 font-medium whitespace-normal">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <span>لا يوجد طلاب مطابقين لمعاير البحث والفلترة المطبقة حالياً.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ذيل معلومات إحصائية سريع */}
        <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <span>يظهر الجدول {filteredStudents.length} طلاب مسجلين بالدراسة في هذه الجامعة الأهلية حالياً.</span>
          <span className="font-bold">نظام تدقيق تواريخ الانتهاء للصلاحيات يعمل في وضع التنبيه التلقائي.</span>
        </div>

      </div>

      {/* مودال إدخال رقم الوصل المالي للطلبة - شؤون الطلبة والمدير الأول */}
      {showReceiptModal && receiptModalStudent && (
        <div className="fixed inset-0 bg-slate-930/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl space-y-0 text-right">
            
            {/* الترويسة الفخمة */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <div>
                  <h3 className="font-black text-sm md:text-base text-amber-400">تثبيت وإدخال رقم الوصل المالي للقبول</h3>
                  <p className="text-slate-400 text-[10px]">قسم شؤون وقيد الطلبة الموحد • الجامعة الأهلية</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptModalStudent(null);
                }}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceiptSubmit} className="p-6 space-y-4 font-sans text-xs">
              
              {/* معلومات الطالب */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">الطالب المعني بالرسم:</span>
                  <span className="font-black text-slate-800">{receiptModalStudent.name}</span>
                </div>
                <div className="flex justify-between text-[11px] border-t border-slate-200/50 pt-1 mt-1">
                  <span className="text-slate-400">الكود الجامعي المعتمد:</span>
                  <span className="font-mono font-bold text-indigo-900">{receiptModalStudent.id}</span>
                </div>
              </div>

              {/* قيمة الدفع ورقم الوصل المالي */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="font-black text-slate-700 block text-[11px]">رقم الوصل المالي المكتوب:</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-600 focus-within:bg-white p-1.5">
                    <span className="text-slate-400 font-mono text-[10px] select-none text-left bg-slate-200/50 px-1 py-0.5 rounded-xs">REC-2026-</span>
                    <input 
                      type="text" 
                      placeholder="9450"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      className="w-full text-center font-mono font-black text-slate-800 outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-black text-slate-700 block text-[11px]">المبلغ المقبوض بالكامل (دينار عراقي):</label>
                  <input 
                    type="number" 
                    step={25000}
                    min={5000}
                    value={receiptAmount}
                    onChange={(e) => setReceiptAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white p-2.5 rounded-xl outline-hidden text-slate-800 font-mono font-black text-center"
                    required
                  />
                </div>

              </div>

              {/* بند الرسوم وطريقة الدفع */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="font-black text-slate-700 block text-[11px]">بند الرسوم المحصلة:</label>
                  <select 
                    value={receiptCategory}
                    onChange={(e) => setReceiptCategory(e.target.value as PaymentCategory)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 font-black cursor-pointer"
                  >
                    <option value="tuition">قسط دراسي تسجيل أولي</option>
                    <option value="registration_fee">أجور وتأمينات التسجيل</option>
                    <option value="fine">غرامة ورسوم تكميلية</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-black text-slate-700 block text-[11px]">طريقة القبض الفعلي:</label>
                  <select 
                    value={receiptMethod}
                    onChange={(e) => setReceiptMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 font-black cursor-pointer"
                  >
                    <option value="cash">نقدي (شعبة صندوق التسجيل)</option>
                    <option value="bank_transfer">حوالة مصرف الرافدين</option>
                    <option value="e-wallet">زين كاش</option>
                  </select>
                </div>

              </div>

              {/* ملاحظات وتأكيد */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 block">ملاحظات المسجل عن الوصل المالي الورقي:</label>
                <input 
                  type="text" 
                  placeholder="مثال: تم تدوين رقم الوصل وتدقيقه مع الدائرة القانونية..."
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white p-2.5 rounded-xl outline-hidden text-slate-800"
                />
              </div>

              {receiptSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-250 text-xs font-black animate-pulse text-center">
                  {receiptSuccessMsg}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowReceiptModal(false);
                    setReceiptModalStudent(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-md font-bold cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl font-black shadow-md cursor-pointer flex items-center gap-1"
                >
                  <span>✓ تثبيت رقم الوصل المالي</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
