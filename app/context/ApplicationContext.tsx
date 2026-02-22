import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Application {

  id: string;
  status: "draft" | "verification" | "revision" | "publication" | "completed";
  createdAt: string;
  updatedAt: string;
  
  // Data Penerbangan
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
  
  // Data Pasien
  namaPasien: string;
  jenisKelamin: string;
  tanggalLahir: string;
  
  // Kondisi Pasien
  memerlukanOksigen: string;
  posisiPasien: string;
  tingkatKesadaran: string;
  tekananDarah: string;
  nadi: string;
  frekuensiPernafasan: string;
  saturasiOksigen: string;
  
  // Pendamping
  jumlahPendamping: string;
  hubunganDenganPasien: string;
  namaPendamping: string;
  noTeleponPendamping: string;
  noTeleponKeluarga: string;
  noSuratIzinPraktik: string;

  // Upload Dokumen
  fotoKondisi: string;
  ktpPaspor: string;
  manifest: string;
  rekamMedis: string;
  suratRujukan: string;
  tiketPesawat: string;
  dokumenMedis: string;


  // Revision notes
  revisionNotes?: string;
}

interface ApplicationContextType {
  applications: Application[];
  addApplication: (app: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">) => void;
  updateApplication: (id: string, data: Partial<Application>) => void;
  moveToVerification: (id: string) => void;
  moveToRevision: (id: string, notes: string) => void;
  moveToPublication: (id: string) => void;
  moveToCompleted: (id: string) => void;
  saveDraft: (data: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">) => void;
  getApplicationsByStatus: (status: Application["status"]) => Application[];
  deleteApplication: (id: string) => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(() => {
    const stored = localStorage.getItem("medivaq-applications");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("medivaq-applications", JSON.stringify(applications));
  }, [applications]);

  const addApplication = (appData: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">) => {
    const newApp: Application = {
      ...appData,
      id: `APP${Date.now()}`,
      status: "verification",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications(prev => [...prev, newApp]);
  };

  const updateApplication = (id: string, data: Partial<Application>) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id
          ? { ...app, ...data, updatedAt: new Date().toISOString() }
          : app
      )
    );
  };

  const moveToVerification = (id: string) => {
    updateApplication(id, { status: "verification", revisionNotes: undefined });
  };

  const moveToRevision = (id: string, notes: string) => {
    updateApplication(id, { status: "revision", revisionNotes: notes });
  };

  const moveToPublication = (id: string) => {
    updateApplication(id, { status: "publication" });
  };

  const moveToCompleted = (id: string) => {
    updateApplication(id, { status: "completed" });
  };

  const saveDraft = (appData: Omit<Application, "id" | "createdAt" | "updatedAt" | "status">) => {
    const newDraft: Application = {
      ...appData,
      id: `DRAFT${Date.now()}`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications(prev => [...prev, newDraft]);
  };

  const getApplicationsByStatus = (status: Application["status"]) => {
    return applications.filter(app => app.status === status);
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        addApplication,
        updateApplication,
        moveToVerification,
        moveToRevision,
        moveToPublication,
        moveToCompleted,
        saveDraft,
        getApplicationsByStatus,
        deleteApplication,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplications must be used within ApplicationProvider");
  }
  return context;
}
