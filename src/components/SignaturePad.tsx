import { useRef } from "react";

type Props = {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
};

export default function SignaturePad({ onSave, onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let drawing = false;

  const startDraw = () => {
    drawing = true;
  };

  const endDraw = () => {
    drawing = false;
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent) => {
    if (!drawing || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onClear();
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        style={{ border: "1px solid #ccc" }}
        onMouseDown={startDraw}
        onMouseUp={endDraw}
        onMouseMove={draw}
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={saveSignature}>Save Signature</button>
        <button onClick={clearCanvas} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      </div>
    </div>
  );
}