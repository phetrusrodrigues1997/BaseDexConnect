import { Card } from "@/components/ui/card";
import TokenSwap from "@/components/TokenSwap";
import WalletConnect from "@/components/WalletConnect";
import NetworkStatus from "@/components/NetworkStatus";
import { useWeb3Store } from "@/lib/web3";

export default function Home() {
  const { address } = useWeb3Store();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Base DEX
          </h1>
          <div className="flex items-center gap-4">
            <NetworkStatus />
            <WalletConnect />
          </div>
        </div>

        <Card className="max-w-lg mx-auto p-6">
          <TokenSwap />
        </Card>
      </div>
    </div>
  );
}
