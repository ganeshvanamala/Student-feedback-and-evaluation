import React, { useEffect, useMemo, useState } from "react";
import "../styles/Captcha.css";

const makeCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export function Captcha({ onVerify, theme = "light" }) {
  const [captchaCode, setCaptchaCode] = useState(() => makeCode());
  const [userInput, setUserInput] = useState("");

  const normalizedInput = useMemo(() => userInput.trim().toUpperCase(), [userInput]);
  const isVerified = normalizedInput.length > 0 && normalizedInput === captchaCode;

  useEffect(() => {
    onVerify(isVerified);
  }, [isVerified, onVerify]);

  const refresh = () => {
    setCaptchaCode(makeCode());
    setUserInput("");
    onVerify(false);
  };

  return (
    <div className={`captcha-container ${theme === "dark" ? "dark" : "light"}`}>
      <label className="captcha-title">CAPTCHA</label>
      <div className="captcha-display-row">
        <div className="captcha-display">{captchaCode}</div>
        <button type="button" className="captcha-refresh" onClick={refresh} title="Refresh captcha">
          ↻
        </button>
      </div>
      <input
        className={`captcha-input ${isVerified ? "verified" : ""}`}
        type="text"
        placeholder="Enter CAPTCHA"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
    </div>
  );
}
