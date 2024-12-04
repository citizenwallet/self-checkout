"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/db/orders";
import { differenceInMinutes, format } from "date-fns";
import { AProfile } from "@/db/profiles";
import Image from "next/image";
import { CheckCheck, Loader2 } from "lucide-react";
import { Item } from "@/db/items";
import CurrencyLogo from "@/components/currency-logo";
import { formatCurrencyNumber } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { ZeroAddress } from "ethers";

const getOrderStatus = (order: Order) => {
  if (order.status === "paid") return "paid";
  if (order.status === "cancelled") return "cancelled";
  if (differenceInMinutes(new Date(), new Date(order.created_at)) > 15)
    return "cancelled";
  return "pending";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-500 hover:bg-green-600";
    case "cancelled":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "bg-yellow-500 hover:bg-yellow-600";
  }
};

interface OrderCardProps {
  order: Order;
  orderProfile: AProfile | null;
  items: { [key: number]: Item };
  currencyLogo?: string;
}

export function OrderCard({
  order,
  orderProfile,
  items,
  currencyLogo,
}: OrderCardProps) {
  const status = getOrderStatus(order);
  const isMinted = orderProfile?.account === ZeroAddress;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
        <div
          className={cn(
            getStatusColor(status),
            "gap-2 p-2 rounded-full text-white"
          )}
        >
          {status === "pending" ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 bg-gray-200 p-2 rounded-lg">
            {orderProfile ? (
              <div className="flex items-center gap-2">
                {isMinted && (
                  <>
                    <Image src="/card.png" alt="Card" width={20} height={20} />
                    <p className="text-sm">web payment</p>
                  </>
                )}
                {!isMinted && (
                  <>
                    <Image src="/app.png" alt="App" width={20} height={20} />
                    <Image
                      src={orderProfile.image_small}
                      alt={orderProfile.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <p className="text-sm">
                      {orderProfile.name || orderProfile.username}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Image src="/card.png" alt="Card" width={20} height={20} />
                <p className="text-sm">web payment</p>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
          </span>
        </div>
        <div className="space-y-1">
          <p className="flex items-center gap-1">
            Total: <CurrencyLogo logo={currencyLogo} size={18} />
            {formatCurrencyNumber(order.total)}
          </p>
          {order.description && (
            <p className="text-sm text-gray-500">{order.description}</p>
          )}
          {order.items.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Items:</p>
              {order.items.map((orderItem) => {
                const item = items[orderItem.id];
                if (!item) return null;
                return (
                  <div
                    key={orderItem.id}
                    className="flex justify-between text-sm pl-2"
                  >
                    <span>
                      {item?.name} × {orderItem.quantity}
                    </span>
                    <span className="flex items-center gap-1">
                      <CurrencyLogo logo={currencyLogo} size={14} />
                      {formatCurrencyNumber(item?.price * orderItem.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
