// In animationRegistry.ts or a new file like 'chemistryCoreConcepts.ts'
export const chemistryCoreConcepts: AnimationConfig = {
  height: 400, // Good height for visibility of details
  autoPlay: true,
  loop: false, // It's a narrative animation, so likely no loop or a very long one
  backgroundColor: '#1f2937', // A dark, neutral background (e.g., dark slate gray)
  features: {
    temperature: true,    // For Scene 2 (Properties/Phase Changes) & Scene 5
    zoom: true,           // Generally useful for all scenes
    speed: true,          // For controlling animation rates in all scenes
    beforeAfter: true,    // For Scene 5 (Chemical Change)
    rotation3D: true,     // For Scene 3, 4, 6 (Composition, Structure, Conclusion)
    particleCount: true,  // For Scene 2 (Properties) & Scene 3 (Composition)
    // pressure: false,   // Less critical for this core overview
    // concentration: false // Less critical for this core overview
  },
  html: `<!-- HTML structure will be baseAnimationTemplate + specific script -->`
};
