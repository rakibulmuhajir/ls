// src/data/animations/core/Renderer.ts
import { Skia, Canvas, Group, Path, Circle, vec, SkPath } from "@shopify/react-native-skia";
import type { PhysicsState, Particle, Bond } from "./types"; // Use 'type' import
import { RenderConfig } from "./RenderConfig";
import { ColorSystem } from "./Colors";


// --- Reusable Skia Functional Components (Friend's Suggestion) ---

interface BondLineProps {
  bond: Bond;
  // Consider passing a unique key if bonds are dynamic and rerendered
}
const BondLine: React.FC<BondLineProps> = React.memo(({ bond }) => {
  if (bond.stability < RenderConfig.Bond.MinVisibleStability) return null;

  const path = Skia.Path.Make();
  path.moveTo(bond.particle1.x, bond.particle1.y);
  path.lineTo(bond.particle2.x, bond.particle2.y);

  return (
    <Path
      path={path}
      style="stroke"
      strokeWidth={Math.max(1, RenderConfig.Bond.StrokeWidthMultiplier * bond.stability)}
      color={bond.color || ColorSystem.getBondColor(bond.type)} // Use bond's own color if defined
      antiAlias // Smooth lines
    />
  );
});

interface ParticleCircleProps {
  particle: Particle;
}
const ParticleCircle: React.FC<ParticleCircleProps> = React.memo(({ particle }) => {
  return (
    <Circle
      cx={particle.x}
      cy={particle.y}
      r={particle.radius}
      color={particle.color} // Color is now set by PhysicsEngine or SceneBuilder
      antiAlias
    />
  );
});

interface ParticleTrailProps {
    particle: Particle;
}
const ParticleTrail: React.FC<ParticleTrailProps> = React.memo(({ particle }) => {
    const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
    if (speed < RenderConfig.Trail.MinSpeedThreshold) return null;

    const path = Skia.Path.Make();
    path.moveTo(particle.x, particle.y);
    // Trail length proportional to velocity and config multiplier
    path.lineTo(
        particle.x - particle.vx * RenderConfig.Trail.LengthMultiplier,
        particle.y - particle.vy * RenderConfig.Trail.LengthMultiplier
    );

    return (
        <Path
            path={path}
            style="stroke"
            strokeWidth={RenderConfig.Trail.StrokeWidth}
            color={`${particle.color}${RenderConfig.Trail.OpacityHex}`}
            antiAlias
        />
    );
});


// Renderer for physics-based animations
export class AnimationRenderer {
  // No longer needs physics engine directly, just the state
  // private physics: PhysicsEngine;

  constructor() {
    // No setup needed if just receiving state
  }

  // Render particles and bonds based on the current physics state
  renderFrame(state: PhysicsState, showTrails: boolean): JSX.Element[] {
    const { particles, bonds } = state;
    const elements: JSX.Element[] = [];

    // Render bonds first (as they are "behind" particles)
    for (const bond of bonds) {
      elements.push(
        <BondLine key={bond.id} bond={bond} />
      );
    }

    // Render particles
    for (const particle of particles) {
      elements.push(
        <ParticleCircle key={particle.id} particle={particle} />
      );
      if (showTrails) {
        elements.push(
            <ParticleTrail key={`trail-${particle.id}`} particle={particle} />
        )
      }
    }
    return elements;
  }

  // renderTrails is now integrated into renderFrame based on a flag
}
