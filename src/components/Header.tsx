import Link from "next/link";
import React from "react";
import { Github } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="p-4 flex justify-between items-center text-md">
      <div>Hugo Leroy</div>
      <div className="flex gap-4">
        <Link
          href="/"
          passHref
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-neutral-800 hover:opacity-80 transition-opacity underline underline-offset-4"
        >
          Home
        </Link>
        <Link
          href="/transactions/ethereum/address/0xcb1bBF5e3ABA3f9E935feB03cA973Dfd12EbA56f"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-neutral-800 hover:opacity-80 transition-opacity underline underline-offset-4"
        >
          Hugo's wallet
        </Link>
      </div>
      <Link
        href="https://github.com/HugoHL1/front-end-test"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub <Github className="w-4 h-4 ml-2" />
      </Link>
    </header>
  );
};

export default Header;
