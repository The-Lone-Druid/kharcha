import { Button } from "@/components/ui/button";
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum([
    "Cash",
    "Bank",
    "Credit Card",
    "UPI",
    "Loan",
    "Wallet",
    "Other",
  ]),
  colorHex: z.string(),
  budget: z.number().min(0, "Budget must be a positive number").optional(),
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
      budget: account?.budget || undefined,
    },
  });

  React.useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        type: account.type as AccountFormData["type"],
        colorHex: account.colorHex,
        budget: account.budget,
      });
    } else {
      form.reset({
        name: "",
        type: "Bank",
        colorHex: colors[0],
        budget: undefined,
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
      <SheetContent className="w-full overflow-y-auto pb-6 sm:max-w-[500px]">
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Account Name
                  </FormLabel>
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
                  <FormLabel className="text-sm font-medium">
                    Account Type
                  </FormLabel>
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
              name="colorHex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Color</FormLabel>
                  <div className="grid grid-cols-6 gap-3 py-2 sm:grid-cols-8">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-10 w-10 rounded-full border-2 transition-all sm:h-8 sm:w-8 ${
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

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Budget (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? undefined : Number(value));
                      }}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse space-y-2 space-y-reverse border-t pt-4 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="h-11 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="h-11 w-full sm:w-auto">
                {account ? "Update" : "Create"} Account
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
