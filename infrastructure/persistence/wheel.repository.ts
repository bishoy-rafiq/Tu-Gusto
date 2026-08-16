import { supabase } from "./supabase";
import type { WheelPrize } from "@/domain/entities";
import type {
  CreateWheelPrizeInput,
  WheelRepository,
} from "@/domain/repositories";

function toPrize(row: any): WheelPrize {
  return {
    id: row.id,
    label: row.label,
    labelAr: row.label_ar ?? "",
    code: row.code,
    color: row.color,
    weight: row.weight,
    active: row.active,
    createdAt: row.createdAt,
  };
}

function toDbPatch(data: Partial<CreateWheelPrizeInput>) {
  const patch: Record<string, unknown> = { ...data };
  if (data.labelAr !== undefined) {
    patch.label_ar = data.labelAr;
    delete patch.labelAr;
  }
  return patch;
}

export const supabaseWheelRepository: WheelRepository = {
  async listActive() {
    const { data } = await supabase
      .from("wheel_prizes")
      .select("*")
      .eq("active", true)
      .order("createdAt", { ascending: true });
    return (data ?? []).map(toPrize);
  },

  async listAll() {
    const { data } = await supabase
      .from("wheel_prizes")
      .select("*")
      .order("createdAt", { ascending: true });
    return (data ?? []).map(toPrize);
  },

  async getById(id) {
    const { data } = await supabase
      .from("wheel_prizes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? toPrize(data) : null;
  },

  async getByCode(code) {
    const { data } = await supabase
      .from("wheel_prizes")
      .select("*")
      .eq("code", code)
      .order("createdAt", { ascending: true })
      .limit(1);
    return data && data[0] ? toPrize(data[0]) : null;
  },

  async create(data: CreateWheelPrizeInput) {
    const { data: prize, error } = await supabase
      .from("wheel_prizes")
      .insert({
        label: data.label,
        label_ar: data.labelAr ?? "",
        code: data.code,
        color: data.color,
        weight: data.weight,
        active: data.active ?? true,
      })
      .select("*")
      .single();
    if (error || !prize) throw new Error("Could not create prize");
    return toPrize(prize);
  },

  async update(id, data) {
    const { data: prize, error } = await supabase
      .from("wheel_prizes")
      .update(toDbPatch(data))
      .eq("id", id)
      .select("*")
      .single();
    if (error || !prize) return null;
    return toPrize(prize);
  },

  async remove(id) {
    await supabase.from("wheel_prizes").delete().eq("id", id);
  },
};
