import React from "react";
import {Select, SelectSection, SelectItem} from "@nextui-org/select";
import {
  UserSquareIcon,
  HeartFilledIcon,
  CameraIcon,
  ShopIcon,
} from "@/components/icons";

export const RankFilterSelect = () => {
  const listFilter = [
    {key: "collector", label: "コレクター", icon:<UserSquareIcon/>},
    {key: "creater", label: "クリエイター", icon:<CameraIcon/>},
    {key: "shop", label: "ショップ", icon:<ShopIcon/>},
    {key: "item", label: "アイテム", icon:<HeartFilledIcon/>},
  ];

  return(
    <Select 
      variant="underlined"
      label="Select..."
      className="min-w-xs" 
    >
    {listFilter.map((listFilter) => (
      <SelectItem key={listFilter.key} startContent={listFilter.icon}>
        {listFilter.label}
      </SelectItem>
    ))}
  </Select>
  )
};

export const TermSelect = () => {
  const listDays = [
    {key: "day", label: "１日"},
    {key: "week", label: "１週"},
    {key: "month", label: "１か月"},
  ];

  return(
    <Select 
      variant="underlined"
      label="Select..." 
      className="min-w-xs" 
    >
    {listDays.map((listDays) => (
      <SelectItem key={listDays.key}>
        {listDays.label}
      </SelectItem>
    ))}
  </Select>
  )
};
