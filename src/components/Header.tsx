import Link from "next/link";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="p-4 flex justify-between text-md">
      <div>Hugo Leroy</div>
      <div className="flex gap-4">
        <Link href="/" passHref className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-neutral-800 hover:opacity-80 transition-opacity underline underline-offset-4">
          Home
        </Link>
        <Link href="/transactions/ethereum/address/0xcb1bBF5e3ABA3f9E935feB03cA973Dfd12EbA56f" className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-neutral-800 hover:opacity-80 transition-opacity underline underline-offset-4">
          Hugo's wallet
        </Link>
      </div>
      <div>Front-end Test</div>
    </header>
  );
};

export default Header;
