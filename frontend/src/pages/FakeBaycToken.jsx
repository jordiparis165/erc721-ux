import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEnforceSepolia } from "../hooks/useEnforceSepolia";
import { useWeb3 } from "../providers/Web3Provider";
import { getContract } from "../utils/contracts";
import { shortAddress } from "../utils/format";
import { fetchMetadata, resolveIpfs } from "../utils/metadata";

export default function FakeBaycToken() {
  const { tokenId } = useParams();
  const { provider } = useWeb3();
  const [meta, setMeta] = useState(null);
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEnforceSepolia();

  useEffect(() => {
    const loadToken = async () => {
      if (!provider) return;
      setLoading(true);
      try {
        const contract = getContract("fakeBayc", provider);
        const uri = await contract.tokenURI(tokenId);
        const metadata = await fetchMetadata(uri);
        const ownerAddress = await contract.ownerOf(tokenId);
        setMeta({
          ...metadata,
          image: resolveIpfs(metadata.image),
        });
        setOwner(ownerAddress);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Token inexistant ou non minté sur Sepolia.");
        setMeta(null);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, [provider, tokenId]);

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Fake BAYC</p>
          <h1>Token #{tokenId}</h1>
          <p className="muted">Visualise les métadonnées en direct.</p>
        </div>
      </header>
      {error ? <div className="alert alert--warn">{error}</div> : null}
      {loading ? <div className="muted">Chargement...</div> : null}
      {!loading && meta ? (
        <div className="token-view">
          <div className="token-image">
            {meta.image ? (
              <img src={meta.image} alt={meta.name || `Token ${tokenId}`} />
            ) : (
              <div className="muted">Pas d'image</div>
            )}
          </div>
          <div className="token-meta">
            <h2>{meta.name}</h2>
            <p className="muted">{meta.description}</p>
            {owner ? (
              <p className="muted">
                Owner: <strong>{shortAddress(owner)}</strong>
              </p>
            ) : null}
            {Array.isArray(meta.attributes) && meta.attributes.length > 0 ? (
              <div className="attributes">
                {meta.attributes.map((attr) => (
                  <div className="attribute" key={`${attr.trait_type}-${attr.value}`}>
                    <p className="muted">{attr.trait_type}</p>
                    <p className="stat-value">{attr.value}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
