import { sql } from '@vercel/postgres';
import type { NextApiRequest, NextApiResponse } from "next";

// ListItem 型の定義
export type ListItem = {
  wallet_address: string;
  href: string;
  username: string;
  email: string;
  profile_image_url: string;
  profile_banner_url: string;
  x_address: string;
  instagram_address: string;
  tiktok_address: string;
  youtube_address: string;
  facebook_address: string;
  blog_address: string;
  homepage_address: string;
  favorite_users: string;
  favorite_items: string;
  hashtags: string;
  created_at: string;
  updated_at: string;
};

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  try {
    switch (method) {
      // GETメソッド (一覧取得)
      // mode:0 全レコード取得
      // mode:1 指定の１件を取得
      // mode:? ★指定件数を取得するモードを追加予定
      case 'GET':
        //const get_mode = req.query.mode as string;
        const get_address = req.query.wallet_address as string || ""; // undefinedの場合、空文字を代入
        const users = get_address === ""
        ? await sql`SELECT * FROM users`
        : await sql`SELECT * FROM users WHERE wallet_address = ${get_address}`;
        
        // 配列返却
        //const userArray = users.rows.map((user: any) => Object.values(user));

        // ListItem型
        const userlistItems: ListItem[] = users.rows.map((user: any) => ({
          wallet_address: user.wallet_address,
          href: `/personal?id=${user.wallet_address}`,
          username: user.username,
          email: user.email,
          profile_image_url: user.profile_image_url,
          profile_banner_url: user.profile_banner_url,
          x_address: user.x_address,
          instagram_address: user.instagram_address,
          tiktok_address: user.tiktok_address,
          youtube_address: user.youtube_address,
          facebook_address: user.facebook_address,
          blog_address: user.blog_address,
          homepage_address: user.homepage_address,
          favorite_users: user.favorite_users,
          favorite_items: user.favorite_items,
          hashtags: user.hashtags,
          created_at: user.created_at,
          updated_at: user.updated_at
        }));

        return res.status(200).json({ userlistItems });

      // POSTメソッド (レコード追加 or 更新（ON CONFLICT DO UPDATE）)
      // mode:0 Insert or Update
      // mode:1 Insert ※キー重複時に何もしない（処理スキップ）
      case 'POST':
        //const { wallet_address, username } = req.body;
        const post_mode = req.query.mode as string;
        const post_address = req.query.wallet_address as string;
        const post_username = req.query.username as string;
        const post_profile_image_url = req.query.profile_image_url as string
        const post_profile_banner_url = req.query.profile_banner_url as string
        if (!post_address || !post_username) {
          return res.status(400).json({ error: 'wallet_address and username are required' });
        }
        switch (post_mode) {
          case '0':
            const postUsers = await sql
            `INSERT INTO users (wallet_address, username, profile_image_url, profile_banner_url) 
             VALUES (${post_address}, ${post_username}, ${post_profile_image_url}, ${post_profile_banner_url})
             ON CONFLICT (wallet_address) 
             DO UPDATE SET username = EXCLUDED.username, 
                           profile_image_url = EXCLUDED.profile_image_url, 
                           profile_banner_url = EXCLUDED.profile_banner_url
             RETURNING *
             ;`;
            return res.status(200).json({ postUsers });
          case '1':
            const insertUsers = await sql
            `INSERT INTO users (wallet_address, username, profile_image_url, profile_banner_url) 
             VALUES (${post_address}, ${post_username}, ${post_profile_image_url}, ${post_profile_banner_url})
             ON CONFLICT (wallet_address) 
             DO NOTHING
             ;`;
             return res.status(201).json({ message: 'User added successfully' });
          default:
            return res.setHeader('Allow', ['0:INSERT or UPDATE', '1:INSERT'])
                      .status(405)
                      .end(`Mode ${post_mode} Not Allowed`);
          }

      case 'DELETE': // DELETEメソッドの処理 (レコード削除)
        const del_address = req.query.wallet_address as string;
        if (!del_address) {
          return res.status(400).json({ error: 'wallet_address is required to delete a user' });
        }
        await sql
        `DELETE FROM users 
         WHERE wallet_address = ${del_address}
         ;`;
        return res.status(200).json({ message: 'User deleted successfully' });  
        
      default: // 未定義メソッド（エラー）
        return res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
                  .status(405)
                  .end(`Method ${method} Not Allowed`);
      }
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
}
