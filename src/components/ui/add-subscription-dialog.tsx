import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, CreditCard } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

const subscriptionFormSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  date: z.date(),
  accountId: z.string().min(1, "Please select an account"),
  provider: z.string().min(1, "Provider name is required"),
  renewalDate: z.date(),
  remind: z.boolean(),
  frequency: z.enum(["monthly", "weekly", "yearly"]),
  note: z.string().min(1, "Note is required"),
});

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

// Common subscription providers for quick selection
const commonProviders = [
  "Netflix",
  "Amazon Prime",
  "Disney+",
  "Spotify",
  "YouTube Premium",
  "Apple Music",
  "Hulu",
  "HBO Max",
  "Adobe Creative Cloud",
  "Microsoft 365",
  "Other",
];

interface AddSubscriptionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  subscription?: Doc<"transactions">; // For edit mode
  onSuccess?: () => void;
}

export function AddSubscriptionDialog({
  trigger,
  open,
  onOpenChange,
  subscription,
  onSuccess,
}: AddSubscriptionDialogProps) {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const accounts = useQuery(api.accounts.listAccounts);
  const outflowTypes = useQuery(api.outflowTypes.listOutflowTypes);
  const createTransaction = useMutation(api.transactions.addTransaction);
  const updateTransaction = useMutation(api.transactions.updateTransaction);
  const createOutflowType = useMutation(api.outflowTypes.createCustomOutflowType);

  // Find the subscription outflow type
  const subscriptionType = React.useMemo(() => {
    return outflowTypes?.find((type) => type.name === "Subscription");
  }, [outflowTypes]);

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      amount: subscription?.amount ?? 0,
      date: subscription ? new Date(subscription.date) : new Date(),
      accountId: subscription?.accountId ?? "",
      provider: subscription?.metadata?.provider ?? "",
      renewalDate: subscription?.metadata?.renewalDate
        ? new Date(subscription.metadata.renewalDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
      remind: subscription?.metadata?.remind ?? true,
      frequency: subscription?.metadata?.frequency ?? "monthly",
      note: subscription?.note ?? "",
    },
  });

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      let subscriptionTypeId = subscriptionType?._id;

      // If subscription type doesn't exist, create it
      if (!subscriptionType) {
        try {
          subscriptionTypeId = await createOutflowType({
            name: "Subscription",
            emoji: "🔄",
            colorHex: "#3b82f6",
            extraFields: [
              { key: "provider", label: "Provider", type: "text" },
              { key: "renewalDate", label: "Renewal Date", type: "date" },
              { key: "remind", label: "Remind me", type: "toggle" },
              { key: "frequency", label: "Frequency", type: "text" },
            ],
          });
        } catch (error) {
          toast.error("Failed to create subscription category. Please try again.");
          console.error("Failed to create subscription outflow type:", error);
          return;
        }
      }

      // Transform form data to match mutation expectations
      const transformedData = {
        amount: data.amount,
        date: data.date.getTime(),
        accountId: data.accountId as any,
        outflowTypeId: subscriptionTypeId as any,
        note: data.note,
        metadata: {
          provider: data.provider,
          renewalDate: data.renewalDate.getTime(),
          remind: data.remind,
          frequency: data.frequency,
        },
      };

      if (subscription) {
        await updateTransaction({
          id: subscription._id,
          ...transformedData,
        });
        toast.success("Subscription updated successfully!");
      } else {
        await createTransaction(transformedData);
        toast.success("Subscription added successfully!");
      }

      handleOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save subscription");
      console.error(error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-lg sm:text-xl flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {subscription ? "Edit Subscription" : "Add Subscription"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            Track your recurring subscription payments with automatic renewal
            reminders.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Service Provider
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Netflix, Spotify, Amazon Prime"
                        {...field}
                        className="h-11 text-base"
                        list="common-providers"
                      />
                    </FormControl>
                    <datalist id="common-providers">
                      {commonProviders.map((provider) => (
                        <option key={provider} value={provider} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Amount (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="99.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-11 text-base"
                      />
                    </FormControl>
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
                  <FormLabel className="text-sm font-medium">Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account._id} value={account._id}>
                          {account.name} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">
                      Payment Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-11 pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick payment date</span>
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

              <FormField
                control={form.control}
                name="renewalDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">
                      Next Renewal
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-11 pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick renewal date</span>
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
                          disabled={(date) => date < new Date("1900-01-01")}
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
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Frequency
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remind"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Renewal Reminder
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Get notified before renewal date
                    </div>
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

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Note
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Family plan"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
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
                {subscription ? "Update" : "Add"} Subscription
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
