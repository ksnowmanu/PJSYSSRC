//https://docs.ethers.org/v6/api/providers/#Provider-getLogs
//https://ai-tool.userlocal.jp/text2code/texts

{/* ethereum接続に必要！ https://docs.ethers.org/v6/getting-started/ */}
import { ethers, getAddress, AbiCoder } from "ethers";
import { useEffect, useState } from 'react';
import { WalletProvider, useWallet } from "@/components/user";

// プロバイダを設定（例: Infuraのプロバイダ）
const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/13f6be12da9247fd832ed1033795311e'); // メインネット
//const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/13f6be12da9247fd832ed1033795311e'); // テストネットsepolia

const abi = [
  "function tokenURI(uint256 tokenId) external view returns (string)", // ERC721
  "function uri(uint256 id) external view returns (string)",           // ERC1155
  "function supportsInterface(bytes4 interfaceID) external view returns (bool)" // ERC165 (supportsInterface)
];

// ABIデコーダー
const abiCoder = new AbiCoder();

// イベントのシグネチャ
const erc721TransferEventSignature = ethers.id("Transfer(address,address,uint256)"); // ERC721 Transfer
//const erc1155TransferSingleEventSignature = ethers.id("TransferSingle(address operator, address from, address to, uint256 id, uint256 value)");   // ERC1155 TransferSingle
//const erc1155TransferSingleEventSignature2 = ethers.id("TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value)");   // ERC1155 TransferSingle
//const erc1155TransferSingleEventSignature2 = ethers.id("TransferSingle(address _operator, address _from, address _to, uint256 _id, uint256 _value)");   // ERC1155 TransferSingle
//const erc1155TransferSingleEventSignature2 = ethers.id("TransferSingle(address indexed, address indexed, address indexed, uint256, uint256)");   // ERC1155 TransferSingle
//const erc1155TransferSingleEventSignature2 = ethers.id("TransferSingle(address, address, address, uint256, uint256)");   // ERC1155 TransferSingle
const erc1155TransferSingleEventSignature = "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62";   // ethers.idが正しく動作しないので直接シグネチャを指定 ERC1155 TransferSingle
const erc1155TransferBatchEventSignature = ethers.id("TransferBatch(address operator, address from, address to, uint256[] ids, uint256[] values)"); // ERC1155 TransferBatch

// ListItem 型の定義
export type ListNft = {
  contractAddress: string;
  tokenId: string;
  metaName: string;
  metaDescription: string;
  metaImage: string;
  metaAttributes: string[];
};

// ウォレットアドレスを指定　←後で関数の引数に組み込む
const walletAddress = "0xCF00eC2B327BCfA2bee2D8A5Aee0A7671d08A283";

// 遅延処理用の関数
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 指定NFTのコントラクトアドレス＋トークンIDからメタデータを取得する
export async function fetchNFTMetas(ownedTokens: { contractAddress: string, tokenId: string, standard: string }[]) {
  const nftMetas = await Promise.all(
    ownedTokens.map(async ({ contractAddress, tokenId, standard }, index) => {
      await delay(index * 175);
      const tokenMetadata = await getTokenMetadata(contractAddress, tokenId, standard);
      return tokenMetadata;
    })
  );
  // nullを除外する
  const filteredMetas: ListNft[] = nftMetas.filter((meta): meta is ListNft => meta !== null);
  return filteredMetas;
}

// getTokenMetadata: メタデータを取得する関数
async function getTokenMetadata(contractAddress: string, tokenId: string, standard: string) {
  const contract = new ethers.Contract(contractAddress, abi, provider);
  try {
    console.log(`contractAddress:${contractAddress}`);
    console.log(`tokenId:${tokenId}`);

    let tokenURI;
    // ERC721かERC1155かを判定する
    if (standard === "ERC721") {
      tokenURI = await contract.tokenURI(tokenId);
    } else if (standard === "ERC1155") {
      tokenURI = await contract.uri(tokenId);
    }
    console.log(`tokenURI: ${tokenURI}`);

    // トークンURIに{id}が含まれている場合はプレースホルダーを置換
    if (tokenURI.includes("{id}")) {
      tokenURI = tokenURI.replace("{id}", tokenId.toString().padStart(64, '0'));
    }

    // メタデータを取得
    const response = await fetch(tokenURI);
    const metadata = await response.json();

  // 取得したメタデータをListNft型に変換して返す
  const tokenMetadata: ListNft = {
    contractAddress,
    tokenId,
    metaName: metadata.name || '',
    metaDescription: metadata.description || '',
    metaImage: metadata.image || '',
    metaAttributes: metadata.attributes ? metadata.attributes.map((attr: any) => attr.trait_type + ": " + attr.value) : []
  }
  return tokenMetadata;

  } catch (error) {
      console.error(`Failed to fetch metadata for ${contractAddress} - Token ID: ${tokenId}`, error);
      return null;
  }
}

// 指定ユーザーが保有するNFTのコントラクトアドレスとトークンIDを取得する
export async function getNFTContractsAndTokenIds() {
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
  let tokenOwnership = new Map(
    logs.map(log => {
      const contractAddress = log.address;  // コントラクトアドレスを抽出
      const tokenId = abiCoder.decode(["uint256"], log.topics[3])[0].toString(); // トークンIDをデコード
      const key = `${contractAddress}-${tokenId}`;  // キーを結合して作成
      const to = abiCoder.decode(["address"], log.topics[2])[0];  // 転送先を取得
      return [key, {to, standard: "ERC721"}];  // マップ用にキーと転送先アドレスを返す
    })
  );
  console.log(`1.ERC721トークンの数: ${logs.length}`);
  console.log(`1.ERC721トークンの数: ${tokenOwnership.size}`);

  // 2.ERC1155 : TransferSingle イベントのログ取得
  const logsSingle = await provider.getLogs(filterSingle);
  const singleOwnership = new Map(
    logsSingle.map(log => {
      try {
        const contractAddress = log.address;
        const decodedData = abiCoder.decode(["uint256", "uint256"], log.data);
        const tokenId = decodedData[0].toString();
        const key = `${contractAddress}-${tokenId}`;
        const to = abiCoder.decode(["address"], log.topics[3])[0];  // 転送先を取得
        //console.log("log.address:", log.address);
        //console.log("decodedData[0]:", tokenId);
        //console.log("decodedData[1]:", decodedData[1].toString());
        //console.log("to:", to);
        // ウォレットアドレスに一致する場合のみ、キーと転送先アドレスを返す
        //if (to.toLowerCase === walletAddress.toLowerCase) {
        //  return [key, to];  // 有効なエントリ
        //}
        //return null;  // 不要な場合はnullを返す
        return [key, {to, standard: "ERC1155"}];
        
      } catch (error) {
        console.error("map_err_singleOwnership:", error);
      }
    }).filter((entry): entry is [string, { to: string, standard: string }] => entry !== null) // nullを除外し、型を狭める
  );
  console.log(`2.ERC1155トークンの数: ${logsSingle.length}`);
  console.log(`2.ERC1155トークンの数: ${singleOwnership.size}`);

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

  // ERC1155のSingleとBatchの結果をERC721のmapに一括で追加（スプレッド構文を使用）
  tokenOwnership = new Map(Array.from(tokenOwnership).concat(
    Array.from(singleOwnership),
    //Array.from(batchOwnership)
  ));

  // 現在のウォレットが所有するトークンだけを抽出
  const ownedTokens = Array.from(tokenOwnership.entries())
  .filter(([key, owner]) => owner.to.toLowerCase() === walletAddress.toLowerCase())
  .map(([key, ownerData]) => {
    const [contractAddress, tokenId] = key.split('-');
    return { contractAddress, tokenId, standard: ownerData.standard };
  });

  //console.log(`取得したトークンの数: ${tokenOwnership.size}`);
  //ownedTokens.forEach(({ contractAddress, tokenId }) => {
  //  console.log(`コントラクトアドレス: ${contractAddress}, トークンID: ${tokenId}`);
  //});

  // メタデータも一緒に上で返却
  const ownedTokensWithMetas = fetchNFTMetas(ownedTokens);
  //console.log(`最終的なリスト: ${ownedTokensWithMetas}`);

}
