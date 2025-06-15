# Task-Based Development Roadmap: Unified Lab Simulation System

## Vision Statement
To create a high-fidelity, interactive chemistry lab simulator for 9th grade education using incremental, testable development approach.

---

## ✅ COMPLETED TASKS

### Foundation
- [x] **Materials Data Structure** - `materials.ts` with comprehensive material properties
- [x] **ParticleFactory System** - Realistic 2D particle creation with state-specific behavior
- [x] **Basic Architecture** - PhysicsEngine, AnimationProvider, core types

---

## 🚧 PHASE 1: ParticleFactory Integration & Testing

### Task 1.1: Basic ParticleFactory Integration ⏳
**Goal:** Get ParticleFactory working with existing AnimationProvider
**Test:** See realistic particles arranged by state when changing materials

**Steps:**
1. **Add ParticleFactory import to AnimationProvider.tsx**
   ```typescript
   import { ParticleFactory } from '../core/ParticleFactory';
   ```

2. **Replace engine.addParticles() calls with ParticleFactory**
   - In AnimationProvider initialization useEffect
   - In PhysicsEngine.setSubstance() method

3. **Test Command:** Run existing physics test screen
   - Should see particles arranged in grid (solid), clustered at bottom (liquid), or spread out (gas)
   - Change substance and verify particles recreate correctly

**Definition of Done:** Particles visually behave differently for solid/liquid/gas states

---

### Task 1.2: State Transition Testing ⏳
**Goal:** Smooth transitions between states when heating/cooling
**Test:** Heat water from ice → liquid → vapor with smooth particle transitions

**Steps:**
1. **Add temperature change handler to AnimationProvider**
   ```typescript
   const handleTemperatureChange = useCallback((newTemp: number) => {
     const newState = ParticleFactory.determineState(substanceKey, newTemp);
     if (newState !== currentState) {
       const updatedParticles = ParticleFactory.updateParticlesForNewState(
         particles, newState, newTemp, width, height
       );
       engineRef.current.particles = updatedParticles;
     }
     setParams({ temperature: newTemp });
   }, [particles, substanceKey, width, height]);
   ```

2. **Test Command:** Use temperature slider in test screen
   - Ice (< 0°C): Particles form grid pattern
   - Water (0-100°C): Particles cluster at bottom
   - Steam (> 100°C): Particles spread throughout with upward burst

**Definition of Done:** Smooth visual transitions between all three states

---

### Task 1.3: Multiple Material Testing ⏳
**Goal:** Verify ParticleFactory works with different materials
**Test:** Switch between H2O, C2H5OH, CuSO4 and see different properties

**Steps:**
1. **Add material selector to test screen**
2. **Test each material's:**
   - Color (from materials.ts)
   - State transition temperatures
   - Particle size/mass differences

**Definition of Done:** Each material shows distinct visual properties

---

## 🎯 PHASE 2: Atomic View Component

### Task 2.1: Create Basic AtomicView Component ⏳
**Goal:** Dedicated component for particle visualization
**Test:** Same particles render in new component

**Steps:**
1. **Create AtomicView.tsx**
   ```typescript
   export const AtomicView = ({ width, height }) => {
     const { particles } = useAnimation();
     return (
       <Canvas style={{ width, height }}>
         {particles.map(particle => (
           <Circle
             key={particle.id}
             cx={particle.x}
             cy={particle.y}
             r={particle.radius}
             color={particle.color}
           />
         ))}
       </Canvas>
     );
   };
   ```

2. **Test Command:** Replace current particle rendering with AtomicView
   - Should see identical particle behavior

**Definition of Done:** AtomicView renders particles identically to current system

---

### Task 2.2: Add Particle Interaction ⏳
**Goal:** Drag individual particles
**Test:** Touch and drag particles, they should move and physics should respond

**Steps:**
1. **Add GestureDetector to AtomicView**
2. **Connect to useAnimation drag handlers**
3. **Test:** Drag particles and verify they respond to physics

**Definition of Done:** Can drag particles and they interact with physics engine

---

### Task 2.3: Add Educational Overlays ⏳
**Goal:** Show molecular information
**Test:** Toggle to show chemical formulas next to particles

**Steps:**
1. **Add formula display toggle**
2. **Show H₂O, NaCl labels near particle groups**

**Definition of Done:** Students can see molecular formulas when needed

---

## 🔬 PHASE 3: Basic MacroView Component

### Task 3.1: Create Simple BeakerView ⏳
**Goal:** Show macroscopic container with state-based contents
**Test:** Beaker shows ice cube, liquid water, or steam cloud based on particle state

**Steps:**
1. **Create MacroView.tsx with basic beaker SVG**
2. **Add state-based content rendering:**
   ```typescript
   const renderContents = () => {
     switch (currentState) {
       case 'solid': return <IceCubes />;
       case 'liquid': return <LiquidWater level={liquidLevel} />;
       case 'gas': return <SteamClouds />;
     }
   };
   ```

3. **Test Command:** Switch between states and verify beaker contents change

**Definition of Done:** Beaker visually shows correct state representation

---

### Task 3.2: Add Basic Equipment ⏳
**Goal:** Interactive Bunsen burner
**Test:** Click burner to increase temperature, see particles and macro view respond

**Steps:**
1. **Add BunsenBurner component with on/off toggle**
2. **Connect to temperature control**
3. **Test:** Burner heating should cause ice → water → steam transition in both views

**Definition of Done:** Burner controls work and affect both atomic and macro views

---

### Task 3.3: View Switcher ⏳
**Goal:** Toggle between atomic and macro views
**Test:** Switch views while heating water, both should stay synchronized

**Steps:**
1. **Add toggle button**
2. **Ensure both views use same physics state**
3. **Test:** State changes in one view appear in the other

**Definition of Done:** Both views stay perfectly synchronized

---

## 🧪 PHASE 4: Simple Experiments

### Task 4.1: Water Heating Experiment ⏳
**Goal:** Complete ice → water → steam experiment
**Test:** Educational scenario with instructions and observations

**Steps:**
1. **Create WaterHeatingExperiment component**
2. **Add step-by-step instructions**
3. **Track observations (temperature, state changes)**

**Definition of Done:** Students can complete guided water heating experiment

---

### Task 4.2: Salt Dissolution ⏳
**Goal:** Simple mixing experiment
**Test:** Add salt to water, see particles disperse

**Steps:**
1. **Add salt material to materials.ts**
2. **Implement basic particle mixing**
3. **Show dissolution in both views**

**Definition of Done:** Salt dissolving animation works in both views

---

### Task 4.3: Exam Mode ⏳
**Goal:** Assessment-friendly mode
**Test:** Disable interactive features, enable answer checking

**Steps:**
1. **Add exam mode toggle**
2. **Disable drag-and-drop in exam mode**
3. **Add simple answer validation**

**Definition of Done:** Exam mode restricts student interactions appropriately

---

## 📋 TESTING STRATEGY

### After Each Task:
1. **Functionality Test:** Core feature works as described
2. **Visual Test:** Changes are visible and clear
3. **Integration Test:** New code doesn't break existing features
4. **Performance Test:** No significant slowdown
5. **Error Test:** Graceful handling of edge cases

### Debug Protocol:
1. **Isolate:** Test new component separately first
2. **Integrate:** Add to existing system gradually
3. **Fallback:** Keep previous working version as backup
4. **Log:** Add console.logs for state tracking during development

---

## 🎯 CURRENT PRIORITY

**START WITH:** Task 1.1 - ParticleFactory Integration
- Most immediate value
- Builds on completed ParticleFactory
- Easy to test and verify
- Foundation for everything else

**Success Metric:** Can switch between materials and see different particle arrangements for solid/liquid/gas states.

---

## 📝 COMPLETION TRACKING

**How to mark complete:**
- [ ] ⏳ In Progress
- [x] ✅ Complete & Tested
- [❌] Blocked (needs dependency)
- [🔄] Needs Revision

**Next Task:** Begin Task 1.1 - ParticleFactory Integration
