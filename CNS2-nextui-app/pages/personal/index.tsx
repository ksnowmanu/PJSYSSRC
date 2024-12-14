import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@nextui-org/button";
import { Avatar } from "@nextui-org/avatar"
import { Link, Chip } from "@nextui-org/react";
import {Spinner} from "@nextui-org/spinner";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { WalletProvider, useWallet } from "@/context/user";
import { NftCords, PageNftCords } from "@/components/cards";
import { BcLogTable } from "@/components/table"
import { Tabs, Tab } from "@nextui-org/tabs";
import { ListItem } from '../api/users'; // ListItem 型の定義をインポート
import { 
  ListNft,
  bcLog, 
  bcLogErc20,
  getAllTransferLogs,
  getTransferLogs1155,
  addCurrencyInfoToErc20TokenLogs,
  fetchNFTMetas 
} from '../api/ethers';
//import { useNft } from '@/context/nft'; // nft情報を保存してシステム全体で利用するためのcontextを利用する
import {
  TwitterXIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
  FacebookIcon,
  BlogIcon,
  ShopIcon,
  HandCoinIcon,
  AddShoppingCart,
  RemoveShoppingCart,
  CheckbookOutline,
} from "@/components/icons";

export default function PersonalPage() {

  {/* ethereum接続用 */}
  //const [windowEthereum, setWindowEthereum] = useState();
  const [pageLoad, setPageLoad] = useState(false);                           // ページロード時の実行フラグ1
  const [pageLoad2, setPageLoad2] = useState(false);                         // ページロード時の実行フラグ2
  const [ownNFTsLog, setOwnNFTsLog] = useState<bcLog[]>([]);                 // NFT取得の全ログ
  const [releasedOwnNFTsLog, setReleasedOwnNFTsLog] = useState<bcLog[]>([]); // NFT放出の全ログ
  const [currentOwnNFTsLog, setCurrentOwnNFTsLog] = useState<bcLog[]>([]);   // NFT保有の全ログ　※現在保有
  const [transactionDetailsLog, setTransactionDetailsLog] = useState<bcLogErc20[]>([]);   // ETH取引の全ログ
  //const [listOwnNFTs, setListOwnNFTs] = useState<ListNft[]>([]);             // NFT取得の全ログ＋メータデータ
  const [viewListNFTs, setViewListNFTs] = useState<ListNft[]>([]);             // 画面表示用のNFTリスト
  const [releasedViewListNFTs, setReleasedViewListNFTs] = useState<ListNft[]>([]);           // 画面表示用のNFTリスト
  //const { setNftData } = useNft();
  const [isLoadingA, setIsLoadingA] = useState(true);
  const [isLoadingB, setIsLoadingB] = useState(true);
  
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

  // Alasql [npm install alasql]
  // ------------------------------------------------------------
  // NFTLogs(a)にETHLogs(b)を結合しNFT転送とETH転送を紐づけたリストを作成
  // NFT転送とETH転送は同一トランザクションで実行されるルールより、トランザクションをキーに結合する
  // ------------------------------------------------------------
  const queryNftJoinEthLogs = `
  SELECT 
    a.key,
    a.contractAddress,
    a.standard,
    a.tokenId,
    a.fromAddress,
    a.toAddress,
    CASE WHEN b.data IS NOT NULL THEN b.data ELSE a.data END AS data,
    a.transactionHash,
    a.blockNumber
  FROM ? AS a LEFT JOIN ? AS b ON a.transactionHash = b.transactionHash 
  `;

  // ------------------------------------------------------------
  // 取得履歴(a)からリリース履歴(b)を除外したログリストを作成
  // ab双方に同一NFTが存在した場合にaブロック番号とbブロック番号を比較
  // aブロック番号が大きい：保有中　　※リリース後に再取得を意味する
  // bブロック番号が大きい：リリース
  // ------------------------------------------------------------
  const queryGetCurrentOwnedTokens = `
  SELECT a.*
  FROM ? AS a LEFT JOIN ? AS b ON a.key = b.key 
  WHERE b.key IS NULL
  OR (b.key IS NOT NULL 
    AND a.blockNumber > b.blockNumber)
  `;
  
  // ページ読み込み時にユーザー情報を取得
  useEffect(() => {
    const fetchData = async () => {
      if (typeof id === 'string') {
        // VercelPostgres接続⇒ユーザーの登録情報取得
        fetchUsers(`${id}`).then(async () => {
          // alasqlエンジン用意
          const alasql = require('alasql');

          // 全転送ログ取得　※全件取得してから目的別に分離する
          const allTransferLogs = await getAllTransferLogs(`${id}`);   // ERC721 and ERC20　※同一Transferイベント
          const transferLogs1155 = await getTransferLogs1155(`${id}`); // ERC1155

          // 1.NFT取得ログ生成
          // ERC721 and ERC1155 IN 
          const ERC721InTransferLogs = allTransferLogs.filter((log) => log.standard === 'ERC721' && log.tokenIO === "IN");
          const ERC1155InTransferLogs = transferLogs1155.filter((log) => log.standard === 'ERC1155' && log.tokenIO === "IN");
          const combinedInTransferLogs = ERC721InTransferLogs.concat(ERC1155InTransferLogs);
          // ERC20 OUT
          const ERC20OutTransferLogs = allTransferLogs.filter((log) => log.standard === 'ERC20' && log.tokenIO === "OUT");
          // ERC721 and ERC1155 IN + ERC20 OUT
          const ownedTokens = await alasql(queryNftJoinEthLogs, [combinedInTransferLogs, ERC20OutTransferLogs]);

          // 2.NFTリリースログ生成
          // ERC721 and ERC1155 OUT
          const ERC721OutTransferLogs = allTransferLogs.filter((log) => log.standard === 'ERC721' && log.tokenIO === "OUT");
          const ERC1155OutTransferLogs = transferLogs1155.filter((log) => log.standard === 'ERC1155' && log.tokenIO === "OUT");
          const combinedOutTransferLogs = ERC721OutTransferLogs.concat(ERC1155OutTransferLogs);
          // ERC20 IN
          const ERC20InTransferLogs = allTransferLogs.filter((log) => log.standard === 'ERC20' && log.tokenIO === "IN");
          // ERC721 and ERC1155 OUT + ERC20 IN
          const releasedOwnedTokens = await alasql(queryNftJoinEthLogs, [combinedOutTransferLogs, ERC20InTransferLogs]);

          // 3.現在保有nftリスト生成
          const currentOwnedTokensEth = await alasql(queryGetCurrentOwnedTokens, [ownedTokens, releasedOwnedTokens]);

          // 4.全入出金リスト生成
          const ERC20AllTransferLogs = allTransferLogs.filter((log) => log.standard === 'ERC20').sort((a, b) => a.blockNumber - b.blockNumber);
          const ERC20AllTransferLogsAddInfo = await addCurrencyInfoToErc20TokenLogs(ERC20AllTransferLogs);

          console.log('ERC721 IN:', ERC721InTransferLogs.length);
          console.log('ERC1155 IN:', ERC1155InTransferLogs.length);
          console.log('ERC20 OUT:', ERC20OutTransferLogs.length);
          console.log('ERC721 OUT:', ERC721OutTransferLogs.length);
          console.log('ERC1155 OUT:', ERC1155OutTransferLogs.length);
          console.log('ERC20 IN:', ERC20InTransferLogs.length);

          console.log('★OwnedNFTs:', ownedTokens);
          console.log('★releasedNFTs:', releasedOwnedTokens);
          console.log('★currentOwnedTokens:', currentOwnedTokensEth);

          // useStateで情報保存
          setCurrentOwnNFTsLog(currentOwnedTokensEth);
          setReleasedOwnNFTsLog(releasedOwnedTokens);
          setTransactionDetailsLog(ERC20AllTransferLogsAddInfo);
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
{/*
      const storedNFTsLog = sessionStorage.getItem('ownNFTsLog');
      if (storedNFTsLog && JSON.stringify(ownNFTsLog) === storedNFTsLog) {
        const storedViewListNFTs = sessionStorage.getItem('viewListNFTs');
        const parsedViewListNFTs: ListNft[] = storedViewListNFTs ? JSON.parse(storedViewListNFTs) : null;
        setViewListNFTs(parsedViewListNFTs);
        console.log('セッションストレージを使います',parsedViewListNFTs);
         return;  // ownNFTsのログに変更がある場合のみ実行
      }
 */}
      const batchSize = 6; // バッチサイズを設定

      // 現在保有NFTのメタデータ取得⇒画面表示データ作成
      const currentMetadataList: ListNft[] = []; // 取得したメタデータを格納する配列
      for (let i = 0; i < currentOwnNFTsLog.length; i += batchSize) {
        const batch = currentOwnNFTsLog.slice(i, i + batchSize);
        try {
          const metadata = await fetchNFTMetas(batch); // バッチごとにメタ情報を取得
          setViewListNFTs((prevData) => [...prevData, ...metadata]); // 取得したメタデータを即座に追加
          currentMetadataList.push(...metadata); // セッションストレージ用に確実に設定されたデータを用意（useStateは反映にタイムラグがある）
        } catch (error) {
          console.error('Error fetching NFT metadata:', error);
          setIsLoadingA(false);
        }
        await new Promise((resolve) => setTimeout(resolve, 200)); // プロバイダ(infura)側のリクエスト制限に対応
      }
      setIsLoadingA(false); // 取得したデータの件数をセット

      // リリースNFTのメタデータ取得⇒画面表示データ作成
      const releasedMetadataList: ListNft[] = []; // 取得したメタデータを格納する配列
      for (let i = 0; i < releasedOwnNFTsLog.length; i += batchSize) {
        const batch = releasedOwnNFTsLog.slice(i, i + batchSize);
        try {
          const metadata = await fetchNFTMetas(batch); // バッチごとにメタ情報を取得
          setReleasedViewListNFTs((prevData) => [...prevData, ...metadata]); // 取得したメタデータを即座に追加
          releasedMetadataList.push(...metadata); // セッションストレージ用に確実に設定されたデータを用意（useStateは反映にタイムラグがある）
        } catch (error) {
          console.error('Error fetching NFT metadata:', error);
          setIsLoadingB(false);
        }
        await new Promise((resolve) => setTimeout(resolve, 200)); // プロバイダ(infura)側のリクエスト制限に対応
      }
      setIsLoadingB(false); // 取得したデータの件数をセット
    }

    if (!pageLoad2) fetchData();
  
  }, [ownNFTsLog]);

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

        <Button onPress={() => updateUsers("0","0x45f630756a33b36A2c09873766C3cC50C1B7C161","ミスターK","no_icon.png","test_banner.png")}>
          登録
        </Button>

        <Button onPress={() => deleteUsers("testaddress999")}>
          削除
        </Button>

        {/* タブ切替：保有資産、取得履歴、リリース履歴 */}
        <div className="flex w-full flex-col">
          <Tabs 
            aria-label="Options" 
            color="primary" 
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#22d3ee]",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-[#06b6d4]"
            }}
          >
            <Tab
              key="currentOwnNFTsLog"
              title={
                <div className="flex items-center space-x-2">
                  <HandCoinIcon/>
                  <span>保有資産</span>
                  <Chip size="sm" variant="faded">
                    {isLoadingA ? (<Spinner size="sm" color="primary"/>) : (viewListNFTs.length)}
                  </Chip>
                </div>
              }
              >
              {/* カード表示 */}
              <PageNftCords list={viewListNFTs} />
            </Tab>
{/*
            <Tab
              key="ownNFTsLog"
              title={
                <div className="flex items-center space-x-2">
                  <AddShoppingCart/>
                  <span>取得履歴</span>
                  <Chip size="sm" variant="faded">{viewListNFTs.length}</Chip>
                </div>
              }
            >
              
            </Tab>
*/}
            <Tab
              key="releasedOwnNFTsLog"
              title={
                <div className="flex items-center space-x-2">
                  <RemoveShoppingCart/>
                  <span>リリース履歴</span>
                  <Chip size="sm" variant="faded">
                    {isLoadingB ? (<Spinner size="sm" color="primary"/>) : (releasedViewListNFTs.length)}
                  </Chip>
                </div>
              }
              >
              {/* カード表示 */}
              <PageNftCords list={releasedViewListNFTs} />
            </Tab>

            <Tab
              key="transactionDetailsLog"
              title={
                <div className="flex items-center space-x-2">
                  <CheckbookOutline/>
                  <span>入出金取引明細</span>
                  <Chip size="sm" variant="faded">
                    {transactionDetailsLog.length}
                  </Chip>
                </div>
              }
              >
              {/* テーブル表示 */}
              <BcLogTable logs={transactionDetailsLog} />
            </Tab>
            
          </Tabs>
        </div>
      </section>
    </DefaultLayout>
    </WalletProvider>
  );
}
