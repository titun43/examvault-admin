'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Crown, Star, Check, Zap, Shield, HeadphonesIcon,
  BookOpen, FileText, Trophy, BadgeCheck, Sparkles, Gem
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹99',
    period: '/month',
    icon: Zap,
    gradient: 'from-blue-400 to-blue-500',
    bgGradient: 'from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20',
    features: [
      'Unlimited free tests',
      'Basic solutions & explanations',
      'Progress tracking',
      'Daily quiz access',
      'Bookmark questions',
    ],
    excludedFeatures: [
      'Previous year papers',
      'Current affairs PDF',
      'Priority support',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹249',
    period: '/quarter',
    icon: Crown,
    gradient: 'from-blue-500 to-blue-700',
    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    features: [
      'Everything in Basic',
      'Previous year papers',
      'Detailed solutions & analysis',
      'Current affairs PDF download',
      'Mock test analytics',
      'Priority test access',
    ],
    excludedFeatures: [
      'All exam access',
      'Premium badge',
    ],
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '₹499',
    period: '/year',
    icon: Gem,
    gradient: 'from-blue-600 to-indigo-600',
    bgGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20',
    features: [
      'Everything in Pro',
      'All exam categories access',
      'Priority support 24/7',
      'Premium badge on profile',
      'Daily current affairs digest',
      'Advanced performance analytics',
      'Early access to new features',
      'Personalized study plan',
    ],
    excludedFeatures: [],
    popular: false,
  },
];

const benefitItems = [
  { icon: BookOpen, title: 'Unlimited Tests', desc: 'Practice as much as you want' },
  { icon: FileText, title: 'Detailed Solutions', desc: 'Step-by-step explanations' },
  { icon: Trophy, title: 'Performance Analytics', desc: 'Track your progress over time' },
  { icon: BadgeCheck, title: 'Premium Badge', desc: 'Stand out in the community' },
  { icon: Shield, title: 'Ad-Free Experience', desc: 'No interruptions while studying' },
  { icon: HeadphonesIcon, title: 'Priority Support', desc: 'Get help when you need it' },
];

export default function PremiumView() {
  const { setCurrentView, user, setShowAuthModal } = useAppStore();

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => fetch(`/api/subscriptions?userId=${user?.id}`).then((r) => r.json()).then((d) => d.subscription),
    enabled: !!user?.id,
  });

  const hasActiveSub = subscription?.status === 'active';
  const currentPlan = subscription?.plan?.toLowerCase();

  const handleGetStarted = (planId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // In a real app, this would redirect to payment
    // For now, show a toast or navigate
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 pb-20 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('home')}
          className="flex-shrink-0 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            NEXTEXAM Premium
          </h1>
          <p className="text-sm text-muted-foreground">Unlock your full potential</p>
        </div>
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-6 md:p-8 text-white relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium text-white/90">Limited Time Offer</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">Supercharge Your Preparation</h2>
              <p className="text-white/80 text-sm md:text-base max-w-lg">
                Get unlimited access to mock tests, previous year papers, detailed solutions, and more with NEXTEXAM Premium.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Current Subscription Status */}
      {hasActiveSub && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">You are on the <span className="text-blue-600 capitalize">{currentPlan}</span> plan</p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <Badge className="bg-blue-500 text-white border-0 ml-auto">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className={`border-0 shadow-lg h-full flex flex-col overflow-hidden relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <div className={`bg-gradient-to-br ${plan.gradient} p-5 text-white`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{plan.price}</span>
                    <span className="text-sm opacity-80">{plan.period}</span>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.excludedFeatures.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 opacity-40">
                        <span className="h-4 w-4 flex-shrink-0 mt-0.5 text-center text-xs">—</span>
                        <span className="text-sm line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`w-full font-bold rounded-xl ${
                      isCurrentPlan
                        ? 'bg-muted text-muted-foreground cursor-default'
                        : plan.popular
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    }`}
                    disabled={isCurrentPlan}
                    onClick={() => handleGetStarted(plan.id)}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Star className="h-3.5 w-3.5 text-white" />
              </div>
              Benefits of Going Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {benefitItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ / Trust Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-5 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
            <div className="relative">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Trusted by Thousands
              </h3>
              <p className="text-white/80 text-sm">Join 10,000+ students preparing with NEXTEXAM Premium</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
