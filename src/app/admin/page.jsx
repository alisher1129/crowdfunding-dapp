"use client";

import React, { useEffect, useState } from "react";
import { prepareContractCall } from "thirdweb";
import {
  useSendTransaction,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { contractFunding } from "../../utils/contract";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminPage() {
  const [addDescription, setDescription] = useState("");
  const [addRecipient, setRecipient] = useState("");
  const [addValue, setValue] = useState(0);
  const [addRequestNumber, setRequestNumber] = useState("");
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS;

  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();

  const { data: Target, refetch: refetchTarget } = useReadContract({
    contract: contractFunding,
    method: "target",
    params: [],
  });
  const { data: checkRequestData, refetch: refetchRequestDetails } =
    useReadContract({
      contract: contractFunding,
      method: "getRequestDetails",
      params: [addRequestNumber],
    });
  const { data: RaiseAmount, refetch: refetchRaiseAmount } = useReadContract({
    contract: contractFunding,
    method: "raiseAmount",
    params: [],
  });

  const isValidAddress = (address) => {
    const regex = /^0x[0-9a-fA-F]{40}$/;
    return regex.test(address);
  };

  const createNewRequest = async () => {
    if (!account) {
      toast.error("No Wallet Connected");
    } else if (!addDescription || !addRecipient || !addValue) {
      toast.error("field cannot be empty");
    } else if (!isValidAddress(addRecipient)) {
      toast.error("Invalid recipient address");
    } else if (account.address !== adminAddress) {
      toast.error("Only admin can perform this action");
    } else {
      try {
        const transaction = await prepareContractCall({
          contract: contractFunding,
          method: "createRequest",
          params: [addDescription, addRecipient, addValue],
        });
        sendTransaction(transaction);
      } catch (error) {
        toast.error("something went wrong");
        console.error("Error", error);
      }
    }
  };

  const makePaymentFunction = async () => {
    if (!account) {
      toast.error("No Wallet Connected");
    } else if (!addRequestNumber) {
      toast.error("Request number cannot be empty");
    } else if (account.address != adminAddress) {
      toast.error("Only admin can perform this action");
    } else if (
      checkRequestData[0] == "" &&
      checkRequestData[1] == "0x0000000000000000000000000000000000000000" &&
      checkRequestData[2] == "0" &&
      checkRequestData[3] == false &&
      checkRequestData[4] == 0
    ) {
      toast.error("Recipient does not exists");
    } else if (checkRequestData[3] == true) {
      toast.error("The request has been completed");
    } else if (RaiseAmount < Target || RaiseAmount != Target) {
      toast.error("The raised amount is less than target");
    } else {
      try {
        const transaction = prepareContractCall({
          contract: contractFunding,
          method: "makePayment",
          params: [addRequestNumber],
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
      refetchTarget();
      refetchRequestDetails();
      refetchRaiseAmount();
    }
  }, [account, addRequestNumber]);

  return (
    <>
      <div className="flex flex-col justify-center  mt-4">
        {/* CREATE REQUEST  */}
        <div>
          <div className="flex justify-center mb-6 font-extrabold font-serif text-5xl">
            Create Request
          </div>
          <form className="font-[sans-serif] max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Enter Description"
              value={addDescription}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 px-20 py-4 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
            <input
              type="text"
              placeholder="Enter Recipient"
              value={addRecipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-2 px-20 py-4 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
            <input
              type="text"
              placeholder="Enter Value"
              value={addValue}
              onChange={(e) => setValue(e.target.value)}
              className="mt-2 px-20 py-4 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
            <button
              type="button"
              onClick={createNewRequest}
              className="mt-4 px-6 py-3 text-sm w-full bg-[#007bff] hover:bg-[#006bff] text-white rounded transition-all"
            >
              Submit
            </button>
          </form>
        </div>

        {/* MAKE PAYMENT */}
        <div className="mt-4">
          <div className="flex justify-center mb-6 font-extrabold font-serif text-5xl">
            Make Payment
          </div>
          <form className="font-[sans-serif] max-w-4xl mx-auto">
            <div className="flex items-center">
              <input
                type="text"
                value={addRequestNumber}
                onChange={(e) => setRequestNumber(e.target.value)}
                placeholder="Enter Request id"
                className="px-20 py-4 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
              />
            </div>

            <button
              type="button"
              onClick={makePaymentFunction}
              className="mt-4 px-6 py-3 text-sm w-full bg-[#007bff] hover:bg-[#006bff] text-white rounded transition-all"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminPage;
