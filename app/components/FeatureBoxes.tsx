import Image from 'next/image';

interface FeatureBox {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  minHeight?: string;
}

const featureBoxes: FeatureBox[] = [
  {
    title: "Master Every Technique",
    description: "Stop guessing what good technique looks like. Kumu breaks down every cricket skill into clear, followable phases. You get detailed coaching points for head position, footwork, bat path and balance at every stage of each shot. Whether you're teaching a straight drive or a yorker delivery, our expert breakdowns show you exactly what to coach and when. No more vague advice like \"watch the ball\" or \"follow through.\" Just precise, actionable guidance that turns average players into technically excellent players.",
    imageSrc: "/p1.png",
    imageAlt: "Professional Coaching Logo",
    minHeight: "min-h-[180px]"
  },
  {
    title: "Hundreds of Professional Drills at Your Fingertips",
    description: "Running out of ideas halfway through practice is every coach's nightmare. With hundreds of drills covering batting, bowling and fielding, that problem disappears. Each one comes complete with setup instructions, scoring systems, group rotations and safety notes. You know exactly what equipment you need, how to organise the kids and how to make it harder or easier based on ability. These drills are battle-tested by real coaches in real sessions, not just theory from a textbook. Pull up the app, pick a drill and you're coaching in two minutes.",
    imageSrc: "/p4.png",
    imageAlt: "3D Technology Logo",
    minHeight: "min-h-[180px]"
  },
  {
    title: "Compare Techniques Side by Side",
    description: "Sometimes players need to see what they're doing wrong, not just hear it. Kumu's video comparisons put correct technique next to common mistakes so the difference is crystal clear. Watch a perfect cover drive alongside one with a collapsing front knee. See a good outswinger grip compared to the grip that causes the ball to go straight. These visual comparisons make coaching conversations way easier because players actually understand what you're asking them to change. It's like having a professional coach's eye in your pocket, because sometimes explaining technique isn't enough - players need to see it.",
    imageSrc: "/p3.png",
    imageAlt: "Coaching Resources Logo",
    minHeight: "min-h-[180px]"
  },
  {
    title: "Stop Second-Guessing Your Coaching",
    description: "The worst feeling as a coach is wondering if you're teaching things correctly. Kumu gives you the confidence that comes from having expert knowledge backing every session. You're not making up drills on the spot or relying on half-remembered advice from years ago. Every technique breakdown and drill comes from experienced coaches who've actually developed players at high levels. When a parent asks why you're teaching something a certain way, you've got a proper answer. When a player isn't progressing, you know exactly what to adjust. It's like having a coaching mentor available whenever doubt creeps in.",
    imageSrc: "/p2.png",
    imageAlt: "World Class Expertise Logo",
    minHeight: "min-h-[180px]"
  }
];

export default function FeatureBoxes() {
  return (
    <div 
      className="py-8 sm:py-12 md:py-16 lg:py-20 min-h-screen flex justify-center items-center"
    >
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {featureBoxes.map((box, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br from-orange-500/30 via-orange-600/25 to-orange-700/30 backdrop-blur-xl border border-orange-300/50 rounded-lg ${
                  index === 0 ? 'p-4 sm:p-5 md:p-6 shadow-2xl shadow-orange-500/40' : 'p-3 sm:p-4 md:p-5 shadow-xl shadow-orange-500/30'
                } relative min-h-[200px] sm:min-h-[220px] md:${box.minHeight} hover:bg-gradient-to-br hover:from-orange-500/20 hover:via-orange-600/15 hover:to-orange-700/20 hover:border-orange-300/70 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] hover:backdrop-blur-2xl transition-all duration-500 ease-out gaming-feature-box overflow-hidden group`}
              >
                {/* Gaming-style Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 animate-pulse"></div>
                <h3 className="text-sm sm:text-base md:text-lg font-quartzo-bold text-white mb-2 sm:mb-3 drop-shadow-lg pr-16 sm:pr-20 relative z-10 gaming-text-glow group-hover:scale-105 transition-transform duration-300">
                  {box.title}
                </h3>
                <p className="text-white leading-relaxed text-xs sm:text-sm md:text-base font-quartzo-regular drop-shadow-md pr-12 sm:pr-16 md:pr-20 relative z-10 group-hover:text-orange-100 transition-colors duration-300">
                  {box.description}
                </p>
                {/* Gaming-style Logo at bottom right corner */}
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-4 transform translate-x-1/4 sm:translate-x-1/2 translate-y-1/4 sm:translate-y-1/2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <div className="relative">
                    <Image
                      src={box.imageSrc}
                      alt={box.imageAlt}
                      width={120}
                      height={120}
                      className="object-contain w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] lg:w-[170px] lg:h-[170px] relative z-10"
                    />
                    <div className="absolute inset-0 bg-orange-500/20 blur-lg group-hover:bg-orange-400/30 transition-colors duration-500"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
