import { Material, HistoryItem, Exam } from '../types';

const DB_NAME = 'PersonaLearnDB';
const STORE_MATERIALS = 'materials';
const DB_VERSION = 1;

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MATERIALS)) {
        db.createObjectStore(STORE_MATERIALS, { keyPath: 'id' });
      }
    };
  });
};

export const StorageService = {
  // LocalStorage wrappers for lightweight JSON data
  getHistory: (role: string): HistoryItem[] => {
    const data = localStorage.getItem(`history_${role}`);
    return data ? JSON.parse(data) : [];
  },

  addHistoryItem: (role: string, item: HistoryItem) => {
    const history = StorageService.getHistory(role);
    const newHistory = [item, ...history];
    localStorage.setItem(`history_${role}`, JSON.stringify(newHistory));
  },

  deleteHistoryItem: (role: string, id: string) => {
    const history = StorageService.getHistory(role);
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem(`history_${role}`, JSON.stringify(newHistory));
  },

  // Exams are now global for this demo so Students see what Teachers schedule
  getExams: (): Exam[] => {
    const data = localStorage.getItem(`exams_global`);
    if (!data) {
       // Return empty if no exams, let the UI handle the empty state or user create one
       return [];
    }
    return JSON.parse(data);
  },

  saveExam: (exam: Exam) => {
    const exams = StorageService.getExams();
    localStorage.setItem(`exams_global`, JSON.stringify([...exams, exam]));
  },

  // IndexedDB wrappers for large files (Materials)
  saveMaterial: async (material: Material): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(STORE_MATERIALS, 'readwrite');
    const store = tx.objectStore(STORE_MATERIALS);
    store.put(material);
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
  },

  getAllMaterials: async (): Promise<Material[]> => {
    const db = await openDB();
    const tx = db.transaction(STORE_MATERIALS, 'readonly');
    const store = tx.objectStore(STORE_MATERIALS);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Statistics Aggregation for Dashboard
  getStudentStats: async () => {
      const history = StorageService.getHistory('STUDENT');
      const materials = await StorageService.getAllMaterials();
      const exams = StorageService.getExams();

      // 1. Calculate Streak (Consecutive days with activity)
      // For simplicity, we count unique days in history
      const uniqueDays = new Set(history.map(h => new Date(h.createdAt).toDateString()));
      const streak = uniqueDays.size;

      // 2. Weekly Goal (arbitrary goal of 10 generations per week)
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const thisWeekActivity = history.filter(h => h.createdAt > oneWeekAgo).length;
      const weeklyGoal = Math.min(Math.round((thisWeekActivity / 10) * 100), 100);

      // 3. Activity Chart Data (Last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = days.map(day => ({ name: day, value: 0 }));
      
      history.forEach(h => {
          if (h.createdAt > oneWeekAgo) {
              const d = new Date(h.createdAt);
              const dayIndex = d.getDay(); // 0 is Sunday
              chartData[dayIndex].value += 1;
          }
      });
      // Rotate chart data so today is last? Or just static Mon-Sun. Let's keep Mon-Sun order mostly.
      // Reordering to start from Mon for display usually looks better
      const rotatedChartData = [...chartData.slice(1), chartData[0]]; // Mon-Sun

      return {
          streak,
          materialsCount: materials.length,
          weeklyGoal,
          activityData: rotatedChartData,
          upcomingExams: exams.filter(e => new Date(e.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3)
      };
  }
};