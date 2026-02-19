import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import SignaturePad from "../components/SignaturePad";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/* Set PDF.js worker source to a valid CDN URL */
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js`;

/* utils */
const base64ToUint8Array = (base64: string) => {
  const pure = base64.split(",")[1];
  const binary = atob(pure);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

type PdfFile = { name: string };

export default function Dashboard() {
  /* upload */
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [uploading, setUploading] = useState(false);

  /* pdf preview */
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  /* signature */
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [drawSignature, setDrawSignature] = useState<string | null>(null);
  const [typedSignature, setTypedSignature] = useState("");
  const [selectedFont, setSelectedFont] =
    useState<"cursive" | "serif">("cursive");
  const [fontSize, setFontSize] =
    useState<"small" | "medium" | "large">("medium");

  /* load files */
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from("documents").list("pdfs");
    setFiles(data ?? []);
  };

  /* open pdf */
  const openFile = async (fileName: string) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(`pdfs/${fileName}`, 600);

    if (error || !data?.signedUrl) {
      alert("Could not load PDF");
      return;
    }

    const res = await fetch(data.signedUrl);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    setPdfUrl(objectUrl);
    setPageNumber(1);
  };

  /* upload */
  const uploadPdf = async () => {
    if (!file) return alert("Choose a PDF");

    setUploading(true);
    const { error } = await supabase.storage
      .from("documents")
      .upload(`pdfs/${Date.now()}-${file.name}`, file);

    setUploading(false);

    if (error) alert(error.message);
    else {
      setFile(null);
      fetchFiles();
    }
  };

  /* delete */
  const deleteFile = async (fileName: string) => {
    if (!window.confirm("Delete this PDF?")) return;

    await supabase.storage.from("documents").remove([`pdfs/${fileName}`]);
    fetchFiles();
    setPdfUrl(null);
  };

  /* download */
  const downloadSignedPdf = (bytes: Uint8Array) => {
    const blob = new Blob([new Uint8Array(Array.from(bytes))], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signed-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* sign */
  const signPdf = async () => {
    if (!pdfUrl) return alert("Open PDF first");

    if (signatureMode === "draw" && !drawSignature)
      return alert("Draw signature first");

    if (signatureMode === "type" && !typedSignature.trim())
      return alert("Type signature first");

    const bytes = await fetch(pdfUrl).then((r) => r.arrayBuffer());
    const pdfDoc = await PDFDocument.load(bytes);

    const page = pdfDoc.getPages().slice(-1)[0];
    const { width } = page.getSize();
    const x = width - 200;
    const y = 50;

    if (signatureMode === "draw" && drawSignature) {
      const png = await pdfDoc.embedPng(base64ToUint8Array(drawSignature));
      const d = png.scale(0.4);
      page.drawImage(png, { x, y, width: d.width, height: d.height });
    }

    if (signatureMode === "type") {
      const font =
        selectedFont === "cursive"
          ? await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
          : await pdfDoc.embedFont(StandardFonts.TimesRoman);

      const sizeMap = { small: 16, medium: 24, large: 32 };

      page.drawText(typedSignature, {
        x,
        y,
        size: sizeMap[fontSize],
        font,
        color: rgb(0, 0, 0),
      });
    }

    const signedBytes = await pdfDoc.save();
    downloadSignedPdf(signedBytes);
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>Dashboard</h2>

      <h3>Upload PDF</h3>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <br />
      <button onClick={uploadPdf} disabled={uploading}>
        Upload
      </button>

      <h3>Uploaded PDFs</h3>
      {files.map((f) => (
        <div
          key={f.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            border: "1px solid #ddd",
            padding: 8,
          }}
        >
          <span>{f.name}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openFile(f.name)}>Open</button>
            <button onClick={() => deleteFile(f.name)}>Delete</button>
          </div>
        </div>
      ))}

      {pdfUrl && (
        <>
          <h3>Preview</h3>
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <Page pageNumber={pageNumber} />
          </Document>

          <div>
            <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)}>
              Prev
            </button>
            <span> {pageNumber} / {numPages} </span>
            <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)}>
              Next
            </button>
          </div>

          <h3>Signature</h3>
          <button onClick={() => setSignatureMode("draw")}>Draw</button>
          <button onClick={() => setSignatureMode("type")}>Type</button>

          {signatureMode === "draw" && (
            <SignaturePad
              onSave={(img) => setDrawSignature(img)}
              onClear={() => setDrawSignature(null)}
            />
          )}

          {signatureMode === "type" && (
            <>
              <input
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
              />
              <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value as any)}>
                <option value="cursive">Cursive</option>
                <option value="serif">Serif</option>
              </select>
              <select value={fontSize} onChange={(e) => setFontSize(e.target.value as any)}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </>
          )}

          <br />
          <button onClick={signPdf} style={{ background: "green", color: "white" }}>
            Sign PDF
          </button>
        </>
      )}
    </div>
  );
}