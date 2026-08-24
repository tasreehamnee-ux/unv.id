import React from 'react';
import { FlaskConical } from 'lucide-react';
import InternalComms from './InternalComms';
import { InternalMessage, OfficialLetter } from '../types';

interface LabsPortalProps {
  messages: InternalMessage[];
  letters: OfficialLetter[];
  onSendMessage: (newMessage: InternalMessage) => void;
  setActiveTab: (tab: string) => void;
  rolesList: any[];
}

export default function LabsPortal({ messages, letters, onSendMessage, setActiveTab, rolesList }: LabsPortalProps) {
  return (
    <div className="space-y-6 text-right">
      {/* Labs Header */}
      <div className="bg-gradient-to-l from-emerald-900 to-teal-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shrink-0">
            <FlaskConical className="w-12 h-12 text-emerald-300" />
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-2xl md:text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">
              بوابة المختبرات المركزية
            </h2>
            <p className="text-emerald-100 text-sm md:text-base max-w-2xl leading-relaxed">
              هذه البوابة مخصصة حصرياً لإدارة المراسلات والكتب الرسمية الصادرة والواردة من وإلى المختبرات المركزية مع كافة أقسام وكليات الجامعة.
            </p>
          </div>
        </div>
      </div>

      {/* Internal Comms forced to Labs Role */}
      <div className="bg-white rounded-3xl p-2 md:p-4 shadow-sm border border-slate-200">
        <InternalComms 
          messages={messages}
          letters={letters}
          onSendMessage={onSendMessage}
          setActiveTab={setActiveTab}
          currentRole="labs_director"
          rolesList={rolesList}
        />
      </div>
    </div>
  );
}
