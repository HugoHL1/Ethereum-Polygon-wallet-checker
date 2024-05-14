import axios from "axios";
import Image from "next/image";
import { useState, useEffect } from "react";
import { RaisedButton } from "./ui/button";
import { ExternalLink } from "lucide-react";

interface ProfileProps {
  address: string;
  network: string;
}

const Profile: React.FC<ProfileProps> = ({ address, network }) => {
  const [balanceEth, setBalanceEth] = useState("0 ETH");
  const [balanceMatic, setBalanceMatic] = useState("0 MATIC");

  useEffect(() => {
    const loadBalances = async () => {
      if (address) {
        try {
          if (network === "ethereum") {
            const responseEth = await axios.get(
              `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`
            );
            if (responseEth.data.status === "1") {
              setBalanceEth(
                (parseFloat(responseEth.data.result) / 1e18).toFixed(7) + " ETH"
              );
            }
          } else if (network === "polygon") {
            const responseMatic = await axios.get(
              `https://api.polygonscan.com/api?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY}`
            );
            if (responseMatic.data.status === "1") {
              setBalanceMatic(
                (parseFloat(responseMatic.data.result) / 1e18).toFixed(7) +
                  " MATIC"
              );
            }
          }
        } catch (error) {
          console.error("Failed to fetch balances:", error);
          setBalanceEth("0 ETH");
          setBalanceMatic("0 MATIC");
        }
      }
    };

    loadBalances();
  }, [address, network]); // Ajout de network dans les dépendances de useEffect

  const explorerUrl =
    network === "ethereum"
      ? `https://etherscan.io/address/${address}`
      : `https://polygonscan.com/address/${address}`;

  return (
    <div className="flex justify-between gap-8 py-6 px-8 mb-8 bg-gradient-to-r from-blue-200 to-purple-300 border rounded-xl shadow-sm font-mono">
      <div className="flex flex-col truncate">
        <p className="text-xs opacity-85">Your account</p>
        <h2 className="text-4xl text-neutral-800 truncate">{address}</h2>
        {network === "ethereum" && (
          <div className="flex items-center gap-2 font-mono text-xl mt-4">
            <Image
              width={25}
              height={25}
              alt="Ethereum logo"
              src="/images/eth.svg"
            />
            {balanceEth}
          </div>
        )}
        {network === "polygon" && (
          <div className="flex items-center gap-2 font-mono text-xl mt-4">
            <Image
              width={25}
              height={25}
              alt="Polygon logo"
              src="/images/matic.png"
            />
            {balanceMatic}
          </div>
        )}
      </div>
      <div className="my-auto whitespace-nowrap">
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
          <RaisedButton>
            {network === "polygon" && <div>View on Polygonscan</div>}
            {network === "ethereum" && <div>View on Etherscan</div>}
            <ExternalLink className="w-4 h-4 ml-2" />
          </RaisedButton>
        </a>
      </div>
    </div>
  );
};

export default Profile;
