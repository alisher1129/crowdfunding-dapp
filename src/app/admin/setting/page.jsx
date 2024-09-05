"use client";

import React, { useState } from "react";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { contractFunding } from "../../../utils/contract";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Setting() {
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const { mutate: sendTransaction } = useSendTransaction();
  const account = useActiveAccount();
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS;

  const setTargetAndDeadline = async () => {
    if (!account) {
      toast.error("No Wallet Connected");
    } else if (!target || !deadline) {
      toast.error("field cannot be empty");
    } else if (account.address !== adminAddress) {
      toast.error("Only admin can perform this action");
    } else {
      try {
        const transaction = prepareContractCall({
          contract:contractFunding,
          method: "setTargetAndDeadline",
          params: [target, deadline],
        });
        sendTransaction(transaction);
      } catch (error) {
        console.error("Error", error);
      }
    }
  };

  return (
    <>
      <div className="mt-4">
        <div className="flex justify-center mb-6 font-extrabold font-serif text-5xl">
          Make Payment
        </div>
        <form className="font-[sans-serif] max-w-4xl mx-auto">
          <div className="flex items-center">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter target"
              className="px-20 py-4 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>
          <div className="flex items-center">
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Enter deadline"
              className="px-20 py-4 bg-[#f0f1f2] focus:bg-transparent text-black w-full text-sm border outline-[#007bff] rounded transition-all"
            />
          </div>

          <button
            type="button"
            onClick={setTargetAndDeadline}
            className="mt-4 px-6 py-3 text-sm w-full bg-[#007bff] hover:bg-[#006bff] text-white rounded transition-all"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default Setting;
