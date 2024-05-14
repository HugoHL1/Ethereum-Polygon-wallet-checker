import axios from "axios";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { useRouter } from "next/router";

interface TransactionDetailProps {
  transaction: {
    transactionHash: string;
    from: string;
    to: string;
    blockNumber: string;
    gasUsed: string;
    effectiveGasPrice: string;
    status: string;
    value: string;
    timeStamp?: string;
  };
  network: string;
}

const TransactionDetails = ({
  transaction,
  network,
}: TransactionDetailProps) => {
  const router = useRouter();
  if (!transaction) {
    return (
      <div>Transaction details not available or transaction not found.</div>
    );
  }

  const weiToEther = (wei: string) => {
    return parseInt(wei, 16) / 1e18;
  };

  const currencyLabel = network === "polygon" ? "MATIC" : "Ether";

  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const date = new Date(parseInt(transaction.timeStamp || "0", 16) * 1000);
    setFormattedDate(date.toLocaleString("uk-UK"));
  }, [transaction.timeStamp]);

  const statusSuccessful = transaction.status === "0x1";

  const explorerBaseUrl =
    network === "polygon" ? "https://polygonscan.com" : "https://etherscan.io";
  const explorerUrl = `${explorerBaseUrl}/tx/${transaction.transactionHash}`;

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>This is your transaction details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="items-center">
            <strong>Status:</strong>
            <span
              className={statusSuccessful ? "text-green-500" : "text-red-500"}
            >
              {statusSuccessful ? (
                <>
                  <CheckCircle className="inline-block w-4 h-4 mx-1" />{" "}
                  Successful
                </>
              ) : (
                <>
                  <XCircle className="inline-block w-4 h-4 mx-1" /> Failed
                </>
              )}
            </span>
          </p>
          <p className="truncate overflow-hidden text-ellipsis">
            <strong>Transaction Hash:</strong>{" "}
            <Link
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              passHref
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              {transaction.transactionHash}
            </Link>
          </p>
          <div className="border-t pb-2 pt-1 mt-2 truncate overflow-hidden text-ellipsis">
            <strong>From:</strong> {transaction.from}
          </div>
          <div className="border-b pb-1 mb-2 truncate overflow-hidden text-ellipsis">
            <strong>To:</strong> {transaction.to}
          </div>
          <p>
            <strong>Value:</strong> {weiToEther(transaction.value)}{" "}
            {currencyLabel}
          </p>
          <p>
            <strong>Date:</strong> {formattedDate}
          </p>
          <p>
            <strong>Block Number:</strong>{" "}
            {parseInt(transaction.blockNumber, 16)}
          </p>
          <p>
            <strong>Gas Used:</strong> {parseInt(transaction.gasUsed, 16)}
          </p>
          <p>
            <strong>Effective Gas Price:</strong>{" "}
            {parseInt(transaction.effectiveGasPrice, 16)} wei
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Go back to account
          </Button>
          <Link
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            passHref
          >
            <Button variant="outline">
              See on block explorer <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TransactionDetails;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { network, hash } = context.params as { network: string; hash: string };
  let apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  let baseUrl = "https://api.etherscan.io";

  if (network === "polygon") {
    apiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY;
    baseUrl = "https://api.polygonscan.com";
  }

  try {
    const txReceiptUrl = `${baseUrl}/api?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}&apikey=${apiKey}`;
    const txReceiptResponse = await axios.get(txReceiptUrl);
    const transactionReceipt = txReceiptResponse.data.result;

    if (!transactionReceipt) {
      return { props: { transaction: null, network } };
    }

    const txDetailsUrl = `${baseUrl}/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${apiKey}`;
    const txDetailsResponse = await axios.get(txDetailsUrl);
    const transactionDetails = txDetailsResponse.data.result || {};

    const blockDetailsUrl = `${baseUrl}/api?module=proxy&action=eth_getBlockByNumber&tag=${transactionReceipt.blockNumber}&boolean=true&apikey=${apiKey}`;
    const blockDetailsResponse = await axios.get(blockDetailsUrl);
    const blockDetails = blockDetailsResponse.data.result || {};

    const transaction = {
      ...transactionReceipt,
      value: transactionDetails.value || null,
      timeStamp: blockDetails.timestamp || null,
    };

    return {
      props: {
        transaction,
        network,
      },
    };
  } catch (error) {
    console.error("API call failed:", error);
    return {
      props: {
        transaction: null,
        network,
      },
    };
  }
};
