import { title } from "@/components/primitives";
import { Button } from "@nextui-org/button";
import DefaultLayout from "@/layouts/default";
import { useRouter } from 'next/router';
import { WalletProvider, useWallet } from "@/components/user";

export default function PersonalPage() {
  
  {/* URLクエリパラメータを取得 */}
  const router = useRouter()
  const { id, name } = router.query
  const { walletAddress } = useWallet();

  {/* SQL データ取得（select文） */}
  const fetchUsers = async () => {
    const res = await fetch('/api/users', {
      method: 'GET',
    });
    const data = await res.json();
    console.log(data.users);
  };

  {/* SQL データ登録（insert文 or update文）※キー重複自動判定 */}
  const updateUsers = async (mode: string, newaddress: string, newName: string) => {
    try {
      const res = await fetch(`/api/users?mode=${mode}&wallet_address=${newaddress}&username=${newName}`, {
        method: 'POST',
        //headers: {
        //  'Content-Type': 'application/json',
        //},
        //body: JSON.stringify({ newaddress, newName }),
      });
      const data = await res.json();
      // モード別の結果出力
      switch (mode) {
        case '0':
          console.log(data.postUsers);
        default:
          console.log(data.message);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  {/* SQL データ削除（delete文） */}
  const deleteUsers = async (deladdress: string) => {
    try {
      const res = await fetch(`/api/users?wallet_address=${deladdress}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log(data.message);

    } catch (error) {
      console.error('Error:', error);
    }
  };

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

        <Button onPress={fetchUsers}>
          取得
        </Button>

        <Button onPress={() => updateUsers("0","testaddress999","bbbbCCCC")}>
          登録
        </Button>

        <Button onPress={() => deleteUsers("testaddress999")}>
          削除
        </Button>

      </section>
    </DefaultLayout>
    </WalletProvider>
  );
}
