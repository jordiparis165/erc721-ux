import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEPOLIA_CHAIN_ID } from "../utils/contracts";

export default function ErrorPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      setMessage("Installe Metamask pour changer de réseau.");
      return;
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
      navigate("/chain-info");
    } catch (err) {
      setMessage(err.message || "Impossible de changer de réseau");
    }
  };

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Mauvaise chaîne</p>
          <h1>Connecte-toi sur Sepolia</h1>
          <p className="muted">
            Cette application ne fonctionne que sur la chaîne de test Sepolia (chainId {SEPOLIA_CHAIN_ID}).
          </p>
        </div>
        <button className="button" onClick={switchToSepolia}>
          Basculer vers Sepolia
        </button>
      </header>
      {message ? <div className="alert alert--warn">{message}</div> : null}
    </section>
  );
}
