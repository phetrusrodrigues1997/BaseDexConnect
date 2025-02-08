import { ethers } from "ethers";
import { create } from "zustand";

interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  connecting: boolean;
  setProvider: (provider: ethers.BrowserProvider) => void;
  setSigner: (signer: ethers.JsonRpcSigner) => void;
  setAddress: (address: string) => void;
  setChainId: (chainId: number) => void;
  setConnecting: (connecting: boolean) => void;
}

export const useWeb3Store = create<Web3State>((set) => ({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  connecting: false,
  setProvider: (provider) => set({ provider }),
  setSigner: (signer) => set({ signer }),
  setAddress: (address) => set({ address }),
  setChainId: (chainId) => set({ chainId }),
  setConnecting: (connecting) => set({ connecting }),
}));

export const BASE_CHAIN_ID = 8453;

export async function initWeb3() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      useWeb3Store.getState().setProvider(provider);
      
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        useWeb3Store.getState().setSigner(signer);
        useWeb3Store.getState().setAddress(accounts[0]);
      }

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      useWeb3Store.getState().setChainId(parseInt(chainId, 16));

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } catch (error) {
      console.error("Failed to initialize Web3:", error);
    }
  }
}

function handleAccountsChanged(accounts: string[]) {
  if (accounts.length > 0) {
    useWeb3Store.getState().setAddress(accounts[0]);
  } else {
    useWeb3Store.getState().setAddress(null);
    useWeb3Store.getState().setSigner(null);
  }
}

function handleChainChanged(chainId: string) {
  useWeb3Store.getState().setChainId(parseInt(chainId, 16));
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No Web3 provider detected");
  }

  try {
    useWeb3Store.getState().setConnecting(true);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = useWeb3Store.getState().provider;
    if (provider) {
      const signer = await provider.getSigner();
      useWeb3Store.getState().setSigner(signer);
      useWeb3Store.getState().setAddress(await signer.getAddress());
    }
  } finally {
    useWeb3Store.getState().setConnecting(false);
  }
}

export async function switchToBase() {
  if (!window.ethereum) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
          chainName: "Base",
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org"],
        }],
      });
    }
  }
}
