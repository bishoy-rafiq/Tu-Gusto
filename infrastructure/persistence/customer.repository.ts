import { supabase } from "./supabase";
import type { Customer } from "@/domain/customer-entities";
import type { CustomerRepository } from "@/domain/customer-repositories";

export const supabaseCustomerRepository: CustomerRepository = {
  async getByEmail(email) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    return (data ?? null) as Customer | null;
  },

  async getById(id) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data ?? null) as Customer | null;
  },

  async create(data) {
    const { data: row } = await supabase
      .from("customers")
      .insert({ email: data.email.toLowerCase().trim(), name: data.name || "", phone: data.phone || "", address: data.address || "", city: data.city || "", notifyProducts: true, notifyOffers: true })
      .select("*")
      .single();
    return row as Customer;
  },

  async update(id, patch) {
    const update: Record<string, any> = {};
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.phone !== undefined) update.phone = patch.phone;
    if (patch.address !== undefined) update.address = patch.address;
    if (patch.city !== undefined) update.city = patch.city;
    if (patch.notifyProducts !== undefined) update.notifyProducts = patch.notifyProducts;
    if (patch.notifyOffers !== undefined) update.notifyOffers = patch.notifyOffers;
    if (Object.keys(update).length === 0) return null;
    const { data } = await supabase.from("customers").update(update).eq("id", id).select("*").single();
    return (data ?? null) as Customer | null;
  },

  async listAll() {
    const { data } = await supabase.from("customers").select("*");
    return (data ?? []) as Customer[];
  },
};
