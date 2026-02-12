import { useState } from "react";

interface AlertState {
  message?: string;
  title?: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    message: "",
    title: "",
    type: "info",
    isVisible: false,
  });

  const showAlert = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    title?: string
  ) => {
    setAlert({
      message,
      title: title || "",
      type,
      isVisible: true,
    });

    // Auto-hide after 2 seconds
    const timer = setTimeout(() => {
      setAlert((prev) => ({
        ...prev,
        isVisible: false,
      }));
    }, 2000);

    return timer;
  };

  const closeAlert = () => {
    setAlert((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  return { alert, showAlert, closeAlert };
};
