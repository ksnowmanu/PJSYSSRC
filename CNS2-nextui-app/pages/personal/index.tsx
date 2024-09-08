import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useRouter } from 'next/router';
import { WalletProvider, useWallet } from "@/components/user";

export default function PersonalPage() {
  
  {/* URLクエリパラメータを取得 */}
  const router = useRouter()
  const { id, name } = router.query
  const { walletAddress } = useWallet();

  return (
    <WalletProvider>
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Personal</h1>
          <h2>{id}</h2>
          <h2>{name}</h2>
          <h3>
            {walletAddress ? (
              <p>Connected Wallet Address: {walletAddress}</p>
            ) : (
              <p>No Wallet Connected</p>
            )}
          </h3>
        </div>
      </section>
    </DefaultLayout>
    </WalletProvider>
  );
}
