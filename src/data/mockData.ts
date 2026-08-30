/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department, Student, Payment, OfficialLetter, InternalMessage } from '../types';

// تاريخ تشغيل النظام الحالي المعتمد
export const SYSTEM_CURRENT_DATE = '2026-05-27';

// العناوين الرقمية الفردية لحاسبات الكليات المعتمدة بمركز الجامعة
export const COLLEGE_IPS: { [key: string]: string } = {
  presidency: '192.168.10.1',
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
    id: 'presidency',
    name: 'رئاسة الجامعة (مكتب رئيس الجامعة)',
    college: 'جامعة الكوت الجامعة',
    annualFeeMorning: 0,
    annualFeeEvening: 0,
    durationYears: 0,
    headOfDepartment: 'أ.د. طالب الموسوي (رئيس مجلس الإدارة)',
    availableSeats: 0,
    totalEnrolled: 0
  },
  {
    id: 'dentistry',
    name: 'كلية طب الأسنان',
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
    annualFeeMorning: 3000500,
    annualFeeEvening: 3600000,
    durationYears: 4,
    headOfDepartment: 'د. سحر عبد الحميد الموسوي',
    availableSeats: 120,
    totalEnrolled: 98
  },
  {
    id: 'sports-edu',
    name: 'كلية التربية البدنية وعلوم الرياضة',
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
    annualFeeMorning: 2800000,
    annualFeeEvening: 3400000,
    durationYears: 4,
    headOfDepartment: 'أ.د. منذر كامل الهلالي',
    availableSeats: 200,
    totalEnrolled: 185
  },
  {
    id: 'sciences',
    name: 'كلية العلوم',
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
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
    college: 'جامعة الكوت الجامعة',
    annualFeeMorning: 2200000,
    annualFeeEvening: 2700000,
    durationYears: 4,
    headOfDepartment: 'أ. م. لمياء عبد الوهاب الطائي',
    availableSeats: 100,
    totalEnrolled: 78
  }
];

// تم تفريغ بيانات الطلبة التجريبية - النظام جاهز للبيانات الحقيقية
export const mockStudents: Student[] = [];

// تم تفريغ الدفعات التجريبية - النظام جاهز للبيانات الحقيقية
export const mockPayments: Payment[] = [];

// أرشيف الكتب الرسمية - فارغ جاهز للبيانات الحقيقية
export const mockLetters: OfficialLetter[] = [];

// الرسائل الداخلية - فارغة جاهزة للبيانات الحقيقية
export const mockMessages: InternalMessage[] = [];

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
