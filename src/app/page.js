"use client";
import React, { useEffect, useState } from "react";
import { prepareContractCall } from "thirdweb";
import {
  useReadContract,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { contractFunding } from "../utils/contract";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* global BigInt */

export default function Home() {
  const [sendUserEth, setUserSendEth] = useState("");

  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();

  const { data: contractTotalBalance, refetch: refetchTotalBalance } =
    useReadContract({
      contract: contractFunding,
      method: "getContractBalance",
      params: [],
    });
  const { data: totalContribution, refetch: refetchTotalContribution } =
    useReadContract({
      contract: contractFunding,
      method: "contributors",
      params: [account ? account.address : ""],
    });
  const { data: Target, refetch: refetchTarget } = useReadContract({
    contract: contractFunding,
    method: "target",
    params: [],
  });

  const { data: deadLineOfContract, refetch: refetchDeadLine } =
    useReadContract({
      contract: contractFunding,
      method: "deadline",
      params: [],
    });

  const { data: miniContribution } = useReadContract({
    contract: contractFunding,
    method: "minimumContribution",
    params: [],
  });

 
  console.log("raise" , Target , contractTotalBalance)

  const currentTime = Math.floor(new Date().getTime() / 1000);

  const sendEthFunction = async () => {
    if (!account) {
      toast.error("No Wallet Connected");
    } else if (!sendUserEth) {
      toast.error("field cannot be empty");
    } else if (
      sendUserEth >= String(miniContribution) ||
      sendUserEth >= String(0)
    ) {
      toast.error("You cannot send less than 100 Wei");
    } else if (currentTime > deadLineOfContract) {
      toast.error("Deadline has passed");
    } else {
      try {
        const transaction = await prepareContractCall({
          contract: contractFunding,
          method: "sendEth",
          params: [BigInt(sendUserEth)],
          value: BigInt(sendUserEth),
        });
        sendTransaction(transaction);
      } catch (error) {
        toast.error("something went wrong");
        console.error("Error", error);
      }
    }
  };

  const reFundEthFunction = async () => {
    if (!account) {
      toast.error("No Wallet Connected");
    } else if (
      currentTime < deadLineOfContract ||
      contractTotalBalance > Target
    ) {
      toast.error("You are not eligible for refund");
    } else {
      try {
        const transaction = await prepareContractCall({
          contract: contractFunding,
          method: "refund",
          params: [],
        });
        sendTransaction(transaction);
      } catch (error) {
        toast.error("something went wrong");
        console.error("Error", error);
      }
    }
  };

  useEffect(() => {
    if (account) {
      // Refetch contract data when account changes
      refetchTotalBalance();
      refetchTotalContribution();
      refetchTarget();
      refetchDeadLine();
    }
  }, [account, sendEthFunction, reFundEthFunction]);

  return (
    <>
      <div className=" flex flex-row mt-5 bg-gray-200 text-gray-800 p-8 w-full rounded-lg font-[sans-serif] max-w-screen-2xl mx-auto">
        <div className="flex">
          <div className="bg-white shadow-[0_4px_12px_-5px_rgba(0,0,0,0.4)] p-6 w-full max-w-sm rounded-lg font-[sans-serif] overflow-hidden mx-auto mt-4">
            <h3 className="flex justify-center text-gray-800 text-lg font-semibold">
              Send Eth
            </h3>

            <input
              type="text"
              value={sendUserEth}
              onChange={(e) => setUserSendEth(e.target.value)}
              placeholder="Enter amount"
              className="px-20 py-4 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
            <button
              type="button"
              onClick={sendEthFunction}
              className="mt-4 px-6 py-3 text-sm w-full bg-[#007bff] hover:bg-[#006bff] text-white rounded transition-all"
            >
              Send
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center ml-5 bg-white shadow-[0_4px_12px_-5px_rgba(0,0,0,0.4)] p-6 w-full max-w-sm rounded-lg font-[sans-serif] overflow-hidden mx-auto mt-4">
          <h3 className="text-gray-800 text-lg font-semibold">
            Total Contribution
          </h3>
          <p className="text-xl text-gray-500 py-2">
            {account
              ? totalContribution
                ? String(totalContribution)
                : "0"
              : "0"}
          </p>
          <button
            type="button"
            onClick={reFundEthFunction}
            className="mt-5 px-6 py-3 text-sm w-full bg-[#007bff] hover:bg-[#006bff] text-white rounded transition-all"
          >
            Refund
          </button>
        </div>

        <div className="flex flex-col justify-evenly items-center p-6 w-full max-w-sm rounded-lg font-[sans-serif] overflow-hidden mx-auto">
          <h3 className="text-gray-800 text-lg font-semibold">
            Contract Balance
          </h3>
          <p className="text-xl text-gray-500">
            {contractTotalBalance ? String(contractTotalBalance) : "0"}
          </p>
        </div>
        <div className="flex flex-col justify-evenly items-center p-6 w-full max-w-sm rounded-lg font-[sans-serif] overflow-hidden mx-auto">
          <h3 className="text-gray-800 text-lg font-semibold">Target </h3>
          <p className="text-xl text-gray-500 ">
            {Target ? String(Target) : "0"}
          </p>
        </div>
      </div>
    </>
  );
}
