import React from "react";
const columns = [
  {name: "LANK", uid: "id", classname:"text-center w-1/12 p-1"},  
  {name: "コレクター名", uid: "name", classname:"text-left w-5/12 p-1"},
  {name: "取引件数", uid: "numtrade", classname:"text-center w-3/12 p-1"},
  {name: "STATUS", uid: "status", classname:"text-center w-3/12 p-1"},
];

const users = [
  {
    id: 1,
    name: "Tony Reichert",
    numtrade: "190",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    numtrade: "175",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    numtrade: "121",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    email: "jane.fisher@example.com",
  },
  {
    id: 4,
    name: "William Howard",
    numtrade: "89",
    team: "Marketing",
    status: "vacation",
    age: "28",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    email: "william.howard@example.com",
  },
  {
    id: 5,
    name: "Kristen Copper",
    numtrade: "62",
    team: "Sales",
    status: "active",
    age: "24",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    email: "kristen.cooper@example.com",
  },
];

export {columns, users};


{/* 
const columnsRankA = [
  {name: "NAME", uid: "name"},
  {name: "TRANS", uid: "trans"},
  {name: "TRADEVOL", uid: "tradevol"},
];

const columnsRankB = [
  {name: "NAME", uid: "name"},
  {name: "HOLD", uid: "hold"},
  {name: "ASSET", uid: "asset"},
];

const users = [
  {
    id: 1,
    name: "Tony Reichert",
    Waddress: "WWW",
    Maddress: "MMM",
    Xaddress: "SSS",
    Youtubeaddress: "YYY",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    trans: "10",
    tradevol: "100,000",
    hold: "310",
    asset: "116,000,000",
  },
  {
    id: 2,
    name: "Zoey Lang",
    Waddress: "WWW",
    Maddress: "MMM",
    Xaddress: "SSS",
    Youtubeaddress: "YYY",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    trans: "40",
    tradevol: "98,000",
    hold: "30",
    asset: "1,000,000",
  },
  {
    id: 3,
    name: "Jane Fisher",
    Waddress: "WWW",
    Maddress: "MMM",
    Xaddress: "SSS",
    Youtubeaddress: "YYY",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    trans: "135",
    tradevol: "30,000",
    hold: "110",
    asset: "1,700,000",
  },
  {
    id: 4,
    name: "William Howard",
    Waddress: "WWW",
    Maddress: "MMM",
    Xaddress: "SSS",
    Youtubeaddress: "YYY",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    trans: "75",
    tradevol: "630,000",
    hold: "5",
    asset: "12,000",
  },
  {
    id: 5,
    name: "Kristen Copper",
    Waddress: "WWW",
    Maddress: "MMM",
    Xaddress: "SSS",
    Youtubeaddress: "YYY",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
    trans: "5",
    tradevol: "930,000",
    hold: "77",
    asset: "91,400,000",
  },
];

export {columnsRankA, columnsRankB, users};
*/}