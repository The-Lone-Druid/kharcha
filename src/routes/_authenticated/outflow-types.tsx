import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { useState } from "react";
import { AddOutflowTypeDialog } from "@/components/ui/add-outflow-type-dialog";
import { type Doc, type Id } from "../../../convex/_generated/dataModel";

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
    outflowTypes?.filter((type) => type.isCustom === false) || [];
  const customTypes =
    outflowTypes?.filter((type) => type.isCustom === true) || [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Categories
        </h2>
        <div className="flex items-center space-x-2">
          <AddOutflowTypeDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            outflowType={editingType}
            onSuccess={() => {
              setShowAddDialog(false);
              setEditingType(null);
            }}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            }
          />
        </div>
      </div>

      {/* Built-in Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Built-in Categories</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {outflowTypes ? (
            builtInTypes.map((type) => (
              <Card key={type._id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="text-lg">{type.emoji}</span>
                    {type.name}
                  </CardTitle>
                  <Badge variant="secondary">Built-in</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {type.extraFields?.length || 0} additional fields
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-4 w-20" />
                  </CardTitle>
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Custom Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Custom Categories</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {outflowTypes ? (
            customTypes.map((type) => (
              <Card key={type._id} className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="text-lg">{type.emoji}</span>
                    {type.name}
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
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(type._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {type.extraFields?.length || 0} additional fields
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-4 w-20" />
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          )}

          {outflowTypes && customTypes.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No custom categories
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create custom categories to better organize your transactions.
                </p>
                <AddOutflowTypeDialog
                  open={showAddDialog}
                  onOpenChange={setShowAddDialog}
                  onSuccess={() => setShowAddDialog(false)}
                  trigger={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Custom Category
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
