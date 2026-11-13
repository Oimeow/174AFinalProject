// define all global constants in here
// gravitational (?), speed (?), interaction distance (?)
// can have separate constants within this file for space and surface world, should be pretty short of a file anyways
// Scale: a person is 2 units tall.

// ---- Surface world ----

// movement
export const EYE_HEIGHT = 1.85;          // eyes sit just below the top of the head
export const WALK_SPEED = 5;             // units/s (~2.5 body lengths per second ? )
export const MOUSE_SENSITIVITY = 0.002;  // radians of turn per pixel of mouse movement (approx, seems like it works well)

// building generation
export const BUILDING_COUNT = 75;        // buildings per world
export const BUILDING_MIN_WIDTH = 2;     // units (1 person)
export const BUILDING_MAX_WIDTH = 8;     // units (4 people)
export const BUILDING_MIN_HEIGHT = 2;    // units
export const BUILDING_MAX_HEIGHT = 16;   // units (8 people)
