This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


pdf-ai-tutor/
├── .env.example
├── .env.local
├── .gitignore
├── README.md
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── assets/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── chat/
│   │   │   └── route.ts
│   │   ├── pdf/
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   └── annotate/
│   │   │       └── route.ts
│   │   └── speech/
│   │       └── route.ts
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── study/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   └── VoiceControls.tsx
│   ├── pdf/
│   │   ├── PDFViewer.tsx
│   │   ├── PDFAnnotator.tsx
│   │   └── PDFUploader.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── SplitScreen.tsx
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── pdf.ts
│   ├── ai.ts
│   └── speech.ts
├── types/
│   ├── index.ts
│   ├── auth.ts
│   ├── pdf.ts
│   └── chat.ts
├── utils/
│   ├── helpers.ts
│   └── constants.ts
└── middleware.ts