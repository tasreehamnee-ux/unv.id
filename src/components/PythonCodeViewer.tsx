/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Download, 
  Check, 
  Play, 
  Cpu, 
  Database,
  ArrowRight
} from 'lucide-react';
import { pythonCodeString } from '../data/pythonCode';

export default function PythonCodeViewer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCodeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([pythonCodeString], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "al_ahliya_university_system.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* هيد توجيهي للمستخدم */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Terminal className="w-6 h-6 text-amber-600" />
          <span>القسم البرمجي لـ لغة بايثون للجامعة الأهلية (SQLite local db)</span>
        </h2>
        <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">
          تنفيذاً لطلبك، قمنا ببرمجة تطبيق بايثون متكامل ومغلق المصدر مع واجهات قائمة تفاعلية (Command-Line Interface Menu) وقاعدة بيانات SQLite مدمجة. يقوم النظام بالاحتفاظ بمسؤوليات الطلاب، الفحوصات المنتهية، الحسابات والوصولات، أرشفة الكتب الرسمية مع تتبع تواريخ الصلاحية وبريد التواصل الرئاسي.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>قاعدة البيانات: SQLite3 مدمجة</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-600 shrink-0" />
            <span>البنية: OOP (Object-Oriented Programming)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
            <Play className="w-4 h-4 text-sky-600 shrink-0" />
            <span>التشغيل: سطر الأوامر أو محرر VS Code</span>
          </div>
        </div>
      </div>

      {/* نافذة الأكواد والتحكم بالنسخ والتنزيل */}
      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 flex flex-col">
        
        {/* شريط الإجراءات العلوي */}
        <div className="bg-slate-950 p-4 border-b border-slate-800/65 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-slate-400 font-mono text-xs font-semibold mr-2 select-none">al_ahliya_university_system.py</span>
          </div>

          <div className="flex gap-2 shrink-0">
            {/* زر النسخ */}
            <button 
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الكود بالكامل'}</span>
            </button>

            {/* زر التنزيل */}
            <button 
              onClick={handleDownload}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل الملف المكتوب (.py)</span>
            </button>
          </div>
        </div>

        {/* جسم محرر الكود سكرول */}
        <div className="p-5 overflow-y-auto max-h-[500px] text-left select-text bg-slate-950/80">
          <pre className="font-mono text-slate-300 text-xs leading-relaxed whitespace-pre font-medium p-1 select-text selection:bg-slate-800 overflow-x-auto">
            {pythonCodeString}
          </pre>
        </div>

        {/* حاشية تفصيلية سريعة لكيفية التنفيذ والتشغيل */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 text-right text-xs text-slate-400 space-y-2">
          <h4 className="font-bold text-yellow-500 flex items-center gap-1">
            <span>⚙️ طريقة التشغيل والتشغيل المحلي على حاسوبك:</span>
          </h4>
          <ol className="list-decimal pr-5 space-y-1 text-slate-450 leading-relaxed font-bold">
            <li>قم بتثبيت لغة بايثون الإصدار الثالث (Python 3+) من الموقع الرسمي.</li>
            <li>انقر على زر <span className="text-yellow-400">"تنزيل الملف المكتوب"</span> في الأعلى لحفظ الملف على حاسوبك.</li>
            <li>افتح سطر الأوامر (Command Prompt أو Terminal) في مكان حفظ الملف، ثم اكتب الأمر التالي للتنفيذ الفوري:</li>
            <div className="bg-slate-900 border border-slate-800 text-slate-200 p-2 rounded-md font-mono text-xs text-left my-1 direction-ltr select-all">
              python al_ahliya_university_system.py
            </div>
            <li>سيقوم الكود بإنشاء ملف قاعدة البيانات <span className="text-slate-200">al_ahliya_university.db</span> محلياً وتخزين كافة الطلاب وعمليات الدفع والأرشيف بانتهاء الصلاحية والتواصل بشكل دائم وآمن!</li>
          </ol>
        </div>

      </div>

    </div>
  );
}
