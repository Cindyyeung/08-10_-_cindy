const fs = require('fs');
let code = fs.readFileSync('src/components/AnimatedPlant.tsx', 'utf-8');

const replacement = `
                {/* 3 STEMS */}
                <path d="M100,180 Q98,125 100,70" stroke="#5e8c5d" strokeWidth="6" strokeLinecap="round" />
                {/* Left side stem */}
                <path d="M99,135 Q65,115 55,80" stroke="#5e8c5d" strokeWidth="4.5" strokeLinecap="round" />
                {/* Right side stem */}
                <path d="M101,145 Q135,125 145,90" stroke="#5e8c5d" strokeWidth="4.5" strokeLinecap="round" />

                {/* STAGGERED LEAVES */}
                <path d="M100,165 Q60,165 55,135 Q85,145 100,165 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M100,150 Q145,140 140,115 Q115,135 100,150 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M99,115 Q65,110 70,90 Q90,105 99,115 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                <path d="M100,105 Q135,95 130,75 Q115,90 100,105 Z" fill={leavesColor} stroke="#3b5c3c" strokeWidth="0.8" />
                
                {/* LEFT SIDE FLOWER (Side perspective) */}
                <g transform="translate(55, 78) rotate(-45) scale(0.85)">
                  <circle cx="0" cy="-10" r="22" fill="#f3e5f5" opacity="0.45" filter="blur(4px)" />
                  {/* Side petals layer 1 */}
                  {[ -45, -20, 0, 20, 45 ].map((angle, i) => (
                    <g key={\`side-l-p1-\${i}\`} transform={\`rotate(\${angle})\`}>
                      <path d="M 0,0 C -8,-10 -12,-25 -2,-28 C 3,-29 10,-20 0,0 Z" fill="url(#lavenderBackGrad)" stroke="#9c27b0" strokeWidth="0.7" opacity="0.9" />
                    </g>
                  ))}
                  {/* Side petals layer 2 */}
                  {[ -30, -10, 10, 30 ].map((angle, i) => (
                    <g key={\`side-l-p2-\${i}\`} transform={\`rotate(\${angle})\`}>
                      <path d="M 0,0 C -6,-10 -10,-26 -2,-30 C 2,-31 8,-22 0,0 Z" fill="url(#lavenderFrontGrad)" stroke="#ba68c8" strokeWidth="0.8" />
                      <path d="M 0,0 Q 0,-15 1,-25" fill="none" stroke="#ab47bc" strokeWidth="0.7" opacity="0.65" />
                    </g>
                  ))}
                  {/* Side petals inner */}
                  {[ -15, 0, 15 ].map((angle, i) => (
                    <g key={\`side-l-in-\${i}\`} transform={\`rotate(\${angle})\`}>
                      <path d="M 0,0 C -5,-8 -8,-18 -1,-22 C 2,-24 6,-15 0,0 Z" fill="#f3e5f5" stroke="#ce93d8" strokeWidth="0.7" />
                    </g>
                  ))}
                  {/* Side Stamen */}
                  <g transform="translate(0, -5)">
                    {[ -20, 0, 20 ].map((angle, i) => (
                      <g key={\`side-l-stamen-\${i}\`} transform={\`rotate(\${angle})\`}>
                        <line x1="0" y1="0" x2="0" y2="-6" stroke="#fbc02d" strokeWidth="0.8" />
                        <circle cx="0" cy="-6" r="1.1" fill="#f57f17" />
                      </g>
                    ))}
                  </g>
                  {/* Receptacle / Sepal (The green cup holding the petals) */}
                  <path d="M -10,2 Q -12,12 0,16 Q 12,12 10,2 Z" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.9" />
                  <path d="M -10,2 Q 0,8 10,2 Q 0,-2 -10,2 Z" fill="#4a704b" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M -6,14 L -6,22 M 0,16 L 0,25 M 6,14 L 6,21" stroke="#5a8a58" strokeWidth="1.5" strokeLinecap="round" />
                </g>

                {/* RIGHT SIDE FLOWER (Side perspective) */}
                <g transform="translate(145, 88) rotate(45) scale(0.85)">
                  <circle cx="0" cy="-10" r="22" fill="#f3e5f5" opacity="0.45" filter="blur(4px)" />
                  {/* Side petals layer 1 */}
                  {[ -45, -20, 0, 20, 45 ].map((angle, i) => (
                    <g key={\`side-r-p1-\${i}\`} transform={\`rotate(\${angle})\`}>
                      <path d="M 0,0 C -8,-10 -12,-25 -2,-28 C 3,-29 10,-20 0,0 Z" fill="url(#lavenderBackGrad)" stroke="#9c27b0" strokeWidth="0.7" opacity="0.9" />
                    </g>
                  ))}
                  {/* Side petals layer 2 */}
                  {[ -30, -10, 10, 30 ].map((angle, i) => (
                    <g key={\`side-r-p2-\${i}\`} transform={\`rotate(\${angle})\`}>
                      <path d="M 0,0 C -6,-10 -10,-26 -2,-30 C 2,-31 8,-22 0,0 Z" fill="url(#lavenderFrontGrad)" stroke="#ba68c8" strokeWidth="0.8" />
                      <path d="M 0,0 Q 0,-15 1,-25" fill="none" stroke="#ab47bc" strokeWidth="0.7" opacity="0.65" />
                    </g>
                  ))}
                  {/* Side petals inner */}
                  {[ -15, 0, 15 ].map((angle, i) => (
                    <g key={\`side-r-in-\${i}\`} transform={\`rotate(\${angle})\`}>
                      <path d="M 0,0 C -5,-8 -8,-18 -1,-22 C 2,-24 6,-15 0,0 Z" fill="#f3e5f5" stroke="#ce93d8" strokeWidth="0.7" />
                    </g>
                  ))}
                  {/* Side Stamen */}
                  <g transform="translate(0, -5)">
                    {[ -20, 0, 20 ].map((angle, i) => (
                      <g key={\`side-r-stamen-\${i}\`} transform={\`rotate(\${angle})\`}>
                        <line x1="0" y1="0" x2="0" y2="-6" stroke="#fbc02d" strokeWidth="0.8" />
                        <circle cx="0" cy="-6" r="1.1" fill="#f57f17" />
                      </g>
                    ))}
                  </g>
                  {/* Receptacle / Sepal (The green cup holding the petals) */}
                  <path d="M -10,2 Q -12,12 0,16 Q 12,12 10,2 Z" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.9" />
                  <path d="M -10,2 Q 0,8 10,2 Q 0,-2 -10,2 Z" fill="#4a704b" stroke="#3b5c3c" strokeWidth="0.8" />
                  <path d="M -6,14 L -6,22 M 0,16 L 0,25 M 6,14 L 6,21" stroke="#5a8a58" strokeWidth="1.5" strokeLinecap="round" />
                </g>

                {/* MAIN CENTER FLOWER (Front view, full bloom) */}
                <g transform="translate(100, 58) scale(1)">
                  {/* Soft Watercolor Halo */}
                  <circle cx="0" cy="0" r="28" fill="#f3e5f5" opacity="0.45" filter="blur(4px)" />

                  {/* Sepal Base */}
                  <path d="M-6,14 Q0,18 6,14 Q4,6 0,2 Q-4,6 -6,14 Z" fill="#5a8a58" stroke="#3b5c3c" strokeWidth="0.8" />

                  {/* LAYER 1: BACK PETALS */}
                  {[
                    { r: 18, scaleX: 1, scaleY: 1 },
                    { r: 90, scaleX: 0.95, scaleY: 1.05 },
                    { r: 162, scaleX: 1.02, scaleY: 0.96 },
                    { r: 234, scaleX: 0.98, scaleY: 1.02 },
                    { r: 306, scaleX: 1.05, scaleY: 0.97 }
                  ].map((p, i) => (
                    <g key={\`lavender-back-center-\${i}\`} transform={\`rotate(\${p.r}) scale(\${p.scaleX}, \${p.scaleY})\`}>
                      <path
                        d="M 0,0 C -13,-9 -18,-24 -5,-29 C 2,-32 16,-22 0,0 Z"
                        fill="url(#lavenderBackGrad)"
                        stroke="#9c27b0"
                        strokeWidth="0.7"
                        opacity="0.9"
                      />
                    </g>
                  ))}

                  {/* LAYER 2: FRONT MAIN PETALS */}
                  {[
                    { r: 0, scaleX: 1, scaleY: 1.02 },
                    { r: 72, scaleX: 0.97, scaleY: 0.98 },
                    { r: 144, scaleX: 1.03, scaleY: 1 },
                    { r: 216, scaleX: 0.96, scaleY: 1.04 },
                    { r: 288, scaleX: 1.01, scaleY: 0.96 }
                  ].map((p, i) => (
                    <g key={\`lavender-front-center-\${i}\`} transform={\`rotate(\${p.r}) scale(\${p.scaleX}, \${p.scaleY})\`}>
                      <path
                        d="M 0,0 C -12,-10 -16,-26 -3,-30 C 1,-31 5,-29 8,-28 C 18,-20 12,-10 0,0 Z"
                        fill="url(#lavenderFrontGrad)"
                        stroke="#ba68c8"
                        strokeWidth="0.8"
                      />
                      <path
                        d="M 0,0 Q 0,-15 2,-25"
                        fill="none"
                        stroke="#ab47bc"
                        strokeWidth="0.7"
                        opacity="0.65"
                      />
                    </g>
                  ))}

                  {/* LAYER 3: INNER PETAL FOLDS */}
                  {[
                    { r: 36, scale: 0.72 },
                    { r: 108, scale: 0.68 },
                    { r: 180, scale: 0.74 },
                    { r: 252, scale: 0.70 }
                  ].map((p, i) => (
                    <g key={\`lavender-inner-center-\${i}\`} transform={\`rotate(\${p.r}) scale(\${p.scale})\`}>
                      <path
                        d="M 0,0 C -9,-8 -12,-18 -2,-22 C 3,-24 12,-15 0,0 Z"
                        fill="#f3e5f5"
                        stroke="#ce93d8"
                        strokeWidth="0.7"
                      />
                    </g>
                  ))}

                  {/* LAYER 4: STAMEN & CORE */}
                  <circle cx="0" cy="0" r="8" fill="#fff9c4" stroke="#fbc02d" strokeWidth="0.9" />
                  <circle cx="0" cy="0" r="5" fill="#fff176" opacity="0.85" />
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <g key={\`stamen-center-\${i}\`} transform={\`rotate(\${angle})\`}>
                      <line x1="0" y1="0" x2="0" y2="-4.8" stroke="#fbc02d" strokeWidth="0.8" />
                      <circle cx="0" cy="-4.8" r="1.1" fill="#f57f17" />
                    </g>
                  ))}
                  <circle cx="-1.5" cy="-1.5" r="2.5" fill="#ffffff" opacity="0.75" />
                </g>
`;

// Extract the part to replace
let startString = "{/* 3 STEMS */}";
let endString = "              </motion.g>";
let startIndex = code.indexOf(startString);
let endIndex = code.indexOf(endString, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  let newCode = code.slice(0, startIndex) + replacement.trim() + "\n" + code.slice(endIndex);
  fs.writeFileSync('src/components/AnimatedPlant.tsx', newCode);
  console.log('Successfully patched AnimatedPlant.tsx');
} else {
  console.log('Failed to find markers.');
}
