import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Button } from "@nextui-org/button";
import { Tabs, Tab } from "@nextui-org/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from "@nextui-org/table";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { Tables } from "@/components/table"
import { 
  Contract1Cord,
  Contract2Cord,
  Contract3Cord,
  Contract4Cord,
  HelpCords,
  SupportCommunityCords,
 } from "@/components/cards"
import DefaultLayout from "@/layouts/default";

import {
  UserSquareIcon,
  HeartFilledIcon,
  CameraIcon,
  ShopIcon,
  HandshakeIcon,
  HandCoinIcon,
  SearchIcon,
  HelpDocsIcon,
} from "@/components/icons";

import {
  termSelect,
} from "@/components/select";

export default function IndexPage() {
  return (
    <DefaultLayout>

      {/* ★コントラクト選択 */}
      <section className="flex flex-row items-center justify-center gap-1 p-0 h-[40rem]">
        <div className="flex-row bg-[url('/network_image.png')] bg-cover bg-center h-full w-full">
          <div className="w-full h-full gap-6 grid grid-cols-12 grid-rows-3 gap-x-3 sm:gap-x-10">

            {/* 上段選択 */}
            <div className="col-span-6 sm:col-start-2 sm:col-span-3 pt-12"><Contract1Cord/></div>
            <div className="col-span-6 sm:col-span-3 pt-12"><Contract2Cord/></div>
            <div className="col-span-0 sm:col-span-6 pt-12"></div>

            {/* コメントエリア */}
            <div className="col-span-12 sm:col-span-12 inline-block text-center bg-black/30">
              <h1 className={title()}>Connect with&nbsp;</h1>
              <h1 className={title({ color: "pink" })}>collectors&nbsp;</h1>
              <br />
              <h1 className={title()}>in the world!</h1>
            </div>

            {/* 下段選択 */}
            <div className="col-span-6 sm:col-start-6 sm:col-span-3"><Contract3Cord/></div>
            <div className="col-span-6 sm:col-span-3"><Contract4Cord/></div>
          </div>
        </div>
      </section>

      {/* ★ランキング */}
      <section className="flex flex-col items-stretch justify-stretch gap-1 py-2 md:py-4">
        <div className="flex-row bg-[url('/bg_wave_gen_sf.png')] bg-cover bg-center h-full w-full">

          {/* コメントエリア */}
          <div className="inline-block text-left py-10">
            <h1 className={title()}>Explore your&nbsp;</h1>
            <h1 className={title({ color: "yellow" })}>interests&nbsp;</h1>
            <br />
            <h1 className={title()}>in the rankings.</h1>
          </div>

          {/* ユーザーフィルター */}
          <div className="scale-85 sm:scale-100 transform-origin-top-left ml-[-35px] sm:ml-0">
            <Tabs aria-label="Options" color="default" variant="solid">
              <Tab
                key="collectors"
                title={
                  <div className="flex items-center space-x-1">
                    <UserSquareIcon/>
                    <span>コレクター</span>
                  </div>
                }
              />
              <Tab
                key="creators"
                title={
                  <div className="flex items-center space-x-1">
                    <CameraIcon/>
                    <span>クリエイター</span>
                  </div>
                }
              />
              <Tab
                key="shops"
                title={
                  <div className="flex items-center space-x-1">
                    <ShopIcon/>
                    <span>ショップ</span>
                  </div>
                }
              />
              <Tab
                key="treasures"
                title={
                  <div className="flex items-center space-x-1">
                    <HeartFilledIcon/>
                    <span>アイテム</span>
                  </div>
                }
              />
            </Tabs>
          </div>

          <div className="gap-3 grid grid-cols-2 p-1 auto-rows-min">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center space-x-1 pl-4">
                  <HandshakeIcon/>
                  <span>取引量</span>
                </div>

                {/* 日付選択⇒通常時：タブ　sm時：ドロップダウン */}
                {/* 通常時 */}
                <div className="hidden sm:block">
                  <Tabs aria-label="Options" color="default" variant="solid">
                    <Tab
                      key="oneday"
                      title={<div className="flex items-center space-x-1"><span>１日</span></div>}
                    />
                    <Tab
                      key="oneweek"
                      title={<div className="flex items-center space-x-1"><span>１週</span></div>}
                    />
                    <Tab
                      key="onemonth"
                      title={<div className="flex items-center space-x-1"><span>１か月</span></div>}
                    />
                  </Tabs>
                </div>
                {/* sm時 */}
                <div className="block sm:hidden">
                  <termSelect/>
                </div>

                <div className="flex flex-row-reverse items-end">
                  <Button startContent={<SearchIcon/>}>
                    一覧表示
                  </Button>
                </div>
              </div>
              <Tables/>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center space-x-1 pl-4">
                  <HandCoinIcon/>
                  <span>保有資産</span>
                </div>
                <div className="col-span-2 flex flex-row-reverse items-end">
                  <Button startContent={<SearchIcon/>}>
                    一覧表示
                  </Button>
                </div>
              </div>
              <Tables/>
            </div>

          </div>
        </div>
      </section>

      {/* ★ヘルプ */}
      <section className="flex flex-col items-stretch justify-stretch gap-2 py-2 md:py-4">

        {/* コメントエリア */}
        <div className="inline-block text-left py-4 flex flex-row">
          <h1 className={title({ color: "green" })}>Learn&nbsp;</h1>
          <h1 className={title()}>how to use.&nbsp;</h1>
          <HelpDocsIcon/>
        </div>

        {/* Cardエリア */}
        <div className="flex flex-row w-full gap-3 grid grid-cols-6 grid-flow-row p-0 auto-rows-min">
          <div className="col-span-6">
            <HelpCords/>
          </div>
        </div>
      </section>

      {/* ★サポート＆コミュニティ */}
      <section className="flex flex-col items-center justify-center gap-2 py-2 md:py-4">

        {/* コメントエリア */}
        <div className="inline-block text-left py-4 flex flex-row">
          <h1 className={title()}>Support & Community</h1>
        </div>
        
        {/* Cardエリア */}
        <div className="flex flex-row justify-stretch gap-3 P-10">
            <SupportCommunityCords/>
        </div>

      </section>
    </DefaultLayout>
  );
}
