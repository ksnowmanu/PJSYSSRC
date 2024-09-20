//https://docs.ethers.org/v6/api/providers/#Provider-getLogs
//https://ai-tool.userlocal.jp/text2code/texts

{/* ethereum接続に必要！ https://docs.ethers.org/v6/getting-started/ */}
import { ethers } from "ethers";
import { useEffect, useState } from 'react';
import { WalletProvider, useWallet } from "@/components/user";

{/*
// ブロックチェーンのログデータを取得する関数
async function getBlockchainLogs(address) {
  try {
    const provider = new ethers.BrowserProvider(windowEthereum);
    const logs = await provider.getLogs({
      address: address,
      fromBlock: 0,
      toBlock: 'latest'
    });
    console.log('ログデータ:', logs);
    return logs;
  } catch (error) {
    console.error('エラー:', error);
    return null;
  }
}

// 使用例
const targetAddress = '0x1234567890123456789012345678901234567890';
getBlockchainLogs(targetAddress).then(logs => {
  if (logs) {
    // ログデータの処理
    const resultDiv = document.getElementById('js-result');
    if (resultDiv) {
      resultDiv.innerHTML = '<h2>ブロックチェーンログ</h2>';
      logs.forEach((log, index) => {
        resultDiv.innerHTML += `<p>ログ ${index + 1}: ${JSON.stringify(log)}</p>`;
      });
    }
  }
});
    */}