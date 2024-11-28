import "server-only";

import {
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";

export interface Order {
  id: number;
  created_at: string;
  completed_at: string | null;
  total: number;
  due: number;
  place_id: number;
  items: {
    id: number;
    quantity: number;
  }[];
  status: "pending" | "paid" | "cancelled";
  description: string;
}

export const createOrder = async (
  client: SupabaseClient,
  placeId: number,
  total: number,
  items: { id: number; quantity: number }[],
  description: string
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from("orders")
    .insert({
      place_id: placeId,
      items,
      total,
      due: total,
      status: "pending",
      description,
    })
    .select()
    .single();
};

export const updateOrder = async (
  client: SupabaseClient,
  orderId: number,
  total: number,
  items: { id: number; quantity: number }[]
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from("orders")
    .update({ total, items })
    .eq("id", orderId)
    .single();
};

export const getOrder = async (
  client: SupabaseClient,
  orderId: number
): Promise<PostgrestSingleResponse<Order>> => {
  return client.from("orders").select().eq("id", orderId).single();
};

export const completeOrder = async (
  client: SupabaseClient,
  orderId: number
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from("orders")
    .update({ status: "paid", due: 0, completed_at: new Date().toISOString() })
    .eq("id", orderId)
    .single();
};

export const attachTxHashToOrder = async (
  client: SupabaseClient,
  orderId: number,
  txHash: string
): Promise<PostgrestSingleResponse<Order>> => {
  return client
    .from("orders")
    .update({ tx_hash: txHash })
    .eq("id", orderId)
    .single();
};

export const getOrderStatus = async (
  client: SupabaseClient,
  orderId: number
): Promise<PostgrestSingleResponse<Order["status"]>> => {
  return client.from("orders").select("status").eq("id", orderId).single();
};

export const getOrdersByPlace = async (
  client: SupabaseClient,
  placeId: number,
  limit: number = 10,
  offset: number = 0
): Promise<PostgrestResponse<Order>> => {
  console.log("getOrdersByPlace", placeId, limit, offset);
  return client
    .from("orders")
    .select()
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  // .range(offset, offset + limit); // TODO: Uncomment this when we have pagination
};
