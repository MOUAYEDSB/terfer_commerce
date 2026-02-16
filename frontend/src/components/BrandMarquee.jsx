
import React from 'react';
import { useTranslation } from 'react-i18next';

const brands = [
    { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Samsung_wordmark.svg/512px-Samsung_wordmark.svg.png" },
    { name: "Nike", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/512px-Logo_NIKE.svg.png" },
    { name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/512px-Adidas_Logo.svg.png" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png" },
    { name: "HM", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/512px-H%26M-Logo.svg.png" },
    { name: "Zara", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/512px-Zara_Logo.svg.png" }
];

const BrandMarquee = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-white py-12 border-y border-gray-100 overflow-hidden">
            <h3 className="text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                {t('home.brands_title')}
            </h3>
            <div className="relative w-full overflow-hidden">
                <div className="flex w-[200%] animate-scroll-reverse">
                    {/* First set of 6 logos */}
                    <div className="flex w-1/2 justify-around items-center px-4">
                        {brands.map((brand, index) => (
                            <div key={`1-${index}`} className="flex-shrink-0 mx-10">
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className={`${brand.name === 'Samsung' ? 'h-5 md:h-7' : 'h-10 md:h-14'} w-auto object-contain brightness-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110`}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Second set of 6 logos (for seamless loop) */}
                    <div className="flex w-1/2 justify-around items-center px-4">
                        {brands.map((brand, index) => (
                            <div key={`2-${index}`} className="flex-shrink-0 mx-10">
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className={`${brand.name === 'Samsung' ? 'h-5 md:h-7' : 'h-10 md:h-14'} w-auto object-contain brightness-0 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Visual Fades */}
                <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
                <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
            </div>
        </div>
    );
};

export default BrandMarquee;
