import { Headphones, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { useLanguage } from '../../context/language';

const items = [
  {
    icon: Truck,
    titleKey: 'deliveryTitle',
    textKey: 'deliveryText',
  },
  {
    icon: MapPin,
    titleKey: 'location',
    text: 'Bordj Bou Arreridj',
  },
  {
    icon: Headphones,
    titleKey: 'supportClient',
    text: 'Assistance 7j/7',
  },
  {
    icon: ShieldCheck,
    titleKey: 'securePayment',
    textKey: 'securePaymentText',
  },
];

export default function InfoSection() {
  const { t } = useLanguage();

  return (
    <section
      id="info"
      className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:py-12"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const ServiceIcon = item.icon;

          return (
            <div
              key={item.titleKey}
              className="rounded-xl border border-border bg-card p-5 text-center sm:p-6"
            >
              <ServiceIcon className="mx-auto h-10 w-10 text-gold sm:h-12 sm:w-12" />
              <h3 className="mt-4 text-lg font-semibold sm:text-xl">
                {t(item.titleKey)}
              </h3>
              <p className="mt-2 text-sm text-muted sm:text-base">
                {item.textKey ? t(item.textKey) : item.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
