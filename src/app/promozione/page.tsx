import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promozione - LNI Messina",
};

export default function PromozionePage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <img
        src="/promozione/poster.jpg"
        alt="Poster promozionale LNI Messina"
        className="block max-h-full max-w-full object-contain"
      />
    </div>
  );
}
