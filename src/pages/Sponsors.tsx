import React, { Fragment } from "react";
import Navigation from "../components/shared/Navigation";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Props = {};

const Sponsors = (props: Props) => {
  const { t } = useTranslation();
  return (
    <Fragment>
      <Navigation />
      <section className="container py-8 rounded-lg overflow-hidden shadow-table border border-tableBorder my-8">
        <h1 className="text-brand-primary md:text-[36px] text-2xl font-primary font-semibold capitalize">
          {t("sponsors")}
        </h1>
        <div className="w-full md:mt-8 mt-6 relative">
          <Swiper
            // loop={true}
            // autoplay={{
            //   delay: 2500,
            //   disableOnInteraction: false,
            // }}
            pagination={{
              dynamicBullets: true,
            }}
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={8}
            preventClicks={false}
            preventClicksPropagation={false}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 8,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 8,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
          >
            <SwiperSlide className="w-full mb-12">
              <div className="w-full border border-gray-300 rounded-md overflow-hidden">
                <img
                  src="/gehinfu__hrung_ohnemail.png"
                  alt="img"
                  className="w-full object-fill md:h-[340px] h-[280px]"
                />
                <div className="p-4">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://markus-grundke.de/"
                    className="font-medium bg-brand-primary border w-full rounded-md border-[#C6C4D5] active:animate-jerk text-white px-4 h-[40px] font-primary md:text-base text-sm hover:bg-brand-primary/90 flex justify-center items-center gap-2"
                  >
                    markus-grundke.de
                  </a>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className="w-full mb-12">
              <div className="w-full border border-gray-300 rounded-md overflow-hidden">
                <img
                  src="/solar.jpg"
                  alt="img"
                  className="w-full object-fill md:h-[340px] h-[280px]"
                />
                <div className="p-4">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://sunpark.es/"
                    className="font-medium bg-brand-primary border w-full rounded-md border-[#C6C4D5] active:animate-jerk text-white px-4 h-[40px] font-primary md:text-base text-sm hover:bg-brand-primary/90 flex justify-center items-center gap-2"
                  >
                    sunpark.es
                  </a>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className="w-full mb-12">
              <div className="w-full border border-gray-300 rounded-md overflow-hidden">
                <img
                  src="https://t3.ftcdn.net/jpg/01/33/11/82/360_F_133118206_F5rTukTo2n6vCeUoQ4jC3B5NT72g6LHC.jpg"
                  alt="img"
                  className="w-full object-fill md:h-[340px] h-[280px]"
                />
                <div className="p-4">
                  <a
                    href="mailto:service.tb10@gmail.com?subject=Sponsorship Inquiry&body=Hello,%0D%0A%0D%0AI am interested in becoming a sponsor. Please provide more details.%0D%0A%0D%0AYou can contact me at:%0D%0AEmail: %0D%0APhone: "
                    className="font-medium bg-brand-primary border w-full rounded-md border-[#C6C4D5] active:animate-jerk text-white px-4 h-[40px] font-primary md:text-base text-sm hover:bg-brand-primary/90 flex justify-center items-center gap-2"
                  >
                    {t("i like to become a sponsor")}
                  </a>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide className="w-full mb-12">
              <div className="w-full border border-gray-300 rounded-md overflow-hidden">
                <img
                  src="https://t3.ftcdn.net/jpg/01/33/11/82/360_F_133118206_F5rTukTo2n6vCeUoQ4jC3B5NT72g6LHC.jpg"
                  alt="img"
                  className="w-full object-fill md:h-[340px] h-[280px]"
                />
                <div className="p-4">
                  <a
                    href="mailto:service.tb10@gmail.com?subject=Sponsorship Inquiry&body=Hello,%0D%0A%0D%0AI am interested in becoming a sponsor. Please provide more details.%0D%0A%0D%0AYou can contact me at:%0D%0AEmail: %0D%0APhone: "
                    className="font-medium bg-brand-primary border w-full rounded-md border-[#C6C4D5] active:animate-jerk text-white px-4 h-[40px] font-primary md:text-base text-sm hover:bg-brand-primary/90 flex justify-center items-center gap-2"
                  >
                    {t("i like to become a sponsor")}
                  </a>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>
    </Fragment>
  );
};

export default Sponsors;
