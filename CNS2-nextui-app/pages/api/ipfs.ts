import { createHelia } from "helia";
import { unixfs } from '@helia/unixfs';
import { bases } from 'multiformats/basics';
import { CID } from 'multiformats/cid';
import { fromString } from 'uint8arrays/from-string'; // 文字列をバイト配列に変換するためのユーティリティ
import PQueue from 'p-queue';

// 同時リクエスト数を制限する
const queue = new PQueue({ concurrency: 7 }); // 最大5つのリクエストを同時に実行

const gatewaysList = [
  'https://ipfs.io/ipfs/',              // 標準形式
  //'https://cloudflare-ipfs.com/ipfs/',  // Cloudflareゲートウェイ
  'https://dweb.link/ipfs/',            // DWebゲートウェイ
  'https://ipfs.w3s.link/ipfs/',
  'https://{cid}.ipfs.w3s.link/'        // w3s.link形式
  // 他にも使いたいゲートウェイを追加可能
];

// ------------------------------------------------------------------
// 概要：
//  引数のuriを解析し適切なファイルアクセスを行いfiletypeに応じたResponseを返す
// 引数：
//  uri : 接続先URI(http,ipfsを問わない)
//  fileType: 0:json(meta) 1:image
// 戻り値：
//  response : Response型のデータ
// ------------------------------------------------------------------
export async function fetchCustom(uri: string, fileType: number): Promise<Response> {
  let response: Response = new Response(null, { status: 500, statusText: "Internal Server Error" });
  console.log(`uri in fetchCustom:${fileType}:${uri}`);
  // URIパス判定1：httpなら変換しないでfetch結果を返す
  if(uri.startsWith('http')) response = await fetch(uri);

  // URIパス判定2：ipfsならパス構造を解析
  if(uri.startsWith('ipfs')) {
    const pathParts = uri.replace('ipfs://', '').split('/'); // CIDとファイル名を抽出
    const cidString = pathParts[0];
    const fileName = pathParts[1] || null; // ファイル名（ない場合はnull）

    // 各ゲートウェイに対応したURLを生成する関数
    const urls = gatewaysList.map(gateway => {
      if (gateway.includes('{cid}')) {
        return gateway.replace('{cid}', cidString) + (fileName ? `${fileName}` : ''); // w3s.link用
      } else {
        return gateway + cidString + (fileName ? `/${fileName}` : ''); // 通常のIPFSゲートウェイ
      }
    });
    console.log(`fetch from any gateway:${fileType}:${urls}`);
    
    try {
      const requests = urls.map(url => LimitedFetch(url,5000));
      const result = await Promise.race(requests); // 最も早く応答したゲートウェイからデータを取得
      if(!result.ok) throw new Error(`Failed to fetch from any gateway: ${result.statusText}`);
      response = result;
    } catch (error) {
      console.error('Failed to fetch from any gateway:', error);
    }

{/*
    // ファイル名がある場合はゲートウェイで処理
    if(fileName || fileType === 1) {
      console.log(`fetchCustom ipfs gateway ${fileType}: ${uri}`);
      let httpURL;
      httpURL = `https://${cidString}.ipfs.w3s.link/${fileName}`; // ゲートウェイ1をトライ
      response = await LimitedFetch(httpURL, 2000);
      if(!response.ok) {
        try {
          httpURL = `https://ipfs.io/ipfs/${cidString}/${fileName}`; // ゲートウェイ2をトライ
          response = await LimitedFetch(httpURL, 2000);
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') console.error(`Timeout occurred when fetching ${httpURL}`);
          else throw error;
        }
      }
      console.log(`fetchCustom ipfs gateway ${fileType}: ${httpURL}`);
    } else {
      try {
        console.log(`fetchCustom ipfs helia ${fileType}: ${uri}`);
        // ファイル名が無い場合はファイルCIDとして処理
        const data = await fsCatIPFS(cid);
        console.log(`fetchCustom ipfs helia ${fileType}: ${data}`);
        if (!data) throw new Error('ファイルデータの取得に失敗しました。');
        //if(fileType === 0) {
          const jsonString = new TextDecoder().decode(data); // バイナリを文字列に変換
          response = new Response(jsonString, { status: 200, headers: { 'Content-Type': 'application/json' } }); // JSONにパースして返す
        //} else if(fileType === 1) {
        //  let mimeType = 'image/jpeg'; // デフォルト
        //  const fileHeader = new Uint8Array(data.slice(0, 4)); // データの先頭数バイトでファイルタイプを判断
          // PNGの場合はデータヘッダが[137, 80, 78, 71]
        //  if (fileHeader[0] === 0x89 && fileHeader[1] === 0x50 && fileHeader[2] === 0x4e && fileHeader[3] === 0x47) {
        //    mimeType = 'image/png';
        //  }
          // GIFの場合はデータヘッダが "GIF8"
        //  else if (fileHeader[0] === 0x47 && fileHeader[1] === 0x49 && fileHeader[2] === 0x46 && fileHeader[3] === 0x38) {
        //    mimeType = 'image/gif';
        //  }
        //  const blob = new Blob([data], { type: mimeType }); // バイナリデータをBlobに変換し、画像URLを生成
        //  response = new Response(blob, { status: 200, headers: { 'Content-Type': mimeType } }); // Blobをレスポンスにラップ
        //}
      } catch (error) {
        console.error('Failed to fetch IPFS file:', error);
        //throw error; // エラーを再スローして上位で処理
      }
    }
       */}
  }
  return response;
};

// ------------------------------------------------------------------
// 概要：タイムアウト付きのfetch関数 => getImageLimitedでさらに同時実行回数も制限
// ------------------------------------------------------------------
async function LimitedFetch(url: string, timeout: number): Promise<Response> {
  return queue.add(() => fetchWithTimeout(url, timeout)) as Promise<Response>; // キューに追加
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeoutId = setTimeout(() => controller.abort(), timeout); // タイムアウトを設定

  try {
    const response = await fetch(url, { signal });
    clearTimeout(timeoutId); // 正常に完了したらタイムアウトをクリア
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw error; // エラーを呼び出し元に伝える
  }
};

// ------------------------------------------------------------------
// 概要：CIDの形式を判定・変換する。デコードが必要な場合はデコード実施。
// ------------------------------------------------------------------
async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "cors", // クロスオリジンリクエストの場合は必要
    });
    return response.ok && (response.headers.get("content-type")?.startsWith("image/") || false);
  } catch (error) {
    console.error("Error checking image:", error);
    return false; // ネットワークエラーやURLが無効の場合
  }
}

// ------------------------------------------------------------------
// 概要：heliaを使用してファイルCIDをcatする
// ------------------------------------------------------------------
async function fsCatIPFS(cid: CID) {
  try {
    const helia = await createHelia(); // Heliaノードの初期化
    const fs = unixfs(helia); // unixfsインスタンスを作成
    const stream = fs.cat(cid);

    // チャンクを配列に蓄積
    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    for await (const chunk of stream) {
      chunks.push(chunk);
      totalLength += chunk.length; // チャンクごとの長さを加算
    }

    // 新しいUint8Arrayに全チャンクをコピー
    const data = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data;

  } catch (error) {
    console.error('IPFSファイル(meta)の取得に失敗:', error);
  }
};
