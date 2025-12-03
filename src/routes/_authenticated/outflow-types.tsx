import { AddOutflowTypeDialog } from "@/components/custom/add-outflow-type-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-fade-in">
      {/* Gradient Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-600 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xNiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMC0xNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white/80 hover:text-white hover:bg-white/10 -ml-2"
            >
              <Link to="/settings">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Settings
              </Link>
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Tag className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
                <p className="text-white/80 text-sm mt-1">
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
                <Button className="bg-white text-violet-600 hover:bg-white/90 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              }
            />
          </div>
          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-white/70" />
              <span className="text-white/90 text-sm">
                {builtInTypes.length} built-in
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-white/70" />
              <span className="text-white/90 text-sm">
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
                    <Skeleton className="w-10 h-10 rounded-lg" />
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

      {/* Built-in Categories */}
      {outflowTypes && builtInTypes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Built-in Categories</h3>
            <Badge variant="secondary" className="text-xs">
              Read-only
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {builtInTypes.map((type, index) => (
              <Card
                key={type._id}
                className="group animate-slide-up bg-muted/30"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-3">
                    <span className="text-2xl p-2 bg-background rounded-lg shadow-sm">
                      {type.emoji}
                    </span>
                    <span className="font-semibold">{type.name}</span>
                  </CardTitle>
                  <Badge variant="outline" className="text-xs bg-background">
                    <Lock className="w-3 h-3 mr-1" />
                    Built-in
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {type.extraFields?.length || 0} additional fields
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Custom Categories */}
      {outflowTypes && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h3 className="text-lg font-semibold">Custom Categories</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customTypes.length === 0 ? (
              <Card className="col-span-full border-dashed animate-fade-in">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-full mb-4">
                    <Tag className="h-10 w-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No custom categories yet
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-sm">
                    Create custom categories to better organize your
                    transactions beyond the built-in options.
                  </p>
                  <AddOutflowTypeDialog
                    open={showAddDialog}
                    onOpenChange={setShowAddDialog}
                    onSuccess={() => setShowAddDialog(false)}
                    trigger={
                      <Button className="bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg">
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
                  className="relative group animate-slide-up overflow-hidden"
                  style={{
                    animationDelay: `${(builtInTypes.length + index) * 30}ms`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: type.colorHex }}
                  />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                    <CardTitle className="text-sm font-medium flex items-center gap-3">
                      <span
                        className="text-2xl p-2 rounded-lg"
                        style={{ backgroundColor: `${type.colorHex}20` }}
                      >
                        {type.emoji}
                      </span>
                      <span className="font-semibold">{type.name}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(type._id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {type.extraFields?.length || 0} additional fields
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
