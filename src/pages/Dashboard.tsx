import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import SignaturePad from "../components/SignaturePad";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import PdfIframeViewer from "../components/PdfIframeViewer";
import StatusFilter from "../components/filters/StatusFilter";
import SignerAssignment from "../components/SignerAssignment";

type PdfFile = {
  name: string;
};

const base64ToUint8Array = (base64: string) => {
  const pureBase64 = base64.split(",")[1];
  const binary = atob(pureBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export default function Dashboard() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [fileStatusMap, setFileStatusMap] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "signed">("all");

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [originalPdfBytes, setOriginalPdfBytes] = useState<Uint8Array | null>(null);

  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [drawSignature, setDrawSignature] = useState<string | null>(null);
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFont, setSelectedFont] = useState<"cursive" | "serif">("cursive");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [signaturePosition, setSignaturePosition] =
    useState<{ x: number; y: number } | null>(null);

  const [signedFileUrl, setSignedFileUrl] = useState<string | null>(null);
  const [docStatus, setDocStatus] = useState<"pending" | "signed">("pending");

  /* ================= LOAD FILES ================= */
  useEffect(() => {
    fetchFiles();
    fetchAllStatuses();
  }, []);

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from("documents").list("pdfs");
    setFiles(data ?? []);
  };

  const fetchAllStatuses = async () => {
    const { data, error } = await supabase
      .from("document_signatures")
      .select("file_id, status");

    if (error) {
      console.error(error);
      return;
    }

    const map: Record<string, string> = {};
    data?.forEach((row) => {
      map[row.file_id] = row.status;
    });

    setFileStatusMap(map);
  };

  /* ================= FILTER LOGIC ================= */
  const filteredFiles = files.filter((file) => {
    const status = fileStatusMap[file.name] || "pending";
    if (statusFilter === "all") return true;
    if (statusFilter === "pending") return status === "pending";
    if (statusFilter === "signed") return status === "signed";
    return true;
  });

  /* ================= OPEN PDF ================= */
  const openFile = async (fileName: string) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(`pdfs/${fileName}`, 300);

    if (error || !data?.signedUrl) {
      alert("Failed to open PDF");
      return;
    }

    setPdfUrl(data.signedUrl);
    setCurrentFileName(fileName);

    const res = await fetch(data.signedUrl);
    const buffer = await res.arrayBuffer();
    setOriginalPdfBytes(new Uint8Array(buffer));

    const status = fileStatusMap[fileName] || "pending";
    setDocStatus(status === "signed" ? "signed" : "pending");
  };

  /* ================= SIGN PDF ================= */
  const signPdf = async () => {
    if (!pdfUrl || !currentFileName || !originalPdfBytes) {
      alert("Missing data");
      return;
    }

    if (!signaturePosition) {
      alert("Place signature first");
      return;
    }

    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    const page = pdfDoc.getPages().slice(-1)[0];

    const scale = page.getSize().width / 800;
    const x = signaturePosition.x * scale;
    const y = (600 - signaturePosition.y) * scale;

    if (signatureMode === "draw" && drawSignature) {
      const png = await pdfDoc.embedPng(base64ToUint8Array(drawSignature));
      const dims = png.scale(0.4);
      page.drawImage(png, { x, y, width: dims.width, height: dims.height });
    }

    if (signatureMode === "type") {
      const font =
        selectedFont === "cursive"
          ? await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
          : await pdfDoc.embedFont(StandardFonts.TimesRoman);

      const sizes = { small: 16, medium: 24, large: 32 };

      page.drawText(typedSignature, {
        x,
        y,
        size: sizes[fontSize],
        font,
        color: rgb(0, 0, 0),
      });
    }

    const signedBytes = await pdfDoc.save();

    const blob = new Blob([new Uint8Array(signedBytes)], { type: "application/pdf" });
    const signedName = `signed-${Date.now()}.pdf`;

    await supabase.storage
      .from("documents")
      .upload(`signed/${signedName}`, blob, { upsert: true });

    const { data } = supabase.storage
      .from("documents")
      .getPublicUrl(`signed/${signedName}`);

    setSignedFileUrl(data.publicUrl);
    setDocStatus("signed");

    await supabase
      .from("document_signatures")
      .update({
        status: "signed",
        signed_file_url: data.publicUrl,
        signed_at: new Date().toISOString(),
      })
      .eq("file_id", currentFileName);

    fetchAllStatuses();
    alert("PDF signed successfully");
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h2>Dashboard</h2>

      <h3>Uploaded PDFs</h3>

      <StatusFilter value={statusFilter} onChange={setStatusFilter} />

      {filteredFiles.map((f) => (
        <div
          key={f.name}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <b>{f.name}</b>
            <div style={{ fontSize: 12 }}>
              Status: {fileStatusMap[f.name] || "pending"}
            </div>
          </div>

          <button onClick={() => openFile(f.name)}>Open</button>
        </div>
      ))}

      {currentFileName && <SignerAssignment fileId={currentFileName} />}

      {docStatus === "pending" && (
        <button onClick={signPdf} style={{ marginTop: 10 }}>
          Sign Document
        </button>
      )}

      {docStatus === "signed" && signedFileUrl && (
        <button onClick={() => window.open(signedFileUrl, "_blank")}>
          Download Signed PDF
        </button>
      )}

      {pdfUrl && (
        <PdfIframeViewer
          pdfUrl={pdfUrl}
          drawSignature={drawSignature}
          typedSignature={typedSignature}
          signatureMode={signatureMode}
          onSignaturePositionChange={setSignaturePosition}
          onClose={() => setPdfUrl(null)}
        />
      )}
    </div>
  );
}