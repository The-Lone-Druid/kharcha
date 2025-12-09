import { api } from "@convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Check, ChevronsUpDown, Edit, Plus } from "lucide-react";
import * as React from "react";
import { useForm, type Path } from "react-hook-form";

import { AddAccountDialog } from "@/components/custom/add-account-sheet";
import { AddOutflowTypeDialog } from "@/components/custom/add-outflow-type-sheet";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MoneyInput from "@/components/ui/money-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ExtraField, OutflowType, TransactionFormData } from "@/types";
import { transactionFormSchema } from "@/types";
import type { Doc } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import DatePickerWithNaturalLanguage from "../ui/natural-language-datepicker";
import { CurrencyInput } from "./currency-input";

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
  const [editingAccount, setEditingAccount] =
    React.useState<Doc<"accounts"> | null>(null);
  const [editingCategory, setEditingCategory] =
    React.useState<Doc<"outflowTypes"> | null>(null);
  const [selectedOutflowType, setSelectedOutflowType] =
    React.useState<OutflowType | null>(null);
  const [accountPopoverOpen, setAccountPopoverOpen] = React.useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = React.useState(false);

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
  const watchedAccountId = form.watch("accountId");
  const watchedAmount = form.watch("amount");

  React.useEffect(() => {
    if (watchedOutflowTypeId && outflowTypes) {
      const type = outflowTypes.find(
        (t: OutflowType) => t._id === watchedOutflowTypeId
      );
      setSelectedOutflowType(type || null);
    }
  }, [watchedOutflowTypeId, outflowTypes]);

  // Check budget vs transaction amount
  React.useEffect(() => {
    if (watchedAccountId && watchedAmount > 0 && accounts) {
      const selectedAccount = accounts.find(
        (account) => account._id === watchedAccountId
      );

      if (selectedAccount?.budget && watchedAmount > selectedAccount.budget) {
        toast.warning(
          `Transaction amount (₹${watchedAmount.toLocaleString()}) exceeds account budget (₹${selectedAccount.budget.toLocaleString()})`,
          {
            duration: 5000,
          }
        );
      }
    }
  }, [watchedAccountId, watchedAmount, accounts]);

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
          <MoneyInput
            key={key}
            form={form}
            name={fieldName}
            label={label}
            placeholder={`Enter ${label.toLowerCase()}`}
            currency={preferredCurrency}
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
                <FormControl>
                  <DatePickerWithNaturalLanguage
                    initialValue={typeof field.value === 'number' ? new Date(field.value) : field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
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
      // Helper function to convert Dates to timestamps in metadata
      const convertDatesToTimestamps = (obj: any): any => {
        if (obj instanceof Date) {
          return obj.getTime();
        }
        if (Array.isArray(obj)) {
          return obj.map(convertDatesToTimestamps);
        }
        if (obj !== null && typeof obj === "object") {
          const result: any = {};
          for (const [key, value] of Object.entries(obj)) {
            result[key] = convertDatesToTimestamps(value);
          }
          return result;
        }
        return obj;
      };

      // Transform form data to match mutation expectations
      const transformedData = {
        amount: data.amount,
        date: data.date.getTime(), // Convert Date to timestamp
        accountId: data.accountId as any, // Cast to Convex ID type
        outflowTypeId: data.outflowTypeId as any, // Cast to Convex ID type
        note: data.note,
        receiptImageId: data.receiptImageId as any, // Cast to Convex storage ID type
        metadata: convertDatesToTimestamps(data.metadata),
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
      <SheetContent className="w-full overflow-y-auto pb-6 sm:max-w-[600px]">
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
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
                      <FormControl>
                        <DatePickerWithNaturalLanguage
                          initialValue={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
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
                      <div className="flex gap-2">
                        <Popover
                          open={accountPopoverOpen}
                          onOpenChange={setAccountPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="h-10 flex-1 justify-between"
                              >
                                {field.value
                                  ? accounts?.find(
                                      (account) => account._id === field.value
                                    )?.name +
                                    " (" +
                                    accounts?.find(
                                      (account) => account._id === field.value
                                    )?.type +
                                    ")"
                                  : "Select an account"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search accounts..." />
                              <CommandList>
                                <CommandEmpty>No account found.</CommandEmpty>
                                <CommandGroup>
                                  {accounts?.map((account) => (
                                    <CommandItem
                                      key={account._id}
                                      value={account.name + " " + account.type}
                                      onSelect={() => {
                                        field.onChange(account._id);
                                        setAccountPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === account._id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {account.name} ({account.type})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 px-3"
                          onClick={() => setShowAddAccountDialog(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {field.value && (
                          <AddAccountDialog
                            account={accounts?.find(
                              (a) => a._id === field.value
                            )}
                            onSuccess={() => {
                              // Account updated, form will re-render with new data
                            }}
                            trigger={
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 px-3"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                        )}
                      </div>
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
                      <div className="flex gap-2">
                        <Popover
                          open={categoryPopoverOpen}
                          onOpenChange={setCategoryPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="h-10 flex-1 justify-between"
                              >
                                {field.value
                                  ? outflowTypes?.find(
                                      (type) => type._id === field.value
                                    )?.emoji +
                                    " " +
                                    outflowTypes?.find(
                                      (type) => type._id === field.value
                                    )?.name
                                  : "Select category"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search categories..." />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {outflowTypes?.map((type) => (
                                    <CommandItem
                                      key={type._id}
                                      value={type.name}
                                      onSelect={() => {
                                        field.onChange(type._id);
                                        setCategoryPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === type._id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {type.emoji} {type.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 px-3"
                          onClick={() => setShowAddCategoryDialog(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {field.value &&
                          outflowTypes?.find((t) => t._id === field.value)
                            ?.isCustom && (
                            <AddOutflowTypeDialog
                              outflowType={outflowTypes?.find(
                                (t) => t._id === field.value
                              )}
                              onSuccess={() => {
                                // Category updated, form will re-render with new data
                              }}
                              trigger={
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-10 px-3"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                      </div>
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
            <div className="flex flex-col-reverse space-y-2 space-y-reverse border-t pt-4 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
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
        open={showAddAccountDialog || !!editingAccount}
        onOpenChange={(open) => {
          setShowAddAccountDialog(open);
          if (!open) setEditingAccount(null);
        }}
        account={editingAccount}
        onSuccess={(accountId) => {
          handleAccountCreated(accountId);
          setEditingAccount(null);
        }}
      />

      {/* Add Category Dialog */}
      <AddOutflowTypeDialog
        open={showAddCategoryDialog || !!editingCategory}
        onOpenChange={(open) => {
          setShowAddCategoryDialog(open);
          if (!open) setEditingCategory(null);
        }}
        outflowType={editingCategory}
        onSuccess={(categoryId) => {
          handleCategoryCreated(categoryId);
          setEditingCategory(null);
        }}
      />
    </Sheet>
  );
}
