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
  const { signer } = useWeb3Store();

  const handleConfirm = async () => {
    if (!signer) return;

    try {
      setConfirming(true);
      // Here would go the actual swap transaction code
      // For now just simulate with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Swap successful!",
        description: `Swapped ${formData.fromAmount} ${formData.fromToken} for ${formData.toToken}`,
      });
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
