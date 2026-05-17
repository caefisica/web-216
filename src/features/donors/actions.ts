"use server";

import { listDonors, listDonations, getDonationStats } from "./repository";

export async function getDonors() {
  return listDonors();
}

export async function getDonations() {
  return listDonations();
}

export async function getDonationsStats() {
  return getDonationStats();
}
