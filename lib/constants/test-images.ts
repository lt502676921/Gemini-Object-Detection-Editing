export enum Source {
  INCUNABLE = "https://tile.loc.gov/image-services/iiif/service:rbc:rbc0001:2014:2014rosen0487:0165/full/pct:25/0/default.jpg",
  ENGRAVINGS = "https://tile.loc.gov/image-services/iiif/service:gdc:gdcscd:00:34:07:66:92:1:00340766921:0121/full/pct:50/0/default.jpg",
  MUSEUM_GUIDEBOOK = "https://tile.loc.gov/image-services/iiif/service:rbc:rbc0001:2014:2014gen34181:0033/full/pct:75/0/default.jpg",
  DENVER_ILLUSTRATED = "https://tile.loc.gov/image-services/iiif/service:gdc:gdclccn:rc:01:00:04:94:rc01000494:0051/full/pct:50/0/default.jpg",
  PHYSICS_TEXTBOOK = "https://tile.loc.gov/image-services/iiif/service:gdc:gdcscd:00:03:64:87:31:8:00036487318:0103/full/pct:50/0/default.jpg",
  PORTRAIT_MINIATURES = "https://tile.loc.gov/image-services/iiif/service:rbc:rbc0001:2024:2024rosen013592v02:0249/full/pct:50/0/default.jpg",
  WIZARD_OF_OZ_DRAWINGS = "https://tile.loc.gov/image-services/iiif/service:rbc:rbc0001:2006:2006gen32405:0048/full/pct:25/0/default.jpg",
  PAINTINGS = "https://images.unsplash.com/photo-1714146681164-f26fed839692?h=1440",
  ALICE_DRAWING = "https://images.unsplash.com/photo-1630595011903-689853b04ee2?h=800",
  BOOK = "https://images.unsplash.com/photo-1643451533573-ee364ba6e330?h=800",
  MANUAL = "https://images.unsplash.com/photo-1623666936367-a100f62ba9b7?h=800",
  ELECTRONICS = "https://images.unsplash.com/photo-1757397584789-8b2c5bfcdbc3?h=1440",
}

export type Url = string;

export interface SourceMetadata {
  title: string;
  webpageUrl: Url;
  creditLine: string;
}

const LOC = "Library of Congress";
const LOC_RARE_BOOKS = "Library of Congress, Rare Book and Special Collections Division";
const LOC_MEETING_FRONTIERS = "Library of Congress, Meeting of Frontiers";

export const metadataBySource: Record<Source, SourceMetadata> = {
  [Source.INCUNABLE]: {
    title: "Vergaderinge der historien van Troy (1485)",
    webpageUrl: "https://www.loc.gov/resource/rbc0001.2014rosen0487/?sp=165",
    creditLine: LOC_RARE_BOOKS,
  },
  [Source.ENGRAVINGS]: {
    title: "Harper's illustrated catalogue (1847)",
    webpageUrl: "https://www.loc.gov/resource/gdcscd.00340766921/?sp=121",
    creditLine: LOC,
  },
  [Source.MUSEUM_GUIDEBOOK]: {
    title: "Barnum's American Museum illustrated (1850)",
    webpageUrl: "https://www.loc.gov/resource/rbc0001.2014gen34181/?sp=33",
    creditLine: LOC_RARE_BOOKS,
  },
  [Source.DENVER_ILLUSTRATED]: {
    title: "Denver illustrated (1893)",
    webpageUrl: "https://www.loc.gov/resource/gdclccn.rc01000494/?sp=51",
    creditLine: LOC_MEETING_FRONTIERS,
  },
  [Source.PHYSICS_TEXTBOOK]: {
    title: "Lessons in physics (1916)",
    webpageUrl: "https://www.loc.gov/resource/gdcscd.00036487318/?sp=103",
    creditLine: LOC,
  },
  [Source.PORTRAIT_MINIATURES]: {
    title: "The history of portrait miniatures (1904)",
    webpageUrl: "https://www.loc.gov/resource/rbc0001.2024rosen013592v02/?sp=249",
    creditLine: LOC_RARE_BOOKS,
  },
  [Source.WIZARD_OF_OZ_DRAWINGS]: {
    title: "The wonderful Wizard of Oz (1899)",
    webpageUrl: "https://www.loc.gov/resource/rbc0001.2006gen32405/?sp=48",
    creditLine: LOC_RARE_BOOKS,
  },
  [Source.PAINTINGS]: {
    title: "Open book showing paintings by Vincent van Gogh",
    webpageUrl: "https://unsplash.com/photos/9hD7qrxICag",
    creditLine: "Photo by Trung Manh cong on Unsplash",
  },
  [Source.ALICE_DRAWING]: {
    title: "Open book showing an illustration and text from Alice's Adventures in Wonderland",
    webpageUrl: "https://unsplash.com/photos/bewzr_Q9u2o",
    creditLine: "Photo by Brett Jordan on Unsplash",
  },
  [Source.BOOK]: {
    title: "Open book showing two botanical illustrations",
    webpageUrl: "https://unsplash.com/photos/4IDqcNj827I",
    creditLine: "Photo by Ranurte on Unsplash",
  },
  [Source.MANUAL]: {
    title: "Open user manual for vintage camera",
    webpageUrl: "https://unsplash.com/photos/aaFU96eYASk",
    creditLine: "Photo by Annie Spratt on Unsplash",
  },
  [Source.ELECTRONICS]: {
    title: "Circuit board with electronic components",
    webpageUrl: "https://unsplash.com/photos/Aqa1pHQ57pw",
    creditLine: "Photo by Albert Stoynov on Unsplash",
  },
};
