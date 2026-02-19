import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import "./App.css";

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

  // 🔹 Ambil data dari backend saat halaman dibuka
  const loadLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/logs");
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
      await fetch("http://localhost:5000/save_log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageSrc,
          type: actionType,
        }),
      });

      // reload data dari server
      loadLogs();

      setCameraOn(false);
      setActionType(null);
    } catch (err) {
      console.error("Gagal kirim ke server:", err);
      alert("Gagal menyimpan data");
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>📷 Peminjaman Barang R&D</h1>

      {!cameraOn && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => startCamera("PINJAM")} style={{ marginRight: 10 }}>
            PINJAM
          </button>

          <button onClick={() => startCamera("KEMBALI")}>
            KEMBALIKAN
          </button>
        </div>
      )}

      {cameraOn && (
        <div>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
          />
          <br />
          <button onClick={capture} style={{ marginTop: 10 }}>
            Ambil Foto
          </button>
        </div>
      )}

      <h2>Riwayat Aktivitas</h2>

      {logs.map((log) => (
        <div
          key={log.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
            width: 260,
          }}
        >
          <strong>{log.type}</strong>
          <br />
          <small>{log.time}</small>
          <br />
          <img
            src={`http://localhost:5000${log.image}`}
            width={220}
          />
        </div>
      ))}
    </div>
  );
}

export default App;
