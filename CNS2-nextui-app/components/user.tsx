import React, { createContext, useState, useContext } from 'react';

// ウォレット情報の型定義
interface WalletContextType {
    walletAddress: string | null;
    saveWalletInfo: (address: string) => void;
  }

// Contextの作成（初期値としてnullを許可するか、もしくは型に初期値を設定する）
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// WalletProviderコンポーネント
export const WalletProvider = ({ children }: {
    children: React.ReactNode;
  }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // ウォレット情報を保存する関数
  const saveWalletInfo = (address: string) => {
    setWalletAddress(address);
    localStorage.setItem('walletAddress', address);
  };

  return (
    <WalletContext.Provider value={{ walletAddress, saveWalletInfo }}>
      {children}
    </WalletContext.Provider>
  );
};

// Contextを利用するためのフック
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
