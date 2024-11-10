import { useEffect } from "react";
import { Image, Button } from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { useNft } from "@/context/nft"; // Contextを読み込む
import {
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter
  } from "@nextui-org/modal";

interface NftModalProps {
  visible: boolean;
  closeModal: () => void;
}

const NftModal = ({ visible, closeModal }: NftModalProps) => {
  const { nftData } = useNft();

  return (
    <Modal isOpen={visible} onClose={closeModal} size={"full"} scrollBehavior={"outside"} isDismissable={false} isKeyboardDismissDisabled={true}>
      <ModalContent className="h-screen overflow-y-auto">
        <ModalHeader>
          {nftData && (
            <>
              <div className="flex flex-row gap-1 pr-4">
                <div className="text-base">コレクション名 : {nftData.metaName}</div>
              </div>
            </>
          )}
        </ModalHeader>
        <ModalBody className="flex flex-col justify-items-center">
          {nftData && (
            <>
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="grid grid-rows-2 h-full gap-4">
                  <div className="flex items-center justify-center h-full">
                  <Card className="w-full max-h-[50vh]">
                    <CardBody className="flex flex-rows overflow-visible text-center text-default-500 text-xs lg:text-sm p-0">
                      <Image
                        src={nftData.metaImage64}
                        alt={nftData.metaName}
                        className="object-cover w-full max-h-[40vh]"
                      />
                    </CardBody>
                  </Card>
{/*
                    <Image
                      src={URL.createObjectURL(nftData.metaImage)}
                      alt={nftData.metaName}
                      className="object-cover w-full max-h-[50vh]"
                    />
 */}
                  </div>
                  <div className="p-4">
                    <div className="text-sm">{nftData.metaDescription}</div>
                    <div className="text-sm">コントラクトアドレス : {nftData.contractAddress}</div>
                    <div className="text-sm">トークンID : {nftData.tokenId}</div>
                    <div className="text-sm">取得価格: {nftData.tokenValue}</div>
                    <div className="text-sm">tranHash: {nftData.transactionHash}</div>
                  </div>
                </div>
                <div className="p-4">
                  aaa
                </div>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={closeModal}>
            閉じる
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NftModal;