import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
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
import { Plus, Trash2 } from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";

const extraFieldSchema = z.object({
  key: z.string().min(1, "Field key is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "number", "date", "toggle"]),
});

const outflowTypeFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  emoji: z.string().min(1, "Emoji is required"),
  colorHex: z.string(),
  extraFields: z.array(extraFieldSchema),
});

type OutflowTypeFormData = z.infer<typeof outflowTypeFormSchema>;

const fieldTypes = [
  { value: "text" as const, label: "Text" },
  { value: "number" as const, label: "Number" },
  { value: "date" as const, label: "Date" },
  { value: "toggle" as const, label: "Toggle" },
];

const colors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

const emojis = [
  "💸",
  "🔄",
  "🏦",
  "💳",
  "🤝",
  "📄",
  "📈",
  "↔️",
  "🎯",
  "🎨",
  "📱",
  "🏠",
  "🚗",
  "🍔",
  "🎬",
  "✈️",
];

interface AddOutflowTypeDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  outflowType?: Doc<"outflowTypes"> | null;
  onSuccess?: (categoryId?: string) => void;
}

export function AddOutflowTypeDialog({
  trigger,
  open,
  onOpenChange,
  outflowType,
  onSuccess,
}: AddOutflowTypeDialogProps) {
  const [isOpen, setIsOpen] = React.useState(open || false);
  const createOutflowType = useMutation(
    api.outflowTypes.createCustomOutflowType
  );
  const updateOutflowType = useMutation(api.outflowTypes.updateOutflowType);

  const form = useForm<OutflowTypeFormData>({
    resolver: zodResolver(outflowTypeFormSchema),
    defaultValues: {
      name: outflowType?.name || "",
      emoji: outflowType?.emoji || emojis[0],
      colorHex: outflowType?.colorHex || colors[0],
      extraFields: outflowType?.extraFields || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "extraFields",
  });

  React.useEffect(() => {
    if (outflowType) {
      form.reset({
        name: outflowType.name,
        emoji: outflowType.emoji,
        colorHex: outflowType.colorHex,
        extraFields: outflowType.extraFields || [],
      });
    } else {
      form.reset({
        name: "",
        emoji: emojis[0],
        colorHex: colors[0],
        extraFields: [],
      });
    }
  }, [outflowType, form]);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const onSubmit = async (data: OutflowTypeFormData) => {
    try {
      let categoryId: string | undefined;
      
      if (outflowType) {
        await updateOutflowType({
          id: outflowType._id,
          name: data.name,
          emoji: data.emoji,
          colorHex: data.colorHex,
          extraFields: data.extraFields,
        });
        toast.success("Category updated successfully");
        categoryId = outflowType._id;
      } else {
        const newCategory = await createOutflowType({
          name: data.name,
          emoji: data.emoji,
          colorHex: data.colorHex,
          extraFields: data.extraFields,
        });
        toast.success("Category created successfully");
        categoryId = newCategory;
      }
      
      handleOpenChange(false);
      form.reset();
      onSuccess?.(categoryId);
    } catch (error) {
      toast.error("Failed to save category");
      console.error(error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto pb-6">
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-lg sm:text-xl">
            {outflowType ? "Edit Category" : "Add Custom Category"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {outflowType
              ? "Update your custom category details."
              : "Create a new category with custom fields for better transaction tracking."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Category Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Groceries"
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
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Emoji</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emojis.map((emoji) => (
                          <SelectItem key={emoji} value={emoji}>
                            {emoji}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {/* Extra Fields */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <FormLabel className="text-base font-medium">Additional Fields</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ key: "", label: "", type: "text" })}
                  className="w-full sm:w-auto h-9"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`extraFields.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Field Label</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Provider"
                                {...field}
                                className="h-10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`extraFields.${index}.key`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Field Key</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., provider"
                                {...field}
                                className="h-10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <FormField
                        control={form.control}
                        name={`extraFields.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-sm">Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fieldTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-10 px-3 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                {outflowType ? "Update" : "Create"} Category
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
