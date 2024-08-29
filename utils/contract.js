"use client"

import { getContract } from "thirdweb";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import contractABI from "./contractABI.json"


const contractAddress = process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;



export const contractFunding = getContract({
    client:client,
    chain: chain , 
    address: contractAddress,
    abi: contractABI,

});