import { useEffect, useState } from "react";
import { Image, Button } from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Link } from "@nextui-org/react";
import { useNft } from "@/context/nft"; // Contextを読み込む
import {Tabs, Tab} from "@nextui-org/tabs";
import {
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter
  } from "@nextui-org/modal";
import { AttributeCard } from "@/components/cards";

interface NftModalProps {
  visible: boolean;
  closeModal: () => void;
}



const NftModal = ({ visible, closeModal }: NftModalProps) => {
  const { nftData } = useNft();

{/*
  const [blobImage, setBlobImage] = useState<Blob>();  // 表示用Blob画像
  useEffect(() => {
    const fetchData = async () => {
      if (nftData) {
        const response = await fetch(`/api/image?url=${encodeURIComponent(nftData.metaImageURL)}&type=full`);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        setBlobImage(await response.blob());
      }
    }

    fetchData();
  
  }, [nftData]);
 */}

  // メタデータ表示
  function openPage(metaString: string) {
    const newWindow = window.open("", "_blank"); // 新しいページを開いて文字列を表示
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>NftMetaData</title></head>
          <body><p>${metaString}</p></body>
        </html>
      `);
      newWindow.document.close();
    } else {
      alert("ポップアップがブロックされました。設定を確認してください。");
    }
  }

  return (
    <Modal
      isOpen={visible}
      onClose={closeModal}
      size={"5xl"}
      scrollBehavior={"inside"}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      placement={"top"}
      classNames={{
        body: "py-1",
        backdrop: "bg-[#1f1f1f]/70 backdrop-opacity-70",
        base: "h-screen border-[#f7f5f5] bg-[#242424] dark:bg-[#19172c] text-[#a8b0d3] max-h-[90vh]",
        header: "border-b-[1px] border-[#f7f5f5]",
        footer: "border-t-[1px] border-[#f7f5f5]",
        closeButton: "hover:bg-white/5 active:bg-white/10",
      }}
    >
      <ModalContent className="h-screen overflow-y-auto">
        <ModalHeader className="flex items-center px-4 py-2">
          <Image
            src="Company_noname_logo.png"
            alt="Company Logo"
            width={30}
            height={30}
            className="mr-2"
          />
          {nftData && (
            <>
              <div className="flex flex-row gap-1 pl-4 pr-4">
                <div className="text-base truncate">コレクション詳細</div>
              </div>
            </>
          )}
        </ModalHeader>
        <ModalBody className="flex justify-items-center">
          {nftData && (
            <>
              <div className="min-h-screen">
                <main className="container mx-auto px-4 py-2">
                  <div className="grid md:grid-cols-2 gap-8">

                    {/* 画面左側 */}
                    <div>
                      {/* NFT画像エリア */}
                      <Card>
                        <CardBody>
                          <div className="justify-items-center">
                            <Image
                              src={nftData.metaImageBlobURL}
                              alt="NFT Image"
                              className="object-cover w-full h-auto rounded-lg"
                              //className="object-cover w-full max-h-[50vh]"
                            />
                          </div>
                        </CardBody>
                        
                        {/* NFT情報エリア */}
                        <CardFooter className="text-sm">
                          {/* アコーディオン */}
                          <Accordion isCompact variant="bordered">

                            {/* アイテム１：詳細説明 */}
                            <AccordionItem key="1" aria-label="Description" title="Description">
                              <b>{nftData.metaDescription || "No Description..."}</b>
                            </AccordionItem>

                            {/* アイテム２：プロパティ情報 */}
                            <AccordionItem key="2" aria-label="Properties" title="Properties">
                              <AttributeCard attributes={nftData.metaAttributes} />
                            </AccordionItem>

                            {/* アイテム３：ブロックチェーン上のデータ情報 */}
                            <AccordionItem key="3" aria-label="Details" title="Details">
                              <div className="space-y-2">
                                {/* row1：コントラクトアドレス */}
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Contract Address</span>
                                  <a href={nftData.contractAddressUrlEtherscan} target="_blank" rel="noopener noreferrer">
                                    <span className="text-blue-600">{nftData.contractAddress.slice(0,6)}...{nftData.contractAddress.slice(-4)}</span>
                                  </a>
                                </div>
                                {/* row2：トークンID(URI) */}
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Token ID</span>
                                  <span
                                    id="clickable"
                                    onClick={() => openPage(nftData.tokenMetaData)} // onClickで関数を呼び出し
                                    style={{ cursor: "pointer" }}
                                    className="text-blue-600"
                                  >
                                    {nftData.tokenId}
                                  </span>
                                </div>
                                {/* row3：トークン標準 */}
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Token Standard</span>
                                  <span>{nftData.standard}</span>
                                </div>
                                {/* row4：最新transferログのトランザクションハッシュ */}
                                <div className="flex justify-between">
                                  <span className="text-gray-500">TransactionHash</span>
                                  <a href={nftData.transactionHashUrlEtherscan} target="_blank" rel="noopener noreferrer">
                                    <span className="text-blue-600">{nftData.transactionHash.slice(0,6)}...{nftData.transactionHash.slice(-4)}</span>
                                  </a>
                                </div>
                              </div>
                            </AccordionItem>

                          </Accordion>
                        </CardFooter>
                      </Card>
                    </div>

                    {/* 画面右側 */}
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-3xl font-bold">{nftData.metaName}</h1>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-gray-600">Owned by</span>
                          <span className="text-blue-600 font-medium">Owner123</span>
                        </div>
                      </div>

                      <Card>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-500">Current price</div>
                            <div className="text-3xl font-bold">15 ETH</div>
                            <div className="text-sm text-gray-500">$28,654.23</div>
                            <div className="text-sm text-gray-500">{nftData.transactionHash}</div>
                            <div className="text-sm text-gray-500">{nftData.blockNumber}</div>
                          </div>
                          <Button className="px-8">Buy now</Button>
                        </div>
                      </Card>

                      <Tabs>
                        <Tab key="activity" title="activity">
                          <Card>
                            <div className="text-center text-gray-500">No item activity yet</div>
                          </Card>
                        </Tab>
                        <Tab key="listings" title="listings">
                          <Card>
                            <div className="text-center text-gray-500">No listings yet</div>
                          </Card>
                        </Tab>
                        <Tab key="offers" title="offers">
                          <Card>
                            <div className="text-center text-gray-500">No offers yet</div>
                          </Card>
                        </Tab>
                      </Tabs>

                    </div>
                  </div>
                </main>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-2 max-w-[70%]">
          <span className="text-tiny text-gray-500 whitespace-nowrap">クリエーターサイト:</span>
          <div className="max-w-[500px] overflow-hidden">
            <Link 
              href={nftData?.metaExternalUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-tiny text-gray-500 truncate block"
            >
              {nftData?.metaExternalUrl}
            </Link>
          </div>
        </div>
        <Button onClick={closeModal} size="md" className="h-8 min-h-0 py-0">
          閉じる
        </Button>
      </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NftModal;