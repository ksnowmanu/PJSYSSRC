import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import {
  TwitterXIcon,
  YoutubeIcon,
} from "@/components/icons";

export const Contract1Cord = () => {
  return(
    <Card isFooterBlurred className="w-full h-[200px] animate-bounceY">
      <CardHeader className="absolute z-10 top-0 flex-col items-start">
        <h4 className="text-white/90 font-medium text-center text-2xl bg-black/60 rounded-full px-2">Trading Cards</h4>
      </CardHeader>
      <Image
        isZoomed
        removeWrapper
        alt="Woman listing to music"
        className="z-0 w-full h-full scale-100 translate-y-0 object-cover"
        src="Contract_trc.png"
      />
      <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
        <b className="text-tiny text-white/80">トレカを見に行こう</b>
        <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
            開く
        </Button>
      </CardFooter>
    </Card>
  )
};

export const Contract2Cord = () => {
  return(
    <Card isFooterBlurred className="w-full h-[200px] animate-bounceY animation-delay-1000">
    <CardHeader className="absolute z-10 top-0 flex-col items-start">
      <h4 className="text-white/90 font-medium text-center text-2xl bg-black/60 rounded-full px-2">illustration</h4>
    </CardHeader>
    <Image
      isZoomed
      removeWrapper
      alt="Woman listing to music"
      className="z-0 w-full h-full scale-100 translate-y-0 object-cover"
      src="Contract_ill.png"
    />
    <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
      <b className="text-tiny text-white/80">イラストを見に行こう</b>
      <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
        開く
      </Button>
    </CardFooter>
  </Card>
  )
};

export const Contract3Cord = () => {
  return(
    <Card isFooterBlurred className="w-full h-[200px] animate-bounceY animation-delay-2000">
    <CardHeader className="absolute z-10 top-0 flex-col items-start">
      <h4 className="text-white font-medium text-center text-2xl bg-black/60 rounded-full px-2">Photograph</h4>
    </CardHeader>
    <Image
      isZoomed
      removeWrapper
      alt="Card example background"
      className="z-0 w-full h-full scale-100 translate-y-0 object-cover"
      src="Contract_photo.png"
    />
    <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
      <b className="text-tiny text-white/80">写真を見に行こう</b>
      <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
        開く
      </Button>
    </CardFooter>
  </Card>
  )
};

export const Contract4Cord = () => {
  return(
    <Card isFooterBlurred className="w-full h-[200px] animate-bounceY animation-delay-500">
    <CardHeader className="absolute z-10 top-1 flex-col items-start">
      <p className="text-tiny text-white/60 uppercase font-bold">New</p>
      <h4 className="text-white/90 font-medium text-xl">Comming Soon...</h4>
    </CardHeader>
    <Image
      isZoomed
      removeWrapper
      alt="Relaxing app background"
      className="z-0 w-full h-full object-cover"
      src="Contract_comming_soon.png"
    />
    <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
      <p className="text-tiny text-white/80">Available soon.</p>
      <Button className="text-tiny text-white bg-black/20" variant="flat" color="default" radius="lg" size="sm">
        開く
      </Button>
    </CardFooter>
  </Card>
  )
};

export const HelpCords = () => {
  const list = [
    {
      title: "CNSについて",
      img: "/help_aboutService.png",
      href:"/docs"
    },
    {
      title: "ウォレット作成方法",
      img: "/help_aboutWallet.png",
      href:"/blog"
    },
    {
      title: "取引の流れ",
      img: "/help_aboutTrade.png",
      href:"/docs"
    },
    {
      title: "資産管理方法",
      img: "/help_aboutAsset.png",
      href:"/docs"
    },
    {
      title: "コレクション登録方法",
      img: "/help_aboutMint.png",
      href:"/docs"
    },
    {
      title: "取引所の開設(For Biz)",
      img: "/help_aboutMarket.png",
      href:"/docs"
    },
  ];

  return(
    <div className="gap-6 grid grid-cols-2 sm:grid-cols-6">
      {list.map((item, index) => (
        <Link href={item.href}>
          <Card className="w-full" shadow="sm" key={index} isPressable onPress={() => console.log("item pressed")}>
            <CardBody className="overflow-visible p-0">
              <Image
                isZoomed
                shadow="sm"
                radius="lg"
                width="100%"
                alt={item.title}
                className="w-full object-cover h-[140px]"
                src={item.img}
              />
            </CardBody>
            <CardFooter className="text-small justify-center">
              <b>{item.title}</b>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
};

export const SupportCommunityCords = () => {
  const list = [
    {
      title: " (Twitter)",
      img: "SNS_world_gen_sf.png",      
      icon: <TwitterXIcon/>,
      href:"/docs"
    },
    {
      title: "Youtube",
      img: "SNS_mov_gen_sf.png",
      icon: <YoutubeIcon/>,
      href:"/blog"
    },
  ];

  return(
    <div className="gap-6 grid grid-cols-2 sm:grid-cols-2">
      {list.map((item, index) => (
        <Link href={item.href}>
          <Card className="w-full" shadow="sm" key={index} isPressable onPress={() => console.log("item pressed")}>
            <CardBody className="overflow-visible p-0">
              <Image
                isZoomed
                shadow="sm"
                radius="lg"
                width="100%"
                alt={item.title}
                className="w-full object-cover h-[140px]"
                src={item.img}
              />
            </CardBody>
            <CardFooter className="text-small justify-center">
              {item.icon}
              <b>{item.title}</b>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
};
