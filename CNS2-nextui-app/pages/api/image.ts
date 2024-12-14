import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp';
//import imagemin from 'imagemin';
//import imageminGifsicle from 'imagemin-gifsicle';
import { fetchCustom } from "../api/ipfs";

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse,
  ) {
    const { url, type } = req.query;
    if (!url) return res.status(400).json({ error: 'Image URL is required' });
    if (!type) return res.status(400).json({ error: 'Image Type is required' });

    //let response: Response | undefined; // リソースを初期化
    try {
      const urlString: string = url as string;
      const typeString: string = type as string;

      // base64データの場合、URLにbase64データが格納されている
      if (typeString === 'base64') {
        const blob = await Base64ToBlob(urlString);
        const arrayBuffer = await blob.arrayBuffer();
        const bufferResize = await resizeImage(Buffer.from(arrayBuffer), blob.type); // リサイズ

        res.setHeader('Content-Type', blob.type); // MIMEタイプをヘッダーに設定
        res.send(bufferResize); // ArrayBufferをBufferに変換して送信
        //res.send(Buffer.from(arrayBuffer)); // ArrayBufferをBufferに変換して送信
      } else {
        // http/ipfsに合わせてfetchCustom内で適切にfetch
        const response = await fetchCustom(urlString, 1);
        if (!response?.ok) throw new Error(`Failed to fetch image from ${urlString}`);
        const arrayBuffer = await response.arrayBuffer();

        // MIMEタイプ設定
        let mimeType; // 例: 'image/jpeg', 'image/png', 'image/gif'
        mimeType = response.headers.get('content-type');
        if (!mimeType) {
          const blob = await response.blob(); // blobデータから画像形式を判別
          mimeType = blob.type;
        }

        const bufferResize = await resizeImage(Buffer.from(arrayBuffer), mimeType); // リサイズ

        // レスポンス情報セット
        res.setHeader('Content-Type', mimeType);
        res.send(bufferResize);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch image' });
    } finally {
      // 最終的なクリーンアップ処理。例えば、リソースの解放やログなど。
      console.log('Request completed');
    }
}

async function Base64ToBlob(base64String: string) {
  // Base64ヘッダー部分を分離してMIMEタイプを取得
  const match = base64String.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid base64 string');
  }
  const mimeType = match[1]; // MIMEタイプを取得
  const data = match[2]; // 実際のBase64データ部分

  // Base64データをデコードしてバイナリデータに変換
  const byteCharacters = atob(data); // Base64デコード
  const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);

  // Blobを作成
  return new Blob([byteArray], { type: mimeType });
}

async function resizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  let width = undefined;
  let height = undefined;

  if (mimeType.toLowerCase().includes("gif")) return buffer;
{/*一旦gifの圧縮は先送り（うまく動かない）
  if (mimeType.toLowerCase().includes("gif")) {
      const compressed = await imagemin.buffer(buffer, {
        plugins: [
            imageminGifsicle({
                optimizationLevel: 1, // 圧縮レベル（1～3）
                //colors: 256, // 使用する色数
            }),
        ],
    });
    return compressed;
  }
*/}

  // 画像メタデータから画像フォーマットを取得
  const metadata = await sharp(buffer).metadata();
  const format = (metadata.format as keyof sharp.FormatEnum) || 'png';

  width = 250; // アイコンとしてリサイズする場合の幅
  const resizedBuffer = await sharp(buffer)
    .resize(width, height)
    .toFormat(format) // 元の画像形式を保持
    .toBuffer();

  return resizedBuffer;

}


{/*
export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { urls } = req.query; // 複数のURLをクエリパラメータで受け取る
  if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: 'Image URLs are required' });

  const successfulResults: Buffer[] = [];
  const failedResults: string[] = []; // 失敗したURLを格納
  const retryCount = 3; // リトライ回数

  for (const url of urls) {
    try {
      let response: Response;
      response = await fetchCustom(url, 1); // 最初のリクエストを行う
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        successfulResults.push(Buffer.from(buffer));
      } else {
        failedResults.push(url); // HTTPエラーの場合も記録
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      failedResults.push(url as string); // エラーが発生したURLを記録
    }
  }

  // 失敗した画像に対してリトライを行う
  for (const url of failedResults) {
    let success = false;

    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const response = await fetchCustom(url, 1);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          successfulResults.push(Buffer.from(buffer));
          success = true;
          break; // リトライ成功の場合、ループを抜ける
        }
      } catch (error) {
        console.error('Retry error fetching image:', error);
      }
    }

    if (!success) {
      // 最終的に取得できなかった場合、エラーメッセージを記録
      console.error(`Failed to fetch image after ${retryCount} attempts: ${url}`);
    }
  }

  // 成功した画像を返す
  res.setHeader('Content-Type', 'application/json');
  if (successfulResults.length > 0) {
    res.json({
      successImages: successfulResults,
      message: 'Images fetched successfully.',
    });
  } else {
    res.status(500).json({ error: '全ての画像取得に失敗しました' });
  }
}
 */}