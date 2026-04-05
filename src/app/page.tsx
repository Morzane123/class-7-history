import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { getSections } from "@/lib/db";

export default async function Home() {
  const sections = await getSections();
  
  return (
    <div className="min-h-screen bg-app-gray">
      <Navigation />
      <div className="flex">
        <Sidebar sections={sections} />
        <main className="flex-1 ml-64 pt-16">
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-semibold text-app-text tracking-tight leading-tight mb-4">
                璧山中学高2027届7班班史
              </h1>
              <p className="text-xl text-gray-600">
                记录班级点滴，珍藏青春记忆
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-lg p-6 shadow-card hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-2xl font-semibold text-app-text mb-2">
                    {section.name}
                  </h3>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-app-black rounded-2xl p-12 text-center">
              <h2 className="text-4xl font-semibold text-white mb-4">
                欢迎来到7班班史馆
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                这里记录着我们共同的青春岁月
              </p>
              <a
                href="/timeline"
                className="inline-block bg-app-blue text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
              >
                开始探索
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
