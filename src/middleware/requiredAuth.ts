import { Context } from "@/types/context.ts";

type ServiceFn<TArgs, TReturn> = (args: TArgs, context: Context) => TReturn;

export function withAuth<TArgs, TReturn>(fn: ServiceFn<TArgs, TReturn>) {
  return (args?: TArgs, context?: Context) => {
    if (!context?.user?.userId) {
      throw new Error('No Autorizado');
    }
    return fn(args as TArgs, context as Context);
  };
}