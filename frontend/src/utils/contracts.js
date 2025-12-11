import { Contract } from "ethers";
import fakeBaycArtifact from "../abi/FakeBAYC.json";
import fakeNefturiansArtifact from "../abi/FakeNefturians.json";
import fakeMeebitsArtifact from "../abi/FakeMeebits.json";
import fakeMeebitsClaimerArtifact from "../abi/FakeMeebitsClaimer.json";

export const SEPOLIA_CHAIN_ID = 11155111;

export const CONTRACTS = {
  fakeBayc: {
    address: "0x1dA89342716B14602664626CD3482b47D5C2005E",
    abi: fakeBaycArtifact.abi,
  },
  fakeNefturians: {
    address: "0x9bAADf70BD9369F54901CF3Ee1b3c63b60F4F0ED",
    abi: fakeNefturiansArtifact.abi,
  },
  fakeMeebits: {
    address: "0xD1d148Be044AEB4948B48A03BeA2874871a26003",
    abi: fakeMeebitsArtifact.abi,
  },
  fakeMeebitsClaimer: {
    address: "0x5341e225Ab4D29B838a813E380c28b0eFD6FBa55",
    abi: fakeMeebitsClaimerArtifact.abi,
  },
};

export function getContract(contractKey, runner) {
  const config = CONTRACTS[contractKey];
  if (!config) {
    throw new Error(`Contract ${contractKey} introuvable`);
  }
  return new Contract(config.address, config.abi, runner);
}
