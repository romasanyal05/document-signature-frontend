
import { useState, useRef } from "react";

type Props = {
  mode: "draw" | "type";
  typedSignature: string;
  drawnSignature: string | null;
  onPositionChange?: (pos: { x: number; y: number }) => void;
};

export default function DragSignatureBox({
  mode,
  typedSignature,
  drawnSignature,
  onPositionChange,
}: Props) {
  const [position, setPosition] = useState({ x: 120, y: 120 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;

    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;

    setPosition({ x: newX, y: newY });
    onPositionChange?.({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        cursor: "move",
        zIndex: 10,
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          minWidth: "140px",
          minHeight: "60px",
          border: "2px dashed #f4c430",
          background: "rgba(255,255,200,0.9)",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 🔴 LIVE PREVIEW */}
        {mode === "type" && typedSignature && (
          <span
            style={{
              fontFamily: "cursive",
              fontSize: "22px",
              color: "#000",
            }}
          >
            {typedSignature}
          </span>
        )}

        {mode === "draw" && drawnSignature && (
          <img
            src={drawnSignature}
            alt="signature"
            style={{ maxWidth: "120px", maxHeight: "50px" }}
          />
        )}

        {!typedSignature && !drawnSignature && (
          <span style={{ fontSize: "12px", color: "#666" }}>
            Drag Signature
          </span>
        )}
      </div>
    </div>
  );
}