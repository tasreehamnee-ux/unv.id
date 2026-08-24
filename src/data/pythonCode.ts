/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const pythonCodeString = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
جامعة الأهلية - النظام المتكامل لتسجيل الطلبة والإدارة المالية والأرشفة والتواصل
Al-Ahliya University - Integrated Student Registration & Administration System
---------------------------------------------------------------------------------
المميزات:
1. تسجيل الطلاب واختيار الأقسام مع لوحة بيانات كاملة.
2. بوابة الطالب وقسم الحسابات وتتبع الأقساط ودفع الدفعات المالية مع إصدار وصولات.
3. أرشفة الكتب الرسمية والوثائق مع تاريخ انتهاء الصلاحية وتنبيهات الكتب المنتهية.
4. قنوات التواصل الداخلي بين رئاسة الجامعة ومركز التسجيل وأقسام الكلية.
5. استخدام قاعدة بيانات SQLite محلية مدمجة للتخزين الدائم للبيانات.
"""

import sqlite3
import os
from datetime import datetime, date

class AlAhliyaSystem:
    def __init__(self, db_path="al_ahliya_university.db"):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        self.setup_tables()
        self.insert_seed_data_if_empty()

    def setup_tables(self):
        # 1. جدول الأقسام
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            college TEXT NOT NULL,
            annual_fee INTEGER NOT NULL,
            duration INTEGER NOT NULL
        )
        """)

        # 2. جدول الطلاب
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            national_id TEXT,
            department_id TEXT,
            shift TEXT,
            stage INTEGER DEFAULT 1,
            status TEXT DEFAULT 'active',
            reg_date TEXT,
            total_fee INTEGER,
            FOREIGN KEY (department_id) REFERENCES departments(id)
        )
        """)

        # 3. جدول مستمسكات الطالب وتواريخ انتهائها
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            doc_name TEXT,
            provided INTEGER DEFAULT 0,
            expiry_date TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id)
        )
        """)

        # 4. جدول الوصلات والمدفوعات المالية
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            student_id TEXT,
            amount INTEGER,
            pay_date TEXT,
            receipt_no TEXT,
            category TEXT,
            method TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id)
        )
        """)

        # 5. جدول أرشفة الكتب الرسمية وتاريخ انتهاء الصلاحية
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS official_letters (
            id TEXT PRIMARY KEY,
            letter_number TEXT NOT NULL,
            title TEXT NOT NULL,
            source TEXT,
            destination TEXT,
            date_issued TEXT,
            expiry_date TEXT,
            category TEXT,
            summary TEXT,
            status TEXT DEFAULT 'active'
        )
        """)

        # 6. جدول التواصل الداخلي مع عناوين الـ IP للأجهزة المتصلة بالشبكة
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS internal_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT,
            receiver TEXT,
            subject TEXT,
            content TEXT,
            timestamp TEXT,
            priority TEXT DEFAULT 'normal',
            sender_ip TEXT DEFAULT '192.168.1.10',
            receiver_ip TEXT DEFAULT '192.168.1.20'
        )
        """)
        self.conn.commit()

    def insert_seed_data_if_empty(self):
        # التحقق من وجود بيانات سابقة لتفادي تكرار التهيئة
        self.cursor.execute("SELECT COUNT(*) FROM departments")
        if self.cursor.fetchone()[0] == 0:
            departments = [
                ('dentistry', 'طب الأسنان', 'كلية طب الأسنان', 8000000, 5),
                ('pharmacy', 'الصيدلة', 'كلية الصيدلة', 7000000, 5),
                ('software-eng', 'هندسة البرمجيات', 'كلية الهندسة التقنية', 3500000, 4),
                ('law', 'القانون', 'كلية القانون', 2800000, 4),
                ('business', 'إدارة الأعمال', 'كلية العلوم الإدارية', 1900000, 4)
            ]
            self.cursor.executemany("INSERT INTO departments VALUES (?, ?, ?, ?, ?)", departments)

            # إضافة طلاب افتراضيين للتجربة
            self.register_student('STU-1001', 'أحمد كريم عبد الحسن', 'ahmed@ahliya.edu.iq', '07701112223', '199923849102', 'software-eng', 'صباحي', 3500000)
            self.register_student('STU-1002', 'مريم جعفر صادق الموسوي', 'maryam@ahliya.edu.iq', '07802223334', '200192837482', 'dentistry', 'صباحي', 8000000)

            # مستندات افتراضية منتهية وقابلة للنفاذ للتجربة
            self.add_student_document('STU-1002', 'البطاقة الوطنية الموحدة', 1, '2026-04-10')
            self.add_student_document('STU-1002', 'الفحص الطبي السنوي', 1, '2026-09-12')
            self.add_student_document('STU-1001', 'هوية الأحوال المدنية', 1, '2028-11-20')

            # إيصالات دفع تجريبية
            self.add_payment('PAY-501', 'STU-1001', 1500000, '2026-01-15', 'REC-9081', 'tuition', 'نقدي')
            self.add_payment('PAY-502', 'STU-1002', 3000000, '2026-02-10', 'REC-9102', 'tuition', 'حوالة مصرفية')

            # كتب رسمية مع تواريخ انتهاء صلاحية مختلفة
            self.archive_letter('LET-2026-01', 'وزاري / ت ق / 2394', 'المنحة المجانية والتسجيل للعام ٢٠٢٦', 'وزارة التعليم العالي', 'رئاسة الجامعة', '2026-01-10', '2026-12-31', 'وزاري', 'تسهيل قبول الطلبة بالمنحة')
            self.archive_letter('LET-2026-02', 'أ م / صحة / 12', 'الفحوصات الطبية الملزمة للطلبة الجدد', 'وزارة الصحة', 'رئاسة الجامعة', '2026-02-01', '2026-05-01', 'وزاري', 'طلب الفحص الطبي الدوري - منتهية الصلاحية')

            # رسائل تواصل داخلي
            self.send_internal_message('رئاسة الجامعة', 'شؤون التسجيل والحسابات', 'تدقيق مستندات المقبولين الجدد ومتابعة منتهي الصلاحية', 'الرجاء تدقيق تواريخ صلاحية مستمسكات الكليات والتبليغ الفوري لمنتهية وثائقهم.', 'عالي')
            self.send_internal_message('مركز شؤون التسجيل', 'رئاسة الجامعة', 'إشعار تمديد أرشفة الكتب الرسمية', 'تمت الأرشفة وإصدار التنبيهات اللازمة للمشرفين.', 'عادي')

            self.conn.commit()

    # --- إدارة الطلاب والتسجيل ---
    def register_student(self, stu_id, name, email, phone, nat_id, dept_id, shift, fee):
        reg_date = date.today().strftime("%Y-%m-%d")
        try:
            self.cursor.execute("INSERT INTO students VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, ?)", 
                               (stu_id, name, email, phone, nat_id, dept_id, shift, reg_date, fee))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"خطأ أثناء التسجيل: {e}")
            return False

    def get_student_details(self, stu_id):
        self.cursor.execute("""
            SELECT s.id, s.name, s.email, s.phone, s.national_id, s.shift, s.stage, s.status, s.total_fee, d.name, d.college
            FROM students s JOIN departments d ON s.department_id = d.id
            WHERE s.id = ?
        """, (stu_id,))
        return self.cursor.fetchone()

    # --- إدارة المستمسكات والانتهاء ---
    def add_student_document(self, stu_id, doc_name, provided, expiry_date):
        self.cursor.execute("INSERT INTO student_documents (student_id, doc_name, provided, expiry_date) VALUES (?, ?, ?, ?)",
                           (stu_id, doc_name, provided, expiry_date))
        self.conn.commit()

    def check_expired_documents(self):
        today_str = date.today().strftime("%Y-%m-%d")
        self.cursor.execute("""
            SELECT s.id, s.name, sd.doc_name, sd.expiry_date 
            FROM student_documents sd JOIN students s ON sd.student_id = s.id
            WHERE sd.provided = 1 AND sd.expiry_date IS NOT NULL AND sd.expiry_date < ?
        """, (today_str,))
        return self.cursor.fetchall()

    # --- إدارة الحسابات والمدفوعات ---
    def add_payment(self, pay_id, student_id, amount, date_str, receipt, cat, method):
        try:
            self.cursor.execute("INSERT INTO payments VALUES (?, ?, ?, ?, ?, ?, ?)",
                               (pay_id, student_id, amount, date_str, receipt, cat, method))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"خطأ مالي: {e}")
            return False

    def get_student_ledger(self, student_id):
        self.cursor.execute("SELECT total_fee FROM students WHERE id = ?", (student_id,))
        row = self.cursor.fetchone()
        if not row:
            return None
        total_fee = row[0]

        self.cursor.execute("SELECT SUM(amount) FROM payments WHERE student_id = ? AND category IN ('tuition', 'registration')", (student_id,))
        paid = self.cursor.fetchone()[0] or 0
        remaining = max(0, total_fee - paid)

        self.cursor.execute("SELECT id, amount, pay_date, receipt_no, category, method FROM payments WHERE student_id = ? ORDER BY pay_date DESC", (student_id,))
        history = self.cursor.fetchall()

        return {
            "total": total_fee,
            "paid": paid,
            "remaining": remaining,
            "payments": history
        }

    # --- إدارة أرشيف الكتب الرسمية وصلاحيتها ---
    def archive_letter(self, letter_id, let_num, title, source, dest, issue_date, expiry_date, cat, summary):
        try:
            self.cursor.execute("INSERT INTO official_letters VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')",
                               (letter_id, let_num, title, source, dest, issue_date, expiry_date, cat, summary))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            print(f"خطأ في الأرشفة: {e}")
            return False

    def check_expired_letters(self):
        today_str = date.today().strftime("%Y-%m-%d")
        self.cursor.execute("""
            SELECT id, letter_number, title, expiry_date FROM official_letters 
            WHERE expiry_date IS NOT NULL AND expiry_date < ?
        """, (today_str,))
        return self.cursor.fetchall()

    def get_all_letters(self):
        self.cursor.execute("SELECT * FROM official_letters ORDER BY date_issued DESC")
        return self.cursor.fetchall()

    # --- التواصل الداخلي ---
    def send_internal_message(self, sender, receiver, subject, content, priority, sender_ip='192.168.1.10', receiver_ip='192.168.1.20'):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.cursor.execute("INSERT INTO internal_messages (sender, receiver, subject, content, timestamp, priority, sender_ip, receiver_ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                           (sender, receiver, subject, content, timestamp, priority, sender_ip, receiver_ip))
        self.conn.commit()

    def get_messages_for_role(self, role_name):
        self.cursor.execute("""
            SELECT id, sender, receiver, subject, content, timestamp, priority, sender_ip, receiver_ip
            FROM internal_messages 
            WHERE receiver LIKE ? OR receiver = 'جميع الكليات والاقسام' OR receiver = 'شؤون التسجيل والحسابات'
            ORDER BY timestamp DESC
        """, (f"%{role_name}%",))
        return self.cursor.fetchall()


# --- تشغيل القائمة التفاعلية كنسخة تجريبية للمستخدم ---
def print_separator():
    print("=" * 75)

def main():
    # فحص تاريخ انتهاء صلاحية البرنامج (1-7-2027)
    expiration_limit = "2027-07-01"
    current_date_str = datetime.now().strftime("%Y-%m-%d")
    if current_date_str >= expiration_limit:
        print_separator()
        print(" ❌ تنبيه أمني وتراخيص التشغيل | SYSTEM LICENSE EXPIRED")
        print(" عذراً، انتهت صلاحية هذا البرنامج المستقل وتراخيص العمل المقررة في تاريخ: 1 / 7 / 2027 م.")
        print(" للاتصال وتجديد الاشتراك أو الدعم الفني الفوري:")
        print(" اتصل بالرقم: 07832343995")
        print_separator()
        return

    system = AlAhliyaSystem()
    print_separator()
    print("       بوابة الجامعة الأهلية الإلكترونية - نظام الإدارة المتكامل (بايثون)")
    print("       Al-Ahliya Integrated University Management Script (CLI)")
    print_separator()
    
    while True:
        print("\\n[1] تسجيل طالب جديد ومستمسكاته")
        print("[2] عرض تفاصيل طالب وموقفه المالي والوصلات")
        print("[3] تسجيل دفعة مالية (قسط دراسي أو تسجيل)")
        print("[4] أرشفة كتاب رسمي جديد مع تاريخ انتهاء الصلاحية")
        print("[5] استعراض الأرشيف المركزي والكتب المنتهية الصلاحية")
        print("[6] بريد التواصل الداخلي (إرسال وقراءة الرسائل الرئاسية)")
        print("[7] تشغيل فحص صلاحية النظام والإنذارات المبكرة")
        print("[8] خروج")
        print_separator()
        choice = input("يرجى اختيار الإجراء المطلوب: ").strip()

        if choice == '1':
            stu_id = input("رقم التسجيل الجامعي (STU-XXXX): ")
            name = input("الاسم الرباعي واللقب للطلب: ")
            email = input("البريد الإلكتروني للطلب: ")
            phone = input("رقم هاتف الطالب: ")
            nat_id = input("الرقم الوطني الموحد للجنسية: ")
            print("الأقسام المتوفرة: software-eng, dentistry, pharmacy, law, business")
            dept = input("رمز القسم: ")
            shift = input("الدراسة (صباحي / مسائي): ")
            fee = int(input("القسط الإجمالي المحدد لهذا العام (بالدينار): "))
            
            if system.register_student(stu_id, name, email, phone, nat_id, dept, shift, fee):
                print("✔ تم تسجيل ملف الطالب بنجاح في قاعدة البيانات!")
                # إضافة مستمسكات افتراضية مع تاريخ التنبيه
                system.add_student_document(stu_id, 'البطاقة الوطنية الموحدة', 1, input("تاريخ انتهاء صلاحية الوطنية (YYYY-MM-DD): "))
                system.add_student_document(stu_id, 'الفحص الطبي', 1, input("تاريخ انتهاء صلاحية الفحص (YYYY-MM-DD): "))
                print("✔ تم تفعيل سجل المستمسكات وتواريخ الصلاحية بنجاح.")
            else:
                print("❌ فشل التسجيل. قد يكون رقم التسجيل مكرراً.")

        elif choice == '2':
            stu_id = input("أدخل رقم الطالب المستعلم عنه (STU-XXXX): ")
            details = system.get_student_details(stu_id)
            if details:
                print_separator()
                print(f"بطاقة الطالب: {details[1]} | القسم: {details[9]} - {details[10]}")
                print(f"الهاتف: {details[3]} | الجواز والوطنية: {details[4]} | الدراسة: {details[5]}")
                print(f"المرحلة الحالية: {details[6]} | حالة الملف الجامعي: {details[7]}")
                
                ledger = system.get_student_ledger(stu_id)
                print(f"القسط المطلوب: {ledger['total']:,} د.ع | المسدد: {ledger['paid']:,} د.ع | المتبقي بذمته: {ledger['remaining']:,} د.ع")
                print_separator()
                print("سجل الوصولات المالية المسجلة:")
                for pay in ledger['payments']:
                    print(f" - وصل {pay[3]}: دفع {pay[1]:,} د.ع في تاريخ {pay[2]} [طريقة: {pay[5]} / فئة: {pay[4]}]")
            else:
                print("❌ لا يوجد طالب بهذا الرقم الجامعي.")

        elif choice == '3':
            pay_id = "PAY-" + datetime.now().strftime("%M%S")
            stu_id = input("أدخل رقم الطالب لتسجيل الدفع: ")
            amount = int(input("المبلغ المدفوع (بالدينار): "))
            receipt = input("رقم الوصل المالي الورقي: ")
            cat = input("الفئة (tuition / registration / fine): ")
            method = input("طريقة الدفع (نقدي / زين كاش / مصرف): ")
            pay_date = date.today().strftime("%Y-%m-%d")
            
            if system.add_payment(pay_id, stu_id, amount, pay_date, receipt, cat, method):
                print(f"✔ تم تسجيل الوصل {receipt} بنجاح وتحصيل مبلغ {amount:,} د.ع.")
            else:
                print("❌ حدث خطأ أثناء ترحيل السداد المالي.")

        elif choice == '4':
            let_id = "LET-" + datetime.now().strftime("%M%S")
            let_num = input("الرقم الإداري الصادر للكتاب (مثال: ت/412): ")
            title = input("موضوع الكتاب الإداري: ")
            source = input("الجهة الصادرة (مثال: وزارة التعليم العالي): ")
            dest = input("الجهة الموجه إليها (مثال: مركز التسجيل): ")
            issued = input("تاريخ الصدور (YYYY-MM-DD): ")
            expiry = input("تاريخ انتهاء الصلاحية/العمل بالقرار (YYYY-MM-DD): ")
            cat = input("التصنيف (وزاري / أمر إداري / تعميم): ")
            summary = input("ملخص نص الكتاب والتعليمات: ")
            
            if system.archive_letter(let_id, let_num, title, source, dest, issued, expiry, cat, summary):
                print(f"✔ تم حفظ وأرشفة الكتاب الإداري وتعيين الصلاحية لتاريخ {expiry} بنجاح.")
            else:
                print("❌ فشل حفظ المستند.")

        elif choice == '5':
            print_separator()
            print("قائمة الكتب الرسمية والأوامر بالأرشيف المركزي:")
            letters = system.get_all_letters()
            for let in letters:
                print(f"▪ كود: {let[0]} | عدد: {let[1]} | موضوع: {let[2]}")
                print(f"  صادر من: {let[3]} ➔ إلى: {let[4]} | تنتهي صلاحيته في: {let[6]}")
            print_separator()

        elif choice == '6':
            print("[1] إرسال رسالة تواصل داخلية")
            print("[2] استعراض صندوق الوارد الفوري")
            sub_choice = input("اختر الخيار: ")
            if sub_choice == '1':
                sender = input("الجهة المرسِلة (رئاسة الجامعة / مركز التسجيل): ")
                receiver = input("المستلم (مثال: شؤون التسجيل والحسابات / البرمجيات): ")
                subject = input("الموضوع الداخلي: ")
                content = input("نص المراسلة الفورية: ")
                priority = input("الأولوية (عالي / عادي): ")
                sender_ip = input("IP الجهاز المرسِل (مثال: 192.168.1.10): ") or '192.168.1.10'
                receiver_ip = input("IP الجهاز المستلِم (مثال: 192.168.1.20): ") or '192.168.1.20'
                system.send_internal_message(sender, receiver, subject, content, priority, sender_ip, receiver_ip)
                print("✔ تم بث وتوجيه الرسالة بنجاح عبر بروتوكول IP بالشبكة المغلقة للجامعة.")
            elif sub_choice == '2':
                role = input("أدخل المسمى الوظيفي لعرض بريدك (مثال: رئاسة الجامعة / شؤون التسجيل): ")
                msgs = system.get_messages_for_role(role)
                print_separator()
                print(f"صندوق الوارد لـ {role}:")
                for m in msgs:
                    print(f" ✉ من: {m[1]} (IP المصدر: {m[7]}) | الأولوية: {m[6]} | التاريخ: {m[5]}")
                    print(f"   المستهدف: {m[2]} (IP الهدف: {m[8]})")
                    print(f"   الموضوع: {m[3]}")
                    print(f"   الرسالة: {m[4]}")
                    print("-" * 40)

        elif choice == '7':
            print_separator()
            print("⏳ جاري تشغيل وحدة التدقيق وفحص التواريخ والإنذارات المبكرة...")
            today = date.today().strftime("%Y-%m-%d")
            print(f"تاريخ النظام الحالي: {today}")
            
            # فحص وثائق الطلبة منتهية الصلاحية
            expired_docs = system.check_expired_documents()
            print("\\n⚠️ إنذار صلاحية وثائق ومستمسكات الطلبة المودعة:")
            if expired_docs:
                for doc in expired_docs:
                    print(f" ✘ طالب: {doc[1]} ({doc[0]}) | وثيقة منتهية: {doc[2]} | الصلاحية نفذت في {doc[3]}")
            else:
                print(" ✔ لا توجد وثائق مستمسكات منتهية الصلاحية لكافة الطلاب المسجلين.")

            # فحص الكتب الإدارية الصادر بها توجيهات منتهية الصلاحية
            expired_lets = system.check_expired_letters()
            print("\\n⚠️ إنذار انتهاء فاعلية الكتب الرسمية والتوجيهات الإدارية:")
            if expired_lets:
                for let in expired_lets:
                    print(f" ✘ كتاب كود: {let[0]} | رقم: {let[1]} | عنوان: {let[2]} | تاريخ الانتهاء: {let[3]}")
            else:
                print(" ✔ جميع الكتب والتعميمات الحالية ذات مرونة فعالة وقوانينها جارية.")
            print_separator()

        elif choice == '8':
            system.conn.close()
            print("تم إغلاق نظام الجامعة الأهلية بنجاح. مع السلامة!")
            break
        else:
            print("❌ اختيار غير صحيح، يرجى إعادة المحاولة.")

if __name__ == '__main__':
    main()
`
