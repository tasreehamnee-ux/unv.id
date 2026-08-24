/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department, Student, Payment, OfficialLetter, InternalMessage } from '../types';

// تاريخ تشغيل النظام الحالي المعتمد
export const SYSTEM_CURRENT_DATE = '2026-05-27';

// العناوين الرقمية الفردية לחاسبات الكليات المعتمدة بمركز الجامعة الأهلية
export const COLLEGE_IPS: { [key: string]: string } = {
  dentistry: '192.168.12.10',
  pharmacy: '192.168.14.20',
  'health-med-tech': '192.168.16.30',
  engineering: '192.168.18.40',
  nursing: '192.168.20.50',
  'sports-edu': '192.168.22.60',
  law: '192.168.24.70',
  sciences: '192.168.26.80',
  'eng-tech': '192.168.28.90',
  'admin-econ': '192.168.30.100',
  education: '192.168.32.110',
  'applied-arts': '192.168.34.120'
};

export const mockDepartments: Department[] = [
  {
    id: 'dentistry',
    name: 'كلية طب الأسنان',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 8000000,
    annualFeeEvening: 9500000,
    durationYears: 5,
    headOfDepartment: 'أ.د. عادل قاسم الشمري',
    availableSeats: 150,
    totalEnrolled: 138
  },
  {
    id: 'pharmacy',
    name: 'كلية الصيدلة',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 7000000,
    annualFeeEvening: 8200000,
    durationYears: 5,
    headOfDepartment: 'أ.م.د. لمى هاشم الياسري',
    availableSeats: 120,
    totalEnrolled: 112
  },
  {
    id: 'health-med-tech',
    name: 'كلية التقنيات الصحية والطبية',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 4000000,
    annualFeeEvening: 4800000,
    durationYears: 4,
    headOfDepartment: 'أ. د. عبد الحسن مهدي الخفاجي',
    availableSeats: 180,
    totalEnrolled: 145
  },
  {
    id: 'engineering',
    name: 'كلية الهندسة',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 3800000,
    annualFeeEvening: 4500000,
    durationYears: 4,
    headOfDepartment: 'د. وسام عبد اللطيف الخفاجي',
    availableSeats: 100,
    totalEnrolled: 82
  },
  {
    id: 'nursing',
    name: 'كلية التمريض',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 3000500,
    annualFeeEvening: 3600000,
    durationYears: 4,
    headOfDepartment: 'د. سحر عبد الحميد الموسوي',
    availableSeats: 120,
    totalEnrolled: 98
  },
  {
    id: 'sports-edu',
    name: 'كلية التربية البدنية',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 1800000,
    annualFeeEvening: 2200000,
    durationYears: 4,
    headOfDepartment: 'أ. م. د. قاسم محمد السهيل',
    availableSeats: 80,
    totalEnrolled: 64
  },
  {
    id: 'law',
    name: 'كلية القانون',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 2800000,
    annualFeeEvening: 3400000,
    durationYears: 4,
    headOfDepartment: 'أ.د. منذر كامل العبيدي',
    availableSeats: 200,
    totalEnrolled: 185
  },
  {
    id: 'sciences',
    name: 'كلية العلوم',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 2500000,
    annualFeeEvening: 3000000,
    durationYears: 4,
    headOfDepartment: 'أ. د. ساجد رزاق الرفاعي',
    availableSeats: 150,
    totalEnrolled: 110
  },
  {
    id: 'eng-tech',
    name: 'كلية التقنية الهندسية',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 3500000,
    annualFeeEvening: 4200000,
    durationYears: 4,
    headOfDepartment: 'د. باسم كريم البهادلي',
    availableSeats: 100,
    totalEnrolled: 75
  },
  {
    id: 'admin-econ',
    name: 'كلية الإدارة والاقتصاد',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 1900000,
    annualFeeEvening: 2300000,
    durationYears: 4,
    headOfDepartment: 'د. نادية عبد الرحمن الحديثي',
    availableSeats: 150,
    totalEnrolled: 142
  },
  {
    id: 'education',
    name: 'كلية التربية',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 1600000,
    annualFeeEvening: 2000000,
    durationYears: 4,
    headOfDepartment: 'د. عقيل حسين السلامي',
    availableSeats: 150,
    totalEnrolled: 112
  },
  {
    id: 'applied-arts',
    name: 'كلية الفنون التطبيقية',
    college: 'جامعة المستقبل الأهلية',
    annualFeeMorning: 2200000,
    annualFeeEvening: 2700000,
    durationYears: 4,
    headOfDepartment: 'أ. م. لمياء عبد الوهاب الطائي',
    availableSeats: 100,
    totalEnrolled: 78
  }
];

export const mockStudents: Student[] = [
  {
    id: 'STU-2026-0001',
    name: 'أحمد كريم عبد الحسن السهلاني',
    email: 'ahmed.kareem99@gmail.com',
    phone: '07705123456',
    nationalId: '199923849102',
    gender: 'male',
    dob: '1999-04-12',
    departmentId: 'engineering',
    enrollmentYear: 2026,
    shift: 'morning',
    stage: 1,
    status: 'active',
    registrationDate: '2026-01-15',
    academicAdvisor: 'م.م. علي جابر الطائي',
    totalTuitionFee: 3800000,
    documents: [
      { id: 'doc-1', name: 'وثيقة الدراسة الإعدادية الأصلية ومصدقة', provided: true, receivedDate: '2026-01-15' },
      { id: 'doc-2', name: 'البطاقة الوطنية الموحدة (أو الجنسية)', provided: true, receivedDate: '2026-01-15', expiryDate: '2029-08-14' },
      { id: 'doc-3', name: 'شهادة الفحص الطبي الصادرة من دائرة الصحة', provided: true, receivedDate: '2026-01-18', expiryDate: '2026-07-18' },
      { id: 'doc-4', name: 'صور شخصية بخلفية بيضاء (عدد 6)', provided: true, receivedDate: '2026-01-15' },
      { id: 'doc-5', name: 'كفالة ضامنة قانونية', provided: true, receivedDate: '2026-01-20' }
    ],
    notes: 'طالب متميز وتم تسليم كافة المستمسكات المطلوبة عند القبول',
    sentToCollege: true,
    sentToCollegeDate: '2026-01-15T11:20:00Z'
  },
  {
    id: 'STU-2026-0002',
    name: 'مريم جعفر صادق الموسوي',
    email: 'maryam.j.almosawi@yahoo.com',
    phone: '07812233445',
    nationalId: '200192837482',
    gender: 'female',
    dob: '2001-11-20',
    departmentId: 'dentistry',
    enrollmentYear: 2026,
    shift: 'morning',
    stage: 1,
    status: 'pending_documents',
    registrationDate: '2026-02-10',
    academicAdvisor: 'د. سمير حامد المشايخي',
    totalTuitionFee: 8000000,
    documents: [
      { id: 'doc-1', name: 'وثيقة الدراسة الإعدادية الأصلية ومصدقة', provided: false },
      { id: 'doc-2', name: 'البطاقة الوطنية الموحدة (أو الجنسية)', provided: true, receivedDate: '2026-02-10', expiryDate: '2026-04-05' }, // منتهية الصلاحية للتجربة!
      { id: 'doc-3', name: 'شهادة الفحص الطبي الصادرة من دائرة الصحة', provided: true, receivedDate: '2026-02-10', expiryDate: '2026-06-12' }, // تنتهي قريباً للتجربة!
      { id: 'doc-4', name: 'صور شخصية بخلفية بيضاء (عدد 6)', provided: true, receivedDate: '2026-02-10' },
      { id: 'doc-5', name: 'كفالة ضامنة قانونية', provided: false }
    ],
    notes: 'تحتاج جلب وثيقة الدراسة الإعدادية الأصلية مصدقة ومجددة للبطاقة الوطنية حيث أن مدة الصلاحية للبطاقة منتهية.',
    sentToCollege: true,
    sentToCollegeDate: '2026-02-10T09:15:00Z'
  },
  {
    id: 'STU-2026-0003',
    name: 'حسن صلاح علاء الخفاجي',
    email: 'hassan.salah.law@gmail.com',
    phone: '07501987654',
    nationalId: '200084712948',
    gender: 'male',
    dob: '2000-09-05',
    departmentId: 'pharmacy',
    enrollmentYear: 2026,
    shift: 'evening',
    stage: 2,
    status: 'active',
    registrationDate: '2025-09-10',
    academicAdvisor: 'أ.م. وفاء كاظم الجنابي',
    totalTuitionFee: 8200000,
    documents: [
      { id: 'doc-1', name: 'وثيقة الدراسة الإعدادية الأصلية ومصدقة', provided: true, receivedDate: '2025-09-10' },
      { id: 'doc-2', name: 'البطاقة الوطنية الموحدة (أو الجنسية)', provided: true, receivedDate: '2025-09-10', expiryDate: '2031-10-12' },
      { id: 'doc-3', name: 'شهادة الفحص الطبي الصادرة من دائرة الصحة', provided: true, receivedDate: '2025-09-12', expiryDate: '2026-03-12' }, // مُنتهية!
      { id: 'doc-4', name: 'صور شخصية بخلفية بيضاء (عدد 6)', provided: true, receivedDate: '2025-09-10' },
      { id: 'doc-5', name: 'كفالة ضامنة قانونية', provided: true, receivedDate: '2025-09-15' }
    ],
    notes: 'تم ترحيله للمرحلة الثانية مع وجود فحص طبي منتهي الصلاحية يحتاج إلى تحديث الدورة السنوية.',
    sentToCollege: true,
    sentToCollegeDate: '2025-09-10T14:45:00Z'
  },
  {
    id: 'STU-2026-0004',
    name: 'زينب علي حسين العامري',
    email: 'zainab.ali98@outlook.com',
    phone: '07718223399',
    nationalId: '199898734612',
    gender: 'female',
    dob: '1998-01-30',
    departmentId: 'law',
    enrollmentYear: 2026,
    shift: 'evening',
    stage: 1,
    status: 'active',
    registrationDate: '2026-02-18',
    academicAdvisor: 'م. يوسف عباس الفتلاوي',
    totalTuitionFee: 3400000,
    documents: [
      { id: 'doc-1', name: 'وثيقة الدراسة الإعدادية الأصلية ومصدقة', provided: true, receivedDate: '2026-02-18' },
      { id: 'doc-2', name: 'البطاقة الوطنية الموحدة (أو الجنسية)', provided: true, receivedDate: '2026-02-18', expiryDate: '2028-11-20' },
      { id: 'doc-3', name: 'شهادة الفحص الطبي الصادرة من دائرة الصحة', provided: true, receivedDate: '2026-02-20', expiryDate: '2026-08-20' },
      { id: 'doc-4', name: 'صور شخصية بخلفية بيضاء (عدد 6)', provided: true, receivedDate: '2026-02-18' },
      { id: 'doc-5', name: 'كفالة ضامنة قانونية', provided: true, receivedDate: '2026-02-22' }
    ],
    sentToCollege: true,
    sentToCollegeDate: '2026-02-18T10:05:00Z'
  },
  {
    id: 'STU-2026-0005',
    name: 'مصطفى قاسم رضا التميمي',
    email: 'mustafa.kassem@gmail.com',
    phone: '07804455662',
    nationalId: '200213123891',
    gender: 'male',
    dob: '2002-06-15',
    departmentId: 'admin-econ',
    enrollmentYear: 2026,
    shift: 'morning',
    stage: 1,
    status: 'suspended',
    registrationDate: '2026-01-20',
    academicAdvisor: 'د. لؤي خلف الجبوري',
    totalTuitionFee: 1900000,
    documents: [
      { id: 'doc-1', name: 'وثيقة الدراسة الإعدادية الأصلية ومصدقة', provided: true, receivedDate: '2026-01-20' },
      { id: 'doc-2', name: 'البطاقة الوطنية الموحدة (أو الجنسية)', provided: true, receivedDate: '2026-01-20', expiryDate: '2030-01-20' },
      { id: 'doc-3', name: 'شهادة الفحص الطبي الصادرة من دائرة الصحة', provided: false },
      { id: 'doc-4', name: 'صور شخصية بخلفية بيضاء (عدد 6)', provided: true, receivedDate: '2026-01-20' },
      { id: 'doc-5', name: 'كفالة ضامنة قانونية', provided: true, receivedDate: '2026-01-24' }
    ],
    notes: 'تم تعليق القبول مؤقتاً لطلب تأجيل رسمي من الطالب للدورة الأمنية الطارئة ولحين تسليم الفحص الطبي.',
    sentToCollege: true,
    sentToCollegeDate: '2026-01-20T13:30:00Z'
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'PAY-100293',
    studentId: 'STU-2026-0001',
    studentName: 'أحمد كريم عبد الحسن السهلاني',
    departmentName: 'كلية الهندسة',
    amount: 1500000,
    date: '2026-01-16',
    receiptNumber: 'REC-2026-9081',
    category: 'tuition',
    method: 'cash',
    loggedBy: 'أركان ضياء البياتي - قسم الحسابات',
    notes: 'القسط الأول لتسجيل الطالب - المتبقي مليوني دينار عراقي.'
  },
  {
    id: 'PAY-100294',
    studentId: 'STU-2026-0001',
    studentName: 'أحمد كريم عبد الحسن السهلاني',
    departmentName: 'كلية الهندسة',
    amount: 250000,
    date: '2026-01-15',
    receiptNumber: 'REC-2026-9050',
    category: 'registration_fee',
    method: 'e-wallet',
    loggedBy: 'نور الهدى حميد - مسجل الكلية',
    notes: 'أجر التسجيل الأولي الإداري'
  },
  {
    id: 'PAY-100295',
    studentId: 'STU-2026-0003',
    studentName: 'حسن صلاح علاء الخفاجي',
    departmentName: 'كلية الصيدلة',
    amount: 4100000,
    date: '2025-09-12',
    receiptNumber: 'REC-2025-4100',
    category: 'tuition',
    method: 'bank_transfer',
    loggedBy: 'أركان ضياء البياتي - قسم الحسابات',
    notes: 'دفعة 50% من القسط السنوي الكلي المحتسب بالمسائي'
  },
  {
    id: 'PAY-100296',
    studentId: 'STU-2026-0004',
    studentName: 'زينب علي حسين العامري',
    departmentName: 'كلية القانون',
    amount: 1000000,
    date: '2026-02-18',
    receiptNumber: 'REC-2026-9345',
    category: 'tuition',
    method: 'e-wallet',
    loggedBy: 'ميثم كاظم حسن'
  }
];

export const mockLetters: OfficialLetter[] = [
  {
    id: 'LET-2026-0001',
    letterNumber: 'وزاري / ت ق / 2394',
    title: 'تسهيل قبول الطلاب الأوائل بالمنحة المجانية الخاصة بكليات الطب والأسنان والصيدلة',
    source: 'وزارة التعليم العالي والبحث العلمي - دائرة الدراسات والتخطيط',
    destination: 'رئاسة الجامعة الأهلية / أمانة مجلس الجامعة',
    dateIssued: '2026-01-10',
    dateReceived: '2026-01-12',
    expiryDate: '2026-12-31', // صالحة للتجربة
    category: 'ministry_directive',
    summary: 'إطلاق دليل وقواعد المنحة المجانية والمقاعد الحرة للعام الدراسي ٢٠٢٦ مع الإعفاء الكامل من أجور السكن السنوية للمحافظات.',
    attachedFileName: 'MHE_Scholarship_Directive_2026.pdf',
    archivedBy: 'سمير عبيد الصرخي - رئيس الأرشيف المركزي',
    status: 'active'
  },
  {
    id: 'LET-2026-0002',
    letterNumber: 'ر ج / إد / 112',
    title: 'الرمز السري المعتمد والكتب الإدارية لإغلاق بوابة التسجيل للمرحلة الأولى',
    source: 'رئاسة الجامعة - مكتب رئيس الجامعة الأكاديمي',
    destination: 'مركز تسجيل الطلبة وشؤون التسجيل المركزي',
    dateIssued: '2026-05-15',
    dateReceived: '2026-05-16',
    expiryDate: '2026-06-05', // تنتهي قريبا جداً!
    category: 'administrative_order',
    summary: 'تحديد يوم ٥ حزيران ٢٠٢٦ كآخر موعد تمديدي لتسجيل الطلبة المتخلفين عن الترحيل الإلكتروني وبخلافه يلغى قبولهم المؤقت.',
    attachedFileName: 'Admin_Order_Registration_Lock_2026.pdf',
    archivedBy: 'سرى جاسم حمودي',
    status: 'expiring_soon'
  },
  {
    id: 'LET-2026-0003',
    letterNumber: 'أ م / ت ع / 54',
    title: 'طلب الفحص الطبي للمقبولين الجدد وخطة الصلاحية الصحية الفورية',
    source: 'وزارة الصحة - دائرة الوقاية ومكافحة الأوبئة والاستدامة',
    destination: 'رئاسة الجامعة الأهلية / مركز الرعاية ومركز التسجيل',
    dateIssued: '2026-02-01',
    dateReceived: '2026-02-02',
    expiryDate: '2026-05-01', // منتهية الصلاحية للتجربة!
    category: 'ministry_directive',
    summary: 'وجوب إخضاع كافة طلبة المجموعة الطبية لفحص سلامة اللقاح والقدرات البدنية الفورية خلال ثلاثة أشهر من تاريخ المباشرة واستبعاد المخالفين.',
    attachedFileName: 'Health_Ministry_Checks_Expired.pdf',
    archivedBy: 'سمير عبيد الصرخي - رئيس الأرشيف المركزي',
    status: 'expired'
  },
  {
    id: 'LET-2026-0004',
    letterNumber: 'ع هـ / 879',
    title: 'أمر عمادي بإجراء الامتحانات البديلة التقويمية ومستند الاستمرارية الدراسية',
    source: 'عمادة كلية الهندسة التقنية',
    destination: 'قسم هندسة البرمجيات وقسم الحسابات والتسجيل',
    dateIssued: '2026-05-20',
    dateReceived: '2026-05-20',
    expiryDate: '2026-09-01',
    category: 'internal_circular',
    summary: 'تحديد آليات ومواعيد الدورة التكميلية لطلبة البرمجيات المستوفين للضوابط وتنسيق مع مسؤولي النظم المباشرة.',
    attachedFileName: 'Computer_Eng_Circular_Exams.pdf',
    archivedBy: 'زينب كمال العلي - سكرتيرة العميد',
    status: 'active'
  }
];

export const mockMessages: InternalMessage[] = [
  {
    id: 'msg-1',
    sender: 'presidency',
    senderName: 'رئاسة الجامعة - مكتب رئيس الجامعة',
    recipients: ['registration', 'finance'],
    subject: 'هام وعاجل: تدقيق قوائم الطلبة الحاصلين على تخفيض بنسبة ٥٠٪ والمستندات',
    content: 'يرجى من الإخوة في مركز تسجيل الطلبة بالتنسيق العاجل مع شعبة الحسابات لتهيئة القوائم الكاملة المعتمدة بأسماء الطلبة المشمولين بتخفيض عوائل الشهداء والمنح الخاصة لمراجعتها والمطابقة مع الكتب الوزارية المرفقة قبل نهاية الأسبوع الحالي.',
    timestamp: '2026-05-25T09:30:00Z',
    priority: 'high',
    readBy: ['registration'],
    relatedLetterId: 'LET-2026-0001'
  },
  {
    id: 'msg-2',
    sender: 'registration',
    senderName: 'عميد مركز تسجيل الطلبة وشؤون التسجيل',
    recipients: ['presidency'],
    subject: 'موقف التسجيل المبدئي وحالات عدم اكتمال الأوراق الرسمية الممهلة',
    content: 'إشارة إلى توجيهاتكم الكريمة، باشر كوادرنا بتدقيق القيود الممهلة حتى ٥ حزيران، ويتبين وجود ٢٨ طالباً لم يودعوا بعد وثيقة الشهادة الإعدادية السنوية الأصلية مصدقة، جاري إصدار إشعار تذكير لهم عبر البوابة مع ربط القرار المرفق للإيفاء به.',
    timestamp: '2026-05-26T12:15:00Z',
    priority: 'normal',
    readBy: ['presidency'],
    relatedLetterId: 'LET-2026-0002'
  },
  {
    id: 'msg-3',
    sender: 'finance',
    senderName: 'شعبة الحسابات والتدقيق المالي',
    recipients: ['registration', 'engineering', 'dentistry', 'pharmacy', 'law', 'business'],
    subject: 'تعميم: التبليغ برفع نسب السداد للأقساط الدراسية قبل بدء الامتحانات النهائية',
    content: 'الزملاء الأعزاء عمداء ومدراء الكليات المحترمين، يرجى التكرم بالتعميم لطلبة المراحل كافة من خلال مرشديهم الأكاديميين بضرورة مراجعة الحسابات لتسوية أي ذمم مالية أو متأخرات وتثبيت الوصولات لتلافي حجب الأرقام الامتحانية الإلكترونية.',
    timestamp: '2026-05-27T08:00:00Z',
    priority: 'high',
    readBy: ['engineering', 'law']
  }
];

// دالة لمعالجة أو تصنيف صلاحية الكتاب الرسمي نسبة للتاريخ الحالي
export function getLetterExpiryStatus(expiryDate?: string): 'active' | 'expired' | 'expiring_soon' {
  if (!expiryDate) return 'active';
  const curr = new Date(SYSTEM_CURRENT_DATE);
  const exp = new Date(expiryDate);
  const diffTime = exp.getTime() - curr.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 15) return 'expiring_soon'; // التحذير في غضون 15 يوم
  return 'active';
}

// دالة لحساب المبالغ المدفوعة والمتبقية لطالب معين
export function calculateStudentFees(student: Student, payments: Payment[]): { total: number; paid: number; remaining: number } {
  const studentPayments = payments.filter(p => p.studentId === student.id && (p.category === 'tuition' || p.category === 'registration_fee'));
  const paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
  const total = student.totalTuitionFee;
  return {
    total,
    paid,
    remaining: Math.max(0, total - paid)
  };
}
