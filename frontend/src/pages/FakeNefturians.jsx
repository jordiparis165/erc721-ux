import { useEffect, useState } from "react";
import { useEnforceSepolia } from "../hooks/useEnforceSepolia";
import { useWeb3 } from "../providers/Web3Provider";
import { getContract } from "../utils/contracts";
import { formatEth } from "../utils/format";

export default function FakeNefturians() {
  const { provider, signer, connect, isConnected } = useWeb3();
  const [price, setPrice] = useState(null);
  const [supply, setSupply] = useState(null);
  const [txState, setTxState] = useState("");
  const [error, setError] = useState("");

  useEnforceSepolia();

  const loadStats = async () => {
    if (!provider) return;
    try {
      const contract = getContract("fakeNefturians", provider);
      const [tokenPrice, totalSupply] = await Promise.all([
        contract.tokenPrice(),
        contract.totalSupply(),
      ]);
      setPrice(tokenPrice);
      setSupply(Number(totalSupply));
      setError("");
    } catch (err) {
      setError(err.message || "Lecture impossible");
    }
  };

  useEffect(() => {
    loadStats();
  }, [provider]);

  const buy = async () => {
    if (!signer) {
      await connect().catch(() => {});
      return;
    }
    if (!price) return;
    setTxState("pending");
    try {
      const contract = getContract("fakeNefturians", signer);
      const tx = await contract.buyAToken({
        value: price + 1n, // strict '>' in contract, so add 1 wei
      });
      await tx.wait();
      setTxState("success");
      loadStats();
    } catch (err) {
      setTxState("error");
      setError(err.message || "Transaction refusée");
    }
  };

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Fake Nefturians</p>
          <h1>Buy un NFT</h1>
          <p className="muted">
            Le contrat exige un paiement strictement supérieur au prix affiché.
          </p>
        </div>
        <button className="button" onClick={buy}>
          {isConnected ? "Acheter" : "Connecter & acheter"}
        </button>
      </header>
      {error ? <div className="alert alert--warn">{error}</div> : null}
      <div className="grid">
        <div className="card stat">
          <p className="muted">Prix minimum</p>
          <p className="stat-value">{formatEth(price)}</p>
          <p className="hint">Envoi {formatEth(price ? price + 1n : 0)} pour passer le require.</p>
        </div>
        <div className="card stat">
          <p className="muted">Tokens mintés</p>
          <p className="stat-value">{supply ?? "—"}</p>
        </div>
      </div>
      {txState ? (
        <div
          className={`alert ${
            txState === "success"
              ? "alert--ok"
              : txState === "pending"
                ? "alert--info"
                : "alert--warn"
          }`}
        >
          {txState === "pending" && "Transaction en cours..."}
          {txState === "success" && "Achat confirmé 🎉"}
          {txState === "error" && "Achat annulé"}
        </div>
      ) : null}
    </section>
  );
}
