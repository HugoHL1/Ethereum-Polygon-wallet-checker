import axios from "axios";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnFiltersState,
  SortingState,
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Transaction {
  hash: string;
  value: string;
  timeStamp: string;
  from: string;
  to: string;
}

interface TransactionsProps {
  transactions: Transaction[];
  network: string;
}

function formatAddress(address: string) {
  return `${address.substring(0, 10)}...${address.substring(
    address.length - 10
  )}`;
}

function formatEth(wei: number) {
  const eth = wei / 1e18;
  return eth.toFixed(7);
}

const Transactions = ({ transactions, network }: TransactionsProps) => {
  const router = useRouter();
  const [currentNetwork, setCurrentNetwork] = useState(network);
  const [currentAddress, setCurrentAddress] = useState<string>(
    (router.query.address as string) || ""
  );

  useEffect(() => {
    setCurrentNetwork(router.query.network as string);
    setCurrentAddress((router.query.address as string) || "");
  }, [router.query.network, router.query.address]);

  useEffect(() => {
    async function loadTransactions() {
      let apiUrl;
      let apiKey =
        currentNetwork === "ethereum"
          ? process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
          : process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY;

      apiUrl =
        currentNetwork === "ethereum"
          ? `https://api.etherscan.io/api?module=account&action=txlist&address=${currentAddress}&sort=asc&apikey=${apiKey}`
          : `https://api.polygonscan.com/api?module=account&action=txlist&address=${currentAddress}&sort=asc&apikey=${apiKey}`;

      try {
        const response = await axios.get(apiUrl);
        if (response.data.status === "1") {
          setData(response.data.result.slice(0, 100));
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setData([]);
      }
    }

    if (currentAddress && currentNetwork) {
      loadTransactions();
    }
  }, [currentNetwork, currentAddress]);

  const handleNetworkChange = (newNetwork: string) => {
    if (currentAddress) {
      router.push(`/transactions/${newNetwork}/address/${currentAddress}`);
    } else {
      console.error("Current address is undefined.");
    }
  };
  

  const columns = [
    {
      accessorKey: "hash",
      header: () => "Transaction Hash",
      cell: (info) => (
        <Link
          href={`/transactions/${currentNetwork}/hash/${info.row.original.hash}`}
        >
          {formatAddress(info.getValue())}
        </Link>
      ),
    },
    {
      accessorKey: "value",
      header: () => "Value (ETH)",
      cell: (info) => `${formatEth(info.getValue())} ETH`,
    },
    {
      accessorKey: "from",
      header: () => "From Address",
      cell: (info) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{formatAddress(info.getValue())}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{info.getValue()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "to",
      header: () => "To Address",
      cell: (info) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{formatAddress(info.getValue())}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{info.getValue()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "timeStamp",
      header: () => "Date",
      cell: (info) =>
        new Date(parseInt(info.getValue()) * 1000).toLocaleString("uk-UK", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    },
    {
      accessorKey: "action",
      header: () => "Action",
      cell: (info) => (
        <Link
          href={`/transactions/${currentNetwork}/hash/${info.row.original.hash}`}
          className="ml-2 text-blue-500 hover:text-blue-700"
        >
          View Details
        </Link>
      ),
    },
  ];

  const [data, setData] = useState(() => transactions);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  function renderTable(transactions) {
    return (
      <>
        <Input
          placeholder="Search transaction hash..."
          value={(table.getColumn("hash").getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("hash").setFilterValue(e.target.value)
          }
          className="mb-4 max-w-[400px]"
        />
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    <div onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted()
                        ? header.column.getIsSorted() === "desc"
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  }

  return (
    <Tabs defaultValue={currentNetwork} onValueChange={handleNetworkChange}>
      <TabsList>
        <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
        <TabsTrigger value="polygon">Polygon</TabsTrigger>
      </TabsList>
      <TabsContent value="ethereum">{renderTable(transactions)}</TabsContent>
      <TabsContent value="polygon">{renderTable(transactions)}</TabsContent>
    </Tabs>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { network, address } = context.params as {
    network: string;
    address: string;
  };

  let apiUrl = "";
  let apiKey = "";

  if (network === "ethereum") {
    apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
    apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`;
  } else if (network === "polygon") {
    apiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY;
    apiUrl = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`;
  } else {
    return { notFound: true };
  }

  const response = await axios.get(apiUrl);
  if (response.data.status !== "1") {
    return {
      props: {
        transactions: [],
        network,
      },
    };
  }

  return {
    props: {
      transactions: response.data.result.slice(0, 100),
      network,
    },
  };
};

export default Transactions;
