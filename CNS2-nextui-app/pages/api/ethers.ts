//https://docs.ethers.org/v6/api/providers/#Provider-getLogs
//https://ai-tool.userlocal.jp/text2code/texts

{/* ethereum接続に必要！ https://docs.ethers.org/v6/getting-started/ */}
import { ethers, getAddress, AbiCoder } from "ethers";
import { useEffect, useState } from 'react';
import { WalletProvider, useWallet } from "@/context/user";
import { fetchCustom } from "../api/ipfs";
import { Akaya_Kanadaka } from "next/font/google";
import { addHookAliases } from "next/dist/server/require-hook";

// プロバイダを設定（例: Infuraのプロバイダ）
const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/13f6be12da9247fd832ed1033795311e'); // メインネット
//const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/13f6be12da9247fd832ed1033795311e'); // テストネットsepolia

// Ethereumイベントのシグネチャ
const erc721TransferEventSignature = ethers.id("Transfer(address,address,uint256)"); // ERC721 Transfer
//const erc1155TransferSingleEventSignature = ethers.id("TransferSingle(address operator, address from, address to, uint256 id, uint256 value)");   // ERC1155 TransferSingle
const erc1155TransferSingleEventSignature = "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62";   // ethers.idが正しく動作しないので直接シグネチャを指定 ERC1155 TransferSingle
const erc1155TransferBatchEventSignature = ethers.id("TransferBatch(address operator, address from, address to, uint256[] ids, uint256[] values)"); // ERC1155 TransferBatch

// コントラクト設定
const abi = [
  "function tokenURI(uint256 tokenId) external view returns (string)", // ERC721
  "function uri(uint256 id) external view returns (string)",           // ERC1155
  "function supportsInterface(bytes4 interfaceID) external view returns (bool)" // ERC165 (supportsInterface)
];

// ABIデコーダー
const abiCoder = new AbiCoder();

// OpenSeaコントラクトアドレス
const openSeaContractAddresses = [
  '0x495f947276749ce646f68ac8c248420045cb7b5e',
  // その他のOpenSeaコントラクトアドレスを追加
];
// OpenSeaのAPI設定 Endpoint for fetching NFT metadata for a single NFT: https://docs.opensea.io/reference/get_nft
const openSeaAPIUrl = 'https://api.opensea.io/api/v2/chain/ethereum';
const openSeaAPIUrlContract = '/contract/'
const openSeaAPIUrlNfts = '/nfts/'
const openSeaAPIOptions = {
  headers: {
    'X-API-KEY': '7bb8bb68a83e4b98b1d16257f87be1f3',
    'Content-Type': 'application/json',
  }
};

// ログフィルターの定義
// 最新ログ
const filterLatest = (Address: string) => {
  return {
    address: Address,    // ユーザーのアドレスを指定,
    fromBlock: "latest", // 開始ブロック（固定）
    toBlock: "latest"    // 最新ブロック（固定）
  };
};

// 1.ERC721 : Transferイベントフィルタ
const filterERC721 = (EventSignature: string, fromAddress: string | null, toAddress: string | null, fromBlock: number) => {
  return {
    topics: [
      EventSignature,  // Transferイベントシグネチャ
      fromAddress,     // 転送元
      toAddress        // 転送先
    ],
    fromBlock: fromBlock, // 開始ブロック
    toBlock: "latest"     // 最新ブロック（固定）
  };
};

// 2.ERC1155 : Transferイベントフィルタ
const filterERC1155 = (EventSignature: string, fromAddress: string | null, toAddress: string | null, fromBlock: number) => {
  return {
    topics: [
      EventSignature, // Transferイベントシグネチャ
      null,           // operator (無視)
      fromAddress,    // 転送元
      toAddress       // 転送先
    ],
    fromBlock: fromBlock, // 開始ブロック
    toBlock: "latest"     // 最新ブロック（固定）
  };
};

// bcLog 型の定義(ブロックチェーンログ)
export type bcLog = {
  key: string;
  contractAddress: string;
  standard: string;
  tokenId: string;
  fromAddress: ethers.Result;
  toAddress: ethers.Result;
  transactionHash: string;
  blockNumber: number;
}

// ListNft 型の定義
export type ListNft = {
  key: string;
  contractAddress: string;
  standard: string;
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
  tokenValue: string;
  tokenURI: string;
  href: string;
  metadataStatus: string;
  metaName: string;
  metaDescription: string;
  //metaImage: Blob;
  metaImageURL: string;
  metaImage64: string;
  metaAttributes: string[];
};

// 遅延処理用の関数
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------------------------------------------------
// 指定NFTのコントラクトアドレス＋トークンIDからメタデータを取得する
// --------------------------------------------------------------
export async function fetchNFTMetas(ownedTokens: bcLog[]): Promise<ListNft[]> {
  const batchResults = await Promise.all(
    ownedTokens.map(async (ownedToken) => {
        return await getTokenMetadata(ownedToken);
      })
    );
  await delay(10); // プロバイダ(infura)側
  return batchResults.filter(meta => meta !== null) as ListNft[];
}

// -------------------------------------------------------------
// getTokenMetadata: メタデータを取得する関数
// -------------------------------------------------------------
async function getTokenMetadata(ownedToken: bcLog): Promise<ListNft | null> {
  const { key, contractAddress, tokenId, standard, transactionHash, blockNumber } = ownedToken;
  const contract = new ethers.Contract(contractAddress, abi, provider);
  try {
    console.log(`contractAddress:${contractAddress}`);
    console.log(`tokenId:${tokenId}`);

    let tokenURI;
    let isOpenSea = false;
    // OpenSea or ERC721 or ERC1155 を判定する
    if (openSeaContractAddresses.includes(contractAddress.toLowerCase())) {
      tokenURI = openSeaAPIUrl + openSeaAPIUrlContract + contractAddress + openSeaAPIUrlNfts + tokenId;
      isOpenSea = true;
    } else if (standard === "ERC721") {
      tokenURI = await contract.tokenURI(tokenId);
    } else if (standard === "ERC1155") {
      tokenURI = await contract.uri(tokenId);
    }

    // トークンURIに{id}が含まれている場合はプレースホルダーを置換
    if (tokenURI.includes("{id}")) tokenURI = tokenURI.replace("{id}", tokenId.toString().padStart(64, '0'));

    console.log(`tokenURI:${isOpenSea}:${tokenURI}`);

    // メタデータの所在を判定 ⇒ NFT内部 or 外部サーバー
    let metadata;
    let metadataStatus;
    let metaname;
    let metaImageURL;
    let metaImage: Blob;
    let metaImageStr: string;
    if (tokenURI.startsWith('data:application/json;base64')) {
      console.log(`base64に入りました`);
      const base64tokenURI = tokenURI.split(',')[1];
      const response = atob(base64tokenURI);
      metadata = JSON.parse(response);
        console.log(`base64_metadata: ${response}`);
      metadataStatus = "inside";
      metaImageURL = metadata.image;
    } else {
      // メタデータを取得
      let response: Response;
      if (isOpenSea) {
        response = await fetch(tokenURI, openSeaAPIOptions);
        if(response.status === 404) throw new Error("error tokenURI"); // アクセス不可⇒エラー
        metadata = await response.json();
        if(metadata.nft.is_disabled || metadata.nft.is_nsfw || metadata.nft.is_suspicious) throw new Error("error disabled NFT"); // アクセス不可⇒エラー
        metaImageURL = metadata.nft.image_url;
        metaname = metadata.nft.name;
      } else {
        //if (tokenURI.startsWith('http')) response = await fetch(tokenURI);
        //else response = await fetchCustom(tokenURI, 0);
        response = await fetchCustom(tokenURI, 0);
        if(response.status === 404) throw new Error("error tokenURI"); // アクセス不可⇒エラー
        metadata = await response.json();
        metaImageURL = metadata.image;
        metaname = metadata.name;
      }
      metadataStatus = "outside";
    }
    console.log(`metadataStatus: ${metadataStatus}`);
    console.log(`metaName: ${metadata.name}`);
    console.log(`metaImageURL: ${metadata.image}`);

    // metaImageURLの中身がURL場合とbase64形式画像の場合がある
    // URL⇒画像データ取得へ
    // base64形式画像⇒metaImageへそのまま格納
    if (metaImageURL && metaImageURL.includes(';base64')) {
      metaImageStr = metaImageURL;
      metaImageURL = '';
    } else {
      // 画像データ取得 2024/10/20:ここで画像データを取得しないとUI側のCardで取得⇒表示の都度リクエスト発生
      const imageType = 'icon'
      const res = await fetch(`/api/image?url=${encodeURIComponent(metaImageURL)}&type=${imageType}`);
      const data = await res.json();
      metaImageStr = data.base64Image;
    }

{/*
    // 画像データ取得 2024/10/20:ここで画像データを取得しないとUI側のCardで取得⇒表示の都度リクエスト発生
    const res = await fetch(`/api/image?url=${encodeURIComponent(metaImageURL)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.statusText}`);
    }
    metaImage = await res.blob();
 */}

  // 取得したメタデータをListNft型に変換して返す
  const tokenMetadata: ListNft = {
    key: key,
    contractAddress: contractAddress,
    standard: standard,
    tokenId: tokenId,
    tokenValue: "0",
    tokenURI: tokenURI,
    transactionHash: transactionHash,
    blockNumber: blockNumber,
    href: `/nft?cadr=${contractAddress}&tid=${tokenId}&std=${standard}`,
    metadataStatus: metadataStatus,
    metaName: metaname || '',
    metaDescription: metadata.description || '',
    metaImageURL: metaImageURL || '',
    metaImage64: metaImageStr || '',
    //metaImage: metaImage || '',
    metaAttributes: metadata.attributes ? metadata.attributes.map((attr: any) => attr.trait_type + ": " + attr.value) : []
  }
  return tokenMetadata;

  } catch (error) {
      console.error(`Failed to fetch metadata for ${contractAddress} - Token ID: ${tokenId}`, error);
      return null;
  }
}

// ------------------------------------------------------------------
// 概要：
//  指定ユーザー(ウォレット)の最新ログのブロック番号を取得する
// 引数：
//  walletAddress : ウォレットアドレス
// 戻り値：
//  combinedTokenOwnershipLatest : 
// ------------------------------------------------------------------
export async function getNFTLatestBlockNum(walletAddress: string) {
  // 最新ブロック
  const filterLatestBlock =  filterLatest(walletAddress);
  const latestBlock = await provider.getLogs(filterLatestBlock);
  return latestBlock;
}

// ------------------------------------------------------------------
// 概要：
//  取得したNFTリストから手放したNFTリストを除外した結果を返す => 現在保有リスト
// 引数：
//  arrListNft : 取得履歴のある全NFTリスト
//  arrbcLog   : 放出履歴のある全NFTリスト(ログ)
// 戻り値：
//  arrListNft : 現在保有リスト
// ------------------------------------------------------------------
export function getLatestOwnedNFT(arrListNft: ListNft[], arrbcLog: bcLog[]): ListNft[] {
  const bcLogKeySet = new Set(arrbcLog.map(log => log.key));
  return arrListNft.filter(nft => !bcLogKeySet.has(nft.key));
}

// ------------------------------------------------------------------
// 概要：
//  取得したNFTリストから手放したNFTリストを返す => 現在保有していないリスト
// 引数：
//  arrListNft : 取得履歴のある全NFTリスト
//  arrbcLog   : 放出履歴のある全NFTリスト(ログ)
// 戻り値：
//  arrListNft : 現在保有していないリスト
// ------------------------------------------------------------------
export function getReleasedOwnedNFT(arrListNft: ListNft[], arrbcLog: bcLog[]): ListNft[] {
  const bcLogKeySet = new Set(arrbcLog.map(log => log.key));
  return arrListNft.filter(nft => bcLogKeySet.has(nft.key));
}

// ------------------------------------------------------------------
// 概要：
//  指定ユーザー(ウォレット)のNFT転送ログ（トラクトアドレスとトークンIDなど）を取得する
// 引数：
//  walletAddress : ウォレットアドレス
//  logFilter     : 0:取得ログ 1:放出ログ
// 戻り値：
//  combinedTokenOwnershipLatest : 
// ------------------------------------------------------------------
export async function getNFTTransferLogs(walletAddress: string, logFilter: string) {
  // ウォレットアドレスを32バイトにゼロパディングする
  const paddedAddress = "0x" + getAddress(walletAddress).slice(2).padStart(64, '0');
  console.log(`ウォレットアドレスの0pad: ${paddedAddress}`);

  // ログ確認用　アドレスのウォレット判定
  const code = await provider.getCode(walletAddress);
  code === "0x" ? console.log("This is walletAddress") : console.log("This is contractAddress");

  // Transferイベント設定 0:取得ログ 1:放出ログ => ERC721 and ERC1155(Single & Batch)
  let filter;
  let filterSingle;
  let filterBatch;
  if (logFilter === "0") {
    console.log(`0:取得ログ`);
    filter       = filterERC721(erc721TransferEventSignature, null, paddedAddress, 0);         // nft取得
    filterSingle = filterERC1155(erc1155TransferSingleEventSignature, null, paddedAddress, 0); // nft取得 Single
    //filterBatch = filterERC1155(erc1155TransferBatchEventSignature,  null, paddedAddress, 0); // nft取得 Batch
  } else {
    console.log(`1:放出ログ`);
    filter       = filterERC721(erc721TransferEventSignature, paddedAddress, null, 0);         // nft手放す
    filterSingle = filterERC1155(erc1155TransferSingleEventSignature, paddedAddress, null, 0); // nft手放す Single
    //filterBatch = filterERC1155(erc1155TransferBatchEventSignature,  paddedAddress, null, 0); // nft手放す Batch
  }

  // 1.ERC721 : コントラクトアドレスとトークンIDを結合したデータをmapで作成
  const logsERC721 = await provider.getLogs(filter); // ログを指定ブロック範囲内で取得
  const tokenOwnershipERC721: bcLog[] = await Promise.all(
    logsERC721.map(async (log) => {
      // ログを取得してコントラクトアドレスとトークンIDを抽出
      const contractAddress = log.address;  // コントラクトアドレスを抽出
      const standard = "ERC721";
      const tokenId = abiCoder.decode(["uint256"], log.topics[3])[0].toString(); // トークンIDをデコード
      const key = `${contractAddress}-${tokenId}`;  // キーを結合して作成
      const fromAddress = abiCoder.decode(["address"], log.topics[1])[0];  // 転送元を取得
      const toAddress = abiCoder.decode(["address"], log.topics[2])[0];  // 転送先を取得
      const transactionHash = log.transactionHash; // トランザクションハッシュを取得
      const blockNumber = log.blockNumber; // ブロック番号

      return {key, contractAddress, standard, tokenId, fromAddress, toAddress, transactionHash, blockNumber};
    })
  );
  console.log(`1.ERC721トークンの数: ${tokenOwnershipERC721.length}`);

  // 2.ERC1155 : TransferSingle イベントのログ取得
  const logsERC1155Single = await provider.getLogs(filterSingle);
  const tokenOwnershipERC1155single: bcLog[] = await Promise.all(
    logsERC1155Single.map(async (log) => {
      // ログを取得してコントラクトアドレスとトークンIDを抽出
      const contractAddress = log.address;
      const standard = "ERC1155";
      const decodedData = abiCoder.decode(["uint256", "uint256"], log.data);
      const tokenId = decodedData[0].toString();
      const key = `${contractAddress}-${tokenId}`;
      const fromAddress = abiCoder.decode(["address"], log.topics[2])[0];  // 転送先
      const toAddress = abiCoder.decode(["address"], log.topics[3])[0];  // 転送先を取得
      const transactionHash = log.transactionHash; // トランザクションハッシュを取得
      const blockNumber = log.blockNumber; // ブロック番号

      return {key, contractAddress, standard, tokenId, fromAddress, toAddress, transactionHash, blockNumber};
    })
  );
  console.log(`2.ERC1155トークンの数: ${tokenOwnershipERC1155single.length}`);

  // 3.ERC1155 : TransferBatch イベントのログ取得
  {/*
    ★★2024/09/22時点で当該ログを発見できないためテストできず、発見次第実装とする★★
 */}

  // ERC721 と ERC1155 からnullを除外してデータを合体
  const filteredTokenOwnershipERC721 = tokenOwnershipERC721.filter(entry => entry !== null);
  const filteredTokenOwnershipERC1155single = tokenOwnershipERC1155single.filter(entry => entry !== null);
  const combinedTokenOwnership: bcLog[] = filteredTokenOwnershipERC721.concat(filteredTokenOwnershipERC1155single);

  // ログの重複を排除（厳密には最後に取引したログだけを残す）
  const combinedTokenOwnershipLatest = removeDuplicatesByLargestKey(combinedTokenOwnership);

  return combinedTokenOwnershipLatest;
}

// ------------------------------------------------------------------
// (Log用)配列キーの重複がある際に要素番号が大きいほうが優先され重複が排除されたデータを返す
// ------------------------------------------------------------------
function removeDuplicatesByLargestKey(arr: bcLog[]): bcLog[] {
  const keyMap: Map<string, bcLog[]> = new Map();
  arr.forEach(item => {
    const { key } = item;
    keyMap.set(key, [item]);
  });
  return Array.from(keyMap.values()).flat(); // マップから値を抽出してフラット化して返す
}

// ------------------------------------------------------------------
// 指定トランザクションのNFT取得価格を取得する
// ------------------------------------------------------------------
export async function getNFTTransactionValues(ownedTokens: bcLog[]) {

  // ownedTokensに基づいてトランザクションデータを取得
  const transactionValues = await Promise.all(
    ownedTokens.map(async (token) => {
      const {transactionHash} = token;
      try {
        const transaction = await provider.getTransaction(transactionHash);
        // トランザクションが無い場合は処理終了
        if (!transaction) return { ...token, value: "0" }; 
        return {
          ...token,
          value: transaction ? ethers.formatEther(transaction.value) : "0", // 取得価格（Ether）
        };
      } catch (error) {
        console.error(`トランザクション取得エラー: ${transactionHash}`, error);
        return { ...token, value: "0" }; // エラーが発生した場合はvalueをnullに設定
      }
    })
  );
  return transactionValues;
}

// ------------------------------------------------------------------
// 指定トランザクションのNFT取得日時を取得する
// ------------------------------------------------------------------
export async function getNFTTransactionsDatetime(ownedTokens: bcLog[]) {
  const errDate = new Date('01 January 1900 01:01 UTC');

  // ownedTokensに基づいてトランザクションデータを取得
  const transactionsDatetime = await Promise.all(
    ownedTokens.map(async (token) => {
      const {transactionHash} = token;
      try {
        const receipt = await provider.getTransactionReceipt(transactionHash);

        // トランザクション or トランザクションレシート or レシートのブロック、無い場合は処理終了
        if (!receipt || !receipt.blockNumber) return { ...token, dateTime: errDate }; 

        const block = await provider.getBlock(receipt.blockNumber);
        const dateTime = block ? new Date(block.timestamp * 1000) : errDate; // タイムスタンプをDateオブジェクトに変換  
        return {
          ...token,
          dateTime: dateTime.toISOString(), // 実行日時（ISOフォーマットで返す）
        };
      } catch (error) {
        console.error(`トランザクション取得エラー: ${transactionHash}`, error);
        return { ...token, dateTime: errDate }; // エラーが発生した場合はvalueをnullに設定
      }
    })
  );
  return transactionsDatetime;
}
