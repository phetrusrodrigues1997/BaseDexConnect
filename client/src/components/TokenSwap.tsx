import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownIcon, RefreshCwIcon } from "lucide-react";
import SwapConfirmation from "./SwapConfirmation";
import { useWeb3Store } from "@/lib/web3";

const swapSchema = z.object({
  fromToken: z.string(),
  toToken: z.string(),
  fromAmount: z.string().min(1),
  slippage: z.string().default("0.5"),
});

const TOKENS = [
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "WETH", name: "Wrapped Ethereum" },
];

export default function TokenSwap() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { address, chainId } = useWeb3Store();
  
  const form = useForm<z.infer<typeof swapSchema>>({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      fromToken: "ETH",
      toToken: "USDC",
      fromAmount: "",
      slippage: "0.5",
    },
  });

  const onSubmit = async (values: z.infer<typeof swapSchema>) => {
    if (!address) return;
    setShowConfirmation(true);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fromToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From</FormLabel>
                <div className="flex gap-2">
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormControl>
                    <Input 
                      {...form.register("fromAmount")}
                      placeholder="0.0"
                      type="number"
                      step="0.000001"
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => {
                const from = form.getValues("fromToken");
                const to = form.getValues("toToken");
                form.setValue("fromToken", to);
                form.setValue("toToken", from);
              }}
            >
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          </div>

          <FormField
            control={form.control}
            name="toToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To</FormLabel>
                <div className="flex gap-2">
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input disabled value="0.0" />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={!address}
          >
            {address ? "Swap" : "Connect Wallet to Swap"}
          </Button>
        </form>
      </Form>

      <SwapConfirmation 
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        formData={form.getValues()}
      />
    </div>
  );
}
