import DragSignatureBox from "./DragSignatureBox";

export default function DragTest() {
  // Example values (normally ye Dashboard se aate)
  const drawSignature =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."; // sample
  const typedSignature = "Garima Bhushan";

  return (
    <div>
      <h3>Drag Signature Test</h3>

      <DragSignatureBox
        drawSignature={drawSignature}
        typedSignature={typedSignature}
        fontFamily="cursive"
      />
    </div>
  );
}