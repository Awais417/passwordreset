interface FooterLink {
  label: string;
  href: string;
  className?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections: FooterSection[];
  copyrightText?: string;
}

export default function Footer({ 
  sections, 
  copyrightText = "© 2024 KUMU. All rights reserved." 
}: FooterProps) {
  return (
    <footer className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-gray-400 font-quartzo-bold mb-3 sm:mb-4 text-sm sm:text-base">{section.title}</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-500">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href} 
                      className={`hover:text-white transition-colors font-quartzo-regular inline-block ${link.className || ''}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-gray-500 text-xs sm:text-sm font-quartzo-regular px-4">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
