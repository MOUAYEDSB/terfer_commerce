
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, ShieldCheck, Headphones, CreditCard } from 'lucide-react';

const BenefitsSection = () => {
    const { t } = useTranslation();

    const benefits = [
        {
            icon: <Truck size={32} />,
            title: t('home.benefits.delivery_title'),
            description: t('home.benefits.delivery_desc')
        },
        {
            icon: <ShieldCheck size={32} />,
            title: t('home.benefits.quality_title'),
            description: t('home.benefits.quality_desc')
        },
        {
            icon: <CreditCard size={32} />,
            title: t('home.benefits.payment_title'),
            description: t('home.benefits.payment_desc')
        },
        {
            icon: <Headphones size={32} />,
            title: t('home.benefits.service_title'),
            description: t('home.benefits.service_desc')
        }
    ];

    return (
        <section className="py-16 bg-gray-50 border-y border-gray-200">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                            <div className="text-primary mb-4 p-3 bg-primary/10 rounded-full">
                                {benefit.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{benefit.title}</h3>
                            <p className="text-gray-600 text-sm">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
