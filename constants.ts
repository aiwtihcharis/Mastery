import { Phase } from './types';

export const CURRICULUM: Phase[] = [
  {
    id: 1,
    title: "The Foundation",
    subtitle: "Core Fundamentals",
    dates: "Feb 20 - Feb 22",
    focus: "Pure JS & DOM",
    days: 3,
    videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
    project: { title: "Vanilla Taskmaster", desc: "Architect a persistent To-Do engine using purely native DOM APIs." },
    tasks: [
      { id: "p1-t1", goal: "The V8 Engine", activity: "Execution Context, Call Stack, Memory Heap." },
      { id: "p1-t2", goal: "DOM Manipulation", activity: "Event Delegation, Bubbling, Shadow DOM." },
      { id: "p1-t3", goal: "Async Patterns", activity: "Event Loop, Microtasks, Promises." }
    ]
  },
  {
    id: 2,
    title: "The Architect",
    subtitle: "Modern Full-Stack",
    dates: "Feb 23 - Mar 4",
    focus: "Next.js 15 & Server Actions",
    days: 10,
    videoUrl: "https://www.youtube.com/watch?v=Zq5fmkH0T78",
    project: { title: "Digital Vault", desc: "Build a secure file storage system with Next.js 15 and Clerk Auth." },
    tasks: [
      { id: "p2-t1", goal: "App Router", activity: "Nested Layouts, Loading States, Error Boundaries." },
      { id: "p2-t2", goal: "Server Actions", activity: "Mutations without API routes." },
      { id: "p2-t3", goal: "Database Design", activity: "Prisma schema modeling." }
    ]
  },
  {
    id: 3,
    title: "The Artist",
    subtitle: "Creative Engineering",
    dates: "Mar 5 - Mar 15",
    focus: "WebGL & Animations",
    days: 11,
    videoUrl: "https://www.youtube.com/watch?v=41I0k67_t7Y",
    project: { title: "Immersive Portfolio", desc: "Craft an Awwwards-winning 3D experience using React Three Fiber." },
    tasks: [
      { id: "p3-t1", goal: "GSAP Timelines", activity: "Choreographing complex SVG animations." },
      { id: "p3-t2", goal: "3D Space", activity: "Three.js Scene graph, Cameras, Lighting." }
    ]
  },
  {
    id: 4,
    title: "The Founder",
    subtitle: "SaaS & Business",
    dates: "Mar 16 - Mar 22",
    focus: "Deployment & Scale",
    days: 7,
    videoUrl: "https://www.youtube.com/watch?v=7M0H7c-qFkE",
    project: { title: "Micro-SaaS Launch", desc: "Deploy a production-ready subscription platform with Stripe webhooks." },
    tasks: [
      { id: "p4-t1", goal: "Payments", activity: "Stripe Checkout & Portals." },
      { id: "p4-t2", goal: "Edge Logic", activity: "Middleware authentication." }
    ]
  }
];