import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Clock, 
  Shield, 
  Star, 
  ArrowRight,
  CheckCircle2,
  Package,
  Award,
  HelpCircle,
  MapPin,
  Users,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import PriceCalculator from '@/components/common/PriceCalculator';
import WhatsAppButton from '@/components/common/WhatsAppButton';

export default function Home() {
  const [hours, setHours] = useState(3);
  const [includeProducts, setIncludeProducts] = useState(false);
  const [serviceType, setServiceType] = useState('padrao');
  const features = [
    {
      icon: Clock,
      title: 'Agendamento Flexível',
      description: 'Escolha o melhor horário para você, de 1 a 8 horas de serviço'
    },
    {
      icon: Shield,
      title: 'Profissionais Verificados',
      description: 'Todas as faxineiras passam por processo de verificação'
    },
    {
      icon: Star,
      title: 'Avaliações Reais',
      description: 'Veja as avaliações de outros clientes antes de contratar'
    },
    {
      icon: Package,
      title: 'Produtos Inclusos',
      description: 'Opção de incluir produtos de limpeza por apenas R$ 30'
    }
  ];

  const steps = [
    { number: '01', title: 'Cadastre-se', description: 'Crie sua conta em poucos minutos' },
    { number: '02', title: 'Escolha', description: 'Selecione horas e opções desejadas' },
    { number: '03', title: 'Agende', description: 'Defina data, hora e endereço' },
    { number: '04', title: 'Relaxe', description: 'Nossa profissional cuida de tudo' }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 dark:bg-emerald-800/30 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200 dark:bg-teal-800/30 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="text-center max-w-4xl mx-auto pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Limpeza profissional na sua casa
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
          >
            Sua casa{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              impecável
            </span>
            {' '}com um clique
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto"
          >
            Conectamos você às melhores profissionais de limpeza da sua região. 
            Agendamento fácil, pagamento seguro e qualidade garantida.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to={createPageUrl('Cadastro')}>
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('Precos')}>
              <Button size="lg" variant="outline" className="border-2 px-8">
                Ver Preços
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Price highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-lg mx-auto"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-emerald-900/20 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">A partir de</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">R$ 40</span>
                    <span className="text-slate-500">/hora</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">+500 avaliações</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Por que escolher a Leidy Cleaner?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Qualidade e confiança em cada serviço
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800/50 group">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Como Funciona
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Em 4 passos simples sua casa estará brilhando
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center"
            >
              <div className="text-6xl font-bold text-emerald-200 dark:text-emerald-800 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-emerald-300 dark:border-emerald-700" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Price Calculator */}
      <section className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'padrao', label: 'Padrão' },
                { value: 'com_organizacao', label: 'Com Organização (+10%)' },
                { value: 'pos_obra', label: 'Pós-Obra (+50%)' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setServiceType(type.value)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    serviceType === type.value
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <PriceCalculator
              hours={hours}
              setHours={setHours}
              includeProducts={includeProducts}
              setIncludeProducts={setIncludeProducts}
              serviceType={serviceType}
              readOnly={false}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="text-lg">Horários Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((time) => (
                  <div
                    key={time}
                    className="p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-center font-medium hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                  >
                    {time}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Price Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600">
            <CardTitle className="text-white">Tabela de Preços</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Horas</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Serviço Base</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Com Produtos</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Total Final</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { h: 1, base: 40, prod: 70, total: 56, totalProd: 86 },
                    { h: 2, base: 60, prod: 90, total: 84, totalProd: 114 },
                    { h: 3, base: 80, prod: 110, total: 112, totalProd: 142 },
                    { h: 4, base: 100, prod: 130, total: 140, totalProd: 170 },
                    { h: 5, base: 120, prod: 150, total: 168, totalProd: 198 },
                    { h: 6, base: 140, prod: 170, total: 196, totalProd: 226 },
                    { h: 7, base: 160, prod: 190, total: 224, totalProd: 254 },
                    { h: 8, base: 180, prod: 210, total: 252, totalProd: 282 },
                  ].map((row, i) => (
                    <tr key={row.h} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'}>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.h}h</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">R$ {row.base}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">R$ {row.prod}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">R$ {row.total} / R$ {row.totalProd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Services */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Nossos Serviços
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Soluções completas para todos os tipos de limpeza
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🧹', title: 'Padrão', desc: 'Limpeza completa residencial' },
            { icon: '📦', title: 'Com Organização', desc: 'Limpeza + organização (+10%)' },
            { icon: '🏗️', title: 'Pós-Obra', desc: 'Limpeza pesada (+50%)' }
          ].map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all h-full group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-3xl">
        <div className="text-center mb-12">
          <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Atendemos Todo o Rio Grande do Sul
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Porto Alegre, Caxias do Sul, Pelotas, Santa Maria e demais cidades
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Múltiplas Faxineiras</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Solicite até 5 profissionais ao mesmo tempo
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Clock className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Horário Flexível</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Das 8h às 19h, escolha o melhor horário
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Briefcase className="w-10 h-10 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Frequência Personalizada</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Única, semanal ou mensal
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="text-center mb-12">
          <HelpCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: 'Como funciona o pagamento?',
              a: 'Você pode pagar via PIX, cartão de crédito, débito ou dinheiro. O pagamento é confirmado após o serviço.'
            },
            {
              q: 'Posso cancelar ou reagendar?',
              a: 'Sim! Você pode cancelar ou reagendar com até 24 horas de antecedência sem custos.'
            },
            {
              q: 'As faxineiras são verificadas?',
              a: 'Sim, todas as profissionais passam por verificação de documentos e avaliação antes de serem aprovadas.'
            },
            {
              q: 'O que está incluído na taxa da agência?',
              a: 'A taxa de 40% cobre a plataforma, suporte 24h, seguro, verificação de profissionais e garantia de qualidade.'
            },
            {
              q: 'Posso solicitar a mesma faxineira sempre?',
              a: 'Sim! Você pode marcar faxineiras como favoritas e solicitar seus serviços preferencialmente.'
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {faq.a}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-emerald-500 to-teal-600 overflow-hidden">
          <CardContent className="p-12">
            <Award className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para uma casa impecável?
            </h2>
            <p className="text-emerald-100 mb-8 max-w-md mx-auto">
              Junte-se a milhares de clientes satisfeitos e transforme sua rotina de limpeza
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Cadastro')}>
                <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/555198033-0422" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="bg-green-500 text-white hover:bg-green-600 px-8">
                  Falar no WhatsApp
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      <WhatsAppButton />
    </div>
  );
}