import { useEffect, useState } from 'react';
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useNft } from '@/context/nft'; // nft情報を保存してシステム全体で利用するためのcontextを利用する

export default function TradingPage() {
  const { nftData } = useNft();
  if (!nftData) {
    return <div>No NFT data found</div>;
  }
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>trades</h1>
          {nftData.metaName}
        </div>
      </section>
    </DefaultLayout>
  );
}
