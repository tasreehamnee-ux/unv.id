/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, 
  Search, 
  Filter, 
  Trash2, 
  Clock, 
  Shield, 
  Calendar,
  User,
  AlertOctagon,
  Download,
  Database
} from 'lucide-react';
import { SYSTEM_CURRENT_DATE } from '../data/mockData';

interface AuditLogEntry {
  id: string;
  action: string; 
  title: string;
  details: string;
  user: string;
  timestamp: string;
  ip: string;
}

interface AuditLogProps {
  logs: AuditLogEntry[];
  onClearLogs?: () => void;
  currentRole?: string | null;
}

export default function AuditLog({ logs, onClearLogs, currentRole }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  // تصفية السجلات الأمنية الموثقة
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  // العد السريع للعمليات الحرجة
  const deleteCount = logs.filter(l => l.action.includes('delete') || l.action.includes('remove')).length;
  const permissionCount = logs.filter(l => l.action.includes('permission') || l.action.includes('staff') || l.action.includes('dean_assign')).length;
  const collegeCount = logs.filter(l => l.action.includes('college')).length;

  return (
    <div className="space-y-6 text-right animate-fade-in font-sans">
      
      {/* صناديق مؤشرات الأمان */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">إجمالي العمليات الموثقة:</span>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {logs.length} <span className="text-sm font-sans font-medium text-slate-300">سجل</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>تسجيل مشفر محمي بالسيرفر الأساسي</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">تعديلات الصلاحيات والموظفين:</span>
            <div className="text-3xl font-black text-indigo-400 font-mono">
              {permissionCount} <span className="text-sm font-sans font-medium text-slate-300">تعديل</span>
            </div>
          </div>
          <div className="text-[10px] text-indigo-300 mt-2 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>رقابة فورية على تغيير الكوادر</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">عمليات الشطب والحذف الكلي:</span>
            <div className="text-3xl font-black text-red-400 font-mono">
              {deleteCount} <span className="text-sm font-sans font-medium text-slate-300 font-black">حذف</span>
            </div>
          </div>
          <div className="text-[10px] text-red-300 mt-2 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>عمليات سحب الصلاحيات والغياب المالي</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">تعديل وإضافة كليات وأقسام:</span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {collegeCount} <span className="text-sm font-sans font-medium text-slate-305 font-black">عملية</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-300 mt-2 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>محطات مبرمجة معنونة بالـ IP</span>
          </div>
        </div>

      </div>

      {/* لوحة التحكم الرئيسية والجدول */}
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
        
        {/* العناوين والأدوات */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900/40 p-3 rounded-2xl border border-indigo-550/30">
              <Terminal className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-amber-400 tracking-tight">سجل العمليات المركزي ومراقبة النظام (Audit Log)</h2>
              <p className="text-slate-400 text-xs mt-0.5">الصفحة الأمنية الحصرية لمدير النظام لتتبع كفاءة الصلاحيات وحماية السجلات من التلاعب</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            {onClearLogs && (
              <button 
                onClick={onClearLogs}
                className="bg-red-950/40 hover:bg-red-900 hover:text-white border border-red-800/40 text-red-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>تصفير أرشيف العمليات السري</span>
              </button>
            )}
          </div>
        </div>

        {/* فلاتر البحث والفرز */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* مربع البحث */}
          <div className="relative">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالعنوان، التفاصيل، أو اسم الموظف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 pr-10 pl-4 py-2.5 rounded-xl text-xs outline-hidden text-slate-200 font-bold"
            />
          </div>

          {/* نوع العمليات */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1 text-xs text-slate-300">
            <Filter className="w-4 h-4 text-slate-405 shrink-0" />
            <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="outline-hidden text-slate-205 cursor-pointer font-bold w-full bg-slate-900 py-1.5"
            >
              <option value="all">جميع فئات الأحداث الأمنية</option>
              <option value="permission_update">تحديث وتوليد الكود السري</option>
              <option value="staff_add">إضافة موظف وتعيين صلاحية</option>
              <option value="staff_delete">حذف كادر وسحب الصلاحية</option>
              <option value="dean_assign">تكليف عميد الكلية</option>
              <option value="dean_remove">إقالة عميد وتصفير منصبه</option>
              <option value="college_add">تسجيل كلية جديدة ومحطة</option>
              <option value="college_edit">تعديل مواصفات الكلية ورسومها</option>
              <option value="college_delete">حذف وإلغاء الكلية</option>
              <option value="student_add">تسجيل وقبول طالب جديد</option>
              <option value="student_delete">إلغاء وشطب قيد طالب مالي</option>
              <option value="receipt_add">إصدار وترحيل وصل مالي</option>
            </select>
          </div>

          <div className="bg-slate-900 text-amber-400 text-xs px-4 py-3 rounded-xl border border-slate-850 font-sans font-bold flex items-center justify-between">
            <span className="text-slate-400">حالة تدقيق المحطات الأمنية:</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>مراقبة نشطة وآمنة بنسبة 100% 🔒</span>
            </span>
          </div>

        </div>

        {/* جدول السجلات */}
        <div className="overflow-x-auto rounded-2xl border border-slate-850 bg-slate-950/50">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold">
                <th className="p-4 font-sans font-black">كود التتبع</th>
                <th className="p-4">الحدث</th>
                <th className="p-4 font-sans font-black">الوصف والملابسات التاريخية</th>
                <th className="p-4">بواسطة الكادر</th>
                <th className="p-4 text-center">التاريخ والوقت</th>
                <th className="p-4 text-center">عنوان محطة الإرسال (IP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredLogs.map(log => {
                let badgeColor = "bg-slate-800 text-slate-300";
                if (log.action.includes('delete') || log.action.includes('remove')) {
                  badgeColor = "bg-red-950/60 text-red-400 border border-red-900/45";
                } else if (log.action.includes('add') || log.action.includes('assign')) {
                  badgeColor = "bg-emerald-950/60 text-emerald-400 border border-emerald-900/45";
                } else if (log.action.includes('update') || log.action.includes('edit')) {
                  badgeColor = "bg-amber-950/60 text-amber-400 border border-amber-900/45";
                } else if (log.action.includes('receipt')) {
                  badgeColor = "bg-blue-950/60 text-blue-450 border border-blue-900/45";
                }

                return (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">{log.id}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase inline-block ${badgeColor}`}>
                        {log.title}
                      </span>
                    </td>
                    <td className="p-4 max-w-sm text-slate-200 font-sans leading-relaxed">
                      {log.details}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-bold text-slate-200">{log.user}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-amber-500">
                      {log.timestamp}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-400">
                      {log.ip}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    <AlertOctagon className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
                    <p className="font-black text-xs">لا يوجد أي سجل مراقبة حالياً يطابق فلاتر الصلاحية النشطة اليوم.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* شريطة الموثوقية للتصديق البصري */}
        <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between text-[11px] text-slate-400 border border-slate-850 leading-relaxed font-bold">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>تحديث في خادم الأمن: {logs[0]?.timestamp || SYSTEM_CURRENT_DATE}</span>
          </span>
          <span>🔒 يلتزم هذا الخادم بأدق المعايير المعتمدة بمجال تدقيق أمن المعلومات والحوسبة الموحدة لوزارة التعليم العالي العراقية.</span>
        </div>

      </div>

    </div>
  );
}
