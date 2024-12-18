"use server";

import { getServiceRoleClient } from "@/db";
import { AProfile } from "@/db/profiles";
import { getProfileMapFromTransactionHashes } from "@/db/transactions";

export const loadProfileMapFromHashesAction = async (
  hashes: string[]
): Promise<{ [key: string]: AProfile }> => {
  const client = getServiceRoleClient();

  try {
    return getProfileMapFromTransactionHashes(client, hashes);
  } catch (e) {
    console.error(e);
    return {};
  }
};
