import hospitalityImage from "../assets/data/supporting images/A diverse group of professionals collaborating around a conference table, symbolizing the teamwork at Gemini Hospitality Consultants.png";
import jazzImage from "../assets/data/supporting images/A lively jazz band performing on stage in a cozy Philadelphia jazz club, capturing the essence of the Philadelphia Jazz Experience.png";
import veggieImage from "../assets/data/supporting images/Close-up of fresh microgreens being artfully plated by a chef in a modern kitchen, representing Veggie Graffiti's offerings.png";
import feedPhillyImage from "../assets/data/supporting images/Volunteers serving meals to diverse community members at an outdoor event, symbolizing the efforts of the Feed Philly Coalition, no person face visible.png";
import creativeImage from "../assets/data/business_logo/harry_hayman_creative.png";
import hungryImage from "../assets/data/business_logo/i_am_hungry.jpg";
import threeHeartsImage from "../assets/data/business_logo/another_three_hearts_experience.png";
import travelsImage from "../assets/data/business_logo/harry_hayman_travels.jpg";

/*
 * `sector` is a two or three word summary of the description directly below
 * it, used as a label in the ventures showcase. `kind` tells the card which
 * treatment to use: "photo" ventures get the brand duotone, "logo" ventures
 * get a neutral tile so their own brand colours are not fighting the ramp.
 */
export interface Venture {
  title: string;
  sector: string;
  description: string;
  image: ImageMetadata;
  kind: "photo" | "logo";
  website: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  twitter: string;
}

export const ventures: Venture[] = [
  {
    title: "Gemini Hospitality Consultants",
    sector: "Hospitality consulting",
    description: "Strategic consulting services for restaurants and hospitality businesses, focusing on innovative solutions and sustainable growth.",
    image: hospitalityImage,
    kind: "photo",
    website: "https://harryhaymangemini.com/",
    linkedin: "https://www.linkedin.com/company/gemini-hospitality-consultants",
    instagram: "https://www.instagram.com/geminihospitalityconsulting/",
    facebook: "https://www.facebook.com/geminiconsultants",
    twitter: "https://twitter.com/geminihospitality"
  },
  {
    title: "Philadelphia Jazz Experience",
    sector: "Music and heritage",
    description: "Preserving and promoting Philadelphia's rich jazz heritage through education, performance, and community engagement.",
    image: jazzImage,
    kind: "photo",
    website: "https://philadelphiajazzexperience.org",
    linkedin: "https://www.linkedin.com/company/philadelphia-jazz-experience",
    instagram: "https://instagram.com/phillyjazzexp",
    facebook: "https://facebook.com/philadelphiajazzexperience",
    twitter: "https://twitter.com/phillyjazzexp"
  },
  {
    title: "Veggie Graffiti",
    sector: "Urban agriculture",
    description: "Urban farming initiative combining hydroponic technology with sustainable practices to provide fresh, local produce.",
    image: veggieImage,
    kind: "photo",
    website: "https://veggiegraffiti.com",
    linkedin: "https://www.linkedin.com/company/veggie-graffiti",
    instagram: "https://instagram.com/veggiegraffiti",
    facebook: "https://facebook.com/veggiegraffiti",
    twitter: "https://twitter.com/veggiegraffiti"
  },
  {
    title: "Feed Philly Coalition",
    sector: "Food security",
    description: "Community initiative addressing food insecurity through partnerships with local restaurants and organizations.",
    image: feedPhillyImage,
    kind: "photo",
    website: "https://feedphillycoalition.org",
    linkedin: "https://www.linkedin.com/company/feed-philly-coalition",
    instagram: "https://www.instagram.com/feed.philly/",
    facebook: "https://facebook.com/feedphillycoalition",
    twitter: "https://twitter.com/feedphilly"
  },
  {
    title: "Harry Hayman Creative",
    sector: "Branding and marketing",
    description: "A creative agency specializing in branding, marketing, and digital solutions for hospitality and lifestyle businesses.",
    image: creativeImage,
    kind: "logo",
    website: "https://harryhaymancreative.com/",
    linkedin: "https://www.linkedin.com/company/harryhaymancreative",
    instagram: "https://www.instagram.com/harryhaymancreative/",
    facebook: "https://www.facebook.com/people/Harry-Hayman-Creative/61565756009303/",
    twitter: "https://twitter.com/harryhaymancreative"
  },
  {
    title: "I Am Hungry in Philly",
    sector: "Community resources",
    description: "An initiative connecting Philadelphia's hungry with local food resources and support services.",
    image: hungryImage,
    kind: "logo",
    website: "https://iamhungryinphilly.org",
    linkedin: "https://www.linkedin.com/company/i-am-hungry-in-philly",
    instagram: "https://instagram.com/iamhungryinphilly",
    facebook: "https://facebook.com/iamhungryinphilly",
    twitter: "https://twitter.com/iamhungryinphilly"
  },
  {
    title: "Another Three Hearts Experience",
    sector: "Hospitality experiences",
    description: "Creating unique hospitality experiences that combine culinary excellence with cultural enrichment.",
    image: threeHeartsImage,
    kind: "logo",
    website: "https://another3heartsexperience.com/",
    linkedin: "https://www.linkedin.com/company/another-3-hearts-experience",
    instagram: "https://www.instagram.com/another3hearts/",
    facebook: "https://www.facebook.com/people/Another-3-Hearts-Experience/61566827497170/",
    twitter: "https://twitter.com/another3hearts"
  },
  {
    title: "Harry Hayman Travels",
    sector: "Travel and culture",
    description: "Sharing culinary and cultural experiences from travels around the world, inspiring innovation in hospitality.",
    image: travelsImage,
    kind: "logo",
    website: "https://harryhayman.com",
    linkedin: "https://www.linkedin.com/in/harrisongrahamhaymaniv/",
    instagram: "https://instagram.com/harryhayman",
    facebook: "https://facebook.com/harryhayman",
    twitter: "https://twitter.com/harryhayman"
  }
];
