/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Clock, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Student, Payment, OfficialLetter, Department, InternalMessage } from '../types';
import { calculateStudentFees, SYSTEM_CURRENT_DATE, COLLEGE_IPS } from '../data/mockData';

interface DashboardProps {
  students: Student[];
  payments: Payment[];
  letters: OfficialLetter[];
  departments: Department[];
  messages: InternalMessage[];
  setActiveTab: (tab: string) => void;
  setSelectedStudentId?: (id: string) => void;
  currentRole?: string | null;
}

export default function Dashboard({ 
  students, 
  payments, 
  letters, 
  departments, 
  messages,
  setActiveTab,
  setSelectedStudentId,
  currentRole
}: DashboardProps) {
  // التحقق من صلاحيات المشاهدة الخاصة بالأدمن ورئاسة الجامعة
  const isPresidency = currentRole === 'presidency' || currentRole?.toLowerCase().includes('presidency') || currentRole?.toLowerCase().includes('reasa') || currentRole?.includes('رئاسة');
  const canViewLetters = currentRole === 'admin' || isPresidency;

  // 1. حساب الإحصائيات العامة
  const totalStudents = students.length;
  
  // الطلاب النشطين والمعلقة وثائقهم والمؤجلين
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  const pendingDocsCount = students.filter(s => s.status === 'pending_documents').length;
  const suspendedCount = students.filter(s => s.status === 'suspended').length;

  // إحصائيات مالية
  let totalRequiredTuition = students.reduce((sum, s) => sum + s.totalTuitionFee, 0);
  let totalCollected = payments
    .filter(p => p.category === 'tuition' || p.category === 'registration_fee')
    .reduce((sum, p) => sum + p.amount, 0);
  let totalRemaining = Math.max(0, totalRequiredTuition - totalCollected);

  // إحصائيات الكتب والوثائق منتهية الصلاحية
  // الكتب المنتهية
  const expiredLettersCount = letters.filter(l => l.status === 'expired').length;
  const expiringLettersCount = letters.filter(l => l.status === 'expiring_soon').length;

  // المستمسكات منتهية الصلاحية للطلبة
  let expiredStudentDocsCount = 0;
  let expiringSoonStudentDocsCount = 0;
  
  students.forEach(student => {
    student.documents.forEach(doc => {
      if (doc.provided && doc.expiryDate) {
        const curr = new Date(SYSTEM_CURRENT_DATE);
        const exp = new Date(doc.expiryDate);
        const diffTime = exp.getTime() - curr.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          expiredStudentDocsCount++;
        } else if (diffDays <= 30) {
          expiringSoonStudentDocsCount++;
        }
      }
    });
  });

  // المراسلات الواردة النشطة
  const recentMessagesCount = messages.filter(m => m.priority === 'high').length;

  // نسبة تحصيل الأموال
  const collectionRate = totalRequiredTuition > 0 
    ? Math.round((totalCollected / totalRequiredTuition) * 100) 
    : 0;

  // توزيع الطلاب حسب القسم
  const getDepartmentStats = (deptId: string) => {
    const count = students.filter(s => s.departmentId === deptId).length;
    const dept = departments.find(d => d.id === deptId);
    return {
      count,
      percent: dept ? Math.round((count / dept.availableSeats) * 100) : 0,
      name: dept ? dept.name : deptId,
      college: dept ? dept.college : '',
      fee: dept ? dept.annualFeeMorning : 0
    };
  };

  // الألوان المستخدمة لتمثيل تفاوت توازيع الطلبة في الرسم البياني
  const CHART_COLORS = [
    '#4f46e5', // Indigo
    '#10b981', // Emerald
    '#2563eb', // Blue
    '#d97706', // Amber
    '#db2777', // Pink
    '#7c3aed', // Violet
    '#ea580c', // Orange
    '#0d9488', // Teal
    '#0284c7', // Sky
    '#ef4444', // Red
    '#475569'  // Slate
  ];

  // تبيان توزيع أعداد المقبولين على الأقسام
  const studentDistributionData = departments.map(d => ({
    name: d.name,
    value: students.filter(s => s.departmentId === d.id).length
  }));

  const hasDistributionData = studentDistributionData.some(item => item.value > 0);
  const filteredDistributionData = hasDistributionData 
    ? studentDistributionData.filter(item => item.value > 0) 
    : studentDistributionData;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  // تفاصيل عميد الكلية في حاسبات الكلية الـ IP المخصص
  const activeDeptId = currentRole?.startsWith('head_') ? currentRole.replace('head_', '') : null;
  const activeDept = activeDeptId ? departments.find(d => d.id === activeDeptId) : null;
  const activeDeptIP = activeDeptId ? (COLLEGE_IPS[activeDeptId] || '192.168.1.100') : null;
  const collegeStudents = activeDeptId ? students.filter(s => s.departmentId === activeDeptId) : [];

  return (
    <div className="space-y-6">
      
      {/* سطر الترحيب والتاريخ الإرشادي للمحاكاة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">أهلاً بك في نظام الإدارة والتسجيل المتكامل</h2>
          <p className="text-slate-700 text-xs md:text-sm mt-1">جامعة الكوت • إدارة وأتمتة المعلومات والبيانات للجامعة وكلياتها وأقسامها</p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 text-amber-800 px-4 py-2.5 rounded-xl border border-amber-100/60 text-xs font-medium shrink-0 animate-pulse">
          <Clock className="w-4 h-4 text-amber-600 animate-bounce" />
          <span>تاريخ النظام الحالي المعتمد:</span>
          <span className="font-mono font-bold bg-white text-amber-900 px-2 py-0.5 rounded-sm border border-amber-200">{SYSTEM_CURRENT_DATE}</span>
        </div>
      </div>

      {/* حاسبة الكلية المستقلة والـ IP الخاص بها لعرض أسماء المقبولين */}
      {activeDept && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-950 text-slate-100 p-6 rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden text-right font-sans space-y-6"
        >
          {/* تأثير توهج رقمي */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <div>
                <h3 className="text-base font-black text-white">🖥️ حاسبة محطة العمل المشفرة: عمادة {activeDept.name}</h3>
                <span className="text-[10px] text-slate-700 block mt-0.5">الحاسبة معتمدة لدى مركز السيرفرات ولها IP مخصص مستقل</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="text-[10px] text-slate-700">STATION IP:</span>
                <span className="font-extrabold text-emerald-400 tracking-wide">{activeDeptIP}</span>
              </div>
              <div className="bg-emerald-950/40 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-black border border-emerald-950/40">
                ADMIN VLAN SECURE 🔒
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-[11px] font-black tracking-wider text-slate-700 border-b border-slate-800 pb-1.5">
                  🛡️ وثيقة الاعتماد الأمني وبوابة التعاليق المباشرة
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-bold">اسم العميد المسؤول:</span>
                    <span className="text-slate-200 font-black">{activeDept.headOfDepartment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-bold">المرور السحابي لعميد:</span>
                    <span className="font-mono text-amber-400 font-extrabold font-black bg-slate-950 px-1.5 py-0.5 rounded">
                      AUTHORIZED
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-bold">عدد المقاعد الكلي:</span>
                    <span className="text-emerald-400 font-extrabold font-black">{activeDept.availableSeats} مقعد</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700 font-bold">سنوات الدراسة:</span>
                    <span className="text-slate-200 font-black">{activeDept.durationYears} سنوات أكاديمية</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-center">
                <span className="text-[10px] text-slate-700 font-bold block">إجمالي المقبولين في {activeDept.name} حالياً</span>
                <span className="text-4xl font-extrabold font-mono text-slate-105 block">
                  {collegeStudents.length} <span className="text-xs text-slate-700 font-sans font-medium">طالب</span>
                </span>
                <span className="text-[9px] text-slate-700 bg-slate-900 px-2 py-1 rounded block">
                  اكتمال المقاعد: {Math.round((collegeStudents.length / activeDept.availableSeats) * 105 || 0)}%
                </span>
              </div>
            </div>

            <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h4 className="text-[12px] font-black text-white flex items-center gap-1.5">
                  <span>📥 سجل كشف قيد الطلبة المقبولين بالكلية (يحدث تلقائياً)</span>
                </h4>
                <span className="text-[9px] bg-slate-950 text-slate-700 px-2 py-1 rounded">
                  قائمة الأسماء التلقائية للمقبولين
                </span>
              </div>

              {collegeStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-700 space-y-2">
                  <div className="text-3xl">📭</div>
                  <p className="font-extrabold text-xs">لا يوجد أي طالب مقبول في كلية {activeDept.name} حالياً.</p>
                  <p className="text-[10px] text-slate-800">عند قبول وتسجيل طالب جديد بالكلية، يظهر اسمه هنا فورياً وتلقائياً.</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-450 font-black">
                        <th className="pb-2">اسم الطالب المعتمد</th>
                        <th className="pb-2 text-center">الرقم التعريفي (ID)</th>
                        <th className="pb-2 text-center">القسط والترشيح</th>
                        <th className="pb-2 text-left">الحالة بالكلية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-[11px] text-slate-300">
                      {collegeStudents.map((student) => {
                        const studentFeeInfo = calculateStudentFees(student, payments);
                        return (
                          <tr key={student.id} className="hover:bg-slate-950/50 transition-colors">
                            <td className="py-2.5">
                              <span className="font-black text-white block">{student.name}</span>
                              <span className="text-[9px] text-slate-700 block mt-0.5">دراسة: {student.shift === 'morning' ? 'صباحي ☀️' : 'مسائي 🌙'} • مرحلة {student.stage}</span>
                            </td>
                            <td className="py-2.5 text-center font-mono font-bold text-slate-700">{student.id}</td>
                            <td className="py-2.5 text-center">
                              <span className="block text-slate-100 font-bold">{(student.totalTuitionFee).toLocaleString('ar-IQ')} د.ع</span>
                              <span className="text-[9px] text-emerald-400 mt-0.5 block font-bold font-mono">المسدد: {(studentFeeInfo.paid).toLocaleString('ar-IQ')} د.ع</span>
                            </td>
                            <td className="py-2.5 text-left">
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded text-[9px] font-black">
                                مقبول بالكلية تلقائياً ✓
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

      {/* بطاقات الإحصائيات الأربعة الرئيسية */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* الطلاب المسجلين */}
        <motion.div 
          variants={itemVariants}
          onClick={() => setActiveTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-700 text-sm font-medium">الطلاب المسجلين</span>
            <div className="p-3 bg-sky-50 text-sky-700 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 font-mono">{totalStudents}</h3>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm font-medium">{activeStudentsCount} نشط</span>
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-medium">{pendingDocsCount} ناقص مستندات</span>
            </div>
          </div>
        </motion.div>

        {/* الموقف المالي للمقبوضات */}
        <motion.div 
          variants={itemVariants}
          onClick={() => setActiveTab('finance')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-700 text-sm font-medium">المدفوعات والمستحصل من الرسوم</span>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono">
              {totalCollected.toLocaleString()} <span className="text-xs font-sans font-medium text-slate-700">د.ع</span>
            </h3>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-700">
              <div className="flex items-center font-medium gap-1 text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>تحصيل {collectionRate}%</span>
              </div>
              <span>المتبقي: {(totalRemaining / 1000000).toFixed(1)} مليون د.ع</span>
            </div>
          </div>
        </motion.div>

        {/* أرشفة الكتب الرسمية (مقتصرة على مدير النظام ورئاسة الجامعة) */}
        {canViewLetters && (
          <motion.div 
            variants={itemVariants}
            onClick={() => setActiveTab('letters')}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <span className="text-slate-700 text-sm font-medium">الأرشيف المركزي والكتب</span>
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900 font-mono">{letters.length}</h3>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-sm font-medium">أمر وزارة وأقسام</span>
                {expiredLettersCount > 0 && (
                  <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-600" />
                    {expiredLettersCount} منتهية
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* المراسلات الداخلية والمهام */}
        <motion.div 
          variants={itemVariants}
          onClick={() => setActiveTab('comms')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-700 text-sm font-medium">التواصل والخطوط الداخلية</span>
            <div className="p-3 bg-pink-50 text-pink-700 rounded-xl group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 font-mono">{messages.length}</h3>
            <div className="flex items-center gap-1 mt-2 text-xs text-pink-700 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-pink-600" />
              <span>{recentMessagesCount} مراسلات رئاسية عاجلة</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* الرسم البياني الدائري لتوزيع الطلاب المقبولين في الكليات والأقسام العلمية */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-50 text-indigo-700 p-2.5 rounded-xl border border-indigo-105">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-right">
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base">توزيع الطلاب المقبولين في الكليات والأقسام العلمية</h3>
              <p className="text-slate-700 text-[11px] mt-0.5">توزيع الطلاب وتعداد المقاعد ومؤشرات النسب المئوية التفصيلية في كل قسم علمي</p>
            </div>
          </div>
          <div className="bg-slate-55 text-slate-700 text-[11px] font-black px-3 py-1.5 rounded-lg border border-slate-200">
            📊 إجمالي المشمولين بالتسجيل: {totalStudents} طالب مقبول
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, index) => {
            const count = students.filter(s => s.departmentId === dept.id).length;
            const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
            return (
              <div 
                key={dept.id} 
                className="flex flex-col justify-between gap-3 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 bg-slate-50/20 transition-all shadow-2xs"
              >
                <div className="flex justify-between items-start text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                    />
                    <span className="font-extrabold text-slate-800 text-[13px]">{dept.name}</span>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0">
                    {percentage}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${percentage || 5}%`, 
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length] 
                      }} 
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 font-mono">
                    <span>الاستيعاب الجاري</span>
                    <span>{count} طالب مقبول</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* منبه تواريخ الصلاحية والانتهاء (Critically Required Feature) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* صندوق تنبيهات صلاحية الوثائق والكتب الإدارية */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-12 xl:col-span-8 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
                <span>مركز المراقبة والتحقق من تواريخ انتهاء الصلاحية</span>
              </h3>
              <p className="text-slate-700 text-xs mt-1">تتبع مستندات الطلبة والكتب الرسمية ذات الصلاحية المحدودة</p>
            </div>
            <div className="flex gap-2">
              <span className="text-[11px] font-bold bg-red-100 text-red-800 px-2 py-1 rounded-lg">
                تم كشف {expiredLettersCount + expiredStudentDocsCount} منتهي
              </span>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                {expiringLettersCount + expiringSoonStudentDocsCount} ينتهي قريباً
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* الجزء الأول: الكتب الرسمية المنتهية */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>📚 صلاحية الكتب والقرارات الرسمية:</span>
                <span className="text-[10px] text-slate-700">تحديث فوري</span>
              </h4>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {letters.filter(l => l.status === 'expired' || l.status === 'expiring_soon').map(letItem => (
                  <div 
                    key={letItem.id} 
                    className={`p-3 rounded-lg border flex flex-col justify-between gap-1 text-xs transition-colors hover:bg-white cursor-pointer`}
                    style={{
                      borderColor: letItem.status === 'expired' ? '#fecaca' : '#ffe4e6',
                      backgroundColor: letItem.status === 'expired' ? '#fef2f2' : '#fffbeb'
                    }}
                    onClick={() => setActiveTab('letters')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 truncate max-w-[200px]">{letItem.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 ${
                        letItem.status === 'expired' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {letItem.status === 'expired' ? 'ملغي/منتهي' : 'ينتهي قريباً'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-700 mt-1">
                      <span>رقم: {letItem.letterNumber}</span>
                      <span className="font-mono text-red-700 font-medium">الانتهاء: {letItem.expiryDate}</span>
                    </div>
                  </div>
                ))}

                {letters.filter(l => l.status === 'expired' || l.status === 'expiring_soon').length === 0 && (
                  <div className="text-center py-6 text-slate-700 text-xs">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span>جميع الكتب والقرارات الوزارية نشطة وصالحة تماماً.</span>
                  </div>
                )}
              </div>
            </div>

            {/* الجزء الثاني: مستمسكات الطلبة المنتهية */}
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>🪪 هوية وفحوصات الطلاب الحرجة:</span>
                <span className="text-[10px] text-slate-700">تدقيق إلكتروني</span>
              </h4>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {students.flatMap(student => 
                  student.documents
                    .filter(doc => doc.provided && doc.expiryDate)
                    .map(doc => {
                      const curr = new Date(SYSTEM_CURRENT_DATE);
                      const exp = new Date(doc.expiryDate!);
                      const diffDays = Math.ceil((exp.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
                      const isExpired = diffDays < 0;
                      const isExpiringSoon = diffDays >= 0 && diffDays <= 30;
                      
                      if (!isExpired && !isExpiringSoon) return null;

                      return (
                        <div 
                          key={`${student.id}-${doc.id}`}
                          className={`p-3 rounded-lg border flex flex-col gap-1 text-xs transition-colors hover:bg-white cursor-pointer ${
                            isExpired ? 'bg-red-50/70 border-red-200' : 'bg-amber-50/70 border-amber-200'
                          }`}
                          onClick={() => {
                            if (setSelectedStudentId) {
                              setSelectedStudentId(student.id);
                              setActiveTab('portal');
                            } else {
                              setActiveTab('students');
                            }
                          }}
                        >
                          <div className="flex justify-between items-center text-slate-800">
                            <span className="font-bold truncate max-w-[155px]">{student.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 ${
                              isExpired ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-900'
                            }`}>
                              {isExpired ? 'وثيقة منتهية' : 'تجديد فوري'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-800 mt-1 flex justify-between">
                            <span>{doc.name}</span>
                            <span className="font-mono text-red-600 font-bold">{doc.expiryDate}</span>
                          </div>
                        </div>
                      );
                    })
                ).filter(Boolean).length === 0 && (
                  <div className="text-center py-6 text-slate-700 text-xs">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span>تم التحقق من كافة وثائق الطلبة وهي صالحة تماماً!</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* توزيع السعة والامتلاء بالأقسام العلمية */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-12 xl:col-span-4 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-univ-emerald" />
              <span>الطاقة الاستيعابية للتسجيل بالأقسام</span>
            </h3>
            <p className="text-slate-700 text-xs mt-1">نسبة امتلاء المقاعد الدراسية المتاحة للعام الأول</p>
          </div>

          <div className="space-y-4 py-2 flex-grow justify-center flex flex-col">
            {departments.map(dept => {
              const stats = getDepartmentStats(dept.id);
              return (
                <div key={dept.id} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span className="font-bold text-slate-800">{dept.name}</span>
                    <span>{dept.totalEnrolled} / {dept.availableSeats} طالب</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-univ-emerald h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.round((dept.totalEnrolled / dept.availableSeats) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-700">
                    <span>{dept.college}</span>
                    <span className="font-mono font-bold text-slate-700">القسط: {(dept.annualFeeMorning / 1000000).toFixed(1)} مليون د.ع</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-700">
            <span>لمراجعة الموقف المالي والمطابقة الكاملة، اذهب إلى</span>
            <span 
              onClick={() => setActiveTab('finance')} 
              className="text-amber-800 hover:underline font-bold mr-1 cursor-pointer"
            >
              قسم الحسابات ➔
            </span>
          </div>

        </div>

      </div>

      {/* البث الإلكتروني التلقائي لأسماء ومعلومات المقبولين المباشرة إلى عمادات الكليات */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl animate-pulse">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h3 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center justify-start gap-1.5">
                <span>📡 البث السحابي التلقائي وإرسال معلومات المقبولين فوراً للعمادات</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">نشط فوري</span>
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">تبث المنظومة تلقائياً الاسم والمعلومات فور تسجيل الطالب أو استيراده إلى لوحة كليته المعنية لمدير التسجيل ومدير النظام</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-700 font-mono font-bold bg-slate-50 px-3 py-1 rounded-lg">
            بروتوكول بث القيد: SECURE-REST API v2 (AES-256)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student, idx) => {
            const dept = departments.find(d => d.id === student.departmentId);
            return (
              <div 
                key={student.id + '-' + idx} 
                className="p-3.5 bg-slate-55 rounded-xl border border-slate-150 space-y-2.5 transition-all text-right hover:border-emerald-350 hover:bg-white group"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black text-slate-800 line-clamp-1">{student.name}</span>
                  <div className="flex items-center gap-1 text-[9px] bg-emerald-100/75 text-emerald-800 font-bold px-2 py-0.5 rounded-md shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                    <span>تم البث</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-550 font-bold">
                  <span>الجهة المستقبلة: {dept?.name || 'عمادة الكلية'}</span>
                  <span className="font-mono text-slate-700">IP: 192.168.1.{30 + idx}</span>
                </div>
                <div className="pt-2 border-t border-dashed border-slate-200 flex justify-between items-center text-[9px] text-slate-700">
                  <span>تاريخ التسجيل: {student.registrationDate}</span>
                  <span className="text-emerald-750 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md text-[9px] border border-emerald-100">آمن بالكامل ✓</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* بوابة الإرشاد ومراسلة الأقسام الفورية ودليل الـ IP للجامعة */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600 animate-pulse" />
              <span>دليل بروتوكول الـ IP ونقاط الاتصال السريع المباشر بالأقسام</span>
            </h3>
            <p className="text-slate-700 text-xs mt-1">تواصل فوري مرخص وآمن مع العمداء وإدارة الحسابات عبر الشبكة الداخلية المغلقة للجامعة</p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>نظام IP ثابت ومحصّن (Static IP Zone)</span>
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          🔒 <span className="font-bold text-slate-700">تنويه تقني بخصوص الـ IP:</span> عناوين الـ IP المدرجة أدناه هي عناوين <span className="text-amber-850 font-bold bg-amber-50 px-1.5 py-0.5 rounded">ثابتة ومحصنة (Static Intranet IPs)</span> مخصصة يدوياً وجغرافياً لكل مكتب في الحرم الجامعي لضمان بقاء الشبكة مغلقة بالكامل؛ لا تتغير هذه العناوين عند إعادة تشغيل الأجهزة لضمان عدم تزييف العقد السجيلة (Anti-Spoofing) وتتبع مصدر المعاملة والكتب الصادرة بدقة مطلقة.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {[
            { role: 'presidency', name: 'رئاسة الجامعة', label: 'مكتب رئيس الجامعة السري', head: 'الرئاسة والعمادة والتدقيق المالي الأول', ip: '192.168.1.10', icon: '🏛️' },
            { role: 'registration', name: 'شؤون وتسجيل الطلبة', label: 'مركز التسجيل والقبول العام', head: 'مدير التسجيل والقبول (أ.د. منذر كامل)', ip: '192.168.1.20', icon: '📝' },
            { role: 'finance', name: 'الحسابات والمعاملات الحسابية', label: 'القسم الحسابي والمالي العام', head: 'مدير المالية والحسابات (أ.م.د. لمى هاشم)', ip: '192.168.1.30', icon: '🪙' },
            { role: 'dentistry', name: 'كلية طب الأسنان', label: 'عمادة كلية طب الأسنان', head: 'عميد الكلية (أ.د. عادل قاسم)', ip: '192.168.1.40', icon: '🦷' },
            { role: 'pharmacy', name: 'كلية الصيدلة', label: 'عمادة كلية الصيدلة', head: 'عميدة الكلية (أ.م.د. لمى هاشم)', ip: '192.168.1.50', icon: '🧪' },
            { role: 'health-med-tech', name: 'كلية التقنيات الصحية والطبية', label: 'التقنيات الصحية والطبية', head: 'عميد الكلية (أ. د. عبد الحسن مهدي)', ip: '192.168.1.60', icon: '🏥' },
            { role: 'engineering', name: 'كلية الهندسة', label: 'عمادة كلية الهندسة', head: 'عميد الكلية (د. وسام عبد اللطيف)', ip: '192.168.1.75', icon: '⚙️' },
            { role: 'nursing', name: 'كلية التمريض', label: 'عمادة كلية التمريض', head: 'عميدة الكلية (د. سحر عبد الحميد)', ip: '192.168.1.85', icon: '🩹' },
            { role: 'sports-edu', name: 'كلية التربية البدنية', label: 'التربية البدنية والعلوم الرياضية', head: 'عميد الكلية (أ. م. د. قاسم محمد)', ip: '192.168.1.90', icon: '⚽' },
            { role: 'law', name: 'كلية القانون', label: 'عمادة كلية القانون والسياسة', head: 'عميد الكلية (أ.د. منذر كامل)', ip: '192.168.1.100', icon: '⚖️' },
            { role: 'sciences', name: 'كلية العلوم', label: 'عمادة كلية العلوم الصرفة', head: 'عميد الكلية (أ. د. ساجد رزاق)', ip: '192.168.1.110', icon: '🔬' },
            { role: 'eng-tech', name: 'كلية التقنية الهندسية', label: 'التقنية الهندسية التخصصية', head: 'عميد الكلية (د. باسم كريم)', ip: '192.168.1.120', icon: '💻' },
            { role: 'admin-econ', name: 'كلية الإدارة والاقتصاد', label: 'الإدارة والاقتصاد والعلوم المالية', head: 'عميدة الكلية (د. نادية عبد الرحمن)', ip: '192.168.1.130', icon: '📊' },
            { role: 'education', name: 'كلية التربية', label: 'عمادة كلية التربية والآداب', head: 'عميد الكلية (د. عقيل حسين)', ip: '192.168.1.140', icon: '🎨' },
            { role: 'applied-arts', name: 'كلية الفنون التطبيقية', label: 'عمادة الفنون والتصاميم الحرة', head: 'عميدة الكلية (أ. م. لمياء عبد الوهاب)', ip: '192.168.1.150', icon: '🎭' }
          ].map((dept) => {
            return (
              <div key={dept.role} className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between space-y-3.5 hover:border-indigo-500/30 hover:bg-white transition-all hover:shadow-xs group">
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-start">
                    <span className="text-xl">{dept.icon}</span>
                    <span className="font-mono text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-1.5 py-0.5 rounded-sm">IP: {dept.ip}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 truncate">{dept.name}</h4>
                    <p className="text-[10px] text-slate-700 font-bold truncate mt-0.5">{dept.label}</p>
                    <p className="text-[10px] text-slate-550 mt-1 truncate">👤 المسؤول: {dept.head}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-sans">
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>متصل وآمن</span>
                  </span>
                  
                  <button
                    onClick={() => {
                      localStorage.setItem('AL_AHLIYA_COMMS_PRESELECT', dept.role);
                      localStorage.setItem('AL_AHLIYA_COMMS_COMPOSE', 'true');
                      setActiveTab('comms');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 group-hover:bg-amber-600 shadow-3xs"
                    title="مراسلة سريعة مجهزة سلفاً للفريق"
                  >
                    <span>مراسلة ➔</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* لمحة سريعة لآخر تواصل داخلي وقسم تشغيل برنامج بايثون */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* آخر المراسلات والتعميمات الداخلية */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <span>آخر التوجيهات والمراسلات الداخلية بين الأقسام</span>
            </h3>
            <button 
              onClick={() => setActiveTab('comms')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              معاينة الكل
            </button>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto">
            {messages.slice(0, 3).map(msg => (
              <div 
                key={msg.id} 
                className="p-3 bg-indigo-50/30 hover:bg-indigo-50/50 rounded-xl border border-indigo-100/40 text-xs flex flex-col gap-1 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{msg.senderName}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                    msg.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-slate-150 text-slate-800'
                  }`}>
                    {msg.priority === 'high' ? 'هام عاجل' : 'عادي'}
                  </span>
                </div>
                <p className="font-medium text-indigo-900 line-clamp-1 mt-1">{msg.subject}</p>
                <p className="text-slate-505 line-clamp-2 leading-relaxed">{msg.content}</p>
                <span className="text-[10px] text-slate-700 font-mono mt-1 text-left">
                  {new Date(msg.timestamp).toLocaleString('ar-IQ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* بطاقة لبرنامج تشغيل بايثون والتحقيق المحلي */}
        {currentRole === 'admin' ? (
          <div className="bg-univ-blue text-white p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-yellow-400 px-2 py-1 rounded-md inline-block">
                توجيهات كود بايثون البرمجي المعتمد (حصري للأدمن)
              </span>
              <h3 className="font-bold text-lg md:text-xl text-yellow-500 leading-snug">
                هل تحتاج تشغيل نظام جامعة الكوت على جهازك عبر لغة بايثون؟
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                قمنا بتطوير وتضمين برمجية متكاملة بلغة بايثون مع قاعدة بيانات SQLite لتلبية توجيهك البرمجي بالكامل. البرنامج يدعم واجهات الأوامر CLI، إدارة الوثائق، دفع الأقساط، تتبع الصلاحية وصندوق بريد الجامعة.
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
              <span className="text-[11px] text-slate-700">بايثون 3 • SQLite mdmj • OOP Architecture</span>
              <button 
                onClick={() => setActiveTab('python')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>فتح مستند بايثون وتنزيل الكود</span>
                <span className="direction-ltr">➔</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between border border-slate-800">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md inline-block border border-indigo-500/20">
                بروتوكول شؤون الكوادر والأمن الداخلي
              </span>
              <h3 className="font-bold text-base md:text-lg text-slate-100 leading-normal">
                صلاحيات الموظف وبلوغ السجلات المقيدة
              </h3>
              <p className="text-slate-700 text-xs leading-relaxed">
                بصفتك موظفاً مفعلاً، تنحصر صلاحيتك في قراءة ومطابقة ملفات كليتك الأكاديمية لتأمين الخصوصية العالية. للتبليغ عن مشاكل تقنية أو طلب كود الربط البرمجي الكامل (Python Module)، يرجى مخاطبة رئيس الجامعة مباشرة.
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-[11px]">
              <span className="text-slate-700 font-bold text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>الخادم نشط وسري</span>
              </span>
              <button 
                onClick={() => {
                  localStorage.setItem('AL_AHLIYA_COMMS_PRESELECT', 'presidency');
                  localStorage.setItem('AL_AHLIYA_COMMS_COMPOSE', 'true');
                  setActiveTab('comms');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer text-[10px]"
              >
                مخاطبة رئاسة الجامعة ✉
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
