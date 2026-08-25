/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StudyShift = 'morning' | 'evening'; // صباحي / مسائي
export type StudentStatus = 'active' | 'pending_documents' | 'suspended' | 'graduated';

export interface RequiredDocument {
  id: string;
  name: string; // e.g., "وثيقة الإعدادية مصدقة"
  provided: boolean;
  receivedDate?: string;
  expiryDate?: string; // تاريخ انتهاء الصلاحية (مثال: البطاقة الوطنية، الجواز أو الفحص الطبي)
  verifiedBy?: string;
}

export interface Student {
  id: string; // STU-2026-XXXX
  name: string; // الاسم الرباعي واللقب
  email: string;
  phone: string;
  nationalId: string; // الرقم الوطني / رقم الجواز
  gender: 'male' | 'female';
  dob: string;
  departmentId: string; // معرف القسم
  enrollmentYear: number;
  shift: StudyShift;
  stage: 1 | 2 | 3 | 4 | 5; // المرحلة الدراسية
  status: StudentStatus;
  registrationDate: string;
  academicAdvisor?: string;
  totalTuitionFee: number; // القسط الإجمالي المطلوب بالسنة
  documents: RequiredDocument[];
  notes?: string;
  sentToCollege?: boolean; // إرسال تلقائي مفعّل إلى عمادة الكلية المعنية
  sentToCollegeDate?: string; // تاريخ وبث وقت الإرسال التلقائي للفواصل
  
  // الحقول الإضافية المطلوبة لجدول وقبول الطلاب والأكسيل
  examNumber?: string; // الرقم الامتحاني
  graduationYear?: number; // سنة التخرج
  studentType?: string; // نوع الطالب
  attempt?: string; // الدور
  attemptsCount?: number; // محاولات
  languageScore?: number; // درجة اللغة
  averageWithoutAdditions?: number; // المعدل بدون اضافات
  admissionAverage?: number; // معدل القبول
  branch?: string; // الفرع
  channel?: string; // القناة
  law15?: string; // قانون 15
  residence?: string; // محافظة السكن
  institute?: string; // المعهد
  exception?: string; // الاستثناء
  registrationCode?: string; // كود التسجيل
  receiptNumber?: string; // رقم الوصل
  receiptDate?: string; // تاريخ الوصل
  completedPayment?: string; // اكمل عملية الدفع
  commencementStatus?: string; // حالة المباشرة
}

export interface Department {
  id: string;
  name: string; // اسم القسم
  college: string; // الكلية التابع لها
  annualFeeMorning: number; // القسط السنوي للصباحي
  annualFeeEvening: number; // القسط السنوي للمسائي
  durationYears: number; // سنوات الدراسة
  headOfDepartment: string; // عميد الكلية
  availableSeats: number;
  totalEnrolled: number;
}

export type PaymentCategory = 'tuition' | 'registration_fee' | 'exam_fee' | 'fine' | 'housing';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'e-wallet' | 'visa_master';

export interface Payment {
  id: string; // PAY-XXXXXX
  studentId: string;
  studentName: string; // تسهيلاً للفلترة
  departmentName: string; // اسم القسم
  amount: number; // القيمة بالدينار العراقي (IQD)
  date: string; // تاريخ الدفع
  receiptNumber: string; // رقم الوصل المالي
  category: PaymentCategory;
  method: PaymentMethod;
  loggedBy: string; // الموظف الذي سجل الدفع
  notes?: string;
}

export type LetterCategory = 
  | 'ministry_directive' // كتاب وزاري
  | 'administrative_order' // أمر إداري
  | 'internal_circular' // تعميم داخلي
  | 'student_excuse' // عذر طالب
  | 'graduation_order' // أمر تخرج
  | 'decision' // قرار إداري
  | 'comms_letter'; // كتب ومراسلات التواصل الداخلي (خانة خاصة)

export interface OfficialLetter {
  id: string; // LET-2026-XXXX
  letterNumber: string; // الرقم الإداري (مثال: ت/4329/ب)
  title: string; // موضوع الكتاب
  source: string; // الجهة المصدرة (مثال: وزارة التعليم العالي والبحث العلمي)
  destination: string; // الجهة الموجه إليها
  dateIssued: string; // تاريخ الصدور
  dateReceived?: string; // تاريخ الاستلام بالأرشيف
  expiryDate?: string; // تاريخ انتهاء الصلاحية للعمل بالقرار أو الوثيقة (مهم جداً!)
  category: LetterCategory;
  summary: string; // الخلاصة أو نص الكتاب المختصر
  attachedFileName?: string; // اسم الملف المرفق
  archivedBy: string; // اسم الموظف المسؤول
  status: 'active' | 'expired' | 'expiring_soon'; // حالة الصلاحية (تحسب ديناميكياً أو تفاعلياً)
}

export type MessageRole = 
  | 'presidency'       // رئاسة الجامعة
  | 'registration'     // مركز تسجيل الطلبة
  | 'finance'          // شعبة الحسابات
  | 'engineering'      // قسم هندسة البرمجيات
  | 'dentistry'        // قسم طب الأسنان
  | 'pharmacy'         // قسم الصيدلة
  | 'law'              // قسم القانون
  | 'business';        // قسم إدارة الأعمال

export interface InternalMessage {
  id: string;
  sender: string;
  senderName: string; // الإسم الظاهر باللغة العربية
  recipients: string[]; // المستلمون أو تعميم لجميع الأقسام
  subject: string; // موضوع الرسالة
  content: string; // المحتوى والتفاصيل
  timestamp: string; // وقت الإرسال
  priority: 'high' | 'normal' | 'low';
  readBy: string[]; // المستلمون الذين قرأوا الرسالة
  relatedLetterId?: string; // ربط كتاب رسمي بالرسالة للتسهيل
  attachmentName?: string; // اسم المرفق
  attachmentData?: string; // محتوى المرفق أو الصورة كمحاكاة ثنائية
}

// 🏢 هيكلية الأقسام الإدارية والخدمية (غير التدريسية - بدون طلبة أو أقساط)
export interface AdminDepartment {
  id: string;
  name: string; // اسم القسم / الشعبة الإدارية
  manager: string; // اسم المدير / المسؤول
  category: string; // نوع النشاط والتصنيف
  ip: string; // عنوان محطة الـ IP VLAN
  role: string; // معرف الدور
  defaultCode: string; // رمز الدخول السري
}

// 👨‍🏫 هيكلية رؤساء الأقسام العلمية والأكاديمية
export interface AcademicSubDepartment {
  id: string;
  name: string; // اسم القسم الأكاديمي التخصصي
  collegeId: string; // معرف الكلية الأم
  collegeName?: string;
  headName: string; // رئيس القسم العلمي
  ip: string;
  role: string;
  defaultCode: string;
}

