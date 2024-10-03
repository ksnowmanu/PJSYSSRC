//https://docs.ethers.org/v6/api/providers/#Provider-getLogs
//https://ai-tool.userlocal.jp/text2code/texts

{/* ethereum接続に必要！ https://docs.ethers.org/v6/getting-started/ */}
import { ethers, getAddress, AbiCoder } from "ethers";
import { useEffect, useState } from 'react';
import { WalletProvider, useWallet } from "@/components/user";
import { convIPFStoHttp } from "../api/ipfs";
import { Akaya_Kanadaka } from "next/font/google";

// プロバイダを設定（例: Infuraのプロバイダ）
const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/13f6be12da9247fd832ed1033795311e'); // メインネット
//const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/13f6be12da9247fd832ed1033795311e'); // テストネットsepolia

// Ethereumイベントのシグネチャ
const erc721TransferEventSignature = ethers.id("Transfer(address,address,uint256)"); // ERC721 Transfer
//const erc1155TransferSingleEventSignature = ethers.id("TransferSingle(address operator, address from, address to, uint256 id, uint256 value)");   // ERC1155 TransferSingle
//const erc1155TransferSingleEventSignature2 = ethers.id("TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value)");   // ERC1155 TransferSingle
//const erc1155TransferSingleEventSignature2 = ethers.id("TransferSingle(address _operator, address _from, address _to, uint256 _id, uint256 _value)");   // ERC1155 TransferSingle
//const erc1155TransferSingleEventSignature2 = ethers.id("TransferSingle(address indexed, address indexed, address indexed, uint256, uint256)");   // ERC1155 TransferSingle
//const erc1155TransferSingleEventSignature2 = ethers.id("TransferSingle(address, address, address, uint256, uint256)");   // ERC1155 TransferSingle
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

// ListItem 型の定義
export type ListNft = {
  contractAddress: string;
  standard: string;
  tokenId: string;
  tokenValue: string;
  tokenURI: string;
  href: string;
  transactionHash: string;
  metadataStatus: string;
  metaName: string;
  metaDescription: string;
  metaImage: string;
  metaAttributes: string[];
};

{/*
  必要なものメモ
  ⇒次ページにはコントラクトアドレスとトークンIDだけを渡して、行った先でtokenURIを取得する？
  ⇒そもそも次ページとかではなく、指定したNFTの詳細を表示してアクションを実行できる子Windowにする？
  */}


// ウォレットアドレスを指定　←後で関数の引数に組み込む
//const walletAddress = "0xCF00eC2B327BCfA2bee2D8A5Aee0A7671d08A283";

// 遅延処理用の関数
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------------------------------------------------
// 指定NFTのコントラクトアドレス＋トークンIDからメタデータを取得する
// --------------------------------------------------------------
export async function fetchNFTMetas(ownedTokens: { contractAddress: string, tokenId: string, standard: string, transactionHash: string }[]) {
  let nftMetas: any = [];

  const batchResults = await Promise.all(
    ownedTokens.map(async ({contractAddress, tokenId, standard, transactionHash}) => {
        return await getTokenMetadata(contractAddress, tokenId, standard, transactionHash);
      })
    );
  nftMetas = [...nftMetas, ...batchResults.filter(meta => meta !== null)];
  await delay(10); // プロバイダ(infura)側
  return nftMetas;
}

// -------------------------------------------------------------
// getTokenMetadata: メタデータを取得する関数
// -------------------------------------------------------------
async function getTokenMetadata(contractAddress: string, tokenId: string, standard: string, transactionHash: string) {
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
    if (tokenURI.includes("{id}")) {
      tokenURI = tokenURI.replace("{id}", tokenId.toString().padStart(64, '0'));
    }

    console.log(`tokenURI:${isOpenSea}:${tokenURI}`);

    // メタデータの所在を判定 ⇒ NFT内部 or 外部サーバー
    let metadata;
    let metadataStatus;
    let metaname;
    let metaImage;
    if (tokenURI.startsWith('data:application/json;base64')) {
      console.log(`base64に入りました`);
      const base64tokenURI = tokenURI.split(',')[1];
      const response = atob(base64tokenURI);
      metadata = JSON.parse(response);
        console.log(`base64_metadata: ${response}`);
      metadataStatus = "inside";
      metaImage = metadata.image
    } else {
      // メタデータを取得
      let response: Response;
      if (isOpenSea) {
        //const response = await fetch(tokenURI);
        response = await fetch(tokenURI, openSeaAPIOptions);
        if(response.status === 404) throw new Error("error tokenURI"); // アクセス不可⇒エラー
        metadata = await response.json();
        if(metadata.nft.is_disabled || metadata.nft.is_nsfw || metadata.nft.is_suspicious) throw new Error("error disabled NFT"); // アクセス不可⇒エラー
        metaImage = metadata.nft.image_url;
        metaname = metadata.nft.name;
      } else {
        const tokenHttpURL = await convIPFStoHttp(tokenURI);
        //const response = await fetch(tokenHttpURL);
        response = await fetch(tokenHttpURL);
        if(response.status === 404) throw new Error("error tokenURI"); // アクセス不可⇒エラー
        metadata = await response.json();
        metaImage = await convIPFStoHttp(metadata.image);
        metaname = metadata.name
      }
      const responseImage = await fetch(metaImage);
      metadataStatus = "outside";
      if(responseImage.status === 404 || responseImage.status === 400) {
        throw new Error("error metaImage");
      }
    }
    console.log(`metadataStatus: ${metadataStatus}`);
    console.log(`metaName: ${metadata.name}`);
    console.log(`metaImage: ${metadata.image}`);

  // 取得したメタデータをListNft型に変換して返す
  const tokenMetadata: ListNft = {
    contractAddress: contractAddress,
    standard: standard,
    tokenId: tokenId,
    tokenValue: "0",
    tokenURI: tokenURI,
    href: `/nft?cadr=${contractAddress}&tid=${tokenId}&std=${standard}`,
    transactionHash: transactionHash,
    metadataStatus: metadataStatus,
    metaName: metaname || '',
    metaDescription: metadata.description || '',
    metaImage: metaImage || '',
    metaAttributes: metadata.attributes ? metadata.attributes.map((attr: any) => attr.trait_type + ": " + attr.value) : []
  }
  return tokenMetadata;

  } catch (error) {
      console.error(`Failed to fetch metadata for ${contractAddress} - Token ID: ${tokenId}`, error);
      return null;
  }
}

// ------------------------------------------------------------------
// 指定ユーザーが保有するNFTのコントラクトアドレスとトークンIDを取得する
// ------------------------------------------------------------------
export async function getNFTContractsAndTokenIds(walletAddress: string) {
  // ウォレットアドレスを32バイトにゼロパディングする
  const paddedAddress = "0x" + getAddress(walletAddress).slice(2).padStart(64, '0');
  console.log(`ウォレットアドレスの0pad: ${paddedAddress}`);
  console.log(`Transfer721: ${erc721TransferEventSignature}`);
  console.log(`TransferSingle: ${erc1155TransferSingleEventSignature}`);
  //console.log(`TransferSingle2: ${erc1155TransferSingleEventSignature2}`);

  // 1.ERC721 : Transferイベントのフィルタを作成（ウォレットアドレスが受け取ったもの）
  const filter = {
    topics: [
      erc721TransferEventSignature,  // Transferイベントシグネチャ
      null,                          // 転送元（無視）
      paddedAddress                  // 転送先（ウォレットアドレス）
    ],
    fromBlock: 0,  // 過去のブロックから検索
    toBlock: "latest"  // 最新のブロックまで検索
  };

  // 2.ERC1155 : TransferSingleイベントのフィルタを作成
  const filterSingle = {
    topics: [
      erc1155TransferSingleEventSignature,
      null, // operator (無視)
      null, // from (無視)
      paddedAddress // 転送先（ウォレットアドレス）
    ],
    fromBlock: 0,
    toBlock: "latest"
  };

  // 3.ERC1155 : TransferBatchイベントのフィルタを作成
  const filterBatch = {
    topics: [
      erc1155TransferBatchEventSignature,
      null, // operator (無視)
      null, // from (無視)
      paddedAddress // 転送先（ウォレットアドレス）
    ],
    fromBlock: 0,
    toBlock: "latest"
  };

  // 1.ERC721 : コントラクトアドレスとトークンIDを結合したデータをmapで作成
  const logs = await provider.getLogs(filter); // ログを指定ブロック範囲内で取得（上記範囲指定可）
  let tokenOwnership: [string, { to: any; standard: string; transactionHash: string }][] = await Promise.all(
    logs.map(async (log) => {
      // ログを取得してコントラクトアドレスとトークンIDを抽出
      const contractAddress = log.address;  // コントラクトアドレスを抽出
      const tokenId = abiCoder.decode(["uint256"], log.topics[3])[0].toString(); // トークンIDをデコード
      const key = `${contractAddress}-${tokenId}`;  // キーを結合して作成
      const to = abiCoder.decode(["address"], log.topics[2])[0];  // 転送先を取得
      const transactionHash = log.transactionHash; // トランザクションハッシュを取得
      const blockNumber = log.blockNumber; // ブロック番号
      //const transaction = await provider.getTransaction(transactionHash);

      return [key, {to, standard: "ERC721", transactionHash}];  // マップ用にキーと転送先アドレスを返す
    })
  );
  console.log(`1.ERC721トークンの数: ${logs.length}`);
  console.log(`1.ERC721トークンの数: ${tokenOwnership.length}`);

  // 2.ERC1155 : TransferSingle イベントのログ取得
  const logsSingle = await provider.getLogs(filterSingle);
  const singleOwnership: [string, { to: any; standard: string; transactionHash: string }][] = await Promise.all(
    logsSingle.map(async (log) => {
      // ログを取得してコントラクトアドレスとトークンIDを抽出
      const contractAddress = log.address;
      const decodedData = abiCoder.decode(["uint256", "uint256"], log.data);
      const tokenId = decodedData[0].toString();
      const key = `${contractAddress}-${tokenId}`;
      const to = abiCoder.decode(["address"], log.topics[3])[0];  // 転送先を取得
      const transactionHash = log.transactionHash; // トランザクションハッシュを取得
      const blockNumber = log.blockNumber; // ブロック番号
      //const transaction = await provider.getTransaction(transactionHash);

      return [key, {to, standard: "ERC1155", transactionHash}];  // マップ用にキーと転送先アドレスを返す
    })
  );
  console.log(`2.ERC1155トークンの数: ${logsSingle.length}`);
  console.log(`2.ERC1155トークンの数: ${singleOwnership.length}`);

  // 3.ERC1155 : TransferBatch イベントのログ取得 ★★2024/09/22時点で当該ログを発見できないためテストできず、発見次第実装とする★★
  {/*
  const logsBatch = await provider.getLogs(filterBatch);
  const batchOwnership = new Map(
    logsBatch.flatMap(log => {
      const contractAddress = log.address;
      // decodeの戻り値をまずunknown型にキャストしてから、タプル型に変換
      const decodedData = abiCoder.decode(
        ["address", "address", "uint256[]", "uint256[]"],
        log.data
      ) as unknown as [string, string, ethers.BigNumberish[], ethers.BigNumberish[]]; 
  
      const tokenIds = decodedData[2].map(id => id.toString());
      const to = decodedData[1]; // 転送先
      if (to.toLowerCase() === walletAddress.toLowerCase()) {
        const tokenIds = decodedData[2].map(id => id.toString());
        return tokenIds.map(tokenId => {
          const key = `${contractAddress}-${tokenId}`;
          return [key, {to, standard: "ERC1155"}];
        });
      }
      return [];
    })
  );
  console.log(`3.ERC1155トークンの数: ${logsBatch.length}`);
  console.log(`3.ERC1155トークンの数: ${batchOwnership.size}`);
 */}

  // nullエントリをフィルタリングして有効なエントリのみを保持
  const filteredSingleOwnership = singleOwnership.filter(entry => entry !== null);
  // tokenOwnershipにERC721とERC1155の結果を追加
  let tokenOwnershipMAP = new Map(tokenOwnership);  // ここでtokenOwnershipをMapに変換
  filteredSingleOwnership.forEach(([key, value]) => {
    tokenOwnershipMAP.set(key, value); // ERC1155の結果を追加
  });
  
  // 現在のウォレットが所有するトークンだけを抽出
  const ownedTokens = Array.from(tokenOwnershipMAP.entries())
  .filter(([key, owner]) => owner.to.toLowerCase() === walletAddress.toLowerCase())
  .map(([key, ownerData]) => {
    const [contractAddress, tokenId] = key.split('-');
    return { contractAddress, tokenId, standard: ownerData.standard, transactionHash: ownerData.transactionHash };
  });
  console.log(`ownedTokens:`,ownedTokens);

  return ownedTokens;

}

// ------------------------------------------------------------------
// 指定トランザクションのNFT取得価格を取得する
// ------------------------------------------------------------------
export async function getNFTTransactionValues(
  ownedTokens: {
    contractAddress: string;
    tokenId: string;
    standard: string;
    transactionHash: string;
  }[]) {
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
export async function getNFTTransactionsDatetime(
  ownedTokens: {
    contractAddress: string;
    tokenId: string;
    standard: string;
    transactionHash: string;
    value: string;
  }[]) {
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
