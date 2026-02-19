type Props = {
  value: "all" | "pending" | "signed";
  onChange: (v: "all" | "pending" | "signed") => void;
};

export default function StatusFilter({ value, onChange }: Props) {
  const btnStyle = (active: boolean) => ({
    padding: "6px 12px",
    background: active ? "#333" : "#eee",
    color: active ? "#fff" : "#000",
    borderRadius: "4px",
    border: "1px solid #ccc",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        marginTop: "10px",
      }}
    >
      <button
        onClick={() => onChange("all")}
        style={btnStyle(value === "all")}
      >
        All
      </button>

      <button
        onClick={() => onChange("pending")}
        style={btnStyle(value === "pending")}
      >
        Pending
      </button>

      <button
        onClick={() => onChange("signed")}
        style={btnStyle(value === "signed")}
      >
        Signed
      </button>
    </div>
  );
}