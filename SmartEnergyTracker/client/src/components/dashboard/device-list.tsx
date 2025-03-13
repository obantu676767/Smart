import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Device } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Power } from "lucide-react";

export function DeviceList() {
  const { data: devices, isLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
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
      <CardHeader>
        <CardTitle>Connected Devices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devices?.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-4">
                <Power
                  className={`h-5 w-5 ${
                    device.isActive ? "text-green-500" : "text-red-500"
                  }`}
                />
                <div>
                  <div className="font-medium">{device.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {device.type}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{device.currentUsage} kW</div>
                <div className="text-sm text-muted-foreground">Current Usage</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
