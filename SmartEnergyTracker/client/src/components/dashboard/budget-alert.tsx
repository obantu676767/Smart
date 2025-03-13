import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BudgetAlert, insertBudgetAlertSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BudgetAlertComponent() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: alerts, isLoading } = useQuery<BudgetAlert[]>({
    queryKey: ["/api/alerts"],
  });

  const form = useForm({
    resolver: zodResolver(insertBudgetAlertSchema),
    defaultValues: {
      threshold: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: { threshold: number }) => {
      await apiRequest("POST", "/api/alerts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setShowForm(false);
      toast({
        title: "Alert set successfully",
        description: "You will be notified when energy usage exceeds the threshold",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to set alert",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Budget Alerts</CardTitle>
        <Button
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          size="sm"
        >
          {showForm ? "Cancel" : "Set Alert"}
        </Button>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                mutation.mutate({ threshold: Number(data.threshold) })
              )}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Threshold (kW)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Enter threshold"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Set Alert
              </Button>
            </form>
          </Form>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Alert Threshold</AlertTitle>
                <AlertDescription>
                  You will be notified when energy usage exceeds {alert.threshold}{" "}
                  kW
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No alerts set. Click "Set Alert" to create one.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
