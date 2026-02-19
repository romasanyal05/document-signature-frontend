import { useState } from "react";
import { supabase } from "../supabase";
import { inviteSignerAPI } from "../api/signer";

type Props = {
  fileId: string | null;
};

export default function SignerAssignment({ fileId }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const addSigner = async () => {
    if (!fileId) {
      alert("No file selected");
      return;
    }

    if (!email.trim()) {
      alert("Enter signer email");
      return;
    }

    setLoading(true);
    try {
  await inviteSignerAPI(fileId, email);
  alert("Signer invited 📧");
  setEmail("");
} catch (err: any) {
  alert(err.message);
}

setLoading(false);

    // 🔐 logged in user (owner)
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("User not logged in");
      setLoading(false);
      return;
    }

    // 1️⃣ get existing signers count for this file
    const { data: existingSigners, error } = await supabase
      .from("document_signatures")
      .select("id")
      .eq("file_id", fileId);

    if (error) {
      console.error(error);
      alert("Failed to fetch signers");
      setLoading(false);
      return;
    }

    const count = existingSigners?.length ?? 0;

    // 2️⃣ decide order + status
    const signOrder = count + 1;
    const isActive = count === 0;
    

    // 3️⃣ insert signer
    const { error: insertError } = await supabase
      .from("document_signatures")
      .insert({
        file_id: fileId,
        owner_user_id: user.id,
        signer_email: email,
        sign_order: signOrder,
        status:"pending",
        is_active: count === 0,
      });

    if (insertError) {
      console.error(insertError);
      alert("Failed to add signer");
    } else {
      alert(
        isActive
          ? "First signer added (ACTIVE)"
          : "Signer added (WAITING)"
      );
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "12px",
        marginTop: "20px",
        borderRadius: "6px",
        background: "#fafafa",
      }}
    >
      <h4>Assign Signers</h4>

      <input
        type="email"
        placeholder="Signer email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "8px",
          width: "250px",
          marginRight: "10px",
        }}
      />

      <button
        onClick={addSigner}
        disabled={loading}
        style={{
          padding: "8px 12px",
          background: "#28a745",
          color: "white",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {loading ? "Adding..." : "Add Signer"}
      </button>
    </div>
  );
}