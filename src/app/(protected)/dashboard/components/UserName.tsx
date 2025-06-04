"use client";

import { TextShimmer } from "@/components/ui/text-shimmer";

export default function UserName({ name }: { name: string }) {
  return (
    <TextShimmer
      duration={1.5}
      className='text-xl font-medium [--base-color:theme(colors.slate.600)] [--base-gradient-color:theme(colors.slate.200)] dark:[--base-color:theme(colors.slate.700)] dark:[--base-gradient-color:theme(colors.slate.400)]'
    >
      {name}
    </TextShimmer>
  );
}
