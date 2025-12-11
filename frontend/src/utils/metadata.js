export function resolveIpfs(uri) {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return uri;
}

export async function fetchMetadata(uri) {
  const target = resolveIpfs(uri);
  const response = await fetch(target);
  if (!response.ok) {
    throw new Error(`Impossible de récupérer les métadonnées (${response.status})`);
  }
  return response.json();
}
