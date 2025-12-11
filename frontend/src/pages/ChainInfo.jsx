import { useEnforceSepolia } from "../hooks/useEnforceSepolia";
import { useWeb3 } from "../providers/Web3Provider";
import { shortAddress } from "../utils/format";

export default function ChainInfo() {
  const { chainId, blockNumber, account, status, error, connect, isConnected } =
    useWeb3();

  useEnforceSepolia();

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Réseau</p>
          <h1>Chain info</h1>
          <p className="muted">
            Connecte ton wallet sur Sepolia pour lire la chaîne en direct.
          </p>
        </div>
        <button className="button button--ghost" onClick={connect}>
          {isConnected ? "Reconnecter" : "Connecter Metamask"}
        </button>
      </header>
      {error ? <div className="alert alert--warn">{error}</div> : null}
      <div className="grid">
        <Stat label="ChainId" value={chainId ?? "—"} />
        <Stat label="Dernier bloc" value={blockNumber ?? "—"} />
        <Stat
          label="Adresse connectée"
          value={account ? shortAddress(account) : "non connecté"}
        />
        <Stat label="Statut" value={status} />
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card stat">
      <p className="muted">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
