import { AddOutflowTypeDialog } from "@/components/custom/add-outflow-type-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@convex/_generated/api";
import { type Doc, type Id } from "@convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Edit,
  Lock,
  Plus,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/outflow-types")({
  component: OutflowTypesPage,
});

function OutflowTypesPage() {
  const outflowTypes = useQuery(api.outflowTypes.listOutflowTypes);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingType, setEditingType] = useState<Doc<"outflowTypes"> | null>(
    null
  );

  const deleteOutflowType = useMutation(api.outflowTypes.deleteOutflowType);

  const handleDelete = async (typeId: Id<"outflowTypes">) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      try {
        await deleteOutflowType({ id: typeId });
      } catch (error) {
        alert("Failed to delete category");
      }
    }
  };

  const builtInTypes =
    outflowTypes?.filter((type) => type.isCustom === false) ?? [];
  const customTypes =
    outflowTypes?.filter((type) => type.isCustom === true) ?? [];

  return (
    <div className="animate-fade-in flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-600 p-6 text-white shadow-xl md:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xNiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMC0xNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Link to="/settings">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Settings
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Tag className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Categories</h1>
                <p className="mt-1 text-sm text-white/80">
                  Organize your transactions with custom categories
                </p>
              </div>
            </div>
            <AddOutflowTypeDialog
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
              outflowType={editingType}
              onSuccess={() => {
                setShowAddDialog(false);
                setEditingType(null);
              }}
              trigger={
                <Button className="bg-white text-violet-600 shadow-lg hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              }
            />
          </div>
          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-white/70" />
              <span className="text-sm text-white/90">
                {builtInTypes.length} built-in
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-white/70" />
              <span className="text-sm text-white/90">
                {customTypes.length} custom
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!outflowTypes && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tabs */}
      {outflowTypes && (
        <Tabs defaultValue="custom" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Custom ({customTypes.length})
            </TabsTrigger>
            <TabsTrigger value="builtin" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Built-in ({builtInTypes.length})
            </TabsTrigger>
          </TabsList>

          {/* Custom Categories Tab */}
          <TabsContent value="custom" className="mt-6 px-0">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customTypes.length === 0 ? (
                  <Card className="animate-fade-in col-span-full border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="mb-4 rounded-full bg-violet-100 p-4 dark:bg-violet-900/30">
                        <Tag className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">
                        No custom categories yet
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-sm text-center">
                        Create custom categories to better organize your
                        transactions beyond the built-in options.
                      </p>
                      <AddOutflowTypeDialog
                        open={showAddDialog}
                        onOpenChange={setShowAddDialog}
                        onSuccess={() => setShowAddDialog(false)}
                        trigger={
                          <Button className="bg-linear-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:from-violet-600 hover:to-purple-600">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Custom Category
                          </Button>
                        }
                      />
                    </CardContent>
                  </Card>
                ) : (
                  customTypes.map((type, index) => (
                    <Card
                      key={type._id}
                      className="group animate-slide-up relative overflow-hidden"
                      style={{
                        animationDelay: `${index * 30}ms`,
                      }}
                    >
                      <div
                        className="absolute top-0 right-0 left-0 h-1"
                        style={{ backgroundColor: type.colorHex }}
                      />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-2">
                        <CardTitle className="flex items-center gap-3 text-sm font-medium">
                          <span
                            className="rounded-lg p-2 text-2xl"
                            style={{ backgroundColor: `${type.colorHex}20` }}
                          >
                            {type.emoji}
                          </span>
                          <span className="font-semibold">{type.name}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-1">
                          <AddOutflowTypeDialog
                            open={editingType?._id === type._id}
                            onOpenChange={(open) => {
                              if (!open) setEditingType(null);
                            }}
                            outflowType={type}
                            onSuccess={() => setEditingType(null)}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingType(type)}
                                className="hover:bg-muted h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(type._id)}
                            className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Sparkles className="h-3 w-3" />
                          {type.extraFields?.length || 0} additional fields
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Built-in Categories Tab */}
          <TabsContent value="builtin" className="mt-6 px-0">
            <div className="space-y-4">
              {builtInTypes.length === 0 ? (
                <Card className="animate-fade-in border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="mb-4 rounded-full bg-muted p-4">
                      <Lock className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      No built-in categories
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-center">
                      Built-in categories are predefined and cannot be modified.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {builtInTypes.map((type, index) => (
                    <Card
                      key={type._id}
                      className="group animate-slide-up bg-muted/30"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="flex items-center gap-3 text-sm font-medium">
                          <span className="bg-background rounded-lg p-2 text-2xl shadow-sm">
                            {type.emoji}
                          </span>
                          <span className="font-semibold">{type.name}</span>
                        </CardTitle>
                        <Badge variant="outline" className="bg-background text-xs">
                          <Lock className="mr-1 h-3 w-3" />
                          Built-in
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Sparkles className="h-3 w-3" />
                          {type.extraFields?.length || 0} additional fields
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
