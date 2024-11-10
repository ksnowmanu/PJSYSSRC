import React, { createContext, useState, useContext } from 'react';
import { ListNft, bcLog } from '../pages/api/ethers';

// Contextの作成
interface NftContextType {
  nftData: ListNft | null;
  setNftData: (data: ListNft) => void;
};

// Contextの作成
const NftContext = createContext<NftContextType | undefined>(undefined);

// NftsProviderコンポーネント
export const NftProvider = ({ children }: { children: React.ReactNode }) => {
  const [nftData, setNftData] = useState<ListNft | null>(null);

  return (
    <NftContext.Provider value={{ nftData, setNftData }}>
      {children}
    </NftContext.Provider>
  );
};

// Contextを使用するカスタムフック
export const useNft = () => {
  const context = useContext(NftContext);
  if (context === undefined) throw new Error('useNft must be used within a NftProvider');
  return context;
};
