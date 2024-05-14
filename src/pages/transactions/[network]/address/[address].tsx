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
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import Profile from "@/components/Profile";

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

function formatCurrency(wei: number, network: string) {
  const divisor = 1e18; // Both ETH and MATIC use a similar scale factor
  const amount = wei / divisor;
  return network === "ethereum"
    ? `${amount.toFixed(7)} ETH`
    : `${amount.toFixed(7)} MATIC`;
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
          className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
        >
          {formatAddress(info.getValue())}
        </Link>
      ),
      enableSorting: false, // Disable sorting for this column
    },
    {
      accessorKey: "value",
      header: () => "Value",
      cell: (info) => (
        <div className="text-neutral-700">
          {formatCurrency(info.getValue(), currentNetwork)}
        </div>
      ),
      enableSorting: true,
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
      enableSorting: false, // Disable sorting for this column
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
      enableSorting: false,
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
      enableSorting: true,
    },
    {
      accessorKey: "action",
      header: () => "Action",
      cell: (info) => (
        <Link
          href={`/transactions/${currentNetwork}/hash/${info.row.original.hash}`}
          className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
        >
          View Details
        </Link>
      ),
      enableSorting: false,
    },
  ];

  const [data, setData] = useState(() => transactions);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timeStamp", desc: true },
  ]);
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
                    <div
                      className="flex gap-2 items-center cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() ? (
                        header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="w-4 h-4" />
                        ) : (
                          <ArrowUp className="w-4 h-4" />
                        )
                      ) : header.id === "value" || header.id === "timeStamp" ? (
                        <ArrowUpDown className="w-4 h-4" />
                      ) : null}
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
    <main>
      <Profile address={currentAddress} network={currentNetwork} />
      <Tabs defaultValue={currentNetwork} onValueChange={handleNetworkChange}>
        <TabsList>
          <TabsTrigger className="flex items-center gap-2" value="ethereum">
            Ethereum
            <Image
              width={15}
              height={15}
              alt="Ethereum logo"
              src="/images/eth.svg"
            />
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="polygon">
            Polygon
            <Image
              width={15}
              height={15}
              alt="Polygon logo"
              src="/images/matic.png"
            />
          </TabsTrigger>
        </TabsList>
        <TabsContent className="bg-white" value="ethereum">{renderTable(transactions)}</TabsContent>
        <TabsContent className="bg-white shadow-lg shadow-white" value="polygon">{renderTable(transactions)}</TabsContent>
      </Tabs>
    </main>
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
