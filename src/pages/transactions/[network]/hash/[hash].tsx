import axios from "axios";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

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
  network: string; // Add network to props
}

const TransactionDetails = ({
  transaction,
  network,
}: TransactionDetailProps) => {
  if (!transaction) {
    return (
      <div>Transaction details not available or transaction not found.</div>
    );
  }

  const weiToEther = (wei) => {
    return parseInt(wei, 16) / 1e18;
  };

  const currencyLabel = network === "polygon" ? "MATIC" : "Ether"; // Determine the currency label based on network

  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const date = new Date(parseInt(transaction.timeStamp || "0", 16) * 1000);
    setFormattedDate(date.toLocaleString("uk-UK"));
  }, [transaction.timeStamp]);

  return (
    <div>
      <h1>Transaction Details</h1>
      <p>
        <strong>Transaction Hash:</strong> {transaction.transactionHash}
      </p>
      <p>
        <strong>From:</strong> {transaction.from}
      </p>
      <p>
        <strong>To:</strong> {transaction.to}
      </p>
      <p>
        <strong>Value:</strong> {weiToEther(transaction.value)} {currencyLabel}
      </p>
      <p>
        <strong>Timestamp:</strong> {formattedDate}
      </p>
      <p>
        <strong>Block Number:</strong> {parseInt(transaction.blockNumber, 16)}
      </p>
      <p>
        <strong>Gas Used:</strong> {parseInt(transaction.gasUsed, 16)}
      </p>
      <p>
        <strong>Effective Gas Price:</strong>{" "}
        {parseInt(transaction.effectiveGasPrice, 16)} wei
      </p>
      <p>
        <strong>Transaction Receipt Status:</strong>{" "}
        {transaction.status === "0x1" ? "Successful" : "Failed"}
      </p>
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
  }
};
