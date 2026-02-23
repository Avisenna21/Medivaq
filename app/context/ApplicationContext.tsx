'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

export interface Application {
  id: string;
  status: 'draft' | 'verification' | 'revision' | 'publication' | 'completed';
  createdAt: string;
  updatedAt: string;

  jenisLayanan: string;
  jenisKeberangkatan: string;
  jenisPesawat: string;
  namaGroundhandling: string;
  namaPetugas: string;
  noTelepon: string;
  emailPerusahaan: string;
  namaMaskapai: string;
  noPenerbangan: string;
  noKursi: string;
  tanggalPerjalanan: string;
  jamPerjalanan: string;

  namaPasien: string;
  jenisKelamin: string;
  tanggalLahir: string;

  memerlukanOksigen: string;
  posisiPasien: string;
  tingkatKesadaran: string;
  tekananDarah: string;
  nadi: string;
  frekuensiPernafasan: string;
  saturasiOksigen: string;

  jumlahPendamping: string;
  hubunganDenganPasien: string;
  namaPendamping: string;
  noTeleponPendamping: string;
  noTeleponKeluarga: string;
  noSuratIzinPraktik: string;

  fotoKondisi: string;
  ktpPaspor: string;
  manifest: string;
  rekamMedis: string;
  suratRujukan: string;
  tiketPesawat: string;
  dokumenMedis: string;

  revisionNotes?: string;
}

interface ApplicationContextType {
  applications: Application[];
  isReady: boolean;
  addApplication: (
    app: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ) => void;
  updateApplication: (id: string, data: Partial<Application>) => void;
  getApplicationsByStatus: (status: Application['status']) => Application[];
  deleteApplication: (id: string) => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(
  undefined,
);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isReady, setIsReady] = useState(false);

  // ✅ load dari localStorage hanya di client
  useEffect(() => {
    const stored = localStorage.getItem('medivaq-applications');
    if (stored) setApplications(JSON.parse(stored));
    setIsReady(true);
  }, []);

  // ✅ sync ke localStorage
  useEffect(() => {
    if (isReady) {
      localStorage.setItem(
        'medivaq-applications',
        JSON.stringify(applications),
      );
    }
  }, [applications, isReady]);

  const addApplication = (
    appData: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ) => {
    const newApp: Application = {
      ...appData,
      id: `APP${Date.now()}`,
      status: 'verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications((prev) => [...prev, newApp]);
  };

  const updateApplication = (id: string, data: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, ...data, updatedAt: new Date().toISOString() }
          : app,
      ),
    );
  };

  const getApplicationsByStatus = (status: Application['status']) => {
    return applications.filter((app) => app.status === status);
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        isReady,
        addApplication,
        updateApplication,
        getApplicationsByStatus,
        deleteApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(ApplicationContext);
  if (!ctx)
    throw new Error('useApplications must be used within ApplicationProvider');
  return ctx;
}
