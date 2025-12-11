import {
  BrowserProvider,
  getAddress,
} from "ethers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SEPOLIA_CHAIN_ID } from "../utils/contracts";

const Web3Context = createContext({
  provider: null,
  signer: null,
  account: "",
  chainId: null,
  blockNumber: null,
  status: "idle",
  error: "",
  connect: async () => {},
  isConnected: false,
  isOnSepolia: false,
});

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) {
      setError("Installez Metamask pour continuer.");
      return;
    }
    const browserProvider = new BrowserProvider(ethereum);
    setProvider(browserProvider);

    const refreshNetwork = async () => {
      try {
        const net = await browserProvider.getNetwork();
        setChainId(Number(net.chainId));
      } catch (err) {
        console.error("Network lookup failed", err);
      }
    };

    refreshNetwork();
    browserProvider
      .getBlockNumber()
      .then(setBlockNumber)
      .catch(() => {});
    browserProvider.on("block", setBlockNumber);

    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        setAccount("");
        setSigner(null);
        return;
      }
      try {
        const normalized = getAddress(accounts[0]);
        setAccount(normalized);
        const nextSigner = await browserProvider.getSigner();
        setSigner(nextSigner);
        setStatus("ready");
        setError("");
      } catch (err) {
        setError(err.message || "Erreur lors de la récupération du compte");
      }
    };

    ethereum
      .request({ method: "eth_accounts" })
      .then(handleAccountsChanged)
      .catch(() => {});

    const handleChainChanged = (hexChainId) => {
      try {
        setChainId(parseInt(hexChainId, 16));
      } catch (err) {
        console.error("Unable to parse chainId", err);
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      browserProvider.removeAllListeners();
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const { ethereum } = window;
    if (!ethereum) {
      setError("Metamask est requis pour continuer.");
      throw new Error("Metamask non détecté");
    }
    setStatus("connecting");
    try {
      const browserProvider = provider ?? new BrowserProvider(ethereum);
      if (!provider) {
        setProvider(browserProvider);
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts || accounts.length === 0) {
        throw new Error("Aucun compte Metamask trouvé");
      }
      const normalized = getAddress(accounts[0]);
      const signerInstance = await browserProvider.getSigner();
      setSigner(signerInstance);
      setAccount(normalized);
      const net = await browserProvider.getNetwork();
      setChainId(Number(net.chainId));
      setStatus("ready");
      setError("");
    } catch (err) {
      console.error("Connexion Metamask échouée", err);
      setStatus("error");
      setError(err.message || "Connexion refusée");
      throw err;
    }
  }, [provider]);

  const value = useMemo(
    () => ({
      provider,
      signer,
      account,
      chainId,
      blockNumber,
      status,
      error,
      connect,
      isConnected: Boolean(account),
      isOnSepolia: chainId === SEPOLIA_CHAIN_ID,
    }),
    [account, blockNumber, chainId, connect, error, provider, signer, status],
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  return useContext(Web3Context);
}
