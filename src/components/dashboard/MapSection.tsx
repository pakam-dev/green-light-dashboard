import { Button } from "@/components/ui/button";

export const MapSection = () => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Button variant="secondary" size="sm" className="font-medium">
          Map
        </Button>
        <Button variant="ghost" size="sm" className="font-medium text-muted-foreground">
          Satellite
        </Button>
      </div>
      <div className="h-80 bg-muted/30 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Map view placeholder</p>
          <p className="text-xs mt-1">Integrate with Google Maps or Mapbox</p>
        </div>
      </div>
    </div>
  );
};
