import { NavLink } from "react-router-dom";
import { useWeb3 } from "../providers/Web3Provider";
import { SEPOLIA_CHAIN_ID } from "../utils/contracts";
import { shortAddress } from "../utils/format";

const links = [
  { to: "/chain-info", label: "Chain" },
  { to: "/fakeBayc", label: "Fake BAYC" },
  { to: "/fakeNefturians", label: "Fake Nefturians" },
  { to: "/fakeMeebits", label: "Fake Meebits" },
];

function NetworkBadge({ chainId }) {
  const isSepolia = chainId === SEPOLIA_CHAIN_ID;
  return (
    <span className={`chip ${isSepolia ? "chip--ok" : "chip--warn"}`}>
      {chainId ? (isSepolia ? "Sepolia" : `Chain ${chainId}`) : "Pas connecté"}
    </span>
  );
}

export default function Layout({ children }) {
  const { account, connect, chainId } = useWeb3();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">UX</div>
          <div>
            <div className="brand-title">ERC721 Playground</div>
            <div className="brand-subtitle">Sepolia only</div>
          </div>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="wallet-box">
          <NetworkBadge chainId={chainId} />
          <button
            className="button"
            onClick={() => {
              connect().catch(() => {});
            }}
          >
            {account ? shortAddress(account) : "Connect wallet"}
          </button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
