import React from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, ChipProps, getKeyValue} from "@nextui-org/react";
import {columns, users} from "./data";
import { Link } from "@nextui-org/link";
import {
    ShopIcon,
    TwitterXIcon,
    YoutubeIcon,
  } from "@/components/icons";

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
            <p className="text-bold text-sm text-center capitalize">{cellValue}</p>
          </div>
        );
      case "name":
        return (
          <User
            avatarProps={{radius: "lg", src: user.avatar}}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "numtrade":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm text-right capitalize">{cellValue}</p>
          </div>
        );
      case "tranval":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm text-right capitalize">{cellValue}</p>
          </div>
        );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Tooltip content="Details">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <ShopIcon />
                </span>
              </Tooltip>
              <Tooltip content="Edit user">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <TwitterXIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete user">
                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                  <YoutubeIcon />
                </span>
              </Tooltip>
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
  <Table removeWrapper aria-label="Example table with custom cells" className="bg-black bg-cover bg-center opacity-90 w-full">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} className={column.classname}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={users}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => 
              <TableCell className={columns.find(col => col.uid === columnKey)?.classname}>
                {renderCell(item, columnKey)}
              </TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
