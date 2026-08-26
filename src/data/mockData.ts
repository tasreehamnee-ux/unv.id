/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department, Student, Payment, OfficialLetter, InternalMessage } from '../types';

// ØªØ§Ø±ÙŠØ® ØªØ´ØºÙŠÙ„ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø­Ø§Ù„ÙŠ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯
export const SYSTEM_CURRENT_DATE = '2026-05-27';

// Ø§Ù„Ø¹Ù†Ø§ÙˆÙŠÙ† Ø§Ù„Ø±Ù‚Ù…ÙŠØ© Ø§Ù„ÙØ±Ø¯ÙŠØ© ×œ×—Ø§Ø³Ø¨Ø§Øª Ø§Ù„ÙƒÙ„ÙŠØ§Øª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø© Ø¨Ù…Ø±ÙƒØ² Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø£Ù‡Ù„ÙŠØ©
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
    name: 'Ø±Ø¦Ø§Ø³Ø© Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© (Ù…ÙƒØªØ¨ Ø±Ø¦ÙŠØ³ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø©)',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„ÙƒÙˆØª Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 0,
    annualFeeEvening: 0,
    durationYears: 0,
    headOfDepartment: 'Ø£.Ø¯. Ø·Ø§Ù„Ø¨ Ø§Ù„Ù…ÙˆØ³ÙˆÙŠ (Ø±Ø¦ÙŠØ³ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø©)',
    availableSeats: 0,
    totalEnrolled: 0
  },
  {
    id: 'dentistry',
    name: 'ÙƒÙ„ÙŠØ© Ø·Ø¨ Ø§Ù„Ø£Ø³Ù†Ø§Ù†',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 8000000,
    annualFeeEvening: 9500000,
    durationYears: 5,
    headOfDepartment: 'Ø£.Ø¯. Ø¹Ø§Ø¯Ù„ Ù‚Ø§Ø³Ù… Ø§Ù„Ø´Ù…Ø±ÙŠ',
    availableSeats: 150,
    totalEnrolled: 138
  },
  {
    id: 'pharmacy',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„ØµÙŠØ¯Ù„Ø©',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 7000000,
    annualFeeEvening: 8200000,
    durationYears: 5,
    headOfDepartment: 'Ø£.Ù….Ø¯. Ù„Ù…Ù‰ Ù‡Ø§Ø´Ù… Ø§Ù„ÙŠØ§Ø³Ø±ÙŠ',
    availableSeats: 120,
    totalEnrolled: 112
  },
  {
    id: 'health-med-tech',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„ØªÙ‚Ù†ÙŠØ§Øª Ø§Ù„ØµØ­ÙŠØ© ÙˆØ§Ù„Ø·Ø¨ÙŠØ©',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 4000000,
    annualFeeEvening: 4800000,
    durationYears: 4,
    headOfDepartment: 'Ø£. Ø¯. Ø¹Ø¨Ø¯ Ø§Ù„Ø­Ø³Ù† Ù…Ù‡Ø¯ÙŠ Ø§Ù„Ø®ÙØ§Ø¬ÙŠ',
    availableSeats: 180,
    totalEnrolled: 145
  },
  {
    id: 'engineering',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„Ù‡Ù†Ø¯Ø³Ø©',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 3800000,
    annualFeeEvening: 4500000,
    durationYears: 4,
    headOfDepartment: 'Ø¯. ÙˆØ³Ø§Ù… Ø¹Ø¨Ø¯ Ø§Ù„Ù„Ø·ÙŠÙ Ø§Ù„Ø®ÙØ§Ø¬ÙŠ',
    availableSeats: 100,
    totalEnrolled: 82
  },
  {
    id: 'nursing',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„ØªÙ…Ø±ÙŠØ¶',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 3000500,
    annualFeeEvening: 3600000,
    durationYears: 4,
    headOfDepartment: 'Ø¯. Ø³Ø­Ø± Ø¹Ø¨Ø¯ Ø§Ù„Ø­Ù…ÙŠØ¯ Ø§Ù„Ù…ÙˆØ³ÙˆÙŠ',
    availableSeats: 120,
    totalEnrolled: 98
  },
  {
    id: 'sports-edu',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„ØªØ±Ø¨ÙŠØ© Ø§Ù„Ø¨Ø¯Ù†ÙŠØ©',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 1800000,
    annualFeeEvening: 2200000,
    durationYears: 4,
    headOfDepartment: 'Ø£. Ù…. Ø¯. Ù‚Ø§Ø³Ù… Ù…Ø­Ù…Ø¯ Ø§Ù„Ø³Ù‡ÙŠÙ„',
    availableSeats: 80,
    totalEnrolled: 64
  },
  {
    id: 'law',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 2800000,
    annualFeeEvening: 3400000,
    durationYears: 4,
    headOfDepartment: 'Ø£.Ø¯. Ù…Ù†Ø°Ø± ÙƒØ§Ù…Ù„ Ø§Ù„Ø¹Ø¨ÙŠØ¯ÙŠ',
    availableSeats: 200,
    totalEnrolled: 185
  },
  {
    id: 'sciences',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„Ø¹Ù„ÙˆÙ…',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 2500000,
    annualFeeEvening: 3000000,
    durationYears: 4,
    headOfDepartment: 'Ø£. Ø¯. Ø³Ø§Ø¬Ø¯ Ø±Ø²Ø§Ù‚ Ø§Ù„Ø±ÙØ§Ø¹ÙŠ',
    availableSeats: 150,
    totalEnrolled: 110
  },
  {
    id: 'eng-tech',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„ØªÙ‚Ù†ÙŠØ© Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 3500000,
    annualFeeEvening: 4200000,
    durationYears: 4,
    headOfDepartment: 'Ø¯. Ø¨Ø§Ø³Ù… ÙƒØ±ÙŠÙ… Ø§Ù„Ø¨Ù‡Ø§Ø¯Ù„ÙŠ',
    availableSeats: 100,
    totalEnrolled: 75
  },
  {
    id: 'admin-econ',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© ÙˆØ§Ù„Ø§Ù‚ØªØµØ§Ø¯',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 1900000,
    annualFeeEvening: 2300000,
    durationYears: 4,
    headOfDepartment: 'Ø¯. Ù†Ø§Ø¯ÙŠØ© Ø¹Ø¨Ø¯ Ø§Ù„Ø±Ø­Ù…Ù† Ø§Ù„Ø­Ø¯ÙŠØ«ÙŠ',
    availableSeats: 150,
    totalEnrolled: 142
  },
  {
    id: 'education',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„ØªØ±Ø¨ÙŠØ©',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 1600000,
    annualFeeEvening: 2000000,
    durationYears: 4,
    headOfDepartment: 'Ø¯. Ø¹Ù‚ÙŠÙ„ Ø­Ø³ÙŠÙ† Ø§Ù„Ø³Ù„Ø§Ù…ÙŠ',
    availableSeats: 150,
    totalEnrolled: 112
  },
  {
    id: 'applied-arts',
    name: 'ÙƒÙ„ÙŠØ© Ø§Ù„ÙÙ†ÙˆÙ† Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ÙŠØ©',
    college: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„Ø£Ù‡Ù„ÙŠØ©',
    annualFeeMorning: 2200000,
    annualFeeEvening: 2700000,
    durationYears: 4,
    headOfDepartment: 'Ø£. Ù…. Ù„Ù…ÙŠØ§Ø¡ Ø¹Ø¨Ø¯ Ø§Ù„ÙˆÙ‡Ø§Ø¨ Ø§Ù„Ø·Ø§Ø¦ÙŠ',
    availableSeats: 100,
    totalEnrolled: 78
  }
];

// ØªÙ… ØªÙØ±ÙŠØº Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø·Ù„Ø¨Ø© Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ© - Ø§Ù„Ù†Ø¸Ø§Ù… Ø¬Ø§Ù‡Ø² Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
export const mockStudents: Student[] = [];

// ØªÙ… ØªÙØ±ÙŠØº Ø§Ù„Ø¯ÙØ¹Ø§Øª Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ© - Ø§Ù„Ù†Ø¸Ø§Ù… Ø¬Ø§Ù‡Ø² Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
export const mockPayments: Payment[] = [];

// Ø£Ø±Ø´ÙŠÙ Ø§Ù„ÙƒØªØ¨ Ø§Ù„Ø±Ø³Ù…ÙŠØ© - ÙØ§Ø±Øº Ø¬Ø§Ù‡Ø² Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
export const mockLetters: OfficialLetter[] = [];

// Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© - ÙØ§Ø±ØºØ© Ø¬Ø§Ù‡Ø²Ø© Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØ©
export const mockMessages: InternalMessage[] = [];

// Ø¯Ø§Ù„Ø© Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø£Ùˆ ØªØµÙ†ÙŠÙ ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„ÙƒØªØ§Ø¨ Ø§Ù„Ø±Ø³Ù…ÙŠ Ù†Ø³Ø¨Ø© Ù„Ù„ØªØ§Ø±ÙŠØ® Ø§Ù„Ø­Ø§Ù„ÙŠ
export function getLetterExpiryStatus(expiryDate?: string): 'active' | 'expired' | 'expiring_soon' {
  if (!expiryDate) return 'active';
  const curr = new Date(SYSTEM_CURRENT_DATE);
  const exp = new Date(expiryDate);
  const diffTime = exp.getTime() - curr.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 15) return 'expiring_soon'; // Ø§Ù„ØªØ­Ø°ÙŠØ± ÙÙŠ ØºØ¶ÙˆÙ† 15 ÙŠÙˆÙ…
  return 'active';
}

// Ø¯Ø§Ù„Ø© Ù„Ø­Ø³Ø§Ø¨ Ø§Ù„Ù…Ø¨Ø§Ù„Øº Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø© ÙˆØ§Ù„Ù…ØªØ¨Ù‚ÙŠØ© Ù„Ø·Ø§Ù„Ø¨ Ù…Ø¹ÙŠÙ†
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

