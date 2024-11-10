import type { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp';
import { fetchCustom } from "../api/ipfs";

export default async function Handler(
    req: NextApiRequest,
    res: NextApiResponse,
  ) {
    const { url, type } = req.query;
    if (!url) return res.status(400).json({ error: 'Image URL is required' });
    if (!type) return res.status(400).json({ error: 'Image Type is required' });

    let response: Response | undefined; // リソースを初期化
    try {
      const urlString: string = url as string;
      const typeString: string = type as string;

      // http/ipfsに合わせてfetchCustom内で適切にfetch
      const ipfsResponse = await fetchCustom(urlString, 1);
      if (!ipfsResponse) return res.status(500).json({ error: 'Failed to fetch image from IPFS' });

      response = ipfsResponse;
      const buffer = await response.arrayBuffer();

      // icon指定 あり：リサイズ＋base64変換、なし：base64変換のみ
      const base64Image = await resizeImageToBase64(Buffer.from(buffer), typeString);
      //const base64Image = await resizeImageToBase64(ipfsResponse, typeString);
      res.status(200).json({ base64Image });

{/*      
      // デフォルトタイプ作成
      let defaultType = 'image/jpeg';
      if (urlString.endsWith('.png')) defaultType = 'image/png';
      else if (urlString.endsWith('.gif')) defaultType = 'image/gif';

      // レスポンス情報セット
      res.setHeader('Content-Type', response.headers.get('content-type') || defaultType);
      res.setHeader('Set-Cookie', 'myCookie=testValue; Path=/; HttpOnly; Secure; SameSite=None'); // Set-Cookie (クロスサイト用)
      res.send(Buffer.from(buffer));
 */}

    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch image' });
    } finally {
      // 最終的なクリーンアップ処理。例えば、リソースの解放やログなど。
      console.log('Request completed');
    }
}

async function resizeImageToBase64(
  buffer: Buffer,
  type: string
): Promise<string> {
  let width = undefined;
  let height = undefined;

  // 画像メタデータから画像フォーマットを取得
  const metadata = await sharp(buffer).metadata();
  const format = (metadata.format as keyof sharp.FormatEnum) || 'png';

  if (type === 'icon') {
    width = 300; // アイコンとしてリサイズする場合の幅
  }

  const resizedBuffer = await sharp(buffer)
    .resize(width, height)
    .toFormat(format) // 元の画像形式を保持
    .toBuffer();

  // Base64文字列に変換
  return `data:image/${format};base64,${resizedBuffer.toString('base64')}`;

  {/*
  // 1. 画像を取得してblobデータとして読み込む
  const blob = await response.blob();

  // 画像形式を判別するためにMIMEタイプを取得
  const mimeType = blob.type; // 例: 'image/jpeg', 'image/png', 'image/gif'

  // 2. 画像データをImageオブジェクトに読み込む
  const img = new Image();
  img.src = URL.createObjectURL(blob);

  // 3. 画像の読み込み完了を待つ
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
  });

  // サイズを設定する
  let targetWidth: number;
  let targetHeight: number;
  const { naturalHeight: beforeHeight, naturalWidth: beforeWidth } = img;
  targetWidth = beforeWidth;
  targetHeight = beforeHeight;
  if (type === 'icon') {
    targetWidth = 200;
    targetHeight = Math.floor(beforeHeight * (targetWidth / beforeWidth));
  }

  // 4. Canvasに画像を描画してリサイズする
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas 2D コンテキストを取得できませんでした。");

  ctx.drawImage(img, 0, 0, beforeWidth, beforeHeight, 0, 0, targetWidth, targetHeight);
  //ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // 5. 画像のMIMEタイプに基づき、適切なフォーマットでBase64を取得
  const resizedBase64 = canvas.toDataURL(mimeType); // 'image/jpeg', 'image/png', 'image/gif' など
  
  return resizedBase64; */}
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