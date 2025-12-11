import { formatEther } from "ethers";

export function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(value) {
  if (value === undefined || value === null) return "-";
  try {
    return `${Number(formatEther(value)).toFixed(4)} ETH`;
  } catch (error) {
    return `${value} wei`;
  }
}
