import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Doc } from "../../../convex/_generated/dataModel";

const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["Cash", "Bank", "Credit Card", "UPI", "Loan", "Wallet", "Other"]),
  colorHex: z.string(),
  initialBalance: z.number(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

const accountTypes = [
  "Cash",
  "Bank",
  "Credit Card",
  "UPI",
  "Loan",
  "Wallet",
  "Other",
];

const colors = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];

interface AddAccountDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  account?: Doc<"accounts"> | null;
  onSuccess?: (accountId?: string) => void;
}

export function AddAccountDialog({
  trigger,
  open,
  onOpenChange,
  account,
  onSuccess,
}: AddAccountDialogProps) {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const createAccount = useMutation(api.accounts.createAccount);
  const updateAccount = useMutation(api.accounts.updateAccount);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: account?.name || "",
      type: (account?.type as AccountFormData["type"]) || "Bank",
      colorHex: account?.colorHex || colors[0],
      initialBalance: account?.initialBalance || 0,
    },
  });

  React.useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        type: account.type as AccountFormData["type"],
        colorHex: account.colorHex,
        initialBalance: account.initialBalance,
      });
    } else {
      form.reset({
        name: "",
        type: "Bank",
        colorHex: colors[0],
        initialBalance: 0,
      });
    }
  }, [account, form]);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const onSubmit = async (data: AccountFormData) => {
    try {
      let accountId: string | undefined;
      
      if (account) {
        await updateAccount({
          id: account._id,
          ...data,
        });
        toast.success("Account updated successfully");
        accountId = account._id;
      } else {
        const newAccount = await createAccount(data);
        toast.success("Account created successfully");
        accountId = newAccount;
      }
      
      handleOpenChange(false);
      form.reset();
      onSuccess?.(accountId);
    } catch (error) {
      toast.error("Failed to save account");
      console.error(error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-lg sm:text-xl">
            {account ? "Edit Account" : "Add New Account"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {account
              ? "Update your account details."
              : "Create a new account to track your finances."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Account Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., HDFC Savings"
                      {...field}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Account Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Initial Balance (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="colorHex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Color</FormLabel>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 py-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 transition-all ${
                          field.value === color
                            ? "border-foreground scale-110"
                            : "border-muted hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="w-full sm:w-auto h-11"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto h-11">
                {account ? "Update" : "Create"} Account
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}