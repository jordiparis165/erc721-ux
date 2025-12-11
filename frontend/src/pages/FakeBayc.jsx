import { useEffect, useState } from "react";
import { useEnforceSepolia } from "../hooks/useEnforceSepolia";
import { useWeb3 } from "../providers/Web3Provider";
import { getContract } from "../utils/contracts";
import { shortAddress } from "../utils/format";

export default function FakeBayc() {
  const { provider, signer, connect, isConnected } = useWeb3();
  const [collectionName, setCollectionName] = useState("");
  const [totalSupply, setTotalSupply] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txState, setTxState] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  useEnforceSepolia();

  const loadStats = async () => {
    if (!provider) return;
    setLoading(true);
    try {
      const contract = getContract("fakeBayc", provider);
      const [name, supply] = await Promise.all([
        contract.name(),
        contract.totalSupply(),
      ]);
      setCollectionName(name);
      setTotalSupply(Number(supply));
      setError("");
    } catch (err) {
      setError(err.message || "Lecture impossible");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [provider]);

  const claim = async () => {
    if (!signer) {
      await connect().catch(() => {});
      return;
    }
    setTxState("pending");
    try {
      const contract = getContract("fakeBayc", signer);
      const tx = await contract.claimAToken();
      setTxHash(tx.hash);
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
          <p className="eyebrow">Fake BAYC</p>
          <h1>Claim ton singe</h1>
          <p className="muted">
            Affiche le total minté et réclame un nouveau token en un clic.
          </p>
        </div>
        <button className="button" onClick={claim}>
          {isConnected ? "Claim" : "Connecter & claim"}
        </button>
      </header>
      {error ? <div className="alert alert--warn">{error}</div> : null}
      <div className="grid">
        <Card title="Nom" value={collectionName || "—"} />
        <Card
          title="Tokens mintés"
          value={totalSupply !== null ? totalSupply : "—"}
          loading={loading}
        />
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
          {txState === "success" && "Claim confirmé 🎉"}
          {txState === "error" && "Transaction refusée"}
          {txHash ? (
            <span className="muted">
              {" "}
              ({shortAddress(txHash)})
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Card({ title, value, loading }) {
  return (
    <div className="card stat">
      <p className="muted">{title}</p>
      <p className="stat-value">{loading ? "..." : value}</p>
    </div>
  );
}
