/**
 * FeaturesGrid Component
 *
 * Displays a grid of 3 feature cards highlighting the key benefits:
 * - Lightning Fast: Speed and efficiency
 * - Secure: Data security and encryption
 * - Easy to Use: No installation required
 *
 * Responsive: 1 column on mobile, 3 columns on desktop
 */

import { Zap, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Zap,
    title: 'Bliksem Snel',
    description: '70% sneller dan handmatige verwerking. Krijg je resultaten binnen enkele seconden.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Shield,
    title: 'Veilig',
    description: 'Je data is veilig en versleuteld. We respecteren je privacy en beveiliging.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: Sparkles,
    title: 'Makkelijk te Gebruiken',
    description: 'Geen installatie vereist. Werkt direct in je browser op elk apparaat.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <Card
            key={feature.title}
            className="border-2 hover:border-gray-300 transition-all duration-200 hover:shadow-lg"
          >
            <CardHeader className="text-center">
              <div
                className={`w-12 h-12 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <Icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
