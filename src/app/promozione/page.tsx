import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promozione - LNI Messina",
};

export default function PromozionePage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black supports-[height:100dvh]:h-[100dvh]">
      <img
        src="/promozione/poster.jpg"
        alt="Poster promozionale LNI Messina"
        className="block max-h-full max-w-full object-contain"
      />
    </div>
  );
}
