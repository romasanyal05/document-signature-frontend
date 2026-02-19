import { useEffect, useState } from "react";

type Props = {
  pdfUrl: string;
  onClose: () => void;
  drawSignature: string | null;     // base64 image
  typedSignature: string;           // text
  signatureMode: "draw" | "type";
  onSignaturePositionChange: (pos: { x: number; y: number }) => void;
};

export default function PdfIframeViewer({
  pdfUrl,
  onClose,
  drawSignature,
  typedSignature,
  signatureMode,
  onSignaturePositionChange,
}: Props) {
  if (!pdfUrl) return null;

  // signature position (iframe ke relative)
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging) return;

      const newPos = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      };

      setPos(newPos);
      onSignaturePositionChange(newPos);
    };

    const handleUp = () => setDragging(false);

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, offset, onSignaturePositionChange]);

  return (
    <div
      style={{
        marginTop: "30px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "10px",
        background: "#fafafa",
      }}
    >
      {/* ACTION BUTTONS */}
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <button onClick={onClose}>Close PDF ❌</button>
        <button onClick={() => window.open(pdfUrl, "_blank")}>
          Full View 🔍
        </button>
      </div>

      {/* PDF CONTAINER */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "600px",
          border: "1px solid #ccc",
          overflow: "hidden",
        }}
      >
        {/* PDF */}
        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
        />

        {/* SIGNATURE (NO BOX – DIRECT DRAG) */}
        {signatureMode === "draw" && drawSignature && (
          <img
            src={drawSignature}
            alt="signature"
            onMouseDown={onMouseDown}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: "150px",
              cursor: "move",
              userSelect: "none",
            }}
          />
        )}

        {signatureMode === "type" && typedSignature && (
          <div
            onMouseDown={onMouseDown}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              fontSize: "24px",
              fontFamily: "cursive",
              cursor: "move",
              userSelect: "none",
              background: "transparent",
            }}
          >
            {typedSignature}
          </div>
        )}
      </div>
    </div>
  );
}