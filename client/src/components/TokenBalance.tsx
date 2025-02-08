import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3Store } from "@/lib/web3";

const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // Base USDC
const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export default function TokenBalance() {
  const { provider, address } = useWeb3Store();
  const [ethBalance, setEthBalance] = useState<string>("");
  const [usdcBalance, setUsdcBalance] = useState<string>("");

  useEffect(() => {
    if (!provider || !address) {
      setEthBalance("");
      setUsdcBalance("");
      return;
    }

    const fetchBalances = async () => {
      try {
        // Fetch ETH balance
        const balance = await provider.getBalance(address);
        setEthBalance(ethers.formatEther(balance));

        // Fetch USDC balance
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const usdcDecimals = await usdcContract.decimals();
        const usdcBalance = await usdcContract.balanceOf(address);
        setUsdcBalance(ethers.formatUnits(usdcBalance, usdcDecimals));
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
    
    // Set up balance refresh on block changes
    provider.on("block", fetchBalances);
    
    return () => {
      provider.removeListener("block", fetchBalances);
    };
  }, [provider, address]);

  if (!address) return null;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
        <span className="text-sm text-muted-foreground">ETH Balance:</span>
        <span className="font-medium">
          {ethBalance ? `${Number(ethBalance).toFixed(4)} ETH` : "Loading..."}
        </span>
      </div>
      <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
        <span className="text-sm text-muted-foreground">USDC Balance:</span>
        <span className="font-medium">
          {usdcBalance ? `${Number(usdcBalance).toFixed(2)} USDC` : "Loading..."}
        </span>
      </div>
    </div>
  );
}
