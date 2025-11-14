import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const EmergencyServices = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-emergency/5">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <AlertCircle className="h-8 w-8 text-emergency" />
          <h2 className="text-3xl md:text-4xl font-bold">
            24/7 Emergency Services
          </h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Need urgent help? Our verified emergency service providers are available round the clock.
          Quick response time guaranteed.
        </p>
        
        <Button 
          size="lg"
          className="bg-emergency hover:bg-emergency/90 text-lg px-8 py-6"
          onClick={() => navigate("/emergency")}
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          View Emergency Services
        </Button>
      </div>
    </section>
  );
};
