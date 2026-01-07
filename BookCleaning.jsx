import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Banknote,
  Smartphone,
  QrCode,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PriceCalculator from '@/components/common/PriceCalculator';

export default function BookCleaning() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [hours, setHours] = useState(2);
  const [includeProducts, setIncludeProducts] = useState(false);
  const [serviceType, setServiceType] = useState('padrao');
  const [frequency, setFrequency] = useState('unica');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [numberOfCleaners, setNumberOfCleaners] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [address, setAddress] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [autoAssign, setAutoAssign] = useState(true);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [availableCleaners, setAvailableCleaners] = useState([]);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  useEffect(() => {
    checkAuth();
    loadCleaners();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const profiles = await base44.entities.ClientProfile.filter({ user_email: userData.email });
      if (profiles.length > 0 && profiles[0].addresses?.length > 0) {
        setAddress(profiles[0].addresses[0].address || '');
      }
    } catch (e) {
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const loadCleaners = async () => {
    const cleaners = await base44.entities.CleanerProfile.filter({ verified: true, available: true });
    setAvailableCleaners(cleaners);
  };

  const calculatePrices = () => {
    const FIRST_HOUR = 40;
    const ADDITIONAL_HOUR = 20;
    const PRODUCTS_PRICE = 30;
    const AGENCY_FEE = 0.40;

    const serviceMultipliers = {
      padrao: 1,
      com_organizacao: 1.1,
      pos_obra: 1.5
    };

    let basePrice = hours <= 1 ? FIRST_HOUR : FIRST_HOUR + (hours - 1) * ADDITIONAL_HOUR;
    const multiplier = serviceMultipliers[serviceType] || 1;
    basePrice = basePrice * multiplier;
    
    const productsTotal = includeProducts ? PRODUCTS_PRICE : 0;
    const agencyFee = basePrice * AGENCY_FEE;
    const totalPrice = basePrice + agencyFee + productsTotal;

    return { basePrice, agencyFee, totalPrice, cleanerEarnings: basePrice };
  };

  const handleSubmit = async () => {
    setLoading(true);
    const prices = calculatePrices();

    await base44.entities.CleaningRequest.create({
      client_email: user.email,
      cleaner_email: selectedCleaner?.user_email || undefined,
      status: 'pending',
      service_type: serviceType,
      frequency,
      region,
      city,
      number_of_cleaners: numberOfCleaners,
      hours,
      include_products: includeProducts,
      base_price: prices.basePrice * numberOfCleaners,
      agency_fee: prices.agencyFee * numberOfCleaners,
      total_price: prices.totalPrice * numberOfCleaners,
      cleaner_earnings: prices.cleanerEarnings,
      address,
      address_complement: addressComplement,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      scheduled_time: selectedTime,
      notes,
      payment_method: paymentMethod,
      payment_status: 'pending'
    });

    setLoading(false);
    navigate(createPageUrl('ClientRequests'));
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return selectedDate && selectedTime;
    if (step === 3) return address.trim() !== '';
    return true;
  };

  const prices = calculatePrices();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                s === step 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                  : s < step
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 4 && (
              <div className={`w-12 h-1 rounded-full ${s < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Service */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Escolha o Serviço
                </CardTitle>
                <CardDescription>
                  Selecione as horas e opções desejadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Tipo de Serviço</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'padrao', label: 'Padrão', icon: '🧹', desc: 'Limpeza completa' },
                      { value: 'com_organizacao', label: 'Com Organização', icon: '📦', desc: '+10% no valor' },
                      { value: 'pos_obra', label: 'Pós-Obra', icon: '🏗️', desc: '+50% no valor' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setServiceType(type.value)}
                        className={`p-4 rounded-xl border-2 font-medium transition-all text-left ${
                          serviceType === type.value
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-sm font-semibold">{type.label}</div>
                        <div className="text-xs opacity-70 mt-1">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Região (RS)</Label>
                    <Input
                      id="region"
                      placeholder="Ex: Porto Alegre, Caxias do Sul..."
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      placeholder="Digite a cidade"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Frequência</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'unica', label: 'Única Vez' },
                      { value: 'semanal', label: 'Semanal' },
                      { value: 'mensal', label: 'Mensal' }
                    ].map((freq) => (
                      <button
                        key={freq.value}
                        type="button"
                        onClick={() => setFrequency(freq.value)}
                        className={`p-3 rounded-xl border-2 font-medium transition-all ${
                          frequency === freq.value
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Número de Faxineiras</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNumberOfCleaners(Math.max(1, numberOfCleaners - 1))}
                      className="h-12 w-12"
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-bold text-emerald-600">{numberOfCleaners}</div>
                      <div className="text-xs text-slate-500">
                        {numberOfCleaners === 1 ? 'faxineira' : 'faxineiras'}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNumberOfCleaners(Math.min(5, numberOfCleaners + 1))}
                      className="h-12 w-12"
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-center text-slate-500">Máximo 5 faxineiras</p>
                </div>

                <PriceCalculator
                  hours={hours}
                  setHours={setHours}
                  includeProducts={includeProducts}
                  setIncludeProducts={setIncludeProducts}
                  serviceType={serviceType}
                />

                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Atribuição Automática
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Sistema escolhe a melhor faxineira disponível
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="auto-assign" className="text-sm">
                          {autoAssign ? 'Ativado' : 'Desativado'}
                        </Label>
                        <Switch
                          id="auto-assign"
                          checked={autoAssign}
                          onCheckedChange={(checked) => {
                            setAutoAssign(checked);
                            if (checked) setSelectedCleaner(null);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {!autoAssign && availableCleaners.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Escolher Faxineira</Label>
                      <div className="grid gap-3">
                        {availableCleaners.map((cleaner) => (
                          <button
                            key={cleaner.id}
                            type="button"
                            onClick={() => setSelectedCleaner(cleaner)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              selectedCleaner?.id === cleaner.id
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
                                {cleaner.full_name?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {cleaner.full_name}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  <span>⭐ {cleaner.average_rating?.toFixed(1) || '0.0'}</span>
                                  <span>•</span>
                                  <span>{cleaner.total_cleanings || 0} serviços</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {numberOfCleaners > 1 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Total para {numberOfCleaners} faxineiras: R$ {(prices.totalPrice * numberOfCleaners).toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-600" />
                  Data e Horário
                </CardTitle>
                <CardDescription>
                  Escolha quando deseja o serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={ptBR}
                    disabled={(date) => date < new Date()}
                    className="rounded-xl border shadow-sm"
                  />
                </div>

                {selectedDate && (
                  <div className="space-y-3">
                    <Label className="text-base">Horário disponível:</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-xl border-2 font-medium transition-all ${
                            selectedTime === time
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Endereço
                </CardTitle>
                <CardDescription>
                  Onde será realizada a limpeza?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={addressComplement}
                    onChange={(e) => setAddressComplement(e.target.value)}
                    placeholder="Apartamento, bloco, referência"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Alguma instrução especial?"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Pagamento
                </CardTitle>
                <CardDescription>
                  Escolha como deseja pagar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 mb-4">
                  <p className="text-sm text-emerald-900 dark:text-emerald-100">
                    💰 <strong>Pagamento:</strong> Você paga o valor total direto para a Leidy Cleaner. 
                    Nós repassamos o valor do serviço para a faxineira após a conclusão.
                  </p>
                </div>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">PIX</p>
                        <p className="text-sm text-slate-500">Pagamento instantâneo</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Cartão de Crédito</p>
                        <p className="text-sm text-slate-500">Visa, Master, Elo</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium">Dinheiro</p>
                        <p className="text-sm text-slate-500">Pagar na hora</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Resumo do Pedido</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Data</span>
                      <span className="font-medium">{selectedDate ? format(selectedDate, "dd/MM/yyyy") : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Horário</span>
                      <span className="font-medium">{selectedTime || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Tipo de Serviço</span>
                      <span className="font-medium">
                        {serviceType === 'padrao' ? 'Padrão' : 
                         serviceType === 'com_organizacao' ? 'Com Organização' : 'Pós-Obra'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Frequência</span>
                      <span className="font-medium">
                        {frequency === 'unica' ? 'Única Vez' : 
                         frequency === 'semanal' ? 'Semanal' : 'Mensal'}
                      </span>
                    </div>
                    {region && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Região</span>
                        <span className="font-medium">{region}</span>
                      </div>
                    )}
                    {city && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Cidade</span>
                        <span className="font-medium">{city}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Faxineiras</span>
                      <span className="font-medium">{numberOfCleaners}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Duração</span>
                      <span className="font-medium">{hours} horas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Produtos</span>
                      <span className="font-medium">{includeProducts ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {(prices.totalPrice * numberOfCleaners).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="flex-1 md:flex-none"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex-1 md:flex-none bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 md:flex-none bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {loading ? 'Processando...' : 'Confirmar Pedido'}
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
} 