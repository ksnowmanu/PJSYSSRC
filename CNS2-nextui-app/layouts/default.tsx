import { Link } from "@nextui-org/link";

import { Head } from "./head";
import { Navbar } from "@/components/navbar";
import { Image } from "@nextui-org/image";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Head />
      <Navbar />
      <main className="sm:container sm:mx-auto max-w-full px-2 flex-grow pt-2">
        {children}
      </main>
      <footer className="w-full ">
        <div className="grid grid-cols-3 grid-rows-1 items-center justify-center px-1 py-3">
          <div>
            <Image
              radius="none"
              className="w-full h-[60px] sm:w-1/5 sm:h-1/5"
              src="Company_logo.png"
            />
          </div>
          <div className="text-center">
            <span className="text-default-400 text-xs">© 2024 CNS Inc. All rights reserved.</span>
          </div>
          <div className="text-right">
            <span className="text-default-400 text-xs px-0">プライバシーポリシー</span>
            <br/>
            <span className="text-default-400 text-xs px-0">サービス利用規約</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
