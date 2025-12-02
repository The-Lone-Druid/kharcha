import * as React from "react";
import { useForm } from "react-hook-form";
import { type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TransactionFormData, OutflowType, ExtraField } from "@/types";
import { transactionFormSchema } from "@/types";
import type { Doc } from "@convex/_generated/dataModel";
import { AddAccountDialog } from "@/components/ui/add-account-dialog";
import { AddOutflowTypeDialog } from "@/components/ui/add-outflow-type-dialog";
import { CurrencyInput } from "@/components/ui/currency-input";

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
  const [showAddAccountDialog, setShowAddAccountDialog] = React.useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] =
    React.useState(false);
  const [selectedOutflowType, setSelectedOutflowType] =
    React.useState<OutflowType | null>(null);

  const accounts = useQuery(api.accounts.listAccounts);
  const outflowTypes = useQuery(api.outflowTypes.listOutflowTypes);
  const currentUser = useQuery(api.users.getCurrentUser);
  const createTransaction = useMutation(api.transactions.addTransaction);
  const updateTransaction = useMutation(api.transactions.updateTransaction);

  const preferredCurrency = currentUser?.preferences?.currency || "INR";

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

  const handleAccountCreated = (accountId?: string) => {
    if (accountId) {
      form.setValue("accountId", accountId);
    }
    setShowAddAccountDialog(false);
  };

  const handleCategoryCreated = (categoryId?: string) => {
    if (categoryId) {
      form.setValue("outflowTypeId", categoryId);
    }
    setShowAddCategoryDialog(false);
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

  const onSubmit = async (data: TransactionFormData) => {
    try {
      // Transform form data to match mutation expectations
      const transformedData = {
        amount: data.amount,
        date: data.date.getTime(), // Convert Date to timestamp
        accountId: data.accountId as any, // Cast to Convex ID type
        outflowTypeId: data.outflowTypeId as any, // Cast to Convex ID type
        note: data.note,
        receiptImageId: data.receiptImageId as any, // Cast to Convex storage ID type
        metadata: data.metadata,
      };

      if (transaction) {
        // Update existing transaction
        await updateTransaction({
          id: transaction._id,
          ...transformedData,
        });
        toast.success("Transaction updated successfully!");
      } else {
        // Create new transaction
        await createTransaction(transformedData);
        toast.success("Transaction added successfully!");
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction. Please try again.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto pb-6">
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
            className="space-y-4 p-4"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({preferredCurrency})</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onChange={field.onChange}
                          preferredCurrency={preferredCurrency}
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
                                "w-full pl-3 text-left font-normal h-10",
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
            </div>

            {/* Account & Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account & Category</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value === "__add_new_account__") {
                            setShowAddAccountDialog(true);
                            // Reset the select value to prevent it from being selected
                            setTimeout(() => {
                              field.onChange("");
                            }, 0);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select an account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map(
                            (account: {
                              _id: string;
                              name: string;
                              type: string;
                            }) => (
                              <SelectItem key={account._id} value={account._id}>
                                {account.name} ({account.type})
                              </SelectItem>
                            )
                          )}
                          <SelectItem
                            value="__add_new_account__"
                            className="text-primary font-medium"
                          >
                            ➕ Add New Account
                          </SelectItem>
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
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value === "__add_new_category__") {
                            setShowAddCategoryDialog(true);
                            // Reset the select value to prevent it from being selected
                            setTimeout(() => {
                              field.onChange("");
                            }, 0);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select category" />
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
                          <SelectItem
                            value="__add_new_category__"
                            className="text-primary font-medium"
                          >
                            ➕ Add New Category
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Extra Fields */}
            {selectedOutflowType?.extraFields &&
              selectedOutflowType.extraFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Details</h3>
                  <div className="space-y-4">
                    {selectedOutflowType.extraFields.map(renderExtraField)}
                  </div>
                </div>
              )}

            {/* Note */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notes</h3>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add any additional notes..."
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : transaction
                    ? "Update"
                    : "Add"}{" "}
                Transaction
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>

      {/* Add Account Dialog */}
      <AddAccountDialog
        open={showAddAccountDialog}
        onOpenChange={setShowAddAccountDialog}
        onSuccess={handleAccountCreated}
      />

      {/* Add Category Dialog */}
      <AddOutflowTypeDialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
        onSuccess={handleCategoryCreated}
      />
    </Sheet>
  );
}
