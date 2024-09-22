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
import { getNFTContractsAndTokenIds } from '../api/ethers';
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

  {/* ethereum接続用 */}
  const [windowEthereum, setWindowEthereum] = useState();
  
  {/* URLクエリパラメータを取得 */}
  const router = useRouter()
  const { id, name } = router.query
  const { walletAddress } = useWallet();

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

  {/* SQL データ登録（insert文 or update文）※キー重複自動判定 */}
  const updateUsers = async (mode: string, newaddress: string, newName: string, newicon: string, newbanner: string) => {
    try {
      const res = await fetch(`/api/users?mode=${mode}&wallet_address=${newaddress}&username=${newName}&profile_image_url=${newicon}&profile_banner_url=${newbanner}`, {
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

  // ページ読み込み時にユーザー情報を取得する
  useEffect(() => {
    // VercelPostgres接続用
    //console.log("URL_id:", {id});
    if (typeof id === 'string') {
      fetchUsers(`${id}`);
    }
    fetchUsers("");

    // ethereum接続用
    const { ethereum } = window as any;
    setWindowEthereum(ethereum);

  }, [router.query]); // 依存リストを空にすると最初のレンダリング時にのみ実行される

  return (
    <WalletProvider>
    <DefaultLayout>

      {/* ★コントラクト選択 */}
      <section className="flex flex-row items-center justify-center gap-1 p-0 h-[25rem]">
        {/* 背景画像は画面読み込み時にユーザーマスタから取得した画像をセットstyle記述はreact記法 */}
        <div className="bg-cover bg-center h-full w-full" style={{ backgroundImage: `url(${mylistItem[0]?.profile_banner_url})`}as React.CSSProperties}>
          <div className="flex flex-row w-full h-full gap-6 grid grid-cols-12 grid-rows-3 gap-x-3 sm:gap-x-10">

            {/* 上段エリア */}
            <div className="col-span-12 sm:col-span-12"></div>

            {/* 中段エリア */}
            <div className="col-span-12 lg:col-span-6 bg-black/30 flex flex-row items-center pl-2">
              <Avatar src={mylistItem[0]?.profile_image_url} className="w-20 h-20 text-large" isBordered radius="lg"/>
              <div className="flex flex-col inline-block text-left pl-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-orange-400">{mylistItem[0]?.user_category}</h1>
                <h1 className="text-2xl lg:text-3xl font-bold">{mylistItem[0]?.username}</h1>
              </div>
            </div>
            <div className="col-span-0 lg:col-span-6"></div>

            {/* 下段エリア */}
            <div className="col-span-6"></div>
            <div className="col-span-6"></div>
          </div>
        </div>
      </section>

      {/* ★SNSショートカットエリア */}
      <section className="flex flex-row items-center justify-center gap-4 py-2">
        <div className="flex flex-row items-center justify-center gap-2">
          SNS LINKS! : 
          <Link isExternal href={mylistItem[0]?.x_address}>
            <TwitterXIcon className="text-default-500" />
          </Link>
          <Link isExternal href={mylistItem[0]?.instagram_address}>
            <InstagramIcon className="text-default-500" />
          </Link>
          <Link isExternal href={mylistItem[0]?.tiktok_address}>
            <TiktokIcon className="text-default-500" />
          </Link>
          <Link isExternal href={mylistItem[0]?.youtube_address}>
            <YoutubeIcon className="text-default-500" />
          </Link>
          <Link isExternal href={mylistItem[0]?.facebook_address}>
            <FacebookIcon className="text-default-500" />
          </Link>
          <Link isExternal href={mylistItem[0]?.blog_address}>
            <BlogIcon className="text-default-500" />
          </Link>
          <Link isExternal href={mylistItem[0]?.homepage_address}>
            <ShopIcon className="text-default-500" />
          </Link>
        </div>
      </section>

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

        <Button onPress={() => fetchUsers(`${id}`)}>
          取得id
        </Button>
        
        <Button onPress={getNFTContractsAndTokenIds}>
          取得log
        </Button>

        <Button onPress={() => updateUsers("0","0x45f630756a33b36A2c09873766C3cC50C1B7C161","ミスターK","no_icon.png","test_banner.png")}>
          登録
        </Button>

        <Button onPress={() => deleteUsers("testaddress999")}>
          削除
        </Button>
{/*
        <PersonCords list={listItems} />
        <PersonCords list={mylistItem} />
 */}
        

      </section>
    </DefaultLayout>
    </WalletProvider>
  );
}
