import { Badge } from "@/components/ui/badge";
import { useWeb3Store, BASE_CHAIN_ID, switchToBase } from "@/lib/web3";
import { Button } from "@/components/ui/button";

export default function NetworkStatus() {
  const { chainId } = useWeb3Store();

  if (!chainId) return null;

  const isBase = chainId === BASE_CHAIN_ID;

  if (!isBase) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={switchToBase}
      >
        Switch to Base
      </Button>
    );
  }

  return (
    <Badge variant="outline" className="bg-primary/10">
      Base Network
    </Badge>
  );
}
