
import React from 'react';
import { useTranslation } from 'react-i18next';

const brands = [
    { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Samsung_wordmark.svg" },
    { name: "Nike", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
    { name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
    { name: "Apple", logo: "/assets/brands/apple.svg" },
    { name: "H&M", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg" },
    { name: "Zara", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg" }
];

const BrandMarquee = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-white py-12 border-y border-gray-100 overflow-hidden">
            <h3 className="text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                {t('home.brands_title')}
            </h3>
            <div className="relative w-full overflow-hidden">
                {/* Mobile / small screens: static grid to avoid overlap */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 px-6 md:hidden">
                    {brands.map((brand, index) => (
                        <div
                            key={`m-${index}`}
                            className="w-full h-12 flex items-center justify-center animate-logo-float will-change-transform"
                            style={{ animationDelay: `${index * 0.2}s` }}
                        >
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="max-h-full max-w-[120px] object-contain brightness-0 opacity-70"
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop: marquee */}
                <div className="hidden md:flex w-[200%] animate-scroll-reverse">
                    {/* First set of 6 logos */}
                    <div className="flex w-1/2 items-center justify-around gap-10 px-6">
                        {brands.map((brand, index) => (
                            <div
                                key={`1-${index}`}
                                className="flex-shrink-0 w-40 md:w-44 h-14 md:h-16 flex items-center justify-center"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="max-h-full max-w-full object-contain brightness-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                    {/* Second set of 6 logos (for seamless loop) */}
                    <div className="flex w-1/2 items-center justify-around gap-10 px-6">
                        {brands.map((brand, index) => (
                            <div
                                key={`2-${index}`}
                                className="flex-shrink-0 w-40 md:w-44 h-14 md:h-16 flex items-center justify-center"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="max-h-full max-w-full object-contain brightness-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-105"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Visual Fades */}
                <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-white to-transparent z-10 hidden md:block"></div>
                <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white to-transparent z-10 hidden md:block"></div>
            </div>
        </div>
    );
};

export default BrandMarquee;
