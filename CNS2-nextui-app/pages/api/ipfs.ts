import { createHelia } from "helia";
import { unixfs } from '@helia/unixfs'
import { CID } from 'multiformats/cid'

export async function convIPFStoHttp(tokenURI: string): Promise<string> {
  // イレギュラーケース対策：'ipfs://ipfs/' を検出して 'ipfs://' に置き換える
  if (tokenURI.startsWith('ipfs://ipfs/')) {
    tokenURI = tokenURI.replace('ipfs://ipfs/', 'ipfs://');
  }

  // URIパス判定1：http or ipfs
  if (tokenURI.startsWith('http')) {
    return tokenURI;
  } else if (tokenURI.startsWith('ipfs')) {
    const formattedtokenURI = tokenURI.startsWith('ipfs://') ? tokenURI.slice(7) : tokenURI; 
    const uriParts = formattedtokenURI.split('/');

    // URIパス判定2：cidのみ or ファイル名付き
    let httpURL;
    if (uriParts.length === 1) {
      httpURL = `https://${uriParts[0]}.ipfs.w3s.link`;
    } else {
      httpURL = `https://${uriParts[0]}.ipfs.w3s.link/${uriParts[1]}`;
    }
    return httpURL;
  }

  // 想定外のURIが渡された場合、デフォルト値やエラーメッセージを返す
  throw new Error(`Invalid tokenURI: ${tokenURI}`);
};

// IPFSファイル取得
// ★これは不完全なため利用しない！！！！！
export async function fetchIPFSFile(cidStr: string) {
  try {
    const helia = await createHelia();
    const fs = unixfs(helia);

    // CIDが 'ipfs://' で始まる場合、スキーム部分を削除する
    const formattedCidStr = cidStr.startsWith('ipfs://') ? cidStr.slice(7) : cidStr;

    // CID部分だけを取得（ファイル名は除去）
    const cidParts = formattedCidStr.split('/');
    const dirCid = CID.parse(cidParts[0]);  // ディレクトリのCID
    const fileName = cidParts[1];  // ファイル名
    //const cid = CID.parse(formattedCidStr);
    //console.log('cid:', cid);
    console.log('cidParts[0]:', cidParts[0]);
    console.log('cidParts[1]:', cidParts[1]);

    // ファイルのデータを取得
    const file = fs.cat(dirCid);

    // データを文字列として処理
    let totalLength = 0;
    const chunks: Uint8Array[] = [];
    for await (const chunk of file) {
      chunks.push(chunk);
      totalLength += chunk.length; // 合計サイズを計算
    }

    // すべてのチャンクを結合
    let offset = 0;
    const mergedArray = new Uint8Array(totalLength);
    for (const chunk of chunks) {
      mergedArray.set(chunk, offset); // 各チャンクを適切な位置にセット
      offset += chunk.length;
    }

    // 結合されたデータをデコード
    const content = new TextDecoder().decode(mergedArray);
    const metadata = JSON.parse(content);

    console.log('IPFSデータ:', content);
    return content;

  } catch (error) {
    console.error('IPFSファイルの取得に失敗:', error);
  }
};
