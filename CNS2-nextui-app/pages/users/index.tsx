import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@nextui-org/button";
import { Avatar } from "@nextui-org/avatar"
import { Link } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { WalletProvider, useWallet } from "@/components/user";
import { PersonCords } from "@/components/cards"
import { ListItem } from '../api/users'; // ListItem 型の定義をインポート
import {
  TwitterXIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
  FacebookIcon,
  BlogIcon,
  ShopIcon,
} from "@/components/icons";

export default function PersonalPage() {
  
  {/* URLクエリパラメータを取得 */}
  const router = useRouter()
  const { id, name } = router.query

  {/* SQL データ取得（select文） */}
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [mylistItem, setMyListItem] = useState<ListItem[]>([]);
  const fetchUsers = async (address: string) => {
    const res = await fetch(`/api/users?wallet_address=${encodeURIComponent(address)}`, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch users: ${res.statusText}`);
    }
    const data = await res.json();
    console.log(data.userlistItems);
    // ListItem 型でデータを保存
    if (address === "") {
      setListItems(data.userlistItems);
      //console.log('After setting listItems:', listItems);  // ここでのログを確認
    } else {
      setMyListItem(data.userlistItems);
      //console.log('After setting myListItem:', mylistItem);  // ここでのログを確認
    }
  };

  // ページ読み込み時にユーザー情報を取得する
  useEffect(() => {
    //console.log("URL_id:", {id});
    //★後でフィルターを引数に変更する
    //if (typeof id === 'string') {
    //  fetchUsers(`${id}`);
    //}
    fetchUsers("");
  }, [router.query]); // 依存リストを空にすると最初のレンダリング時にのみ実行される

  return (
    <WalletProvider>
    <DefaultLayout>

      {/* ★コントラクト選択 */}
      <section className="flex flex-row items-center justify-center gap-1 p-0 h-[40rem]">
        {/* 背景画像は画面読み込み時にユーザーマスタから取得した画像をセットstyle記述はreact記法 */}
        <div className="bg-cover bg-center h-full w-full" style={{ backgroundImage: `url(users_banner.png)`}as React.CSSProperties}>
          <div className="flex flex-row w-full h-full gap-6 grid grid-cols-12 grid-rows-3 gap-x-3 sm:gap-x-10">

            {/* 上段エリア */}
            <div className="col-span-12 sm:col-span-12"></div>

            {/* 中段エリア */}
            <div className="col-span-12 lg:col-span-6 bg-black/30 flex flex-row items-center pl-2">
              <div className="flex flex-row inline-block text-left pl-2">
                <h1 className={title()}>Gathering of&nbsp;</h1>
                <h1 className={title({ color: "yellow" })}>collectors</h1>
              </div>
            </div>
            <div className="col-span-0 lg:col-span-6"></div>

            {/* 下段エリア */}
            <div className="col-span-6"></div>
            <div className="col-span-6"></div>
          </div>
        </div>
      </section>

      {/* ★XXXXXエリア */}
      <section className="flex flex-row items-center justify-center gap-4 py-2">
        <div className="flex flex-row items-center justify-center gap-2">
            何かコメント入れる？
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>★ここにフィルターを表示する★</h1>
        </div>
        <PersonCords list={listItems} />
      </section>
    </DefaultLayout>
    </WalletProvider>
  );
}
