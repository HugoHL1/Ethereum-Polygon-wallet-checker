"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("ethereum");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (validateAddress(address)) {
      router.push(`/transactions/${network}/address/${address}`);
    } else {
      setError("Please enter a valid Ethereum or Polygon address.");
    }
  };

  const validateAddress = (validaddress:string) => {
    return validaddress.startsWith("0x") && validaddress.length === 42;
  };

  return (
    <main className="flex flex-col items-center justify-center">
      <div className="text-center mt-16 mb-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Crypto Explorer</h1>
        <h3 className="text-xl">
          Enter your Ethereum or Polygon address to get started
        </h3>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div className="mb-4 flex md:flex-row flex-col gap-2">
          <Input
            type="text"
            placeholder="Enter Ethereum or Polygon address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError("");
            }}
            className="w-full"
          />
          <Select
            onValueChange={(value) => setNetwork(value)}
            defaultValue="ethereum"
          >
            <SelectTrigger className="md:w-52 w-full">
              <SelectValue placeholder="ethereum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethereum">
                <div className="flex gap-2">
                  <p>Ethereum</p>
                  <Image
                    width={15}
                    height={15}
                    alt="Ethereum logo"
                    src="/images/eth.svg"
                  />
                </div>
              </SelectItem>
              <SelectItem value="polygon" className="flex gap-2">
                <div className="flex gap-2 items-center">
                  <p>Polygon</p>
                  <Image
                    width={15}
                    height={15}
                    className="w-fit h-fit"
                    alt="Polygon logo"
                    src="/images/matic.png"
                  />
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <Button
          onClick={handleSubmit}
          className="w-full"
        >
          View Transactions
        </Button>
        <p className="text-center text-[14px] py-4">or try directly with</p>
        <div className="mx-auto">
          <Link
            href="/transactions/ethereum/address/0xcb1bBF5e3ABA3f9E935feB03cA973Dfd12EbA56f"
            className="inline-flex items-center text-center w-full justify-center whitespace-nowrap rounded-md font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-neutral-800 hover:opacity-80 transition-opacity"
          >
            Hugo&apos;s wallet <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </main>
  );
}
