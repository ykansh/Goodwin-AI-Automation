import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "About Goodwin Batteries — Manufacturing Excellence, Quality & Pan-India Network | Goodwin Batteries",
  description:
    "Learn about Goodwin Batteries: BIS-certified battery manufacturing, 99.99% pure virgin lead grid metallurgy, automated testing laboratories, and nationwide dealer & service network across India.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

