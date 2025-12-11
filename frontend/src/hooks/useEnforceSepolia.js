import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEPOLIA_CHAIN_ID } from "../utils/contracts";
import { useWeb3 } from "../providers/Web3Provider";

export function useEnforceSepolia() {
  const navigate = useNavigate();
  const { chainId } = useWeb3();

  useEffect(() => {
    if (chainId && chainId !== SEPOLIA_CHAIN_ID) {
      navigate("/error");
    }
  }, [chainId, navigate]);
}
