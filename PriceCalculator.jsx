import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Package, Calculator, TrendingUp } from 'lucide-react';

export default function PriceCalculator({ 
  hours = 2, 
  setHours = () => {}, 
  includeProducts = false, 
  setIncludeProducts = () => {},
  serviceType = 'faxina_atual',
  showBreakdown = true,
  readOnly = false
}) {
  const FIRST_HOUR = 40;
  const ADDITIONAL_HOUR = 20;
  const PRODUCTS_PRICE = 30;
  const AGENCY_FEE = 0.40;

  const serviceMultipliers = {
    padrao: 1,
    com_organizacao: 1.1,
    pos_obra: 1.5
  };

  const calculateBasePrice = () => {
    let base = hours <= 1 ? FIRST_HOUR : FIRST_HOUR + (hours - 1) * ADDITIONAL_HOUR;
    const multiplier = serviceMultipliers[serviceType] || 1;
    return base * multiplier;
  };

  const basePrice = calculateBasePrice();
  const productsTotal = includeProducts ? PRODUCTS_PRICE : 0;
  const agencyFee = basePrice * AGENCY_FEE;
  const totalPrice = basePrice + agencyFee + productsTotal;
  const cleanerEarnings = basePrice;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <Calculator className="w-5 h-5" />
          Calculadora de Preços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-4 h-4" />
              Horas de Serviço
            </Label>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{hours}h</span>
          </div>
          <Slider
            value={[hours]}
            onValueChange={(value) => !readOnly && setHours(value[0])}
            min={1}
            max={8}
            step={1}
            className="w-full"
            disabled={readOnly}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>1 hora</span>
            <span>8 horas (máximo)</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl">
          <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
            <Package className="w-4 h-4" />
            Incluir Produtos de Limpeza
            <span className="text-xs text-slate-500">(+R$ {PRODUCTS_PRICE})</span>
          </Label>
          <Switch
            checked={includeProducts}
            onCheckedChange={!readOnly ? setIncludeProducts : undefined}
            disabled={readOnly}
          />
        </div>

        {showBreakdown && (
          <div className="space-y-3 pt-4 border-t border-emerald-200 dark:border-emerald-800">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Serviço base ({hours}h)</span>
              <span className="font-medium">R$ {basePrice.toFixed(2)}</span>
            </div>
            {(serviceType === 'pos_obra' || serviceType === 'com_organizacao') && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Multiplicador ({serviceType === 'pos_obra' ? '1.5x' : '1.1x'})
                </span>
                <span className="font-medium text-blue-600">Aplicado</span>
              </div>
            )}
            {includeProducts && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Produtos de limpeza</span>
                <span className="font-medium">R$ {PRODUCTS_PRICE.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Taxa da agência (40% do serviço)</span>
              <span className="font-medium text-amber-600">R$ {agencyFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-dashed border-emerald-300 dark:border-emerald-700">
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">Total</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Faxineira recebe (serviço)
              </span>
              <span>R$ {cleanerEarnings.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}