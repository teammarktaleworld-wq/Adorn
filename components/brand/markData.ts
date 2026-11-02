// The Adorn jewel, redrawn as vectors from the brand logo (viewBox 0 0 740 552).
// One description feeds both the SVG logo and the extruded 3D jewel.
export type Cmd = ['M' | 'L', number, number] | ['C', number, number, number, number, number, number] | ['Z'];

export const MARK_SIZE = { width: 740, height: 552 } as const;

export const markPieces = {
  top: [['M', 194, 2], ['L', 580, 2], ['L', 600, 93], ['C', 520, 135, 420, 178, 300, 177], ['C', 210, 176, 140, 155, 89, 127], ['Z']],
  left: [['M', 2, 107], ['C', 60, 150, 200, 240, 256, 271], ['C', 300, 300, 312, 350, 306, 400], ['L', 354, 542], ['Z']],
  right: [['M', 609, 27], ['L', 736, 160], ['L', 378, 550], ['L', 364, 402], ['C', 410, 330, 470, 250, 520, 202], ['C', 560, 170, 620, 155, 678, 170], ['Z']],
} satisfies Record<string, Cmd[]>;

// Lighter folds that give the ribbon its turn.
export const markFolds = {
  top: [['M', 600, 93], ['C', 520, 135, 420, 178, 300, 177], ['C', 210, 176, 140, 155, 89, 127], ['C', 190, 98, 420, 82, 600, 93], ['Z']],
  left: [['M', 2, 107], ['C', 60, 150, 200, 240, 256, 271], ['C', 300, 300, 312, 350, 306, 400], ['L', 354, 542], ['C', 318, 440, 268, 330, 2, 107], ['Z']],
  right: [['M', 364, 402], ['C', 410, 330, 470, 250, 520, 202], ['C', 560, 170, 620, 155, 678, 170], ['L', 736, 160], ['C', 616, 196, 498, 262, 364, 402], ['Z']],
  flap: [['M', 609, 27], ['L', 736, 160], ['L', 678, 170], ['Z']],
} satisfies Record<string, Cmd[]>;

export const toPath = (cmds: Cmd[]) =>
  cmds
    .map((c) => (c[0] === 'Z' ? 'Z' : `${c[0]}${c.slice(1).join(' ')}`))
    .join(' ');
