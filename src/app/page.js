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
  const [sendRequestId, setSendRequestId] = useState("");


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
  const { data: RaiseAmount, refetch: refetchRaiseAmount } = useReadContract({
    contract: contractFunding,
    method: "raiseAmount",
    params: [],
  });
  const { data: allRequestsData, isLoading: isLoadingRequestData } =
    useReadContract({
      contract: contractFunding,
      method: "getAllRequests",
      params: [],
    });
    const { data:checkStatus  } = useReadContract({ 
      contract: contractFunding,
      method: "requests", 
      params: [sendRequestId] 
    });
    const [
      totalRequests,
      requestIds,
      descriptions,
      recipients,
      values,
      completeds,
      voters,
      noOfVotersList,
    ] = checkStatus;

    console.log("status", voters )


  const requests = [];
  if (allRequestsData && allRequestsData.length > 0) {
    const [
      totalRequests,
      requestIds,
      descriptions,
      recipients,
      values,
      completeds,
      noOfVotersList,
    ] = allRequestsData;

    for (let i = 0; i < totalRequests; i++) {
      requests.push({
        requestId: requestIds[i],
        description: descriptions[i],
        recipient: recipients[i],
        value: values[i],
        completed: completeds[i],
        noOfVoters: noOfVotersList[i],
      });
    }
  }

  const currentTime = Math.floor(new Date().getTime() / 1000);
  const sendEthFunction = async () => {
    if (!account) {
      toast.error("No Wallet Connected");
    } else if (!sendUserEth) {
      toast.error("field cannot be empty");
    } else if (sendUserEth < miniContribution || sendUserEth == String(0)) {
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
    } else if (totalContribution == 0) {
      toast.error("You have already refund");
    } else if (currentTime < deadLineOfContract) {
      toast.error("You should wait");
    } else if (RaiseAmount >= Target) {
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



  const voteFunction = async () => {
    if (!account) {
      toast.error("No Wallet Connected");
    } else if (totalContribution <= 0) {
      toast.error("you must be contributor");
    } else if (checkStatus == true) {
      toast.error("You have already voted");
    } 
   
    else {
      try {
        const transaction = prepareContractCall({ 
          contract: contractFunding,
          method: "voteRequest", 
          params: [sendRequestId] 
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
      refetchRaiseAmount();
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
        <div className="flex">
          <div className="bg-white shadow-[0_4px_12px_-5px_rgba(0,0,0,0.4)] p-6 w-full max-w-sm rounded-lg font-[sans-serif] overflow-hidden mx-auto mt-4">
            <h3 className="flex justify-center text-gray-800 text-lg font-semibold">
              Vote
            </h3>

            <input
              type="text"
              value={sendRequestId}
              onChange={(e) => setSendRequestId(e.target.value)}
              placeholder="Enter id"
              className="px-20 py-4 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
            <button
              type="button"
              onClick={voteFunction}
              className="mt-4 px-6 py-3 text-sm w-full bg-[#007bff] hover:bg-[#006bff] text-white rounded transition-all"
            >
              submit
            </button>
          </div>
        </div>
      </div>

      {/* Vote section */}
      <div class=" mt-10 font-sans max-w-screen-2xl mx-auto overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100 whitespace-nowrap">
            <tr>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recipient
              </th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Required Amount
              </th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Completed status
              </th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                request id
              </th>
            </tr>
          </thead>

          {isLoadingRequestData ? (
            <tbody>
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200 whitespace-nowrap">
              {requests.map((request, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 text-sm text-gray-800">
                    {String(request.description)}
                  </td>
                  <td className="px-4 py-4 text-sm text-blue-800">
                    {String(request.recipient)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-800">
                    {String(request.value)}
                  </td>
                  <td
                    className={`px-4 py-4 text-sm ${
                      request.completed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {String(request.completed)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-800">
                    {String(request.requestId)}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
}
