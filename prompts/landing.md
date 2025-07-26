You are a senior front-end engineer and creative UI/UX designer.

Build a **modern, beautiful, performant landing page** using:

- **Next.js 15 (App Router)**
- **Tailwind CSS**
- **shadcn/ui** component library
- **Framer Motion** for smooth UI animations

🎯 **Main goal**: visually appealing landing page with strong aesthetic variation using **multiple shades and styles of blue**.

📐 **Page sections** (responsive, semantic):
1. Hero section with headline, subtext, and CTA
2. Feature grid (3 to 6 features, icons optional)
3. Testimonials or brand logos section
4. Email capture / newsletter form (with shadcn `Input` and `Button`)
5. Footer with navigation + social links

🎨 **Design goals**:
- Use **3+ different blue styles** across the page (e.g. light blue gradients, frosted glass indigo card, navy footer)
- Make it **visually segmented** but cohesive
- Use shadcn components where appropriate (`Card`, `Button`, `Input`, `Avatar`, etc.)
- Apply **soft shadows, large rounded corners**, modern UI spacing

🧩 **Technical constraints**:
- Use **shadcn/ui** for all major UI blocks
- Style with **Tailwind classes** only
- Add light motion effects with **Framer Motion**
- Ensure **accessibility**: semantic HTML, keyboard nav, color contrast
- No external CMS — hardcoded content is fine

📁 **Expected output**:
- `/app/page.tsx` — full landing page layout
- `/components/*` — reusable shadcn-based components
- Tailwind config (if extended)
- Any needed layout or wrapper components