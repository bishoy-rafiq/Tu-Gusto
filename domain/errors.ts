export class OrderError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "OrderError";
    this.status = status;
  }
}
