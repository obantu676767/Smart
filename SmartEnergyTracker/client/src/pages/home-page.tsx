import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DeviceList } from "@/components/dashboard/device-list";
import { EnergyChart } from "@/components/dashboard/energy-chart";
import { BudgetAlertComponent } from "@/components/dashboard/budget-alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Device } from "@shared/schema";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  const { data: devices } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Energy Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.username}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <DeviceList />
            <BudgetAlertComponent />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Select
                value={selectedDeviceId?.toString()}
                onValueChange={(value) => setSelectedDeviceId(Number(value))}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {devices?.map((device) => (
                    <SelectItem key={device.id} value={device.id.toString()}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDeviceId && <EnergyChart deviceId={selectedDeviceId} />}
            
            {!selectedDeviceId && (
              <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/5">
                <p className="text-muted-foreground">
                  Select a device to view its energy usage
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
