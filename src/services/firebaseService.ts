/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, storage } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  DocumentSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  uploadString 
} from 'firebase/storage';
import { 
  Student, 
  Payment, 
  OfficialLetter, 
  InternalMessage, 
  Department 
} from '../types';
import { 
  mockStudents, 
  mockDepartments, 
  mockPayments 
} from '../data/mockData';

export type SyncStatus = 'connected' | 'offline' | 'syncing' | 'error';

/**
 * خدمة إدارة المزامنة السحابية الموحدة
 */
class FirebaseDataService {
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private currentStatus: SyncStatus = 'connected';

  constructor() {
    // مراقبة حالة اتصال المتصفح بالشبكة
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateStatus('connected'));
      window.addEventListener('offline', () => this.updateStatus('offline'));
    }
  }

  public subscribeStatus(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  private updateStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.syncListeners.forEach(cb => cb(status));
  }

  // ==========================================
  // مزامنة الطلاب (Students)
  // ==========================================
  public async saveStudents(students: Student[]): Promise<boolean> {
    try {
      this.updateStatus('syncing');
      localStorage.setItem('AL_AHLIYA_STUDENTS', JSON.stringify(students));
      await setDoc(doc(db, "appData", "students"), { 
        list: students,
        updatedAt: new Date().toISOString()
      });
      this.updateStatus('connected');
      return true;
    } catch (error) {
      console.warn("Failed to sync students to cloud, saved locally:", error);
      this.updateStatus('offline');
      return false;
    }
  }

  public listenStudents(onData: (students: Student[]) => void): Unsubscribe {
    return onSnapshot(
      doc(db, "appData", "students"),
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.list)) {
            onData(data.list);
            localStorage.setItem('AL_AHLIYA_STUDENTS', JSON.stringify(data.list));
            this.updateStatus('connected');
          }
        }
      },
      (error) => {
        console.warn("Students live sync notice (using local cache):", error);
        this.updateStatus('offline');
      }
    );
  }

  // ==========================================
  // مزامنة الأقسام والكليات (Departments)
  // ==========================================
  public async saveDepartments(departments: Department[]): Promise<boolean> {
    try {
      this.updateStatus('syncing');
      localStorage.setItem('AL_AHLIYA_DEPARTMENTS', JSON.stringify(departments));
      await setDoc(doc(db, "appData", "departments"), { 
        list: departments,
        updatedAt: new Date().toISOString()
      });
      this.updateStatus('connected');
      return true;
    } catch (error) {
      console.warn("Failed to sync departments to cloud, saved locally:", error);
      this.updateStatus('offline');
      return false;
    }
  }

  public listenDepartments(onData: (departments: Department[]) => void): Unsubscribe {
    return onSnapshot(
      doc(db, "appData", "departments"),
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.list)) {
            onData(data.list);
            localStorage.setItem('AL_AHLIYA_DEPARTMENTS', JSON.stringify(data.list));
            this.updateStatus('connected');
          }
        }
      },
      (error) => {
        console.warn("Departments live sync notice (using local cache):", error);
        this.updateStatus('offline');
      }
    );
  }

  // ==========================================
  // مزامنة الوصولات والعمليات المالية (Payments)
  // ==========================================
  public async savePayments(payments: Payment[]): Promise<boolean> {
    try {
      this.updateStatus('syncing');
      localStorage.setItem('AL_AHLIYA_PAYMENTS', JSON.stringify(payments));
      await setDoc(doc(db, "appData", "payments"), { 
        list: payments,
        updatedAt: new Date().toISOString()
      });
      this.updateStatus('connected');
      return true;
    } catch (error) {
      console.warn("Failed to sync payments to cloud, saved locally:", error);
      this.updateStatus('offline');
      return false;
    }
  }

  public listenPayments(onData: (payments: Payment[]) => void): Unsubscribe {
    return onSnapshot(
      doc(db, "appData", "payments"),
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.list)) {
            onData(data.list);
            localStorage.setItem('AL_AHLIYA_PAYMENTS', JSON.stringify(data.list));
            this.updateStatus('connected');
          }
        }
      },
      (error) => {
        console.warn("Payments live sync notice (using local cache):", error);
        this.updateStatus('offline');
      }
    );
  }

  // ==========================================
  // مزامنة الكتب الرسمية الصادرة والواردة (Official Letters)
  // ==========================================
  public async saveLetters(letters: OfficialLetter[]): Promise<boolean> {
    try {
      this.updateStatus('syncing');
      localStorage.setItem('AL_AHLIYA_LETTERS', JSON.stringify(letters));
      await setDoc(doc(db, "appData", "letters"), { 
        list: letters,
        updatedAt: new Date().toISOString()
      });
      this.updateStatus('connected');
      return true;
    } catch (error) {
      console.warn("Failed to sync letters to cloud, saved locally:", error);
      this.updateStatus('offline');
      return false;
    }
  }

  public listenLetters(onData: (letters: OfficialLetter[]) => void): Unsubscribe {
    return onSnapshot(
      doc(db, "appData", "letters"),
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.list)) {
            onData(data.list);
            localStorage.setItem('AL_AHLIYA_LETTERS', JSON.stringify(data.list));
            this.updateStatus('connected');
          }
        }
      },
      (error) => {
        console.warn("Letters live sync notice (using local cache):", error);
        this.updateStatus('offline');
      }
    );
  }

  // ==========================================
  // مزامنة المراسلات والبريد الداخلي (Internal Messages)
  // ==========================================
  public async saveMessages(messages: InternalMessage[]): Promise<boolean> {
    try {
      this.updateStatus('syncing');
      localStorage.setItem('AL_AHLIYA_MESSAGES', JSON.stringify(messages));
      await setDoc(doc(db, "appData", "messages"), { 
        list: messages,
        updatedAt: new Date().toISOString()
      });
      this.updateStatus('connected');
      return true;
    } catch (error) {
      console.warn("Failed to sync messages to cloud, saved locally:", error);
      this.updateStatus('offline');
      return false;
    }
  }

  public listenMessages(onData: (messages: InternalMessage[]) => void): Unsubscribe {
    return onSnapshot(
      doc(db, "appData", "messages"),
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.list)) {
            onData(data.list);
            localStorage.setItem('AL_AHLIYA_MESSAGES', JSON.stringify(data.list));
            this.updateStatus('connected');
          }
        }
      },
      (error) => {
        console.warn("Messages live sync notice (using local cache):", error);
        this.updateStatus('offline');
      }
    );
  }

  // ==========================================
  // رفع الملفات والصور السحابية (Firebase Storage)
  // ==========================================
  public async uploadFile(
    fileData: string | Blob, 
    path: string, 
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        // Base64 Data URL
        await uploadString(storageRef, fileData, 'data_url');
      } else if (fileData instanceof Blob) {
        await uploadBytes(storageRef, fileData, { contentType });
      }
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.warn("Firebase Storage upload fallback (retaining local data):", error);
      if (typeof fileData === 'string') return fileData;
      return '';
    }
  }

  // ==========================================
  // تهيئة وتعبئة البيانات السحابية الأولية (Cloud Seed Utility)
  // ==========================================
  public async seedCloudIfEmpty(): Promise<{ success: boolean; seeded: boolean; message: string }> {
    try {
      this.updateStatus('syncing');
      
      const stuDoc = await getDoc(doc(db, "appData", "students"));
      const deptDoc = await getDoc(doc(db, "appData", "departments"));
      const payDoc = await getDoc(doc(db, "appData", "payments"));

      let didSeed = false;

      if (!stuDoc.exists() || !stuDoc.data()?.list || stuDoc.data().list.length === 0) {
        await setDoc(doc(db, "appData", "students"), { 
          list: mockStudents,
          updatedAt: new Date().toISOString()
        });
        didSeed = true;
      }

      if (!deptDoc.exists() || !deptDoc.data()?.list || deptDoc.data().list.length === 0) {
        await setDoc(doc(db, "appData", "departments"), { 
          list: mockDepartments,
          updatedAt: new Date().toISOString()
        });
        didSeed = true;
      }

      if (!payDoc.exists() || !payDoc.data()?.list || payDoc.data().list.length === 0) {
        await setDoc(doc(db, "appData", "payments"), { 
          list: mockPayments,
          updatedAt: new Date().toISOString()
        });
        didSeed = true;
      }

      this.updateStatus('connected');
      return { 
        success: true, 
        seeded: didSeed, 
        message: didSeed ? 'تم رفع وتهيئة البيانات الأولية إلى السحابة بنجاح!' : 'البيانات السحابية متصلة ومحدثة بالفعل.' 
      };
    } catch (err: any) {
      console.warn("Cloud seed error:", err);
      this.updateStatus('offline');
      return { 
        success: false, 
        seeded: false, 
        message: 'تعذر الاتصال بالسحابة حالياً، يستمر النظام بالعمل على الذاكرة المحلية بأمان.' 
      };
    }
  }
}

export const firebaseService = new FirebaseDataService();
