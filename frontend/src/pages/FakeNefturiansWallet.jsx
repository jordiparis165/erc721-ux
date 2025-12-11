import { isAddress } from "ethers";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEnforceSepolia } from "../hooks/useEnforceSepolia";
import { useWeb3 } from "../providers/Web3Provider";
import { getContract } from "../utils/contracts";
import { shortAddress } from "../utils/format";
import { fetchMetadata, resolveIpfs } from "../utils/metadata";

export default function FakeNefturiansWallet() {
  const { userAddress } = useParams();
  const { provider } = useWeb3();
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEnforceSepolia();

  useEffect(() => {
    const load = async () => {
      if (!provider) return;
      if (!isAddress(userAddress)) {
        setError("Adresse invalide");
        return;
      }
      setLoading(true);
      try {
        const contract = getContract("fakeNefturians", provider);
        const balance = await contract.balanceOf(userAddress);
        const total = Number(balance);
        const ids = await Promise.all(
          Array.from({ length: total }, (_, i) =>
            contract.tokenOfOwnerByIndex(userAddress, i),
          ),
        );
        const enriched = await Promise.all(
          ids.map(async (id) => {
            const uri = await contract.tokenURI(id);
            const meta = await fetchMetadata(uri);
            return {
              id: Number(id),
              meta: { ...meta, image: resolveIpfs(meta.image) },
            };
          }),
        );
        setTokens(enriched);
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.message || "Lecture impossible");
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [provider, userAddress]);

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Fake Nefturians</p>
          <h1>Wallet {shortAddress(userAddress)}</h1>
          <p className="muted">Liste des tokens détenus avec leurs métadonnées.</p>
        </div>
      </header>
      {error ? <div className="alert alert--warn">{error}</div> : null}
      {loading ? <div className="muted">Chargement...</div> : null}
      {!loading && tokens.length === 0 ? (
        <div className="card">Aucun token pour cette adresse.</div>
      ) : null}
      <div className="token-grid">
        {tokens.map((token) => (
          <article className="card token-card" key={token.id}>
            <div className="token-image">
              {token.meta.image ? (
                <img src={token.meta.image} alt={token.meta.name} />
              ) : (
                <div className="muted">Pas d'image</div>
              )}
            </div>
            <div className="token-meta">
              <p className="muted">#{token.id}</p>
              <h3>{token.meta.name}</h3>
              <p className="muted">{token.meta.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
