import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@nextui-org/button";
import { Avatar } from "@nextui-org/avatar"
import { Link } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { WalletProvider, useWallet } from "@/context/user";
import { NftCords, PageNftCords } from "@/components/cards";
import { ListItem } from '../api/users'; // ListItem 型の定義をインポート
import { ListNft, bcLog, getLatestOwnedNFT, getReleasedOwnedNFT, getNFTTransferLogs, fetchNFTMetas } from '../api/ethers';
//import { useNft } from '@/context/nft'; // nft情報を保存してシステム全体で利用するためのcontextを利用する
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
  //const [windowEthereum, setWindowEthereum] = useState();
  const [pageLoad, setPageLoad] = useState(false);                           // ページロード時の実行フラグ1
  const [pageLoad2, setPageLoad2] = useState(false);                         // ページロード時の実行フラグ2
  const [ownNFTsLog, setOwnNFTsLog] = useState<bcLog[]>([]);                 // NFT取得の全ログ
  const [releasedOwnNFTsLog, setReleasedOwnNFTsLog] = useState<bcLog[]>([]); // NFT放出の全ログ
  const [listOwnNFTs, setListOwnNFTs] = useState<ListNft[]>([]);             // NFT取得の全ログ＋メータデータ
  const [viewListNFTs, setViewListNFTs] = useState<ListNft[]>([]);           // 画面表示用のNFTリスト
  //const { setNftData } = useNft();
  
  {/* URLクエリパラメータを取得 */}
  const router = useRouter();
  const { id } = router.query;
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

  // 手放したNFTリスト作成
  const releasedOwnedNFT = async (listNFTs: ListNft[], ownNFTs: bcLog[]) => {
    return getReleasedOwnedNFT(listNFTs, ownNFTs);
  }

  // 現在所有するNFTリスト作成
  const latestOwnedNFT = async (listNFTs: ListNft[], ownNFTs: bcLog[]) => {
    return getLatestOwnedNFT(listNFTs, ownNFTs);
  }
  
  // ページ読み込み時にユーザー情報を取得
  useEffect(() => {
    const fetchData = async () => {
      if (typeof id === 'string') {
        // VercelPostgres接続⇒ユーザーの登録情報取得
        fetchUsers(`${id}`).then(async () => {
          // ページユーザーのEthereumログから所有履歴のある全nftリストを取得
          const ownedTokens = await getNFTTransferLogs(`${id}`,"0");
          console.log('★setOwnNFTs called with:', ownedTokens);

          // ページユーザーのEthereumログから放出履歴のある全nftリストを取得
          const releasedOwnedTokens = await getNFTTransferLogs(`${id}`, "1");
          console.log('★setOwnNFTsOut called with:', releasedOwnedTokens);

          setReleasedOwnNFTsLog(releasedOwnedTokens);
          setOwnNFTsLog(ownedTokens);
        });
      };
    };

    if (!pageLoad) {
      fetchData();
    }

  }, [id]); // 依存リストを空にすると最初のレンダリング時にのみ実行される

  // メタ情報を取得　※コントラクト操作とipfs接続(meta.json読込み)は一括取得不可、バッチ処理のため時間がかかる
  useEffect(() => {
    const fetchData = async () => {
      if (!ownNFTsLog || ownNFTsLog.length === 0) return;  // ownNFTsが存在する場合のみ実行

      const storedNFTsLog = sessionStorage.getItem('ownNFTsLog');
      if (storedNFTsLog && JSON.stringify(ownNFTsLog) === storedNFTsLog) {
        const storedViewListNFTs = sessionStorage.getItem('viewListNFTs');
        const parsedViewListNFTs: ListNft[] = storedViewListNFTs ? JSON.parse(storedViewListNFTs) : null;
        setViewListNFTs(parsedViewListNFTs);
        console.log('セッションストレージを使います',parsedViewListNFTs);
         return;  // ownNFTsのログに変更がある場合のみ実行
      }

      console.log('再検索します');
      const batchSize = 6; // バッチサイズを設定
      const metadataList: ListNft[] = []; // 取得したメタデータを格納する配列
      for (let i = 0; i < ownNFTsLog.length; i += batchSize) {
        const batch = ownNFTsLog.slice(i, i + batchSize);
        try {
          const metadata = await fetchNFTMetas(batch); // バッチごとにメタ情報を取得
          setViewListNFTs((prevData) => [...prevData, ...metadata]); // 取得したメタデータを即座に追加
          metadataList.push(...metadata); // セッションストレージ用に確実に設定されたデータを用意（useStateは反映にタイムラグがある）
        } catch (error) {
          console.error('Error fetching NFT metadata:', error);
        }
        await new Promise((resolve) => setTimeout(resolve, 200)); // プロバイダ(infura)側のリクエスト制限に対応
      }
      // 今後利用予定のため、現状は意味なし
      setListOwnNFTs(viewListNFTs);
      // セッションストレージにログ情報を保存
      sessionStorage.setItem('ownNFTsLog', JSON.stringify(ownNFTsLog));
      sessionStorage.setItem('viewListNFTs', JSON.stringify(metadataList)); // 一度に保存
      console.log("metadataList確認:",metadataList)
    }

    console.log('セッションストレージ確認1:',sessionStorage.getItem('ownNFTsLog'));
    console.log('セッションストレージ確認2:',sessionStorage.getItem('viewListNFTs'));
    if (!pageLoad2) fetchData();
  
  }, [ownNFTsLog]);

  {/*
  // セッションストレージにログ情報を保存
  useEffect(() => {
    sessionStorage.setItem('viewListNFTs', JSON.stringify(viewListNFTs));
console.log("useEffect1:",viewListNFTs);
console.log("useEffect2:",sessionStorage.getItem('viewListNFTs'));

  }, [viewListNFTs]); */}

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
          <h3>
            {walletAddress ? (
              <p>Connected Wallet Address: {walletAddress}</p>
            ) : (
              <p>No Wallet Connected</p>
            )}
          </h3>

        </div>

        <Button
          onPress={async () => {
            try {
              // 非同期関数をawaitで実行して結果を取得
              const releasedNFTs = await releasedOwnedNFT(listOwnNFTs, releasedOwnNFTsLog);
              setViewListNFTs(releasedNFTs); // 結果をstateに設定
            } catch (error) {
              console.error('Error fetching released NFTs:', error);
            }
          }}
        >
          リリースNFT表示
        </Button>
        
        <Button
          onPress={async () => {
            try {
              // 非同期関数をawaitで実行して結果を取得
              const latestOwnedNFTs = await latestOwnedNFT(listOwnNFTs, releasedOwnNFTsLog);
              setViewListNFTs(latestOwnedNFTs); // 結果をstateに設定
            } catch (error) {
              console.error('Error fetching released NFTs:', error);
            }
          }}
        >
          現在所有NFT表示
        </Button>

        <Button onPress={() => updateUsers("0","0x45f630756a33b36A2c09873766C3cC50C1B7C161","ミスターK","no_icon.png","test_banner.png")}>
          登録
        </Button>

        <Button onPress={() => deleteUsers("testaddress999")}>
          削除
        </Button>

        <PageNftCords list={viewListNFTs} />

      </section>
    </DefaultLayout>
    </WalletProvider>
  );
}
