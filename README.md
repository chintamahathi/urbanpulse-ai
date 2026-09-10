# UrbanPulse AI

You are an elite product designer and senior frontend engineer specializing in futuristic command-center interfaces, geospatial dashboards, AI products, and government/defense-grade operational systems.

Build ONLY THE FRONTEND for this project.

Do NOT build the backend, database, YOLO pipeline, OCR pipeline, authentication backend, or real AI processing yet.

Everything should use realistic MOCK DATA and local frontend state.

The frontend must be designed so real APIs can be connected later without redesigning the UI.

PRODUCT

Name:
UrbanSense AI

Tagline:
"Every Bus Sees. Every Road Learns. Every City Acts."

Purpose:
Transform public transport buses into mobile AI-powered urban sensing units that detect road problems, traffic conditions, infrastructure deficiencies, pedestrian risks and incidents, then visualize the intelligence in a centralized Smart City command center.

The design must communicate:

BUS FLEET → EDGE AI → CITY INTELLIGENCE → ACTION

DESIGN DIRECTION

I do NOT want a generic SaaS dashboard.

I want something that looks like:

futuristic Smart City command center

premium AI operations center

NASA/Palantir-style intelligence dashboard

modern urban mobility control room

cinematic but professional

extremely polished

information-dense

visually impressive during an SIH presentation

The interface should feel like a real government-grade product from 2030.

However:

DO NOT make it look like a gaming UI.

DO NOT overuse neon.

DO NOT use excessive gradients.

DO NOT create pointless animations.

DO NOT use giant glassmorphism cards everywhere.

Use sophisticated dark UI, subtle borders, restrained accent colors, excellent typography, depth, hierarchy and purposeful motion.

TECH STACK

Use:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide icons
Recharts
MapLibre GL JS or Leaflet

Use mock JSON/TypeScript data files.

Use reusable components.

Keep all mock data in a dedicated mock-data layer.

Create clear interfaces/types so backend APIs can replace mock data later.

GLOBAL VISUAL SYSTEM

Default theme:

Dark command-center interface.

Background:
Very dark charcoal/navy.

Panels:
Slightly lighter dark surfaces.

Borders:
Subtle low-contrast borders.

Typography:
Clean modern sans-serif.

Use a restrained visual hierarchy.

Color semantics:

GREEN = healthy / operational

YELLOW = warning

ORANGE = elevated

RED = critical

BLUE/CYAN = system intelligence / active AI

Do not manually specify excessive colors everywhere.

Create design tokens.

GLOBAL LAYOUT

Create a persistent application shell.

LEFT SIDEBAR:

Logo:
UrbanSense AI

Small animated status:
● CITY NETWORK ONLINE

Navigation:

Overview
Live Fleet
Edge AI
Road Intelligence
Traffic Intelligence
Safety & Incidents
Infrastructure
Analytics
Maintenance
AI Copilot

Bottom:

System Status
Settings
Demo Mode

SIDEBAR SHOULD be collapsible.

On collapse, show only icons.

TOP BAR

Create a professional command-center top bar.

Left:

Current city:
HYDERABAD URBAN NETWORK

Live status indicator.

Center:

GLOBAL SEARCH

Placeholder:
"Search buses, roads, incidents, routes..."

Right:

Live clock

Notifications

AI status:
AI SYSTEM ONLINE

User profile

PAGE 1 — COMMAND CENTER / OVERVIEW

This is the MAIN PAGE.

It should immediately impress a judge.

Layout:

TOP:
A large live intelligence header.

Example:

CITY INTELLIGENCE
LIVE URBAN SITUATIONAL AWARENESS

Under it:

"Fleet perception active across 1,248 mobile sensing units."

Then KPI strip.

Cards:

ACTIVE BUSES
1,248

AI EVENTS TODAY
2,847

CRITICAL EVENTS
27

CONGESTION HOTSPOTS
18

ROAD DEFECTS
423

SAFETY RISKS
12

Make these feel like live telemetry rather than ordinary dashboard cards.

MAIN MAP

The map should occupy most of the screen.

Use MapLibre/Leaflet.

Create a realistic city map.

Add:

bus markers
road defect markers
traffic markers
incident markers
waterlogging markers
pedestrian-risk markers
infrastructure markers

Create subtle animated bus movement.

Add a map legend.

Add map controls:

Traffic
Road Health
Incidents
Buses
Safety
Infrastructure

Add:

LIVE
1H
6H
24H
7D

time filters.

MAP VISUALIZATION

Use different marker styles for event categories.

Pothole:
small road hazard icon

Traffic:
density visualization

Incident:
alert marker

Bus:
moving vehicle marker

Pedestrian risk:
safety marker

Waterlogging:
water marker

When clicking a marker:

open a beautiful right-side intelligence drawer.

Do NOT navigate away.

RIGHT INTELLIGENCE PANEL

When no event is selected:

show:

LIVE INTELLIGENCE FEED

Example:

● 12:42:08
BUS-104 detected pothole

● 12:41:53
Traffic density increased at Jubilee Junction

● 12:40:21
BUS-205 confirmed existing road defect

● 12:38:11
Pedestrian risk elevated near school zone

Each event should have:

severity
time
location
bus
confidence

Clicking opens details.

PAGE 2 — LIVE FLEET

Create a beautiful fleet operations page.

Header:

LIVE FLEET
1,248 / 1,300 BUSES ONLINE

Left:
Interactive map with buses.

Right:
Fleet statistics.

Cards:

ONLINE
1,248

OFFLINE
52

AI PROCESSING
1,201

CAMERA ISSUES
7

Below:

BUS TABLE

Columns:

Bus ID
Route
Location
Speed
AI Status
Camera Status
Events
Last Seen

Example:

BUS-104
Route 216
Banjara Hills
32 km/h
AI ONLINE
4 CAMERAS
3 EVENTS
2 sec ago

Use animated status indicators.

Clicking a bus opens a detailed bus drawer.

BUS DETAIL DRAWER

Show:

BUS-104

Route 216

AI ONLINE

GPS ONLINE

4 / 4 CAMERAS ONLINE

Then:

FRONT CAMERA
SIDE CAMERA
REAR CAMERA
CABIN CAMERA

Show miniature camera previews using placeholder images/gradients.

Show:

Current location
Current route
Recent detections
AI confidence
Bandwidth saved

PAGE 3 — EDGE AI MONITOR

THIS PAGE SHOULD BE ONE OF THE MOST IMPRESSIVE.

Create a cinematic operational monitoring interface.

Header:

EDGE AI MONITOR

BUS-104 / FRONT CAMERA

Left:
Large video player.

Use a realistic road-video placeholder or local placeholder asset.

Overlay fake AI bounding boxes around:

cars
motorcycles
pedestrians
potholes

Make boxes animate subtly.

Show:

CAR 12
MOTORCYCLE 04
PEDESTRIAN 08
POTHOLE 01

Right:

AI PROCESSING

MODEL
YOLO EDGE

INFERENCE
ACTIVE

FPS
31

LATENCY
28ms

DETECTIONS
17

Then detection list:

POTHOLE
94%
HIGH

VEHICLES
27
HIGH DENSITY

PEDESTRIANS
8

WATERLOGGING
NOT DETECTED

Then:

CURRENT LOCATION
17.3850
78.4867

BANDWIDTH

97% SAVED

RAW VIDEO
NOT TRANSMITTED

At the bottom:

"PROCESS LOCALLY. TRANSMIT INTELLIGENTLY."

Add an animated processing indicator.

PAGE 4 — ROAD INTELLIGENCE

Create:

ROAD INTELLIGENCE

Main visualization:

Large road health map.

Show roads with health status.

Each road:

HEALTH 91
HEALTH 68
HEALTH 42
HEALTH 21

Click road.

Open road detail.

ROAD DETAIL

Example:

SCHOOL ROAD

ROAD HEALTH
31 / 100

CRITICAL

Then:

Potholes
12

Cracks
8

Waterlogging
3

Infrastructure issues
4

Near misses
7

Traffic load
HIGH

Then create a timeline:

JAN
FEB
MAR
APR
MAY
JUN
JUL
AUG
SEP

Show deterioration visually.

Section:

WHY IS THIS ROAD CRITICAL?

Potholes
-31

Repeated detections
-18

Traffic load
-12

Pedestrian risk
-8

Incidents
-10

Make the score understandable.

PAGE 5 — TRAFFIC INTELLIGENCE

Header:

TRAFFIC INTELLIGENCE

Large congestion map.

Heatmap.

Metrics:

VEHICLES DETECTED
2.4M

CURRENT DENSITY
HIGH

AVG NETWORK SPEED
31 km/h

CONGESTION HOTSPOTS
18

Then:

TOP CONGESTED AREAS

Jubilee Junction
CRITICAL
+24 min

School Road
HIGH
+18 min

Market Road
HIGH
+14 min

Create charts:

Traffic by hour

Vehicle composition

Congestion trend

Create a "PREDICTION" panel:

CONGESTION FORECAST

Jubilee Junction

72% probability of severe congestion

in next 20 minutes

Factors:

High vehicle density

Slow average speed

Repeated congestion pattern

PAGE 6 — SAFETY & INCIDENTS

Create an incident command-center page.

Top metrics:

ACTIVE INCIDENTS
7

NEAR MISSES
42

HIGH-RISK ZONES
12

ANPR MATCHES
19

Main layout:

LEFT:
Incident map

RIGHT:
LIVE INCIDENT FEED

Example:

CRITICAL
HIT & RUN
2 min ago

HIGH
NEAR MISS
5 min ago

MEDIUM
RASH DRIVING
8 min ago

Click incident.

Open detailed incident drawer.

INCIDENT DETAIL

Show:

HIT & RUN

INCIDENT ID
INC-2941

TIME
08:43:21

LOCATION
Junction X

VEHICLE
White Sedan

REGISTRATION
TS XX XX 1234

OCR CONFIDENCE
93%

AI MATCH
91%

DIRECTION
NORTH EAST

Then:

EVIDENCE FRAME

Use a realistic placeholder image.

Then:

VEHICLE TRACK

Show trajectory on mini-map.

Then:

OTHER BUS OBSERVATIONS

BUS-101
08:43

BUS-117
08:44

BUS-203
08:46

This should visually communicate cross-bus intelligence.

PAGE 7 — INFRASTRUCTURE

Create:

INFRASTRUCTURE INTELLIGENCE

Show:

MISSING SIGNS
43

DAMAGED DIVIDERS
27

MISSING ZEBRA CROSSINGS
18

WATERLOGGING ZONES
12

Then a map.

Below:

INFRASTRUCTURE DEFICIENCY LIST

Example:

School Road
Missing Zebra Crossing
CRITICAL

Market Road
Damaged Sign
HIGH

Main Road
Missing Divider
HIGH

Each item should show:

detected
expected
risk
recommendation

PAGE 8 — FLEET EVENT FUSION

THIS PAGE SHOULD BE A UNIQUE WOW FEATURE.

Title:

FLEET EVENT FUSION

Subtitle:

"Independent observations. One verified urban truth."

Create a visualization:

BUS-101
↓
POTHOLE DETECTED
↓
BUS-205
↓
SAME LOCATION
↓
BUS-317
↓
SAME EVENT
↓
VERIFIED ROAD DEFECT

Animate the flow.

Then show:

PTH-1024

VERIFIED ROAD DEFECT

37 OBSERVATIONS

11 BUSES

CONFIDENCE
99.1%

SEVERITY
HIGH

FIRST OBSERVED
JAN 12

LAST CONFIRMED
SEP 10

Then show the individual observations on a map.

This page must make the project's unique fleet-level intelligence immediately understandable.

PAGE 9 — ANALYTICS

Create an executive analytics dashboard.

Sections:

ROAD HEALTH TREND

TRAFFIC TREND

INCIDENT TREND

BUS DELAY TREND

INFRASTRUCTURE DEFICIENCIES

PEDESTRIAN RISK

Create beautiful Recharts visualizations.

Also create:

ORIGIN → DESTINATION MATRIX

Example:

AREA A → AREA D
18,200

AREA B → AREA C
12,400

AREA A → AREA F
9,800

Clearly label as:

DEMO DATA

PAGE 10 — MAINTENANCE COMMAND CENTER

This should look like an operations prioritization system.

Header:

MAINTENANCE PRIORITY

"AI-ranked interventions based on severity, recurrence, traffic and safety."

Show:

PRIORITY #1

SCHOOL ROAD

CRITICAL

Pothole + missing zebra crossing

Traffic:
HIGH

Pedestrian Risk:
VERY HIGH

Recurrence:
37 observations

Nearby:
School

Recommendation:

IMMEDIATE REPAIR

Then:

PRIORITY #2
PRIORITY #3
PRIORITY #4

Use ranking.

Add filters:

All
Roads
Signs
Dividers
Waterlogging

Add action buttons:

Assign
Acknowledge
Mark In Progress
Resolve

For frontend demo, these should update local state.

PAGE 11 — AI URBAN COPILOT

Make this feel extremely premium.

Header:

URBANSENSE COPILOT

Subtitle:

"Ask the city."

Full-screen chat workspace.

Left:
Conversation.

Right:
CITY CONTEXT PANEL.

Example questions as clickable chips:

"Which roads need urgent repair?"

"Why is Route 216 delayed?"

"Show critical pedestrian zones."

"Which potholes were repeatedly detected?"

"Where is congestion increasing?"

"Which infrastructure problems are near schools?"

When clicked, show a realistic AI response.

Example:

USER:
Which roads need urgent repair?

AI:

"5 road segments currently require urgent intervention.

School Road is the highest priority because it has 37 independent observations, high traffic density, repeated pedestrian-risk events and a missing zebra crossing.

Recommended action:
Immediate road repair + zebra crossing restoration."

Then show supporting cards:

Road Health
31/100

Observations
37

Risk
Critical

Add "View on map" button.

Do NOT connect to a real LLM yet.

Use mocked conversational responses.

PAGE 12 — DEMO MODE

Create a dedicated Demo Mode.

This is extremely important for SIH.

Button:

▶ RUN LIVE DEMO

When activated, show a cinematic sequence.

STEP 1
BUS-104 ONLINE

STEP 2
FRONT CAMERA PROCESSING

STEP 3
POTHOLE DETECTED
94%

STEP 4
GPS ATTACHED

STEP 5
EVENT TRANSMITTED

STEP 6
BUS-205 DETECTS SAME LOCATION

STEP 7
FLEET FUSION

STEP 8
EVENT VERIFIED
99.1%

STEP 9
ROAD HEALTH
68 → 31

STEP 10
MAINTENANCE PRIORITY
CRITICAL

STEP 11
AI RECOMMENDATION GENERATED

STEP 12
AUTHORITY ACTION

Create a timeline/progress visualization.

Allow:

PLAY
PAUSE
RESTART

The dashboard, map and metrics should update during the demo.

GLOBAL EVENT DRAWER

Every event throughout the application should open the same reusable EventDrawer component.

Fields:

Event ID
Type
Severity
Confidence
Bus ID
Camera
GPS
Timestamp
Evidence
Observations
Other buses
History
Recommendation
Status

Status options:

DETECTED
VERIFIED
ASSIGNED
IN PROGRESS
RESOLVED

Status changes should work using local state.

NOTIFICATIONS

Create a notification center.

Examples:

"New critical pothole detected."

"BUS-205 confirmed PTH-1024."

"Pedestrian risk increased near School Road."

"Route 216 delay exceeded 15 minutes."

"Waterlogging detected."

Make notifications interactive.

SEARCH

Implement frontend search.

Search across:

Buses
Roads
Events
Routes
Incidents

Show instant results.

MAP EXPERIENCE

Make the map one of the strongest parts of the application.

Add:

zoom controls
layer controls
event filters
heatmap toggle
bus tracking
road health toggle
traffic toggle
incident toggle

When clicking an object, show contextual information.

Use realistic Hyderabad-like coordinates for demo visualization.

Clearly label data as DEMO DATA.

MICROINTERACTIONS

Use subtle animations:

marker pulses for critical events

live counters

status transitions

drawer transitions

chart animations

map event appearance

AI processing indicators

fleet activity

command-center feed updates

Keep animations fast and professional.

Do NOT overanimate the interface.

RESPONSIVENESS

Desktop-first because this is a command center.

Also support:

tablet
smaller laptop

Mobile can be simplified but should not break.

COMPONENT ARCHITECTURE

Create reusable components:

AppShell
Sidebar
TopBar
KpiCard
LiveMap
MapLegend
EventMarker
EventDrawer
FleetTable
BusCard
BusDetailDrawer
DetectionOverlay
CameraPanel
TelemetryPanel
RoadHealthCard
RoadTimeline
TrafficChart
Heatmap
IncidentCard
IncidentDrawer
InfrastructureCard
MaintenancePriorityCard
CopilotChat
CopilotInsight
DemoModeOverlay
NotificationCenter

MOCK DATA

Create realistic mock datasets.

Buses:
at least 20

Routes:
at least 10

Roads:
at least 15

Events:
at least 50

Incidents:
at least 10

Infrastructure issues:
at least 20

Traffic observations:
multiple time periods

Pedestrian risk zones:
at least 10

Historical road observations:
multiple months

Use realistic but fictional data.

Never imply the data is actual government data.

IMPORTANT: MAKE IT FEEL ALIVE

The dashboard should not feel like static mockups.

Implement a lightweight simulated live-data engine.

Every few seconds:

a bus position changes

an event appears

a KPI changes slightly

feed receives an event

map marker updates

traffic status changes

Provide:

LIVE / PAUSED

toggle.

When paused, data stops changing.

DESIGN QUALITY BAR

The final result must feel like a product that could be shown to:

Smart City officials

transport authorities

SIH judges

investors

government technology teams

The first 10 seconds of opening the dashboard should communicate:

"THIS IS A CITY-SCALE AI INTELLIGENCE PLATFORM."

Not:

"THIS IS A STUDENT ADMIN DASHBOARD."

CRITICAL FRONTEND RULES

FRONTEND ONLY.

No backend.

No database.

No authentication backend.

No real API calls.

No YOLO implementation yet.

No OCR implementation yet.

Use mock data.

Keep API interfaces abstracted for future integration.

Every page must actually work and be navigable.

Buttons should perform meaningful frontend actions.

Avoid dead buttons.

Do not create fake functionality that looks broken.

Do not overuse placeholder text.

Do not create unnecessary pages.

Keep the UI coherent across every screen.

Use consistent typography, spacing and components.

Use realistic demo data.

Clearly identify demo/simulated data.

Make the map and Edge AI Monitor the visual highlights.

FINAL SIH PRESENTATION EXPERIENCE

When the app opens:

Dashboard shows live city intelligence.

Judge sees buses moving on the map.

Critical road events appear.

Click a pothole.

Event drawer opens.

Show that multiple buses observed it.

Open Fleet Event Fusion.

Show observations converging into one verified defect.

Open Road Intelligence.

Show road health deterioration.

Open Maintenance.

Show AI-ranked repair priority.

Open AI Copilot.

Ask:
"Which road needs immediate attention?"

AI explains the decision.

Run Demo Mode.

Show the complete bus → AI → event → fusion → city action workflow.

The entire frontend should feel like one connected intelligent system, NOT a collection of unrelated dashboard pages.

Build it now.

First create the complete frontend structure and routing.

Then implement the global design system.

Then build the Dashboard and GIS map.

Then Live Fleet.

Then Edge AI Monitor.

Then Road Intelligence.

Then Traffic.

Then Safety.

Then Infrastructure.

Then Fleet Event Fusion.

Then Analytics.

Then Maintenance.

Then AI Copilot.

Then Demo Mode.

Finally polish every page, add responsive behavior, transitions, mock live updates, empty/loading/error states and ensure there are no broken routes or dead interactions.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/85e3dbfd-02aa-40ba-9445-786a15855835).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
