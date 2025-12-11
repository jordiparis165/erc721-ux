import { useEffect, useMemo, useState } from "react";
import { useEnforceSepolia } from "../hooks/useEnforceSepolia";
import { useWeb3 } from "../providers/Web3Provider";
import { getContract } from "../utils/contracts";
import { shortAddress } from "../utils/format";

export default function FakeMeebits() {
  const { provider, signer, connect, isConnected } = useWeb3();
  const [tokenId, setTokenId] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sigMap, setSigMap] = useState(new Map());
  const [sigError, setSigError] = useState("");

  useEnforceSepolia();

  useEffect(() => {
    const loadSignatures = async () => {
      try {
        const response = await fetch("/claimer-signatures.json");
        const raw = await response.json();
        const map = new Map();
        raw.forEach((entry) => map.set(Number(entry.tokenNumber), entry.signature));
        setSigMap(map);
      } catch (err) {
        console.error(err);
        setSigError("Impossible de charger les signatures locales.");
      }
    };
    loadSignatures();
  }, []);

  const maxTokenId = useMemo(
    () => (sigMap.size > 0 ? Math.max(...Array.from(sigMap.keys())) : 0),
    [sigMap],
  );

  const checkAvailability = async () => {
    if (!provider) return;
    const id = Number(tokenId);
    if (!Number.isInteger(id) || id < 0) {
      setAvailability({ status: "error", message: "Token id invalide." });
      return;
    }
    setChecking(true);
    try {
      const claimer = getContract("fakeMeebitsClaimer", provider);
      const collection = getContract("fakeMeebits", provider);
      const claimed = await claimer.tokensThatWereClaimed(id);
      const minted = await collection
        .ownerOf(id)
        .then(() => true)
        .catch(() => false);
      const available = !claimed && !minted;
      setAvailability({ status: available ? "available" : "taken", claimed, minted });
    } catch (err) {
      setAvailability({ status: "error", message: err.message || "Check impossible" });
    } finally {
      setChecking(false);
    }
  };

  const claim = async () => {
    const id = Number(tokenId);
    if (!Number.isInteger(id)) {
      setFeedback("Choisis un token valide.");
      return;
    }
    if (!sigMap.has(id)) {
      setFeedback("Signature manquante pour ce token.");
      return;
    }
    if (!signer) {
      await connect().catch(() => {});
      return;
    }
    setClaiming(true);
    setFeedback("Envoi de la transaction...");
    try {
      const claimer = getContract("fakeMeebitsClaimer", signer);
      const tx = await claimer.claimAToken(id, sigMap.get(id));
      setFeedback(`Tx envoyée ${shortAddress(tx.hash)}. Attente confirmation...`);
      await tx.wait();
      setFeedback("Mint confirmé 🎉");
      checkAvailability();
    } catch (err) {
      console.error(err);
      setFeedback(err.message || "Claim refusé");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Fake Meebits</p>
          <h1>Claim avec signature</h1>
          <p className="muted">
            Choisis un token non minté, récupère la signature préparée et appelle
            <code> claimAToken() </code> sur le claimer Sepolia.
          </p>
        </div>
        <button className="button" onClick={claim} disabled={claiming}>
          {isConnected ? "Claim" : "Connecter & claim"}
        </button>
      </header>
      {sigError ? <div className="alert alert--warn">{sigError}</div> : null}
      <div className="card">
        <label className="field">
          <span>Token id (0 - {maxTokenId || "19999"})</span>
          <input
            type="number"
            min="0"
            max={maxTokenId || 19999}
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="ex: 1500"
          />
        </label>
        <div className="actions">
          <button className="button button--ghost" onClick={checkAvailability} disabled={checking}>
            {checking ? "Vérification..." : "Vérifier dispo"}
          </button>
          <button className="button" onClick={claim} disabled={claiming}>
            {claiming ? "Claiming..." : "Claim ce token"}
          </button>
        </div>
        {availability ? (
          <div
            className={`alert ${
              availability.status === "available"
                ? "alert--ok"
                : availability.status === "taken"
                  ? "alert--warn"
                  : "alert--warn"
            }`}
          >
            {availability.status === "available" && "Token libre ✅"}
            {availability.status === "taken" &&
              `Déjà minté (claimed: ${availability.claimed ? "oui" : "non"}, minted: ${
                availability.minted ? "oui" : "non"
              })`}
            {availability.status === "error" && availability.message}
          </div>
        ) : null}
        {feedback ? <div className="alert alert--info">{feedback}</div> : null}
        <p className="hint">
          Le claimer exige la signature correspondante au token id. Toutes les signatures
          sont préchargées depuis <code>public/claimer-signatures.json</code>.
        </p>
      </div>
    </section>
  );
}
