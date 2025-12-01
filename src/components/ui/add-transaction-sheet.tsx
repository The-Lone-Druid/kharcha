import * as React from "react";
import { useForm } from "react-hook-form";
import { type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  TransactionFormData,
  OutflowType,
  ExtraField,
} from "@/types";
import { transactionFormSchema } from "@/types";
import type { Doc } from "convex/_generated/dataModel";

interface AddTransactionSheetProps {
  trigger: React.ReactNode;
  onSuccess?: () => void;
  transaction?: Doc<"transactions">; // For edit mode
}

export function AddTransactionSheet({
  trigger,
  onSuccess,
  transaction,
}: AddTransactionSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedOutflowType, setSelectedOutflowType] =
    React.useState<OutflowType | null>(null);

  const accounts = useQuery(api.accounts.listAccounts);
  const outflowTypes = useQuery(api.outflowTypes.listOutflowTypes);
  const createTransaction = useMutation(api.transactions.createTransaction);
  const updateTransaction = useMutation(api.transactions.updateTransaction);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: transaction?.amount || 0,
      date: transaction ? new Date(transaction.date) : new Date(),
      accountId: transaction?.accountId || "",
      outflowTypeId: transaction?.outflowTypeId || "",
      note: transaction?.note || "",
      metadata: transaction?.metadata || {},
    },
  });

  const watchedOutflowTypeId = form.watch("outflowTypeId");

  React.useEffect(() => {
    if (watchedOutflowTypeId && outflowTypes) {
      const type = outflowTypes.find(
        (t: OutflowType) => t._id === watchedOutflowTypeId
      );
      setSelectedOutflowType(type || null);
    }
  }, [watchedOutflowTypeId, outflowTypes]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        amount: data.amount,
        date: data.date.getTime(),
        accountId: data.accountId,
        outflowTypeId: data.outflowTypeId,
        note: data.note,
        receiptImageId: data.receiptImageId,
        metadata: data.metadata,
      };

      if (transaction) {
        await updateTransaction({
          id: transaction._id,
          ...(payload as Doc<"transactions">),
        });
        toast.success("Transaction updated successfully");
      } else {
        await createTransaction(payload as Doc<"transactions">);
        toast.success("Transaction added successfully");
      }

      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save transaction");
      console.error(error);
    }
  };

  const renderExtraField = (field: ExtraField) => {
    const { key, label, type } = field;
    const fieldName = `metadata.${key}`;

    switch (type) {
      case "text":
        return (
          <FormField
            key={key}
            control={form.control}
            name={fieldName as Path<TransactionFormData>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "number":
        return (
          <FormField
            key={key}
            control={form.control}
            name={fieldName as Path<TransactionFormData>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "date":
        return (
          <FormField
            key={key}
            control={form.control}
            name={fieldName as Path<TransactionFormData>}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{label}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.getTime())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "toggle":
        return (
          <FormField
            key={key}
            control={form.control}
            name={fieldName as Path<TransactionFormData>}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{label}</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </SheetTitle>
          <SheetDescription>
            {transaction
              ? "Update the transaction details."
              : "Add a new outflow transaction."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map(
                        (account: { _id: string; name: string }) => (
                          <SelectItem key={account._id} value={account._id}>
                            {account.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outflowTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outflow Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outflow type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {outflowTypes?.map(
                        (type: {
                          _id: string;
                          name: string;
                          emoji: string;
                        }) => (
                          <SelectItem key={type._id} value={type._id}>
                            {type.emoji} {type.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedOutflowType?.extraFields.map(renderExtraField)}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {transaction ? "Update" : "Add"} Transaction
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
