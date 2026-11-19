// Add verified records here. The sample organizations and events are fictional.
const categories = [
  { id: "academic", name: "Academic & Professional", icon: "book" },
  { id: "arts", name: "Arts & Music", icon: "music" },
  { id: "service", name: "Community Service", icon: "heart" },
  { id: "culture", name: "Cultural & Identity", icon: "people" },
  { id: "recreation", name: "Recreation & Sports", icon: "mountain" },
  { id: "intramurals", name: "Intramural Sports", icon: "ball" },
  { id: "social", name: "Social & Special Interest", icon: "spark" }
];

const organizations = [
  {
    id: "technology-collective", category: "academic", name: "Campus Technology Collective",
    description: "Build something from scratch with students who love creative problem-solving.",
    mission: "Make technology feel approachable through hands-on projects and peer mentoring.",
    about: "Members bring their own ideas to open build nights, team up on small projects, and share what they learn. Beginners can pair with a peer and work through their first project at a comfortable pace.",
    interests: ["coding", "design", "robotics", "professional development"],
    image: "assets/images/academic.jpg", featured: true, isDemo: true,
    requirements: "Open to all years and majors in this sample. No prior coding experience needed.",
    deadlineAt: "2027-02-22T17:00:00-05:00",
    contactName: "Sample role: Membership Coordinator",
    contactEmail: "tech-collective@example.org",
    meetingSchedule: "Sample schedule: Wednesdays at 6 PM", commitment: "Sample commitment: 1–2 hours weekly",
    recruitmentStatus: "Sample open recruitment", recruitment: "In this example, new members can attend any open build night."
  },
  {
    id: "acoustic-society", category: "arts", name: "Acoustic Arts Society",
    description: "Make music together, try an open mic, or help put on a campus show.",
    mission: "Create a welcoming space for student musicians, performers, and listeners.",
    about: "Students share works in progress, organize jam sessions, and take turns hosting small showcases. There are ways to participate on stage or behind the scenes.",
    interests: ["music", "guitar", "singing", "performance"],
    requirements: "The sample open mic is open to all experience levels.",
    commitment: "Sample commitment: one rehearsal or event per month.",
    image: "assets/images/arts.jpg", featured: true, isDemo: true
  },
  {
    id: "volunteer-collective", category: "service", name: "Valley Volunteer Collective",
    description: "Meet other students while lending a hand on local service projects.",
    mission: "Build lasting relationships through student-led community service.",
    about: "The group plans small volunteer outings shaped by local partners, from community garden workdays to donation drives.",
    interests: ["volunteering", "gardening", "community outreach"],
    image: "assets/images/service.jpg", featured: true, isDemo: true
  },
  {
    id: "global-table", category: "culture", name: "The Global Table",
    description: "Share stories, traditions, and food with students from different backgrounds.",
    mission: "Make room for cultural exchange and friendships across campus.",
    interests: ["international", "food", "language", "culture"],
    image: "assets/images/culture.jpg", isDemo: true
  },
  {
    id: "ridge-and-trail", category: "recreation", name: "Ridge & Trail Club",
    description: "Find hiking partners and explore the Shenandoah Valley at your own pace.",
    mission: "Connect students through beginner-friendly outdoor adventures.",
    interests: ["hiking", "outdoors", "camping", "nature"],
    image: "assets/images/recreation.jpg", isDemo: true
  },
  {
    id: "rec-volleyball", category: "intramurals", name: "Intramural Volleyball Preview",
    description: "Explore what a recreational volleyball opportunity can look like for students.",
    mission: "Help students find campus-based recreational competition.",
    about: "This preview illustrates an intramural opportunity. Follow the UREC listing for current sports, eligibility, and registration information.",
    interests: ["fitness", "volleyball", "teams", "league"],
    image: "assets/images/intramurals.jpg", isDemo: true,
    officialUrl: "https://www.jmu.edu/recreation/sports/intramural-sports/index.shtml",
    registrationUrl: "https://www.jmu.edu/recreation/sports/intramural-sports/how-to-sign-up.shtml",
    contactName: "UREC Intramural Sports",
    requirements: "Check the current UREC eligibility rules and league requirements before registering.",
    commitment: "Game times vary by league and division.",
    videoId: "bxmGIjvyq-I",
    videoTitle: "UREC guide to intramurals and sport clubs",
    contactEmail: "urec-intramurals@jmu.edu",
    recruitment: "Check UREC for current sign-up information."
  },
  {
    id: "story-circle", category: "social", name: "Campus Story Circle",
    description: "Bring a book, a draft, or a favorite story to a casual creative meetup.",
    mission: "Help students meet through reading, writing, and conversation.",
    interests: ["books", "reading", "writing", "storytelling"],
    image: "assets/images/culture.jpg", isDemo: true
  }
];

// Store ISO 8601 timestamps with the offset in effect at the event location.
// Eastern time is -05:00 in standard time and -04:00 in daylight time.
const events = [
  {
    id: "acoustic-open-mic", organizationId: "acoustic-society",
    title: "Acoustic Open Mic", startsAt: "2027-02-18T19:00:00-05:00",
    description: "Drop in to listen or bring a short piece to perform.",
    eventType: "Open Event", isDemo: true
  },
  {
    id: "tech-build-night", organizationId: "technology-collective",
    title: "Open Build Night", startsAt: "2027-02-10T18:00:00-05:00",
    description: "Meet the group and try a small technology project with a student partner.",
    location: "Sample location: Campus workshop",
    eventType: "Open Meeting", isDemo: true
  },
  {
    id: "volunteer-interest", organizationId: "volunteer-collective",
    title: "Volunteer Interest Meetup", startsAt: "2027-02-13T11:00:00-05:00",
    description: "Hear about sample service projects and see how a first volunteer shift works.",
    eventType: "Information Session", isDemo: true
  },
  {
    id: "volleyball-interest", organizationId: "rec-volleyball",
    title: "Intramural Volleyball Info Session", startsAt: "2027-03-18T17:00:00-04:00",
    description: "See how team formation and intramural sign-ups could work.",
    eventType: "Intramural Opportunity", isDemo: true
  }
];
