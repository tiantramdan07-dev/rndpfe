import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

type Log = {
  id: number;
  type: "PINJAM" | "KEMBALI";
  image: string;
  time: string;
};

function App() {
  const webcamRef = useRef<Webcam>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [actionType, setActionType] = useState<"PINJAM" | "KEMBALI" | null>(null);

  const API_BASE_URL = "http://localhost:5000";

  // 🔹 Ambil data dari backend
  const loadLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/logs`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Gagal load logs:", err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const startCamera = (type: "PINJAM" | "KEMBALI") => {
    setActionType(type);
    setCameraOn(true);
  };

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || !actionType) return;

    try {
      await fetch(`${API_BASE_URL}/save_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageSrc,
          type: actionType,
        }),
      });

      loadLogs();
      setCameraOn(false);
      setActionType(null);
    } catch (err) {
      console.error("Gagal kirim ke server:", err);
      alert("Gagal menyimpan data");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📷 Sistem Log R&D</h1>
        <p>Pencatatan Peminjaman & Pengembalian Barang</p>
      </header>

      {/* Kontrol Kamera */}
      <main style={styles.main}>
        {!cameraOn ? (
          <div style={styles.buttonGroup}>
            <button onClick={() => startCamera("PINJAM")} style={{...styles.btn, ...styles.btnPinjam}}>
              OUT (PINJAM)
            </button>
            <button onClick={() => startCamera("KEMBALI")} style={{...styles.btn, ...styles.btnKembali}}>
              IN (KEMBALI)
            </button>
          </div>
        ) : (
          <div style={styles.cameraBox}>
            <div style={styles.badge}>{actionType} MODE</div>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              style={styles.webcam}
            />
            <div style={styles.cameraControls}>
              <button onClick={capture} style={styles.btnCapture}>Ambil Foto & Simpan</button>
              <button onClick={() => setCameraOn(false)} style={styles.btnCancel}>Batal</button>
            </div>
          </div>
        )}

        <hr style={styles.divider} />

        {/* Riwayat Aktivitas */}
        <section>
          <div style={styles.sectionHeader}>
            <h2>Riwayat 10 Terakhir</h2>
            {/* <button onClick={loadLogs} style={styles.btnRefresh}>🔄 Refresh</button> */}
          </div>

          <div style={styles.grid}>
            {logs.map((log) => (
              <div key={log.id} style={styles.card}>
                <div style={{
                  ...styles.cardStatus, 
                  backgroundColor: log.type === "PINJAM" ? "#e74c3c" : "#2ecc71"
                }}>
                  {log.type}
                </div>
                <img 
                  src={`${API_BASE_URL}${log.image}`} 
                  alt="log" 
                  style={styles.cardImg} 
                />
                <div style={styles.cardBody}>
                  <div style={styles.cardTime}>📅 {log.time}</div>
                  <div style={styles.cardId}>ID: #{log.id}</div>
                </div>
              </div>
            ))}
          </div>

          {logs.length === 0 && (
            <div style={styles.emptyState}>Belum ada riwayat tercatat hari ini.</div>
          )}
        </section>
      </main>
    </div>
  );
}

// 🔹 Inline Styles untuk Kemudahan
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "20px 40px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  main: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  buttonGroup: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    marginBottom: "40px",
  },
  btn: {
    padding: "15px 30px",
    fontSize: "1rem",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.1s, opacity 0.2s",
    color: "white",
  },
  btnPinjam: { backgroundColor: "#e74c3c" },
  btnKembali: { backgroundColor: "#2ecc71" },
  cameraBox: {
    textAlign: "center",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  webcam: {
    borderRadius: "10px",
    width: "100%",
    maxWidth: "480px",
  },
  cameraControls: {
    marginTop: "15px",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  btnCapture: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  btnCancel: {
    padding: "10px 20px",
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#34495e",
    color: "white",
    borderRadius: "20px",
    fontSize: "0.8rem",
    marginBottom: "10px",
  },
  divider: { margin: "40px 0", border: "0.5px solid #ddd" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  btnRefresh: {
    background: "none",
    border: "1px solid #ddd",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #eee",
  },
  cardStatus: {
    padding: "6px",
    textAlign: "center",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardImg: {
    width: "100%",
    height: "140px",
    objectFit: "cover",
  },
  cardBody: { padding: "12px" },
  cardTime: { fontSize: "0.8rem", color: "#2c3e50", fontWeight: 600 },
  cardId: { fontSize: "0.7rem", color: "#95a5a6", marginTop: "4px" },
  emptyState: { textAlign: "center", color: "#95a5a6", padding: "40px" }
};

export default App;