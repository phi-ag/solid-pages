const adjectives = [
  "Xylographic",
  "Variable",
  "Known",
  "Vulgar",
  "Zesty",
  "Jealous",
  "Yearly",
  "Befitting",
  "Vast",
  "Ajar",
  "Likely",
  "Anxious",
  "Lighthearted",
  "Quintessential",
  "Hellish",
  "Quarrelsome",
  "Warlike",
  "Half",
  "Cheerful",
  "Yawning",
  "Lanky",
  "Official",
  "Which",
  "Bad",
  "Flimsy",
  "Xerographic",
  "Regular",
  "Overjoyed",
  "Extra-large",
  "Knotty",
  "Careful",
  "Juvenile",
  "Wilted",
  "Jumbo",
  "Ringed",
  "Rigid",
  "Blushing",
  "Well-documented",
  "Grave",
  "Joint",
  "Apathetic",
  "Outgoing",
  "White",
  "Violet",
  "Alarming",
  "Jovial",
  "Other",
  "Responsible",
  "Complicated",
  "Resonant",
  "Uncovered",
  "Valid",
  "Frightening",
  "Quixotic",
  "Messy",
  "Frizzy",
  "Zigzag",
  "Defeated",
  "Jobless",
  "Endurable",
  "Hateful",
  "Young",
  "Moist",
  "Exhausted",
  "Childlike",
  "Right",
  "Luxurious",
  "Vivid",
  "Conscious",
  "Original",
  "Frizzy",
  "Thundering",
  "Doubtful",
  "Blue",
  "Squeamish",
  "Mysterious",
  "Growling",
  "Xyloid",
  "Elliptical",
  "Disagreeable",
  "Enraged",
  "Recent",
  "Magnificent",
  "Xylographic",
  "Damaging",
  "Informal",
  "Quiet",
  "Nosy",
  "Zany",
  "Questionable",
  "Dead",
  "Cloistered",
  "Nonstop",
  "Zigzag",
  "Shabby",
  "Incompatible",
  "Loud",
  "Understood",
  "Kooky",
  "Anxious"
];

const animals = [
  "Quelea",
  "Laika",
  "Alligator",
  "Jacana",
  "Cardinal",
  "Barbel",
  "Glassfish",
  "Taruca",
  "Zander",
  "Pika",
  "Crane",
  "Firesalamander",
  "Firebelliedtoad",
  "Zenaida",
  "Yellowhammer",
  "Rhinoceros",
  "Jaguar",
  "Velociraptor",
  "Ape",
  "Tench",
  "Oriole",
  "Jay",
  "Pondskater",
  "Billygoat",
  "Neonblue-guppy",
  "Polyturator",
  "Galah",
  "Fisheagle",
  "Dassie",
  "Blacklab",
  "Frogmouth",
  "Xenops",
  "Urus",
  "Hylaeosaurus",
  "Jackal",
  "Limpet",
  "Izuthrush",
  "Armyworm",
  "Ostracod",
  "Zander",
  "Sunbear",
  "Cattle",
  "Rook",
  "Xraytetra",
  "Thrasher",
  "Drongo",
  "Raptors",
  "Emeraldtreeskink",
  "Zebradove",
  "Utility",
  "Keeping",
  "Hybridization",
  "Yoyo",
  "Karen",
  "Kiddie",
  "Steamboat",
  "Toreador",
  "Yogurt",
  "Zodiac",
  "Tunic",
  "Naivety",
  "Jimmy",
  "Purpose",
  "Kimberwick",
  "Vial",
  "Bride",
  "Eraser",
  "Interest",
  "Dust",
  "Urine",
  "Distinction",
  "Misadventure",
  "Earring",
  "Forgiveness",
  "India",
  "Yew",
  "Revenge",
  "Vent",
  "Gazelle",
  "Bracket",
  "Godsend",
  "Filming",
  "X-ray",
  "Shawl",
  "X-ray",
  "Diagonal",
  "Quadra",
  "Loop",
  "Prism",
  "Quantum",
  "Zoom",
  "Strudel",
  "Hiccups",
  "Veggie",
  "Doubt",
  "Time-frames",
  "Titer",
  "Tone",
  "Mankind"
];

const pick = (array: string[]): string => array[Math.floor(Math.random() * array.length)];

export const randomName = () => `${pick(adjectives)} ${pick(animals)}`;
