// src/components/ScrollToTopButton.jsx
import { useEffect, useState } from "react";
import "./scrollTopBtn.css";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisible);
    return () => window.removeEventListener("scroll", toggleVisible);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button 
      className={`scroll-top-btn ${visible ? "show" : ""}`}
      onClick={scrollUp}
    >
      ↑
    </button>
  );
}
