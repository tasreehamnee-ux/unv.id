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
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// استيراد الأنواع والبيانات الافتراضية والتابع المساعد
import { Student, Payment, OfficialLetter, InternalMessage, Department } from './types';
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

export default function App() {
  
  // 1.1 تعريف أدوار العمل ورموزها ومحدودياتها الكلية بالترميز العربي الوطني بصيغة حالة ديناميكية قابلة للتعديل والتحكم بالحذف والإضافة
  const [rolesList, setRolesList] = useState<{ role: string; title: string; categoryName: string; defaultCode: string; departmentId?: string; isCustom?: boolean }[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_ROLES_LIST');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { role: 'admin', title: 'مدير النظام الأول', categoryName: 'الإدارة الأمنية العامة', defaultCode: '9999' },
      { role: 'registration_director', title: 'مدير التسجيل والقبول', categoryName: 'العمادة والتسجيل العام', defaultCode: '1111' },
      { role: 'finance_director', title: 'مدير المالية والحسابات', categoryName: 'القسم الحسابي والمالي العام', defaultCode: '2222' },
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

  // مزامنة الكوادر ديناميكيا مع Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "rolesList"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list) {
          setRolesList(data.list);
        }
      }
    });
    return () => unsub();
  }, []);

  // مزامنة الكوادر ديناميكيا
  useEffect(() => {
    // Ensure labs_director is present for backwards compatibility with saved localStorage
    const hasLabs = rolesList.some(r => r.role === 'labs_director');
    if (!hasLabs) {
      setRolesList(prev => [...prev, { role: 'labs_director', title: 'إدارة المختبرات المركزية', categoryName: 'المختبرات والتدريب', defaultCode: '3333' }]);
    } else {
      localStorage.setItem('AL_AHLIYA_ROLES_LIST', JSON.stringify(rolesList));
    }
  }, [rolesList]);

  const [roleCodes, setRoleCodes] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_ROLE_CODES');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      admin: '9999',
      registration_director: '1111',
      finance_director: '2222',
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

  // مزامنة الرموز السرية مع Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "roleCodes"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoleCodes(data as { [key: string]: string });
      }
    });
    return () => unsub();
  }, []);

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
    const saved = localStorage.getItem('AL_AHLIYA_DEPARTMENTS');
    return saved ? JSON.parse(saved) : mockDepartments;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_STUDENTS');
    return saved ? JSON.parse(saved) : mockStudents;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_PAYMENTS');
    return saved ? JSON.parse(saved) : mockPayments;
  });

  const [letters, setLetters] = useState<OfficialLetter[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_LETTERS');
    return saved ? JSON.parse(saved) : mockLetters;
  });

  const [messages, setMessages] = useState<InternalMessage[]>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_COMMS');
    return saved ? JSON.parse(saved) : mockMessages;
  });

  // مزامنة رسائل التواصل الداخلي مع Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "messages"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.list) {
          setMessages(data.list);
        }
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
                              latestMsg.recipients.includes('all_departments') ||
                              currentRole === 'admin';
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

  const [adminSubTab, setAdminSubTab] = useState<'passcodes' | 'employees' | 'email_alerts' | 'deans' | 'receipt_settings' | 'network_settings'>('passcodes');

  // 1.11 إعدادات اسم الجامعة والبيانات المطبوعة على الوصل المالي للقبول (يدوي من مدير النظام)
  const [receiptUniversityName, setReceiptUniversityName] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_RECEIPT_UNI_NAME') || 'جامعة الكوت الأهلية';
  });

  const [receiptUniversityEmail, setReceiptUniversityEmail] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_RECEIPT_UNI_EMAIL') || 'info@alkut.edu.iq';
  });

  const [receiptSubText, setReceiptSubText] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_RECEIPT_SUB_TEXT') || 'شعبة الإيرادات والحسابات العامة';
  });

  const [receiptNoteText, setReceiptNoteText] = useState<string>(() => {
    return localStorage.getItem('AL_AHLIYA_RECEIPT_NOTE_TEXT') || 'ملاحظة: يرجى الاحتفاظ بهذا الوصل كونه مستنداً رسمياً للمراجعة والبريد الموحد للطلاب المبتدئين في كليتنا.';
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "receipt"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name) setReceiptUniversityName(data.name);
        if (data.email) setReceiptUniversityEmail(data.email);
        if (data.subText) setReceiptSubText(data.subText);
        if (data.note) setReceiptNoteText(data.note);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('AL_AHLIYA_RECEIPT_UNI_NAME', receiptUniversityName);
    localStorage.setItem('AL_AHLIYA_RECEIPT_UNI_EMAIL', receiptUniversityEmail);
    localStorage.setItem('AL_AHLIYA_RECEIPT_SUB_TEXT', receiptSubText);
    localStorage.setItem('AL_AHLIYA_RECEIPT_NOTE_TEXT', receiptNoteText);
  }, [receiptUniversityName, receiptUniversityEmail, receiptSubText, receiptNoteText]);


  // Sync Students and Departments from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "students"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setStudents(docSnap.data().list);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "appData", "departments"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setDepartments(docSnap.data().list);
      }
    });
    return () => unsub();
  }, []);

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
    if (!newStaffTitle || !newStaffCode || !newStaffRole) {
      alert('يرجى ملء جميع الحقول الضرورية لإضافة الموظف!');
      return;
    }

    const cleanRole = newStaffRole.trim().toLowerCase().replace(/\s+/g, '_');
    
    // منع تكرار المعرف
    if (rolesList.some(r => r.role === cleanRole)) {
      alert('اسم المعرف الوظيفي مستخدم بالفعل! يرجى اختيار اسم غير مكرر.');
      return;
    }

    const newStaff = {
      role: cleanRole,
      title: newStaffTitle,
      categoryName: newStaffCategory,
      defaultCode: newStaffCode,
      departmentId: newStaffDept || undefined,
      isCustom: true
    };

    setRolesList(prev => [...prev, newStaff]);
    setRoleCodes(prev => ({ ...prev, [cleanRole]: newStaffCode }));

    // إعادة تصفير النموذج
    setNewStaffRole('');
    setNewStaffTitle('');
    setNewStaffCode('');
    setNewStaffDept('');
    addAuditLog('staff_add', 'إضافة موظف وتعيين صلاحية', `تم تسجيل وإضافة الموظف الجديد [${newStaffTitle}] كـ [${newStaffCategory}] وتوليد كود المرور الخاص به`);
    alert(`🎉 تم إضافة الموظف الجديد "${newStaffTitle}" بنجاح وتعيين الرمز السري له.`);
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
      setRolesList(prev => prev.filter(r => r.role !== roleToDelete));
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

    setRolesList(updatedRoles);
    setRoleCodes(prev => ({ ...prev, [deanRole]: cleanCode }));

    // تحديث لاسم العميد المعتمد في departments
    setDepartments(prev =>
      prev.map(d => d.id === formDeanDept ? { ...d, headOfDepartment: cleanName } : d)
    );

    // تصفير مدخلات الفورم
    setFormDeanName('');
    setFormDeanDept('');
    setFormDeanCode('');
    addAuditLog('dean_assign', 'تكليف عميد الكلية', `تم تكليف الأستاذ [${cleanName}] على رأس عمادة كلية وقسم [${matchedDept.name}] بكود سري محدث ومحطة IP خاصة ومفعلة`);
    alert(`🎉 تم تكليف العميد "${cleanName}" بنجاح للكلية "${matchedDept.name}".\n📡 تم تفعيل كود ولوج الكلية الموحد (${cleanCode}) وحاسبتها الفردية IP: ${COLLEGE_IPS[formDeanDept] || '192.168.1.100'}`);
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
      setRolesList(prev => prev.filter(r => r.departmentId !== deptId));
      
      const deanRole = `head_${deptId}`;
      setRoleCodes(prev => {
        const copy = { ...prev };
        delete copy[deanRole];
        return copy;
      });

      // تصفير الاسم
      setDepartments(prev => 
        prev.map(d => d.id === deptId ? { ...d, headOfDepartment: 'شاغر' } : d)
      );

      addAuditLog('dean_remove', 'إقالة عميد الكلية', `تمت تصفية وإقالة عميد كلية [${matchedDept.name}] وإلغاء صلاحية ولوجه وحاسبته الرقمية وإبقاء المنصب شاغراً`);
      
      // تصفير الجلسة في حال كان العمود الفعال المفتوح هو المحذوف
      if (currentRole === deanRole) {
        setCurrentRole('admin');
      }

      alert(`✓ تم بنجاح فصل عميد "${matchedDept.name}" وسحب الرمز السري الخاص به.`);
    }
  };

  // دالة لحذف الكلية بالكامل مع حاسبتها التلقائية ومحطتها الأمنية من النظام
  const handleDeleteCollegeEntirely = (deptId: string) => {
    if (currentRole !== 'admin') {
      setInAppToasts(prev => [
        {
          id: `toast-${Date.now()}`,
          title: 'صلاحيات مفقودة',
          message: '⚠️ خطأ: هذه الصلاحية حصرية لمدير النظام الفعال فقط!',
          type: 'error',
          timestamp: new Date().toLocaleTimeString('ar-IQ')
        },
        ...prev
      ]);
      return;
    }
    const matchedDept = departments.find(d => d.id === deptId);
    if (!matchedDept) return;
    setDeptIdToDelete(deptId); // تشغيل التأكيد الداخلي التفاعلي بالإنترفيس لتجاوز مستمع الـ iframe
  };

  // دالة الإلغاء الفوري والحذف النهائي بعد ضغط زر التأكيد
  const executeDeleteCollege = (deptId: string) => {
    const matchedDept = departments.find(d => d.id === deptId);
    if (!matchedDept) {
      setDeptIdToDelete(null);
      return;
    }

    setDepartments(prev => { const arr = prev.filter(d => d.id !== deptId); syncDepartments(arr); return arr; });
    
    // إزالة الصلاحية
    setRolesList(prev => prev.filter(r => r.departmentId !== deptId));
    const deanRole = `head_${deptId}`;
    setRoleCodes(prev => {
      const copy = { ...prev };
      delete copy[deanRole];
      return copy;
    });

    // إزالة الـ IP
    setCollegeIps(prev => {
      const copy = { ...prev };
      delete copy[deptId];
      return copy;
    });

    // تصفير الجلسة في حال العمل بها
    if (currentRole === deanRole) {
      setCurrentRole('admin');
    }

    addAuditLog('college_delete', 'حذف وإلغاء الكلية', `تم شطب وحذف وإلغاء كلية وقسم [${matchedDept.name}] بالكامل وتصفية سائر الرسوم والـ IP والمحطة المرتبطة بها نهائياً`);
    
    setInAppToasts(prev => [
      {
        id: `toast-${Date.now()}`,
        title: 'مسح الكلية',
        message: `✓ تم بنجاح حذف كلية "${matchedDept.name}" ومحطتها الحاسوبية وكافة تفاصيلها من النظام.`,
        type: 'success',
        timestamp: new Date().toLocaleTimeString('ar-IQ')
      },
      ...prev
    ]);
    
    setDeptIdToDelete(null);
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

    if (editingDeptId) {
      // تعديل واستبدال الكلية الحالية
      setDepartments(prev => { const arr = prev.map(d => {
        if (d.id === editingDeptId) {
          return {
            ...d,
            name: cleanName,
            annualFeeMorning: newCollegeMorningFee,
            annualFeeEvening: newCollegeEveningFee,
            durationYears: newCollegeYears,
            availableSeats: newCollegeSeats
          };
        }
        return d;
      }); syncDepartments(arr); return arr; });

      setCollegeIps(prev => ({
        ...prev,
        [editingDeptId]: cleanIp
      }));

      setEditingDeptId(null);
      alert(`🎉 تم تعديل واستبدال الكلية وحاسبتها الفردية بنجاح! IP المعدل: ${cleanIp}`);
    } else {
      // إضافة كلية جديدة بالكامل لمحاكاة النظام
      const newId = cleanName.toLowerCase().replace(/[^a-z0-0]/g, 'col') || `col-${Date.now()}`;
      
      const newDept: Department = {
        id: newId,
        name: cleanName,
        college: 'جامعة المستقبل الأهلية',
        annualFeeMorning: newCollegeMorningFee,
        annualFeeEvening: newCollegeEveningFee,
        durationYears: newCollegeYears,
        headOfDepartment: 'شاغر',
        availableSeats: newCollegeSeats,
        totalEnrolled: 0
      };

      setDepartments(prev => { const arr = [...prev, newDept]; syncDepartments(arr); return arr; });
      setCollegeIps(prev => ({
        ...prev,
        [newId]: cleanIp
      }));

      alert(`🎉 تم تسجيل وإضافة الكلية المحدثة "${cleanName}" ومحطتها الرقمية بالكامل بنجاح.`);
    }

    // إعادة ضبط الحقول
    setNewCollegeName('');
    setNewCollegeIp('');
    setNewCollegeMorningFee(4000000);
    setNewCollegeEveningFee(5000000);
    setNewCollegeYears(4);
    setNewCollegeSeats(100);
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

  // حذف طالب
  const handleDeleteStudent = (id: string) => {
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

  // أرشفة كتاب رسمي جديد
  const handleAddLetter = (newLetter: OfficialLetter) => {
    setLetters(prev => [newLetter, ...prev]);
  };

  const handleSendMessage = (newMessage: InternalMessage) => {
    // Slice to 50 to avoid Firestore 1MB limits
    const newArray = [newMessage, ...messages].slice(0, 50);
    setMessages(newArray);
    
    setDoc(doc(db, "appData", "messages"), { list: newArray }).then(() => {
      console.log('Message synced');
    }).catch((e) => {
      console.error(e);
      alert('تعذر إرسال الرسالة السحابية. قد يكون حجم المرفق كبيراً جداً.');
    });
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
  const menuItems = [
    
    { id: 'students', label: 'شؤون وتسجيل الطلبة', icon: Users, badge: filteredStudentsForRole.filter(s => s.status === 'pending_documents').length },
    { id: 'portal', label: 'بوابة وقسم الطالب', icon: GraduationCap },
    { id: 'finance', label: 'قسم الحسابات والقبض المالي', icon: CreditCard },
    { id: 'letters', label: 'أرشيف الكتب والقرارات', icon: FolderLock, badge: letters.filter(l => l.status === 'expired' || l.status === 'expiring_soon').length },
    { id: 'comms', label: 'التواصل والخطوط الداخلية', icon: MessageSquare, badge: messages.filter(m => m.priority === 'high').length },
    { id: 'labs_portal', label: 'إدارة المختبرات', icon: FolderLock },
    { id: 'python', label: 'كود بايثون المتكامل للعميل', icon: Terminal },
    ...(currentRole === 'admin' ? [
      { id: 'admin_security', label: 'التحكم الإداري والأمني 🛡️', icon: ShieldAlert },
      { id: 'audit_log', label: 'سجل العمليات والمراقبة 🔒', icon: Database }
    ] : [])
  ];

  const allowedTabs = (() => {
    if (!currentRole) return [];
    if (currentRole === 'admin') return ['students', 'portal', 'finance', 'letters', 'comms', 'labs_portal', 'python', 'admin_security', 'audit_log'];
    if (currentRole === 'registration_director') return ['students', 'portal', 'letters', 'comms'];
    if (currentRole === 'finance_director') return ['finance', 'portal', 'comms'];
    if (currentRole === 'labs_director') return ['portal', 'letters', 'comms'];
    // عمداء الكليات (رئاسة القسم العلمي) - مشاهدة فقط لقسمهم (لا حسابات ولا أرشيف كتب ولا أكواد إدارية سيادية)
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
            universityName={receiptUniversityName}
            subText={receiptSubText}
            noteText={receiptNoteText}
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
            universityName={receiptUniversityName}
            subText={receiptSubText}
            noteText={receiptNoteText}
          />
        );
      case 'letters':
        return (
          <LettersArchive 
            letters={letters}
            onAddLetter={handleAddLetter}
            setActiveTab={setActiveTab}
            universityName={receiptUniversityName}
            universityEmail={receiptUniversityEmail}
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
                  onClick={() => setAdminSubTab('passcodes')}
                  className={`px-4 py-2 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'passcodes'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-550 hover:text-slate-800'
                  }`}
                >
                  ⚙️ رموز الدخول وتجربة الصلاحيات
                </button>
                <button
                  onClick={() => setAdminSubTab('employees')}
                  className={`px-4 py-2 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'employees'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-550 hover:text-slate-800'
                  }`}
                >
                  👥 حسابات الموظفين والملفات الدوليـة ({rolesList.length})
                </button>
                <button
                  onClick={() => setAdminSubTab('deans')}
                  className={`px-4 py-2 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'deans'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-550 hover:text-slate-800'
                  }`}
                >
                  🎓 عمادات وحسابات الـ 12 كلية ({rolesList.filter(r => r.categoryName === 'عميد كلية').length})
                </button>
                <button
                  onClick={() => setAdminSubTab('email_alerts')}
                  className={`px-4 py-2 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'email_alerts'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-550 hover:text-slate-800'
                  }`}
                >
                  📨 تنبيهات بريد وثائق الطلاب ({emailLogs.length})
                </button>
                <button
                  onClick={() => setAdminSubTab('receipt_settings')}
                  className={`px-4 py-2 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'receipt_settings'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-550 hover:text-slate-800'
                  }`}
                >
                  🧾 إعدادات الوصل المالي واختيار اسم الجامعة ⚙️
                </button>
                <button
                  onClick={() => setAdminSubTab('network_settings')}
                  className={`px-4 py-2 text-xs md:text-sm font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    adminSubTab === 'network_settings'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-550 hover:text-slate-800'
                  }`}
                >
                  🌐 تخصيص حالة الربط والشبكة
                </button>
              </div>

              {/* محتوى التبويبات */}
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
                    <h4 className="font-extrabold text-xs text-slate-800">🔑 تعديل وتخصيص رموز الدخول للموظفين وعمداء الكليات</h4>
                    <p className="text-xs text-slate-700">قم بتغيير كلمات المرور (الرموز السرية الدخول السداسية/الرباعية) للكوادر الإدارية. التحديث يتم فوراً في المتصفح ويحفظ تلقائياً:</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {rolesList.map((cfg) => (
                        <div key={cfg.role} className="p-4 bg-white border border-slate-150 rounded-xl space-y-3 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-slate-800">{cfg.title}</span>
                            <span className="text-[10px] text-slate-700 font-bold bg-slate-105 px-2 py-0.5 rounded-sm">{cfg.categoryName}</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={roleCodes[cfg.role] || ''}
                              className="flex-grow bg-slate-50 border border-slate-150 font-mono font-bold text-center text-sm p-2 rounded-lg text-slate-800 focus:border-amber-500 outline-none"
                              placeholder="مثال: 1234"
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); // أرقام فقط
                                setRoleCodes(prev => ({ ...prev, [cfg.role]: val }));
                              }}
                            />
                            <button
                              onClick={() => {
                                alert(` تم تحديث الرمز السري بنجاح لـ: ${cfg.title}`);
                              }}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all cursor-pointer"
                            >
                              تحديث وبث
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'employees' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* أ) فورم لإضافة موظف جديد */}
                  <form onSubmit={handleAddStaff} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-amber-600" />
                      <span>إضافة موظف/عضو كادر إداري جديد بنظام الصلاحيات</span>
                    </h4>
                    <p className="text-xs text-slate-550 leading-relaxed">تتيح لك هذه الأداة تسجيل موظف جديد، وتحديد صلاحياته (هل يتبع لعمادة كاملة أو عميد قسم الكلية الأكاديمي)، لمنحهم مساحة عمل مخصصة للدخول بالرمز الفردي:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-700 font-bold block">الاسم الرباعي والصفة الوظيفية:</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: د. صفاء أحمد الهاشمي"
                          value={newStaffTitle}
                          onChange={(e) => setNewStaffTitle(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-700 font-bold block">المعرف الوظيفي بالإنجليزية (للربط التقني):</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: head_dentistry_assistant"
                          value={newStaffRole}
                          onChange={(e) => setNewStaffRole(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          className="w-full bg-white border border-slate-200 text-xs font-mono p-2.5 rounded-lg text-slate-800 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-700 font-bold block">الفئة وسلطة الصلاحية:</label>
                        <select
                          value={newStaffCategory}
                          onChange={(e) => setNewStaffCategory(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 cursor-pointer outline-none focus:border-amber-500"
                        >
                          <option value="العمادة والتسجيل العام">العمادة والتسجيل العام</option>
                          <option value="القسم الحسابي والمالي العام">القسم الحسابي والمالي العام</option>
                          <option value="عميد كلية جديد">عميد كلية جديد (مشاهد ومصادقة)</option>
                          <option value="معاون إداري">معاون إداري</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-700 font-bold block">الكلية الأكاديمية المرتبطة (محدودية البيانات):</label>
                        <select
                          value={newStaffDept}
                          onChange={(e) => setNewStaffDept(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 cursor-pointer outline-none focus:border-amber-500"
                        >
                          <option value="">لا توجد كلية محددة (دخول إداري عام)</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-slate-700 font-bold block">الرمز السري الخاص بالدخول (رقمي):</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          placeholder="مثال: 5566"
                          value={newStaffCode}
                          onChange={(e) => setNewStaffCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white border border-slate-200 text-xs font-mono text-center p-2.5 rounded-lg text-slate-800 outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs p-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>تسجيل الكادر وبث صلاحياته فوراً</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* ب) دليل الكوادر النشطين مع إمكانية حذف الموظف */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-800">📋 دليل كوادر الجامعة النشطين حالياً وإمكانية تصفية وإدارة وسحب صلاحياتهم (الحذف والتعليق):</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-150 shadow-xs text-right">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-800 border-b border-slate-150 font-bold">
                            <th className="p-3.5">الاسم والصفة الوظيفية للموظف</th>
                            <th className="p-3.5 font-mono">المعرف الوظيفي الدولي (Role)</th>
                            <th className="p-3.5">تصنيف الصلاحيات العامة</th>
                            <th className="p-3.5">رمز المرور الحالي للتسجيل</th>
                            <th className="p-3.5">الدائرة/الكلية الأكاديمية للجامعة</th>
                            <th className="p-3.5 text-center">الإجراء والتحكم</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {rolesList.map((cfg) => {
                            const currentCode = roleCodes[cfg.role] || cfg.defaultCode;
                            return (
                              <tr key={cfg.role} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3.5 font-bold text-slate-800">{cfg.title}</td>
                                <td className="p-3.5 font-mono text-slate-700">{cfg.role}</td>
                                <td className="p-3.5">
                                  <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md font-bold text-[10px]">
                                    {cfg.categoryName}
                                  </span>
                                </td>
                                <td className="p-3.5 font-mono font-black text-amber-600">
                                  {cfg.role === 'admin' ? currentCode : '••••'}
                                </td>
                                <td className="p-3.5 text-slate-550 font-medium">
                                  {cfg.departmentId 
                                    ? (departments.find(d => d.id === cfg.departmentId)?.name || cfg.departmentId)
                                    : 'كل الكليات (دخول مركزي)'}
                                </td>
                                <td className="p-3.5 text-center">
                                  {cfg.role === 'admin' ? (
                                    <span className="text-slate-700 text-[10px] font-bold">حساب نظام أساسي محمي</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStaff(cfg.role)}
                                      className="p-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto active:scale-95"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>فصل الكادر وحذف الصلاحية</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 🏢 وحدة التحكم المفعلة لإضافة وحذف أقسام الجامعة الأكاديمية (الكليات) */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 mt-6">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                      <Building className="w-5 h-5 text-amber-600 animate-pulse animate-bounce" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800">🏢 إدارة الأقسام الأكاديمية وكليات الجامعة (إضافة وحذف فوري)</h4>
                        <p className="text-slate-700 text-[10px]">بصفتك مدير النظام، يمكنك إضافة كليات/أقسام جديدة بخصائص متفردة، أو تصفية وحذف الأقسام والمحطات نهائياً</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* نموذج الإضافة */}
                      <form onSubmit={handleSaveCollegeAndStation} className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                        <span className="font-black text-xs text-slate-700 block border-b pb-2 mb-2">✨ إضافة كرت كلية/قسم جديد ومحطته السيرفرية</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">اسم الكلية / القسم الجديد:</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: هندسة المعدات الطبية"
                              value={newCollegeName}
                              onChange={(e) => setNewCollegeName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">عنوان حاسبوها IP VLAN الرقمي:</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: 192.168.20.10"
                              value={newCollegeIp}
                              onChange={(e) => setNewCollegeIp(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 font-mono outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">القسط السنوي للدراسة الصباحية (د.ع):</label>
                            <input
                              type="number"
                              required
                              value={newCollegeMorningFee}
                              onChange={(e) => setNewCollegeMorningFee(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 font-mono outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">القسط السنوي للدراسة المسائية (د.ع):</label>
                            <input
                              type="number"
                              required
                              value={newCollegeEveningFee}
                              onChange={(e) => setNewCollegeEveningFee(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 font-mono outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">عدد سنوات الدراسة بالقسم:</label>
                            <input
                              type="number"
                              required
                              min="1"
                              max="6"
                              value={newCollegeYears}
                              onChange={(e) => setNewCollegeYears(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 font-mono outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">المقاعد الدراسية المتاحة كحد أقصى:</label>
                            <input
                              type="number"
                              required
                              value={newCollegeSeats}
                              onChange={(e) => setNewCollegeSeats(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-lg text-slate-800 font-mono outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs p-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-600/10 flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{editingDeptId ? 'تحديث وحفظ بيانات القسم الأكاديمي الحالي' : 'إنشاء وتفعيل القسم الأكاديمي والـ IP فوراً'}</span>
                          </button>
                        </div>
                      </form>

                      {/* جدول الأقسام الحالية والحذف الفوري */}
                      <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                        <span className="font-black text-xs text-slate-700 block border-b pb-2">📋 كشف الأقسام الأكاديمية والكليات الفعالة حالياً ({departments.length} قسم)</span>
                        <div className="overflow-x-auto max-h-[300px] overflow-y-auto rounded-lg border border-slate-150 text-right">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-800 border-b border-slate-150 font-bold sticky top-0">
                                <th className="p-2.5 text-right">اسم الكلية / القسم</th>
                                <th className="p-2.5 text-right font-mono">محطة الـ IP VLAN</th>
                                <th className="p-2.5 text-right font-mono">سنوات التخرج</th>
                                <th className="p-2.5 text-right">القسط الصباحي</th>
                                <th className="p-2.5 text-center">حذف القسم بالكامل</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {departments.map((dept) => {
                                const collegeIp = collegeIps[dept.id] || '192.168.1.100';
                                return (
                                  <tr key={dept.id} className="hover:bg-slate-50/50">
                                    <td className="p-2.5 text-right font-bold text-slate-800">{dept.name}</td>
                                    <td className="p-2.5 text-right font-mono font-bold text-indigo-700">{collegeIp}</td>
                                    <td className="p-2.5 text-right font-mono text-slate-700">{dept.durationYears} سنوات</td>
                                    <td className="p-2.5 text-right font-mono text-emerald-650 font-bold">{(dept.annualFeeMorning || 0).toLocaleString()} د.ع</td>
                                    <td className="p-2.5 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCollegeEntirely(dept.id)}
                                        className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 mx-auto active:scale-95 border border-red-200"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>مسح القسم</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {adminSubTab === 'deans' && (
                <div className="space-y-6 animate-fade-in text-right">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* أ) فورم تكليف عميد جديد */}
                    <form 
                      onSubmit={handleAddOrUpdateDean} 
                      className="lg:col-span-6 bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4 shadow-lg relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="space-y-2">
                        <h4 className="font-black text-xs text-emerald-400 flex items-center gap-2">
                          <Building className="w-4 h-4 text-emerald-500 shrink-0 animate-bounce" />
                          <span>تخويل وتعيين عميد الكلية والرموز السرية 🔑</span>
                        </h4>
                        <p className="text-slate-300 text-[10px] leading-relaxed">
                          اختر كلية معتمدة وعيّن عميدها الرباعي وكود دخولها الموحد لتفعيل حسابها وصلاحياتها الأمنية.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-700 font-bold block">الكلية الأكاديمية المستهدفة:</label>
                          <select
                            required
                            value={formDeanDept}
                            onChange={(e) => setFormDeanDept(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-2.5 rounded-xl cursor-pointer outline-none focus:border-emerald-500 font-bold col-span-12"
                          >
                            <option value="">-- اختر الكلية لتعيين عميدها --</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name} (IP: {collegeIps[d.id] || 'N/A'})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-700 font-bold block">اسم عميد الكلية الرباعي واللقب:</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: أ.د. ضياء عبد اللطيف السعدي"
                            value={formDeanName}
                            onChange={(e) => setFormDeanName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-emerald-500 placeholder-slate-700 font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-700 font-bold block">رمز دخول الكلية السري (قفل أمني رقمي):</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="مثال: 4425"
                            value={formDeanCode}
                            onChange={(e) => setFormDeanCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-950 border border-slate-800 text-xs p-2.5 font-mono text-center rounded-xl text-emerald-400 font-black tracking-widest outline-none focus:border-emerald-500 placeholder-slate-700"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>تنشيط الرمز السري وحاسبة الـ IP للكلية 📡</span>
                        </button>
                      </div>
                    </form>

                    {/* ب) فورم إضافة/تعديل واستبدال الكلية وحاسبتها الفردية */}
                    <form 
                      onSubmit={handleSaveCollegeAndStation} 
                      className="lg:col-span-6 bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl space-y-4 shadow-lg relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="space-y-2">
                        <h4 className="font-black text-xs text-amber-400 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>
                            {editingDeptId 
                              ? `📝 تعديل واستبدال بيانات كرت الكلية وحاسبتها الأمنية` 
                              : `✨ تسجيل كرت كلية جديد ومحطة الـ IP بالسيرفر`
                            }
                          </span>
                        </h4>
                        <p className="text-slate-350 text-[10px] leading-relaxed">
                          أدخل اسم الكلية، وعنوان حاسبتها المخصصة لربطها فورياً بالسيرفر واستبدال بيانات الكلية الحالية وقيم أقساط الرسوم المحددة لها.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-700 font-bold block">اسم الكلية الأكاديمية:</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: كلية الذكاء الاصطناعي"
                              value={newCollegeName}
                              onChange={(e) => setNewCollegeName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold placeholder-slate-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-700 font-bold block">عنوان حاسبوها IP VLAN:</label>
                            <input
                              type="text"
                              required
                              placeholder="مثال: 192.168.12.15"
                              value={newCollegeIp}
                              onChange={(e) => setNewCollegeIp(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 text-xs p-2.5 font-mono text-center rounded-xl text-amber-400 font-bold outline-none focus:border-amber-500 placeholder-slate-700"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-700 font-bold block">قسط الدراسة الصباحية (د.ع):</label>
                            <input
                              type="number"
                              required
                              value={newCollegeMorningFee}
                              onChange={(e) => setNewCollegeMorningFee(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-850 text-xs p-2.5 text-center font-bold rounded-xl text-slate-250 outline-none focus:border-amber-500"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-700 font-bold block">قسط الدراسة المسائية (د.ع):</label>
                            <input
                              type="number"
                              required
                              value={newCollegeEveningFee}
                              onChange={(e) => setNewCollegeEveningFee(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-850 text-xs p-2.5 text-center font-bold rounded-xl text-slate-250 outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-700 font-bold block">عدد سنوات الدراسة في الكلية:</label>
                            <input
                              type="number"
                              required
                              min={1}
                              max={6}
                              value={newCollegeYears}
                              onChange={(e) => setNewCollegeYears(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-855 text-xs p-2.5 text-center rounded-xl font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-700 font-bold block">الحد الأقصى للمقاعد:</label>
                            <input
                              type="number"
                              required
                              value={newCollegeSeats}
                              onChange={(e) => setNewCollegeSeats(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-855 text-xs p-2.5 text-center rounded-xl font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
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
                            className="flex-1 bg-slate-800 hover:bg-slate-755 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            إلغاء التعديل ✕
                          </button>
                        )}
                        <button
                          type="submit"
                          className={`flex-1 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer ${
                            editingDeptId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {editingDeptId ? 'تطبيق وحفظ التعديلات والاستبدال 💾' : 'إنشاء وحفظ الكلية الجديدة بالشبكة ➕'}
                        </button>
                      </div>
                    </form>

                  </div>

                  {/* ب) شبكة حاسبات الكوادر الـ 12 كلية */}
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-2 gap-2">
                      <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
                        <span>🖥️ السيرفر والشبكة التفاعلية لحسابات الكليات ومحطاتها الرقمية الفعالة (IPs & Passcodes)</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-black animate-pulse">غرفة المراقبة والتحكم المباشر للتسجيل</span>
                      </h4>
                      <span className="text-xs text-slate-700 font-bold font-mono">الشبكة: SECURE VLAN-COLLEGE_CENTRAL_GATEWAY</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {departments.map((dept) => {
                        const collegeIp = collegeIps[dept.id] || '192.168.1.100';
                        const deanRole = `head_${dept.id}`;
                        const dean = rolesList.find(r => r.departmentId === dept.id);
                        const code = roleCodes[deanRole] || (dean ? dean.defaultCode : '');
                        
                        // الطلاب المقبولين في هذه الكلية تحديداً
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
                              
                              {/* ترويسة الحاسب */}
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <div className={`p-2 rounded-xl text-lg font-bold ${dean ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-500'}`}>
                                    🏛️
                                  </div>
                                  <div>
                                    <h5 className="font-extrabold text-xs text-slate-800">{dept.name}</h5>
                                    <span className="text-[9px] text-slate-700 font-bold block mt-0.5">VLAN Station IP</span>
                                  </div>
                                </div>
                                <span className="font-mono text-[9px] bg-slate-900 text-emerald-400 border border-slate-850 px-2 py-0.5 rounded-lg font-black tracking-wider">
                                  {collegeIp}
                                </span>
                              </div>

                              <div className="p-3 bg-white border border-slate-150 rounded-2xl space-y-2 text-[11px] font-sans shadow-3xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-550 font-bold text-[10px]">العميد المسؤول:</span>
                                  <span className={`font-black ${dean ? 'text-slate-800' : 'text-red-550 border-b border-dashed border-red-200'}`}>
                                    {dean ? dept.headOfDepartment : '⚠️ شاغر - لم يُعين'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-550 font-bold text-[10px]">رمز الدخول (Passcode):</span>
                                  <span className="font-mono text-amber-600 font-black bg-slate-100 px-1.5 py-0.5 rounded">
                                    {code || 'معلّق'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-550 font-bold text-[10px]">حاسبة السيرفر:</span>
                                  <span className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${dean ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className={`text-[10px] font-bold ${dean ? 'text-emerald-700' : 'text-red-500'}`}>
                                      {dean ? 'متصل وآمن 🟢' : 'غير نشط 🔴'}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              {/* قائمة أسماء المقبولين في هذه الكلية تحديداً */}
                              <div className="space-y-1.5 font-sans">
                                <div className="flex justify-between items-center text-[10px] text-slate-700 font-bold">
                                  <span>📥 قيد الأسماء المقبولة محلياً:</span>
                                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-black">
                                    {deptStudents.length} طالب
                                  </span>
                                </div>

                                {deptStudents.length === 0 ? (
                                  <div className="p-2 border border-dashed border-slate-200 bg-white text-center text-[9px] text-slate-700 rounded-lg">
                                    لا يوجد طلاب مقبولين في هذه الكلية حالياً
                                  </div>
                                ) : (
                                  <div className="bg-white border border-slate-150 rounded-xl max-h-[100px] overflow-y-auto divide-y divide-slate-100 text-[10px] font-medium p-1">
                                    {deptStudents.map(student => (
                                      <div key={student.id} className="p-1 px-2 flex justify-between items-center hover:bg-slate-50">
                                        <span className="text-slate-800 font-bold truncate max-w-[120px]">{student.name}</span>
                                        <span className="font-mono text-[9px] text-slate-700">{student.id}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                            </div>

                            {/* أزرار الإجراء والتحكم للحذف والتوليد الفوري */}
                            <div className="pt-2 border-t border-slate-100 flex gap-1.5">
                              {dean ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDean(dept.id)}
                                  className="flex-1 p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>فصل وسحب الصلاحية</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormDeanDept(dept.id);
                                    setFormDeanName('');
                                    setFormDeanCode(String(Math.floor(1000 + Math.random() * 9000))); // توليد كود تلقائي عشوائي
                                    window.scrollTo({ top: 350, behavior: 'smooth' });
                                  }}
                                  className="flex-1 p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 shrink-0" />
                                  <span>تكليف عميد فوراً وكود سريع</span>
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
                                title="تعديل تفاصيل الكلية ورسومها تماماً"
                              >
                                📝
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCollegeEntirely(dept.id)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                                title="مسح الكلية ومحطتها تماماً من السيرفر"
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

              {adminSubTab === 'email_alerts' && (
                <div className="space-y-6 animate-fade-in text-right">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* لوحة التحكم بالإرسال التلقائي للبريد والـ Push Notifications */}
                    <div className="lg:col-span-6 bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4 shadow-lg flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-xs text-amber-400 flex items-center gap-2 font-sans">
                          <Mail className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                          <span>بث تنبيهات البريد الإلكتروني وإشعارات الحوسبة 📨</span>
                        </h4>
                        <p className="text-slate-300 text-[10px] leading-relaxed font-sans">
                          فحص شامل لقاعدة البيانات الأمنية لجميع الطلاب المسجلين بالجامعة ومقارنتها بالوقت الحالي لإشعارهم ببريد فوري وتنبيههم لتجديد الوثائق منتهية الصلاحية.
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 font-sans">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-700">حالة الخدمة بالسيرفر:</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            <span>متصل وآمن 🟢</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-900 pt-2">
                          <span className="text-slate-700">تاريخ الفحص الأمني التلقائي الفعال:</span>
                          <span className="font-mono font-bold text-amber-400">{SYSTEM_CURRENT_DATE}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => triggerAutoEmailAlerts(false)}
                        className="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-slate-950 font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-sans"
                      >
                        <Mail className="w-4 h-4 shrink-0" />
                        <span>إرسال وتحديث تنبيهات بريد الوثائق 📧</span>
                      </button>
                    </div>

                    {/* لوحة تجديد وبث إشعارات المتصفح المباشرة (System Push Notifications) */}
                    <div className="lg:col-span-6 bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl space-y-4 shadow-lg flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-xs text-indigo-400 flex items-center gap-2 font-sans">
                          <Bell className="w-5 h-5 text-indigo-500 shrink-0 animate-bounce" />
                          <span>تنبيهات المتصفح وإشعارات الـ UI الفورية (Push Alerts) 🔔</span>
                        </h4>
                        <p className="text-slate-350 text-[10px] leading-relaxed font-sans">
                          أطلق تنبيهاً فورياً للمتصفح يعلمك بكامل أسماء وتفاصيل الطلاب الذين لديهم وثائق منتهية الصلاحية أو حرجة للتحقق منها وتحديث ملفات الطلاب قبل الحظر الفني.
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2 font-sans">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-700">تفويض إشعار المتصفح المحقق:</span>
                          <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                            notificationPermission === 'granted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {notificationPermission === 'granted' ? 'مسموح به (Granted) 🟢' : 'معطل أو محظور (Default/Denied) 🔴'}
                          </span>
                        </div>
                        {notificationPermission !== 'granted' && (
                          <button
                            type="button"
                            onClick={requestNotificationPermission}
                            className="w-full text-center mt-2 text-[10px] bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 py-1 rounded-lg border border-indigo-500/20 font-bold transition-all cursor-pointer font-sans"
                          >
                            طلب تصريح الإشعارات من المتصفح 📡
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2.5 font-sans">
                        <button
                          type="button"
                          onClick={triggerTestNotification}
                          className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer border border-slate-700"
                        >
                          🧪 تشغيل فحص وهمي للاختبار
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerDocumentExpiryPushNotifications(false)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          📣 فحص وبث إشعارات الطلاب 📣
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* تقرير سجل إرسال البريد الأمني وحوسبة السجلات */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-2 font-sans">
                      <span>📜 السجل الموثق ومحاكاة رسائل البريد الإلكتروني المحوسبة (Email Logs)</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-black">غرفة الأرشيف المركزي</span>
                    </h4>

                    {emailLogs.length === 0 ? (
                      <div className="p-8 border border-dashed border-slate-200 bg-slate-50 text-center text-slate-700 rounded-3xl text-xs space-y-2 font-sans">
                        <Mail className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                        <p className="font-bold">لم يتم تسجيل أي إرسال أو بث بريدي تلقائي في هذه الجلسة</p>
                        <p className="text-[10px] text-slate-700">انقر فوق زر "إرسال وتحديث تنبيهات البريد" لبدء الحوسبة التلقائية</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 max-h-[400px] overflow-y-auto font-sans">
                        {emailLogs.map((log) => (
                          <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2">
                            <div className="flex flex-col md:flex-row justify-between md:items-center text-xs gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-md font-mono text-[9px] font-black border border-slate-850">
                                  {log.studentId}
                                </span>
                                <span className="font-extrabold text-slate-800">{log.studentName}</span>
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm text-[10px] font-bold">
                                  {log.docName}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-700 font-bold">{log.timestamp}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono font-medium leading-relaxed">
                              {log.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {adminSubTab === 'receipt_settings' && (
                <div className="space-y-6 animate-fade-in text-right">
                  <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs space-y-5">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm md:text-base text-slate-800 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-amber-600" />
                          <span>تخريج وتخصيص البيانات المطبوعة واسم الجامعة على الوصل المالي للطلاب ⚙️</span>
                        </h4>
                        <p className="text-slate-700 text-xs mt-0.5">
                          تغيير إعدادات ترويسة وملاحظات الوصولات والمدفوعات لتنعكس فوراً عند طباعة السند المالي.
                        </p>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-amber-400 font-bold px-2 py-1 rounded">مدير النظام</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* اسم الجامعة المبطن */}
                      <div className="space-y-1.5 label-input-group">
                        <label className="font-extrabold text-slate-700 block text-xs">أدخل اسم الجامعة / الكلية (يدوي):</label>
                        <input
                          type="text"
                          value={receiptUniversityName}
                          onChange={(e) => setReceiptUniversityName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl text-slate-850 font-bold text-xs text-right outline-hidden transition-all focus:ring-1 focus:ring-amber-500"
                          placeholder="مثال: جامعة الكوت الأهلية، كلية هندسة التميز..."
                        />
                      </div>

                      {/* البريد الإلكتروني المخصص */}
                      <div className="space-y-1.5 label-input-group">
                        <label className="font-extrabold text-slate-700 block text-xs">البريد الإلكتروني المعتمد للجامعة (يدوي):</label>
                        <input
                          type="email"
                          value={receiptUniversityEmail}
                          onChange={(e) => setReceiptUniversityEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl text-slate-850 font-mono font-bold text-xs text-right outline-hidden transition-all focus:ring-1 focus:ring-amber-500/80"
                          placeholder="مثال: info@alkut.edu.iq"
                        />
                      </div>

                      {/* القسم/الترويسة الفرعية */}
                      <div className="space-y-1.5 label-input-group">
                        <label className="font-extrabold text-slate-700 block text-xs">شعبة الحسابات / الترويسة الفرعية (يدوية):</label>
                        <input
                          type="text"
                          value={receiptSubText}
                          onChange={(e) => setReceiptSubText(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl text-slate-850 font-bold text-xs text-right outline-hidden transition-all focus:ring-1 focus:ring-amber-500"
                          placeholder="مثال: شعبة الإيرادات والقبول المالي، الإدارة الحسابية..."
                        />
                      </div>
                    </div>

                    {/* الملاحظة الرسمية أسفل الوصل */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-700 block text-xs">ملاحظة تنظيمية أو شروط مطبوعة على الوصل المالي:</label>
                      <textarea
                        rows={3}
                        value={receiptNoteText}
                        onChange={(e) => setReceiptNoteText(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl text-slate-850 font-medium text-xs text-right outline-hidden leading-relaxed transition-all focus:ring-1 focus:ring-amber-500"
                        placeholder="مثال: يرجى الاحتفاظ بهذا الوصل كونه مستنداً صهيراً للتحصيل المالي..."
                      />
                    </div>

                    {/* قسم المعاينة الحية */}
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2">
                      <span className="font-bold text-slate-800 text-xs text-right block">👁️ معاينة فورية للترويسة الحقيقية للوصل (Receipt Header Preview):</span>
                      <div className="bg-white p-4 border border-slate-200 rounded-xl text-center space-y-2 select-none shadow-3xs max-w-lg mx-auto">
                        <div className="border-b border-dashed border-slate-200 pb-2 text-center">
                          <div className="text-slate-800 font-extrabold text-sm flex items-center justify-center gap-1.5">
                            <Building className="w-4 h-4 text-amber-600" />
                            <span>{receiptUniversityName} - {receiptSubText}</span>
                          </div>
                          <span className="text-[10px] text-slate-700 block mt-0.5">وصل قبض وقبض أجور دراسية رسمي رقم: #105934</span>
                        </div>
                        <p className="text-[10px] text-slate-700 leading-normal bg-slate-50/50 p-2 rounded-lg border border-slate-100">{receiptNoteText}</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          alert('💾 تم حفظ الترويسة والبيانات الرسمية الجديدة للوصل المالي بنجاح! سيتم تطبيقها فوراً في بوابات الطلاب والمالية.');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-200" />
                        <span>حفظ وإصدار الترويسة الجديدة 💾</span>
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
            <p className="text-[10px] text-slate-700 mt-1">المطوّر كرم السهلاني - شعبة البرمجيات التقنية المباشرة</p>
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
            <div className="mx-auto w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 flex items-center justify-center shadow-inner">
              <Building className="w-8 h-8" />
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
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shadow-inner">
              <Building className="w-6 h-6" />
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
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 xl:w-4.5 h-4.5 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:scale-110'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 ? (
                    <span className={`text-[9px] xl:text-[10px] font-black font-mono px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white text-amber-900 border border-amber-150' 
                        : (item.id === 'letters' || item.id === 'comms' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400')
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
        </div>

      </aside>

      {/* 2. الهيدر الفعال للهواتف (Mobile Header / Drawer) */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between relative sticky top-0 z-40 select-none shadow-md" style={{ direction: 'rtl' }}>
        <div className="flex items-center gap-2">
          <Building className="w-6 h-6 text-amber-500" />
          <div>
            <h1 className="font-bold text-xs">بوابة جامعة الكوت</h1>
            <span className="text-[9px] text-slate-700 block font-sans">نظام أتمتة المعلومات والبيانات</span>
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
                      isActive ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
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
                      : 'bg-slate-950 text-slate-700 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
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
