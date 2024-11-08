"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import CurrencyLogo from "@/components/currency-logo";
import { Item } from "@/db/items";
import { Order } from "@/db/orders";
import { formatCurrencyNumber } from "@/lib/currency";
import { confirmPurchase } from "@/app/actions/confirmPurchase";

interface Props {
  accountOrUsername: string;
  order?: Order;
  items?: { [key: number]: Item };
  currencyLogo?: string;
}

export default function Component({
  accountOrUsername,
  order,
  items,
  currencyLogo,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [cartItems, setCartItems] = useState<Order["items"]>(
    order?.items ?? []
  );

  const updateQuantity = (id: number, change: number) => {
    setCartItems(
      cartItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totalExcludingVat = !items
    ? 0
    : cartItems.reduce((sum, cartItem) => {
        const item = items[cartItem.id];
        if (!item) return sum;
        return sum + item.price * cartItem.quantity;
      }, 0);

  const vat = !items
    ? 0
    : cartItems.reduce((sum, cartItem) => {
        const item = items[cartItem.id];
        if (!item) return sum;

        const itemTotal = item.price * (item.vat / 100) * cartItem.quantity;
        return sum + itemTotal;
      }, 0);

  const total = totalExcludingVat + vat;

  const handleConfirm = async () => {
    if (!order) return;

    setLoading(true);

    const session = await confirmPurchase(
      accountOrUsername,
      order.id,
      total,
      cartItems
    );

    setLoading(false);

    if (session?.url) {
      router.push(session.url);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-lg">
        <CardHeader className="flex flex-row items-center justify-start gap-4">
          <ArrowLeft onClick={handleBack} className="cursor-pointer mt-1.5" />
          <CardTitle className="text-2xl font-bold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((cartItem) => {
              const item = items?.[cartItem.id];
              if (!item) return null;
              return (
                <li
                  key={item.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-gray-500 flex items-center gap-1">
                      <CurrencyLogo logo={currencyLogo} size={16} />
                      {formatCurrencyNumber(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 rounded-full"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2 w-8 text-center">
                      {cartItem.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.id, -cartItem.quantity)
                      }
                      className="ml-2 h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-normal">Total (excluding VAT):</span>
            <span className="text-lg font-normal flex items-center gap-1">
              <CurrencyLogo logo={currencyLogo} size={16} />
              {formatCurrencyNumber(totalExcludingVat)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-normal">VAT:</span>
            <span className="text-lg font-normal flex items-center gap-1">
              <CurrencyLogo logo={currencyLogo} size={16} />
              {formatCurrencyNumber(vat)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-lg font-semibold flex items-center gap-1">
              <CurrencyLogo logo={currencyLogo} size={16} />
              {formatCurrencyNumber(total)}
            </span>
          </div>
          <Button
            disabled={cartItems.length === 0 || loading}
            onClick={handleConfirm}
            className="w-full"
          >
            Confirm Purchase{" "}
            {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
