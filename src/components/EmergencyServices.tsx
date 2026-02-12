import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const EmergencyServices = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-12 sm:py-16 px-4 bg-emergency/5">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emergency" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {t('emergency_24_7')}
          </h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-sm sm:text-base">
          {t('emergency_desc')}
        </p>
        
        <Button 
          size="lg"
          className="bg-emergency hover:bg-emergency/90 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
          onClick={() => navigate("/emergency")}
        >
          <AlertCircle className="h-5 w-5 me-2" />
          {t('view_emergency')}
        </Button>
      </div>
    </section>
  );
};
