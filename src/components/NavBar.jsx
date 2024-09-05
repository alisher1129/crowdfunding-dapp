import React from "react";
import Link from "next/link";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client";
import { chain } from "@/app/chain";

function NavBar() {
  return (
    <>
      <header className="  flex shadow-md border-b-2 border-gray-400 py-4 px-4 sm:px-10 bg-white font-[sans-serif] min-h-[70px] tracking-wide relative z-50">
        <div className="flex flex-wrap items-center justify-between gap-5 w-full">
          <a href="javascript:void(0)">
            <img
              src="https://cdn.prod.website-files.com/623b471f31c24a4a20eb3ca7/6294e95995e10fe9dd8ede4c_DecubateLogo-SVG.svg"
              alt="logo"
              className="w-36"
            />
          </a>
          <div className="flex max-lg:ml-auto space-x-3">
            <Link
              className="flex justify-center items-center bg-blue-700 text-white px-7 rounded-lg"
              href={"/admin/setting"}
            >
              Setting
            </Link>
            <ConnectButton client={client} chain={chain} />
          </div>
        </div>
      </header>
    </>
  );
}

export default NavBar;
