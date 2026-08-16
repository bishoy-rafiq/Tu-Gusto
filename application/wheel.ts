import type { WheelPrize } from "@/domain/entities";
import type {
  CreateWheelPrizeInput,
  WheelRepository,
} from "@/domain/repositories";

export interface WheelUseCases {
  listActive(): Promise<WheelPrize[]>;
  listAll(): Promise<WheelPrize[]>;
  spin(prizeId: string): Promise<{ code: string; label: string } | null>;
  create(data: CreateWheelPrizeInput): Promise<WheelPrize>;
  update(id: string, data: Partial<CreateWheelPrizeInput>): Promise<WheelPrize | null>;
  remove(id: string): Promise<void>;
}

export function createWheelUseCases(deps: { wheel: WheelRepository }): WheelUseCases {
  return {
    listActive: () => deps.wheel.listActive(),
    listAll: () => deps.wheel.listAll(),

    async spin(prizeId) {
      const prize = await deps.wheel.getById(prizeId);
      if (!prize || !prize.active) return null;
      return { code: prize.code, label: prize.label };
    },

    create: (data) => deps.wheel.create(data),
    update: (id, data) => deps.wheel.update(id, data),
    remove: (id) => deps.wheel.remove(id),
  };
}
