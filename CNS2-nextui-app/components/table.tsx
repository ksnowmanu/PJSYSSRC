import React from "react";
import {
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  User, 
  Chip, 
  Tooltip, 
  ChipProps, 
  getKeyValue,
  DropdownTrigger, 
  Dropdown, 
  DropdownMenu, 
  DropdownItem, 
} from "@nextui-org/react";

import {columns, users} from "./data";
import { Link } from "@nextui-org/link";
import {Button} from "@nextui-org/button"
import {
    ShopIcon,
    TwitterXIcon,
    YoutubeIcon,
    FacebookIcon,
    VerticalDotsIcon,
  } from "@/components/icons";

import { 
  ListNft,
  bcLog, 
  bcLogErc20,
} from '@/pages/api/ethers';

const statusColorMap: Record<string, ChipProps["color"]>  = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

type User = typeof users[0];

export const Tables = () => {
  const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof User];

    switch (columnKey) {
      case "id":
        return (
          <div>
            <p className="text-bold text-sm sm:text-base text-center capitalize">{cellValue}</p>
          </div>
        );
      case "name":
        return (
          <User
            avatarProps={{radius: "lg", src: user.avatar}}
            name={cellValue}
            description={user.email}
          >
            {user.email}
          </User>
        );
      case "numtrade":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-md sm:text-base text-right capitalize">{cellValue}</p>
          </div>
        );
      case "tranval":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-md sm:text-base text-right capitalize">{cellValue}</p>
          </div>
        );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Tooltip content="Home">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <ShopIcon />
                </span>
              </Tooltip>
              <Tooltip content="X">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <TwitterXIcon />
                </span>
              </Tooltip>
              <Tooltip content="facebook">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <FacebookIcon />
                </span>
              </Tooltip>
              <Tooltip content="Youtube">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <YoutubeIcon />
                </span>
              </Tooltip>
            </div>
          );
          case "actions2":
            return (
              <div className="relative flex justify-items-center items-center gap-2 pl-2">
                <Dropdown className="bg-background border-1 border-default-200">
                  <DropdownTrigger>
                    <Button isIconOnly radius="full" size="sm" variant="light" className="text-default-400">
                      <VerticalDotsIcon />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem key="home" startContent={<ShopIcon/>}>HOME</DropdownItem>
                    <DropdownItem key="x" startContent={<TwitterXIcon/>}>X</DropdownItem>
                    <DropdownItem key="facebook" startContent={<FacebookIcon/>}>facebook</DropdownItem>
                    <DropdownItem key="youtube" startContent={<YoutubeIcon/>}>Youtube</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            );
/*      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
*/
      default:
        return cellValue;
    }
  }, []);

  return (
  <Table removeWrapper aria-label="Example table with custom cells" className="bg-black bg-cover bg-center rounded-xl opacity-80 w-full">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} className={`${column.classnameCommon} ${column.classnameH}`}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={users}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => 
              <TableCell className={`${columns.find(col => col.uid === columnKey)?.classnameCommon} 
                                     ${columns.find(col => col.uid === columnKey)?.classnameD}`}>
                {renderCell(item, columnKey)}
              </TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

// ERC721 and 1155 NFT Transferログリスト
interface ListNftTableProps {
  logs: ListNft[];
}
export const ListNftTable: React.FC<ListNftTableProps> = ({ logs }) => {
  return (
    <Table aria-label="List NFT Table">
      <TableHeader>
        <TableColumn>Block Number</TableColumn>
        <TableColumn>ContractAddress</TableColumn>
        <TableColumn>TokenId</TableColumn>
        <TableColumn>Value</TableColumn>
        <TableColumn>TransactionHash</TableColumn>
      </TableHeader>
      <TableBody items={logs}>
        {(log) => (
          <TableRow key={log.key}>
            <TableCell>{log.blockNumber}</TableCell>
            <TableCell>
              <Link 
                href={log.contractAddressUrlEtherscan} 
                isExternal
                showAnchorIcon
              >
                {log.contractAddress.slice(0,6)}...{log.contractAddress.slice(-4)}
              </Link>
            </TableCell>
            <TableCell>{log.tokenId}</TableCell>
            <TableCell className="text-right">{Number(log.data).toLocaleString()}</TableCell>
            <TableCell>
              <Link 
              href={log.transactionHashUrlEtherscan} 
              isExternal
              showAnchorIcon
              >
                {log.transactionHash.slice(0,6)}...{log.transactionHash.slice(-4)}
              </Link>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

// ERC20 Transferログリスト
interface BcLogTableProps {
  logs: bcLogErc20[];
}
export const BcLogTable: React.FC<BcLogTableProps> = ({ logs }) => {
  return (
    <Table aria-label="BC Log Table">
      <TableHeader>
        <TableColumn>Block Number</TableColumn>
        <TableColumn>Token IO</TableColumn>
        <TableColumn>FromAddress</TableColumn>
        <TableColumn>ToAddress</TableColumn>
        <TableColumn>Value</TableColumn>
        <TableColumn>Symbol</TableColumn>
        <TableColumn>TransactionHash</TableColumn>
      </TableHeader>
      <TableBody items={logs}>
        {(log) => (
          <TableRow key={log.key}>
            <TableCell>{log.blockNumber}</TableCell>
            <TableCell>{log.tokenIO}</TableCell>
            <TableCell>{log.fromAddress.slice(0,6)}...{log.fromAddress.slice(-4)}</TableCell>
            <TableCell>{log.toAddress.slice(0,6)}...{log.toAddress.slice(-4)}</TableCell>
            <TableCell className="text-right">{Number(log.data).toLocaleString()}</TableCell>
            <TableCell>{log.tokenSymbol.length > 20 ? log.tokenSymbol.slice(0,20)+'...': log.tokenSymbol}</TableCell>
            <TableCell>
              <Link 
              href={log.transactionHashUrlEtherscan} 
              isExternal
              showAnchorIcon
              >
                {log.transactionHash.slice(0,6)}...{log.transactionHash.slice(-4)}
              </Link>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};