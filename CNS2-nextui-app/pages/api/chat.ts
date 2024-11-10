import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { message } = req.body;
    console.log('Request body:', req.body); // デバッグ用
    console.log(process.env.OPENAI_API_KEY)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          //model: 'gpt-4',
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
        }),
      });
      console.log("res?")
      const data = await response.json();
      console.log(data)
      res.status(200).json({ reply: data.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching response from OpenAI' });
    }
  }
