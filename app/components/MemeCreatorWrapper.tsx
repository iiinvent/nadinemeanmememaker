'use client';

import dynamic from 'next/dynamic';

const MemeCreator = dynamic(() => import('./MemeCreator'), {
  ssr: false
});

export default function MemeCreatorWrapper() {
  return <MemeCreator width={512} height={512} />;
}
