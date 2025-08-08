export const muscleGroupOptions = [
  { value: 'all', label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'back', label: 'Back' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'legs', label: 'Legs' },
  { value: 'abdominals', label: 'Abdominals' },
  { value: 'cardio', label: 'Cardio' },
];

export const muscleSubgroupOptions = {
  chest: [
    { value: 'all', label: 'All' },
    { value: 'chest', label: 'chest' },
    {
      value: 'upper chest (clavicular pectoralis)',
      label: 'upper chest (clavicular pectoralis)',
    },
    {
      value: 'middle chest (sternal pectoralis)',
      label: 'middle chest (sternal pectoralis)',
    },
    {
      value: 'lower chest (costal pectoralis)',
      label: 'lower chest (costal pectoralis)',
    },
    { value: 'inner chest', label: 'inner chest' },
    { value: 'outer chest', label: 'outer chest' },
  ],
  shoulders: [
    { value: 'shoulders', label: 'shoulders' },
    {
      value: 'front deltoid (anterior deltoid)',
      label: 'front deltoid (anterior deltoid)',
    },
    {
      value: 'side deltoid (lateral deltoid)',
      label: 'side deltoid (lateral deltoid)',
    },
    {
      value: 'rear deltoid (posterior deltoid)',
      label: 'rear deltoid (posterior deltoid)',
    },
  ],
  back: [
    { value: 'back', label: 'back' },
    {
      value: 'upper back (trapezius & rhomboids)',
      label: 'upper back (trapezius & rhomboids)',
    },
    { value: 'lats (latissimus dorsi)', label: 'lats (latissimus dorsi)' },
    {
      value: 'middle back (lats, rhomboids & traps)',
      label: 'middle back (lats, rhomboids & traps)',
    },
    {
      value: 'lower back (erector spinae)',
      label: 'lower back (erector spinae)',
    },
  ],
  biceps: [
    { value: 'biceps', label: 'biceps' },
    { value: 'biceps brachii', label: 'biceps brachii' },
    {
      value: 'biceps brachii long head (outer biceps)',
      label: 'biceps brachii long head (outer biceps)',
    },
    {
      value: 'biceps brachii short head (inner biceps)',
      label: 'biceps brachii short head (inner biceps)',
    },
    {
      value: 'brachialis (underneath biceps)',
      label: 'brachialis (underneath biceps)',
    },
  ],
  triceps: [
    { value: 'triceps', label: 'triceps' },
    { value: 'triceps brachii', label: 'triceps brachii' },
    { value: 'long head (inner triceps)', label: 'long head (inner triceps)' },
    {
      value: 'lateral head (outer triceps)',
      label: 'lateral head (outer triceps)',
    },
    {
      value: 'medial head (middle triceps)',
      label: 'medial head (middle triceps)',
    },
  ],
  forearms: [
    { value: 'forearms', label: 'forearms' },
    { value: 'forearm flexors', label: 'forearm flexors' },
    { value: 'forearm extensors', label: 'forearm extensors' },
    { value: 'forearm pronators', label: 'forearm pronators' },
    { value: 'forearm supinators', label: 'forearm supinators' },
    { value: 'forearm brachioradialis', label: 'forearm brachioradialis' },
  ],
  legs: [
    { value: 'legs', label: 'legs' },
    { value: 'quadriceps (front thighs)', label: 'quadriceps (front thighs)' },
    { value: 'hamstrings (back thighs)', label: 'hamstrings (back thighs)' },
    { value: 'glutes (buttocks)', label: 'glutes (buttocks)' },
    { value: 'adductors (inner thighs)', label: 'adductors (inner thighs)' },
    { value: 'abductors (outer thighs)', label: 'abductors (outer thighs)' },
    { value: 'calves', label: 'calves' },
  ],
  abdominals: [
    { value: 'abdominals', label: 'abdominals' },
    { value: 'upper abs', label: 'upper abs' },
    { value: 'lower abs', label: 'lower abs' },
    { value: 'obliques (sides)', label: 'obliques (sides)' },
    {
      value: 'transverse abdominis (deep core)',
      label: 'transverse abdominis (deep core)',
    },
  ],
  cardio: [{ value: 'cardio', label: 'cardio' }],
};

export const equipmentOptions = [
  { value: 'all', label: 'All' },
  { value: 'machine', label: 'Machine' },
  { value: 'cable', label: 'Cable' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'ez-bar', label: 'EZ-Bar' },
  { value: 'v-bar', label: 'V-Bar' },
  { value: 't-bar', label: 'T-Bar' },
  { value: 'trap-bar', label: 'Trap-Bar' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'plates', label: 'Plates' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'rope', label: 'Rope' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'bands', label: 'Bands' },
  { value: 'none', label: 'None' },
];

export const routineTypeOptions = [
  { value: 'full body', label: 'Full Body' },
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'chest', label: 'Chest' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'back', label: 'Back' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'abdominals', label: 'Abdominals' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'chest & shoulders', label: 'Chest & Shoulders' },
  { value: 'chest & triceps', label: 'Chest & Triceps' },
  { value: 'chest & biceps', label: 'Chest & Biceps' },
  { value: 'back & shoulders', label: 'Back & Shoulders' },
  { value: 'back & biceps', label: 'Back & Biceps' },
  { value: 'back & triceps', label: 'Back & Triceps' },
  { value: 'legs & abs', label: 'Legs & Abs' },
  { value: 'shoulders & biceps', label: 'Shoulders & Biceps' },
  { value: 'shoulders & triceps', label: 'Shoulders & Triceps' },
  { value: 'shoulders & arms', label: 'Shoulders & Arms' },
  { value: 'legs & shoulders', label: 'Legs & Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'forearms', label: 'Forearms' },
  { value: 'rest', label: 'Rest' },
];
export const repsOptions = [
  { value: '8-12', label: '8-12' },
  { value: '10-12', label: '10-12' },
  { value: '12-15', label: '12-15' },
  { value: '15-20', label: '15-20' },
  { value: '20-25', label: '20-25' },
];
export const weightUnitOptions = [
  { label: 'kg', value: 'kg' },
  { label: 'plates', value: 'plates' },
];

export const weightUnitToggleOptions = [
  { label: 'plates', value: 'plates', icon: 'plates' as const },
  { label: 'kg', value: 'kg', icon: 'kg' as const },
];
