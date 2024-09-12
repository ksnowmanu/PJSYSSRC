import { sql } from '@vercel/postgres';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function Handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': // GETメソッド (一覧取得)
        const users = await sql`SELECT * FROM users;`;
        return res.status(200).json({ users });

      case 'POST': // POSTメソッド (レコード追加 or 更新（ON CONFLICT DO UPDATE）)
        //const { wallet_address, username } = req.body;
        const post_mode = req.query.mode as string;
        const post_address = req.query.wallet_address as string;
        const post_username = req.query.username as string;
        if (!post_address || !post_username) {
          return res.status(400).json({ error: 'wallet_address and username are required' });
        }
        switch (post_mode) {
          case '0':
            const postUsers = await sql
            `INSERT INTO users (wallet_address, username) 
             VALUES (${post_address}, ${post_username})
             ON CONFLICT (wallet_address) 
             DO UPDATE SET username = EXCLUDED.username
             RETURNING *
             ;`; // UPDATEの項目は複数指定可能
            return res.status(200).json({ postUsers });
          case '1': // キー重複時に何もしない（処理スキップ）
            const insertUsers = await sql
            `INSERT INTO users (wallet_address, username) 
             VALUES (${post_address}, ${post_username})
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
