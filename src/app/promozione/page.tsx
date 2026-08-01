import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promozione - LNI Messina",
};

export default function PromozionePage() {
  return (
    <div className="w-full bg-white">
      <img
        src="/promozione/poster.jpg"
        alt="Poster promozionale LNI Messina"
        className="block h-auto w-full"
      />
    </div>
  );
}
