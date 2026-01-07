import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  MapPin,
  Package,
  Star,
  X,
  MessageSquare,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { StatusBadge, PaymentBadge } from '@/components/common/StatusBadge';
import StarRating from '@/components/common/StarRating';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ClientRequests() {
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['clientRequests', user?.email],
    queryFn: () => base44.entities.CleaningRequest.filter({ client_email: user.email }, '-created_date'),
    enabled: !!user
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.CleaningRequest.update(id, { status: 'cancelled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientRequests'] })
  });

  const rateMutation = useMutation({
    mutationFn: async ({ id, rating, review }) => {
      await base44.entities.CleaningRequest.update(id, { rating, review });
      
      // Update cleaner stats
      const request = requests.find(r => r.id === id);
      if (request?.cleaner_email) {
        const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: request.cleaner_email });
        if (cleanerProfiles.length > 0) {
          const cleaner = cleanerProfiles[0];
          const newTotalCleanings = (cleaner.total_cleanings || 0) + 1;
          const currentTotal = (cleaner.average_rating || 0) * (cleaner.total_cleanings || 0);
          const newAverage = (currentTotal + rating) / newTotalCleanings;
          
          let consecutive = rating === 5 ? (cleaner.consecutive_five_stars || 0) + 1 : 0;
          let rewardsEarned = cleaner.rewards_earned || 0;
          
          // Check for reward
          if (consecutive >= 10) {
            await base44.entities.Reward.create({
              cleaner_email: request.cleaner_email,
              type: 'consecutive_five_stars',
              amount: 100,
              description: '10 avaliações 5 estrelas seguidas!',
              status: 'pending'
            });
            rewardsEarned += 1;
            consecutive = 0;
          }
          
          await base44.entities.CleanerProfile.update(cleaner.id, {
            total_cleanings: newTotalCleanings,
            average_rating: newAverage,
            consecutive_five_stars: consecutive,
            rewards_earned: rewardsEarned
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientRequests'] });
      setShowRatingDialog(false);
      setSelectedRequest(null);
    }
  });

  const openRating = (request) => {
    setSelectedRequest(request);
    setRating(5);
    setReview('');
    setShowRatingDialog(true);
  };

  const submitRating = () => {
    if (selectedRequest) {
      rateMutation.mutate({ id: selectedRequest.id, rating, review });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meus Pedidos</h1>
        <p className="text-slate-600 dark:text-slate-400">Acompanhe suas solicitações de limpeza</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : requests.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Você ainda não fez nenhuma solicitação de limpeza
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Date info */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {format(new Date(request.scheduled_date), 'dd')}
                        </span>
                        <span className="text-xs text-emerald-700 dark:text-emerald-300 uppercase">
                          {format(new Date(request.scheduled_date), 'MMM', { locale: ptBR })}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{request.scheduled_time}</span>
                          <span className="text-slate-400">•</span>
                          <span>{request.hours}h</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{request.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-wrap items-center gap-3">
                      <StatusBadge status={request.status} />
                      <PaymentBadge status={request.payment_status} />
                      {request.include_products && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium dark:bg-amber-900/30 dark:text-amber-400">
                          <Package className="w-3 h-3" />
                          Produtos
                        </span>
                      )}
                      {request.rating && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium dark:bg-amber-900/30 dark:text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          {request.rating}
                        </span>
                      )}
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {request.total_price?.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelMutation.mutate(request.id)}
                            className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {request.status === 'completed' && !request.rating && (
                          <Button
                            size="sm"
                            onClick={() => openRating(request)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Avaliar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar Serviço</DialogTitle>
            <DialogDescription>
              Como foi sua experiência?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <StarRating rating={rating} setRating={setRating} size="lg" />
            </div>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Deixe um comentário (opcional)"
              className="min-h-[100px]"
            />
            <Button
              onClick={submitRating}
              disabled={rateMutation.isPending}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              {rateMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}