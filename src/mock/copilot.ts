import type { CopilotAnswer } from "@/lib/types";

export const copilotSuggestions = [
  "Which roads need urgent repair?",
  "Why is Route 216 delayed?",
  "Show critical pedestrian zones.",
  "Which potholes were repeatedly detected?",
  "Where is congestion increasing?",
  "Which infrastructure problems are near schools?",
];

export const copilotAnswers: CopilotAnswer[] = [
  {
    question: "Which roads need urgent repair?",
    answer:
      "5 road segments currently require urgent intervention.\n\nSchool Road is the highest priority because it has 37 independent observations from 11 different buses, high traffic density, repeated pedestrian-risk events and a missing zebra crossing.\n\nRecommended action: immediate road repair + zebra crossing restoration.",
    cards: [
      { label: "Road health", value: "31/100", tone: "critical" },
      { label: "Observations", value: "37", tone: "intel" },
      { label: "Risk", value: "Critical", tone: "critical" },
      { label: "Buses reporting", value: "11", tone: "intel" },
    ],
    focusRoadId: "RD-1000",
  },
  {
    question: "Why is Route 216 delayed?",
    answer:
      "Route 216 is running 18 minutes behind schedule.\n\n74% of the delay accumulates between Jubilee Junction and Market Road, where average speed has dropped to 11 km/h. Fleet perception also reports a pothole cluster forcing lane changes near School Road, adding an estimated 4 minutes per pass.\n\nRecommended action: temporary signal retiming at Jubilee Junction and surface repair on School Road.",
    cards: [
      { label: "Current delay", value: "+18 min", tone: "high" },
      { label: "Bottleneck", value: "Jubilee Junction", tone: "intel" },
      { label: "Avg speed", value: "11 km/h", tone: "critical" },
      { label: "Affected trips", value: "62 today", tone: "intel" },
    ],
    focusRoadId: "RD-1001",
  },
  {
    question: "Show critical pedestrian zones.",
    answer:
      "12 pedestrian risk zones are active; 4 are critical.\n\nThe School Road zone leads with 7 near-miss events in the last hour, a missing zebra crossing and a school gate 40 m from the conflict point. Old Mint Road and Kukatpally Industrial Road follow.\n\nRecommended action: crossing restoration and speed calming at the four critical zones.",
    cards: [
      { label: "Critical zones", value: "4", tone: "critical" },
      { label: "Near misses (1h)", value: "7", tone: "high" },
      { label: "Zones tracked", value: "12", tone: "intel" },
    ],
    focusRoadId: "RD-1000",
  },
  {
    question: "Which potholes were repeatedly detected?",
    answer:
      "9 pothole clusters have 10 or more independent observations.\n\nPTH-1024 on School Road is the strongest signal: 37 observations from 11 buses between JAN 12 and SEP 10, fused into a single verified defect at 99.1% confidence.\n\nRecommended action: treat PTH-1024 as a verified works item, not a fresh detection.",
    cards: [
      { label: "Verified clusters", value: "9", tone: "high" },
      { label: "Top cluster", value: "PTH-1024", tone: "intel" },
      { label: "Confidence", value: "99.1%", tone: "ok" },
    ],
    focusRoadId: "RD-1000",
  },
  {
    question: "Where is congestion increasing?",
    answer:
      "Congestion is worsening on 6 corridors week over week.\n\nJubilee Junction shows a 72% probability of severe congestion within the next 20 minutes, driven by density index 96, falling average speed and a repeated pattern on 12 of the last 14 days. Market Road and Ameerpet are trending in the same direction.\n\nRecommended action: pre-emptive signal intervention at Jubilee Junction.",
    cards: [
      { label: "Forecast risk", value: "72%", tone: "high" },
      { label: "Hotspots", value: "18", tone: "intel" },
      { label: "Network speed", value: "31 km/h", tone: "medium" },
    ],
    focusRoadId: "RD-1001",
  },
  {
    question: "Which infrastructure problems are near schools?",
    answer:
      "6 infrastructure deficiencies sit within 200 m of a school.\n\nThe most severe is the missing zebra crossing on School Road, where fleet cameras observed children crossing mid-block in mixed traffic 22 times this month. Two faded-marking sites and one damaged divider are also within school catchments.\n\nRecommended action: prioritise School Road crossing restoration this week.",
    cards: [
      { label: "Near schools", value: "6", tone: "critical" },
      { label: "Mid-block crossings", value: "22", tone: "high" },
      { label: "Top site", value: "School Road", tone: "intel" },
    ],
    focusRoadId: "RD-1000",
  },
];

export const fallbackAnswer: CopilotAnswer = {
  question: "",
  answer:
    "I can reason over fleet perception, road health, traffic, safety and infrastructure layers for this demo city.\n\nTry asking about urgent repairs, route delays, pedestrian zones, repeated pothole detections, congestion trends, or infrastructure near schools. Responses in this build are simulated on demo data.",
  cards: [
    { label: "Data mode", value: "DEMO", tone: "intel" },
    { label: "Layers", value: "6", tone: "intel" },
    { label: "Events indexed", value: "2,847", tone: "intel" },
  ],
};

export const cityContext = [
  { label: "Fleet online", value: "1,248 / 1,300" },
  { label: "AI events today", value: "2,847" },
  { label: "Critical events", value: "27" },
  { label: "Network road health", value: "54 / 100" },
  { label: "Congestion hotspots", value: "18" },
  { label: "Verified defect clusters", value: "9" },
  { label: "Active incidents", value: "7" },
  { label: "Pedestrian zones", value: "12" },
];
