/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  Building, 
  Users, 
  CreditCard, 
  FolderLock, 
  MessageSquare, 
  Terminal, 
  LayoutDashboard,
  User,
  GraduationCap,
  Clock,
  Menu,
  X,
  RotateCcw,
  ShieldAlert,
  PhoneCall,
  Mail,
  Plus,
  Trash2,
  Send,
  CheckCircle,
  UserPlus,
  Bell,
  Volume2,
  Database,
  Globe,
  Activity,
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// استيراد الأنواع والبيانات الافتراضية والتابع المساعد
import { Student, Payment, OfficialLetter, InternalMessage, Department, AdminDepartment, AcademicSubDepartment } from './types';
import { 
  mockDepartments, 
  mockStudents, 
  mockPayments, 
  mockLetters, 
  mockMessages, 
  SYSTEM_CURRENT_DATE,
  COLLEGE_IPS
} from './data/mockData';

// استيراد المكونات الفرعية المصممة
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import StudentPortal from './components/StudentPortal';
import FinancePortal from './components/FinancePortal';
import LettersArchive from './components/LettersArchive';
import LabsPortal from './components/LabsPortal';
import InternalComms from './components/InternalComms';
import PythonCodeViewer from './components/PythonCodeViewer';
import AuditLog from './components/AuditLog';
import { KutLogoSvg, OfficialKutHeader, KutHeaderConfig } from './components/KutLogo';

export default function App() {
  
  // 1.1 تعريف أدوار العمل ورموزها ومحدودياتها الكلية بالترميز العربي الوطني بصيغة حالة ديناميكية قابلة للتعديل والتحكم بالحذف والإضافة
  const [rolesList, setRolesList] = useState<{ role: string; title: string; categoryName: string; defaultCode: string; departmentId?: string; isCustom?: boolean }[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_ROLES_LIST');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { role: 'admin', title: 'مدير النظام الأول', categoryName: 'الإدارة الأمنية العامة', defaultCode: '9999' },
      { role: 'presidency', title: 'رئاسة الجامعة (مكتب رئيس الجامعة)', categoryName: 'الرئاسة والعمادة العليا', defaultCode: '7777' },
      { role: 'registration_director', title: 'مدير التسجيل والقبول', categoryName: 'العمادة والتسجيل العام', defaultCode: '1111' },
      { role: 'finance_director', title: 'مدير المالية والحسابات', categoryName: 'القسم الحسابي والمالي العام', defaultCode: '2222' },
      { role: 'labs_director', title: 'إدارة المختبرات المركزية', categoryName: 'المختبرات والتدريب', defaultCode: '3333' },
      { role: 'head_dentistry', title: 'عميد كلية طب الأسنان (أ.د. عادل قاسم الشمري)', categoryName: 'عميد كلية', defaultCode: '4401', departmentId: 'dentistry' },
      { role: 'head_pharmacy', title: 'عميد كلية الصيدلة (أ.م.د. لمى هاشم الياسري)', categoryName: 'عميد كلية', defaultCode: '4402', departmentId: 'pharmacy' },
      { role: 'head_health-med-tech', title: 'عميد كلية التقنيات الصحية والطبية (أ. د. عبد الحسن مهدي الخفاجي)', categoryName: 'عميد كلية', defaultCode: '4403', departmentId: 'health-med-tech' },
      { role: 'head_engineering', title: 'عميد كلية الهندسة (د. وسام عبد اللطيف الخفاجي)', categoryName: 'عميد كلية', defaultCode: '4404', departmentId: 'engineering' },
      { role: 'head_nursing', title: 'عميد كلية التمريض (د. سحر عبد الحميد الموسوي)', categoryName: 'عميد كلية', defaultCode: '4405', departmentId: 'nursing' },
      { role: 'head_sports-edu', title: 'عميد كلية التربية البدنية والعلوم الرياضية (أ. م. د. قاسم محمد السهيل)', categoryName: 'عميد كلية', defaultCode: '4406', departmentId: 'sports-edu' },
      { role: 'head_law', title: 'عميد كلية القانون (أ. د. منذر كامل الهلالي)', categoryName: 'عميد كلية', defaultCode: '4407', departmentId: 'law' },
      { role: 'head_sciences', title: 'عميد كلية العلوم الصرفة (أ. د. ساجد رزاق الرفاعي)', categoryName: 'عميد كلية', defaultCode: '4408', departmentId: 'sciences' },
      { role: 'head_eng-tech', title: 'عميد كلية التقنية الهندسية (د. باسم كريم البهادلي)', categoryName: 'عميد كلية', defaultCode: '4409', departmentId: 'eng-tech' },
      { role: 'head_admin-econ', title: 'عميد كلية الإدارة والاقتصاد (د. نادية عبد الرحمن)', categoryName: 'عميد كلية', defaultCode: '4410', departmentId: 'admin-econ' },
      { role: 'head_education', title: 'عميد كلية التربية والآداب (د. عقيل حسين السلامي)', categoryName: 'عميد كلية', defaultCode: '4411', departmentId: 'education' },
      { role: 'head_applied-arts', title: 'عميد كلية الفنون التطبيقية (أ. م. لمياء عبد الوهاب الطائي)', categoryName: 'عميد كلية', defaultCode: '4412', departmentId: 'applied-arts' }
    ];
  });

  const [roleCodes, setRoleCodes] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_ROLE_CODES');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.labs_director) parsed.labs_director = '3333';
          return parsed;
        }
      } catch (e) {}
    }
    return {
      admin: '9999',
      presidency: '7777',
      registration_director: '1111',
      finance_director: '2222',
      labs_director: '3333',
      'head_dentistry': '4401',
      'head_pharmacy': '4402',
      'head_health-med-tech': '4403',
      'head_engineering': '4404',
      'head_nursing': '4405',
      'head_sports-edu': '4406',
      'head_law': '4407',
      'head_sciences': '4408',
      'head_eng-tech': '4409',
      'head_admin-econ': '4410',
      'head_education': '4411',
      'head_applied-arts': '4412'
    };
  });

  // دوال الحفظ والمزامنة السحابية والمحلية الموحدة
  const syncRoleCodes = (codes: { [key: string]: string }) => {
    setRoleCodes(codes);
    try {
      localStorage.setItem('AL_AHLIYA_ROLE_CODES', JSON.stringify(codes));
      setDoc(doc(db, "settings", "roleCodes"), codes).catch((err) => {
        console.warn("roleCodes cloud sync notice:", err);
      });
    } catch (e) {
      console.warn("syncRoleCodes local write notice:", e);
    }
  };

  const syncRolesList = (roles: { role: string; title: string; categoryName: string; defaultCode: string; departmentId?: string; isCustom?: boolean }[]) => {
    setRolesList(roles);
    try {
      localStorage.setItem('AL_AHLIYA_ROLES_LIST', JSON.stringify(roles));
      setDoc(doc(db, "settings", "rolesList"), { list: roles }).catch((err) => {
        console.warn("rolesList cloud sync notice:", err);
      });
    } catch (e) {
      console.warn("syncRolesList local write notice:", e);
    }
  };

  // مزامنة الكوادر ديناميكيا مع Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "rolesList"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list && Array.isArray(data.list) && data.list.length > 0) {
          let list = data.list;
          if (!list.some((r: any) => r.role === 'labs_director')) {
            list = [...list, { role: 'labs_director', title: 'إدارة المختبرات المركزية', categoryName: 'المختبرات والتدريب', defaultCode: '3333' }];
          }
          setRolesList(list);
          localStorage.setItem('AL_AHLIYA_ROLES_LIST', JSON.stringify(list));
        }
      }
    }, (err) => console.warn("rolesList sync notice:", err));
    return () => unsub();
  }, []);

  // مزامنة الرموز السرية مع Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "roleCodes"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && typeof data === 'object') {
          setRoleCodes(prev => {
            const merged = { ...prev, ...data };
            if (!merged.labs_director) {
              merged.labs_director = prev.labs_director || '3333';
            }
            localStorage.setItem('AL_AHLIYA_ROLE_CODES', JSON.stringify(merged));
            return merged;
          });
        }
      }
    }, (err) => console.warn("roleCodes sync notice:", err));
    return () => unsub();
  }, []);

  // مزامنة الكوادر للتأكد من وجود دور المختبرات المركزية ورمزه السري
  useEffect(() => {
    const hasLabs = rolesList.some(r => r.role === 'labs_director');
    if (!hasLabs) {
      const updated = [...rolesList, { role: 'labs_director', title: 'إدارة المختبرات المركزية', categoryName: 'المختبرات والتدريب', defaultCode: '3333' }];
      syncRolesList(updated);
    }
    if (roleCodes['labs_director'] === undefined) {
      const updatedCodes = { ...roleCodes, labs_director: '3333' };
      syncRoleCodes(updatedCodes);
    }
  }, [rolesList]);

  const [currentRole, setCurrentRole] = useState<string | null>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_CURRENT_ROLE');
    return saved !== null ? saved : null; // الدخول بواسطة رمز الدخول فقط (لا يوجد دخول تلقائي كمدير)
  });

  const currentRoleConfig = rolesList.find(cfg => cfg.role === currentRole);

  const [enteredCode, setEnteredCode] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [deptIdToDelete, setDeptIdToDelete] = useState<string | null>(null);

  // 1. تعريف حالات المكون والتحميل من localStorage لتأمين الحفظ الدائم (Bulletproof Persistence)
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('AL_AHLIYA_DEPARTMENTS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return mockDepartments;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('AL_AHLIYA_STUDENTS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return mockStudents;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem('AL_AHLIYA_PAYMENTS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return mockPayments;
  });

  const [letters, setLetters] = useState<OfficialLetter[]>([]);

  // مزامنة حية للكتب الرسمية من Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "letters"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list) {
          setLetters(data.list);
        }
      } else {
        setLetters([]);
      }
    });
    return () => unsub();
  }, []);

  const [messages, setMessages] = useState<InternalMessage[]>([]);

  // مزامنة رسائل التواصل الداخلي مع Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "messages"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list) {
          setMessages(data.list);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    });
    return () => unsub();
  }, []);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_SELECTED_STU');
    return saved ? saved : (mockStudents[0]?.id || null);
  });

  const [activeTab, setActiveTab] = useState<string>('students'); // Will be set on login
  
  // Safe active tab getter
  const getSafeActiveTab = () => {
    if (!currentRole) return '';
    if (allowedTabs.includes(activeTab)) return activeTab;
    return allowedTabs[0] || 'students';
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const prevLatestMsgIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (messages.length > 0) {
      const latestMsg = messages[0];
      if (prevLatestMsgIdRef.current && prevLatestMsgIdRef.current !== latestMsg.id) {
        if (latestMsg.sender !== currentRole && currentRole) {
          const isRecipient = latestMsg.recipients.includes(currentRole) || 
                              latestMsg.recipients.includes('all_departments');
          if (isRecipient) {
            const senderObj = rolesList.find(r => r.role === latestMsg.sender);
            const senderName = senderObj ? senderObj.title : latestMsg.sender;
            // Play a simple beep using Web Audio API if possible
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              osc.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.2);
            } catch(e) {}
            
            // Show alert after a tiny delay so audio can play
            setTimeout(() => {
              alert(`🔔 تنبيه نظام المراسلة:\nيوجد لديك رسالة جديدة من: ${senderName}\nالموضوع: ${latestMsg.subject}`);
            }, 100);
          }
        }
      }
      prevLatestMsgIdRef.current = latestMsg.id;
    }
  }, [messages, currentRole, rolesList]);


  // حالات خاصة بإضافة موظف جديد
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffTitle, setNewStaffTitle] = useState('');
  const [newStaffCategory, setNewStaffCategory] = useState('عميد كلية جديد');
  const [newStaffCode, setNewStaffCode] = useState('');
  const [newStaffDept, setNewStaffDept] = useState('');
  
  // حالات خاصة بتفويض وإدارة عمداء الكليات المباشرة
  const [formDeanName, setFormDeanName] = useState('');
  const [formDeanDept, setFormDeanDept] = useState('');
  const [formDeanCode, setFormDeanCode] = useState('');

  // حالات التحكم الكامل والديناميكي بحل وحذف وتعديل محطات الكليات وحاسبات الـ IP المخصصة
  const [collegeIps, setCollegeIps] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_COLLEGE_IPS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return COLLEGE_IPS;
  });

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_COLLEGE_IPS', JSON.stringify(collegeIps));
  }, [collegeIps]);

  // سجل العمليات والمراقبة الأمنية (Audit Logs state and persistence)
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_AUDIT_LOGS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'log-1',
        action: 'system_init',
        title: 'تفعيل المراقبة الأمنية',
        details: 'تم تفعيل بروتوكول الرقابة والتحقق من جدار الحماية للجامعة والخدمة الرقمية.',
        user: 'مدير النظام الأول',
        timestamp: SYSTEM_CURRENT_DATE + ' 08:30:00',
        ip: '192.168.1.1'
      },
      {
        id: 'log-2',
        action: 'permission_update',
        title: 'مطابقة الأكواد السرية',
        details: 'تم التحقق من الرموز الأمنية المشفرة لجميع عمداء الكليات المعتمدين والمستخدمين للأنظمة.',
        user: 'مدير النظام الأول',
        timestamp: SYSTEM_CURRENT_DATE + ' 09:12:30',
        ip: '192.168.1.10'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_AUDIT_LOGS', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (action: string, title: string, details: string) => {
    const timeString = new Date().toLocaleTimeString('ar-IQ', { hour12: false });
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(1000 + Math.random() * 9000).toString(36)}`,
      action,
      title,
      details,
      user: currentRoleConfig ? currentRoleConfig.title : 'زائر غير معروف',
      timestamp: `${SYSTEM_CURRENT_DATE} ${timeString}`,
      ip: currentRole === 'admin' ? 'بلا IP (دخول مباشر)' : (currentRoleConfig?.departmentId ? (collegeIps[currentRoleConfig.departmentId] || '192.168.1.150') : '192.168.1.100')
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeIp, setNewCollegeIp] = useState('');
  const [newCollegeCode, setNewCollegeCode] = useState('');
  const [newCollegeMorningFee, setNewCollegeMorningFee] = useState<number>(4000000);
  const [newCollegeEveningFee, setNewCollegeEveningFee] = useState<number>(5000000);
  const [newCollegeYears, setNewCollegeYears] = useState<number>(4);
  const [newCollegeSeats, setNewCollegeSeats] = useState<number>(100);

  const [communicationMode, setCommunicationMode] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_COMM_MODE') || 'cloud';
  });
  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_COMM_MODE', communicationMode);
  }, [communicationMode]);

  const [adminSubTab, setAdminSubTab] = useState<'deans' | 'dept_heads' | 'admin_depts' | 'passcodes' | 'employees' | 'receipt_settings' | 'network_settings'>('deans');

  // 1.11 إعدادات اسم الجامعة والبيانات المطبوعة على الوصل المالي والوثائق
  const [receiptUniversityName, setReceiptUniversityName] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_RECEIPT_UNI_NAME') || 'كلية الكوت الجامعة';
  });

  const [receiptUniversityEmail, setReceiptUniversityEmail] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_RECEIPT_UNI_EMAIL') || 'info@alkut.edu.iq';
  });

  const [receiptSubText, setReceiptSubText] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_RECEIPT_SUB_TEXT') || 'مكتب العميد';
  });

  const [receiptNoteText, setReceiptNoteText] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_RECEIPT_NOTE_TEXT') || 'ملاحظة: يرجى الاحتفاظ بهذه الوثيقة / الوصل كونه مستنداً رسمياً للمراجعة والتحقق الإلكتروني بالباركود.';
  });

  // إعدادات وتخصيص ترويسة الباركود والوثائق والشعار من قبل الأدمن
  const [headerCountryAr, setHeaderCountryAr] = useState<string>(() => {
    return localStorage.getItem('KUT_HEADER_COUNTRY_AR') || 'جمهورية العراق';
  });
  const [headerCollegeAr, setHeaderCollegeAr] = useState<string>(() => {
    return localStorage.getItem('KUT_HEADER_COLLEGE_AR') || 'كلية الكوت الجامعة';
  });
  const [headerOfficeAr, setHeaderOfficeAr] = useState<string>(() => {
    return localStorage.getItem('KUT_HEADER_OFFICE_AR') || 'مكتب العميد';
  });
  const [headerBismiText, setHeaderBismiText] = useState<string>(() => {
    return localStorage.getItem('KUT_HEADER_BISMI_TEXT') || 'بسمه تعالى';
  });
  const [headerShowBismi, setHeaderShowBismi] = useState<boolean>(() => {
    const saved = localStorage.getItem('KUT_HEADER_SHOW_BISMI');
    return saved !== null ? saved === 'true' : true;
  });
  const [headerCountryEn, setHeaderCountryEn] = useState<string>(() => {
    return localStorage.getItem('KUT_HEADER_COUNTRY_EN') || 'Republic of Iraq';
  });
  const [headerCollegeEn, setHeaderCollegeEn] = useState<string>(() => {
    return localStorage.getItem('KUT_HEADER_COLLEGE_EN') || 'Kut University College';
  });
  const [headerOfficeEn, setHeaderOfficeEn] = useState<string>(() => {
    return localStorage.getItem('KUT_HEADER_OFFICE_EN') || 'Dean Office';
  });
  const [headerCustomLogoUrl, setHeaderCustomLogoUrl] = useState<string>(() => {
    return localStorage.getItem('KUT_HEADER_CUSTOM_LOGO') || '';
  });

  const headerConfig: KutHeaderConfig = {
    countryAr: headerCountryAr,
    collegeAr: headerCollegeAr,
    officeAr: headerOfficeAr,
    bismiText: headerBismiText,
    showBismi: headerShowBismi,
    countryEn: headerCountryEn,
    collegeEn: headerCollegeEn,
    officeEn: headerOfficeEn,
    customLogoUrl: headerCustomLogoUrl
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "officialHeader"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.countryAr) setHeaderCountryAr(data.countryAr);
        if (data.collegeAr) {
          setHeaderCollegeAr(data.collegeAr);
          setReceiptUniversityName(data.collegeAr);
        }
        if (data.officeAr) {
          setHeaderOfficeAr(data.officeAr);
          setReceiptSubText(data.officeAr);
        }
        if (data.bismiText) setHeaderBismiText(data.bismiText);
        if (typeof data.showBismi === 'boolean') setHeaderShowBismi(data.showBismi);
        if (data.countryEn) setHeaderCountryEn(data.countryEn);
        if (data.collegeEn) setHeaderCollegeEn(data.collegeEn);
        if (data.officeEn) setHeaderOfficeEn(data.officeEn);
        if (typeof data.customLogoUrl === 'string') setHeaderCustomLogoUrl(data.customLogoUrl);
        if (data.email) setReceiptUniversityEmail(data.email);
        if (data.note) setReceiptNoteText(data.note);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('KUT_HEADER_COUNTRY_AR', headerCountryAr);
    localStorage.setItem('KUT_HEADER_COLLEGE_AR', headerCollegeAr);
    localStorage.setItem('KUT_HEADER_OFFICE_AR', headerOfficeAr);
    localStorage.setItem('KUT_HEADER_BISMI_TEXT', headerBismiText);
    localStorage.setItem('KUT_HEADER_SHOW_BISMI', String(headerShowBismi));
    localStorage.setItem('KUT_HEADER_COUNTRY_EN', headerCountryEn);
    localStorage.setItem('KUT_HEADER_COLLEGE_EN', headerCollegeEn);
    localStorage.setItem('KUT_HEADER_OFFICE_EN', headerOfficeEn);
    localStorage.setItem('KUT_HEADER_CUSTOM_LOGO', headerCustomLogoUrl);
    localStorage.setItem('AL_AHLIYA_RECEIPT_UNI_NAME', headerCollegeAr);
    localStorage.setItem('AL_AHLIYA_RECEIPT_UNI_EMAIL', receiptUniversityEmail);
    localStorage.setItem('AL_AHLIYA_RECEIPT_SUB_TEXT', headerOfficeAr);
    localStorage.setItem('AL_AHLIYA_RECEIPT_NOTE_TEXT', receiptNoteText);
  }, [headerCountryAr, headerCollegeAr, headerOfficeAr, headerBismiText, headerShowBismi, headerCountryEn, headerCollegeEn, headerOfficeEn, headerCustomLogoUrl, receiptUniversityEmail, receiptNoteText]);

  // Sync Students and Departments from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "students"), (docSnap) => {
      try {
        if (docSnap.exists() && Array.isArray(docSnap.data()?.list)) {
          setStudents(docSnap.data().list);
        }
      } catch (e) {}
    }, (err) => {
      console.warn("Students listener notice:", err);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "departments"), (docSnap) => {
      try {
        if (docSnap.exists() && Array.isArray(docSnap.data()?.list)) {
          setDepartments(docSnap.data().list);
        }
      } catch (e) {}
    }, (err) => {
      console.warn("Departments listener notice:", err);
    });
    return () => unsub();
  }, []);

  const syncDepartments = (list: Department[]) => {
    try {
      localStorage.setItem('AL_AHLIYA_DEPARTMENTS', JSON.stringify(list));
      setDoc(doc(db, "appData", "departments"), { list }).catch((err) => {
        console.warn("Departments cloud sync notice:", err);
      });
    } catch (e) {
      console.warn("syncDepartments local write notice:", e);
    }
  };

  const syncStudents = (list: Student[]) => {
    try {
      localStorage.setItem('AL_AHLIYA_STUDENTS', JSON.stringify(list));
      setDoc(doc(db, "appData", "students"), { list }).catch((err) => {
        console.warn("Students cloud sync notice:", err);
      });
    } catch (e) {
      console.warn("syncStudents local write notice:", e);
    }
  };

  // 🏢 1.12 الأقسام والمديريات الإدارية والخدمية (غير التدريسية - بدون طلبة أو أقساط)
  const [adminDepts, setAdminDepts] = useState<AdminDepartment[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_ADMIN_DEPTS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'ad-hr', name: 'قسم الموارد البشرية والذاتية', manager: 'أ. حسام كريم العبيدي', category: 'شؤون إدارية وتوظيف', ip: '192.168.1.30', role: 'admin_dept_hr', defaultCode: '3310' },
      { id: 'ad-legal', name: 'قسم الشؤون القانونية والعقود', manager: 'أ.م.د. علي شاكر الدليمي', category: 'استشارات وتحقيق قانوني', ip: '192.168.1.31', role: 'admin_dept_legal', defaultCode: '3320' },
      { id: 'ad-media', name: 'قسم الإعلام والعلاقات العامة', manager: 'أ. ضياء فالح الزبيدي', category: 'علاقات وإعلام جامعي', ip: '192.168.1.32', role: 'admin_dept_media', defaultCode: '3330' },
      { id: 'ad-services', name: 'قسم الصيانة والخدمات العامة', manager: 'م. حيدر جاسم المعموري', category: 'خدمات وتشغيل هندسي', ip: '192.168.1.33', role: 'admin_dept_services', defaultCode: '3340' },
      { id: 'ad-labs', name: 'إدارة المختبرات والورش المركزية', manager: 'د. مهند عبد الرحيم', category: 'مختبرات وتجهيز تقني', ip: '192.168.1.34', role: 'labs_director', defaultCode: '3333' },
      { id: 'ad-audit', name: 'شعبة الرقابة والتدقيق الداخلي', manager: 'أ. كمال عزيز الجبوري', category: 'تدقيق مالي وإداري', ip: '192.168.1.35', role: 'admin_dept_audit', defaultCode: '3350' },
      { id: 'ad-it', name: 'مركز الحاسبة وتكنولوجيا المعلومات', manager: 'م. م. أحمد صبيح الربيعي', category: 'أنظمة وشبكات', ip: '192.168.1.36', role: 'admin_dept_it', defaultCode: '3360' }
    ];
  });

  const syncAdminDepts = (list: AdminDepartment[]) => {
    setAdminDepts(list);
    try {
      localStorage.setItem('AL_AHLIYA_ADMIN_DEPTS', JSON.stringify(list));
      setDoc(doc(db, "appData", "adminDepts"), { list }).catch((err) => {
        console.warn("adminDepts cloud sync notice:", err);
      });
    } catch (e) {
      console.warn("syncAdminDepts local write notice:", e);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "adminDepts"), (docSnap) => {
      if (docSnap.exists() && Array.isArray(docSnap.data()?.list)) {
        setAdminDepts(docSnap.data().list);
        localStorage.setItem('AL_AHLIYA_ADMIN_DEPTS', JSON.stringify(docSnap.data().list));
      }
    }, (err) => console.warn("adminDepts sync notice:", err));
    return () => unsub();
  }, []);

  // 👨‍🏫 1.13 الأقسام الأكاديمية التخصصية ورؤساء الأقسام العلمية
  const [academicSubDepts, setAcademicSubDepts] = useState<AcademicSubDepartment[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_ACADEMIC_SUB_DEPTS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'sub-dent-1', name: 'قسم جراحة الفم والأسنان', collegeId: 'dentistry', headName: 'أ.م.د. رائد فؤاد الحكيم', ip: '192.168.10.21', role: 'head_sub_dent1', defaultCode: '4501' },
      { id: 'sub-pharm-1', name: 'قسم الصيدلة السريرية', collegeId: 'pharmacy', headName: 'د. سرى حامد الخزرجي', ip: '192.168.11.22', role: 'head_sub_pharm1', defaultCode: '4502' },
      { id: 'sub-eng-1', name: 'قسم هندسة الذكاء الاصطناعي', collegeId: 'engineering', headName: 'د. ثامر جبار الكناني', ip: '192.168.12.23', role: 'head_sub_eng1', defaultCode: '4503' },
      { id: 'sub-law-1', name: 'قسم القانون العام', collegeId: 'law', headName: 'أ.د. ماجد نجم الربيعي', ip: '192.168.13.24', role: 'head_sub_law1', defaultCode: '4504' }
    ];
  });

  const syncAcademicSubDepts = (list: AcademicSubDepartment[]) => {
    setAcademicSubDepts(list);
    try {
      localStorage.setItem('AL_AHLIYA_ACADEMIC_SUB_DEPTS', JSON.stringify(list));
      setDoc(doc(db, "appData", "academicSubDepts"), { list }).catch((err) => {
        console.warn("academicSubDepts cloud sync notice:", err);
      });
    } catch (e) {
      console.warn("syncAcademicSubDepts local write notice:", e);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "academicSubDepts"), (docSnap) => {
      if (docSnap.exists() && Array.isArray(docSnap.data()?.list)) {
        setAcademicSubDepts(docSnap.data().list);
        localStorage.setItem('AL_AHLIYA_ACADEMIC_SUB_DEPTS', JSON.stringify(docSnap.data().list));
      }
    }, (err) => console.warn("academicSubDepts sync notice:", err));
    return () => unsub();
  }, []);

  // حالات فورم رؤساء الأقسام العلمية
  const [subDeptName, setSubDeptName] = useState('');
  const [subDeptCollegeId, setSubDeptCollegeId] = useState('');
  const [subDeptHeadName, setSubDeptHeadName] = useState('');
  const [subDeptIp, setSubDeptIp] = useState('');
  const [subDeptCode, setSubDeptCode] = useState('');
  const [editingSubDeptId, setEditingSubDeptId] = useState<string | null>(null);

  // حالات فورم الأقسام الإدارية والخدمية (غير التدريسية)
  const [adminDeptName, setAdminDeptName] = useState('');
  const [adminDeptManager, setAdminDeptManager] = useState('');
  const [adminDeptCategory, setAdminDeptCategory] = useState('شؤون إدارية وخدمات');
  const [adminDeptIp, setAdminDeptIp] = useState('');
  const [adminDeptCode, setAdminDeptCode] = useState('');
  const [editingAdminDeptId, setEditingAdminDeptId] = useState<string | null>(null);

  // مزامنة الكوادر ديناميكياً مع الأقسام والعمادات ورؤساء الأقسام والأقسام الإدارية لضمان ظهور الجميع برمز دائم
  useEffect(() => {
    let rolesChanged = false;
    let codesChanged = false;
    let updatedRoles = [...rolesList];
    let updatedCodes = { ...roleCodes };

    // 1. مزامنة عمداء الكليات الأكاديمية
    if (departments && departments.length > 0) {
      departments.forEach((dept, index) => {
        const deanRole = `head_${dept.id}`;
        const existingIndex = updatedRoles.findIndex(r => r.role === deanRole || r.departmentId === dept.id);
        const deanName = dept.headOfDepartment && dept.headOfDepartment !== 'شاغر' 
          ? dept.headOfDepartment 
          : 'شاغر';
        const expectedTitle = `عميد ${dept.name} (العميد: ${deanName})`;

        if (existingIndex === -1) {
          const defaultCode = updatedCodes[deanRole] || `44${String(index + 1).padStart(2, '0')}`;
          updatedRoles.push({
            role: deanRole,
            title: expectedTitle,
            categoryName: 'عميد كلية',
            defaultCode: defaultCode,
            departmentId: dept.id,
            isCustom: true
          });
          if (!updatedCodes[deanRole]) {
            updatedCodes[deanRole] = defaultCode;
            codesChanged = true;
          }
          rolesChanged = true;
        } else {
          if (updatedRoles[existingIndex].title !== expectedTitle || updatedRoles[existingIndex].departmentId !== dept.id) {
            updatedRoles[existingIndex] = {
              ...updatedRoles[existingIndex],
              title: expectedTitle,
              departmentId: dept.id
            };
            rolesChanged = true;
          }
        }
      });
    }

    // 2. مزامنة رؤساء الأقسام العلمية
    if (academicSubDepts && academicSubDepts.length > 0) {
      academicSubDepts.forEach((sub, index) => {
        const subRole = sub.role || `head_sub_${sub.id}`;
        const existingIndex = updatedRoles.findIndex(r => r.role === subRole);
        const expectedTitle = `رئيس ${sub.name} (الدكتور: ${sub.headName || 'شاغر'})`;

        if (existingIndex === -1) {
          const defaultCode = sub.defaultCode || updatedCodes[subRole] || `45${String(index + 1).padStart(2, '0')}`;
          updatedRoles.push({
            role: subRole,
            title: expectedTitle,
            categoryName: 'رئيس قسم علمي',
            defaultCode: defaultCode,
            departmentId: sub.collegeId,
            isCustom: true
          });
          if (!updatedCodes[subRole]) {
            updatedCodes[subRole] = defaultCode;
            codesChanged = true;
          }
          rolesChanged = true;
        } else {
          if (updatedRoles[existingIndex].title !== expectedTitle) {
            updatedRoles[existingIndex] = {
              ...updatedRoles[existingIndex],
              title: expectedTitle,
              categoryName: 'رئيس قسم علمي'
            };
            rolesChanged = true;
          }
        }
      });
    }

    // 3. مزامنة الأقسام الإدارية والخدمية (غير التدريسية)
    if (adminDepts && adminDepts.length > 0) {
      adminDepts.forEach((ad, index) => {
        const adRole = ad.role || `admin_dept_${ad.id}`;
        const existingIndex = updatedRoles.findIndex(r => r.role === adRole);
        const expectedTitle = `${ad.name} (المسؤول: ${ad.manager || 'إداري'})`;

        if (existingIndex === -1) {
          const defaultCode = ad.defaultCode || updatedCodes[adRole] || `33${String(index + 1).padStart(2, '0')}`;
          updatedRoles.push({
            role: adRole,
            title: expectedTitle,
            categoryName: 'قسم إداري / خدمي',
            defaultCode: defaultCode,
            isCustom: true
          });
          if (!updatedCodes[adRole]) {
            updatedCodes[adRole] = defaultCode;
            codesChanged = true;
          }
          rolesChanged = true;
        } else {
          if (updatedRoles[existingIndex].title !== expectedTitle) {
            updatedRoles[existingIndex] = {
              ...updatedRoles[existingIndex],
              title: expectedTitle,
              categoryName: 'قسم إداري / خدمي'
            };
            rolesChanged = true;
          }
        }
      });
    }

    if (rolesChanged) {
      syncRolesList(updatedRoles);
    }
    if (codesChanged) {
      syncRoleCodes(updatedCodes);
    }
  }, [departments, academicSubDepts, adminDepts]);

  // 1.10 حالات وإعدادات خدمة الإشعارات المنبثقة للتنبيه بسلامة وثائق الطلاب المستهدفة
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_ALERTS_ENABLED');
    return saved === 'true'; // Default is false (muting/cancelling alerts by default)
  });
  const [inAppToasts, setInAppToasts] = useState<{ id: string; title: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; timestamp: string }[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // دالة طلب الإذن من المتصفح لإشعارات Push Notifications المقررة
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          try {
            new Notification('🎉 تم تفعيل الإشعارات بنجاح!', {
              body: 'ستصلك الآن تنبيهات دورية عند اقتراب انتهاء صلاحية وثائق الطلاب بالجامعة الأهلية.',
              icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png'
            });
          } catch (e) {
            console.warn('Native notification instantiation failed in sandboxed container', e);
          }
        }
        return perm;
      } catch (e) {
        console.error('Request permission failed:', e);
        return 'default';
      }
    } else {
      alert('⚠️ الإشعارات غير مدعومة في هذا المتصفح!');
      return 'default';
    }
  };

  // دالة إرسال تنبيه متصفح وهمي لاختبار قنوات الاتصال
  const triggerTestNotification = () => {
    let browserNotifySent = false;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('🧪 اختبار تنبيه المتصفح المباشر', {
          body: 'أهلاً بك! نظام الإشعارات السحابي يعمل الآن بنجاح وكفاءة تامة.',
          icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png'
        });
        browserNotifySent = true;
      } catch (e) {
        console.warn('Native notification failed, playing fallback visual alert.', e);
      }
    }

    setInAppToasts(prev => [
      {
        id: `toast-${Date.now()}`,
        title: '🧪 اختبار ناجح للإشعار العائم',
        message: 'أهلاً بك! تم إطلاق هذا الإشعار للتحقق من سلامة البث والمحاكاة لخدمة الـ Push Notifications في المتصفح والإنترفيس.',
        type: 'success',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      },
      ...prev
    ]);

    if (!browserNotifySent) {
      alert('📡 تم تفعيل التنبيه المباشر بنجاح! تم عرض بطاقة التنبيه الافتراضية العائمة على شاشتكم نظراً لعدم تفويض الدخول المباشر للمتصفح.');
    }
  };

  // دالة المسح الشامل لوثائق الطلاب وتوليد تنبيهات متصفح فورا بالطلبة المعنيين
  const triggerDocumentExpiryPushNotifications = (silent = false) => {
    if (!alertsEnabled && silent) {
      return; // إلغاء التنبيهات تلقائيا بناء على رغبة المستخدم
    }
    const sysDate = new Date(SYSTEM_CURRENT_DATE);
    const expiringStudents: { studentName: string; studentId: string; docName: string; diffDays: number }[] = [];

    students.forEach(student => {
      student.documents.forEach(doc => {
        if (doc.provided && doc.expiryDate) {
          const expDate = new Date(doc.expiryDate);
          const diffTime = expDate.getTime() - sysDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 30) {
            expiringStudents.push({
              studentName: student.name,
              studentId: student.id,
              docName: doc.name,
              diffDays
            });
          }
        }
      });
    });

    if (expiringStudents.length === 0) {
      if (!silent) {
        alert('ℹ️ لا توجد وثائق للطلاب منتهية الصلاحية أو قريبة من الانتهاء حالياً طبقاً لتاريخ النظام المعين.');
      }
      return;
    }

    // إرسال إشعار المتصفح الحقيقي
    let browserNotifySent = false;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const count = expiringStudents.length;
        const firstFew = expiringStudents.slice(0, 3).map(s => `• ${s.studentName} (${s.docName})`).join('\n');
        const extra = count > 3 ? `\nوآخرون غيرهم (إجمالي الحالات: ${count})` : '';

        try {
          new Notification('⚠️ تنبيه الوثائق منتهية القيد والملفات الحرجة', {
            body: `تنبه لوجود (${count}) طالب بمستندات توشك على الانتهاء أو قريبة من ذلك!\nالأسماء الأولى:\n${firstFew}${extra}`,
            icon: 'https://cdn-icons-png.flaticon.com/512/3588/3588294.png',
            tag: 'student-expiry-push',
            requireInteraction: true
          });
          browserNotifySent = true;
        } catch (err) {
          console.warn('Native notification restricted inside sandboxed iframe workspace.', err);
        }
      }
    }

    // تغذية التراكب المرئي العائم فورا بأسماء الطلاب كدعم مزدوج يضمن وصول التنبيه
    const newToasts = expiringStudents.map((item, index) => {
      const isExpired = item.diffDays < 0;
      return {
        id: `toast-${Date.now()}-${index}-${Math.random()}`,
        title: isExpired ? '🔴 تنبيه: وثيقة انتهت صلاحيتها!' : '🟡 تحذير: وثيقة تقترب من الانتهاء',
        message: `تم رصد وثيقة (${item.docName}) للطالب [${item.studentName}] بكلية ${departments.find(d => d.id === students.find(s => s.id === item.studentId)?.departmentId)?.name || 'الكليات'}، ${isExpired ? 'الوثيقة منتهية الصلاحية تماما' : `صلاحيتها شارفت على النفاد بقيت ${item.diffDays} أيام`}.`,
        type: (isExpired ? 'error' : 'warning') as 'error' | 'warning',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      };
    });

    setInAppToasts(prev => [...newToasts, ...prev].slice(0, 15));

    if (!silent) {
      if (browserNotifySent) {
        alert(`🎉 تم بث إشعار المتصفح المعتمد (Push Notification) بنجاح!\nوتم توليد ${expiringStudents.length} تنبيها مرئياً منبثقا على شاشتكم.`);
      } else {
        alert(`📡 تم إطلاق الإشعار بنجاح!\nبما أن المتصفح يحظر إشعارات الـ iFrame المضمن ببعض الحسابات، فقد ولدنا لك (${expiringStudents.length}) بطاقة تحذيرية عائمة فائقة الدقة بأسماء الطلاب المعنيين.`);
      }
    }
  };

  // 1.9 تتبع تنبيهات البريد الإلكتروني التلقائية المرسلة للوثائق منتهية الصلاحية
  const [emailLogs, setEmailLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_EMAIL_LOGS');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_EMAIL_LOGS', JSON.stringify(emailLogs));
  }, [emailLogs]);

  // دالة الإرسال التلقائي للبريد الإلكتروني للطلبة (الوثائق المنتهية أو التي تحتاج للتجديد)
  const triggerAutoEmailAlerts = (silent = false) => {
    let countSent = 0;
    const sysDate = new Date(SYSTEM_CURRENT_DATE); // '2026-05-27'
    const newLogs: any[] = [];

    students.forEach(student => {
      student.documents.forEach(doc => {
        if (doc.provided && doc.expiryDate) {
          const expDate = new Date(doc.expiryDate);
          const diffTime = expDate.getTime() - sysDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let alertStatus: 'expired' | 'needs_renewal' | null = null;
          if (diffDays < 0) {
            alertStatus = 'expired';
          } else if (diffDays <= 30) {
            alertStatus = 'needs_renewal';
          }

          if (alertStatus) {
            // تحقق إذا تم إرسال هذا التنبيه المعين مسبقاً (لتجنب التكرار من نفس الوثيقة في نفس اليوم)
            const alreadySent = emailLogs.some(
              log => log.studentId === student.id && 
                     log.documentId === doc.id && 
                     log.expiryDate === doc.expiryDate &&
                     new Date(log.sentAt).toDateString() === new Date().toDateString()
            );

            if (!alreadySent) {
              countSent++;
              const mailLog = {
                id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                studentId: student.id,
                studentName: student.name,
                recipientEmail: student.email || `${student.id.toLowerCase()}@ahliya.edu.iq`,
                documentId: doc.id,
                documentName: doc.name,
                expiryDate: doc.expiryDate,
                status: alertStatus,
                daysDifference: diffDays,
                subject: alertStatus === 'expired'
                  ? `⚠️ تنبيه عاجل: انتهت صلاحية وثيقتك الرسمية (${doc.name}) - الجامعة الأهلية`
                  : `📅 تذكير دوري: وثيقتك (${doc.name}) تحتاج إلى تجديد خلال ${diffDays} يوم`,
                body: `عزيزي الطالب ${student.name}،\n\nنود إحاطتكم علماً بأن وثيقتكم المرفقة لدينا وهي (${doc.name}) ${alertStatus === 'expired' ? 'قد انتهت صلاحيتها بالفعل' : `ستنتهي صلاحيتها قريباً (المتبقي ${diffDays} يوم)`} بتاريخ ${doc.expiryDate}.\n\nيرجى التفضل بمراجعة قسم شؤون والقبول والتسجيل بالجامعة الأهلية العراقية لتسليم نسخة محدثة وصالحة تفادياً لأي إجراء إداري.\n\nشعبة التسجيل وقيد الطلاب الموحد`,
                sentAt: new Date().toISOString()
              };
              newLogs.push(mailLog);
            }
          }
        }
      });
    });

    if (newLogs.length > 0) {
      setEmailLogs(prev => [...newLogs, ...prev]);
    }

    if (!silent) {
      if (countSent > 0) {
        alert(`⚡ تم تشغيل الدالة البرمجية وإرسال (${countSent}) تنبيه بريد إلكتروني بنجاح ببريد الطلبة المسجلين وتحرير لوائح الإرسال التاريخية!`);
      } else {
        alert(`ℹ️ لا توجد وثائق منتهية أو قريبة من الانتهاء تحتاج إرسال تنبيهات جديدة اليوم (أو تم إرسال تنبيهاتها لهذا اليوم مسبقاً لتفادي تكرار البريد).`);
      }
    }
    return countSent;
  };

  // 1.5 تم إلغاء تاريخ انتهاء صلاحية النظام وتشغيل البرنامج مدى الحياة بطلب من مدير النظام
  const EXPIRATION_DATE = '2099-12-31';
  
  // حالة محاكاة انتهاء الصلاحية (ملغية ومغلقة افتراضياً)
  const [isSimulatedExpired, setIsSimulatedExpired] = useState<boolean>(false);

  // تم إلغاء فحص الانتهاء تماماً ليعمل النظام بلا حدود
  const isActuallyExpired = false;

  const isLocked = false;

  // حفظ وتغيير حالة محاكاة انتهاء الصلاحية
  const toggleSimulation = () => {
    const nextState = !isSimulatedExpired;
    setIsSimulatedExpired(nextState);
    localStorage.setItem('AL_AHLIYA_SIM_EXPIRED', String(nextState));
  };

  // دالة برمجية لإضافة موظف/عضو كادر جديد بنظام الصلاحيات
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffTitle || !newStaffCode) {
      alert('يرجى ملء جميع الحقول الضرورية لإضافة الموظف!');
      return;
    }

    const cleanTitle = newStaffTitle.trim();
    const cleanRole = `staff_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const newStaff = {
      role: cleanRole,
      title: cleanTitle,
      categoryName: newStaffCategory,
      defaultCode: newStaffCode,
      departmentId: newStaffDept || undefined,
      isCustom: true
    };

    const updatedRoles = [...rolesList, newStaff];
    syncRolesList(updatedRoles);

    const updatedCodes = { ...roleCodes, [cleanRole]: newStaffCode };
    syncRoleCodes(updatedCodes);

    // إعادة تصفير النموذج
    setNewStaffTitle('');
    setNewStaffCode('');
    setNewStaffDept('');
    addAuditLog('staff_add', 'إضافة موظف وتعيين صلاحية', `تم تسجيل وإضافة الموظف الجديد [${cleanTitle}] كـ [${newStaffCategory}] وتوليد كود المرور الخاص به`);
    
    setInAppToasts(prev => [
      {
        id: `toast-${Date.now()}`,
        title: 'إضافة موظف جديد',
        message: `✓ تم بنجاح تسجيل الموظف "${cleanTitle}" وتعيين الرمز السري له.`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      },
      ...prev
    ]);
  };

  // دالة برمجية لحذف موظف/عضو كادر وسحب الصلاحية منه
  const handleDeleteStaff = (roleToDelete: string) => {
    if (currentRole !== 'admin') {
      alert('⚠️ خطأ: صلاحية حذف سجل موظف وسحب صلاحياته الممنوحة حصرية لمدير النظام الفعال فقط!');
      return;
    }
    if (roleToDelete === 'admin') {
      alert('لا يمكن حذف كود الإدارة العامة الأمنية لمدير النظام!');
      return;
    }
    const staff = rolesList.find(r => r.role === roleToDelete);
    if (!staff) return;

    if (window.confirm(`هل أنت متأكد من حذف الموظف "${staff.title}" وسحب صلاحياته تماماً؟`)) {
      const updatedRoles = rolesList.filter(r => r.role !== roleToDelete);
      syncRolesList(updatedRoles);

      const updatedCodes = { ...roleCodes };
      delete updatedCodes[roleToDelete];
      syncRoleCodes(updatedCodes);

      addAuditLog('staff_delete', 'حذف وتصفية موظف', `تم عزل وفصل وحذف الموظف [${staff.title}] وسحب كود مصادقة الدخول الخاص به`);
      // تصفير الجلسة في حال كان الموظف المحذوف هو النشط حالياً
      if (currentRole === roleToDelete) {
        setCurrentRole('admin');
      }
      alert('تم حذف الموظف بنجاح وسحب الكود البرمجي المخصص لدخوله.');
    }
  };

  // دالة برمجية لإضافة أو تحديث عميد كلية بمحاكاة كاملة
  const handleAddOrUpdateDean = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'admin') {
      alert('⚠️ خطأ: هذه الصلاحية حصرية لمدير النظام الفعال فقط!');
      return;
    }
    if (!formDeanName || !formDeanDept || !formDeanCode) {
      alert('⚠️ يرجى ملء جميع التفاصيل لتسجيل أو تحديث عميد الكلية!');
      return;
    }

    const matchedDept = departments.find(d => d.id === formDeanDept);
    if (!matchedDept) {
      alert('⚠️ الكلية المحددة غير صالحة!');
      return;
    }

    const deanRole = `head_${formDeanDept}`;
    const cleanName = formDeanName.trim();
    const cleanCode = formDeanCode.trim().replace(/\D/g, ''); // أرقام فقط

    if (cleanCode.length < 4) {
      alert('⚠️ يجب أن يتكون رمز دخول الكلية من 4 أرقام على الأقل!');
      return;
    }

    // تعديل/تحديث الدور أو إضافة دور جديد
    const existingIndex = rolesList.findIndex(r => r.role === deanRole || r.departmentId === formDeanDept);

    const newDeanConfig = {
      role: deanRole,
      title: `عميد ${matchedDept.name} (${cleanName})`,
      categoryName: 'عميد كلية',
      defaultCode: cleanCode,
      departmentId: formDeanDept,
      isCustom: true
    };

    let updatedRoles = [...rolesList];
    if (existingIndex >= 0) {
      updatedRoles[existingIndex] = newDeanConfig;
    } else {
      updatedRoles.push(newDeanConfig);
    }

    syncRolesList(updatedRoles);

    const updatedCodes = { ...roleCodes, [deanRole]: cleanCode };
    syncRoleCodes(updatedCodes);

    // تحديث لاسم العميد المعتمد في departments
    const updatedDepts = departments.map(d =>
      d.id === formDeanDept ? { ...d, headOfDepartment: cleanName } : d
    );
    setDepartments(updatedDepts);
    syncDepartments(updatedDepts);

    // تصفير مدخلات الفورم
    setFormDeanName('');
    setFormDeanDept('');
    setFormDeanCode('');
    addAuditLog('dean_assign', 'تكليف عميد الكلية', `تم تكليف الأستاذ [${cleanName}] على رأس عمادة كلية وقسم [${matchedDept.name}] بكود سري محدث ومحطة IP خاصة ومفعلة`);
    alert(`🎉 تم تكليف العميد "${cleanName}" بنجاح للكلية "${matchedDept.name}".\n📡 تم تفعيل كود ولوج الكلية الموحد (${cleanCode}) وحاسبتها الفردية IP: ${collegeIps[formDeanDept] || '192.168.1.100'}`);
  };

  // دالة حذف عميد كلية وإعادة وضعه في الحالة الشاغرة
  const handleDeleteDean = (deptId: string) => {
    if (currentRole !== 'admin') {
      alert('⚠️ خطأ: هذه الصلاحية حصرية لمدير النظام الفعال فقط!');
      return;
    }
    const matchedDept = departments.find(d => d.id === deptId);
    if (!matchedDept) return;

    if (window.confirm(`هل أنت متأكد من سحب صلاحيات وفصل عميد "${matchedDept.name}" نهائياً من النظام؟\nسيؤدي هذا إلى تصفير الرمز السري وتعليق الدخول لحاسبة الكلية.`)) {
      const deanRole = `head_${deptId}`;
      const updatedRoles = rolesList.map(r => {
        if (r.departmentId === deptId || r.role === deanRole) {
          return {
            ...r,
            title: `عميد ${matchedDept.name} (شاغر)`
          };
        }
        return r;
      });
      syncRolesList(updatedRoles);

      // تصفير الاسم
      const updatedDepts = departments.map(d => 
        d.id === deptId ? { ...d, headOfDepartment: 'شاغر' } : d
      );
      setDepartments(updatedDepts);
      syncDepartments(updatedDepts);

      addAuditLog('dean_remove', 'إقالة عميد الكلية', `تمت تصفية وإقالة عميد كلية [${matchedDept.name}] وإلغاء صلاحية ولوجه وحاسبته الرقمية وإبقاء المنصب شاغراً`);
      
      // تصفير الجلسة في حال كان العمود الفعال المفتوح هو المحذوف
      if (currentRole === deanRole) {
        setCurrentRole('admin');
      }

      alert(`✓ تم بنجاح فصل عميد "${matchedDept.name}" وتصفير المنصب إلى شاغر.`);
    }
  };

  // دالة لحذف الكلية بالكامل مع حاسبتها التلقائية ومحطتها الأمنية من النظام
  const handleDeleteCollegeEntirely = (deptId: string) => {
    if (currentRole !== 'admin') {
      alert('⚠️ خطأ: هذه الصلاحية حصرية لمدير النظام الفعال فقط!');
      return;
    }
    const matchedDept = departments.find(d => d.id === deptId);
    if (!matchedDept) return;
    
    if (window.confirm(`هل أنت متأكد من حذف وإلغاء قسم/كلية "${matchedDept.name}" نهائياً من النظام؟`)) {
      const updatedDepts = departments.filter(d => d.id !== deptId);
      setDepartments(updatedDepts);
      syncDepartments(updatedDepts);
      
      // إزالة الصلاحية
      const deanRole = `head_${deptId}`;
      const updatedRoles = rolesList.filter(r => r.departmentId !== deptId && r.role !== deanRole);
      syncRolesList(updatedRoles);

      const updatedCodes = { ...roleCodes };
      delete updatedCodes[deanRole];
      syncRoleCodes(updatedCodes);

      // إزالة الـ IP
      setCollegeIps(prev => {
        const copy = { ...prev };
        delete copy[deptId];
        localStorage.setItem('AL_AHLIYA_COLLEGE_IPS', JSON.stringify(copy));
        return copy;
      });

      // تصفير الجلسة في حال كان العمود الفعال المفتوح هو المحذوف
      if (currentRole === deanRole) {
        setCurrentRole('admin');
      }

      addAuditLog('college_delete', 'حذف وإلغاء الكلية', `تم شطب وحذف وإلغاء كلية وقسم [${matchedDept.name}] بالكامل`);
      
      setInAppToasts(prev => [
        {
          id: `toast-${Date.now()}`,
          title: 'مسح القسم',
          message: `✓ تم بنجاح حذف وإلغاء كلية/قسم "${matchedDept.name}" من النظام بالكامل.`,
          type: 'success',
          timestamp: new Date().toLocaleTimeString('ar-IQ')
        },
        ...prev
      ]);
      setDeptIdToDelete(null);
    }
  };

  // دالة الإلغاء الفوري والحذف النهائي بعد ضغط زر التأكيد
  const executeDeleteCollege = (deptId: string) => {
    handleDeleteCollegeEntirely(deptId);
  };

  // دالة حفظ أو تعديل أو استبدال بيانات كلية وحاسبتها بشكل كامل
  const handleSaveCollegeAndStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'admin') {
      alert('⚠️ خطأ: هذه الصلاحية حصرية لمدير النظام الفعال فقط!');
      return;
    }

    if (!newCollegeName || !newCollegeIp) {
      alert('⚠️ يرجى ملء التفاصيل المطلوبة لتسجيل أو تعديل الكلية!');
      return;
    }

    const cleanName = newCollegeName.trim();
    const cleanIp = newCollegeIp.trim();
    const assignedCode = newCollegeCode.trim().replace(/\D/g, '') || `44${Math.floor(10 + Math.random() * 90)}`;

    if (editingDeptId) {
      // تعديل واستبدال الكلية الحالية
      const updated = departments.map(d => {
        if (d.id === editingDeptId) {
          return {
            ...d,
            name: cleanName,
            annualFeeMorning: Number(newCollegeMorningFee) || 4000000,
            annualFeeEvening: Number(newCollegeEveningFee) || 5000000,
            durationYears: Number(newCollegeYears) || 4,
            availableSeats: Number(newCollegeSeats) || 100
          };
        }
        return d;
      });
      setDepartments(updated);
      syncDepartments(updated);

      const deanRole = `head_${editingDeptId}`;
      const updatedRoles = rolesList.map(r => {
        if (r.departmentId === editingDeptId || r.role === deanRole) {
          const currentDept = departments.find(d => d.id === editingDeptId);
          const deanName = currentDept?.headOfDepartment && currentDept.headOfDepartment !== 'شاغر' 
            ? currentDept.headOfDepartment 
            : 'شاغر';
          return {
            ...r,
            title: `عميد ${cleanName} (${deanName})`,
            defaultCode: newCollegeCode.trim() ? assignedCode : r.defaultCode
          };
        }
        return r;
      });
      syncRolesList(updatedRoles);

      if (newCollegeCode.trim()) {
        const updatedCodes = { ...roleCodes, [deanRole]: assignedCode };
        syncRoleCodes(updatedCodes);
      }

      setCollegeIps(prev => {
        const copy = { ...prev, [editingDeptId]: cleanIp };
        localStorage.setItem('AL_AHLIYA_COLLEGE_IPS', JSON.stringify(copy));
        return copy;
      });

      setEditingDeptId(null);
      addAuditLog('college_update', 'تعديل بيانات كلية', `تم تعديل بيانات كلية [${cleanName}] بنجاح`);
    } else {
      // إضافة كلية جديدة بالكامل
      const newId = `dept-${Date.now()}`;
      const deanRole = `head_${newId}`;
      
      const newDept: Department = {
        id: newId,
        name: cleanName,
        college: receiptUniversityName || 'جامعة الكوت الأهلية',
        annualFeeMorning: Number(newCollegeMorningFee) || 4000000,
        annualFeeEvening: Number(newCollegeEveningFee) || 5000000,
        durationYears: Number(newCollegeYears) || 4,
        headOfDepartment: 'شاغر',
        availableSeats: Number(newCollegeSeats) || 100,
        totalEnrolled: 0
      };

      const updated = [...departments, newDept];
      setDepartments(updated);
      syncDepartments(updated);

      // إضافة الدور في قائمة الأدوار فوراً
      const newDeanRoleItem = {
        role: deanRole,
        title: `عميد ${cleanName} (شاغر)`,
        categoryName: 'عميد كلية',
        defaultCode: assignedCode,
        departmentId: newId,
        isCustom: true
      };
      const updatedRoles = [...rolesList, newDeanRoleItem];
      syncRolesList(updatedRoles);

      // تعيين وحفظ رمز الدخول
      const updatedCodes = { ...roleCodes, [deanRole]: assignedCode };
      syncRoleCodes(updatedCodes);

      setCollegeIps(prev => {
        const copy = { ...prev, [newId]: cleanIp };
        localStorage.setItem('AL_AHLIYA_COLLEGE_IPS', JSON.stringify(copy));
        return copy;
      });

      addAuditLog('college_add', 'إضافة كلية جديدة', `تم تسجيل وإضافة كلية/قسم جديد [${cleanName}] برمز دخول (${assignedCode}) ومحطة رقمية [${cleanIp}]`);
    }

    setInAppToasts(prev => [
      {
        id: `toast-${Date.now()}`,
        title: editingDeptId ? 'تعديل الكلية' : 'إضافة كلية جديدة',
        message: `✓ تم بنجاح ${editingDeptId ? 'تعديل' : 'إضافة'} كلية "${cleanName}" برمز دخول (${assignedCode}) ومحطتها الرقمية (${cleanIp}) في النظام.`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      },
      ...prev
    ]);

    // إعادة ضبط الحقول
    setNewCollegeName('');
    setNewCollegeIp('');
    setNewCollegeCode('');
    setNewCollegeMorningFee(4000000);
    setNewCollegeEveningFee(5000000);
    setNewCollegeYears(4);
    setNewCollegeSeats(100);
  };

  // 🏢 معالجة حفظ أو تعديل الأقسام والمديريات الإدارية والخدمية (غير التدريسية)
  const handleSaveAdminDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'admin') {
      alert('⚠️ خطأ: هذه الصلاحية حصرية لمدير النظام الفعال فقط!');
      return;
    }
    if (!adminDeptName.trim()) {
      alert('⚠️ يرجى كتابة اسم القسم أو المديرية الإدارية!');
      return;
    }
    const cleanName = adminDeptName.trim();
    const cleanManager = adminDeptManager.trim() || 'المسؤول الإداري';
    const cleanCategory = adminDeptCategory.trim() || 'شؤون إدارية وخدمات';
    const cleanIp = adminDeptIp.trim() || '192.168.1.50';
    const assignedCode = adminDeptCode.trim().replace(/\D/g, '') || `33${Math.floor(10 + Math.random() * 90)}`;

    if (editingAdminDeptId) {
      const updated = adminDepts.map(ad => {
        if (ad.id === editingAdminDeptId) {
          return {
            ...ad,
            name: cleanName,
            manager: cleanManager,
            category: cleanCategory,
            ip: cleanIp,
            defaultCode: assignedCode
          };
        }
        return ad;
      });
      syncAdminDepts(updated);

      const targetDept = adminDepts.find(ad => ad.id === editingAdminDeptId);
      const roleKey = targetDept?.role || `admin_dept_${editingAdminDeptId}`;
      const updatedRoles = rolesList.map(r => {
        if (r.role === roleKey) {
          return {
            ...r,
            title: `${cleanName} (${cleanManager})`,
            defaultCode: assignedCode
          };
        }
        return r;
      });
      syncRolesList(updatedRoles);
      const updatedCodes = { ...roleCodes, [roleKey]: assignedCode };
      syncRoleCodes(updatedCodes);

      setEditingAdminDeptId(null);
      addAuditLog('admin_dept_update', 'تعديل قسم إداري', `تم تعديل بيانات [${cleanName}] بنجاح`);
    } else {
      const newId = `ad-${Date.now()}`;
      const roleKey = `admin_dept_${newId}`;
      const newDept: AdminDepartment = {
        id: newId,
        name: cleanName,
        manager: cleanManager,
        category: cleanCategory,
        ip: cleanIp,
        role: roleKey,
        defaultCode: assignedCode
      };
      const updated = [...adminDepts, newDept];
      syncAdminDepts(updated);

      const newRoleItem = {
        role: roleKey,
        title: `${cleanName} (${cleanManager})`,
        categoryName: 'قسم إداري / خدمي',
        defaultCode: assignedCode,
        isCustom: true
      };
      syncRolesList([...rolesList, newRoleItem]);
      syncRoleCodes({ ...roleCodes, [roleKey]: assignedCode });
      addAuditLog('admin_dept_add', 'إضافة قسم إداري', `تمت إضافة القسم الإداري/الخدمي [${cleanName}] برمز دخول (${assignedCode}) ومحطة [${cleanIp}]`);
    }

    setInAppToasts(prev => [
      {
        id: `toast-${Date.now()}`,
        title: editingAdminDeptId ? 'تعديل قسم إداري' : 'إضافة قسم إداري',
        message: `✓ تم بنجاح ${editingAdminDeptId ? 'تعديل' : 'إضافة'} القسم الإداري/الخدمي "${cleanName}" برمز (${assignedCode}) بالنظام.`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      },
      ...prev
    ]);

    setAdminDeptName('');
    setAdminDeptManager('');
    setAdminDeptIp('');
    setAdminDeptCode('');
  };

  const handleDeleteAdminDept = (id: string) => {
    if (currentRole !== 'admin') return;
    const target = adminDepts.find(ad => ad.id === id);
    if (!target) return;
    if (window.confirm(`هل أنت متأكد من حذف القسم الإداري "${target.name}" نهائياً من النظام؟`)) {
      const updated = adminDepts.filter(ad => ad.id !== id);
      syncAdminDepts(updated);
      const roleKey = target.role || `admin_dept_${id}`;
      syncRolesList(rolesList.filter(r => r.role !== roleKey));
      const updatedCodes = { ...roleCodes };
      delete updatedCodes[roleKey];
      syncRoleCodes(updatedCodes);
      addAuditLog('admin_dept_delete', 'حذف قسم إداري', `تم حذف القسم الإداري [${target.name}]`);
      setInAppToasts(prev => [
        {
          id: `toast-${Date.now()}`,
          title: 'حذف قسم إداري',
          message: `✓ تم حذف "${target.name}" من التشكيلات الإدارية.`,
          type: 'info',
          timestamp: new Date().toLocaleTimeString('ar-IQ')
        },
        ...prev
      ]);
    }
  };

  // 👨‍🏫 معالجة حفظ وتعديل رؤساء الأقسام العلمية والأكاديمية
  const handleSaveAcademicSubDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'admin') {
      alert('⚠️ خطأ: هذه الصلاحية حصرية لمدير النظام الفعال فقط!');
      return;
    }
    if (!subDeptName.trim() || !subDeptCollegeId) {
      alert('⚠️ يرجى كتابة اسم القسم العلمي واختيار الكلية التابع لها!');
      return;
    }
    const cleanName = subDeptName.trim();
    const cleanHead = subDeptHeadName.trim() || 'شاغر';
    const cleanIp = subDeptIp.trim() || '192.168.10.50';
    const assignedCode = subDeptCode.trim().replace(/\D/g, '') || `45${Math.floor(10 + Math.random() * 90)}`;
    const matchedCollege = departments.find(d => d.id === subDeptCollegeId);

    if (editingSubDeptId) {
      const updated = academicSubDepts.map(s => {
        if (s.id === editingSubDeptId) {
          return {
            ...s,
            name: cleanName,
            collegeId: subDeptCollegeId,
            collegeName: matchedCollege?.name,
            headName: cleanHead,
            ip: cleanIp,
            defaultCode: assignedCode
          };
        }
        return s;
      });
      syncAcademicSubDepts(updated);

      const targetSub = academicSubDepts.find(s => s.id === editingSubDeptId);
      const roleKey = targetSub?.role || `head_sub_${editingSubDeptId}`;
      const updatedRoles = rolesList.map(r => {
        if (r.role === roleKey) {
          return {
            ...r,
            title: `رئيس ${cleanName} (${cleanHead})`,
            departmentId: subDeptCollegeId,
            defaultCode: assignedCode
          };
        }
        return r;
      });
      syncRolesList(updatedRoles);
      const updatedCodes = { ...roleCodes, [roleKey]: assignedCode };
      syncRoleCodes(updatedCodes);

      setEditingSubDeptId(null);
      addAuditLog('subdept_update', 'تعديل قسم علمي', `تم تعديل بيانات القسم الأكاديمي [${cleanName}] بنجاح`);
    } else {
      const newId = `sub-${Date.now()}`;
      const roleKey = `head_sub_${newId}`;
      const newSub: AcademicSubDepartment = {
        id: newId,
        name: cleanName,
        collegeId: subDeptCollegeId,
        collegeName: matchedCollege?.name,
        headName: cleanHead,
        ip: cleanIp,
        role: roleKey,
        defaultCode: assignedCode
      };
      const updated = [...academicSubDepts, newSub];
      syncAcademicSubDepts(updated);

      const newRoleItem = {
        role: roleKey,
        title: `رئيس ${cleanName} (${cleanHead})`,
        categoryName: 'رئيس قسم علمي',
        departmentId: subDeptCollegeId,
        defaultCode: assignedCode,
        isCustom: true
      };
      syncRolesList([...rolesList, newRoleItem]);
      syncRoleCodes({ ...roleCodes, [roleKey]: assignedCode });
      addAuditLog('subdept_add', 'إضافة قسم علمي', `تمت إضافة وتعيين رئيس القسم العلمي [${cleanName}] برمز دخول (${assignedCode})`);
    }

    setInAppToasts(prev => [
      {
        id: `toast-${Date.now()}`,
        title: editingSubDeptId ? 'تعديل قسم علمي' : 'إضافة قسم علمي',
        message: `✓ تم بنجاح ${editingSubDeptId ? 'تعديل' : 'إضافة'} القسم العلمي "${cleanName}" برمز (${assignedCode}) بالنظام.`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      },
      ...prev
    ]);

    setSubDeptName('');
    setSubDeptHeadName('');
    setSubDeptIp('');
    setSubDeptCode('');
  };

  const handleDeleteAcademicSubDept = (id: string) => {
    if (currentRole !== 'admin') return;
    const target = academicSubDepts.find(s => s.id === id);
    if (!target) return;
    if (window.confirm(`هل أنت متأكد من حذف القسم الأكاديمي ورئيس القسم "${target.name}" نهائياً من النظام؟`)) {
      const updated = academicSubDepts.filter(s => s.id !== id);
      syncAcademicSubDepts(updated);
      const roleKey = target.role || `head_sub_${id}`;
      syncRolesList(rolesList.filter(r => r.role !== roleKey));
      const updatedCodes = { ...roleCodes };
      delete updatedCodes[roleKey];
      syncRoleCodes(updatedCodes);
      addAuditLog('subdept_delete', 'حذف قسم علمي', `تم حذف القسم الأكاديمي [${target.name}]`);
      setInAppToasts(prev => [
        {
          id: `toast-${Date.now()}`,
          title: 'حذف قسم علمي',
          message: `✓ تم حذف "${target.name}" من كشف الأقسام العلمية.`,
          type: 'info',
          timestamp: new Date().toLocaleTimeString('ar-IQ')
        },
        ...prev
      ]);
    }
  };

  // مصفوفات تصفية السجلات حسب صلاحيات الدور الفعال (عميد الكلية يرى ويطابق قسمه فقط)
  const filteredStudentsForRole = currentRoleConfig?.departmentId 
    ? students.filter(s => s.departmentId === currentRoleConfig.departmentId)
    : students;

  const filteredPaymentsForRole = currentRoleConfig?.departmentId
    ? payments.filter(p => {
        const matchingStu = students.find(s => s.id === p.studentId);
        return matchingStu ? matchingStu.departmentId === currentRoleConfig.departmentId : false;
      })
    : payments;

  const filteredDepartmentsForRole = currentRoleConfig?.departmentId
    ? departments.filter(d => d.id === currentRoleConfig.departmentId)
    : departments;

  // 2. مزامنة البيانات تلقائياً مع المتصفح عند تعديلها
  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_ROLE_CODES', JSON.stringify(roleCodes));
  }, [roleCodes]);

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('AL_AHLIYA_CURRENT_ROLE', currentRole);
    } else {
      localStorage.removeItem('AL_AHLIYA_CURRENT_ROLE');
    }
  }, [currentRole]);

  useEffect(() => {
    if (currentRole === 'admin' || currentRole === 'registration_director') {
      const timer = setTimeout(() => {
        triggerDocumentExpiryPushNotifications(true); // فحص صامت وتوليد تلقائي فوري للتنبيهات عند الدخول
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_ALERTS_ENABLED', String(alertsEnabled));
  }, [alertsEnabled]);

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_DEPARTMENTS', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_STUDENTS', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_PAYMENTS', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_LETTERS', JSON.stringify(letters));
  }, [letters]);

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_COMMS', JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    if (selectedStudentId) {
      localStorage.setItem('AL_AHLIYA_SELECTED_STU', selectedStudentId);
    } else {
      localStorage.removeItem('AL_AHLIYA_SELECTED_STU');
    }
  }, [selectedStudentId]);

  // دعم الكتابة المباشرة بلوحة مفاتيح الحاسوب الحقيقية لتسهيل تسجيل الدخول بالرمز
  useEffect(() => {
    if (currentRole) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentRole) return;
      
      const key = e.key;
      
      if (/^[0-9]$/.test(key)) {
        if (enteredCode.length < 6) {
          setEnteredCode(prev => prev + key);
          setLoginError(null);
        }
      } else if (key === 'Backspace') {
        setEnteredCode(prev => prev.slice(0, -1));
        setLoginError(null);
      } else if (key === 'Enter') {
        // فحص ومطابقة الرمز تلقائياً عند الضغط على Enter
        const matchingRole = rolesList.find(cfg => {
          const savedCode = roleCodes[cfg.role] || cfg.defaultCode;
          return savedCode === enteredCode;
        });

        if (matchingRole) {
          setCurrentRole(matchingRole.role);
          setEnteredCode('');
          setLoginError(null);
        } else if (enteredCode === '9999') {
          setCurrentRole('admin');
          setEnteredCode('');
          setLoginError(null);
        } else if (enteredCode.length > 0) {
          setLoginError('الرمز المدخل غير صحيح! يرجى إعادة المحاولة.');
        }
      } else if (key === 'Escape') {
        setEnteredCode('');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentRole, enteredCode, rolesList, roleCodes]);

  // 3. دوال التعديل على الحالة (State Modifiers)
  
  // تسجيل طالب جديد
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => { const arr = [newStudent, ...prev]; syncStudents(arr); return arr; });
    
    // تحديث المقاعد المشغولة بالقسم تلقائياً
    setDepartments(prev => { const arr = prev.map(dept => {
      if (dept.id === newStudent.departmentId) {
        return {
          ...dept,
          totalEnrolled: dept.totalEnrolled + 1
        };
      }
      return dept;
    }); syncDepartments(arr); return arr; });

    const deptObj = departments.find(d => d.id === newStudent.departmentId);
    addAuditLog('student_add', 'تسجيل وقبول طالب جديد', `تم تسجيل وقبول الطالب [${newStudent.name}] بكود [${newStudent.id}] بكلية [${deptObj?.name || newStudent.departmentId}] وشعبة [${newStudent.shift === 'morning' ? 'صباحي' : 'مسائي'}]`);
  };

  // حذف طالب (حصراً للأدمن)
  const handleDeleteStudent = (id: string) => {
    if (currentRole !== 'admin') {
      alert('⚠️ إجراء مرفوض: خاصية حذف وشطب قيود الطلبة مصرحة حصراً لمدير النظام (الأدمن)!');
      return;
    }
    const targetStudent = students.find(s => s.id === id);
    addAuditLog('student_delete', 'إلغاء وشطب قيد طالب مالي', `تم كلياً شطب وإلغاء قيد الطالب [${targetStudent?.name}] الكود الجاري [${id}] مع مسح كافة الوصولات المبرمة لتصفية السلسة الحسابية في النظام الموحد`);
    setStudents(prev => { const arr = prev.filter(s => s.id !== id); syncStudents(arr); return arr; });
    
    // تحرير المقعد في القسم
    if (targetStudent) {
      setDepartments(prev => { const arr = prev.map(dept => {
        if (dept.id === targetStudent.departmentId) {
          return {
            ...dept,
            totalEnrolled: Math.max(0, dept.totalEnrolled - 1)
          };
        }
        return dept;
      }); syncDepartments(arr); return arr; });
    }

    // حذف كافة وصولات الدفع التي تخص هذا الطالب لتنظيف السلسلة الحسابية
    setPayments(prev => prev.filter(p => p.studentId !== id));

    if (selectedStudentId === id) {
      setSelectedStudentId(mockStudents[0]?.id || null);
    }
  };

  // إضافة معاملة قبض مالي (وصل جديد)
  const handleAddPayment = (newPayment: Payment) => {
    setPayments(prev => [newPayment, ...prev]);
    addAuditLog('receipt_add', 'ترحيل وإصدار وصل مالي', `إصدار وترحيل رسم المقبوضات رقم [${newPayment.receiptNumber}] بقيمة [${newPayment.amount.toLocaleString()}] د.ع للطالب [${newPayment.studentName}] بند [${newPayment.category === 'tuition' ? 'الأقساط الدراسية' : 'رسوم التسجيل والخدمات'}]`);

    // إذا كان بند المقبوض هو قسط تسجيل أولي، يمكن تحديث حالة الطالب ليصبح "نشط" فوراً
    if (newPayment.category === 'tuition' || newPayment.category === 'registration_fee') {
      setStudents(prev => { const arr = prev.map(student => {
        if (student.id === newPayment.studentId && student.status === 'pending_documents') {
          return {
            ...student,
            status: 'active'
          };
        }
        return student;
      }); syncStudents(arr); return arr; });
    }
  };

  // أرشفة كتاب رسمي جديد (مستقل ومحفوظ بشكل دائم في خزانة الكتب والقرارات)
  const handleAddLetter = (newLetter: OfficialLetter) => {
    const newArr = [newLetter, ...letters].slice(0, 2000);
    setLetters(newArr);
    try {
      localStorage.setItem('AL_AHLIYA_LETTERS', JSON.stringify(newArr));
      setDoc(doc(db, "appData", "letters"), { list: newArr }).catch(console.error);
    } catch (e) {}
  };

  // حذف كتاب أو وثيقة فردية من الأرشيف (حصراً للأدمن)
  const handleDeleteLetter = (id: string) => {
    if (currentRole !== 'admin') {
      alert('⚠️ إجراء مرفوض: خاصية حذف الكتب والوثائق الرسمية مصرحة حصراً لمدير النظام (الأدمن)!');
      return;
    }
    setLetters(prev => {
      const updated = prev.filter(l => l.id !== id);
      try {
        localStorage.setItem('AL_AHLIYA_LETTERS', JSON.stringify(updated));
        setDoc(doc(db, "appData", "letters"), { list: updated }).catch(console.error);
      } catch (e) {}
      return updated;
    });
    setInAppToasts(prev => [
      {
        id: `toast-${Date.now()}`,
        title: 'حذف وثيقة',
        message: '✓ تم حذف الوثيقة بنجاح من الأرشيف وقاعدة البيانات.',
        type: 'info',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      },
      ...prev
    ]);
  };

  // تفريغ ومسح كافة الكتب المؤرشفة من قاعدة البيانات (حصراً للأدمن)
  const handleClearAllLetters = () => {
    if (currentRole !== 'admin') {
      alert('⚠️ إجراء مرفوض: خاصية تفريغ وحذف أرشيف الكتب مصرحة حصراً لمدير النظام (الأدمن)!');
      return;
    }
    if (window.confirm('⚠️ تحذير: هل أنت متأكد من رغبتك في تفريغ وحذف كافة الكتب والوثائق من الأرشيف وقاعدة البيانات نهائياً؟')) {
      setLetters([]);
      try {
        localStorage.setItem('AL_AHLIYA_LETTERS', JSON.stringify([]));
        setDoc(doc(db, "appData", "letters"), { list: [] }).catch(console.error);
        addAuditLog('letters_clear', 'تصفير الأرشيف', 'تم مسح وتفريغ كافة الوثائق والكتب المؤرشفة من قاعدة البيانات');
      } catch (e) {}
      setInAppToasts(prev => [
        {
          id: `toast-${Date.now()}`,
          title: 'تفريغ الأرشيف',
          message: '✓ تم تفريغ ومسح كافة الكتب المؤرشفة من قاعدة البيانات بنجاح.',
          type: 'success',
          timestamp: new Date().toLocaleTimeString('ar-IQ')
        },
        ...prev
      ]);
    }
  };

  const handleSendMessage = (newMessage: InternalMessage) => {
    // الاحتفاظ بآخر 2000 رسالة لضمان استيعاب ضخم وأرشيف واسع لكافة الأقسام والمراسلات الجامعية
    const newArray = [newMessage, ...messages].slice(0, 2000);
    setMessages(newArray);
    
    setDoc(doc(db, "appData", "messages"), { list: newArray }).then(() => {
      console.log('Message synced');
    }).catch((e) => {
      console.error(e);
      alert('تعذر إرسال الرسالة السحابية. قد يكون حجم المرفق كبيراً جداً.');
    });
  };

  // حذف رسالة فردية (حصراً للأدمن)
  const handleDeleteMessage = (id: string) => {
    if (currentRole !== 'admin') {
      alert('⚠️ إجراء مرفوض: خاصية حذف الرسائل مصرحة حصراً لمدير النظام (الأدمن)!');
      return;
    }
    setMessages(prev => {
      const updated = prev.filter(m => m.id !== id);
      try {
        localStorage.setItem('AL_AHLIYA_COMMS', JSON.stringify(updated));
        setDoc(doc(db, "appData", "messages"), { list: updated }).catch(console.error);
      } catch (e) {}
      return updated;
    });
    setInAppToasts(prev => [
      {
        id: `toast-${Date.now()}`,
        title: 'حذف رسالة',
        message: '✓ تم حذف الرسالة بنجاح من الصندوق والسحابة.',
        type: 'info',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      },
      ...prev
    ]);
  };

  // تفريغ ومسح كافة الرسائل (حصراً للأدمن)
  const handleClearAllMessages = () => {
    if (currentRole !== 'admin') {
      alert('⚠️ إجراء مرفوض: خاصية تفريغ وحذف الرسائل والمراسلات مصرحة حصراً لمدير النظام (الأدمن)!');
      return;
    }
    if (window.confirm('⚠️ هل أنت متأكد من رغبتك في تفريغ وحذف كافة الرسائل والمراسلات الداخلية نهائياً؟')) {
      setMessages([]);
      try {
        localStorage.setItem('AL_AHLIYA_COMMS', JSON.stringify([]));
        setDoc(doc(db, "appData", "messages"), { list: [] }).catch(console.error);
        addAuditLog('comms_clear', 'تصفير المراسلات', 'تم مسح وتفريغ كافة الرسائل والمراسلات الداخلية بالنظام');
      } catch (e) {}
      setInAppToasts(prev => [
        {
          id: `toast-${Date.now()}`,
          title: 'تفريغ المراسلات',
          message: '✓ تم مسح وتفريغ كافة الرسائل الداخلية بنجاح.',
          type: 'success',
          timestamp: new Date().toLocaleTimeString('ar-IQ')
        },
        ...prev
      ]);
    }
  };

  // إعادة تهيئة قاعدة البيانات بالقيم الأساسية لسهولة التحرير والتثبيت
  const handleResetData = () => {
    if (currentRole !== 'admin') {
      alert('❌ عذراً، وظيفة إعادة تهيئة مخزن البيانات مقتصرة فقط على صلاحيات حساب مدير النظام العام!');
      return;
    }
    if (confirm('هل أنت متأكد من إعادة تهيئة كافة السجلات وتصفير التعديلات للقيم الافتراضية للجامعة؟\nسيتم حذف الوصولات والقرارات التي أضفتها.')) {
      localStorage.clear();
      syncDepartments(mockDepartments);
      syncStudents(mockStudents);
      setPayments(mockPayments);
      setLetters(mockLetters);
      setMessages(mockMessages);
      setSelectedStudentId(mockStudents[0]?.id || null);
      setActiveTab('students');
      alert('تمت إعادة التهيئة بنجاح!');
    }
  };

  // هيكلية التبويبات باللغة العربية مع الأيقونات المرادفة
  const unreadMessagesCount = messages.filter(m => {
    if (!currentRole) return false;
    if (m.sender === currentRole) return false;
    const isRecipient = m.recipients.includes(currentRole) || m.recipients.includes('all_departments');
    if (!isRecipient) return false;
    return !m.readBy?.includes(currentRole);
  }).length;

  useEffect(() => {
    if ((activeTab === 'comms' || activeTab === 'labs_portal') && unreadMessagesCount > 0 && currentRole) {
      const updatedList = messages.map(m => {
        const isRecipient = m.recipients.includes(currentRole) || m.recipients.includes('all_departments');
        if (m.sender !== currentRole && isRecipient && !m.readBy?.includes(currentRole)) {
          return { ...m, readBy: [...(m.readBy || []), currentRole] };
        }
        return m;
      });
      setDoc(doc(db, "appData", "messages"), { list: updatedList }, { merge: true }).catch(console.error);
    }
  }, [activeTab, messages, currentRole, unreadMessagesCount]);

  const menuItems = [
    
    { id: 'students', label: 'شؤون وتسجيل الطلبة', icon: Users, badge: filteredStudentsForRole.filter(s => s.status === 'pending_documents').length },
    { id: 'portal', label: 'بوابة وقسم الطالب', icon: GraduationCap },
    { id: 'finance', label: 'قسم الحسابات والقبض المالي', icon: CreditCard },
    { id: 'letters', label: 'أرشيف الكتب والقرارات', icon: FolderLock, badge: letters.filter(l => l.status === 'expired' || l.status === 'expiring_soon').length },
    { id: 'comms', label: 'التواصل والخطوط الداخلية', icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
    { id: 'python', label: 'كود بايثون المتكامل للعميل', icon: Terminal },
    ...(currentRole === 'admin' ? [
      { id: 'admin_security', label: 'التحكم الإداري والأمني 🛡️', icon: ShieldAlert },
      { id: 'audit_log', label: 'سجل العمليات والمراقبة 🔒', icon: Database }
    ] : [])
  ];

  const allowedTabs = (() => {
    if (!currentRole) return [];
    // 🛡️ مدير النظام الأول ورئاسة الجامعة فقط هم من يمتلكون صلاحية الوصول لأرشيف الكتب والقرارات
    if (currentRole === 'admin') return ['students', 'portal', 'finance', 'letters', 'comms', 'python', 'admin_security', 'audit_log'];
    if (currentRole === 'presidency') return ['students', 'portal', 'finance', 'letters', 'comms', 'audit_log'];
    // 🎓 شؤون وتسجيل الطلبة (محجوب عنها أرشيف الكتب تماماً بناءً على التوجيه الإداري)
    if (currentRole === 'registration_director') return ['students', 'portal', 'comms'];
    // 💰 المالية والحسابات
    if (currentRole === 'finance_director') return ['finance', 'portal', 'comms'];
    // 🧪 المختبرات المركزية
    if (currentRole === 'labs_director') return ['portal', 'comms'];
    // 🏛️ عمداء الكليات (رئاسة القسم العلمي)
    if (currentRole.startsWith('head_')) return ['students', 'portal', 'comms'];
    return ['students', 'portal', 'comms'];
  })();

  const filteredMenuItems = menuItems.filter(item => allowedTabs.includes(item.id));

  const renderActiveComponent = () => {
    const safeTab = getSafeActiveTab();
    switch (safeTab) {
      case 'students':
        return (
          <StudentList 
            students={filteredStudentsForRole}
            departments={filteredDepartmentsForRole}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            onSelectStudent={setSelectedStudentId}
            setActiveTab={setActiveTab}
            currentRole={currentRole}
            onAddPayment={handleAddPayment}
          />
        );
      case 'audit_log':
        return (
          <AuditLog 
            logs={auditLogs}
            onClearLogs={() => {
              if (window.confirm('⚠️ تحذير سيادي حرج: هل أنت متأكد من مسح وتصفير كافة السجلات الأمنية وسجل العمليات تماماً؟')) {
                setAuditLogs([]);
                addAuditLog('system_reset', 'تصفير سجل العمليات', 'قام مدير النظام الأمني الأول بمسح كامل أرشيف العمليات والمراقبة وحفظ ملف مفرّغ');
              }
            }}
            currentRole={currentRole}
          />
        );
      case 'portal':
        return (
          <StudentPortal 
            students={filteredStudentsForRole}
            departments={filteredDepartmentsForRole}
            payments={filteredPaymentsForRole}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            setActiveTab={setActiveTab}
            universityName={headerCollegeAr}
            subText={headerOfficeAr}
            noteText={receiptNoteText}
            headerConfig={headerConfig}
          />
        );
      case 'finance':
        return (
          <FinancePortal 
            students={filteredStudentsForRole}
            payments={filteredPaymentsForRole}
            departments={filteredDepartmentsForRole}
            onAddPayment={handleAddPayment}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            setActiveTab={setActiveTab}
            universityName={headerCollegeAr}
            subText={headerOfficeAr}
            noteText={receiptNoteText}
            headerConfig={headerConfig}
          />
        );
      case 'letters':
        // 🔒 حظر أمني مشدد: الأرشيف مصرح فقط لمدير النظام الأول ورئاسة الجامعة
        if (currentRole !== 'admin' && currentRole !== 'presidency') {
          return (
            <div className="p-8 text-center bg-white rounded-2xl border border-red-200 shadow-sm space-y-3">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
              <h3 className="text-base font-extrabold text-slate-800">صلاحية محظورة أمنياً ⚠️</h3>
              <p className="text-xs text-slate-600 font-bold">أرشيف الكتب والقرارات الرسمية مصرح حصراً لـ [مدير النظام الأول] و [رئاسة الجامعة].</p>
              <p className="text-[11px] text-slate-400">لا تملك شعبة شؤون وتسجيل الطلبة أو الأقسام الأخرى صلاحية الاطلاع على هذه الخزانة.</p>
            </div>
          );
        }
        return (
          <LettersArchive 
            letters={letters}
            onAddLetter={handleAddLetter}
            onDeleteLetter={handleDeleteLetter}
            onClearAllLetters={handleClearAllLetters}
            setActiveTab={setActiveTab}
            universityName={headerCollegeAr}
            universityEmail={receiptUniversityEmail}
            headerConfig={headerConfig}
            currentRole={currentRole}
          />
        );
      case 'labs_portal':
        return (
          <LabsPortal 
            messages={messages}
            letters={letters}
            onSendMessage={handleSendMessage}
            setActiveTab={setActiveTab}
            rolesList={rolesList}
          />
        );
      case 'comms':
        return (
          <InternalComms 
            messages={messages}
            letters={letters}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onClearAllMessages={handleClearAllMessages}
            onAddLetter={handleAddLetter}
            setActiveTab={setActiveTab}
            currentRole={currentRole}
            rolesList={rolesList}
            universityName={receiptUniversityName}
            universityEmail={receiptUniversityEmail}
          />
        );
      case 'python':
        return <PythonCodeViewer />;
      case 'admin_security':
        return (
          <div className="space-y-6 text-right">
            <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-6">
              
              {/* ترويسة رئيسية */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-8 h-8 text-amber-600 animate-pulse shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">بوابة مدير النظام الأول للتحكم الأمني والموظفين والبريد المركزي</h3>
                    <p className="text-slate-700 text-xs mt-0.5">صلاحيات سيادية كاملة لإضافة وحذف الكوادر، تخصيص رموز المرور، وإدارة إنذارات الطلبة</p>
                  </div>
                </div>
              </div>

              {/* تبويبات الإدارة الفرعية السلسة */}
              <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
                <button
                  onClick={() => setAdminSubTab('deans')}
                  className={`px-4 py-2.5 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    adminSubTab === 'deans'
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🎓 عمادات الكليات</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                    {departments.length}
                  </span>
                </button>

                <button
                  onClick={() => setAdminSubTab('dept_heads')}
                  className={`px-4 py-2.5 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    adminSubTab === 'dept_heads'
                      ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>👨‍🏫 رؤساء الأقسام العلمية</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                    {academicSubDepts.length}
                  </span>
                </button>

                <button
                  onClick={() => setAdminSubTab('admin_depts')}
                  className={`px-4 py-2.5 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    adminSubTab === 'admin_depts'
                      ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🏢 الأقسام الإدارية والخدمية</span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                    {adminDepts.length}
                  </span>
                </button>

                <button
                  onClick={() => setAdminSubTab('passcodes')}
                  className={`px-4 py-2.5 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'passcodes'
                      ? 'border-amber-600 text-amber-600 bg-amber-50/50 rounded-t-xl'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚙️ رموز الدخول وتجربة الصلاحيات
                </button>

                <button
                  onClick={() => setAdminSubTab('employees')}
                  className={`px-4 py-2.5 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'employees'
                      ? 'border-amber-600 text-amber-600 bg-amber-50/50 rounded-t-xl'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👥 حسابات الموظفين والكوادر
                </button>

                <button
                  onClick={() => setAdminSubTab('receipt_settings')}
                  className={`px-4 py-2.5 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    adminSubTab === 'receipt_settings'
                      ? 'border-amber-600 text-amber-600 bg-amber-50/50 rounded-t-xl'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🏛️ تخصيص ترويسة الباركود واللوغو والوثائق ⚙️</span>
                </button>

                <button
                  onClick={() => setAdminSubTab('network_settings')}
                  className={`px-4 py-2.5 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'network_settings'
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-xl'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌐 تخصيص حالة الربط والشبكة
                </button>
              </div>

              {/* محتوى التبويبات */}

              {/* 1. 🎓 عمادات الكليات */}
              {adminSubTab === 'deans' && (
                <div className="space-y-6 animate-fade-in text-right">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* أ) فورم تكليف عميد جديد */}
                    <form 
                      onSubmit={handleAddOrUpdateDean} 
                      className="lg:col-span-6 bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="space-y-2 border-b border-slate-100 pb-3">
                        <h4 className="font-black text-sm text-emerald-700 flex items-center gap-2">
                          <Building className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>تخويل وتعيين عميد الكلية والرموز السرية 🔑</span>
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-medium">
                          اختر كلية معتمدة وعيّن عميدها الرباعي وكود دخولها الموحد لتفعيل حسابها وصلاحياتها الأمنية.
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-slate-800 block">الكلية الأكاديمية المستهدفة:</label>
                          <select
                            required
                            value={formDeanDept}
                            onChange={(e) => setFormDeanDept(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl cursor-pointer outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-bold"
                          >
                            <option value="">-- اختر الكلية لتعيين عميدها --</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name} (IP: {collegeIps[d.id] || 'N/A'})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-slate-800 block">اسم عميد الكلية الرباعي واللقب:</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: أ.د. ضياء عبد اللطيف السعدي"
                            value={formDeanName}
                            onChange={(e) => setFormDeanName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder-slate-400 font-bold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-slate-800 block">رمز دخول الكلية السري (قفل أمني رقمي):</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="مثال: 4425"
                            value={formDeanCode}
                            onChange={(e) => setFormDeanCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 font-mono text-center rounded-xl text-emerald-700 font-black tracking-widest outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>تنشيط الرمز السري وحاسبة الـ IP للكلية 📡</span>
                        </button>
                      </div>
                    </form>

                    {/* ب) فورم إضافة/تعديل واستبدال الكلية وحاسبتها الفردية */}
                    <form 
                      onSubmit={handleSaveCollegeAndStation} 
                      className="lg:col-span-6 bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="space-y-2 border-b border-slate-100 pb-3">
                        <h4 className="font-black text-sm text-blue-700 flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-blue-600 shrink-0" />
                          <span>
                            {editingDeptId 
                              ? `📝 تعديل واستبدال بيانات كرت الكلية وحاسبتها الأمنية` 
                              : `✨ تسجيل كرت كلية جديد ومحطة الـ IP بالسيرفر`
                            }
                          </span>
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-medium">
                          أدخل اسم الكلية، وعنوان حاسبتها المخصصة لربطها فورياً بالسيرفر وتحديد قيم أقساط الرسوم المحددة لها.
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-800 block">اسم الكلية الأكاديمية:</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: كلية الذكاء الاصطناعي"
                              value={newCollegeName}
                              onChange={(e) => setNewCollegeName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold placeholder-slate-400"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-800 block">عنوان حاسبوها IP VLAN:</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: 192.168.12.15"
                              value={newCollegeIp}
                              onChange={(e) => setNewCollegeIp(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 font-mono text-center rounded-xl text-blue-700 font-black outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-800 block">قسط الدراسة الصباحية (د.ع):</label>
                            <input
                              type="number"
                              required
                              value={newCollegeMorningFee}
                              onChange={(e) => setNewCollegeMorningFee(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 text-center font-black rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-800 block">قسط الدراسة المسائية (د.ع):</label>
                            <input
                              type="number"
                              required
                              value={newCollegeEveningFee}
                              onChange={(e) => setNewCollegeEveningFee(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 text-center font-black rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-800 block">عدد سنوات الدراسة في الكلية:</label>
                            <input
                              type="number"
                              required
                              min={1}
                              max={6}
                              value={newCollegeYears}
                              onChange={(e) => setNewCollegeYears(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 text-center rounded-xl font-black outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-800 block">الحد الأقصى للمقاعد:</label>
                            <input
                              type="number"
                              required
                              value={newCollegeSeats}
                              onChange={(e) => setNewCollegeSeats(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 text-center rounded-xl font-black outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-black text-slate-800 block">رمز دخول الكلية السري (Passcode):</label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="مثال: 4430 (يتم توليده تلقائياً إن ترك فارغاً)"
                              value={newCollegeCode}
                              onChange={(e) => setNewCollegeCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 font-mono text-center rounded-xl text-blue-700 font-black outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-3">
                        {editingDeptId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDeptId(null);
                              setNewCollegeName('');
                              setNewCollegeIp('');
                              setNewCollegeMorningFee(4000000);
                              setNewCollegeEveningFee(5000000);
                              setNewCollegeYears(4);
                              setNewCollegeSeats(100);
                            }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                          >
                            إلغاء التعديل ✕
                          </button>
                        )}
                        <button
                          type="submit"
                          className={`flex-1 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer ${
                            editingDeptId ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10'
                          }`}
                        >
                          {editingDeptId ? 'تطبيق وحفظ التعديلات والاستبدال 💾' : 'إنشاء وحفظ الكلية الجديدة بالشبكة ➕'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* كشف الكليات والعمادات */}
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-2 gap-2">
                      <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
                        <span>🏛️ شبكة عمادات الكليات المعتمدة ومحطاتها الرقمية</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-black border border-emerald-200">
                          {departments.length} كلية فعالة
                        </span>
                      </h4>
                      <span className="text-xs text-slate-500 font-bold font-mono">الشبكة: SECURE VLAN-COLLEGE_CENTRAL_GATEWAY</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {departments.map((dept) => {
                        const collegeIp = collegeIps[dept.id] || '192.168.1.100';
                        const deanRole = `head_${dept.id}`;
                        const dean = rolesList.find(r => r.departmentId === dept.id);
                        const code = roleCodes[deanRole] || (dean ? dean.defaultCode : '');
                        const deptStudents = students.filter(s => s.departmentId === dept.id);

                        return (
                          <div 
                            key={dept.id} 
                            className={`p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-3xs ${
                              dean 
                                ? 'bg-slate-50 border-slate-200 hover:border-emerald-500/25 hover:bg-white' 
                                : 'bg-red-50/10 border-red-100/50'
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <div className={`p-2 rounded-xl text-lg font-bold ${dean ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-500'}`}>
                                    🏛️
                                  </div>
                                  <div>
                                    <h5 className="font-extrabold text-xs text-slate-800">{dept.name}</h5>
                                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5">VLAN Station IP</span>
                                  </div>
                                </div>
                                <span className="font-mono text-[9px] bg-slate-900 text-emerald-400 border border-slate-850 px-2 py-0.5 rounded-lg font-black tracking-wider">
                                  {collegeIp}
                                </span>
                              </div>

                              <div className="p-3 bg-white border border-slate-150 rounded-2xl space-y-2 text-[11px] font-sans shadow-3xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-500 font-bold text-[10px]">العميد المسؤول:</span>
                                  <span className={`font-black ${dean ? 'text-slate-800' : 'text-red-500 border-b border-dashed border-red-200'}`}>
                                    {dean ? dept.headOfDepartment : '⚠️ شاغر - لم يُعين'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500 font-bold text-[10px]">رمز الدخول (Passcode):</span>
                                  <span className="font-mono text-amber-600 font-black bg-slate-100 px-1.5 py-0.5 rounded">
                                    {code || 'معلّق'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500 font-bold text-[10px]">القسط الصباحي / المسائي:</span>
                                  <span className="font-mono text-slate-700 font-bold text-[10px]">
                                    {(dept.annualFeeMorning || 0).toLocaleString()} / {(dept.annualFeeEvening || 0).toLocaleString()} د.ع
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500 font-bold text-[10px]">المقاعد المسجلة:</span>
                                  <span className="font-mono text-indigo-700 font-bold">
                                    {deptStudents.length} / {dept.availableSeats || 100}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex gap-1.5">
                              {dean ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDean(dept.id)}
                                  className="flex-1 p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>فصل العميد</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormDeanDept(dept.id);
                                    setFormDeanName('');
                                    setFormDeanCode(String(Math.floor(1000 + Math.random() * 9000)));
                                    window.scrollTo({ top: 350, behavior: 'smooth' });
                                  }}
                                  className="flex-1 p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 shrink-0" />
                                  <span>تكليف عميد</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingDeptId(dept.id);
                                  setNewCollegeName(dept.name);
                                  setNewCollegeIp(collegeIp);
                                  setNewCollegeMorningFee(dept.annualFeeMorning || 4000000);
                                  setNewCollegeEveningFee(dept.annualFeeEvening || 5000000);
                                  setNewCollegeYears(dept.durationYears || 4);
                                  setNewCollegeSeats(dept.availableSeats || 100);
                                  window.scrollTo({ top: 350, behavior: "smooth" });
                                }}
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                title="تعديل تفاصيل الكلية"
                              >
                                📝
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCollegeEntirely(dept.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                title="مسح الكلية بالكامل"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-550" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. 👨‍🏫 رؤساء الأقسام العلمية */}
              {adminSubTab === 'dept_heads' && (
                <div className="space-y-6 animate-fade-in text-right">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* فورم إضافة / تعديل قسم علمي ورئيس القسم */}
                    <form 
                      onSubmit={handleSaveAcademicSubDept}
                      className="lg:col-span-5 bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm"
                    >
                      <div className="space-y-2 border-b border-slate-100 pb-3">
                        <h4 className="font-black text-sm text-blue-700 flex items-center gap-2">
                          <Building className="w-5 h-5 text-blue-600 shrink-0" />
                          <span>{editingSubDeptId ? '📝 تعديل القسم العلمي ورئيس القسم' : '➕ تسجيل قسم علمي ورئيس قسم جديد'}</span>
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-medium">
                          إضافة الأقسام العلمية التخصصية وربطها بالكلية المعنية وتعيين رئيس القسم ورمز الدخول الخاص به.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-800 block">اسم القسم العلمي التخصصي:</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: قسم جراحة الفم والأسنان"
                            value={subDeptName}
                            onChange={(e) => setSubDeptName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-800 block">الكلية الأكاديمية التابع لها:</label>
                          <select
                            required
                            value={subDeptCollegeId}
                            onChange={(e) => setSubDeptCollegeId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold cursor-pointer"
                          >
                            <option value="">-- اختر الكلية التابع لها --</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-800 block">اسم رئيس القسم العلمي (الدكتور):</label>
                          <input
                            type="text"
                            placeholder="مثال: د. رائد فؤاد الحكيم"
                            value={subDeptHeadName}
                            onChange={(e) => setSubDeptHeadName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-black text-slate-800 block">عنوان IP المحطة:</label>
                            <input
                              type="text"
                              placeholder="192.168.10.21"
                              value={subDeptIp}
                              onChange={(e) => setSubDeptIp(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 font-mono text-center rounded-xl text-blue-700 font-bold outline-none focus:bg-white focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-black text-slate-800 block">رمز الدخول (Passcode):</label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="4501"
                              value={subDeptCode}
                              onChange={(e) => setSubDeptCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 font-mono text-center rounded-xl text-amber-600 font-black outline-none focus:bg-white focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {editingSubDeptId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubDeptId(null);
                              setSubDeptName('');
                              setSubDeptCollegeId('');
                              setSubDeptHeadName('');
                              setSubDeptIp('');
                              setSubDeptCode('');
                            }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                          >
                            إلغاء ✕
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{editingSubDeptId ? 'حفظ التعديلات' : 'تسجيل القسم العلمي فوراً'}</span>
                        </button>
                      </div>
                    </form>

                    {/* كشف الأقسام العلمية المسجلة */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <span>📋 كشف الأقسام العلمية التخصصية ورؤسائها</span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold text-xs border border-blue-200">
                            {academicSubDepts.length} قسم علمي
                          </span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-150 text-right">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-800 border-b border-slate-150 font-bold">
                              <th className="p-3 text-right">القسم العلمي</th>
                              <th className="p-3 text-right">الكلية التابع لها</th>
                              <th className="p-3 text-right">رئيس القسم (الدكتور)</th>
                              <th className="p-3 text-center font-mono">الرمز السري</th>
                              <th className="p-3 text-center">التحكم</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {academicSubDepts.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                                  لا توجد أقسام علمية مسجلة حالياً
                                </td>
                              </tr>
                            ) : (
                              academicSubDepts.map((sub) => {
                                const college = departments.find(d => d.id === sub.collegeId);
                                const roleKey = sub.role || `head_sub_${sub.id}`;
                                const code = roleCodes[roleKey] || sub.defaultCode || '4500';
                                return (
                                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="p-3 font-bold text-slate-900">{sub.name}</td>
                                    <td className="p-3 text-blue-700 font-bold">{college?.name || sub.collegeName || 'عام'}</td>
                                    <td className="p-3 text-slate-700 font-medium">{sub.headName || 'شاغر'}</td>
                                    <td className="p-3 text-center font-mono font-black text-amber-600 bg-amber-50/50">
                                      {code}
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingSubDeptId(sub.id);
                                            setSubDeptName(sub.name);
                                            setSubDeptCollegeId(sub.collegeId);
                                            setSubDeptHeadName(sub.headName || '');
                                            setSubDeptIp(sub.ip || '');
                                            setSubDeptCode(code);
                                          }}
                                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                          title="تعديل"
                                        >
                                          📝
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteAcademicSubDept(sub.id)}
                                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                          title="حذف"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. 🏢 الأقسام الإدارية والخدمية (غير التدريسية) */}
              {adminSubTab === 'admin_depts' && (
                <div className="space-y-6 animate-fade-in text-right">
                  
                  {/* تنبيه وشرح طبيعة الأقسام الإدارية */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl text-lg shrink-0">
                      ℹ️
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-purple-900">الأقسام والمديريات الإدارية والخدمية (غير التدريسية)</h4>
                      <p className="text-[11px] text-purple-700 font-medium mt-0.5">
                        هذه التشكيلات الإدارية لا تحتاج إلى طلاب أو أقساط دراسية. تعمل كمراكز للخدمات، الشؤون الإدارية، القانونية، الإعلام، الصيانة، المختبرات، والمتابعة.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* فورم إضافة / تعديل قسم إداري */}
                    <form 
                      onSubmit={handleSaveAdminDept}
                      className="lg:col-span-5 bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm"
                    >
                      <div className="space-y-2 border-b border-slate-100 pb-3">
                        <h4 className="font-black text-sm text-purple-700 flex items-center gap-2">
                          <Building className="w-5 h-5 text-purple-600 shrink-0" />
                          <span>{editingAdminDeptId ? '📝 تعديل بيانات القسم الإداري' : '➕ إضافة قسم / مديرية إدارية جديدة'}</span>
                        </h4>
                        <p className="text-slate-600 text-xs leading-relaxed font-medium">
                          أدخل اسم القسم الإداري، المسؤول عنه، ونوع النشاط لإنشاء حساب وتوليد رمز دخول فوري.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-800 block">اسم القسم أو المديرية الإدارية:</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: قسم الموارد البشرية والذاتية"
                            value={adminDeptName}
                            onChange={(e) => setAdminDeptName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-800 block">اسم المسؤول / مدير القسم:</label>
                          <input
                            type="text"
                            placeholder="مثال: أ. حسام كريم العبيدي"
                            value={adminDeptManager}
                            onChange={(e) => setAdminDeptManager(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-black text-slate-800 block">تصنيف النشاط والمهام:</label>
                          <select
                            value={adminDeptCategory}
                            onChange={(e) => setAdminDeptCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 rounded-xl outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-bold cursor-pointer"
                          >
                            <option value="شؤون إدارية وتوظيف">شؤون إدارية وتوظيف</option>
                            <option value="استشارات وتحقيق قانوني">استشارات وتحقيق قانوني</option>
                            <option value="علاقات وإعلام جامعي">علاقات وإعلام جامعي</option>
                            <option value="خدمات وتشغيل هندسي">خدمات وتشغيل هندسي وصيانة</option>
                            <option value="مختبرات وتجهيز تقني">مختبرات وورش وتجهيز تقني</option>
                            <option value="تدقيق مالي وإداري">تدقيق ورقابة مالية وإدارية</option>
                            <option value="أنظمة وشبكات">أنظمة حاسوب وتكنولوجيا المعلومات</option>
                            <option value="شؤون إدارية وخدمات">شؤون إدارية وخدمات عامة</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-black text-slate-800 block">عنوان IP المحطة:</label>
                            <input
                              type="text"
                              placeholder="192.168.1.30"
                              value={adminDeptIp}
                              onChange={(e) => setAdminDeptIp(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 font-mono text-center rounded-xl text-purple-700 font-bold outline-none focus:bg-white focus:border-purple-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-black text-slate-800 block">رمز الدخول (Passcode):</label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="3310"
                              value={adminDeptCode}
                              onChange={(e) => setAdminDeptCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs p-3 font-mono text-center rounded-xl text-amber-600 font-black outline-none focus:bg-white focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {editingAdminDeptId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAdminDeptId(null);
                              setAdminDeptName('');
                              setAdminDeptManager('');
                              setAdminDeptIp('');
                              setAdminDeptCode('');
                            }}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                          >
                            إلغاء ✕
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md shadow-purple-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{editingAdminDeptId ? 'حفظ التعديلات' : 'تسجيل القسم الإداري'}</span>
                        </button>
                      </div>
                    </form>

                    {/* كشف الأقسام الإدارية والخدمية */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <span>🏢 دليل الأقسام والمديريات الإدارية والخدمية</span>
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold text-xs border border-purple-200">
                            {adminDepts.length} تشكيل إداري
                          </span>
                        </h4>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-150 text-right">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-800 border-b border-slate-150 font-bold">
                              <th className="p-3 text-right">القسم الإداري</th>
                              <th className="p-3 text-right">المسؤول / المدير</th>
                              <th className="p-3 text-right">النشاط والتصنيف</th>
                              <th className="p-3 text-center font-mono">الرمز السري</th>
                              <th className="p-3 text-center">التحكم</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {adminDepts.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                                  لا توجد أقسام إدارية مسجلة حالياً
                                </td>
                              </tr>
                            ) : (
                              adminDepts.map((ad) => {
                                const roleKey = ad.role || `admin_dept_${ad.id}`;
                                const code = roleCodes[roleKey] || ad.defaultCode || '3300';
                                return (
                                  <tr key={ad.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="p-3 font-bold text-slate-900">{ad.name}</td>
                                    <td className="p-3 text-slate-700 font-medium">{ad.manager || 'المسؤول الإداري'}</td>
                                    <td className="p-3">
                                      <span className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
                                        {ad.category || 'شؤون إدارية'}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-mono font-black text-amber-600 bg-amber-50/50">
                                      {code}
                                    </td>
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingAdminDeptId(ad.id);
                                            setAdminDeptName(ad.name);
                                            setAdminDeptManager(ad.manager || '');
                                            setAdminDeptCategory(ad.category || 'شؤون إدارية وخدمات');
                                            setAdminDeptIp(ad.ip || '');
                                            setAdminDeptCode(code);
                                          }}
                                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                          title="تعديل"
                                        >
                                          📝
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteAdminDept(ad.id)}
                                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                          title="حذف"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ⚙️ رموز الدخول وتجربة الصلاحيات */}
              {adminSubTab === 'passcodes' && (
                <div className="space-y-6 animate-fade-in">
                  {/* 1. تبديل وتجربة الأدوار */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/65 space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-800">🔄 الإجراء التقني: تبديل الموظف الفعال في الجلسة المباشرة</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">اختر أي موظف أو عميد كلية لتتقمص هويته وتستعرض فوراً الموقف الجذري وعمادته وصلاحياته المالية والإدارية المحددة:</p>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rolesList.map((cfg) => (
                        <button
                          key={cfg.role}
                          onClick={() => {
                            setCurrentRole(cfg.role);
                          }}
                          className={`text-xs px-3 py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                            currentRole === cfg.role 
                              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/10' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-105'
                          }`}
                        >
                          {cfg.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. تعديل الرموز السرية */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">🔑 تعديل وتخصيص رموز الدخول لجميع الكوادر والعمادات والأقسام</h4>
                        <p className="text-xs text-slate-700">قم بتغيير كلمات المرور للكوادر الإدارية والأكاديمية. التحديث يتم فوراً في المتصفح ويحفظ سحابياً ومحلياً:</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        مزامنة فورية ودائمة ⚡
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rolesList.map((cfg) => {
                        const currentCode = roleCodes[cfg.role] !== undefined ? roleCodes[cfg.role] : cfg.defaultCode;
                        return (
                          <div key={cfg.role} className="p-4 bg-white border border-slate-150 rounded-xl space-y-3 shadow-xs hover:border-amber-400/60 transition-all">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs text-slate-800">{cfg.title}</span>
                              <span className="text-[10px] text-slate-700 font-bold bg-slate-105 px-2 py-0.5 rounded-sm">{cfg.categoryName}</span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                value={currentCode || ''}
                                className="flex-grow bg-slate-50 border border-slate-150 font-mono font-bold text-center text-sm p-2 rounded-lg text-slate-800 focus:border-amber-500 outline-none"
                                placeholder="مثال: 1234"
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  const updatedCodes = { ...roleCodes, [cfg.role]: val };
                                  syncRoleCodes(updatedCodes);
                                  const updatedRoles = rolesList.map(r => r.role === cfg.role ? { ...r, defaultCode: val } : r);
                                  syncRolesList(updatedRoles);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const val = roleCodes[cfg.role] || cfg.defaultCode;
                                  const updatedCodes = { ...roleCodes, [cfg.role]: val };
                                  syncRoleCodes(updatedCodes);
                                  const updatedRoles = rolesList.map(r => r.role === cfg.role ? { ...r, defaultCode: val } : r);
                                  syncRolesList(updatedRoles);
                                  addAuditLog('passcode_update', 'تعديل رمز الدخول', `تم تحديث الرمز السري لـ [${cfg.title}] إلى (${val}) وحفظه بالسيرفر`);
                                  setInAppToasts(prev => [
                                    {
                                      id: `toast-${Date.now()}`,
                                      title: 'تحديث الرمز السري',
                                      message: `✓ تم حفظ وتثبيت الرمز السري (${val}) بنجاح لـ: ${cfg.title}.`,
                                      type: 'success',
                                      timestamp: new Date().toLocaleTimeString('ar-IQ')
                                    },
                                    ...prev
                                  ]);
                                  alert(`✓ تم حفظ وتثبيت الرمز السري بنجاح لـ: ${cfg.title} (${val})`);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm shadow-amber-600/10"
                              >
                                تحديث وحفظ
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}


              {adminSubTab === 'receipt_settings' && (
                <div className="space-y-6 animate-fade-in text-right">
                  <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-black text-base text-slate-850 flex items-center gap-2">
                          <span className="text-xl">🏛️</span>
                          <span>لوحة التحكم وتخصيص ترويسة الباركود والوثائق الرسمية والشعار</span>
                        </h4>
                        <p className="text-slate-700 text-xs mt-1">
                          تحكم كامل في الترويسة الرسمية (العربية والإنجليزية)، نص البسملة، وشعار الجامعة في منتصف وثائق صحة الصدور ووصولات القبض.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] bg-amber-500/10 text-amber-700 border border-amber-500/20 font-bold px-3 py-1 rounded-lg">
                          🛡️ إدارة سيادية للأدمن
                        </span>
                      </div>
                    </div>

                    {/* 👁️ قسم المعاينة الحية والتفاعلية للترويسة الرسمية */}
                    <div className="bg-slate-900/5 p-4 md:p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                          <span>👁️</span>
                          <span>معاينة حية ومباشرة للترويسة الرسمية (Live Interactive Preview):</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/70 font-bold px-2 py-0.5 rounded-md">
                          تحديث فوري أثناء الكتابة ✔
                        </span>
                      </div>
                      
                      <div className="max-w-3xl mx-auto shadow-md rounded-2xl overflow-hidden">
                        <OfficialKutHeader 
                          {...headerConfig}
                        />
                      </div>
                      
                      <p className="text-center text-[10px] text-slate-500 font-sans">
                        هذه الترويسة تظهر أعلى وثائق صحة الصدور والباركود، قسائم السداد المالي، وسجلات التحقق المعتمدة.
                      </p>
                    </div>

                    {/* حقول الإدخال والتحكم التفصيلية */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      
                      {/* العمود 1: بيانات الجهة اليمنى (باللغة العربية) */}
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                        <div className="border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>🇮🇶</span>
                            <span>الجهة اليمنى (باللغة العربية)</span>
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block text-[11px]">اسم الدولة (عربي):</label>
                          <input
                            type="text"
                            value={headerCountryAr}
                            onChange={(e) => setHeaderCountryAr(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-850 font-bold text-xs text-right outline-hidden focus:ring-2 focus:ring-amber-500/50"
                            placeholder="مثال: جمهورية العراق"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block text-[11px]">اسم الجامعة / الكلية (عربي):</label>
                          <input
                            type="text"
                            value={headerCollegeAr}
                            onChange={(e) => {
                              setHeaderCollegeAr(e.target.value);
                              setReceiptUniversityName(e.target.value);
                            }}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-850 font-bold text-xs text-right outline-hidden focus:ring-2 focus:ring-amber-500/50"
                            placeholder="مثال: كلية الكوت الجامعة"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block text-[11px]">اسم القسم / المكتب (عربي):</label>
                          <input
                            type="text"
                            value={headerOfficeAr}
                            onChange={(e) => {
                              setHeaderOfficeAr(e.target.value);
                              setReceiptSubText(e.target.value);
                            }}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-850 font-bold text-xs text-right outline-hidden focus:ring-2 focus:ring-amber-500/50"
                            placeholder="مثال: مكتب العميد"
                          />
                        </div>
                      </div>

                      {/* العمود 2: إعدادات المنتصف (اللوغو والبسملة) */}
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
                        <div className="border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>✨</span>
                            <span>المنتصف (الشعار الرسمي والبسملة)</span>
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-700 text-[11px]">نص البسملة العلوي:</label>
                            <label className="flex items-center gap-1 text-[10px] text-slate-600 font-bold cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={headerShowBismi} 
                                onChange={(e) => setHeaderShowBismi(e.target.checked)}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span>إظهار</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            value={headerBismiText}
                            onChange={(e) => setHeaderBismiText(e.target.value)}
                            disabled={!headerShowBismi}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-850 font-bold text-xs text-center outline-hidden focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
                            placeholder="مثال: بسمه تعالى"
                          />
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <label className="font-bold text-slate-700 block text-[11px]">لوغو / شعار الجامعة:</label>
                          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-300 overflow-hidden">
                              {headerCustomLogoUrl ? (
                                <img src={headerCustomLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                <KutLogoSvg size={36} />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <span className="text-[10px] font-bold text-slate-800 block truncate">
                                {headerCustomLogoUrl ? 'شعار مخصص مفعّل' : 'شعار جامعة الكوت المدمج الرسمي'}
                              </span>
                              <span className="text-[9px] text-slate-500 block">SVG فائق الدقة والألوان</span>
                            </div>
                          </div>

                          <div className="space-y-1 mt-2">
                            <label className="text-[10px] font-bold text-slate-600 block">رابط صورة مخصصة (أو اترك فارغاً للشعار الرسمي):</label>
                            <input
                              type="text"
                              value={headerCustomLogoUrl}
                              onChange={(e) => setHeaderCustomLogoUrl(e.target.value)}
                              className="w-full bg-white border border-slate-200 p-2 rounded-lg text-slate-800 text-[11px] font-mono text-left outline-hidden focus:ring-1 focus:ring-amber-500"
                              placeholder="https://.../logo.png"
                            />
                          </div>

                          {/* رفع صورة من الجهاز */}
                          <div>
                            <label className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 px-3 rounded-lg border border-slate-300 cursor-pointer flex items-center justify-center gap-1 transition-all">
                              <span>📁 رفع صورة لوغو من الحاسوب</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        setHeaderCustomLogoUrl(event.target.result as string);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            {headerCustomLogoUrl && (
                              <button
                                type="button"
                                onClick={() => setHeaderCustomLogoUrl('')}
                                className="text-[10px] text-red-600 hover:underline block mt-1 text-center w-full font-bold cursor-pointer"
                              >
                                ✕ استعادة شعار جامعة الكوت الأصلي
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* العمود 3: بيانات الجهة اليسرى (باللغة الإنجليزية) */}
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3.5" style={{ direction: 'ltr' }}>
                        <div className="border-b border-slate-200 pb-2 text-left">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>🌐</span>
                            <span>Left Side (English Details)</span>
                          </span>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="font-bold text-slate-700 block text-[11px]">Country (English):</label>
                          <input
                            type="text"
                            value={headerCountryEn}
                            onChange={(e) => setHeaderCountryEn(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-850 font-bold text-xs text-left outline-hidden focus:ring-2 focus:ring-amber-500/50"
                            placeholder="e.g. Republic of Iraq"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="font-bold text-slate-700 block text-[11px]">University / College (English):</label>
                          <input
                            type="text"
                            value={headerCollegeEn}
                            onChange={(e) => setHeaderCollegeEn(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-850 font-bold text-xs text-left outline-hidden focus:ring-2 focus:ring-amber-500/50"
                            placeholder="e.g. Kut University College"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="font-bold text-slate-700 block text-[11px]">Office / Department (English):</label>
                          <input
                            type="text"
                            value={headerOfficeEn}
                            onChange={(e) => setHeaderOfficeEn(e.target.value)}
                            className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-850 font-bold text-xs text-left outline-hidden focus:ring-2 focus:ring-amber-500/50"
                            placeholder="e.g. Dean Office"
                          />
                        </div>
                      </div>

                    </div>

                    {/* بيانات إضافية: البريد والملاحظة التنظيمية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-700 block text-xs">البريد الإلكتروني المعتمد للجامعة والوثائق:</label>
                        <input
                          type="email"
                          value={receiptUniversityEmail}
                          onChange={(e) => setReceiptUniversityEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl text-slate-850 font-mono font-bold text-xs text-right outline-hidden transition-all focus:ring-1 focus:ring-amber-500"
                          placeholder="info@alkut.edu.iq"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-extrabold text-slate-700 block text-xs">ملاحظة تنظيمية وشروط مطبوعة أسفل الوثيقة والسند:</label>
                        <input
                          type="text"
                          value={receiptNoteText}
                          onChange={(e) => setReceiptNoteText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl text-slate-850 font-medium text-xs text-right outline-hidden transition-all focus:ring-1 focus:ring-amber-500"
                          placeholder="ملاحظة: يرجى الاحتفاظ بهذه الوثيقة..."
                        />
                      </div>
                    </div>

                    {/* أزرار الإجراءات والحفظ والمزامنة */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-150">
                      <button
                        type="button"
                        onClick={() => {
                          setHeaderCountryAr('جمهورية العراق');
                          setHeaderCollegeAr('كلية الكوت الجامعة');
                          setHeaderOfficeAr('مكتب العميد');
                          setHeaderBismiText('بسمه تعالى');
                          setHeaderShowBismi(true);
                          setHeaderCountryEn('Republic of Iraq');
                          setHeaderCollegeEn('Kut University College');
                          setHeaderOfficeEn('Dean Office');
                          setHeaderCustomLogoUrl('');
                          setReceiptUniversityName('كلية الكوت الجامعة');
                          setReceiptSubText('مكتب العميد');
                          setReceiptUniversityEmail('info@alkut.edu.iq');
                          alert('🔄 تمت استعادة الترويسة الافتراضية لجامعة الكوت بنجاح.');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-slate-300"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-600" />
                        <span>استعادة الترويسة الافتراضية لجامعة الكوت</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const newHeaderData = {
                              countryAr: headerCountryAr,
                              collegeAr: headerCollegeAr,
                              officeAr: headerOfficeAr,
                              bismiText: headerBismiText,
                              showBismi: headerShowBismi,
                              countryEn: headerCountryEn,
                              collegeEn: headerCollegeEn,
                              officeEn: headerOfficeEn,
                              customLogoUrl: headerCustomLogoUrl,
                              email: receiptUniversityEmail,
                              note: receiptNoteText,
                              updatedAt: new Date().toISOString()
                            };

                            // حفظ في Firebase
                            await setDoc(doc(db, "settings", "officialHeader"), newHeaderData);
                            await setDoc(doc(db, "settings", "receipt"), {
                              name: headerCollegeAr,
                              subText: headerOfficeAr,
                              email: receiptUniversityEmail,
                              note: receiptNoteText
                            });

                            addAuditLog('header_update', 'تحديث الترويسة واللوغو', `تم تحديث الترويسة الرسمية واللوغو بنجاح لتشمل: ${headerCollegeAr} / ${headerOfficeAr}`);
                            alert('💾 تم حفظ وتعميم الترويسة الرسمية واللوغو بنجاح! تم التحديث فورياً في جميع بوابات الطلاب والأرشيف والمالية.');
                          } catch (err) {
                            console.error("Save header error:", err);
                            alert('💾 تم حفظ الترويسة محلياً بنجاح!');
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-7 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-200" />
                        <span>حفظ وتعميم الترويسة الرسمية والشعار لجميع البوابات 💾</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {adminSubTab === 'network_settings' && (
                <div className="space-y-6 animate-fade-in text-right">
                  <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-extrabold text-sm md:text-base text-slate-800">🌐 تخصيص حالة الربط والشبكة</h4>
                      <p className="text-slate-700 text-xs mt-1">اختر طريقة تواصل التطبيق لنقل البيانات بين الأجهزة</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setCommunicationMode('cloud')}
                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          communicationMode === 'cloud' 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <Globe className={`w-6 h-6 mx-auto mb-2 ${communicationMode === 'cloud' ? 'text-indigo-600 animate-pulse' : 'text-slate-700'}`} />
                        <h5 className="font-bold text-sm">التخزين السحابي (Cloud)</h5>
                        <p className="text-[10px] mt-1 opacity-80">يضمن وصول الرسائل للجميع (الوضع الموصى به)</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCommunicationMode('network')}
                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          communicationMode === 'network' 
                            ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                        }`}
                      >
                        <Building className={`w-6 h-6 mx-auto mb-2 ${communicationMode === 'network' ? 'text-amber-600' : 'text-slate-700'}`} />
                        <h5 className="font-bold text-sm">شبكة داخلية (Local Network)</h5>
                        <p className="text-[10px] mt-1 opacity-80">العمل ضمن شبكة الكلية بدون مزامنة خارجية</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCommunicationMode('ip')}
                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          communicationMode === 'ip' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        <Activity className={`w-6 h-6 mx-auto mb-2 ${communicationMode === 'ip' ? 'text-emerald-600' : 'text-slate-700'}`} />
                        <h5 className="font-bold text-sm">الربط المباشر (Direct IP)</h5>
                        <p className="text-[10px] mt-1 opacity-80">تخصيص العقد يدوياً بين الأجهزة المعينة</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div className="text-center py-10 font-bold">بوابة قيد الصيانة والترحيل الفني.</div>;
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans flex flex-col justify-center items-center p-4 md:p-8 text-white relative overflow-hidden" style={{ direction: 'rtl' }}>
        
        {/* الخلفية الجمالية المشعة والخطوط المائلة لحظر السيرفر */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />

        <div className="max-w-xl w-full bg-slate-900/90 backdrop-blur-md border border-red-500/20 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 text-center space-y-6">
          
          {/* أيقونة الحظر والحالة فلاشية */}
          <div className="flex justify-center">
            <div className="p-4 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 shadow-lg relative">
              <ShieldAlert className="w-12 h-12 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500" />
            </div>
          </div>

          {/* الترويسة الرئيسية الموثقة */}
          <div className="space-y-2">
            <span className="text-[10px] md:text-xs font-bold text-red-400 tracking-wider font-mono uppercase bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/10 w-fit mx-auto block">
              ⚠️ تنبيه ترخيص البرمجيات | SOFTWARE LICENSE EXPIRED
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">نظام الجامعة الأهلية العراقية</h2>
            <p className="text-xs text-slate-700">نظام الإدارة وقيد التسجيل المركزي المتكامل - النسخة المستقلة</p>
          </div>

          {/* التفسير التقني للانتهاء الفعلي */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-semibold">
              عذراً، لقد انتهت فترة الصلاحية الفنية وتراخيص التشغيل المقررة لهذا البرنامج في تاريخ:
            </p>
            <div className="text-lg font-mono font-black text-red-400 select-all tracking-wide bg-red-500/5 p-2 rounded-lg border border-red-500/20 w-fit mx-auto">
              1 / 7 / 2027 م.
            </div>
            <p className="text-[11px] text-slate-700 leading-normal">
              يتطلب النظام تفعيل مفتاح الربط وتمديد خط الأمان المركزي لضمان استمرارية مزامنة الطلاب المسجلين والوصولات الصادرة وقرارات الأرشيف.
            </p>
          </div>

          {/* رسالة التواصل المطلوبة كأمر قطعي */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-red-500/30 text-amber-400">
            <span className="text-xs block mb-1">الرجاء الاتصال بجهة التطوير والدعم الفني الفوري:</span>
            <div className="flex items-center justify-center gap-2.5">
              <PhoneCall className="w-5 h-5 animate-bounce text-red-400 shrink-0" />
              <a href="tel:07832343995" className="text-xl md:text-2xl font-black font-mono tracking-wider hover:text-white transition-all select-all">
                07832343995
              </a>
            </div>
            <p className="text-[11px] text-amber-300 font-bold mt-1">عمل وتصميم المبرمجين: م. حسنين علي ذويب — م.م. رنا علي ذويب</p>
          </div>

          {/* قائمة الميزات المغلقة للتأكيد في النظام */}
          <div className="space-y-1.5 text-right text-[11px] text-slate-700 border-t border-slate-800 pt-4">
            <span className="font-bold text-slate-300 block mb-1">الأنظمة والأقسام المعلقة حالياً:</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-800/30">
                <span className="text-red-500">✕</span>
                <span>قاعدة بيانات شؤون الطلبة والتسجيل</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-800/30">
                <span className="text-red-500">✕</span>
                <span>الميزان المالي وحساب القبض بالأقسام</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-800/30">
                <span className="text-red-500">✕</span>
                <span>أرشيف الكتب الإدارية وصناديق الصلاحيات</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-800/30">
                <span className="text-red-500">✕</span>
                <span>الاتصال الداخلي وبوابة الـ IP للجامعة</span>
              </div>
            </div>
          </div>

          {/* زر التخطي البرمجي المؤقت للتجربة الفنية فقط (إذا كانت مجرد محاكاة) */}
          {isSimulatedExpired && !isActuallyExpired && (
            <div className="border-t border-slate-800/60 pt-4">
              <button
                onClick={toggleSimulation}
                className="text-xs text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-4 py-2 rounded-xl transition-all cursor-pointer font-bold select-none"
              >
                🔓 إلغاء المحاكاة والعودة لوجهة البرنامج للتصفح (متاح للتجربة)
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // بوابة الدخول الموحدة للأنظمة والكوادر الإدارية لجامعة الكوت
  if (!currentRole) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans flex flex-col justify-center items-center p-4 md:p-8 text-slate-100 relative overflow-hidden" style={{ direction: 'rtl' }}>
        
        {/* خلفيات جولوجرامية مشعة للجامعة */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-650/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />

        <div className="max-w-md w-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 space-y-6">
          
          {/* الشعار والولوج السري */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 bg-white/95 rounded-full p-1 border-2 border-amber-400 shadow-xl flex items-center justify-center">
              <KutLogoSvg size={72} />
            </div>
            <div className="space-y-1">
              <h1 className="font-extrabold text-xl text-white tracking-normal">بوابة جامعة الكوت</h1>
              <span className="text-xs text-amber-500 font-bold block">نظام أتمتة المعلومات والبيانات الموحد</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850/80 text-xs text-slate-300 leading-relaxed text-center space-y-1">
            <p className="font-bold text-slate-100 mb-1">التحقق الأمني من الرمز السري 🔒</p>
            <p className="text-[11px] text-slate-700">يرجى كتابة رمز الدخول الفردي للمدير أو الكادر المعتمد للولوج المباشر إلى المنصة.</p>
            <p className="text-[10px] text-emerald-400 font-mono">يدعم الكتابة بلوحة مفاتيح الحاسوب مباشرة ثم الضغط على Enter ✔</p>
          </div>

          {/* حقل عرض الكود */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                readOnly
                value={enteredCode}
                placeholder="••••"
                className="w-full text-center bg-slate-950 border border-slate-800 text-white font-mono font-black text-2xl tracking-widest p-3 rounded-2xl outline-none focus:border-amber-500/50"
              />
              
              {enteredCode.length > 0 && (
                <button
                  type="button"
                  onClick={() => setEnteredCode('')}
                  className="absolute inset-y-0 left-4 flex items-center text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>

            {loginError && (
              <div className="text-center text-xs font-bold text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {loginError}
              </div>
            )}
          </div>

          {/* لوحة الأرقام الرقمية لإدخال آمن */}
          <div className="grid grid-cols-3 gap-2 px-1 max-w-[280px] mx-auto w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  if (enteredCode.length < 6) {
                    setEnteredCode(prev => prev + num);
                    setLoginError(null);
                  }
                }}
                className="bg-slate-950 hover:bg-slate-800 active:bg-slate-750 text-xl font-mono font-extrabold text-white p-3 rounded-xl border border-slate-800/80 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {num}
              </button>
            ))}
            
            <button
              type="button"
              onClick={() => {
                setEnteredCode(prev => prev.slice(0, -1));
                setLoginError(null);
              }}
              className="bg-slate-950 hover:bg-slate-800 active:bg-slate-750 text-xs font-bold text-red-400 p-3 rounded-xl border border-slate-800/80 flex items-center justify-center transition-all cursor-pointer"
            >
              تراجع
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (enteredCode.length < 6) {
                  setEnteredCode(prev => prev + '0');
                  setLoginError(null);
                }
              }}
              className="bg-slate-950 hover:bg-slate-800 active:bg-slate-750 text-xl font-mono font-extrabold text-white p-3 rounded-xl border border-slate-800/80 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
            >
              0
            </button>

            <button
              type="button"
              onClick={() => {
                const matchingRole = rolesList.find(cfg => {
                  const savedCode = roleCodes[cfg.role] || cfg.defaultCode;
                  return savedCode === enteredCode;
                });

                if (matchingRole) {
                  setCurrentRole(matchingRole.role);
                  setEnteredCode('');
                  setLoginError(null);
                } else if (enteredCode === '9999') {
                  setCurrentRole('admin');
                  setEnteredCode('');
                  setLoginError(null);
                } else {
                  setLoginError('الرمز المدخل غير صحيح! يرجى إعادة المحاولة.');
                }
              }}
              className="bg-amber-650 hover:bg-amber-600 active:bg-amber-700 text-xs font-black text-white p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-amber-600/20"
            >
              موافق
            </button>
          </div>

          <div className="flex justify-between items-center text-[10px] px-2 text-slate-700 pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-slate-700 font-medium underline"
            >
              {showPassword ? 'إخفاء الرمز أثناء الكتابة' : 'إظهار الرمز عند الطباعة'}
            </button>
            <span>نظام محمي متوافق مع الأمن المركزي 🔒</span>
          </div>

          {/* حقوق العمل والتصميم للمبرمجين */}
          <div className="border-t border-slate-800/80 pt-4 mt-2 text-center space-y-2 select-none">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-xs">
              <Code2 className="w-4 h-4" />
              <span>عمل وتصميم المبرمجين</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-200">
              <span className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-amber-300 shadow-xs">
                م. حسنين علي ذويب
              </span>
              <span className="text-slate-600 font-normal">•</span>
              <span className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-amber-300 shadow-xs">
                م.م. رنا علي ذويب
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">بوابة جامعة الكوت — جميع الحقوق البرمجية محفوظة © 2026</p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800" style={{ direction: 'rtl' }}>
      
      {/* 1. القائمة الجانبية (Sidebar) للتحكم الدائم - للديسكتوب */}
      <aside className="hidden md:flex md:w-72 xl:w-80 shrink-0 bg-slate-900 text-slate-100 flex-col justify-between border-l border-slate-850 p-5 space-y-6 sticky top-0 h-screen select-none shadow-xl">
        
        {/* هيد الترويسة العليا وجزء تعريف الموظف الفعال */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-1 bg-white/95 rounded-full border border-amber-400/80 shadow-md flex items-center justify-center shrink-0">
              <KutLogoSvg size={42} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm xl:text-base text-white tracking-normal leading-normal">جامعة الكوت</h1>
              <span className="text-[10px] xl:text-xs text-amber-400 font-bold block">بوابة أتمتة المعلومات والبيانات</span>
            </div>
          </div>

          {/* كارت تعريف الموظف الحالي المسجل بالرمز */}
          {currentRoleConfig && (
            <div className="bg-slate-850/80 border border-slate-800 p-3 rounded-2xl space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center font-black text-xs shrink-0 font-mono">
                  {currentRole === 'admin' ? '🖥️' : '👤'}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] text-slate-405 block font-bold tracking-wide">{currentRoleConfig.categoryName}</span>
                  <span className="font-bold text-xs text-white block truncate" title={currentRoleConfig.title}>{currentRoleConfig.title}</span>
                </div>
              </div>
              
              {currentRoleConfig.departmentId && (
                <div className="text-[10px] bg-amber-505/10 text-amber-400 font-medium p-1.5 rounded border border-amber-500/10 text-center">
                  محدود بكلية: {departments.find(d => d.id === currentRoleConfig.departmentId)?.name || currentRoleConfig.departmentId}
                </div>
              )}

              {/* مفتاح إلغاء/تفعيل التنبيهات الفورية */}
              <div className="flex items-center justify-between gap-1.5 p-2 bg-slate-900 rounded-xl border border-slate-800 text-[11px]">
                <span className="font-bold flex items-center gap-1 text-slate-300">
                  <span>🔔</span>
                  <span>التنبيهات التلقائية:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold ${alertsEnabled ? 'text-amber-500' : 'text-slate-700'}`}>
                    {alertsEnabled ? 'مفعلة' : 'ملغاة'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAlertsEnabled(!alertsEnabled)}
                    className={`relative inline-flex h-5.5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      alertsEnabled ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        alertsEnabled ? '-translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>


            </div>
          )}

          {/* تبويبات التنقل العمودية المصفاة بناء على الصلاحية */}
          <nav className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-right text-xs xl:text-sm font-semibold transition-all group cursor-pointer ${
                    isActive 
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10 scale-[1.02]' 
                      : 'text-slate-200 hover:bg-slate-800/50 hover:text-white font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 xl:w-4.5 h-4.5 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:scale-110'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 ? (
                    <span className={`text-[9px] xl:text-[10px] font-black font-mono px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white text-amber-900 border border-amber-150' 
                        : (item.id === 'comms' || item.id === 'labs_portal' ? 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/50 animate-pulse' : (item.id === 'letters' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'))
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* كادر فوتر القائمة المنسدلة للجامعة والتحكم بالملفات */}
        <div className="space-y-4 border-t border-slate-800/80 pt-4 text-xs">
          
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-750/50 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-700">حالة ترخيص النظام:</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                نشط وآمن
              </span>
            </div>
            <div className="text-[10px] text-slate-700 leading-normal text-right">
              صلاحية البرنامج مستمرة لغاية <span className="text-amber-400 font-mono font-bold">1 / 7 / 2027</span>.
            </div>
            <button
              onClick={toggleSimulation}
              className="w-full bg-slate-805 hover:bg-red-950/40 text-red-400 hover:text-red-300 p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 border border-red-900/30 font-sans"
            >
              🔒 محاكاة قفل انتهاء صلاحية البرنامج
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/35 text-[11px] text-slate-700 leading-snug">
            <Clock className="w-4 h-4 text-slate-700 shrink-0" />
            <div>
              <span>معدل الدورة الفعالة:</span>
              <span className="font-mono block text-slate-350">v1.2.6 (May 2026)</span>
            </div>
          </div>
          
          {currentRole === 'admin' && (
            <button 
              onClick={handleResetData}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-705/80 border border-slate-700 p-2 rounded-xl transition-all font-bold text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تهيئة مخزن البيانات</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => {
              setCurrentRole(null);
              setActiveTab('students');
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/40 p-2 rounded-xl transition-all font-bold text-[11px] cursor-pointer"
          >
            🔐 تسجيل الخروج الآمن
          </button>

          {/* حقوق العمل والتصميم للمبرمجين في القائمة الجانبية */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center space-y-1.5">
            <div className="text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              <span>عمل وتصميم المبرمجين</span>
            </div>
            <div className="text-[10px] font-bold text-slate-200 space-y-0.5">
              <div className="text-amber-300">م. حسنين علي ذويب</div>
              <div className="text-amber-300">م.م. رنا علي ذويب</div>
            </div>
            <div className="text-[9px] text-slate-500">جامعة الكوت © 2026</div>
          </div>
        </div>

      </aside>

      {/* 2. الهيدر الفعال للهواتف (Mobile Header / Drawer) */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between relative sticky top-0 z-40 select-none shadow-md" style={{ direction: 'rtl' }}>
        <div className="flex items-center gap-2.5">
          <div className="p-0.5 bg-white/95 rounded-full border border-amber-400/80 shadow-sm flex items-center justify-center shrink-0">
            <KutLogoSvg size={34} />
          </div>
          <div>
            <h1 className="font-bold text-xs">بوابة جامعة الكوت</h1>
            <span className="text-[9px] text-slate-400 block font-sans">نظام أتمتة المعلومات والبيانات</span>
          </div>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* منيو التنقل للهواتف */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-slate-900 border-t border-slate-800 shadow-xl p-4 space-y-2 text-right"
            >
              {/* ترويسة تعريفية بسيطة في الهواتف */}
              {currentRoleConfig && (
                <div className="p-3 bg-slate-950 rounded-lg text-xs space-y-2 mb-2">
                  <span className="text-amber-400 font-bold block">{currentRoleConfig.title}</span>
                  <span className="text-slate-700 text-[10px] block">{currentRoleConfig.categoryName}</span>
                </div>
              )}

              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-right text-xs font-bold transition-all ${
                      isActive ? 'bg-amber-600 text-white' : 'text-slate-200 hover:bg-slate-800 hover:text-white font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && item.badge > 0 ? (
                      <span className="bg-red-500 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}

              {/* مفتاح إلغاء/تفعيل التنبيهات الفورية للموبايل */}
              <div className="flex items-center justify-between gap-1.5 p-2 bg-slate-950/85 rounded-xl border border-slate-800 text-[11px] mb-2 text-white">
                <span className="font-bold flex items-center gap-1">
                  <span>🔔</span>
                  <span>التنبيهات التلقائية:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${alertsEnabled ? 'text-amber-500' : 'text-slate-700'}`}>
                    {alertsEnabled ? 'مفعلة' : 'ملغاة'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAlertsEnabled(!alertsEnabled)}
                    className={`relative inline-flex h-5 w-8.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      alertsEnabled ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        alertsEnabled ? '-translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2 justify-center">
                {currentRole === 'admin' && (
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleResetData();
                    }}
                    className="w-full bg-slate-800 text-slate-300 font-bold text-xs p-2.5 rounded-lg text-center cursor-pointer border border-slate-750 font-sans"
                  >
                    إعادة تهيئة قاعدة البيانات 🔄
                  </button>
                )}
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentRole(null);
                    setActiveTab('students');
                  }}
                  className="w-full bg-red-950/40 text-red-300 hover:bg-red-950/65 font-bold text-xs p-2.5 rounded-lg text-center cursor-pointer border border-red-900/40"
                >
                  🔐 تسجيل الخروج الآمن
                </button>

                {/* حقوق العمل والتصميم للمبرمجين في قائمة الموبايل */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1 text-xs">
                  <span className="text-amber-400 font-bold block text-[11px]">عمل وتصميم المبرمجين:</span>
                  <div className="text-amber-300 font-bold flex justify-center items-center gap-2 text-[10px]">
                    <span>م. حسنين علي ذويب</span>
                    <span className="text-slate-600">•</span>
                    <span>م.م. رنا علي ذويب</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. نافذة العرض الرئيسية ومحتوى الصفحات */}
      <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        
        {/* شريط الإدارة للتبديل السريع إذا كان المسجل هو الأدمن */}
        {currentRole === 'admin' && (
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 text-xs font-semibold select-none">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-slate-200">شريط التدقيق الأمني السريع لمدير النظام:</span>
                <p className="text-[10px] text-slate-450 mt-0.5">انقر لمعاينة بيئة وصلاحيات أي عميد كلية أو مدير مالي مباشرة للتحقق والمطابقة:</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 justify-end w-full xl:w-auto">
              {rolesList.map((r) => (
                <button
                  key={r.role}
                  onClick={() => setCurrentRole(r.role)}
                  className={`font-bold text-[10px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    currentRole === r.role
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                  title="تبديل الهوية الفعالة فوراً"
                >
                  {r.role === 'admin' ? '⭐ الإدارة العامة' : r.title.replace(/عميد كلية|مدير/g, '').split(' (')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {renderActiveComponent()}

        {/* فوتر الصفحة العام والحقوق البرمجية */}
        <footer className="mt-12 pt-6 border-t border-slate-250 text-center text-xs text-slate-500 space-y-2 select-none">
          <div className="flex flex-wrap items-center justify-center gap-2 font-bold text-slate-700">
            <span className="text-amber-600">عمل وتصميم المبرمجين:</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs text-slate-800">
              م. حسنين علي ذويب
            </span>
            <span className="text-slate-400">•</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs text-slate-800">
              م.م. رنا علي ذويب
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            بوابة جامعة الكوت — نظام أتمتة المعلومات والبيانات الموحد © 2026
          </p>
        </footer>
      </main>

      {/* 4. تراكب الإشعارات الفورية المنبثقة ذو القناتين (إشعارات المتصفح والإنترفيس) */}
      <div className="fixed bottom-6 left-6 z-50 space-y-3 w-84 max-w-[calc(100vw-3rem)] pointer-events-none select-none">
        <AnimatePresence>
          {inAppToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-slate-900/95 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3 backdrop-blur-md relative overflow-hidden"
            >
              {/* خط إشارة ملون مخصص */}
              <div className={`absolute top-0 right-0 left-0 h-1 ${
                toast.type === 'error' ? 'bg-red-500 animate-pulse' :
                toast.type === 'warning' ? 'bg-amber-500 animate-pulse' :
                toast.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
              }`} />

              <div className="text-lg shrink-0 mt-1">
                {toast.type === 'error' ? '🚨' :
                 toast.type === 'warning' ? '⚠️' :
                 toast.type === 'success' ? '🚀' : 'ℹ️'}
              </div>

              <div className="flex-1 space-y-1 text-right">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-extrabold text-[11px] text-slate-200">{toast.title}</span>
                  <span className="font-mono text-[9px] text-slate-700 shrink-0">{toast.timestamp}</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed font-semibold font-sans">{toast.message}</p>
              </div>

              <button
                onClick={() => {
                  setInAppToasts(prev => prev.filter(t => t.id !== toast.id));
                }}
                className="text-slate-700 hover:text-white transition-colors cursor-pointer shrink-0 text-xs font-bold bg-slate-800/50 hover:bg-slate-800 p-1 rounded-full flex items-center justify-center h-5 w-5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* نافذة التأكيد المنبثقة التفاعلية المقاومة لعوائق الـ iFrame للحذف الفوري للأقسام */}
      <AnimatePresence>
        {deptIdToDelete && (() => {
          const tempDept = departments.find(d => d.id === deptIdToDelete);
          if (!tempDept) return null;
          return (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50" style={{ direction: 'rtl' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-sm w-full text-right space-y-4 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 h-1.5 w-full bg-red-650" />
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert className="w-5 h-5 animate-bounce shrink-0" />
                  <span className="font-extrabold text-xs">تحذير أمني سيادي حرج!</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-slate-100">هل أنت متأكد من مسح وإلغاء القسم/الكلية بالكامل؟</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    أنت على وشك حذف كلاً من <span className="text-amber-400 font-bold">"{tempDept.name}"</span> ومحطتها الأمنية الذاتية (IP: {collegeIps[tempDept.id] || '192.168.1.100'}).
                  </p>
                  <p className="text-[10px] text-red-400/85 leading-relaxed font-semibold">
                    ⚠️ هذا الإجراء سيقوم فوراً بتعطيل حساب الدخول لعمادة الكلية وحذف كود الولوج وتصفية جداول المقاعد والرسوم الأكاديمية نهائياً من قاعدة بيانات جامعة الكوت.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => executeDeleteCollege(tempDept.id)}
                    className="flex-1 bg-red-600 hover:bg-red-750 text-white py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center active:scale-95"
                  >
                    تأكيد الحذف الفوري
                  </button>
                  <button
                    onClick={() => setDeptIdToDelete(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-350 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer text-center active:scale-95"
                  >
                    إلغاء وتراجع
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
