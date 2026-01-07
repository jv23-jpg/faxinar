import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  Package, 
  CheckCircle2,
  ArrowRight,
  Calculator,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import PriceCalculator from '@/components/common/PriceCalculator';

export default function Precos() {
  const [hours, setHours] = useState(3);
  const [includeProducts, setIncludeProducts] = useState(false);

  const priceTable = [
    { hours: 1, base: 40, withProducts: 70, total: 56, totalWithProducts: 86 },
    { hours: 2, base: 60, withProducts: 90, total: 84, totalWithProducts: 114 },
    { hours: 3, base: 80, withProducts: 110, total: 112, totalWithProducts: 142 },
    { hours: 4, base: 100, withProducts: 130, total: 140, totalWithProducts: 170 },
    { hours: 5, base: 120, withProducts: 150, total: 168, totalWithProducts: 198 },
    { hours: 6, base: 140, withProducts: 170, total: 196, totalWithProducts: 226 },
    { hours: 7, base: 160, withProducts: 190, total: 224, totalWithProducts: 254 },
    { hours: 8, base: 180, withProducts: 210, total: 252, totalWithProducts: 282 },
  ];

  const inclusions = [
    'Profissional verificada e treinada',
    'Limpeza completa de todos os cômodos',
    'Equipamentos de proteção individual',
    'Seguro contra acidentes',
    'Suporte via WhatsApp',
    'Garantia de satisfação'
  ];

  return (
    <div className="space-y-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-slate-900 dark:text-white mb-4"
        >
          Tabela de Preços
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-slate-600 dark:text-slate-400"
        >
          Preços transparentes e sem surpresas
        </motion.p>
      </div>

      {/* Price structure */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Primeira Hora</h3>
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">R$ 40</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Valor inicial do serviço</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/50 dark:to-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Hora Adicional</h3>
              <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">+ R$ 20</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cada hora a mais (máx. 8h)</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Produtos</h3>
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">+ R$ 30</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Opcional - materiais inclusos</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Calculator */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PriceCalculator
            hours={hours}
            setHours={setHours}
            includeProducts={includeProducts}
            setIncludeProducts={setIncludeProducts}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                O que está incluso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {inclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Price Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600">
            <CardTitle className="text-white flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Tabela Completa de Preços
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Horas
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Serviço Base
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Com Produtos
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Total (com taxa)
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Total + Produtos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {priceTable.map((row, index) => (
                    <tr 
                      key={row.hours}
                      className={`border-t border-slate-100 dark:border-slate-700 ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {row.hours}h
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        R$ {row.base.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        R$ {row.withProducts.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        R$ {row.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-teal-600 dark:text-teal-400">
                        R$ {row.totalWithProducts.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Sobre a Taxa da Agência
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  A taxa de 40% garante a operação da plataforma, suporte 24h, verificação de profissionais, 
                  seguro e garantia de qualidade. Esse valor permite que mantenhamos o serviço funcionando 
                  com excelência para você e para nossas profissionais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <div className="text-center">
        <Link to={createPageUrl('Cadastro')}>
          <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 shadow-lg shadow-emerald-500/25">
            Agendar Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}