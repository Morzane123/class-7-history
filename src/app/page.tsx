import Navigation from "@/components/Navigation";
import HomeBackground from "@/components/HomeBackground";
import LayoutClient from "@/components/LayoutClient";
import { getSections } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sections = await getSections();
  
  return (
    <div className="min-h-screen bg-[#f5f5f7] relative">
      <HomeBackground />
      <Navigation />
      <div className="flex relative z-10">
        <LayoutClient sections={sections}>
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-16">
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <img 
                  src="/校徽.png" 
                  alt="校徽" 
                  className="w-20 h-20 md:w-24 md:h-24 object-contain mx-auto drop-shadow-lg"
                />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1d1d1f] tracking-tight leading-tight mb-4 drop-shadow-md">
                璧山中学高2027届7班班史
              </h1>
              <p className="text-lg md:text-xl text-[#1d1d1f]/70 max-w-2xl mx-auto">
                记录班级点滴，珍藏青春记忆
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <a
                  href="/timeline"
                  className="backdrop-blur-xl bg-white/40 border border-white/50 text-[#1d1d1f] px-6 py-3 rounded-full font-medium hover:bg-white/60 transition-all shadow-lg"
                >
                  开始探索
                </a>
                <a
                  href="/events/create"
                  className="backdrop-blur-xl bg-[#1d1d1f]/60 border border-white/30 text-white px-6 py-3 rounded-full font-medium hover:bg-[#1d1d1f]/80 transition-all shadow-lg"
                >
                  记录新事件
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`/timeline?section=${section.id}`}
                  className="group backdrop-blur-xl bg-white/40 border border-white/50 rounded-2xl p-6 md:p-8 shadow-lg hover:bg-white/60 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#2997ff] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <span className="text-white text-xl font-semibold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[#1d1d1f] mb-2">
                    {section.name}
                  </h3>
                  <p className="text-[#1d1d1f]/70">{section.description}</p>
                </a>
              ))}
            </div>

            <div className="backdrop-blur-xl bg-[#1d1d1f]/60 border border-white/20 rounded-3xl p-8 md:p-12 text-center shadow-xl">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                欢迎来到7班班史馆
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                这里记录着我们共同的青春岁月，每一段故事都值得被铭记
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/timeline"
                  className="backdrop-blur-md bg-white/90 text-[#1d1d1f] px-6 py-3 rounded-full font-medium hover:bg-white transition-colors shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  浏览时间线
                </a>
                <a
                  href="/search"
                  className="backdrop-blur-md border border-white/40 text-white px-6 py-3 rounded-full font-medium hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  搜索事件
                </a>
              </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-[#1d1d1f]/60 text-sm backdrop-blur-sm bg-white/30 inline-block px-4 py-2 rounded-full">
                由 <span className="text-[#0071e3] font-medium">北域工作室</span> 开发维护
              </p>
            </div>
          </div>
        </LayoutClient>
      </div>
    </div>
  );
}
