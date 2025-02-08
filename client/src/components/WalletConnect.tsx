import { Button } from "@/components/ui/button";
import { useWeb3Store, connectWallet } from "@/lib/web3";
import { Loader2Icon } from "lucide-react";

export default function WalletConnect() {
  const { address, connecting } = useWeb3Store();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Button
      variant={address ? "outline" : "default"}
      onClick={() => !address && connectWallet()}
      disabled={connecting}
    >
      {connecting ? (
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      ) : null}
      {address ? formatAddress(address) : "Connect Wallet"}
    </Button>
  );
}
