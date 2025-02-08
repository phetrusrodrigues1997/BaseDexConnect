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
import { ethers } from "ethers";

// USDC contract on Base
const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";

// Base Uniswap V3 Router
const UNISWAP_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const ROUTER_ABI = [
  "function exactInput(tuple(bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)",
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)",
  "function WETH9() external view returns (address)",
];

const QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)",
];

const QUOTER_ADDRESS = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a";

interface SwapConfirmationProps {
  open: boolean;
  onClose: () => void;
  onError: (error: Error) => void;
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
  onError,
  formData,
}: SwapConfirmationProps) {
  const [confirming, setConfirming] = useState(false);
  const { signer, provider } = useWeb3Store();

  const handleConfirm = async () => {
    if (!signer || !provider) return;

    try {
      setConfirming(true);
      const { fromToken, toToken, fromAmount, slippage } = formData;
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

      const routerContract = new ethers.Contract(
        UNISWAP_ROUTER,
        ROUTER_ABI,
        signer
      );

      // Get WETH address
      const WETH = await routerContract.WETH9();

      if (fromToken === "ETH" && toToken === "USDC") {
        // ETH to USDC swap
        if (Number(fromAmount) < 0.0001) {
          throw new Error("Minimum amount is 0.0001 ETH");
        }

        const ethAmount = ethers.parseEther(fromAmount);

        // Get quote first
        const quoterContract = new ethers.Contract(
          QUOTER_ADDRESS,
          QUOTER_ABI,
          provider
        );

        const quote = await quoterContract.quoteExactInputSingle(
          WETH,
          USDC_ADDRESS,
          500,
          ethAmount,
          0
        );

        // Calculate minimum amount out with slippage
        const minAmountOut = quote - (quote * Number(slippage)) / 100;

        const params = {
          tokenIn: WETH,
          tokenOut: USDC_ADDRESS,
          fee: 500, // 0.05%
          recipient: await signer.getAddress(),
          deadline,
          amountIn: ethAmount,
          amountOutMinimum: minAmountOut,
          sqrtPriceLimitX96: 0,
        };

        const tx = await routerContract.exactInputSingle(params, {
          value: ethAmount,
        });
        await tx.wait();
        onClose();
      } else if (fromToken === "USDC" && toToken === "ETH") {
        // USDC to ETH swap
        if (Number(fromAmount) < 0.01) {
          throw new Error("Minimum amount is 0.01 USDC");
        }

        const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
        const decimals = await usdcContract.decimals();
        const usdcAmount = ethers.parseUnits(fromAmount, decimals);

        // Get quote first
        const quoterContract = new ethers.Contract(
          QUOTER_ADDRESS,
          QUOTER_ABI,
          provider
        );

        const quote = await quoterContract.quoteExactInputSingle(
          USDC_ADDRESS,
          WETH,
          500,
          usdcAmount,
          0
        );

        // Calculate minimum amount out with slippage
        const minAmountOut = quote - (quote * Number(slippage)) / 100;

        // Approve USDC spending
        const approveTx = await usdcContract.approve(UNISWAP_ROUTER, usdcAmount);
        await approveTx.wait();

        const params = {
          tokenIn: USDC_ADDRESS,
          tokenOut: WETH,
          fee: 500,
          recipient: await signer.getAddress(),
          deadline,
          amountIn: usdcAmount,
          amountOutMinimum: minAmountOut,
          sqrtPriceLimitX96: 0,
        };

        const tx = await routerContract.exactInputSingle(params);
        await tx.wait();
        onClose();
      }
    } catch (error: any) {
      console.error("Swap error:", error);
      onError(error);
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
                <span className="font-medium">{formData.toToken}</span>
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