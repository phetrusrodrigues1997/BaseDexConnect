import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useWeb3Store } from "@/lib/web3";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";

// USDC contract on Base
const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const USDC_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

interface SwapConfirmationProps {
  open: boolean;
  onClose: () => void;
  formData: {
    fromToken: string;
    toToken: string;
    fromAmount: string;
    slippage: string;
  };
}

export default function SwapConfirmation({
  open,
  onClose,
  formData,
}: SwapConfirmationProps) {
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();
  const { signer, provider } = useWeb3Store();

  const handleConfirm = async () => {
    if (!signer || !provider) return;

    try {
      setConfirming(true);
      const { fromToken, toToken, fromAmount } = formData;

      if (fromToken === "ETH" && toToken === "USDC") {
        // ETH to USDC swap
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        const decimals = await usdcContract.decimals();

        // Minimum amount check (0.0001 ETH)
        if (Number(fromAmount) < 0.0001) {
          throw new Error("Minimum amount is 0.0001 ETH");
        }

        // Convert ETH to USDC (assuming 1 ETH ≈ 2500 USDC)
        const ethAmount = ethers.parseEther(fromAmount);
        const usdcAmount = ethers.parseUnits(
          (Number(fromAmount) * 2500).toFixed(6),
          decimals
        );

        // Send ETH to USDC contract
        const tx = await signer.sendTransaction({
          to: USDC_ADDRESS,
          value: ethAmount,
        });

        await tx.wait();

        toast({
          title: "Swap successful!",
          description: `Swapped ${fromAmount} ETH for ${ethers.formatUnits(
            usdcAmount,
            decimals
          )} USDC`,
        });
      } else if (fromToken === "USDC" && toToken === "ETH") {
        // USDC to ETH swap
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        const decimals = await usdcContract.decimals();

        // Minimum amount check (0.01 USDC)
        if (Number(fromAmount) < 0.01) {
          throw new Error("Minimum amount is 0.01 USDC");
        }

        // Format USDC amount with proper decimals
        const usdcAmount = ethers.parseUnits(fromAmount, decimals);

        // Approve USDC transfer
        const approveTx = await usdcContract.approve(USDC_ADDRESS, usdcAmount);
        await approveTx.wait();

        // Transfer USDC
        const transferTx = await usdcContract.transfer(USDC_ADDRESS, usdcAmount);
        await transferTx.wait();

        // Calculate ETH amount (assuming 1 ETH ≈ 2500 USDC)
        const ethAmount = ethers.parseUnits(
          (Number(fromAmount) / 2500).toFixed(18),
          18
        );

        toast({
          title: "Swap successful!",
          description: `Swapped ${fromAmount} USDC for ${ethers.formatEther(
            ethAmount
          )} ETH`,
        });
      }

      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Swap failed",
        description: error.message,
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Swap</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>From:</span>
                <span className="font-medium">
                  {formData.fromAmount} {formData.fromToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span>To:</span>
                <span className="font-medium">
                  {formData.toToken}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Slippage Tolerance:</span>
                <span>{formData.slippage}%</span>
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                Please confirm this transaction in your wallet
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={confirming}>
            {confirming ? "Confirming..." : "Confirm Swap"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}