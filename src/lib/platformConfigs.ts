
export interface PlatformConfig {
  name: string;
  dimensions: {
    width: number;
    height: number;
  };
  aspectRatio: string;
  formats: string[];
}

export const platformConfigs: Record<string, PlatformConfig> = {
  youtube: {
    name: "YouTube",
    dimensions: {
      width: 1280,
      height: 720
    },
    aspectRatio: "16:9",
    formats: ["cover", "thumbnail"]
  },
  instagram: {
    name: "Instagram",
    dimensions: {
      width: 1080,
      height: 1080
    },
    aspectRatio: "1:1",
    formats: ["feed", "story"]
  },
  linkedin: {
    name: "LinkedIn",
    dimensions: {
      width: 1200,
      height: 627
    },
    aspectRatio: "1.91:1",
    formats: ["post", "cover"]
  }
};
