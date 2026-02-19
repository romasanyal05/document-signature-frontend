import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";
import SignaturePad from "../components/SignaturePad";
import PdfIframeViewer from "../components/PdfIframeViewer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const base64ToUint8Array = (base64: string) => {
  const pure = base64.split(",")[1];
  const binary = atob(pure);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export default function SignDocument() {
  const { token } = useParams();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [drawSignature, setDrawSignature] = useState<string | null>(null);
  const [typedSignature, setTypedSignature] = useState("");

  const [signaturePosition, setSignaturePosition] =
    useState<{ x: number; y: number } | null>(null);

  // 🔹 fetch PDF using token (simplified for now)
  useEffect(() => {
    async function loadPdf() {
      // TODO: later token validate + file fetch
      const { data } = await supabase.storage
        .from("documents")
        .list("pdfs", { limit: 1 });

      if (!data || !data[0]) return;

      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(`pdfs/${data[0].name}`, 300);

      if (!signed?.signedUrl) return;

      setPdfUrl(signed.signedUrl);

      const res = await fetch(signed.signedUrl);
      const buf = await res.arrayBuffer();
      setPdfBytes(new Uint8Array(buf));
    }

    loadPdf();
  }, []);

  const signPdf = async () => {
    if (!pdfBytes || !signaturePosition) {
      alert("Signature place करो");
      return;
    }

    if (signatureMode === "draw" && !drawSignature) {
      alert("Draw signature missing");
      return;
    }

    if (signatureMode === "type" && !typedSignature.trim()) {
      alert("Type signature missing");
      return;
    }

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPages().slice(-1)[0];

    const x = signaturePosition.x;
    const y = signaturePosition.y;

    if (signatureMode === "draw" && drawSignature) {
      const pngBytes = base64ToUint8Array(drawSignature);
      const image = await pdfDoc.embedPng(pngBytes);
      const dims = image.scale(0.4);

      page.drawImage(image, {
        x,
        y,
        width: dims.width,
        height: dims.height,
      });
    }

    if (signatureMode === "type") {
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      page.drawText(typedSignature, {
        x,
        y,
        size: 24,
        font,
        color: rgb(0, 0, 0),
      });
    }

    const signedBytes = await pdfDoc.save();
    const blob = new Blob([signedBytes], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sign Document</h2>

      {/* MODE BUTTONS */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setSignatureMode("draw")}>Draw ✍️</button>
        <button onClick={() => setSignatureMode("type")}>Type ⌨️</button>
      </div>

      {/* TYPE SIGNATURE */}
      {signatureMode === "type" && (
        <input
          placeholder="Type your name"
          value={typedSignature}
          onChange={(e) => setTypedSignature(e.target.value)}
          style={{ padding: "8px", marginBottom: "10px" }}
        />
      )}

      {/* DRAW SIGNATURE */}
      {signatureMode === "draw" && (
        <SignaturePad
          onSave={(img) => setDrawSignature(img)}
          onClear={() => setDrawSignature(null)}
        />
      )}

      <br />

      <button onClick={signPdf} style={{ padding: "10px", marginBottom: "10px" }}>
        Sign Document ✅
      </button>

      {/* PDF VIEWER */}
      {pdfUrl && (
        <PdfIframeViewer
          pdfUrl={pdfUrl}
          onClose={() => {}}
          drawSignature={drawSignature}
          typedSignature={typedSignature}
          signatureMode={signatureMode}
          onSignaturePositionChange={(pos) => setSignaturePosition(pos)}
        />
      )}
    </div>
  );
}