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
import DefaultLayout from "@/layouts/default";
import { Tables } from "@/components/table"

import {
  GithubIcon,
  UserSquareIcon,
  HeartFilledIcon,
  CameraIcon,
  ShopIcon,
  HandshakeIcon,
  HandCoinIcon,
  SearchIcon,
} from "@/components/icons";

export default function IndexPage() {
  return (
    <DefaultLayout>
      {/* コントラクト選択 */}
      <section className="flex flex-row items-center justify-center gap-4 p-0 h-[30rem]">
        <div className="flex-row bg-[url('/network_image.jpg')] bg-cover bg-center h-full w-full">
          <div className="w-full h-full gap-6 grid grid-cols-12 grid-rows-2 p-8">
            <Card className="col-span-12 sm:col-start-2 sm:col-span-3 h-[200px]">
              <CardHeader className="absolute z-10 top-1 flex-col items-start">
                <p className="text-tiny text-white/60 uppercase font-bold">Your day your way</p>
                <h4 className="text-white/90 font-medium text-xl">Trading Cards</h4>
              </CardHeader>
              <Image
                removeWrapper
                alt="Woman listing to music"
                className="z-0 w-full h-full scale-100 translate-y-0 object-cover"
                src="trc.jpg"
              />
              <CardFooter className="justify-between bg-black/40 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                <p className="text-tiny text-white/80">Available soon.</p>
                <Button className="text-tiny text-white bg-black/60" variant="flat" color="default" radius="lg" size="sm">
                  Notify me
                </Button>
              </CardFooter>
            </Card>
            
            <Card isFooterBlurred className="w-full h-[200px] col-span-12 sm:col-span-3">
              <CardHeader className="absolute z-10 top-1 flex-col items-start">
                <p className="text-tiny text-white/60 uppercase font-bold">Your day your way</p>
                <h4 className="text-white/90 font-medium text-xl">illustration</h4>
              </CardHeader>
              <Image
                removeWrapper
                alt="Woman listing to music"
                className="z-0 w-full h-full scale-100 translate-y-0 object-cover"
                src="sumple_ill2.png"
              />
              <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                <p className="text-tiny text-white/80">Available soon.</p>
                <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
                  Notify me
                </Button>
              </CardFooter>
            </Card>

            <Card isFooterBlurred className="w-full h-[200px] col-span-12 sm:col-start-6 sm:col-span-3">
              <CardHeader className="absolute z-10 top-1 flex-col items-start">
                <p className="text-tiny text-white/60 uppercase font-bold">New</p>
                <h4 className="text-white font-medium text-2xl">Photograph</h4>
              </CardHeader>
              <Image
                removeWrapper
                alt="Card example background"
                className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                src="https://nextui.org/images/card-example-6.jpeg"
              />
              <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                <p className="text-tiny text-white/80">Available soon.</p>
                <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
                  Notify me
                </Button>
              </CardFooter>
            </Card>

            <Card isFooterBlurred className="w-full h-[200px] col-span-12 sm:col-span-3">
              <CardHeader className="absolute z-10 top-1 flex-col items-start">
                <p className="text-tiny text-white/60 uppercase font-bold">New</p>
                <h4 className="text-white/90 font-medium text-xl">Comming Soon...</h4>
              </CardHeader>
              <Image
                removeWrapper
                alt="Relaxing app background"
                className="z-0 w-full h-full object-cover"
                src="https://nextui.org/images/card-example-5.jpeg"
              />
              <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                <p className="text-tiny text-white/80">Available soon.</p>
                <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
                  Notify me
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* ランキング 条件１行目*/}
      <section className="flex flex-col items-center justify-center gap-2 py-2 md:py-4">
        <div className="flex flex-row items-start w-full gap-6">
          <Tabs aria-label="Options" color="default" variant="solid">
            <Tab
              key="collectors"
              title={
                <div className="flex items-center space-x-2">
                  <UserSquareIcon/>
                  <span>コレクター</span>
                </div>
              }
            />
            <Tab
              key="creators"
              title={
                <div className="flex items-center space-x-2">
                  <CameraIcon/>
                  <span>クリエイター</span>
                </div>
              }
            />
            <Tab
              key="shops"
              title={
                <div className="flex items-center space-x-2">
                  <ShopIcon/>
                  <span>ショップ</span>
                </div>
              }
            />
            <Tab
              key="treasures"
              title={
                <div className="flex items-center space-x-2">
                  <HeartFilledIcon/>
                  <span>アイテム</span>
                </div>
              }
            />
          </Tabs>
        </div>

        <div className="flex flex-row w-full gap-3 grid grid-cols-6 grid-flow-row p-1 auto-rows-min">
          <div className="flex items-center space-x-2 pl-4">
            <HandshakeIcon/>
            <span>取引量</span>
          </div>
          <div>
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
          <div className="flex flex-row-reverse items-end">
            <Button startContent={<SearchIcon/>}>
              一覧表示
            </Button>
          </div>
          <div className="flex flex-row items-center space-x-2 pl-4">
            <HandCoinIcon/>
            <span>保有資産</span>
          </div>
          <div className="col-span-2 flex flex-row-reverse items-end">
            <Button startContent={<SearchIcon/>}>
              一覧表示
            </Button>
          </div>
          <div className="col-span-3"><Tables/></div>
          <div className="col-span-3"><Tables/></div>
        </div>

        <div className="inline-block max-w-xl text-center justify-center">
          <h1 className={title()}>Make&nbsp;</h1>
          <h1 className={title({ color: "violet" })}>beautiful&nbsp;</h1>
          <br />
          <h1 className={title()}>
            websites regardless of your design experience.
          </h1>
          <h4 className={subtitle({ class: "mt-4" })}>
            Beautiful, fast and modern React UI library.
          </h4>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
            href={siteConfig.links.docs}
          >
            Documentation
          </Link>
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.github}
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </div>

        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Get started by editing{" "}
              <Code color="primary">pages/index.tsx</Code>
            </span>
          </Snippet>
        </div>
      </section>
    </DefaultLayout>
  );
}
