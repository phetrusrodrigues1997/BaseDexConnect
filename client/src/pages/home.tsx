import { Card } from "@/components/ui/card";
import TokenSwap from "@/components/TokenSwap";
import WalletConnect from "@/components/WalletConnect";
import NetworkStatus from "@/components/NetworkStatus";
import TokenBalance from "@/components/TokenBalance";
import { useWeb3Store } from "@/lib/web3";
import { motion } from "framer-motion";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export default function Home() {
  const { address } = useWeb3Store();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-8"
          >
            {/* Logo */}
            <div className="bg-primary rounded-full w-10 h-10" />

            {/* Navigation */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors",
                      "px-4 py-2"
                    )}
                  >
                    Trending
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors",
                      "px-4 py-2"
                    )}
                  >
                    Explore
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors",
                      "px-4 py-2"
                    )}
                  >
                    Create
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <NetworkStatus />
            <WalletConnect />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-lg mx-auto mt-12">
          {address && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <TokenBalance />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 shadow-lg bg-card/95 backdrop-blur-sm border-primary/10">
              <TokenSwap />
            </Card>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Lightning Fast
            </h3>
            <p className="text-muted-foreground">
              Execute trades instantly on Base network
            </p>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Secure Swaps
            </h3>
            <p className="text-muted-foreground">
              Industry-leading security protocols
            </p>
          </Card>
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/10">
            <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Low Fees
            </h3>
            <p className="text-muted-foreground">
              Minimize costs with Base L2 scaling
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}