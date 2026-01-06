import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { ArrowRight, Target, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Home = () => {
  const [heroSlides] = useState([
    {
      id: 1,
      title: 'Enablers for designing people-centered digital transformation',
      subtitle: 'Empowering communities through innovative digital solutions',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=75',
    },
    {
      id: 2,
      title: 'Building Digital Capacity',
      subtitle: 'Transforming organizations for the digital age',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=75',
    },
    {
      id: 3,
      title: 'Innovation for Development',
      subtitle: 'Leveraging AI and technology for sustainable development',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=75',
    },
  ]);


  return (
    <div className="min-h-screen">
      {/* Hero Section with Swiper */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          className="h-full"
          loading="lazy"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div
                className="relative h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-undp-blue opacity-70"></div>
                <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4 sm:px-6">
                  <div className="max-w-4xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">{slide.title}</h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8">{slide.subtitle}</p>
                    <Link to="/initiatives" className="btn-primary inline-flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-4 sm:px-6 min-h-[44px]">
                      <span>Explore Initiatives</span>
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Mission & Purpose Section */}
      <section className="section-container">
        <div className="max-w-4xl mx-auto">
          <div>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <Target className="text-undp-blue" size={28} />
              <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Our Mission</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
              To enable and accelerate people-centered digital transformation across UNDP and partner
              organizations by providing innovative solutions, capacity building, and strategic support.
            </p>
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <Lightbulb className="text-undp-blue" size={28} />
              <h2 className="text-2xl sm:text-3xl font-bold text-undp-blue">Our Purpose</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              We serve as a catalyst for digital innovation, ensuring that technology serves humanity
              and contributes to sustainable development goals. Our approach prioritizes inclusivity,
              accessibility, and ethical use of digital tools.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
