export const baseStyles = `
<style>
  /* Base animation container */
  .chemistry-animation {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Atom styles */
  .atom {
    position: absolute;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(255,255,255,0.3);
  }

  .atom:hover {
    transform: scale(1.1);
    z-index: 10;
  }

  /* Bond styles */
  .bond {
    position: absolute;
    background: #4ecdc4;
    transform-origin: left center;
    transition: all 0.5s ease;
  }

  .bond-single { height: 3px; }
  .bond-double { height: 6px; box-shadow: 0 3px 0 #4ecdc4; }
  .bond-triple { height: 9px; box-shadow: 0 3px 0 #4ecdc4, 0 6px 0 #4ecdc4; }
  .bond-ionic {
    height: 3px;
    background: repeating-linear-gradient(
      90deg,
      #4ecdc4 0,
      #4ecdc4 5px,
      transparent 5px,
      transparent 10px
    );
  }

  /* Include other shared styles... */
</style>
`;
