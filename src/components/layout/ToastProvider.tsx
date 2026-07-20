"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: "#894e3f",
          color: "#eee1ba",
          borderRadius: "9999px",
          padding: "10px 18px",
          fontSize: "14px",
          fontWeight: 600,
        },
        success: { iconTheme: { primary: "#c37960", secondary: "#eee1ba" } },
        error: { iconTheme: { primary: "#dc2626", secondary: "#eee1ba" } },
      }}
    />
  );
}
