{/* ethereum接続に必要！ https://docs.ethers.org/v6/getting-started/ */}
import { ethers } from "ethers";
import { useEffect, useState } from 'react';
import { WalletProvider, useWallet } from "@/components/user";

