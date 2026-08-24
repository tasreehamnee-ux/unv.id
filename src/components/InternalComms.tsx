/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  User, 
  Building, 
  MessageSquare, 
  Inbox, 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  Paperclip,
  CheckCircle,
  Tag,
  Settings,
  Wifi,
  Terminal,
  Activity,
  Globe
} from 'lucide-react';
import { InternalMessage, MessageRole, OfficialLetter } from '../types';
import { SYSTEM_CURRENT_DATE } from '../data/mockData';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface InternalCommsProps {
  messages: InternalMessage[];
  letters: OfficialLetter[];
  onSendMessage: (newMessage: InternalMessage) => void;
  setActiveTab: (tab: string) => void;
  currentRole: string;
  rolesList: any[];
  universityName?: string;
  universityEmail?: string;
}

export default function InternalComms({ 
  messages, 
  letters, 
  onSendMessage,
  setActiveTab,
  currentRole,
  rolesList,
  universityName = 'جامعة الكوت الأهلية',
  universityEmail = 'info@alkut.edu.iq'
}: InternalCommsProps) {
  
  // الاختيار الفعال للدور الحالي المستكشف للبريد للتجربة (CurrentUser role)
  const [currentUserRole, setCurrentUserRole] = useState<string>(currentRole || 'admin');

  // مزامنة الدور الفعال عند تغييره من الوالد
  React.useEffect(() => {
    if (currentRole) {
      setCurrentUserRole(currentRole);
    }
  }, [currentRole]);

  // تفاصيل الأدوار المعرفة باللغة العربية المستخلصة ديناميكياً من الأدوار المسجلة بالنظام
  const rolesMap = React.useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {
      admin: 'الإدارة العامة الأمنية ورئاسة الجامعة (مدير النظام)',
      registration_director: 'مدير التسجيل العام وشؤون القبول وقيد الطلاب',
      finance_director: 'مدير المالية العام والتدقيق الحسابي والموازنة',
      presidency: 'رئاسة الجامعة - مكتب السري لرئيس الجامعة'
    };
    if (rolesList) {
      rolesList.forEach(r => {
        map[r.role] = r.title;
      });
    }
    return map;
  }, [rolesList]);

  // عناوين الـ IP للأجهزة المتواصلة بالشبكة الداخلية (مع إمكانية تعديلها)
  const [ips, setIps] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('AL_AHLIYA_IPS');
    const defaultIps: Record<string, string> = {
      admin: '192.168.1.1',
      registration_director: '192.165.2.2',
      finance_director: '192.165.2.3',
      presidency: '192.168.1.10',
      registration: '192.168.1.20',
      finance: '192.168.1.30',
      engineering: '192.168.1.40',
      dentistry: '192.168.1.50',
      pharmacy: '192.168.1.60',
      law: '192.168.1.70',
      business: '192.168.1.80'
    };
    if (saved) {
      try {
        return { ...defaultIps, ...JSON.parse(saved) };
      } catch (e) {
        return defaultIps;
      }
    }
    return defaultIps;
  });

  // التحكم باظهار إعدادات الـ IP
  const [showNetworkSettings, setShowNetworkSettings] = useState(false);

  // حالات تواصل البريد الخارجي / الإيميل الرسمي لجامعة الكوت لكسر حواجز الشبكة المحلية
  const [externalEmails, setExternalEmails] = useState<{ id: string; to: string; recipientName: string; subject: string; body: string; date: string; status: 'sent' | 'failed' | 'pending'; attachment?: string }[]>(() => {
    const saved = localStorage.getItem('AL_KUT_EXTERNAL_EMAILS');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ext-1',
        to: 'info@mohesr.gov.iq',
        recipientName: 'وزارة التعليم العالي العراقية - دائرة التعليم الجامعي الأهلي',
        subject: 'رفع قائمة ببيانات الطلبة والمعدلات المعتمدة للتخرج',
        body: 'السادة الأفاضل في دائرة التعليم، نرفق لكم طياً كافة الجداول المؤمنة والبيانات الرسمية لطلبة كليات جامعة الكوت للتدقيق والمصادقة الإلكترونية.',
        date: '2026-05-15, 11:30 ص',
        status: 'sent'
      },
      {
        id: 'ext-2',
        to: 'regist@alkafeel.edu.iq',
        recipientName: 'مديرية تكنولوجيا المعلومات والتوثيق الأكاديمي',
        subject: 'تدقيق بيانات وإحصاءات وثائق تخرج المشتركة',
        body: 'يرجى مراجعة الجدول المرفق الخاص بصحة صدور وثائق تخرج لطلبتنا الأعزاء بين الأقسام العلمية للتحقق الرقمي.',
        date: '2026-06-11, 09:15 ص',
        status: 'sent'
      }
    ];
  });

  // حفظ المراسلات الخارجية تلقائياً للتأمين
  React.useEffect(() => {
    localStorage.setItem('AL_KUT_EXTERNAL_EMAILS', JSON.stringify(externalEmails));
  }, [externalEmails]);

  // نموذج تحرير وإرسال البريد الخارجي المتميز
  const [activeCommsTab, setActiveCommsTab] = useState<'internal' | 'external'>('internal');
  const [extComposeOpen, setExtComposeOpen] = useState(false);
  const [extTo, setExtTo] = useState('');
  const [extName, setExtName] = useState('');
  const [extSubject, setExtSubject] = useState('');
  const [extBody, setExtBody] = useState('');
  const [extAttachment, setExtAttachment] = useState('');

  // حالات فحص الاتصال (Ping Simulator)
  const [pingTarget, setPingTarget] = useState<string>('registration_director');
  const [pingLogs, setPingLogs] = useState<string[]>([]);
  const [pinging, setPinging] = useState(false);

  // حالات الرسومات والنموذج
  const [showCompose, setShowCompose] = useState(false);
  const [mailSubject, setMailSubject] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailPriority, setMailPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [mailRecipient, setMailRecipient] = useState<string>('registration_director');
  const [mailRelatedLetter, setMailRelatedLetter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // حالات ومستندات المرفقات الإدارية في الإرسال (حتى 1 غيغابايت عبر Firebase Storage)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [attachmentData, setAttachmentData] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);

  const readAndSetFile = (file: File) => {
    // حد أقصى 1 غيغابايت (1024 ميغابايت)
    const MAX_SIZE = 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("⚠️ حجم الملف كبير جداً! الحد الأقصى المسموح به لرفع الملفات هو 1 غيغابايت (1GB).");
      return;
    }
    setSelectedFile(file);
    setAttachmentName(file.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readAndSetFile(file);
    }
  };

  const removeAttachment = () => {
    setSelectedFile(null);
    setAttachmentName('');
    setAttachmentData('');
    setUploadProgress(0);
    setIsUploading(false);
  };

  // تأثير لمزامنة مراسلة الأقسام الفورية عند الدخول من لوحة التحكم
  React.useEffect(() => {
    const preselect = localStorage.getItem('AL_AHLIYA_COMMS_PRESELECT');
    if (preselect) {
      setMailRecipient(preselect);
      localStorage.removeItem('AL_AHLIYA_COMMS_PRESELECT');
    }
    const autoCompose = localStorage.getItem('AL_AHLIYA_COMMS_COMPOSE') === 'true';
    if (autoCompose) {
      setShowCompose(true);
      localStorage.removeItem('AL_AHLIYA_COMMS_COMPOSE');
    }
  }, []);

  // معالجة تغيير عنوان الـ IP من قبل المشغل
  const handleUpdateIp = (role: string, newIp: string) => {
    const updated = { ...ips, [role]: newIp };
    setIps(updated);
    localStorage.setItem('AL_AHLIYA_IPS', JSON.stringify(updated));
  };

  // محاكي فحص البنج (Ping Simulator CLI) للبث في الشبكة الداخلية
  const handlePingTest = () => {
    if (pinging) return;
    setPinging(true);
    setPingLogs([
      `[INTRANET] Pinging device connected under role: [${rolesMap[pingTarget].split(' - ')[0]}]`,
      `[INTRANET] Sending ICMP Echo Request to IP address: ${ips[pingTarget]} with 32 bytes of packet payload...`
    ]);

    let step = 0;
    const targetIp = ips[pingTarget];
    const targetName = rolesMap[pingTarget].split(' - ')[0];

    const interval = setInterval(() => {
      if (step === 0) {
        setPingLogs(prev => [...prev, `🟢 Connecting to device [${targetName}] via IP ${targetIp}...`]);
      } else if (step <= 4) {
        const ms = Math.floor(Math.random() * 8) + 2; 
        setPingLogs(prev => [...prev, `Reply from ${targetIp}: bytes=32 time=${ms}ms TTL=128 (active link)`]);
      } else if (step === 5) {
        setPingLogs(prev => [...prev, 
          `\n--- diagnostic statistics for ${targetIp} ---`,
          `📦 Packets: Sent = 4, Received = 4, Lost = 0 (0% packet loss)`,
          `⏱️ Rountrip delay latency: min=2ms, max=10ms, average=4.5ms`,
          `✨ CONNECTION LOG: EXCELLENT. Node on Intranet is highly responsive.`
        ]);
        clearInterval(interval);
        setPinging(false);
      }
      step++;
    }, 400);
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailSubject || !mailContent) {
      alert('الرجاء تعبئة موضوع الرسالة وتفاصيل نص المراسلة الداخلية!');
      return;
    }

    const newMessage: InternalMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUserRole,
      senderName: rolesMap[currentUserRole],
      recipients: mailRecipient === 'all_departments' ? rolesList.map(r => r.role).filter(r => r !== currentUserRole) : [mailRecipient],
      subject: mailSubject,
      content: mailContent,
      timestamp: new Date().toISOString(),
      priority: mailPriority,
      readBy: [currentUserRole],
      relatedLetterId: mailRelatedLetter || null,
      attachmentName: attachmentName || null,
      attachmentData: attachmentData || null
    };

    onSendMessage(newMessage);
    
    // تصفير وتهنئة
    setMailSubject('');
    setMailContent('');
    removeAttachment();
    setShowCompose(false);
    alert('تم إرسال الرسالة بنجاح!');
    setSuccessMsg('✔ تم إرسال وبث البريد الموجه الفوري إلى الجهات المعنية عبر الشبكة المغلقة للجامعة!');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // دالة للتحقق من تطابق الأدوار وحل التداخل والتطابق بين التسميات القديمة والجديدة والعمادات
  const areRolesMatching = (roleA: string, roleB: string): boolean => {
    if (!roleA || !roleB) return false;
    const clean = (r: string) => r.toLowerCase().trim();
    const rA = clean(roleA);
    const rB = clean(roleB);
    
    if (rA === rB) return true;
    
    // مطابقة: admin <-> presidency
    if ((rA === 'admin' || rA === 'presidency') && (rB === 'admin' || rB === 'presidency')) {
      return true;
    }
    
    // مطابقة: registration_director <-> registration
    if ((rA === 'registration_director' || rA === 'registration') && (rB === 'registration_director' || rB === 'registration')) {
      return true;
    }
    
    // مطابقة: finance_director <-> finance
    if ((rA === 'finance_director' || rA === 'finance') && (rB === 'finance_director' || rB === 'finance')) {
      return true;
    }
    
    // مطابقة الكليات: head_law <-> law
    const getDept = (r: string) => r.startsWith('head_') ? r.replace('head_', '') : r;
    if (getDept(rA) === getDept(rB)) {
      return true;
    }
    
    return false;
  };

  // تصفية البريد الموجه للمستقبل النشط المختار حالياً مع مطابقة الأدوار المرنة الشاملة
  const userInbox = messages.filter(msg => {
    // مدير النظام (الأدمن) يمتلك صلاحية سيادية قصوى للاطلاع ومراقبة كافة المراسلات الداخلية للتنسيق العام والتحقق
    if (currentUserRole === 'admin') {
      return true;
    }
    // إظهار الرسائل إذا كان المستخدم هو المرسل، أو إذا كان من ضمن قائمة المستلمين، أو إذا كان التعميم موجها لكامل الكليات
    const isSender = areRolesMatching(msg.sender, currentUserRole);
    const isRecipient = msg.recipients.some(rec => areRolesMatching(rec, currentUserRole)) || msg.recipients.includes('all_departments' as any);
    return isSender || isRecipient;
  });

  return (
    <div className="space-y-6 text-right">
      
      {/* مشغل محاكاة تفاعلية للأدوار (Interactive Demo Switcher) */}
      {currentRole === 'admin' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-sm font-bold uppercase">مركز تشغيل ومحاكاة الشبكة الداخلية للكليات (خاص بالمدير)</span>
              <h3 className="font-bold text-slate-850 text-xs md:text-sm">
                مراقبة البوابة بصفتك: <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">{rolesMap[currentUserRole]}</span>
              </h3>
            </div>
            <div className="text-xs text-slate-700 font-bold flex items-center gap-2">
              <span>تبديل الجهة العارضة:</span>
              <select 
                value={currentUserRole}
                onChange={(e) => {
                  setCurrentUserRole(e.target.value as MessageRole);
                  setShowCompose(false);
                }}
                className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-850 cursor-pointer font-bold outline-hidden"
              >
                {Object.entries(rolesMap).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-slate-700 text-xs">
            * تتيح لك ميزة تبديل الجهة مراقبة المراسلات وقراءة التعاميم بصفتك جهة أخرى (صلاحية مدير النظام فقط).
          </p>
        </div>
      )}

      {/* 📁 شريط التبويبات الرئيسي لنظام المراسلات لجامعة الكوت */}
      <div className="flex border-b border-slate-200 bg-slate-900 text-white rounded-xl overflow-hidden p-1 shadow-sm gap-1 mb-6">
        <button
          type="button"
          onClick={() => setActiveCommsTab('internal')}
          className={`flex-1 py-3 px-4 font-bold text-xs md:text-sm text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeCommsTab === 'internal'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>المراسلات الداخلية وعقد محطات الـ IP للكليات</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveCommsTab('external')}
          className={`flex-1 py-3 px-4 font-bold text-xs md:text-sm text-center rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeCommsTab === 'external'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mail className="w-4 h-4 text-amber-300" />
          <span>البريد الإلكتروني الخارجي والمخاطبات الرسمية 🌐</span>
        </button>
      </div>

      {activeCommsTab === 'internal' ? (
        <>
          {/* 🌐 لوحة التحكم في بروتوكولات الـ IP والربط الداخلي للأجهزة */}
          {currentRole === 'admin' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-850 text-xs md:text-sm">بوابة بروتوكول الـ IP والشبكة الداخلية (Intranet IP Routing)</h3>
              <p className="text-[11px] text-slate-700">مراقبة سريان الاتصال وعناوين العقد بين الأقسام ورئاسة الجامعة غي شبكة مغلقة</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNetworkSettings(!showNetworkSettings)}
            className="flex items-center gap-1.5 text-xs text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold border border-indigo-200"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showNetworkSettings ? 'إخلاق لوحة الـ IP' : 'تخصيص الـ IP لكل جهاز بالأقسام'}</span>
          </button>
        </div>

        {/* جدول الـ IPs الداخلي القابل للتعديل */}
        {showNetworkSettings && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50/60 rounded-xl border border-slate-150 animate-fade-in text-xs">
            {Object.entries(rolesMap).map(([roleKey, roleName]: [string, string]) => {
              const rKey = roleKey;
              return (
                <div key={rKey} className="p-3 bg-white rounded-lg border border-slate-200 shadow-3xs space-y-1.5">
                  <span className="font-bold text-slate-700 block text-[11px] truncate">{(roleName as string).split(' - ')[0]}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-700 font-mono">IP:</span>
                    <input
                      type="text"
                      value={ips[rKey]}
                      onChange={(e) => handleUpdateIp(rKey, e.target.value)}
                      placeholder="e.g. 192.168.1.10"
                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded px-2 py-0.5 text-center font-mono font-bold text-slate-850"
                    />
                  </div>
                </div>
              );
            })}
            <div className="md:col-span-2 lg:col-span-4 text-[10px] text-slate-700 leading-normal">
              💡 *تحديثات الـ IP فورية ومحفوظة بالمتصفح، وتنعكس على ترويسة الرسائل الموجهة لتحديد مسار التوجيه.
            </div>
          </div>
        )}

        {/* محاكي سطر الأوامر (Ping Diagnosticians CLI) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-50 p-4 rounded-xl border border-slate-150">
          
          <div className="md:col-span-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-700 font-mono uppercase">ICMP Echo Request Utility</span>
              <h4 className="font-bold text-slate-800 text-xs">فحص ربط الشبكة (Intranet PING Utility)</h4>
              <p className="text-slate-505 text-[11px] leading-relaxed">
                اختر أي قسم علمي أو إداري في الجامعة لتشغيل فحص بنج (PING) فوري لغرض التحقق من جاهزية جدار الحماية والاستجابة الفورية للموديم الداخلي.
              </p>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-650 block">الجهاز المستهدف للفحص:</label>
                <select
                  value={pingTarget}
                  onChange={(e) => setPingTarget(e.target.value as MessageRole)}
                  className="w-full bg-white border border-slate-250 p-2 rounded-md text-xs text-slate-800 font-bold cursor-pointer outline-hidden"
                >
                  {Object.entries(rolesMap).map(([key, value]: [string, string]) => (
                    <option key={key} value={key}>
                      📍 {(value as string).split(' - ')[0]} ({ips[key] || '192.168.1.10'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handlePingTest}
                disabled={pinging}
                className={`w-full flex items-center justify-center gap-2 font-bold text-xs p-2 rounded-lg transition-all cursor-pointer ${
                  pinging 
                    ? 'bg-slate-300 text-slate-700 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                <Wifi className={`w-3.5 h-3.5 ${pinging ? 'animate-bounce' : ''}`} />
                <span>{pinging ? 'جاري فحص الاتصال (PING)...' : 'تشغيل فحص البنج (PING)'}</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-1.5 rounded-t-lg border-b border-slate-800">
              <span className="text-slate-300 font-mono text-[10px] font-bold block">intranet_diagnostic_cli.sh</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <div className="flex-grow bg-slate-950 p-4 rounded-b-lg font-mono text-[11px] text-emerald-400 min-h-[140px] max-h-[140px] overflow-y-auto space-y-1 text-left direction-ltr selection:bg-slate-800" style={{ direction: 'ltr' }}>
              {pingLogs.length === 0 ? (
                <div className="text-slate-700 italic text-center pt-8">
                  -- شاشة سطر الأوامر جاهزة، انقر على فحص البنج بالأعلى لبدء تتبع الطرود --
                </div>
              ) : (
                pingLogs.map((log, lidx) => (
                  <div key={lidx} className="whitespace-pre-wrap leading-relaxed animate-fade-in">{log}</div>
                ))
              )}
            </div>
          </div>

        </div>

        </div>
          )}

      {successMsg && (
        <div className="bg-emerald-100 border border-emerald-250 text-emerald-800 font-bold p-3.5 rounded-xl text-center text-xs animate-bounce shadow-xs">
          {successMsg}
        </div>
      )}

      {/* تخطيط التواصل الفوري */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* القسم الأيمن: صندوق البريد والمراسلات المستلمة */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-sm md:text-base">الوارد والصادر ذو الصلاحيات المتبادلة</h3>
            </div>
            
            <button 
              onClick={() => {
                setShowCompose(!showCompose);
              }}
              className="bg-univ-blue hover:bg-slate-850 text-white font-bold text-xs p-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{showCompose ? 'إلغاء المراسلة' : 'تحرير مراسلة داخلية'}</span>
            </button>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {userInbox.map((msg) => {
              const isMine = areRolesMatching(msg.sender, currentUserRole);
              const relatedLet = letters.find(l => l.id === msg.relatedLetterId);

              return (
                <div 
                  key={msg.id}
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all text-xs ${
                    isMine 
                      ? 'bg-slate-50/70 border-slate-200 shadow-3xs' 
                      : 'bg-indigo-50/20 border-indigo-100/65 shadow-2xs'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isMine ? 'text-slate-700' : 'text-indigo-900 text-sm'}`}>
                          {isMine ? `صادر منك إلى: [${msg.recipients.map(r => rolesMap[r]?.split(' - ')[0] || r).join(', ')}]` : `من: ${msg.senderName}`}
                        </span>
                      </div>

                      {/* مسار الـ IP لتأصيل المراسلة الشبكية */}
                      <div className="flex items-center gap-1.5 text-[9px] text-indigo-800 bg-indigo-50/80 border border-indigo-150/40 px-2 py-0.5 rounded-md w-fit font-mono my-1 select-all" style={{ direction: 'ltr' }}>
                        <span>🌐 {ips[msg.sender] || '192.168.1.10'}</span>
                        <span className="text-slate-700">➔</span>
                        <span>🎯 {
                          msg.recipients.includes('all_departments' as any) 
                            ? '192.168.1.255 (Broadcast)' 
                            : msg.recipients.map(r => ips[r as MessageRole] || '192.168.1.*').join(', ')
                        }</span>
                      </div>

                      <div className="text-[10px] text-slate-700 font-mono">
                        {new Date(msg.timestamp).toLocaleString('ar-IQ')}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
                        msg.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-slate-150 text-slate-800'
                      }`}>
                        {msg.priority === 'high' ? 'عالي ذات أولوية' : 'عادي'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 text-sm leading-normal">{msg.subject}</h4>
                    <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* ربط ومزامنة بكتاب رسمي ملحق */}
                  {relatedLet && (
                    <div 
                      onClick={() => setActiveTab('letters')}
                      className="p-2.5 bg-white hover:bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between text-[11px] cursor-pointer transition-colors"
                      title="انقر لفتح ومعاينة محتويات كتاب الأرشيف"
                    >
                      <div className="flex items-center gap-1 text-slate-700">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                        <span>مستند ملحق: <span className="font-bold text-slate-900">{relatedLet.title}</span></span>
                      </div>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-sm">
                        رقم: {relatedLet.letterNumber}
                      </span>
                    </div>
                  )}

                  {/* ملف مرفق مخصص بالرسالة */}
                  {msg.attachmentName && (
                    <div className="p-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg flex items-center justify-between text-[11px] px-2.5 py-1.5 mt-1 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-1 text-slate-700 overflow-hidden">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-xs" title={msg.attachmentName}>
                          مرفق الخطاب: <span className="font-bold text-slate-900">{msg.attachmentName}</span>
                        </span>
                      </div>
                      {msg.attachmentData && (
                        <a 
                          href={msg.attachmentData} 
                          download={msg.attachmentName}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2 py-1 rounded transition-colors shrink-0"
                        >
                          تحميل المرفق 📥
                        </a>
                      )}
                    </div>
                  )}

                  {/* ختم القراءة */}
                  {!isMine && (
                    <div className="text-left text-[10px] font-bold flex items-center justify-end gap-1">
                      {(msg.readBy || []).includes(currentUserRole) ? (
                        <span className="text-slate-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                          تمت القراءة والمطالعة
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          رسالة جديدة غير مقروءة 🟢
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {userInbox.length === 0 && (
              <div className="text-center py-20 text-slate-700">
                <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">صندوق البريد مغلق وفارغ حالياً</h3>
                <p className="text-slate-700 text-xs mt-1">لا توجد رسائل موجهة إليك أو صادرة منك في هذا الدور.</p>
              </div>
            )}
          </div>
        </div>

        {/* القسم الأيسر: تحرير تعميم أو مراسلة داخلية جديدة (Compose Circular Box) */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Building className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">تحرير وبث معاملة أو مرسوم داخلي</h3>
          </div>

          <form onSubmit={handleComposeSubmit} className="space-y-4">
            
            {/* الجهة المرسل إليها */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">اختر الجهة المستلمة الفعالة:</label>
              <select 
                value={mailRecipient}
                onChange={(e) => setMailRecipient(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-bold cursor-pointer outline-hidden"
              >
                <option value="all_departments">📢 تعميم لجميع الأقسام العلمية والكليات</option>
                {Object.entries(rolesMap).map(([key, value]) => (
                  <option key={key} value={key}>
                    👤 {value}
                  </option>
                ))}
              </select>

              {/* عنوان IP المستلم الفعلي */}
              <div className="mt-1.5 p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-lg text-[10px] text-slate-700 font-mono transition-colors" style={{ direction: 'ltr' }}>
                📍 Target IP: <span className="font-bold text-indigo-700">{mailRecipient === 'all_departments' ? '192.168.1.255 (Subnet Broadcast)' : ips[mailRecipient] || '192.168.1.10'}</span>
              </div>
            </div>

            {/* الأولوية برسم الاستعجال وزاري */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">درجة الأهمية والاستعجال مالي:</label>
              <div className="flex gap-2">
                {[
                  { id: 'high', label: '🔥 هام وعاجل جداً' },
                  { id: 'normal', label: '🛡 عادي برسم العمل الدوري' },
                  { id: 'low', label: '💤 قيد الدراسة والتداول' }
                ].map(item => (
                  <label 
                    key={item.id} 
                    className={`flex-1 p-2 border rounded-lg cursor-pointer text-center select-none text-[11px] transition-all ${
                      mailPriority === item.id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-bold' 
                        : 'border-slate-150 bg-slate-50 text-slate-650 hover:bg-slate-100'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="mailPriority" 
                      checked={mailPriority === item.id} 
                      onChange={() => setMailPriority(item.id as any)}
                      className="hidden"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* الموضوع */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block">عنوان وموضوع المراسلة:</label>
              <input 
                type="text" 
                placeholder="مثال: تبليغ عاجل بمحضر اجتماع تدقيق القيود المنتهية"
                value={mailSubject}
                onChange={(e) => setMailSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white p-2.5 rounded-lg text-slate-800 font-bold outline-hidden"
                required
              />
            </div>

            {/* ربط كتاب رسمي من الأرشيف كمرجع */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block flex items-center gap-1 text-indigo-800 mb-0.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>ربط المعاملة بكتاب رسمي مؤرشف (أمر أو قرار) - اختياري:</span>
              </label>
              <select 
                value={mailRelatedLetter}
                onChange={(e) => setMailRelatedLetter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 outline-hidden"
              >
                <option value="">-- بدون ربط مستند مؤرشف --</option>
                {letters.map(l => (
                  <option key={l.id} value={l.id}>{l.title} (رقم: {l.letterNumber})</option>
                ))}
              </select>
            </div>

            {/* نص الرسالة */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700 block text-slate-505">نص مرسوم وتفاصيل المعاملة:</label>
              <textarea 
                rows={4}
                placeholder="نص الخطاب الموجه بالتفصيل..."
                value={mailContent}
                onChange={(e) => setMailContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white p-3 rounded-lg text-slate-800 leading-relaxed outline-hidden"
                required
              ></textarea>
            </div>

            {/* إرفاق مستند مخصص (مرفق المراسلة الأكاديمية) */}
            <div className="space-y-2 text-xs text-right">
              <label className="font-bold text-slate-700 block flex items-center gap-1.5 text-slate-800">
                <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                <span>إرفاق ملف مخصص أو صورة (مرفق المعاملة):</span>
              </label>

              {!attachmentName ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4.5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    dragOver 
                      ? 'border-indigo-500 bg-indigo-50/50' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                  }`}
                  onClick={() => document.getElementById('comms-file-input')?.click()}
                >
                  <Paperclip className="w-5 h-5 text-slate-700" />
                  <span className="font-bold text-slate-700 text-xs">اسحب وأفلت المرفق هنا أو انقر للتصفح</span>
                  <span className="text-[10px] text-slate-700">PDF، صور، مستندات نصية أو جداول بيانات</span>
                  <input
                    id="comms-file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="text-right">
                      <p className="font-bold text-slate-800 truncate text-xs" title={attachmentName}>{attachmentName}</p>
                      <p className="text-[9px] text-indigo-600 font-mono">
                        {selectedFile ? `الحجم: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • جاهز للرفع السحابي ⚡` : 'جاهز للإرسال والبث ⚡'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="p-1 px-2.5 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-bold border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                  >
                    حذف الملحق ❌
                  </button>
                </div>
              )}
            </div>

            {/* شريط نسبة الرفع السحابي */}
            {isUploading && (
              <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-xl space-y-2 animate-fade-in">
                <div className="flex justify-between text-xs font-bold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                    جاري رفع الملف إلى مستودع التخزين السحابي...
                  </span>
                  <span className="font-mono text-indigo-700">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-2.5 transition-all duration-150 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 text-center">يرجى الانتظار حتى اكتمال الرفع وبث الرسالة تلقائياً</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isUploading}
              className={`w-full text-white font-bold text-xs p-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isUploading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Send className="w-4 h-4 text-indigo-100" />
              <span>بث وإرسال الخطاب الفوري في النظام</span>
            </button>

          </form>
        </div>

      </div>
        </>
      ) : (
        /* 🌐 واجهة البريد الإلكتروني الخارجي والتواصل الفعال smtp الفخم لجامعة الكوت */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-right">
          
          {/* الجانب الأيمن: محرر وبث الإيميل الخارجي */}
          <div className="lg:col-span-12 xl:col-span-12 bg-white p-5 rounded-2xl border border-slate-150 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500 animate-spin" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">بوابة المراسلات الرسمية والبريد الإلكتروني الخارجي (Official E-mail Gateway)</h3>
                  <p className="text-[10px] text-slate-505 mt-0.5">مخصصة لمراسلة الكوادر والطلاب والوزارات الخارجية مباشرة عبر البريد الإلكتروني الرسمي لـ {universityName}: <span className="font-mono font-bold text-amber-700">{universityEmail}</span></p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setExtComposeOpen(!extComposeOpen)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs p-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{extComposeOpen ? 'إغلاق المحرر ✖' : 'إنشاء مخاطبة خارجية جديدة 📝'}</span>
                </button>
              </div>
            </div>

            {extComposeOpen && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!extTo || !extSubject || !extBody) {
                    alert('يرجى تعبئة البريد الإلكتروني والموضوع ومحتوى الخطاب بالكامل!');
                    return;
                  }
                  
                  // إرسال الإيميل التفاعلي ومحاكاته
                  const newExt = {
                    id: `ext-${Date.now()}`,
                    to: extTo,
                    recipientName: extName || 'مؤسسة خارجية / جهة مجهولة',
                    subject: extSubject,
                    body: extBody,
                    date: new Date().toLocaleString('ar-IQ') + ' ص',
                    status: 'sent' as const,
                    attachment: extAttachment || null
                  };

                  setExternalEmails(prev => [newExt, ...prev]);
                  
                  // تصفير
                  setExtTo('');
                  setExtName('');
                  setExtSubject('');
                  setExtBody('');
                  setExtAttachment('');
                  setExtComposeOpen(false);

                  alert(`📡 تم توليد وإرسال البريد الإلكتروني بنجاح من خادم ${universityName} بنطاق SMTP [${universityEmail}] وبثه بنجاح للمستقبل!`);
                }}
                className="p-5 bg-amber-50/20 border border-amber-200/50 rounded-2xl space-y-4 text-right animate-fade-in"
              >
                <h4 className="font-bold text-xs text-amber-800 border-b border-amber-100 pb-1.5 font-sans">📝 تحرير خطاب بريد رسمي صادر</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* المستلم الخارجي */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block text-right">إلى (البريد الإلكتروني المستهدف):</label>
                    <input 
                      type="email"
                      placeholder="e.g. contact@mohesr.gov.iq or student@gmail.com"
                      value={extTo}
                      onChange={(e) => setExtTo(e.target.value)}
                      className="w-full bg-white border border-slate-200/90 p-2.5 rounded-lg text-slate-850 font-mono font-bold outline-hidden text-right"
                      required
                    />
                  </div>

                  {/* اسم جهة الاتصال */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block text-right font-sans">اسم جهة الاتصال أو الموظف المستلم:</label>
                    <input 
                      type="text"
                      placeholder="مثال: وزارة التعليم العالي والبحث العلمي، الطالب أحمد جاسم..."
                      value={extName}
                      onChange={(e) => setExtName(e.target.value)}
                      className="w-full bg-white border border-slate-200/90 p-2.5 rounded-lg text-slate-850 font-bold outline-hidden text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* موضوع المخاطبة */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block text-right">موضوع الخطاب الإلكتروني:</label>
                    <input 
                      type="text"
                      placeholder="عنوان البريد الإلكتروني الرسمي الواضح..."
                      value={extSubject}
                      onChange={(e) => setExtSubject(e.target.value)}
                      className="w-full bg-white border border-slate-200/90 p-2.5 rounded-lg text-slate-850 font-bold outline-hidden text-right"
                      required
                    />
                  </div>

                  {/* إرفاق رمز QR أو مستند صادر كمرفق كاذب رقمي */}
                  <div className="space-y-1 text-xs text-right">
                    <label className="font-bold text-slate-700 block text-right">وصله بمستند صادر أو صحة صدور تابعة كملحق:</label>
                    <input 
                      type="text"
                      placeholder="مثال: وثيقة_تخرج_قانون_2026.pdf (اختياري)"
                      value={extAttachment}
                      onChange={(e) => setExtAttachment(e.target.value)}
                      className="w-full bg-white border border-slate-200/90 p-2.5 rounded-lg text-slate-850 font-bold outline-hidden text-right"
                    />
                  </div>
                </div>

                {/* نص البريد بالكامل */}
                <div className="space-y-1 text-xs text-right">
                  <label className="font-bold text-slate-700 block text-right">نص الرسالة الرسمية الموجهة (Email Content):</label>
                  <textarea 
                    rows={5}
                    placeholder="اكتب تفاصيل المخاطبة كاملة هنا..."
                    value={extBody}
                    onChange={(e) => setExtBody(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-amber-500 p-3 rounded-lg text-slate-850 leading-relaxed outline-hidden font-sans font-medium text-right"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/10 active:scale-95"
                >
                  <Send className="w-4 h-4 text-white shrink-0" />
                  <span>توقيع وإرسال البريد الخارجي فوراً عبر خادم جامعة الكوت الموحد 🚀</span>
                </button>
              </form>
            )}

            {/* أرشيف وسجل البريد الإلكتروني الخارجي الصادر */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-slate-800 text-xs">سجل المراسلات والبريد الصادر الخارجي الموثق:</span>
                </div>
                <span className="text-[10px] text-slate-700">إجمالي الصادرات الخارجية: {externalEmails.length} مخاطبات</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {externalEmails.map((email) => (
                  <div key={email.id} className="bg-slate-50 hover:bg-slate-100/50 p-4 border border-slate-200/80 rounded-2xl transition-all space-y-3 text-xs relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 bg-emerald-500/10 text-emerald-700 p-1 px-2.5 rounded-br-xl font-bold font-mono text-[9px] flex items-center gap-1">
                      <span>✓ SENT</span>
                      <span>100% OK</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="space-y-0.5" style={{ direction: 'rtl' }}>
                        <span className="text-[10px] text-slate-700 block text-right">الجهة الخارجية المستلمة:</span>
                        <p className="font-extrabold text-slate-800 text-[11px] text-right">{email.recipientName}</p>
                        <p className="font-mono text-[10px] text-indigo-700 font-bold text-right">{email.to}</p>
                      </div>

                      <div className="border-t border-slate-200/60 pt-2 space-y-1">
                        <p className="font-bold text-slate-900 bg-white p-1 border border-slate-100 rounded text-[11px] text-right" style={{ direction: 'rtl' }}>
                          M: {email.subject}
                        </p>
                        <p className="text-slate-655 leading-relaxed font-sans mt-1 text-[11.5px] text-right text-slate-700" style={{ direction: 'rtl' }}>
                          {email.body}
                        </p>
                      </div>

                      {email.attachment && (
                        <div className="p-1 px-2 bg-amber-100/40 border border-amber-205 rounded-lg text-[9px] text-amber-900 font-semibold inline-flex items-center gap-1">
                          <Paperclip className="w-3" />
                          <span>المرفق: {email.attachment}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center text-[10px] text-slate-700">
                      <span>تاريخ الإصدار وبث SMTP:</span>
                      <span className="font-mono text-slate-700 font-bold">{email.date}</span>
                    </div>
                  </div>
                ))}

                {externalEmails.length === 0 && (
                  <div className="col-span-2 p-12 text-center text-slate-700 space-y-2 border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-3xs">
                    <Mail className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
                    <h3 className="text-xs font-bold text-slate-700">لم يتم رصد صادرات بريد خارجي حتى الآن</h3>
                    <p className="text-[11px] text-slate-405 leading-normal">
                      استخدم خيار "إنشاء مخاطبة خارجية جديدة" في الأعلى لمراسلة أي بريد وزاري أو جامعي رسمي للتحقق.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
